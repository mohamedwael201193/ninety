import type { IsoDate } from "./schengen/dates";
import type { Trip } from "./trips";

export type Scenario = {
  id: string;
  title: string;
  /** One line for the scenario gallery: what to look at. */
  shows: string;
  /** Where the gallery card opens it. */
  page: "/" | "/ees";
  /** TestSprite tests that drive this same history (shown as "guarded by" badges). */
  guardedBy: string[];
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
    shows: "An open stay counts through today: 19 used, latest legal exit 2026-12-29.",
    page: "/",
    guardedBy: ["TS28", "TS09", "TS10"],
    on: "2026-10-19",
    trips: [{ entry: "2026-10-01", exit: null }],
  },
  "near-limit": {
    id: "near-limit",
    title: "Two long stays: 88 of 90 days used",
    shows: "Two days left, and the same 88 days carried to the EES check and the letter.",
    page: "/",
    guardedBy: ["TS16", "TS18"],
    on: "2026-10-19",
    trips: [
      { entry: "2026-05-01", exit: "2026-06-15" },
      { entry: "2026-08-20", exit: "2026-09-30" },
    ],
  },
  overstay: {
    id: "overstay",
    title: "One stay of 107 days: an overstay",
    shows: "The overstay is named to the day: 2026-08-30 to 2026-09-15, 17 days.",
    page: "/",
    guardedBy: ["TS27"],
    on: "2026-10-19",
    trips: [{ entry: "2026-06-01", exit: "2026-09-15" }],
  },
  "same-day": {
    id: "same-day",
    title: "Out and back in on 10 May 2026",
    shows: "A same-day exit and re-entry counts 10 May once: 12 days, not 13.",
    page: "/",
    guardedBy: ["TS26"],
    on: "2026-10-19",
    trips: [
      { entry: "2026-05-01", exit: "2026-05-10" },
      { entry: "2026-05-10", exit: "2026-05-12" },
    ],
  },
  "cutoff-span": {
    id: "cutoff-span",
    title: "A stay that began on 1 April 2026, before the EES cutoff",
    shows: "Enter 0 as the EES figure: all 20 days are left out of the EES comparison, and no error is claimed.",
    page: "/ees",
    guardedBy: ["TS30"],
    on: "2026-05-01",
    trips: [{ entry: "2026-04-01", exit: "2026-04-20" }],
  },
  "cutoff-mixed": {
    id: "cutoff-mixed",
    title: "One stay before the EES cutoff, one after",
    shows: "Enter 10 as the EES figure: 20 days are left out, the 10 after the cutoff match.",
    page: "/ees",
    guardedBy: ["TS31"],
    on: "2026-05-01",
    trips: [
      { entry: "2026-03-01", exit: "2026-03-20" },
      { entry: "2026-04-15", exit: "2026-04-24" },
    ],
  },
};

/** Gallery order. */
export const SCENARIO_ORDER = ["open-stay", "near-limit", "overstay", "same-day", "cutoff-span", "cutoff-mixed"] as const;

/** The link a gallery card opens. */
export function scenarioHref(scenario: Scenario): string {
  return `${scenario.page}?scenario=${scenario.id}`;
}

/** Short names that open a scenario. `?scenario=demo` is the landing page's demo history. */
const ALIASES: Record<string, string> = { demo: "near-limit" };

export function scenarioById(raw: string | null): Scenario | null {
  if (!raw) return null;
  const id = Object.prototype.hasOwnProperty.call(ALIASES, raw) ? ALIASES[raw] : raw;
  return Object.prototype.hasOwnProperty.call(SCENARIOS, id) ? SCENARIOS[id] : null;
}

/** Trips for a scenario, with stable ids so links render the same every time. */
export function scenarioTrips(scenario: Scenario): Trip[] {
  return scenario.trips.map((trip, index) => ({ id: `scenario-${scenario.id}-${index + 1}`, ...trip }));
}
