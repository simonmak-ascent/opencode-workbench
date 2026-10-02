/**
 * Renders the workbench `opencode.json` for a specific target machine.
 *
 * The committed profile hardcodes the original workstation's paths
 * (`/home/node/...`, `/workspaces/workbench/...`). A clone must rewrite those to
 * the target's `$HOME`, workspace directory and npm-global module directory, and
 * may drop MCP servers that are opt-in add-ons.
 *
 * It also degrades gracefully when the target has no credentials: the model is
 * selected at render time (DeepSeek → OpenCode Zen → degraded), and MCP servers
 * whose credentials are absent are disabled and reported instead of failing at
 * runtime. opencode has no cross-provider fallback, so this must happen here.
 */
import { assessMcp } from "./mcp-auth.js";

export interface RenderContext {
  /** Target user's home directory, e.g. `/home/ubuntu`. */
  home: string;
  /** Target workspace directory for the profile repo, e.g. `/workspaces/workbench`. */
  workspace: string;
  /** Target global npm modules directory, e.g. `/usr/lib/node_modules`. */
  npmModules: string;
  /** Target OpenCode config dir; defaults to `${home}/.config/opencode`. */
  configDir?: string;
  /**
   * MCP server ids to keep. `"all"` keeps every entry (including disabled ones).
   * Defaults to the portable core set.
   */
  enabledMcp?: string[] | "all";
  /**
   * Environment variable names present on the target. Values are never seen.
   * When supplied, servers missing required credentials are disabled.
   */
  presentEnv?: ReadonlySet<string>;
}

/** MCP servers treated as opt-in add-ons for a portable clone. */
export const OPTIONAL_MCP_IDS = [
  "esg-hub",
  "humanity4ai",
  "saga",
  "surrealdb",
  "google-workspace",
  "google-search",
  "ms-365",
  "stripe",
  "alibaba-cloud-ops",
  "designlang",
  "difflens",
] as const;

export type ProviderMode = "deepseek" | "zen" | "degraded";

export interface ModelSelection {
  model: string;
  smallModel: string;
  providerMode: ProviderMode;
}

/**
 * Choose the default and small model for a target. The floor is OpenCode Zen,
 * which requires only `OPENCODE_API_KEY`; DeepSeek is preferred when available.
 */
export function selectModel(base: Record<string, unknown>, presentEnv: ReadonlySet<string>): ModelSelection {
  if (presentEnv.has("DEEPSEEK_API_KEY")) {
    return { model: "deepseek/deepseek-v4-pro", smallModel: "deepseek/deepseek-v4-flash", providerMode: "deepseek" };
  }
  if (presentEnv.has("OPENCODE_API_KEY")) {
    return { model: "zen/zen-medium", smallModel: "zen/zen-medium", providerMode: "zen" };
  }
  // No usable model key: keep the Zen floor so opencode still boots and the
  // operator gets a clear, actionable failure rather than a config error.
  return { model: "zen/zen-medium", smallModel: "zen/zen-medium", providerMode: "degraded" };
}

export interface DegradedCapability {
  id: string;
  reason: string;
}

export interface RenderResult {
  config: Record<string, unknown>;
  /** Raw path replacements applied, for reporting. */
  substitutions: string[];
  /** MCP ids removed from the rendered config. */
  removedMcp: string[];
  /** Model chosen for the target. */
  model: string;
  /** Small model chosen for the target. */
  smallModel: string;
  /** Which provider the model resolves to. */
  providerMode: ProviderMode;
  /** Capabilities disabled because credentials are absent. */
  degraded: DegradedCapability[];
}

function substituteString(value: string, ctx: RenderContext): { value: string; applied: boolean } {
  const configDir = ctx.configDir ?? `${ctx.home}/.config/opencode`;
  const pairs: Array<[string, string]> = [
    ["/home/node/.npm-global/lib/node_modules", ctx.npmModules],
    ["/home/node/.local/bin", `${ctx.home}/.local/bin`],
    ["/home/node/design-extract-output", `${ctx.home}/design-extract-output`],
    ["/home/node/.mcp/google-workspace-mcp", `${ctx.home}/.mcp/google-workspace-mcp`],
    ["/home/node", ctx.home],
    ["/home/simonmak", ctx.home],
    ["/workspaces/workbench", ctx.workspace],
    ["./plugins/", `${configDir}/plugins/`],
  ];
  let out = value;
  let applied = false;
  for (const [from, to] of pairs) {
    if (out.includes(from)) {
      out = out.split(from).join(to);
      applied = true;
    }
  }
  return { value: out, applied };
}

function deepSubstitute(node: unknown, ctx: RenderContext, log: Set<string>): unknown {
  if (typeof node === "string") {
    const { value, applied } = substituteString(node, ctx);
    if (applied) log.add(value);
    return value;
  }
  if (Array.isArray(node)) return node.map((n) => deepSubstitute(n, ctx, log));
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node)) out[k] = deepSubstitute(v, ctx, log);
    return out;
  }
  return node;
}

/**
 * Render a parsed workbench config for a target. Pure function: it does not read
 * or write files, which keeps it easy to test and safe to dry-run.
 */
export function renderOpencodeConfig(base: Record<string, unknown>, ctx: RenderContext): RenderResult {
  const substitutions = new Set<string>();
  const cloned = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;
  cloned.$schema ??= "https://opencode.ai/config.json";

  const presentEnv = ctx.presentEnv ?? new Set<string>();
  const selection = selectModel(cloned, presentEnv);
  cloned.model = selection.model;
  cloned.small_model = selection.smallModel;

  const mcp = cloned.mcp;
  const removedMcp: string[] = [];
  const degraded: DegradedCapability[] = [];
  if (mcp && typeof mcp === "object") {
    const table = mcp as Record<string, unknown>;
    if (ctx.enabledMcp !== "all") {
      const keep = ctx.enabledMcp ?? Object.keys(table).filter((id) => !OPTIONAL_MCP_IDS.includes(id as never));
      for (const id of Object.keys(table)) {
        if (!keep.includes(id)) {
          delete table[id];
          removedMcp.push(id);
        }
      }
    }
    if (ctx.presentEnv) {
      for (const [id, entry] of Object.entries(table)) {
        if (!entry || typeof entry !== "object") continue;
        const health = assessMcp(id, entry as Record<string, unknown>, presentEnv);
        if (health.degraded) {
          const obj = entry as Record<string, unknown>;
          obj.enabled = false;
          obj._disabled_reason = `missing ${health.missingEnv.join(", ")}`;
          degraded.push({ id, reason: `missing ${health.missingEnv.join(", ")} (${health.auth})` });
        }
      }
    }
  }

  const config = deepSubstitute(cloned, ctx, substitutions) as Record<string, unknown>;
  return {
    config,
    substitutions: [...substitutions],
    removedMcp,
    model: selection.model,
    smallModel: selection.smallModel,
    providerMode: selection.providerMode,
    degraded,
  };
}
