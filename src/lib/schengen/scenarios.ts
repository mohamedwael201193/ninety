import type { StayInput } from "./engine";
import type { IsoDate } from "./dates";

/**
 * Fixed scenarios used by the parity page. Dates are taken from the Commission
 * user manual (updated 2024 examples) and from the calculator's own "Ex. KOM"
 * cases, plus boundary cases (exact 90, day 91, re-entry after a full 90,
 * same-day stay, same-day turnaround, and a date just after a DST change).
 */
export type ParityScenario = {
  id: string;
  stays: StayInput[];
  on: IsoDate;
};

export const PARITY_SCENARIOS: ParityScenario[] = [
  {
    id: "no-previous-stay",
    stays: [],
    on: "2024-06-01",
  },
  {
    id: "manual-14-jun-2024",
    stays: [
      { entry: "2024-01-01", exit: "2024-01-01" },
      { entry: "2024-06-01", exit: "2024-06-14" },
    ],
    on: "2024-06-14",
  },
  {
    id: "manual-entry-19-jun-2024",
    stays: [
      { entry: "2024-01-01", exit: "2024-01-10" },
      { entry: "2024-03-01", exit: "2024-03-30" },
      { entry: "2024-05-01", exit: "2024-06-09" },
    ],
    on: "2024-06-19",
  },
  {
    id: "manual-entry-7-aug-2024",
    stays: [
      { entry: "2024-01-01", exit: "2024-01-10" },
      { entry: "2024-03-01", exit: "2024-03-30" },
      { entry: "2024-05-01", exit: "2024-06-09" },
    ],
    on: "2024-08-07",
  },
  {
    id: "manual-last-day-29-aug-2024",
    stays: [
      { entry: "2024-01-01", exit: "2024-01-01" },
      { entry: "2024-06-01", exit: "2024-08-29" },
    ],
    on: "2024-08-29",
  },
  {
    id: "calculator-example-kom-1-1",
    stays: [
      { entry: "2013-10-27", exit: "2013-11-06" },
      { entry: "2013-12-28", exit: "2014-01-09" },
      { entry: "2014-03-06", exit: "2014-03-15" },
    ],
    on: "2014-03-15",
  },
  {
    id: "same-day-stay",
    stays: [{ entry: "2024-10-27", exit: "2024-10-27" }],
    on: "2024-10-27",
  },
  {
    id: "day-after-spring-dst",
    stays: [{ entry: "2024-03-30", exit: "2024-03-31" }],
    on: "2024-04-01",
  },
  {
    id: "same-day-turnaround",
    stays: [
      { entry: "2024-05-01", exit: "2024-05-10" },
      { entry: "2024-05-10", exit: "2024-05-12" },
    ],
    on: "2024-05-12",
  },
  {
    id: "exact-90-days",
    stays: [{ entry: "2024-01-01", exit: "2024-03-30" }],
    on: "2024-03-30",
  },
  {
    id: "day-91-overstay",
    stays: [{ entry: "2024-01-01", exit: "2024-03-31" }],
    on: "2024-03-31",
  },
  {
    id: "reentry-after-full-90",
    stays: [{ entry: "2024-01-01", exit: "2024-03-30" }],
    on: "2024-07-01",
  },
  {
    id: "entry-refused-next-day",
    stays: [{ entry: "2024-01-01", exit: "2024-03-30" }],
    on: "2024-03-31",
  },
  {
    id: "overstay-through-15-apr",
    stays: [{ entry: "2024-01-01", exit: "2024-04-15" }],
    on: "2024-04-15",
  },
];
