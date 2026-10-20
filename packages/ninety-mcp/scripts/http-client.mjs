// Calls a running /api/mcp with the official MCP client over streamable HTTP.
//   node scripts/http-client.mjs http://localhost:3000/api/mcp
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
const url = new URL(process.argv[2] ?? "http://localhost:3000/api/mcp");
const client = new Client({ name: "ninety-http-check", version: "1.0.0" });
await client.connect(new StreamableHTTPClientTransport(url));
const { tools } = await client.listTools();
console.log("tools:", tools.map((t) => t.name).join(", "));
const r = await client.callTool({ name: "schengen_check", arguments: { trips: [{ entry: "2026-05-01", exit: "2026-06-15" }, { entry: "2026-08-20", exit: "2026-09-30" }], on: "2026-10-19" } });
const a = JSON.parse(r.content[0].text);
console.log("schengen_check:", "isError", r.isError, "daysUsed", a.daysUsed, "daysLeft", a.daysLeft);
const e = await client.callTool({ name: "ees_reconcile", arguments: {} }).catch((x) => ({ thrown: String(x) }));
console.log("ees_reconcile with no input:", "isError", e.isError, (e.content?.[0]?.text ?? e.thrown).slice(0, 120));
await client.close();
if (tools.length !== 3 || a.daysUsed !== 88 || a.daysLeft !== 2) process.exit(1);
