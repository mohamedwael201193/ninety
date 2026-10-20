import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PARITY_SCENARIOS } from "@/lib/schengen/scenarios";
import { RULES, proofSummary } from "./rules";

const shortIds = new Set(readdirSync("testsprite_tests/plans").map((f) => f.split("-")[0]));

describe("rule-to-test matrix", () => {
  it.each(RULES.map((r) => [r.id, r] as const))("%s names unit tests that exist", (_id, rule) => {
    expect(rule.unit.length).toBeGreaterThan(0);
    for (const ref of rule.unit) {
      expect(readFileSync(ref.file, "utf8"), `${ref.file}: "${ref.name}"`).toContain(`"${ref.name}"`);
    }
  });

  it("names only parity scenarios the Commission calculator runs", () => {
    const known = new Set(PARITY_SCENARIOS.map((s) => s.id));
    for (const rule of RULES) for (const id of rule.parity) expect(known.has(id), `${rule.id}: ${id}`).toBe(true);
  });

  it("names only TestSprite tests that have a plan, and every rule has one", () => {
    for (const rule of RULES) {
      expect(rule.testsprite.length, rule.id).toBeGreaterThan(0);
      for (const ts of rule.testsprite) expect(shortIds.has(ts), `${rule.id}: ${ts}`).toBe(true);
    }
  });

  it("covers every parity scenario with at least one rule", () => {
    const used = new Set(RULES.flatMap((r) => r.parity));
    const missing = PARITY_SCENARIOS.map((s) => s.id).filter((id) => !used.has(id));
    expect(missing).toEqual([]);
  });

  it("summarises only the TestSprite tests that have a latest run, and names the rest", () => {
    const rules = [
      { testsprite: [{ id: "TS01", latest: { verdict: "passed" } }, { id: "TS02", latest: { verdict: "failed" } }] },
      { testsprite: [{ id: "TS01", latest: { verdict: "passed" } }, { id: "TS30", latest: null }] },
    ];
    expect(proofSummary(rules)).toEqual({ tests: 3, ran: 2, passed: 1, notRun: ["TS30"] });
  });
});
