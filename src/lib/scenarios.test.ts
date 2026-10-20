import { describe, expect, it } from "vitest";
import { evaluate } from "./schengen/engine";
import { readdirSync } from "node:fs";
import { reconcile } from "./ees/reconcile";
import { SCENARIOS, SCENARIO_ORDER, scenarioById, scenarioHref, scenarioTrips } from "./scenarios";

describe("scenario links", () => {
  it("finds known scenarios and nothing else", () => {
    expect(scenarioById("open-stay")?.id).toBe("open-stay");
    expect(scenarioById("constructor")).toBeNull();
    expect(scenarioById("nope")).toBeNull();
    expect(scenarioById(null)).toBeNull();
    expect(scenarioById("demo")?.id).toBe("near-limit");
  });
  it("gives stable trip ids", () => {
    expect(scenarioTrips(SCENARIOS["near-limit"]).map((t) => t.id)).toEqual(["scenario-near-limit-1", "scenario-near-limit-2"]);
  });
  it("each scenario reads as its title says", () => {
    const open = evaluate(scenarioTrips(SCENARIOS["open-stay"]), "2026-10-19");
    expect(open.daysUsed).toBe(19);
    expect(open.latestExit).toBe("2026-12-29");
    expect(evaluate(scenarioTrips(SCENARIOS["near-limit"]), "2026-10-19").daysUsed).toBe(88);
    expect(evaluate(scenarioTrips(SCENARIOS.overstay), "2026-10-19").overstays.length).toBeGreaterThan(0);
  });

  it("the new scenarios read as their cards say", () => {
    expect(evaluate(scenarioTrips(SCENARIOS["same-day"]), "2026-10-19").daysUsed).toBe(12);
    const span = reconcile(scenarioTrips(SCENARIOS["cutoff-span"]), { daysUsed: 0, on: "2026-05-01" });
    expect([span.preCutoffDays.length, span.eesComparableDaysUsed, span.codes]).toEqual([20, 0, ["ees-ignores-pre-cutoff-stay"]]);
    const mixed = reconcile(scenarioTrips(SCENARIOS["cutoff-mixed"]), { daysUsed: 10, on: "2026-05-01" });
    expect([mixed.preCutoffDays.length, mixed.eesComparableDaysUsed, mixed.codes]).toEqual([20, 10, ["ees-ignores-pre-cutoff-stay"]]);
    const over = evaluate(scenarioTrips(SCENARIOS.overstay), "2026-10-19").overstays[0];
    expect([over.from, over.to, over.days]).toEqual(["2026-08-30", "2026-09-15", 17]);
  });
});

describe("scenario gallery", () => {
  it("shows six scenarios, each guarded by a TestSprite plan that exists", () => {
    expect(SCENARIO_ORDER).toHaveLength(6);
    const plans = new Set(readdirSync("testsprite_tests/plans").map((f) => f.split("-")[0]));
    for (const id of SCENARIO_ORDER) {
      expect(SCENARIOS[id].guardedBy.length, id).toBeGreaterThan(0);
      for (const ts of SCENARIOS[id].guardedBy) expect(plans.has(ts), `${id}: ${ts}`).toBe(true);
    }
  });
  it("opens EES scenarios on the EES check", () => {
    expect(scenarioHref(SCENARIOS["cutoff-span"])).toBe("/ees?scenario=cutoff-span");
    expect(scenarioHref(SCENARIOS["open-stay"])).toBe("/?scenario=open-stay");
  });
});
