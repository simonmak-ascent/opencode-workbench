/**
 * Renders the workbench `opencode.json` for a specific target machine.
 *
 * The committed profile hardcodes the original workstation's paths
 * (`/home/node/...`, `/workspaces/workbench/...`). A clone must rewrite those to
 * the target's `$HOME`, workspace directory and npm-global module directory, and
 * may drop MCP servers that are opt-in add-ons.
 */

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
}

/** MCP servers treated as opt-in add-ons for a portable clone. */
export const OPTIONAL_MCP_IDS = [
  "vdd",
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

export interface RenderResult {
  config: Record<string, unknown>;
  /** Raw path replacements applied, for reporting. */
  substitutions: string[];
  /** MCP ids removed from the rendered config. */
  removedMcp: string[];
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

  const mcp = cloned.mcp;
  const removedMcp: string[] = [];
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
  }

  const config = deepSubstitute(cloned, ctx, substitutions) as Record<string, unknown>;
  return { config, substitutions: [...substitutions], removedMcp };
}
