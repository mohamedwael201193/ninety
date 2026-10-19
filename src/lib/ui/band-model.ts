import { addDays, type IsoDate } from "@/lib/schengen/dates";
import { closeStays, evaluate, isPresentOn } from "@/lib/schengen/engine";
import { scenarioTrips, type Scenario } from "@/lib/scenarios";

/** The landing page's sample history when no scenario is open (the same two trips the hero phone shows). */
export const SAMPLE_ON: IsoDate = "2026-10-19";
export const SAMPLE_TRIPS = [
  { entry: "2026-06-02", exit: "2026-06-30" },
  { entry: "2026-08-19", exit: "2026-09-14" },
] as const;

export type BandModel = {
  /** "example" for the sample history, otherwise the scenario id. */
  source: "example" | string;
  label: string;
  on: IsoDate;
  used: number;
  left: number;
  /** 180 flags, oldest first; the last one is `on`. True where a day counts. */
  days: boolean[];
};

/** The numbers and the 180-day strip for the "Every day of the last 180" band, computed by the engine. */
export function bandModel(scenario: Scenario | null): BandModel {
  const on = scenario?.on ?? SAMPLE_ON;
  const trips = scenario ? scenarioTrips(scenario) : SAMPLE_TRIPS.map((t) => ({ ...t }));
  const assessment = evaluate(trips, on, on);
  const { stays } = closeStays(trips, on);
  const days = Array.from({ length: 180 }, (_, i) => isPresentOn(stays, addDays(on, i - 179)));
  return {
    source: scenario ? scenario.id : "example",
    label: scenario ? `Demo scenario: ${scenario.title}, read on ${on}` : `Example history, read on ${on}`,
    on,
    used: assessment.daysUsed,
    left: assessment.daysLeft,
    days,
  };
}
