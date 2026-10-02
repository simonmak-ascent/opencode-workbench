/**
 * Stateless Streamable HTTP entrypoint for the OpenCode Workbench MCP server.
 *
 * The stdio transport (index.ts) remains the local/package entrypoint; this
 * module reuses the same registered tools and exposes them as a stateless
 * JSON-RPC handler for hosting (Vercel `api/mcp.js`) and Glama connector
 * listings. No session state is kept between requests.
 *
 * We deliberately do NOT use StreamableHTTPServerTransport here: its per-request
 * state breaks across serverless cold starts. Instead we drive the tools through
 * an in-memory MCP client, which is deterministic and stateless.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { registerTools } from "./tools.js";

const VERSION = "1.0.0";
const NAME = "opencode-workbench";

const server = new McpServer({ name: NAME, version: VERSION });
registerTools(server);

const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
await server.connect(serverTransport);
const client = new Client({ name: `${NAME}-http`, version: VERSION });
await client.connect(clientTransport);

type RpcMessage = {
  jsonrpc?: string;
  id?: number | string | null;
  method?: string;
  params?: Record<string, unknown>;
};

/**
 * Handle a single JSON-RPC message. Returns the JSON-RPC response object, or
 * `null` for notifications (which produce no response).
 */
export async function handleJsonRpc(message: RpcMessage): Promise<unknown | null> {
  const method = message?.method;
  const id = message?.id ?? null;
  const params = (message?.params ?? {}) as Record<string, unknown>;

  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: (params.protocolVersion as string) || "2025-06-18",
        capabilities: { tools: { listChanged: true } },
        serverInfo: { name: NAME, version: VERSION },
      },
    };
  }

  if (method === "notifications/initialized" || method === "notifications/cancelled") {
    return null;
  }

  if (method === "ping") {
    return { jsonrpc: "2.0", id, result: {} };
  }

  if (method === "tools/list") {
    return { jsonrpc: "2.0", id, result: await client.listTools() };
  }

  if (method === "tools/call") {
    const name = params.name as string;
    const args = (params.arguments ?? {}) as Record<string, unknown>;
    const result = await client.callTool({ name, arguments: args });
    return { jsonrpc: "2.0", id, result };
  }

  return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
}
