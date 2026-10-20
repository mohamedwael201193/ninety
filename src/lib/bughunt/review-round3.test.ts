/** Round 3 of the independent Cursor review, reproduced here (one block per finding; numbers are the review's). */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { PDFDocument } from "pdf-lib";
import { reconcile } from "@/lib/ees/reconcile";
import { buildCorrectionLetter } from "@/lib/letter/letter";
import { letterToPdf } from "@/lib/letter/pdf";
import { article52Letter, eesReconcile } from "@/lib/api/v1";
import { handle } from "@/lib/api/http";
import { handleMcp } from "@/lib/api/mcp-http";
import { OPENAPI } from "@/lib/api/openapi";

const ID = { fullName: "Jane Doe", dateOfBirth: "1990-05-04", nationality: "Egypt", documentNumber: "A1234567", email: "jane@example.com", memberState: "France" };
const font = new Uint8Array(readFileSync("public/fonts/NotoSans-Regular.ttf"));
const gapLetter = (identity = ID) => buildCorrectionLetter(identity, reconcile([{ entry: "2024-06-01", exit: "2024-06-10" }], { daysUsed: 14, on: "2024-06-30" }));
const mcp = (body: unknown, headers: Record<string, string> = {}) => handleMcp(new Request("http://x/api/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) }));

describe("R3-1: one stay entered as two rows (an internal border crossing) matches one EES record", () => {
  const ees = { daysUsed: 20, on: "2026-06-30", records: [{ entry: "2026-06-01", exit: "2026-06-20" }] };
  it.each([
    ["same-day split", [{ entry: "2026-06-01", exit: "2026-06-10" }, { entry: "2026-06-10", exit: "2026-06-20" }]],
    ["next-day split", [{ entry: "2026-06-01", exit: "2026-06-10" }, { entry: "2026-06-11", exit: "2026-06-20" }]],
  ])("%s: match, and no letter", (_n, trips) => {
    expect((eesReconcile({ trips, ees }).body as { codes: string[] }).codes).toEqual(["match"]);
    expect(article52Letter({ trips, ees, identity: ID }).status).toBe(422);
  });
  it("open EES entry: the stay ended on 06-20, not at the internal crossing on 06-10", () => {
    const r = reconcile([{ entry: "2026-06-01", exit: "2026-06-10" }, { entry: "2026-06-11", exit: "2026-06-20" }], { daysUsed: 30, on: "2026-06-30", records: [{ entry: "2026-06-01", exit: null }] });
    expect(r.explanation).toContain("The trips show an exit on 2026-06-20");
  });
});

describe("R3-2: a name the font cannot draw is refused, not written as \\u0000", () => {
  it.each(["李明", "Jane 😀"])("%s", async (name) => {
    await expect(letterToPdf(gapLetter({ ...ID, fullName: name }), font)).rejects.toThrow(/cannot draw/);
  });
  it("accented Latin names still render", async () => {
    const bytes = await letterToPdf(gapLetter({ ...ID, fullName: "Łukasz Żółć" }), font);
    const doc = await getDocument({ data: bytes, isEvalSupported: false } as Parameters<typeof getDocument>[0]).promise;
    const text = (await (await doc.getPage(1)).getTextContent()).items.map((i) => ("str" in i ? i.str : "")).join(" ");
    expect(text).toContain("Łukasz Żółć");
  });
});

describe("R3-4: no letter while the comparison has input errors (the API refuses with 422)", () => {
  it("a trip that cannot be counted", () => {
    const r = reconcile([{ entry: "2026-06-01", exit: "2026-06-10" }, { entry: "2026-07-01", exit: null }], { daysUsed: 20, on: "2026-06-30" });
    expect(r.errors.length).toBeGreaterThan(0);
    expect(() => buildCorrectionLetter(ID, r)).toThrow();
  });
});

describe("R3-5: line breaks and bidi controls in identity fields are refused", () => {
  const body = (identity: object) => ({ trips: [{ entry: "2026-06-01", exit: "2026-06-10" }], ees: { daysUsed: 20, on: "2026-06-30" }, identity: { ...ID, ...identity } });
  it.each([["fullName", "Jane Doe\n\nYours faithfully,\n\nMallory"], ["documentNumber", "A123\u202E7654"], ["memberState", "France\r\nCc: someone"]])("%s", (field, value) => {
    const r = article52Letter(body({ [field]: value }));
    expect(r.status).toBe(400);
    expect(JSON.stringify(r.body)).toContain(`identity.${field}`);
  });
});

describe("R3-6: the OpenAPI document states the date range, non-blank names and the same email rule as the API", () => {
  const schema = OPENAPI.paths["/api/v1/letter"].post.requestBody.content["application/json"].schema as unknown as { properties: { identity: { properties: Record<string, { minLength?: number; pattern?: string }> }; ees: { properties: { on: { pattern: string } } } } };
  it("1899-12-31 and 2200-01-01 fail the date pattern; 2026-06-30 passes", () => {
    const re = new RegExp(schema.properties.ees.properties.on.pattern);
    expect([re.test("1899-12-31"), re.test("2200-01-01"), re.test("2026-06-30")]).toEqual([false, false, true]);
  });
  it("fullName has minLength 1 and a non-blank pattern", () => {
    const f = schema.properties.identity.properties.fullName;
    expect(f.minLength).toBe(1);
    expect(new RegExp(f.pattern!).test(" ")).toBe(false);
  });
  it("an address the letter form accepts is accepted by the API", () => {
    const r = article52Letter({ trips: [{ entry: "2026-06-01", exit: "2026-06-10" }], ees: { daysUsed: 20, on: "2026-06-30" }, identity: { ...ID, email: "jürgen@münchen.de" } });
    expect(r.status).toBe(200);
  });
});

describe("R3-8: the PDF Author is the signer's name, not the identity paragraph", () => {
  it("Author is the full name", async () => {
    const doc = await PDFDocument.load(await letterToPdf(gapLetter(), font));
    expect(doc.getAuthor()).toBe("Jane Doe");
  });
});

describe("R3-11..15: JSON-RPC and HTTP conformance", () => {
  it("11: with MCP-Protocol-Version 2025-06-18 a batch is refused (the body must be one message)", async () => {
    const r = await mcp([{ jsonrpc: "2.0", id: 1, method: "ping" }, { jsonrpc: "2.0", id: 2, method: "ping" }], { "mcp-protocol-version": "2025-06-18" });
    expect(r.status).toBe(400);
  });
  it("12: initialize inside a batch is not executed (MCP 2025-03-26 lifecycle)", async () => {
    const r = await (await mcp([{ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "t", version: "0" } } }], { "mcp-protocol-version": "2025-03-26" })).json();
    expect(r[0].result).toBeUndefined();
    expect(r[0].error.code).toBe(-32600);
  });
  it("13: params that are not an object or array are Invalid params", async () => {
    const r = await (await mcp({ jsonrpc: "2.0", id: 1, method: "tools/call", params: "nope" })).json();
    expect(r.error).toEqual({ code: -32602, message: "params must be an object" });
  });
  it("14: an id that is not a string or number is not echoed back", async () => {
    const r = await (await mcp({ jsonrpc: "2.0", id: { a: 1 }, method: "ping" })).json();
    expect(r.id ?? null).toBe(null);
    expect(r.error.code).toBe(-32600);
  });
  it("15: media types are case-insensitive; application/jsonp is not JSON", async () => {
    const run = (ct: string) => handle(new Request("http://x", { method: "POST", headers: { "content-type": ct }, body: "{}" }), () => ({ status: 200, body: {} }));
    expect((await run("Application/JSON")).status).toBe(200);
    expect((await run("application/json; charset=utf-8")).status).toBe(200);
    expect((await run("application/jsonp")).status).toBe(415);
  });
});

describe("R3-16: GET on an API route is 405 with Allow and CORS", () => {
  it.each(["check", "ees-reconcile", "letter"])("/api/v1/%s", async (name) => {
    const mod = (await import(`@/app/api/v1/${name}/route`)) as { GET?: () => Response };
    expect(typeof mod.GET).toBe("function");
    const r = mod.GET!();
    expect(r.status).toBe(405);
    expect(r.headers.get("allow")).toBe("POST, OPTIONS");
    expect(r.headers.get("access-control-allow-origin")).toBe("*");
  });
});
