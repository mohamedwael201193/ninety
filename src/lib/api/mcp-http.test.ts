import { describe, expect, it } from "vitest";
import { handleMcp } from "./mcp-http";

const post = (body: unknown) => handleMcp(new Request("http://x/api/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify(body) }));

describe("MCP over streamable HTTP (/api/mcp)", () => {
  it("initializes, lists the three tools and calls schengen_check with the same answer as the API", async () => {
    const init = await (await post({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } } })).json();
    expect(init.result.protocolVersion).toBe("2025-06-18");
    expect((await post({ jsonrpc: "2.0", method: "notifications/initialized" })).status).toBe(202);
    const list = await (await post({ jsonrpc: "2.0", id: 2, method: "tools/list" })).json();
    expect(list.result.tools.map((t: { name: string }) => t.name)).toEqual(["schengen_check", "ees_reconcile", "article52_letter"]);
    const call = await (await post({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "schengen_check", arguments: { trips: [{ entry: "2026-05-01", exit: "2026-06-15" }, { entry: "2026-08-20", exit: "2026-09-30" }], on: "2026-10-19" } } })).json();
    expect(call.result.isError).toBe(false);
    expect(JSON.parse(call.result.content[0].text)).toMatchObject({ daysUsed: 88, daysLeft: 2 });
  });

  it("bad input is a tool error naming the field; unknown tool and method are JSON-RPC errors; bad JSON is -32700", async () => {
    const bad = await (await post({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "schengen_check", arguments: { trips: [{ entry: "nope", exit: "2026-01-01" }], on: "2026-10-19" } } })).json();
    expect(bad.result.isError).toBe(true);
    expect(bad.result.content[0].text).toContain("trips.0.entry");
    expect((await (await post({ jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "nope" } })).json()).error.code).toBe(-32602);
    expect((await (await post({ jsonrpc: "2.0", id: 6, method: "nope" })).json()).error.code).toBe(-32601);
    const r = await handleMcp(new Request("http://x/api/mcp", { method: "POST", body: "{" }));
    expect(r.status).toBe(400);
    expect((await r.json()).error.code).toBe(-32700);
  });

  it("GET is 405 (stateless, no stream), OPTIONS is 204 with CORS", async () => {
    expect((await handleMcp(new Request("http://x/api/mcp"))).status).toBe(405);
    const o = await handleMcp(new Request("http://x/api/mcp", { method: "OPTIONS" }));
    expect(o.status).toBe(204);
    expect(o.headers.get("access-control-allow-origin")).toBe("*");
  });
});

describe("JSON-RPC 2.0 edge cases on /api/mcp", () => {
  it("an empty batch is one Invalid Request error (JSON-RPC 2.0, section 6), not an empty 202", async () => {
    const r = await post([]);
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid Request" } });
  });
  it("a batch of a request and a notification answers only the request", async () => {
    const r = await (await post([{ jsonrpc: "2.0", id: 9, method: "ping" }, { jsonrpc: "2.0", method: "notifications/initialized" }])).json();
    expect(r).toEqual([{ jsonrpc: "2.0", id: 9, result: {} }]);
  });
  it("a non-object batch entry is an Invalid Request entry", async () => {
    const r = await (await post([1])).json();
    expect(r).toEqual([{ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid Request" } }]);
  });
});
