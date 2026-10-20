// MCP 2025-06-18, Tools, error handling: an unknown tool is a protocol error (-32602), as on /api/mcp.
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const server = fileURLToPath(new URL("../dist/server.mjs", import.meta.url));

test("tools/call with an unknown name is a -32602 error, not a tool result", async () => {
  const client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [server] }));
  try {
    await assert.rejects(client.callTool({ name: "nope", arguments: {} }), (e) => e.code === -32602 && /Unknown tool: nope/.test(e.message));
  } finally {
    await client.close();
  }
});
