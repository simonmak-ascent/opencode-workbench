import { handleJsonRpc } from "../mcp-server/dist/http.js";

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version");
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method === "GET") {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send("OpenCode Workbench MCP — Streamable HTTP. POST JSON-RPC to this endpoint.");
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, DELETE, OPTIONS");
    res.status(405).end();
    return;
  }

  try {
    const body = await readBody(req);

    if (Array.isArray(body)) {
      const out = [];
      for (const m of body) {
        const r = await handleJsonRpc(m);
        if (r !== null) out.push(r);
      }
      res.setHeader("Content-Type", "application/json");
      res.status(out.length ? 200 : 202).json(out.length ? out : undefined);
      return;
    }

    const result = await handleJsonRpc(body);
    if (result === null) {
      res.status(202).end();
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(result);
  } catch (err) {
    res.setHeader("Content-Type", "application/json");
    res.status(500).json({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32603, message: `Internal error: ${err && err.message ? err.message : String(err)}` },
    });
  }
}
