import type { Target, TargetSpec } from "./target.js";
import { createTarget, shellQuote } from "./target.js";
import { PROBE_SCRIPT } from "./probe.js";
import {
  COMPONENTS,
  PREAMBLE,
  componentById,
  defaultComponentIds,
  type Component,
} from "./components.js";
import {
  REPO_URL,
  extractEnvVars,
  loadBaseConfig,
  renderEnvTemplate,
} from "./profile.js";
import { renderOpencodeConfig, type RenderContext } from "./render.js";

export interface InspectResult {
  user: string;
  home: string;
  workspaceDefault: string;
  configDir: string;
  osId?: string;
  /** Value of `ID_LIKE` from /etc/os-release (space-separated family hints). */
  osIdLike?: string;
  osName?: string;
  osVersion?: string;
  kernel?: string;
  arch?: string;
  packageManager?: string;
  nodeVersion?: string;
  npmModules?: string;
  opencodeBin?: string;
  dockerRunning?: boolean;
  /** Space-separated names of credentials present on the target (never values). */
  envPresent?: string;
  has: Record<string, boolean>;
}

export interface CloneOptions {
  /** Component ids to include. Defaults to the required+core portable set. */
  components?: string[];
  /** Target workspace dir for the profile repo. */
  workspace?: string;
  /** Override the profile git URL. */
  profileUrl?: string;
  /** Skip cloning/updating the profile repo on the target. */
  skipRepo?: boolean;
  /** Do not write files or run installs; only report. */
  dryRun?: boolean;
}

export interface PlanStep {
  id: string;
  title: string;
  tier: Component["tier"];
  action: "install" | "present" | "manual";
  description: string;
  /** Preview of the privileged action, for consent. */
  command?: string;
}

export interface PlanResult {
  target: string;
  inspect: InspectResult;
  steps: PlanStep[];
  toInstall: string[];
}

export interface ApplyResult {
  target: string;
  workspace: string;
  configPath: string;
  envPath: string;
  installed: Array<{ id: string; code: number; output: string }>;
  skipped: string[];
  envVars: string[];
  dryRun: boolean;
  /** Model selected for the target (DeepSeek → Zen → degraded). */
  model: string;
  /** Which provider the model resolves to. */
  providerMode: string;
  /** Capabilities disabled because required credentials are absent. */
  degraded: Array<{ id: string; reason: string }>;
}

export function targetFromSpec(spec: TargetSpec): Target {
  return createTarget(spec);
}

export async function inspect(target: Target): Promise<InspectResult> {
  const res = await target.run(PROBE_SCRIPT, { timeoutMs: 30_000 });
  const raw = extractJson(res.stdout);
  if (!raw) {
    throw new Error(
      `probe failed on ${target.label} (exit ${res.code}). stderr: ${res.stderr.slice(0, 500)}`,
    );
  }
  const parsed = JSON.parse(raw) as Partial<InspectResult> & { has?: Record<string, boolean> };
  const home = parsed.home || "/root";
  const workspaceDefault = parsed.has?.["sudo"] === false ? `${home}/.workbench` : "/workspaces/workbench";
  return {
    ...parsed,
    user: parsed.user ?? "root",
    home,
    workspaceDefault,
    configDir: `${home}/.config/opencode`,
    has: parsed.has ?? {},
  };
}

export function extractJson(stdout: string): string | undefined {
  const start = stdout.indexOf("{");
  const end = stdout.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return undefined;
  return stdout.slice(start, end + 1);
}

function detectScript(ids: string[]): string {
  const fns = ids
    .map((id) => {
      const c = componentById(id);
      if (!c) return "";
      return `c_${id}() { ${c.detect}; }`;
    })
    .filter(Boolean)
    .join("\n");
  const loop = ids.map((id) => `if c_${id} >/dev/null 2>&1; then echo "${id} ok"; else echo "${id} missing"; fi`).join("\n");
  return `${PREAMBLE}\n${fns}\n${loop}\n`;
}

export async function detect(target: Target, ids: string[]): Promise<Record<string, boolean>> {
  const res = await target.run(detectScript(ids), { timeoutMs: 60_000 });
  const out: Record<string, boolean> = {};
  for (const line of res.stdout.split("\n")) {
    const m = /^([a-z0-9-]+) (ok|missing)$/.exec(line.trim());
    if (m && m[1]) out[m[1]] = m[2] === "ok";
  }
  return out;
}

function scopeIds(options: CloneOptions): string[] {
  const all = options.components && options.components.length ? options.components : defaultComponentIds();
  return COMPONENTS.map((c) => c.id).filter((id) => all.includes(id));
}

export async function plan(target: Target, options: CloneOptions = {}): Promise<PlanResult> {
  const ids = scopeIds(options);
  const info = await inspect(target);
  const known = await detect(target, ids);
  const steps: PlanStep[] = ids.map((id) => {
    const c = componentById(id)!;
    const present = known[id] === true;
    const action: PlanStep["action"] = present ? "present" : c.manual ? "manual" : "install";
    return { id, title: c.title, tier: c.tier, action, description: c.description, command: c.preview };
  });
  return {
    target: target.label,
    inspect: info,
    steps,
    toInstall: steps.filter((s) => s.action === "install").map((s) => s.id),
  };
}

function withEnv(script: string, workspace: string): string {
  return `export WB_REPO=${shellQuote(workspace)}\n${PREAMBLE}\n${script}`;
}

async function ensureRepo(target: Target, workspace: string, url: string): Promise<string> {
  const script = `
set -u
if [ -d ${shellQuote(workspace)}/.git ]; then
  git -C ${shellQuote(workspace)} fetch --depth 1 origin >/dev/null 2>&1 && \
    git -C ${shellQuote(workspace)} reset --hard origin/main >/dev/null 2>&1 || echo "warn: could not update repo"
else
  rm -rf ${shellQuote(workspace)}
  mkdir -p "$(dirname ${shellQuote(workspace)})" 2>/dev/null || true
  git clone --depth 1 ${shellQuote(url)} ${shellQuote(workspace)}
fi
`;
  const res = await target.run(script, { timeoutMs: 180_000 });
  if (res.code !== 0) throw new Error(`repo clone failed on ${target.label}: ${res.stderr.slice(0, 500)}`);
  return res.stdout.trim();
}

export async function apply(target: Target, options: CloneOptions = {}): Promise<ApplyResult> {
  const info = await inspect(target);
  const home = info.home;
  const workspace = options.workspace || info.workspaceDefault;
  const configDir = `${home}/.config/opencode`;
  const dryRun = options.dryRun === true;

  const ids = scopeIds(options);
  const present = dryRun ? {} : await detect(target, ids);

  if (!options.skipRepo && !dryRun) {
    await ensureRepo(target, workspace, options.profileUrl || REPO_URL);
  }

  // Render and write opencode.json (local, always safe to write; skipped on dry run).
  const base = await loadBaseConfig();
  const presentEnv = new Set((info.envPresent ?? "").split(/\s+/).filter(Boolean));
  const ctx: RenderContext = {
    home,
    workspace,
    npmModules: info.npmModules || `${home}/.npm-global/lib/node_modules`,
    configDir,
    presentEnv,
  };
  const rendered = renderOpencodeConfig(base, ctx);
  const envVars = extractEnvVars(rendered.config);

  const configPath = `${configDir}/opencode.json`;
  const envPath = `${home}/.env.workbench`;

  const installed: ApplyResult["installed"] = [];
  const skipped: string[] = [];

  if (!dryRun) {
    const writeScript = `
set -u
mkdir -p ${shellQuote(configDir)}
cat > ${shellQuote(configPath)} <<'WB_OPENCODE_EOF'
${JSON.stringify(rendered.config, null, 2)}
WB_OPENCODE_EOF
if [ -f "$WB_REPO/AGENTS.md" ]; then cp "$WB_REPO/AGENTS.md" ${shellQuote(configDir)}/AGENTS.md && echo "wrote AGENTS.md"; fi
mkdir -p ${shellQuote(configDir)}/docs/research
if [ -f "$WB_REPO/docs/research/pipeline.md" ]; then cp "$WB_REPO/docs/research/pipeline.md" ${shellQuote(configDir)}/docs/research/pipeline.md && echo "wrote research pipeline"; fi
if [ ! -f ${shellQuote(envPath)} ]; then
  cat > ${shellQuote(envPath)} <<'WB_ENV_EOF'
${renderEnvTemplate(envVars)}WB_ENV_EOF
  chmod 600 ${shellQuote(envPath)}
  echo "wrote env template: ${envPath}"
else
  echo "env file already exists: ${envPath}"
fi
echo "wrote config: ${configPath}"
`;
    await target.run(withEnv(writeScript, workspace), { timeoutMs: 30_000 });
  }

  if (!dryRun) {
    for (const id of ids) {
      const c = componentById(id);
      if (!c) continue;
      if (present[id]) {
        skipped.push(id);
        continue;
      }
      if (c.manual) {
        skipped.push(id);
        continue;
      }
      const res = await target.run(withEnv(c.install, workspace), { timeoutMs: 600_000 });
      installed.push({
        id,
        code: res.code,
        output: `${(res.stdout + res.stderr).trim().slice(0, 1200)}`,
      });
    }
  }

  return {
    target: target.label,
    workspace,
    configPath,
    envPath,
    installed,
    skipped,
    envVars,
    dryRun,
    model: rendered.model,
    providerMode: rendered.providerMode,
    degraded: rendered.degraded,
  };
}

export interface VerifyResult {
  target: string;
  configExists: boolean;
  envExists: boolean;
  components: Array<{ id: string; present: boolean }>;
  missing: string[];
}

export async function verify(target: Target, options: CloneOptions = {}): Promise<VerifyResult> {
  const info = await inspect(target);
  const ids = scopeIds(options);
  const known = await detect(target, ids);

  const checks = await target.run(
    `test -f ${shellQuote(info.configDir)}/opencode.json && echo config_ok; test -f ${shellQuote(info.home)}/.env.workbench && echo env_ok`,
    { timeoutMs: 20_000 },
  );
  const components = ids.map((id) => ({ id, present: known[id] === true }));
  return {
    target: target.label,
    configExists: checks.stdout.includes("config_ok"),
    envExists: checks.stdout.includes("env_ok"),
    components,
    missing: components.filter((c) => !c.present).map((c) => c.id),
  };
}
