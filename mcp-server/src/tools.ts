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

function json(value: unknown): { content: Array<{ type: "text"; text: string }> } {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
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
      description: "Describe this MCP server: repo, available components, tiers and optional MCP add-ons.",
      inputSchema: {},
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async () =>
      json({
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
        "Probe a machine (local or over SSH): OS, arch, package manager, Node, Docker, OpenCode, home and npm-global paths.",
      inputSchema: { target: targetShape },
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ target }: { target: TargetArg }) => {
      try {
        return json(await inspect(targetFromSpec(toSpec(target))));
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
        "Compare the target against the portable Workbench profile and list the components to install, already present, or requiring manual steps.",
      inputSchema: { target: targetShape, ...optionsShape },
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ target, ...opts }: { target: TargetArg } & Partial<CloneOptions>) => {
      try {
        return json(await plan(targetFromSpec(toSpec(target)), toOptions(opts)));
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
        "Clone the Workbench profile onto the target and install missing components: repo, OpenCode CLI, Node/pnpm, npm MCPs, vendored MCPs, skills, plugins, and (optionally) Docker. Writes a rendered opencode.json and an empty ~/.env.workbench template. Idempotent.",
      inputSchema: { target: targetShape, ...optionsShape },
      annotations: { destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ target, ...opts }: { target: TargetArg } & Partial<CloneOptions>) => {
      try {
        return json(await apply(targetFromSpec(toSpec(target)), toOptions(opts)));
      } catch (e) {
        return fail("apply_clone failed", e);
      }
    },
  );

  server.registerTool(
    "verify_clone",
    {
      title: "Verify a Workbench clone",
      description: "Re-check the target: config file, env template, and every component's detection.",
      inputSchema: { target: targetShape, ...optionsShape },
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ target, ...opts }: { target: TargetArg } & Partial<CloneOptions>) => {
      try {
        return json(await verify(targetFromSpec(toSpec(target)), toOptions(opts)));
      } catch (e) {
        return fail("verify_clone failed", e);
      }
    },
  );

  server.registerTool(
    "install_component",
    {
      title: "Install one Workbench component",
      description: "Install a single component by id (e.g. 'node', 'opencode', 'npm-mcps', 'skills').",
      inputSchema: {
        target: targetShape,
        component: z.string().describe("Component id from workbench_info."),
        workspace: z.string().optional().describe("Target directory for the profile repo."),
      },
      annotations: { destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ target, component, workspace }: { target: TargetArg; component: string; workspace?: string }) => {
      try {
        const c = componentById(component);
        if (!c) throw new Error(`unknown component '${component}'`);
        return json(await apply(targetFromSpec(toSpec(target)), { components: [component], workspace }));
      } catch (e) {
        return fail("install_component failed", e);
      }
    },
  );
}
