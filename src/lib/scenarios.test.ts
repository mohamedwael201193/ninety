import { describe, expect, it } from "vitest";
import { evaluate } from "./schengen/engine";
import { SCENARIOS, scenarioById, scenarioTrips } from "./scenarios";

describe("scenario links", () => {
  it("finds known scenarios and nothing else", () => {
    expect(scenarioById("open-stay")?.id).toBe("open-stay");
    expect(scenarioById("constructor")).toBeNull();
    expect(scenarioById("nope")).toBeNull();
    expect(scenarioById(null)).toBeNull();
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
});
