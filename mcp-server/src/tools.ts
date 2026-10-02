import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  apply,
  inspect,
  plan,
  targetFromSpec,
  verify,
  type CloneOptions,
} from "./clone.js";
import type { TargetSpec } from "./target.js";
import { COMPONENTS, componentById, defaultComponentIds } from "./components.js";
import { OPTIONAL_MCP_IDS } from "./render.js";
import { REPO_URL, REPO_WEB, packageRoot } from "./profile.js";

const targetShape = z
  .object({
    mode: z.enum(["local", "ssh"]).describe("Run on this machine (local) or a remote host (ssh)."),
    host: z.string().optional().describe("SSH host (required when mode=ssh)."),
    user: z.string().optional().describe("SSH user (defaults to ssh config / current user)."),
    port: z.number().int().positive().optional().describe("SSH port."),
    identityFile: z.string().optional().describe("SSH private key path."),
    cwd: z.string().optional().describe("Working directory on the target."),
  })
  .describe("The machine to operate on: this host (local) or a remote host over SSH (ssh).");

type TargetArg = z.infer<typeof targetShape>;

const optionsShape = {
  components: z.array(z.string()).optional().describe("Component ids to include; defaults to required+core."),
  workspace: z.string().optional().describe("Target directory for the profile repo."),
  profileUrl: z.string().optional().describe("Override profile git URL."),
  skipRepo: z.boolean().optional().describe("Do not clone/update the profile repo on the target."),
  dryRun: z.boolean().optional().describe("Report only; make no changes."),
};

// Output schemas: documented so the descriptions don't have to explain returns.

const componentInfoOutput = z.object({
  id: z.string().describe("Component identifier — pass this to install_component."),
  title: z.string().describe("Human-readable component name."),
  tier: z.enum(["required", "core", "optional"]).describe("Component tier."),
  description: z.string().describe("What the component provides."),
  manual: z.boolean().describe("True when the step cannot be fully automated."),
});

const infoOutput = z.object({
  repo: z.string().describe("Web URL of the workbench repository."),
  repoGit: z.string().describe("Git clone URL of the workbench repository."),
  packageRoot: z.string().describe("Filesystem path of the installed package."),
  defaultComponents: z.array(z.string()).describe("Component ids installed by default."),
  optionalMcp: z.array(z.string()).describe("Optional MCP add-on ids available in the profile."),
  components: z.array(componentInfoOutput).describe("Every component with id, tier and description."),
});

const inspectOutput = z.object({
  user: z.string().describe("Detected user on the target."),
  home: z.string().describe("Home directory on the target."),
  workspaceDefault: z.string().describe("Default directory where the profile repo will be cloned."),
  configDir: z.string().describe("OpenCode config directory on the target."),
  osId: z.string().optional().describe("OS identifier (e.g. ubuntu, debian, rhel)."),
  osName: z.string().optional().describe("Human-readable OS name."),
  osVersion: z.string().optional().describe("OS version string."),
  kernel: z.string().optional().describe("Kernel name and release."),
  arch: z.string().optional().describe("CPU architecture (e.g. x86_64, aarch64)."),
  packageManager: z.string().optional().describe("Detected package manager (apt-get, dnf, yum, apk, pacman, zypper, or none)."),
  nodeVersion: z.string().optional().describe("Installed Node.js version, if any."),
  npmModules: z.string().optional().describe("npm global modules directory."),
  opencodeBin: z.string().optional().describe("Path to the opencode binary, if installed."),
  dockerRunning: z.boolean().optional().describe("Whether the Docker daemon is reachable."),
  has: z.record(z.string(), z.boolean()).describe("Detection flags for git, curl, node, npm, corepack, pnpm, docker, uv, gh, opencode, sudo."),
});

const planStepOutput = z.object({
  id: z.string().describe("Component id."),
  title: z.string().describe("Component name."),
  tier: z.enum(["required", "core", "optional"]).describe("Component tier."),
  action: z.enum(["install", "present", "manual"]).describe("Planned action: install, already present, or manual step."),
  description: z.string().describe("What the component provides."),
});

const planOutput = z.object({
  target: z.string().describe("Label of the inspected target."),
  inspect: inspectOutput.describe("Full inspection of the target."),
  steps: z.array(planStepOutput).describe("Per-component plan."),
  toInstall: z.array(z.string()).describe("Component ids that will be installed."),
});

const applyOutput = z.object({
  target: z.string().describe("Label of the target."),
  workspace: z.string().describe("Directory where the profile repo was cloned."),
  configPath: z.string().describe("Path of the written opencode.json."),
  envPath: z.string().describe("Path of the written ~/.env.workbench template."),
  installed: z.array(
    z.object({
      id: z.string().describe("Component id installed."),
      code: z.number().describe("Exit code of the install step."),
      output: z.string().describe("Captured install output (truncated)."),
    }),
  ).describe("Components installed, with exit codes and output."),
  skipped: z.array(z.string()).describe("Component ids skipped (already present or manual)."),
  envVars: z.array(z.string()).describe("Environment variable names listed in the env template."),
  dryRun: z.boolean().describe("True when the run made no changes."),
});

const verifyOutput = z.object({
  target: z.string().describe("Label of the target."),
  configExists: z.boolean().describe("Whether opencode.json exists on the target."),
  envExists: z.boolean().describe("Whether ~/.env.workbench exists on the target."),
  components: z.array(
    z.object({
      id: z.string().describe("Component id."),
      present: z.boolean().describe("Whether the component is detected as present."),
    }),
  ).describe("Per-component presence detection."),
  missing: z.array(z.string()).describe("Component ids detected as missing."),
});

function toSpec(target: TargetArg): TargetSpec {
  if (target.mode === "ssh") {
    if (!target.host) throw new Error("target.host is required when mode=ssh");
    return {
      mode: "ssh",
      host: target.host,
      user: target.user,
      port: target.port,
      identityFile: target.identityFile,
      cwd: target.cwd,
    };
  }
  return { mode: "local", cwd: target.cwd };
}

function toOptions(args: Partial<CloneOptions>): CloneOptions {
  return {
    components: args.components,
    workspace: args.workspace,
    profileUrl: args.profileUrl,
    skipRepo: args.skipRepo,
    dryRun: args.dryRun,
  };
}

function structured(value: unknown): { content: []; structuredContent: Record<string, unknown> } {
  return { content: [], structuredContent: value as Record<string, unknown> };
}

function fail(message: string, error: unknown) {
  return {
    content: [{ type: "text" as const, text: `${message}: ${(error as Error).message}` }],
    isError: true,
  };
}

export function registerTools(server: McpServer): void {
  server.registerTool(
    "workbench_info",
    {
      title: "Workbench server info",
      description:
        "Describe this MCP server: repository URL, components grouped by tier (required/core/optional), and optional MCP add-ons. Reads only the bundled profile — no target or network access, results are static. Use it to look up a component id before calling install_component; for a machine's actual state use inspect_target.",
      inputSchema: {},
      outputSchema: infoOutput,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async () =>
      structured({
        repo: REPO_WEB,
        repoGit: REPO_URL,
        packageRoot: packageRoot(),
        defaultComponents: defaultComponentIds(),
        optionalMcp: OPTIONAL_MCP_IDS,
        components: COMPONENTS.map((c) => ({
          id: c.id,
          title: c.title,
          tier: c.tier,
          description: c.description,
          manual: c.manual ?? false,
        })),
      }),
  );

  server.registerTool(
    "inspect_target",
    {
      title: "Inspect a Linux target",
      description:
        "Probe a target machine — this host or a remote one over SSH — and report its OS, architecture, package manager, Node/npm, OpenCode, Docker and per-tool detection flags. Read-only: runs a single shell probe and changes nothing. Requires SSH access for `mode: ssh`. Use it before plan_clone to understand what a clone would touch.",
      inputSchema: { target: targetShape },
      outputSchema: inspectOutput,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ target }: { target: TargetArg }) => {
      try {
        return structured(await inspect(targetFromSpec(toSpec(target))));
      } catch (e) {
        return fail("inspect_target failed", e);
      }
    },
  );

  server.registerTool(
    "plan_clone",
    {
      title: "Plan a Workbench clone",
      description:
        "Compare a target against the portable Workbench profile and return each component as 'install', 'present', or 'manual', plus the list to install. Read-only: it installs nothing; requires SSH access for `mode: ssh`. Restrict the plan with `components`. Use this before apply_clone; use verify_clone after to confirm the result.",
      inputSchema: { target: targetShape, ...optionsShape },
      outputSchema: planOutput,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ target, ...opts }: { target: TargetArg } & Partial<CloneOptions>) => {
      try {
        return structured(await plan(targetFromSpec(toSpec(target)), toOptions(opts)));
      } catch (e) {
        return fail("plan_clone failed", e);
      }
    },
  );

  server.registerTool(
    "apply_clone",
    {
      title: "Apply a Workbench clone",
      description:
        "Clone the Workbench profile onto a target and install missing components: repo, OpenCode CLI, Node/pnpm, npm MCPs, vendored MCPs, skills, plugins, and optionally Docker. Idempotent — already-present components are skipped. Requires SSH access and write permission on the target; installs can take several minutes. Writes a rendered opencode.json and an empty ~/.env.workbench template (mode 600), never secret values. Restrict with `components`, preview with `dryRun:true`, then confirm with verify_clone.",
      inputSchema: { target: targetShape, ...optionsShape },
      outputSchema: applyOutput,
      annotations: { destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ target, ...opts }: { target: TargetArg } & Partial<CloneOptions>) => {
      try {
        return structured(await apply(targetFromSpec(toSpec(target)), toOptions(opts)));
      } catch (e) {
        return fail("apply_clone failed", e);
      }
    },
  );

  server.registerTool(
    "verify_clone",
    {
      title: "Verify a Workbench clone",
      description:
        "Re-check a target after cloning: presence of opencode.json and ~/.env.workbench plus per-component detection, returning a missing list. Read-only; requires SSH access for `mode: ssh`. Restrict the check with `components`. Use this after apply_clone; for a pre-clone preview use plan_clone.",
      inputSchema: { target: targetShape, ...optionsShape },
      outputSchema: verifyOutput,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ target, ...opts }: { target: TargetArg } & Partial<CloneOptions>) => {
      try {
        return structured(await verify(targetFromSpec(toSpec(target)), toOptions(opts)));
      } catch (e) {
        return fail("verify_clone failed", e);
      }
    },
  );

  server.registerTool(
    "install_component",
    {
      title: "Install one Workbench component",
      description:
        "Install one component by id (e.g. 'node', 'opencode', 'npm-mcps', 'skills') on a target. `component` must be an id returned by workbench_info. Idempotent — installs only that component and skips it if already present. Requires SSH access and write permission on the target; can take several minutes. Use apply_clone for the full default set.",
      inputSchema: {
        target: targetShape,
        component: z.string().describe("Component id from workbench_info."),
        workspace: z.string().optional().describe("Target directory for the profile repo."),
      },
      outputSchema: applyOutput,
      annotations: { destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ target, component, workspace }: { target: TargetArg; component: string; workspace?: string }) => {
      try {
        const c = componentById(component);
        if (!c) throw new Error(`unknown component '${component}'`);
        return structured(await apply(targetFromSpec(toSpec(target)), { components: [component], workspace }));
      } catch (e) {
        return fail("install_component failed", e);
      }
    },
  );
}
