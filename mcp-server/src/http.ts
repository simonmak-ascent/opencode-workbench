/**
 * Streamable HTTP transport entrypoint for the OpenCode Workbench MCP server.
 *
 * The stdio transport (index.ts) remains the local/package entrypoint; this
 * module exposes the same 6 tools over the MCP Streamable HTTP transport so the
 * server can be hosted (e.g. Vercel `api/mcp.js`) and listed as a Glama connector.
 * Stateless: no session state is kept between requests.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { IncomingMessage, ServerResponse } from "node:http";
import { registerTools } from "./tools.js";

const VERSION = "1.0.0";

const server = new McpServer({ name: "opencode-workbench", version: VERSION });
registerTools(server);

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined, // stateless
});

await server.connect(transport);

/**
 * Handle a single HTTP request. `body` is the pre-parsed JSON body (if any);
 * the Vercel adapter reads the request stream and passes it here.
 */
export async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  body?: unknown,
): Promise<void> {
  await transport.handleRequest(req, res, body);
}
