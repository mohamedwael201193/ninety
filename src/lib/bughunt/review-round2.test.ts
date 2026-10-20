/** Round 2 of the independent Cursor review, reproduced here (one block per finding, 09 to 14). */
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import proof from "@/data/proof.json";
import { PARITY_SCENARIOS } from "@/lib/schengen/scenarios";
import { reconcile } from "@/lib/ees/reconcile";
import { buildCorrectionLetter } from "@/lib/letter/letter";
import { handleMcp } from "@/lib/api/mcp-http";
import { OPENAPI } from "@/lib/api/openapi";

const ID = { fullName: "Ana Test", dateOfBirth: "1990-01-01", nationality: "Brazilian", documentNumber: "X1", email: "a@example.com", memberState: "France" };
const mcp = (body: unknown, headers: Record<string, string> = {}) => handleMcp(new Request("http://x/api/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream", ...headers }, body: JSON.stringify(body) }));

describe("09: /proof names only parity scenarios and unit tests that exist", () => {
  it("every parity id in proof.json is a scenario and every unit test name is in its file", () => {
    const known = new Set(PARITY_SCENARIOS.map((s) => s.id));
    const missing: string[] = [];
    for (const rule of proof.rules) {
      for (const id of rule.parity) if (!known.has(id)) missing.push(`${rule.id} parity ${id}`);
      for (const unit of rule.unit) {
        const text = existsSync(unit.file) ? readFileSync(unit.file, "utf8") : "";
        if (!text.includes(`"${unit.name}"`)) missing.push(`${rule.id} unit ${unit.file} :: ${unit.name}`);
      }
    }
    expect(missing).toEqual([]);
  });
});

describe("10: an open stay with an earlier EES exit is an exit disagreement, not a missing entry", () => {
  it("open trip from 06-01, EES 06-01..06-10, on 06-20", () => {
    const claim = { daysUsed: 10, on: "2026-06-20", records: [{ entry: "2026-06-01", exit: "2026-06-10" }] };
    const open = reconcile([{ entry: "2026-06-01", exit: null }], claim);
    const closed = reconcile([{ entry: "2026-06-01", exit: "2026-06-20" }], claim);
    expect(open.codes).toEqual(closed.codes);
    expect(open.codes).not.toContain("likely-missing-entry");
  });
});

describe("11: no letter when the figures match", () => {
  it("buildCorrectionLetter refuses a match", () => {
    const r = reconcile([{ entry: "2026-06-01", exit: "2026-06-10" }], { daysUsed: 10, on: "2026-06-30" });
    expect(r.codes).toEqual(["match"]);
    expect(() => buildCorrectionLetter(ID, r)).toThrow(/nothing to correct/);
  });
});

describe("12: an unsupported MCP-Protocol-Version gets 400 (MCP 2025-06-18, streamable HTTP)", () => {
  it("1999-01-01 is 400; 2025-03-26 and no header are 200", async () => {
    const msg = { jsonrpc: "2.0", id: 1, method: "tools/list" };
    expect((await mcp(msg, { "mcp-protocol-version": "1999-01-01" })).status).toBe(400);
    expect((await mcp(msg, { "mcp-protocol-version": "2025-03-26" })).status).toBe(200);
    expect((await mcp(msg)).status).toBe(200);
  });
});

describe("13: a request id must not be null (MCP 2025-06-18 base protocol)", () => {
  it("id:null is a -32600 error with no result", async () => {
    const body = await (await mcp({ jsonrpc: "2.0", id: null, method: "tools/list" })).json();
    expect(body.result).toBeUndefined();
    expect(body.error?.code).toBe(-32600);
  });
});

describe("14: the OpenAPI identity schema states the limits the API enforces", () => {
  it("nationality and memberState 60, email 200", () => {
    const p = (OPENAPI.paths["/api/v1/letter"].post.requestBody.content["application/json"].schema as { properties: { identity: { properties: Record<string, { maxLength?: number }> } } }).properties.identity.properties;
    expect([p.nationality.maxLength, p.memberState.maxLength, p.email.maxLength]).toEqual([60, 60, 200]);
  });
});
