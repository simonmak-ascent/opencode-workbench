import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  apply,
  inspect,
  plan,
  removeComponent,
  targetFromSpec,
  updateComponent,
  verify,
  type CloneOptions,
} from "./clone.js";
import type { TargetSpec } from "./target.js";
import { COMPONENTS, componentById, defaultComponentIds } from "./components.js";
import { OPTIONAL_MCP_IDS } from "./render.js";
import { REPO_URL, REPO_WEB, packageRoot } from "./profile.js";
import { REQUIRED_CREDENTIALS, credentialByVar, credentialStatus } from "./credential-catalog.js";

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
  envPresent: z.string().optional().describe("Space-separated names of credentials present on the target (values are never read)."),
  has: z.record(z.string(), z.boolean()).describe("Detection flags for git, curl, node, npm, corepack, pnpm, docker, uv, gh, opencode, sudo."),
});

const planStepOutput = z.object({
  id: z.string().describe("Component id."),
  title: z.string().describe("Component name."),
  tier: z.enum(["required", "core", "optional"]).describe("Component tier."),
  action: z.enum(["install", "present", "manual"]).describe("Planned action: install, already present, or manual step."),
  description: z.string().describe("What the component provides."),
  command: z.string().optional().describe("Preview of the privileged command that would run, for consent."),
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
  model: z.string().describe("Default model selected for the target (DeepSeek when its key is present, else the OpenCode Zen free floor)."),
  providerMode: z.enum(["deepseek", "zen", "degraded"]).describe("Which provider the model resolves to."),
  degraded: z.array(z.object({ id: z.string(), reason: z.string() })).describe("Capabilities disabled because required credentials are absent; fill the named env vars to enable them."),
  requiresConfirmation: z.boolean().optional().describe("True when the call returned a plan without applying; re-call with confirm:true to install."),
  plan: z
    .object({
      toInstall: z.array(z.string()).describe("Component ids that would be installed."),
      commands: z.array(z.object({ id: z.string(), command: z.string().optional() })).describe("Privileged command preview per component."),
    })
    .optional()
    .describe("Presented when confirmation is required."),
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

const credentialStatusOutput = z.object({
  var: z.string().describe("Environment variable name."),
  label: z.string().describe("Human-readable name."),
  purpose: z.string().describe("What uses it."),
  url: z.string().optional().describe("Where to create/obtain the key."),
  method: z.enum(["paste", "oauth", "cli", "instruction"]).describe("Recommended acquisition method."),
  command: z.string().optional().describe("Exact non-interactive command, when one exists."),
  optional: z.boolean().optional().describe("True when only a subset of tools degrades without it."),
  present: z.boolean().describe("Whether the target already provides it (value never read)."),
});

const credentialsOutput = z.object({
  target: z.string().describe("Label of the inspected target."),
  present: z.array(z.string()).describe("Credential names already present on the target."),
  missing: z.array(z.string()).describe("Credential names not present."),
  template: z.string().describe("Path of the env file to fill in."),
  credentials: z.array(credentialStatusOutput).describe("Every credential the profile references with its acquisition guidance."),
});

const authFlowOutput = z.object({
  target: z.string().describe("Label of the target."),
  var: z.string().describe("Credential being acquired."),
  method: z.enum(["paste", "oauth", "cli", "instruction"]).describe("Acquisition method."),
  url: z.string().optional().describe("Provider URL to open."),
  command: z.string().optional().describe("Command for the agent/user to run."),
  present: z.boolean().describe("Whether the credential is present now."),
  verified: z.boolean().describe("True when the credential is present and ready."),
  next: z.string().describe("What to do next."),
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
    "describe_workbench",
    {
      title: "Workbench server info",
      description:
        "Describe this MCP server and its capabilities without contacting any target: repository URL, the default component set, components grouped by tier (required/core/optional), and optional MCP add-ons. Read-only and static — it reads only the bundled profile, makes no network call, and touches no target. Use it to look up a component id for install_component/remove_component/update_component, or to see available add-ons; use inspect_target for a machine's live state.",
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
        "Probe one Linux machine — this host (`local`) or a remote host over SSH (`ssh`) — and report its OS, kernel, architecture, package manager, Node/npm, OpenCode, Docker, and per-tool detection flags, plus the names (never values) of credentials present. Read-only: it runs a single shell probe on the target, installs nothing, writes nothing, and contacts no external service; `target.cwd` sets the working directory for relative checks, and `target.port`/`identityFile` are passed to ssh. Use it to see what a clone would touch, then plan_clone to turn that into an ordered plan and apply_clone to perform it.",
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
        "Return a read-only plan for a target: compare it against the Workbench profile and list each component as `install`, `present`, or `manual`, with the commands that would run. It clones nothing and writes nothing; `components` narrows the plan and `workspace` sets where the profile repo is expected. Use it to preview before apply_clone, which performs the changes.",
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
        "Apply the Workbench profile to a target: clone the repo and install missing components (OpenCode CLI, Node/pnpm, MCP servers, skills, plugins, optional Docker). It OVERWRITES `<home>/.config/opencode/opencode.json`, copies `AGENTS.md`, resets an existing profile repo to `origin/main`, and runs global installs that need write permission (plus SSH for `mode:ssh`) and can take minutes. Writes a names-only `~/.env.workbench` (mode 600); never secret values. Consent-gated and idempotent: without `confirm:true` it returns the plan and changes nothing. To preview only, use plan_clone.",
      inputSchema: {
        target: targetShape,
        confirm: z.boolean().optional().describe("Set true to actually install. When absent, the call returns a plan and makes no changes."),
        ...optionsShape,
      },
      outputSchema: applyOutput,
      annotations: { destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ target, confirm, ...opts }: { target: TargetArg; confirm?: boolean } & Partial<CloneOptions>) => {
      try {
        const spec = targetFromSpec(toSpec(target));
        if (confirm !== true) {
          const p = await plan(spec, toOptions(opts));
          const dry = await apply(spec, { ...toOptions(opts), dryRun: true });
          return structured({
            ...dry,
            requiresConfirmation: true,
            plan: {
              toInstall: p.toInstall,
              commands: p.steps.filter((s) => s.action === "install").map((s) => ({ id: s.id, command: s.command })),
            },
          });
        }
        return structured(await apply(spec, toOptions(opts)));
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
        "Re-check a target after a clone: return a per-component `present`/`missing` list plus whether `opencode.json` and `~/.env.workbench` exist. Read-only and idempotent: it checks files and re-runs detection, writing nothing. `target` selects the machine (`local` or SSH) and its `home` is where the `opencode.json` and `~/.env.workbench` checks run; `components` restricts the check to those ids (omit it to check every component). Use it after apply_clone and after component changes; for a pre-clone preview use plan_clone.",
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
        "Install a single Workbench component by id (e.g. `node`, `opencode`, `npm-mcps`, `skills`) on a target; `component` must be an id from describe_workbench. Overwrites that component's files when present (e.g. `skills`/`plugins` replace the copies under `<home>/.config/opencode`); global installs need write permission and can take minutes. Idempotent and consent-gated: without `confirm:true` it returns the plan. Use it for one targeted component; use apply_clone to install the full default set.",
      inputSchema: {
        target: targetShape,
        component: z.string().describe("Component id from describe_workbench."),
        workspace: z.string().optional().describe("Target directory for the profile repo."),
        confirm: z.boolean().optional().describe("Set true to actually install. When absent, the call returns a plan and makes no changes."),
      },
      outputSchema: applyOutput,
      annotations: { destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ target, component, workspace, confirm }: { target: TargetArg; component: string; workspace?: string; confirm?: boolean }) => {
      try {
        const c = componentById(component);
        if (!c) throw new Error(`unknown component '${component}'`);
        const spec = targetFromSpec(toSpec(target));
        if (confirm !== true) {
          const dry = await apply(spec, { components: [component], workspace, dryRun: true });
          return structured({
            ...dry,
            requiresConfirmation: true,
            plan: { toInstall: [component], commands: [{ id: component, command: c.preview }] },
          });
        }
        return structured(await apply(spec, { components: [component], workspace }));
      } catch (e) {
        return fail("install_component failed", e);
      }
    },
  );

  const componentActionOutput = z.object({
    target: z.string().describe("Label of the target."),
    id: z.string().describe("Component id acted on."),
    action: z.enum(["removed", "updated", "absent", "manual"]).describe("What happened: removed, updated, already absent, or manual (no automated uninstall)."),
    code: z.number().describe("Exit code of the action."),
    output: z.string().describe("Captured output (truncated)."),
    requiresConfirmation: z.boolean().optional().describe("True when the call returned a preview without acting; re-call with confirm:true."),
  });

  server.registerTool(
    "remove_component",
    {
      title: "Remove one Workbench component",
      description:
        "Uninstall a single Workbench component by id from a target — the inverse of install_component — for a bounded, documented subset (`opencode`, `pnpm`, `uv`, `npm-mcps`, `vendored-mcps`, `research-mcps`, `github-mcp`, `skills`, `plugins`, `docker-containers`, `playwright-browsers`); `component` must be an id from describe_workbench. Idempotent: an already-absent component reports `absent`; components with no automated uninstall (system packages such as git/curl/node) report `manual` and require manual removal. Consent-gated and destructive: without `confirm:true` it returns a preview and changes nothing. Removes only that component's files — it does not delete `opencode.json` or the profile repo. Use it to tear down one component; to remove several, call it per id.",
      inputSchema: {
        target: targetShape,
        component: z.string().describe("Component id from describe_workbench."),
        workspace: z.string().optional().describe("Profile repo directory (used by components whose removal needs it)."),
        confirm: z.boolean().optional().describe("Set true to actually remove. When absent, the call returns a preview and makes no changes."),
        dryRun: z.boolean().optional().describe("Report the action without changing anything."),
      },
      outputSchema: componentActionOutput,
      annotations: { destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ target, component, workspace, confirm, dryRun }: { target: TargetArg; component: string; workspace?: string; confirm?: boolean; dryRun?: boolean }) => {
      try {
        const c = componentById(component);
        if (!c) throw new Error(`unknown component '${component}'`);
        const spec = targetFromSpec(toSpec(target));
        if (confirm !== true) {
          const preview = await removeComponent(spec, component, { workspace, dryRun: true });
          return structured({ ...preview, requiresConfirmation: true });
        }
        return structured(await removeComponent(spec, component, { workspace, dryRun }));
      } catch (e) {
        return fail("remove_component failed", e);
      }
    },
  );

  server.registerTool(
    "update_component",
    {
      title: "Update one Workbench component",
      description:
        "Update one Workbench component in place by id: re-run its install script to fetch the current version (e.g. `opencode` re-runs the official installer; `npm-mcps` reinstalls the latest globals). OVERWRITES the component's files and needs write permission; global installs can take minutes. `workspace` points at the profile repo when needed; `dryRun` previews. Consent-gated: without `confirm:true` it returns a preview. For the whole profile use apply_clone.",
      inputSchema: {
        target: targetShape,
        component: z.string().describe("Component id from describe_workbench."),
        workspace: z.string().optional().describe("Profile repo directory (used by components whose update needs it)."),
        confirm: z.boolean().optional().describe("Set true to actually update. When absent, the call returns a preview and makes no changes."),
        dryRun: z.boolean().optional().describe("Report the action without changing anything."),
      },
      outputSchema: componentActionOutput,
      annotations: { destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ target, component, workspace, confirm, dryRun }: { target: TargetArg; component: string; workspace?: string; confirm?: boolean; dryRun?: boolean }) => {
      try {
        const c = componentById(component);
        if (!c) throw new Error(`unknown component '${component}'`);
        const spec = targetFromSpec(toSpec(target));
        if (confirm !== true) {
          const preview = await updateComponent(spec, component, { workspace, dryRun: true });
          return structured({ ...preview, requiresConfirmation: true });
        }
        return structured(await updateComponent(spec, component, { workspace, dryRun }));
      } catch (e) {
        return fail("update_component failed", e);
      }
    },
  );

  server.registerTool(
    "list_required_credentials",
    {
      title: "List required credentials",
      description:
        "List the credentials the profile references, which the target already provides, and how to acquire each missing one. Value-blind: it reads only whether each env var is set — no values, no network, no writes. `target` selects the machine (`local` or SSH); its `home` determines the `template` path returned and the env file the presence check reads. Returns `present`/`missing` var-name arrays plus one guidance record per credential (`var`, `purpose`, `url`, `method`, `command`). Use it after plan_clone to see what would degrade; act on one credential with run_auth_flow.",
      inputSchema: { target: targetShape },
      outputSchema: credentialsOutput,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ target }: { target: TargetArg }) => {
      try {
        const t = targetFromSpec(toSpec(target));
        const info = await inspect(t);
        const presentEnv = new Set((info.envPresent ?? "").split(/\s+/).filter(Boolean));
        const credentials = REQUIRED_CREDENTIALS.map((c) => credentialStatus(c, presentEnv));
        return structured({
          target: t.label,
          present: credentials.filter((c) => c.present).map((c) => c.var),
          missing: credentials.filter((c) => !c.present).map((c) => c.var),
          template: `${info.home}/.env.workbench`,
          credentials,
        });
      } catch (e) {
        return fail("list_required_credentials failed", e);
      }
    },
  );

  server.registerTool(
    "run_auth_flow",
    {
      title: "Acquire one credential (best-effort)",
      description:
        "Return the acquisition plan for one credential on a target: the provider URL, the exact non-interactive command when one exists (e.g. `opencode auth login`, `opencode mcp auth vercel`, `gh auth login`), and whether it is already present. Read-only and value-blind: it emits guidance and re-checks presence; it does not run the commands or handle secret values. `var` is the env var name from list_required_credentials. Use it for a single credential; it does not replace that listing.",
      inputSchema: {
        target: targetShape,
        var: z.string().describe("Credential env var name from list_required_credentials (e.g. OPENCODE_API_KEY)."),
      },
      outputSchema: authFlowOutput,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ target, var: name }: { target: TargetArg; var: string }) => {
      try {
        const spec = credentialByVar(name);
        if (!spec) throw new Error(`unknown credential '${name}'`);
        const t = targetFromSpec(toSpec(target));
        const info = await inspect(t);
        const presentEnv = new Set((info.envPresent ?? "").split(/\s+/).filter(Boolean));
        const present = presentEnv.has(name);
        const next = present
          ? "Already present; nothing to do."
          : spec.command
            ? `Run: ${spec.command}`
            : spec.url
              ? `Open ${spec.url} and paste the value into ${info.home}/.env.workbench`
              : `Set ${name}= in ${info.home}/.env.workbench`;
        return structured({
          target: t.label,
          var: name,
          method: spec.method,
          url: spec.url,
          command: spec.command,
          present,
          verified: present,
          next,
        });
      } catch (e) {
        return fail("run_auth_flow failed", e);
      }
    },
  );

}
