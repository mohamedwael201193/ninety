/**
 * MCP over streamable HTTP, stateless: each POST is one JSON-RPC message answered with JSON.
 * Same TOOLS and callTool as the stdio server in packages/ninety-mcp.
 */
import { TOOLS, callTool } from "./mcp-tools";

export const MCP_PROTOCOL = "2025-06-18";
const SUPPORTED = ["2025-06-18", "2025-03-26", "2024-11-05"];

type Msg = { jsonrpc?: string; id?: string | number | null; method?: string; params?: Record<string, unknown> };
const ok = (id: Msg["id"], result: unknown) => ({ jsonrpc: "2.0", id: id ?? null, result });
const err = (id: Msg["id"], code: number, message: string) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });

/** One JSON-RPC message in, the reply out (null for a notification, which gets 202). */
export function rpc(msg: Msg, inBatch = false): object | null {
  if (!msg || typeof msg !== "object" || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") return err(msg?.id, -32600, "Invalid Request");
  if (msg.id === undefined) return null;
  // MCP 2025-06-18 base protocol: unlike JSON-RPC, a request id MUST be a string or a number, never null.
  if (msg.params !== undefined && (msg.params === null || typeof msg.params !== "object")) return err(msg.id, -32602, "params must be an object");
  if (typeof msg.id !== "string" && typeof msg.id !== "number") return { jsonrpc: "2.0", error: { code: -32600, message: "Request id must be a string or a number." } };
  // MCP 2025-03-26 lifecycle: initialize MUST NOT be part of a batch.
  if (inBatch && msg.method === "initialize") return err(msg.id, -32600, "initialize must not be sent in a batch");
  switch (msg.method) {
    case "initialize": {
      const asked = String(msg.params?.protocolVersion ?? "");
      return ok(msg.id, { protocolVersion: SUPPORTED.includes(asked) ? asked : MCP_PROTOCOL, capabilities: { tools: { listChanged: false } }, serverInfo: { name: "ninety", version: "1.0.0" } });
    }
    case "ping": return ok(msg.id, {});
    case "tools/list": return ok(msg.id, { tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) });
    case "tools/call": {
      const name = msg.params?.name;
      if (typeof name !== "string" || !TOOLS.some((t) => t.name === name)) return err(msg.id, -32602, `Unknown tool: ${String(name)}`);
      return ok(msg.id, callTool(name, msg.params?.arguments));
    }
    default: return err(msg.id, -32601, `Method not found: ${msg.method}`);
  }
}

const HEADERS = { "content-type": "application/json", "cache-control": "no-store", "access-control-allow-origin": "*", "access-control-allow-headers": "content-type, mcp-protocol-version, mcp-session-id, accept", "access-control-allow-methods": "POST, GET, DELETE, OPTIONS" };

export async function handleMcp(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: HEADERS });
  if (request.method !== "POST") return new Response(JSON.stringify(err(null, -32000, "Method not allowed: this server is stateless, POST JSON-RPC")), { status: 405, headers: { ...HEADERS, allow: "POST, OPTIONS" } });
  // Streamable HTTP: an invalid or unsupported MCP-Protocol-Version header MUST get 400 (no header: assume the default).
  const version = request.headers.get("mcp-protocol-version");
  if (version !== null && !SUPPORTED.includes(version)) return new Response(JSON.stringify(err(null, -32600, `Unsupported MCP-Protocol-Version: ${version}. Supported: ${SUPPORTED.join(", ")}.`)), { status: 400, headers: HEADERS });
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > 65536) return new Response(JSON.stringify(err(null, -32600, "Body over 64 KB")), { status: 413, headers: HEADERS });
  const text = new TextDecoder().decode(bytes);
  let body: unknown;
  try { body = JSON.parse(text); } catch { return new Response(JSON.stringify(err(null, -32700, "Parse error")), { status: 400, headers: HEADERS }); }
  // JSON-RPC 2.0, section 6: an empty batch is a single Invalid Request error.
  if (Array.isArray(body) && body.length === 0) return new Response(JSON.stringify(err(null, -32600, "Invalid Request")), { status: 200, headers: HEADERS });
  if (Array.isArray(body)) {
    // MCP 2025-06-18 removed batching: under that version the body MUST be a single message.
    if (version === "2025-06-18") return new Response(JSON.stringify(err(null, -32600, "Batches are not supported in MCP 2025-06-18; send one message per request.")), { status: 400, headers: HEADERS });
    const out = body.map((m) => rpc(m as Msg, true)).filter((r) => r !== null);
    return out.length ? new Response(JSON.stringify(out), { status: 200, headers: HEADERS }) : new Response(null, { status: 202, headers: HEADERS });
  }
  const r = rpc(body as Msg);
  return r === null ? new Response(null, { status: 202, headers: HEADERS }) : new Response(JSON.stringify(r), { status: 200, headers: HEADERS });
}
