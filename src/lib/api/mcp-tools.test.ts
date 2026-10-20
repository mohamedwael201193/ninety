import { describe, expect, it } from "vitest";
import { callTool, TOOLS } from "./mcp-tools";

describe("MCP tools", () => {
  it("are the three named tools, each with an object input schema", () => {
    expect(TOOLS.map((t) => t.name)).toEqual(["schengen_check", "ees_reconcile", "article52_letter"]);
    for (const t of TOOLS) expect(t.inputSchema).toMatchObject({ type: "object" });
  });
  it("schengen_check returns the engine's answer", () => {
    const r = callTool("schengen_check", { trips: [{ entry: "2026-05-01", exit: "2026-06-15" }, { entry: "2026-08-20", exit: "2026-09-30" }], on: "2026-10-19" });
    expect(r.isError).toBe(false);
    expect(JSON.parse(r.content[0].text)).toMatchObject({ daysUsed: 88, daysLeft: 2 });
  });
  it("flags invalid input and unknown tools as errors", () => {
    expect(callTool("schengen_check", { trips: "no" }).isError).toBe(true);
    expect(callTool("nope", {}).isError).toBe(true);
  });
});
