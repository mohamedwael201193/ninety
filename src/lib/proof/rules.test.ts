import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PARITY_SCENARIOS } from "@/lib/schengen/scenarios";
import { RULES, proofSummary, suiteSummary } from "./rules";
import proof from "@/data/proof.json";

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

  it("the proof data covers the whole cloud suite, not only the tests tied to a rule (was 25/25 against a 35-test suite)", () => {
    const ids = JSON.parse(readFileSync("testsprite_tests/test-ids.json", "utf8")) as Record<string, string>;
    const suite = (proof as { suite?: { id: string }[] }).suite ?? [];
    expect(suite.map((t) => t.id).sort()).toEqual(Object.keys(ids).map((k) => k.split("-")[0]).sort());
  });

  it("suiteSummary counts passed out of the tests that ran, and names the ones that did not", () => {
    expect(suiteSummary([{ id: "TS01", latest: { verdict: "passed" } }, { id: "TS02", latest: { verdict: "failed" } }, { id: "TS03", latest: null }]))
      .toEqual({ tests: 3, ran: 2, passed: 1, notRun: ["TS03"] });
  });

  it("every suite test carries its plan name, so /proof can list the ones not tied to a rule", () => {
    const suite = (proof as { suite: { id: string; plan: string; name?: string }[] }).suite;
    for (const t of suite) expect(t.name, t.id).toBe(JSON.parse(readFileSync(`testsprite_tests/plans/${t.plan}.json`, "utf8")).name);
    const tied = new Set(proof.rules.flatMap((r) => r.testsprite.map((x) => x.id)));
    expect(suite.filter((t) => !tied.has(t.id)).map((t) => t.id).sort()).toEqual(["TC011", "TS05", "TS16", "TS36", "TS37", "TS40", "TS41", "TS53", "TS55", "TS56", "TS58", "TS59", "TS63", "TS64"]);
  });

  it("proof.json carries the same rules, tests and parity ids as rules.json (it once kept 36 dropped scenarios)", () => {
    const strip = (r: { id: string; rule: string; basis: string; unit: unknown; parity: unknown }) => ({ id: r.id, rule: r.rule, basis: r.basis, unit: r.unit, parity: r.parity });
    expect(proof.rules.map(strip)).toEqual(RULES.map(strip));
  });
});
