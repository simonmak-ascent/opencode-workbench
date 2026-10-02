import { describe, it, expect } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { registerTools } from "../src/tools";

async function connect(): Promise<Client> {
  const server = new McpServer({ name: "workbench-mcp", version: "0.0.0-test" });
  registerTools(server);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: "test-client", version: "0.0.0-test" });
  await client.connect(clientTransport);
  return client;
}

describe("workbench-mcp server", () => {
  it("registers the expected tools", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "apply_clone",
      "inspect_target",
      "install_component",
      "plan_clone",
      "verify_clone",
      "workbench_info",
    ]);
    await client.close();
  });

  it("answers workbench_info with components and optional MCPs", async () => {
    const client = await connect();
    const res = await client.callTool({ name: "workbench_info", arguments: {} });
    const text = (res.content as Array<{ type: string; text: string }>)[0]!.text;
    const info = JSON.parse(text) as {
      components: Array<{ id: string; tier: string }>;
      optionalMcp: string[];
    };
    expect(info.components.some((c) => c.id === "opencode" && c.tier === "required")).toBe(true);
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
    const text = (res.content as Array<{ type: string; text: string }>)[0]!.text;
    const info = JSON.parse(text) as { home: string; has: Record<string, boolean> };
    expect(typeof info.home).toBe("string");
    expect(info.home.length).toBeGreaterThan(0);
    expect(typeof info.has).toBe("object");
    await client.close();
  });
});
