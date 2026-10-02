#!/usr/bin/env node
/**
 * workbench-mcp — MCP server + connector that clones the OpenCode workbench
 * configuration onto Linux machines, locally or over SSH.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools.js";

const VERSION = "1.0.0";

async function main(): Promise<void> {
  const server = new McpServer({ name: "workbench-mcp", version: VERSION });
  registerTools(server);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Keep the process alive on stdin; the transport handles the lifecycle.
}

main().catch((err) => {
  process.stderr.write(`workbench-mcp fatal: ${(err as Error).stack ?? String(err)}\n`);
  process.exit(1);
});
