import type { IsoDate } from "./schengen/dates";
import type { Trip } from "./trips";

export type Scenario = {
  id: string;
  title: string;
  /** The date the scenario is meant to be read on. Used as "today" unless ?today= is given. */
  on: IsoDate;
  trips: Omit<Trip, "id">[];
};

/**
 * Named demo histories, loadable with a shareable link such as
 * `/?scenario=open-stay`. They are shown without touching saved trips.
 */
export const SCENARIOS: Record<string, Scenario> = {
  "open-stay": {
    id: "open-stay",
    title: "Still in the Schengen area since 1 October 2026",
    on: "2026-10-19",
    trips: [{ entry: "2026-10-01", exit: null }],
  },
  "near-limit": {
    id: "near-limit",
    title: "Two long stays: 88 of 90 days used",
    on: "2026-10-19",
    trips: [
      { entry: "2026-05-01", exit: "2026-06-15" },
      { entry: "2026-08-20", exit: "2026-09-30" },
    ],
  },
  overstay: {
    id: "overstay",
    title: "One stay of 107 days: an overstay",
    on: "2026-10-19",
    trips: [{ entry: "2026-06-01", exit: "2026-09-15" }],
  },
};

export function scenarioById(id: string | null): Scenario | null {
  if (!id) return null;
  return Object.prototype.hasOwnProperty.call(SCENARIOS, id) ? SCENARIOS[id] : null;
}

/** Trips for a scenario, with stable ids so links render the same every time. */
export function scenarioTrips(scenario: Scenario): Trip[] {
  return scenario.trips.map((trip, index) => ({ id: `scenario-${scenario.id}-${index + 1}`, ...trip }));
}
