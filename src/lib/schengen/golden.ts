import type { IsoDate } from "./dates";
import type { StayInput } from "./engine";

/**
 * Boundary cases worked out by hand before either calculator was run. Each one is a different
 * situation (its `why` says which), and each states what the European Commission's calculator
 * prints for it, word for word. `golden.test.ts` checks Ninety and the stored calculator against
 * every field; /parity runs them against the live calculator.
 */
export type GoldenScenario = {
  id: string;
  name: string;
  stays: StayInput[];
  /**
   * What the Commission calculator is given, when it cannot take the same input. Its form needs
   * an exit for every stay, so an open stay is entered as ending on the control date.
   */
  calculatorStays?: StayInput[];
  on: IsoDate;
  expect: {
    daysUsed?: number;
    daysLeft?: number;
    latestExit?: IsoDate | null;
    overstay?: { from: IsoDate; to: IsoDate; days: number; windowStart: IsoDate; daysInWindow: number };
    /** Both tools refuse to count the history. */
    refused?: string;
    /** First date a new entry is allowed (the public API's nextLegalEntry), and the days allowed then. */
    nextEntry?: { on: IsoDate; daysLeft: number };
  };
  /** Sentences the Commission calculator prints for this history, exactly. */
  calculatorSays: string[];
  /** The situation, and how the answer was worked out. Unique per scenario. */
  why: string;
  /** An answer we first wrote down and got wrong, kept so the correction is on record. */
  firstExpected?: { answer: string; mistake: string };
};

export const GOLDEN_SCENARIOS: GoldenScenario[] = [
  {
    id: "overlapping-trips",
    name: "Two trips that overlap",
    stays: [{ entry: "2024-03-01", exit: "2024-03-20" }, { entry: "2024-03-10", exit: "2024-03-30" }],
    on: "2024-04-10",
    expect: { daysUsed: 30, daysLeft: 60, latestExit: "2024-06-08" },
    calculatorSays: ["Possible stay until 08/06/24", "The stay may be authorised for up to: 60 day(s)"],
    why: "Overlap: 1–20 March and 10–30 March cover 30 distinct days, not 41. 90 − 30 = 60, and a stay from 10 April for 60 days ends on 8 June.",
  },
  {
    id: "open-stay-through-today",
    name: "Still inside, no exit yet",
    stays: [{ entry: "2024-03-01", exit: null }],
    calculatorStays: [{ entry: "2024-03-01", exit: "2024-04-10" }],
    on: "2024-04-10",
    expect: { daysUsed: 41, daysLeft: 49, latestExit: "2024-05-29" },
    calculatorSays: ["Possible stay until 29/05/24", "The stay may be authorised for up to: 49 day(s)"],
    why: "Open stay: present since 1 March, so 31 March days and 10 April days count through the control date (41). The 90th day of the stay is 29 May.",
  },
  {
    id: "refused-until-first-day-leaves",
    name: "Entry refused, and the date it is allowed again",
    stays: [{ entry: "2024-01-01", exit: "2024-02-14" }, { entry: "2024-03-01", exit: "2024-04-14" }],
    on: "2024-04-20",
    expect: { daysUsed: 90, daysLeft: 0, nextEntry: { on: "2024-06-29", daysLeft: 45 } },
    calculatorSays: ["A stay may not be authorised.", "At 29/06/24 a stay may be authorized for 45 days", "The stay may be authorised for up to: 0 day(s)"],
    why: "The calculator refusing a stay: 45 + 45 = 90 used. 1 January leaves the window on 29 June (day 181 of 2024 minus 179 is 2 January). From then each new day replaces a January–February day, for 45 days.",
  },
  {
    id: "spring-clock-change-2026",
    name: "Control date on the spring 2026 clock change",
    stays: [{ entry: "2026-03-20", exit: "2026-03-29" }],
    on: "2026-03-29",
    expect: { daysUsed: 10, daysLeft: 80, latestExit: "2026-06-17" },
    calculatorSays: ["Possible stay until 17/06/26", "The stay may be authorised for up to: 80 day(s)"],
    why: "Clock change: 29 March 2026 is the 23-hour day in the EU. 20–29 March is 10 days, 80 left, and 29 March + 80 days is 17 June.",
  },
  {
    id: "leap-day-last-day-in-window",
    name: "29 Feb 2024 still counts on 26 Aug",
    stays: [{ entry: "2024-02-29", exit: "2024-02-29" }],
    on: "2024-08-26",
    expect: { daysUsed: 1, daysLeft: 90, latestExit: "2024-11-23" },
    calculatorSays: ["Possible stay until 23/11/24", "The stay may be authorised for up to: 90 day(s)"],
    why: "Leap day on its last day in the window: 26 Aug minus 179 days is 29 Feb, so 1 day is used, yet 90 are left because 29 Feb leaves the window the next day.",
  },
  {
    id: "leap-day-left-window",
    name: "29 Feb 2024 has left by 27 Aug",
    stays: [{ entry: "2024-02-29", exit: "2024-02-29" }],
    on: "2024-08-27",
    expect: { daysUsed: 0, daysLeft: 90, latestExit: "2024-11-24" },
    calculatorSays: ["Possible stay until 24/11/24", "The stay may be authorised for up to: 90 day(s)"],
    why: "Leap day out of the window: on 27 Aug the window starts on 1 March, so nothing is used and the 90th day of a new stay is 24 November.",
  },
  {
    id: "exit-before-entry-refused",
    name: "A trip whose exit is before its entry",
    stays: [{ entry: "2024-03-20", exit: "2024-03-01" }],
    on: "2024-04-10",
    expect: { refused: "Trip 1 ends before it starts." },
    calculatorSays: ["The stay with entering date 20/03/24 is later than the exit date 01/03/24", "Calculation of stay is not possible"],
    why: "Impossible input: an exit on 1 March for an entry on 20 March. Neither tool counts it; the calculator stops, and Ninety names the trip.",
  },
  {
    id: "old-days-leave-during-the-stay",
    name: "30 old days leave the window during the new stay",
    stays: [{ entry: "2024-01-01", exit: "2024-01-30" }],
    on: "2024-06-20",
    expect: { daysUsed: 30, daysLeft: 90, latestExit: "2024-09-17" },
    calculatorSays: ["Possible stay until 17/09/24", "The stay may be authorised for up to: 90 day(s)"],
    why: "Rolling window inside the stay: 30 January days are used on 20 June, but from 29 June one leaves per day, so the total never passes 39 and a full 90-day stay (to 17 September) is allowed, not 60.",
  },
  {
    id: "exit-and-entry-on-consecutive-days",
    name: "Exit one day, enter again the next",
    stays: [{ entry: "2024-05-01", exit: "2024-05-10" }, { entry: "2024-05-11", exit: "2024-05-20" }],
    on: "2024-05-25",
    expect: { daysUsed: 20, daysLeft: 70, latestExit: "2024-08-02" },
    calculatorSays: ["Possible stay until 02/08/24", "The stay may be authorised for up to: 70 day(s)"],
    why: "Back-to-back trips: 10 + 10 days with no day shared and none missing, 70 left, so a stay from 25 May runs to 2 August.",
  },
  {
    id: "stay-across-ees-cutoff",
    name: "A stay across 10 April 2026",
    stays: [{ entry: "2026-04-01", exit: "2026-04-20" }],
    on: "2026-05-01",
    expect: { daysUsed: 20, daysLeft: 70, latestExit: "2026-07-09" },
    calculatorSays: ["Possible stay until 09/07/26", "The stay may be authorised for up to: 70 day(s)"],
    why: "The EES start date does not touch the 90/180 count: 1–20 April 2026 is 20 days whether or not part of it was before 10 April. (Only the EES comparison treats that stay differently.)",
  },
  {
    id: "two-stays-add-up-to-93",
    name: "Two stays that add up to 93 days",
    stays: [{ entry: "2023-03-01", exit: "2023-04-01" }, { entry: "2023-05-01", exit: "2023-06-30" }],
    on: "2024-02-01",
    expect: { overstay: { from: "2023-06-28", to: "2023-06-30", days: 3, windowStart: "2023-01-02", daysInWindow: 93 } },
    calculatorSays: ["Days of stay in the 180-days period from 02/01/23 to 30/06/23: 93 day(s)", "Overstay in the period from 28/06/23 to 30/06/23 (3 days)"],
    why: "A past overstay found by counting both stays together: 32 + 61 = 93 days in the window ending 30 June 2023, so its last 3 days were over.",
    firstExpected: {
      answer: "90 days left on 2024-02-01",
      mistake: "We first wrote this down as two old stays that had both left the window, and missed that together they were 93 days in one window. The calculator and Ninety both report the 3-day overstay; the fixture was corrected before it went in.",
    },
  },
  {
    id: "overlap-overstay-counted-once",
    name: "Overlapping trips that overstay",
    stays: [{ entry: "2024-01-01", exit: "2024-04-05" }, { entry: "2024-03-25", exit: "2024-04-10" }],
    calculatorStays: [{ entry: "2024-01-01", exit: "2024-04-10" }],
    on: "2024-04-10",
    expect: { overstay: { from: "2024-03-31", to: "2024-04-10", days: 11, windowStart: "2023-10-14", daysInWindow: 101 } },
    calculatorSays: ["Days of stay in the 180-days period from 14/10/23 to 10/04/24: 101 day(s)", "Overstay in the period from 31/03/24 to 10/04/24 (11 days)"],
    why: "Overstay across overlapping trips, pinned from the differential fuzzer (seed 20261019, run 14, reduced to two trips): 1 January to 10 April is 101 distinct days, so days 91 to 101 (31 March to 10 April) are over, 11 days, listed once.",
  },
];
