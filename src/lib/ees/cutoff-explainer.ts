import { SCENARIOS, scenarioHref, scenarioTrips } from "@/lib/scenarios";
import { EES_CUTOFF, reconcile } from "./reconcile";

export type CutoffExample = {
  scenarioId: "cutoff-span" | "cutoff-mixed";
  stays: string;
  eesDaysUsed: number;
  leftOut: number;
  compared: number;
  matches: boolean;
  href: string;
};

const EXAMPLES = [
  { scenarioId: "cutoff-span", stays: "1 to 20 April 2026", eesDaysUsed: 0 },
  { scenarioId: "cutoff-mixed", stays: "1 to 20 March and 15 to 24 April 2026", eesDaysUsed: 10 },
] as const;

/** The two worked examples on the cutoff card, computed by the reconciler itself. */
export function cutoffExamples(): CutoffExample[] {
  return EXAMPLES.map(({ scenarioId, stays, eesDaysUsed }) => {
    const scenario = SCENARIOS[scenarioId];
    const result = reconcile(scenarioTrips(scenario), { daysUsed: eesDaysUsed, on: scenario.on });
    return {
      scenarioId,
      stays,
      eesDaysUsed,
      leftOut: result.preCutoffDays.length,
      compared: result.eesComparableDaysUsed,
      matches: result.eesComparableDaysUsed === eesDaysUsed,
      href: scenarioHref(scenario),
    };
  });
}

export { EES_CUTOFF };
