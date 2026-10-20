import { describe, expect, it } from "vitest";
import { GOLDEN_SCENARIOS } from "./golden";
import { checkGolden, parityFromHtml, spanOf } from "./parity";
import { PARITY_SCENARIOS } from "./scenarios";
import { runCommissionScenario } from "./commission-reference";
import { COMMISSION_CALCULATOR_URL } from "./commission-reference";
import { VENDORED_HTML } from "./vendor/commission-calculator";

describe("hand-worked boundary cases", () => {
  it("each one is a different situation: no two share a why, an id or a name", () => {
    for (const key of ["why", "id", "name"] as const) {
      const values = GOLDEN_SCENARIOS.map((g) => g[key].trim().toLowerCase());
      const repeated = values.filter((v, i) => values.indexOf(v) !== i);
      expect(repeated, `repeated ${key}`).toEqual([]);
    }
    const parityIds = new Set(PARITY_SCENARIOS.map((s) => s.id));
    expect(GOLDEN_SCENARIOS.filter((g) => parityIds.has(g.id))).toEqual([]);
  });

  it.each(GOLDEN_SCENARIOS.map((g) => [g.id, g] as const))("%s: Ninety and the Commission calculator both give the hand-worked answer", (_id, g) => {
    const row = checkGolden(VENDORED_HTML, g);
    expect(row.problems).toEqual([]);
    expect(row.match).toBe(true);
  });

  it("the 93-day fixture: the answer first written down (90 left) is wrong, and the check says so", () => {
    const g = GOLDEN_SCENARIOS.find((s) => s.id === "two-stays-add-up-to-93")!;
    expect(g.firstExpected?.answer).toBe("90 days left on 2024-02-01");
    const wrong = checkGolden(VENDORED_HTML, { ...g, expect: { daysLeft: 90 }, calculatorSays: [] });
    expect(wrong.match).toBe(false);
    expect(wrong.problems.join(" ")).toMatch(/overstay/i);
  });

  it("a wrong hand answer or a sentence the calculator never printed fails the check", () => {
    const g = GOLDEN_SCENARIOS.find((s) => s.id === "overlapping-trips")!;
    expect(checkGolden(VENDORED_HTML, { ...g, expect: { ...g.expect, daysLeft: 59 } }).match).toBe(false);
    expect(checkGolden(VENDORED_HTML, { ...g, calculatorSays: ["Possible stay until 09/06/24"] }).match).toBe(false);
  });
});

describe("span-level parity on the 14 scenarios", () => {
  it("every row carries Ninety's latest legal day or overstay window, and the calculator's own sentence for it", () => {
    const report = parityFromHtml(VENDORED_HTML, COMMISSION_CALCULATOR_URL);
    expect(report.rows).toHaveLength(14);
    for (const row of report.rows ?? []) {
      expect(row.span?.ours, row.scenario).toMatch(/^(latest legal day \d{4}-\d{2}-\d{2}|overstay |entry refused)/);
      expect(row.span?.theirs, row.scenario).not.toBe("none");
    }
    expect(report.golden?.every((g) => g.match)).toBe(true);
  });

  it("the 14 Jun 2024 manual example: latest legal day 2024-08-29 (1 Jan leaves on 29 Jun, so 1 June + 89 days), and the calculator says the same date", () => {
    const s = PARITY_SCENARIOS.find((x) => x.id === "manual-14-jun-2024")!;
    const span = spanOf(s, runCommissionScenario(VENDORED_HTML, s.stays, s.on).control);
    expect(span.ours).toBe("latest legal day 2024-08-29");
    expect(span.theirs).toContain("29/08/24");
  });
});
