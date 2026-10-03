import { describe, it, expect } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { registerTools } from "../src/tools";

async function connect(): Promise<Client> {
  const server = new McpServer({ name: "opencode-workbench", version: "0.0.0-test" });
  registerTools(server);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: "test-client", version: "0.0.0-test" });
  await client.connect(clientTransport);
  return client;
}

describe("opencode-workbench server", () => {
  it("registers the expected tools", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "apply_clone",
      "describe_workbench",
      "inspect_target",
      "install_component",
      "list_required_credentials",
      "plan_clone",
      "provision_host",
      "remove_component",
      "run_auth_flow",
      "update_component",
      "verify_clone",
    ]);
    await client.close();
  });

  it("documents provision_host without touching a target", async () => {
    const client = await connect();
    const res = await client.callTool({ name: "provision_host", arguments: { help: true } });
    expect(res.isError).toBeFalsy();
    const out = res.structuredContent as {
      mode: string;
      help?: { parameters: Array<{ name: string }> };
    };
    expect(out.mode).toBe("help");
    expect(out.help?.parameters.map((p) => p.name)).toContain("upgrade");
    expect(out.help?.parameters.map((p) => p.name)).toContain("opencodeVersion");
    await client.close();
  });

  it("answers describe_workbench with components and optional MCPs", async () => {
    const client = await connect();
    const res = await client.callTool({ name: "describe_workbench", arguments: {} });
    const info = res.structuredContent as {
      components: Array<{ id: string; tier: string }>;
      optionalMcp: string[];
    };
    expect(info.components.some((c) => c.id === "opencode" && c.tier === "required")).toBe(true);
    expect(info.components.some((c) => c.id === "sandbox" && c.tier === "optional")).toBe(true);
    expect(info.optionalMcp).toContain("saga");
    await client.close();
  });

  it("inspects the local machine via the probe script", async () => {
    const client = await connect();
    const res = await client.callTool({
      name: "inspect_target",
      arguments: { target: { mode: "local" } },
    });
    expect(res.isError).toBeFalsy();
    const info = res.structuredContent as { home: string; has: Record<string, boolean> };
    expect(typeof info.home).toBe("string");
    expect(info.home.length).toBeGreaterThan(0);
    expect(typeof info.has).toBe("object");
    await client.close();
  });

  it("plans a local clone without side effects", async () => {
    const client = await connect();
    const res = await client.callTool({
      name: "plan_clone",
      arguments: { target: { mode: "local" } },
    });
    expect(res.isError).toBeFalsy();
    const plan = res.structuredContent as {
      steps: Array<{ id: string; action: string }>;
      toInstall: string[];
    };
    expect(plan.steps.some((s) => s.id === "git")).toBe(true);
    expect(plan.steps.some((s) => s.id === "opencode")).toBe(true);
    expect(Array.isArray(plan.toInstall)).toBe(true);
    await client.close();
  });

  it("previews remove_component without acting", async () => {
    const client = await connect();
    const res = await client.callTool({
      name: "remove_component",
      arguments: { target: { mode: "local" }, component: "skills" },
    });
    expect(res.isError).toBeFalsy();
    const out = res.structuredContent as { requiresConfirmation?: boolean; action: string };
    expect(out.requiresConfirmation).toBe(true);
    expect(["removed", "absent", "manual"]).toContain(out.action);
    await client.close();
  });

  it("previews update_component without acting", async () => {
    const client = await connect();
    const res = await client.callTool({
      name: "update_component",
      arguments: { target: { mode: "local" }, component: "skills" },
    });
    expect(res.isError).toBeFalsy();
    const out = res.structuredContent as { requiresConfirmation?: boolean; action: string };
    expect(out.requiresConfirmation).toBe(true);
    expect(out.action).toBe("updated");
    await client.close();
  });
});
