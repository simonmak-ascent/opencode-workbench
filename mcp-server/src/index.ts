#!/usr/bin/env node
/**
 * opencode-workbench — MCP server + connector that clones the OpenCode workbench
 * configuration onto Linux machines, locally or over SSH.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools.js";
import { VERSION } from "./version.js";

async function main(): Promise<void> {
  const server = new McpServer({ name: "opencode-workbench", version: VERSION });
  registerTools(server);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Keep the process alive on stdin; the transport handles the lifecycle.
}

main().catch((err) => {
  process.stderr.write(`opencode-workbench fatal: ${(err as Error).stack ?? String(err)}\n`);
  process.exit(1);
});
