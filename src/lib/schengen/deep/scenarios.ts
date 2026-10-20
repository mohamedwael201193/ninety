/**
 * Deterministic histories for the deep Commission parity check.
 *
 * The seed fixes the random histories. Hand-built ones cover leap days, EU clock
 * changes, 10 April 2026, overlaps, open stays, same-day re-entry, 90 and 91 days,
 * year boundaries and long histories. The original 14 parity scenarios are included.
 *
 * `domain: "in"` means the Commission form can calculate this input (an open stay is
 * entered as ending on the control date, which is the only exit the form allows).
 * `domain: "out"` means the form rejects it or cannot represent it.
 */
import { addDays, formatIso, parseIso, type IsoDate } from "../dates";
import type { StayInput } from "../engine";
import { PARITY_SCENARIOS } from "../scenarios";

export const DEEP_SEED = 20261020;
export const RANDOM_HISTORIES = 240;

export type DeepScenario = {
  id: string;
  group: string;
  stays: StayInput[];
  /** Stays typed into the Commission form, when they differ from `stays`. */
  calculatorStays?: StayInput[];
  on: IsoDate;
  domain: "in" | "out";
  note?: string;
};

const EARLIEST = parseIso("2013-04-22");
const LATEST = parseIso("2030-12-31");

function stays(rows: [string, string | null][]): StayInput[] {
  return rows.map(([entry, exit]) => ({ entry, exit }));
}

function scenario(
  id: string,
  group: string,
  rows: [string, string | null][],
  on: IsoDate,
  extra: Partial<Pick<DeepScenario, "domain" | "note" | "calculatorStays">> = {},
): DeepScenario {
  return { id, group, stays: stays(rows), on, domain: extra.domain ?? "in", note: extra.note, calculatorStays: extra.calculatorStays };
}

/** Sunday = 0, from the UTC day number (1970-01-01 was a Thursday). */
function sundayBased(iso: IsoDate): number {
  return (parseIso(iso) + 4) % 7;
}

/** Last Sunday of March (month 3) or October (month 10): the EU clock-change day. */
export function lastSunday(year: number, month: 3 | 10): IsoDate {
  const last = month === 3 ? `${year}-03-31` : `${year}-10-31`;
  return addDays(last, -sundayBased(last));
}

function kom(id: string, rows: [string, string][], on: string, extra: Partial<DeepScenario> = {}): DeepScenario {
  return scenario(id, "commission-example", rows, on, extra);
}

function handScenarios(): DeepScenario[] {
  const out: DeepScenario[] = [];

  for (const s of PARITY_SCENARIOS) {
    out.push({ id: s.id, group: "existing-14", stays: s.stays, on: s.on, domain: "in" });
  }

  // The calculator page's own Example menu, apart from KOM 1.1 which is already above.
  out.push(kom("kom-1-2", [["2013-10-27", "2013-11-06"], ["2013-12-28", "2014-01-09"], ["2014-03-06", "2014-05-10"]], "2014-05-10"));
  out.push(kom("kom-1-3", [["2013-10-27", "2013-11-06"], ["2013-12-28", "2014-01-09"], ["2014-03-06", "2014-05-21"]], "2014-05-21"));
  out.push(kom("kom-1-4", [["2012-10-27", "2012-11-06"], ["2012-12-28", "2013-01-09"], ["2013-03-06", "2013-05-21"]], "2013-08-01", {
    domain: "out",
    note: "Built-in example KOM 1.4 uses 2012 stays. The script refuses any stay before 22 April 2013.",
  }));
  out.push(kom("kom-2-1", [["2013-08-14", "2013-08-30"], ["2013-12-15", "2014-02-01"]], "2014-02-01"));
  out.push(kom("kom-2-2", [["2013-08-14", "2013-08-30"], ["2013-12-15", "2014-02-25"]], "2014-02-26"));
  out.push(kom("kom-2-3", [["2013-08-14", "2013-08-30"], ["2013-12-15", "2014-03-13"]], "2014-03-14"));
  out.push(kom("kom-2-4", [["2013-08-14", "2013-08-30"], ["2013-12-15", "2014-06-22"]], "2014-06-22"));
  out.push(kom("kom-3", [["2014-01-01", "2014-01-15"], ["2014-02-15", "2014-04-30"]], "2014-06-30"));
  out.push(kom("kom-4", [["2013-08-14", "2013-08-30"], ["2013-12-15", "2014-03-14"]], "2014-06-10"));
  out.push(kom("kom-5", [["2014-01-01", "2014-01-15"], ["2014-02-15", "2014-04-30"]], "2014-08-12"));
  out.push(kom("kom-overstay-1", [["2013-08-14", "2013-08-30"], ["2013-10-15", "2014-06-10"]], "2014-06-10"));
  out.push(kom("kom-overstay-2", [["2013-06-13", "2013-08-13"], ["2013-10-13", "2013-11-14"]], "2014-06-10"));
  out.push(kom("kom-overstay-3", [["2013-09-20", "2013-12-20"], ["2013-03-19", "2014-06-16"]], "2014-06-17", {
    domain: "out",
    note: "Built-in example Overstay 3 lists a March 2013 stay after a September stay, and that March stay is before 22 April 2013.",
  }));
  out.push(scenario("kom-inconsistance-1", "outside-domain", [["2013-09-20", "2013-12-20"], ["2014-06-16", "2014-03-19"]], "2014-06-17", {
    domain: "out",
    note: "Built-in example Inconsistance 1 has a valid stay and a reversed one. The script refuses the whole form. Ninety rejects the reversed trip and still counts the valid one.",
  }));

  for (const year of [2016, 2020, 2024, 2028]) {
    const leap = `${year}-02-29`;
    out.push(scenario(`leap-${year}-on-the-day`, "leap", [[leap, leap]], leap));
    out.push(scenario(`leap-${year}-last-day-in-window`, "leap", [[leap, leap]], addDays(leap, 179), {
      note: "29 February is still inside the 180-day window (the window starts on that day).",
    }));
    out.push(scenario(`leap-${year}-day-after-window`, "leap", [[leap, leap]], addDays(leap, 180), {
      note: "29 February has left the 180-day window.",
    }));
    const entry = addDays(leap, -89);
    out.push(scenario(`leap-${year}-exactly-90-ending-on-leap-day`, "leap", [[entry, leap]], leap));
    out.push(scenario(`leap-${year}-day-91-past-leap-day`, "exact-91", [[entry, addDays(leap, 1)]], addDays(leap, 1)));
    out.push(scenario(`leap-${year}-stay-across-the-day`, "leap", [[addDays(leap, -1), addDays(leap, 1)]], addDays(leap, 1)));
  }

  for (const year of [2023, 2025, 2026, 2027]) {
    const feb28 = `${year}-02-28`;
    out.push(scenario(`non-leap-${year}-28-feb`, "leap", [[feb28, feb28]], feb28, {
      note: "28 February in a year that is not a leap year.",
    }));
    const entry = addDays(feb28, -89);
    out.push(scenario(`non-leap-${year}-exactly-90-ending-28-feb`, "exact-90", [[entry, feb28]], feb28));
  }

  for (const year of [2023, 2024, 2025, 2026, 2027, 2028]) {
    for (const month of [3, 10] as const) {
      const change = lastSunday(year, month);
      const season = month === 3 ? "spring" : "autumn";
      out.push(scenario(`dst-${season}-${change}-on-the-day`, "dst", [[change, change]], change, {
        note: `EU ${season} clock change, ${change}.`,
      }));
      const from = addDays(change, -2);
      const to = addDays(change, 2);
      out.push(scenario(`dst-${season}-${change}-stay-across`, "dst", [[from, to]], to, {
        note: `A stay from two days before the ${season} clock change to two days after.`,
      }));
    }
  }

  out.push(scenario("ees-entirely-before", "ees-cutoff", [["2026-03-20", "2026-04-09"]], "2026-04-10", {
    note: "The stay ends the day before 10 April 2026. The 90/180 calculator does not treat that date specially.",
  }));
  out.push(scenario("ees-cutoff-day-only", "ees-cutoff", [["2026-04-10", "2026-04-10"]], "2026-04-10"));
  out.push(scenario("ees-starts-on-cutoff", "ees-cutoff", [["2026-04-10", "2026-04-20"]], "2026-04-20"));
  out.push(scenario("ees-day-after-cutoff", "ees-cutoff", [["2026-04-11", "2026-04-20"]], "2026-05-01"));
  out.push(scenario("ees-stay-crosses-cutoff", "ees-cutoff", [["2026-04-01", "2026-04-20"]], "2026-04-20", {
    note: "The stay runs across 10 April 2026. Both the script and Ninety count every day of it.",
  }));
  out.push(scenario("ees-stay-crosses-cutoff-later", "ees-cutoff", [["2026-04-01", "2026-04-20"]], "2026-05-01"));
  {
    const exit = "2026-04-10";
    const entry = addDays(exit, -89);
    out.push(scenario("ees-exactly-90-ending-on-cutoff", "ees-cutoff", [[entry, exit]], exit));
    out.push(scenario("ees-day-91-ending-after-cutoff", "exact-91", [[entry, addDays(exit, 1)]], addDays(exit, 1)));
  }

  out.push(scenario("overlap-first-and-second", "overlap", [["2024-03-01", "2024-03-20"], ["2024-03-10", "2024-03-30"]], "2024-04-10", {
    note: "The script never compares the first stay with the second, so it accepts this overlap and counts distinct days.",
  }));
  out.push(scenario("overlap-second-inside-first", "overlap", [["2024-03-01", "2024-03-30"], ["2024-03-10", "2024-03-20"]], "2024-04-10", {
    note: "The second stay sits inside the first. The script does not reject that pair.",
  }));
  out.push(scenario("overlap-same-entry", "overlap", [["2024-03-01", "2024-03-10"], ["2024-03-01", "2024-03-20"]], "2024-04-01", {
    note: "Both stays start the same day. The script does not reject the first pair.",
  }));
  out.push(scenario("overlap-then-a-later-stay", "overlap", [["2024-03-01", "2024-03-20"], ["2024-03-10", "2024-03-25"], ["2024-04-10", "2024-04-20"]], "2024-05-01", {
    note: "Only the first and second stays overlap. The third starts after the second ends, which is the pair the script does check.",
  }));
  out.push(scenario("overlap-overstay-two-trips", "overlap", [["2024-01-01", "2024-04-05"], ["2024-03-25", "2024-04-10"]], "2024-04-10", {
    note: "The script does not reject an overlap of the first two rows, then prints one overstay per row: 31 Mar–5 Apr (6 days) and 31 Mar–10 Apr (11 days). The 6 days sit inside the 11. Ninety lists those 11 days once.",
  }));
  out.push(scenario("overlap-overstay-entered-as-one-stay", "overlap", [["2024-01-01", "2024-04-10"]], "2024-04-10", {
    note: "The same days as the overlapping pair, entered as one stay. The script prints a single overstay of 11 days.",
  }));
  out.push(scenario("overlap-second-and-third", "outside-domain", [["2024-01-01", "2024-01-10"], ["2024-03-01", "2024-03-20"], ["2024-03-10", "2024-03-30"]], "2024-04-15", {
    domain: "out",
    note: "The second and third stays overlap. The script rejects that pair and does not calculate.",
  }));
  out.push(scenario("overlap-all-three-rows", "outside-domain", [["2024-03-01", "2024-03-20"], ["2024-03-15", "2024-03-28"], ["2024-03-25", "2024-04-05"]], "2024-04-10", {
    domain: "out",
    note: "The third stay overlaps the second, so the script rejects the form.",
  }));

  const openNote = "Open stay. The Commission form requires an exit, so it is entered as ending on the control date.";
  function open(id: string, entry: string, on: IsoDate, prior: [string, string][] = []): void {
    out.push(scenario(id, "open-stay", [...prior, [entry, null]], on, {
      note: openNote,
      calculatorStays: stays([...prior, [entry, on]]),
    }));
  }
  open("open-short", "2024-03-01", "2024-04-10");
  open("open-exactly-90", "2024-01-01", "2024-03-30");
  open("open-day-91", "2024-01-01", "2024-03-31");
  open("open-across-leap-day", "2024-02-20", "2024-03-05");
  open("open-across-new-year", "2024-12-20", "2025-01-10");
  open("open-across-ees-cutoff", "2026-04-01", "2026-04-15");
  open("open-on-spring-clock-change", "2026-03-20", "2026-03-29");
  open("open-after-a-previous-stay", "2024-03-01", "2024-04-01", [["2024-01-01", "2024-01-10"]]);
  open("open-one-day", "2025-07-01", "2025-07-01");

  out.push(scenario("same-day-reentry-two-stays", "same-day", [["2024-05-01", "2024-05-10"], ["2024-05-10", "2024-05-12"]], "2024-05-12"));
  out.push(scenario("same-day-reentry-three-stays", "same-day", [["2024-05-01", "2024-05-05"], ["2024-05-05", "2024-05-05"], ["2024-05-05", "2024-05-08"]], "2024-05-08"));
  out.push(scenario("same-day-two-identical-days", "same-day", [["2024-05-01", "2024-05-01"], ["2024-05-01", "2024-05-01"]], "2024-05-01", {
    note: "Two stays that are the same single day. The script treats a same-day exit and re-entry as one day.",
  }));
  out.push(scenario("same-day-reentry-on-day-90", "same-day", [["2025-01-01", "2025-03-31"], ["2025-03-31", "2025-04-02"]], "2025-04-02", {
    note: "The shared day is the 90th day (2025 is not a leap year: 31 + 28 + 31 = 90).",
  }));
  out.push(scenario("consecutive-days-not-the-same-day", "same-day", [["2024-05-01", "2024-05-10"], ["2024-05-11", "2024-05-15"]], "2024-05-15"));
  out.push(scenario("same-day-reentry-after-a-gap", "same-day", [["2024-01-01", "2024-01-10"], ["2024-04-01", "2024-04-05"], ["2024-04-05", "2024-04-08"]], "2024-04-08"));

  for (const start of ["2023-06-01", "2024-01-01", "2024-03-31", "2024-10-03", "2024-12-31", "2025-01-01", "2025-11-01", "2026-07-01", "2027-01-15"]) {
    const exit90 = addDays(start, 89);
    const exit91 = addDays(start, 90);
    out.push(scenario(`exactly-90-from-${start}`, "exact-90", [[start, exit90]], exit90));
    out.push(scenario(`day-after-90-from-${start}`, "exact-90", [[start, exit90]], addDays(exit90, 1), {
      note: "Control date is the day after a 90-day stay. Entry is refused while those days remain in the window.",
    }));
    out.push(scenario(`exactly-91-from-${start}`, "exact-91", [[start, exit91]], exit91));
  }
  out.push(scenario("exactly-90-as-three-stays", "exact-90", [["2025-01-01", "2025-01-30"], ["2025-03-01", "2025-03-30"], ["2025-05-01", "2025-05-30"]], "2025-05-30", {
    note: "30 + 30 + 30 days, all still inside one 180-day window.",
  }));
  out.push(scenario("exactly-90-as-45-and-45", "exact-90", [["2025-02-01", "2025-03-17"], ["2025-04-01", "2025-05-15"]], "2025-05-15"));
  out.push(scenario("eighty-nine-days", "exact-90", [["2025-01-01", "2025-03-30"]], "2025-03-30", {
    note: "89 days in a non-leap year (31 + 28 + 30). One day left.",
  }));
  out.push(scenario("exactly-91-as-two-stays", "exact-91", [["2025-01-01", "2025-02-14"], ["2025-03-01", "2025-04-16"]], "2025-04-16"));

  for (const [entry, exit, on] of [
    ["2024-12-20", "2025-01-10", "2025-01-10"],
    ["2025-12-20", "2026-01-05", "2026-01-05"],
    ["2027-12-28", "2028-01-03", "2028-01-03"],
    ["2024-12-31", "2024-12-31", "2024-12-31"],
    ["2025-01-01", "2025-01-01", "2025-01-01"],
    ["2025-12-31", "2025-12-31", "2025-12-31"],
    ["2026-01-01", "2026-01-01", "2026-01-01"],
  ] as const) {
    out.push(scenario(`year-boundary-${entry}-to-${exit}-on-${on}`, "year-boundary", [[entry, exit]], on));
  }
  out.push(scenario("year-boundary-december-then-january-control", "year-boundary", [["2024-12-01", "2024-12-31"]], "2025-01-01"));
  out.push(scenario("year-boundary-two-stays", "year-boundary", [["2024-11-01", "2024-11-20"], ["2025-01-05", "2025-01-15"]], "2025-01-15"));
  {
    const entry = "2024-07-05";
    out.push(scenario("year-boundary-last-day-of-window", "year-boundary", [[entry, entry]], addDays(entry, 179)));
    out.push(scenario("year-boundary-day-after-window", "year-boundary", [[entry, entry]], addDays(entry, 180)));
  }
  out.push(scenario("year-boundary-ninety-ending-31-dec", "year-boundary", [["2024-10-03", "2024-12-31"]], "2024-12-31", {
    note: "3 October to 31 December is 90 days (29 + 30 + 31).",
  }));

  out.push(longStay("long-30-short-stays", "2022-03-01", 30, 2, 9));
  out.push(longStay("long-50-one-day-stays", "2024-01-01", 50, 1, 5));
  out.push(longStay("long-12-stays-that-overstay", "2023-01-01", 12, 20, 15));
  out.push(longStay("long-across-four-years", "2018-06-01", 16, 7, 70));

  out.push(scenario("refusal-exit-before-entry", "refusal", [["2024-05-10", "2024-05-01"]], "2024-06-01", {
    note: "The exit is before the entry. The script stops, and Ninety rejects the trip.",
  }));
  out.push(scenario("refusal-second-trip-reversed", "outside-domain", [["2024-01-01", "2024-01-05"], ["2024-03-10", "2024-03-01"]], "2024-04-01", {
    domain: "out",
    note: "One reversed trip makes the script refuse the whole form, including the valid trip beside it. Ninety rejects the reversed trip and still counts the valid one.",
  }));
  out.push(scenario("first-legal-entry-22-apr-2013", "early-rule", [["2013-04-22", "2013-04-22"]], "2013-04-22", {
    note: "22 April 2013 is the earliest stay the script will calculate.",
  }));
  out.push(scenario("new-definition-18-oct-2013", "early-rule", [["2013-10-18", "2013-10-20"]], "2013-10-20", {
    note: "18 October 2013 is the day the script's help text says the current short-stay definition started.",
  }));

  out.push(scenario("outside-before-22-apr-2013", "outside-domain", [["2013-04-21", "2013-04-25"]], "2013-05-01", {
    domain: "out",
    note: "The script refuses stays before 22 April 2013. Ninety has no such cutoff.",
  }));
  out.push(scenario("outside-exit-after-control", "outside-domain", [["2024-05-01", "2024-05-20"]], "2024-05-10", {
    domain: "out",
    note: "The exit is after the control date. The script refuses. Ninety counts the stay.",
  }));
  out.push(scenario("outside-control-during-a-stay", "outside-domain", [["2024-06-01", "2024-06-30"]], "2024-06-15", {
    domain: "out",
    note: "A control date in the middle of a stay is an exit after the control date, which the script refuses.",
  }));
  out.push(scenario("outside-unsorted", "outside-domain", [["2024-05-01", "2024-05-10"], ["2024-03-01", "2024-03-10"]], "2024-06-01", {
    domain: "out",
    note: "Stays are not in entry order. The script asks to sort them; the reference run declines, as the page's confirm dialog would when answered no.",
  }));
  out.push(scenario("outside-51-stays", "outside-domain", fiftyOne(), "2024-06-20", {
    domain: "out",
    note: "The form has 50 stay rows. A 51st stay is not read.",
  }));
  out.push(scenario("outside-future-open-stay", "outside-domain", [["2024-08-01", null]], "2024-07-01", {
    domain: "out",
    note: "An open stay that starts after the control date. The form cannot store an empty exit, and Ninety rejects a trip that starts after today with no exit.",
  }));

  return out;
}

function longStay(id: string, start: IsoDate, count: number, length: number, gapAfter: number): DeepScenario {
  const rows: [string, string][] = [];
  let cursor = parseIso(start);
  for (let i = 0; i < count; i += 1) {
    const entry = formatIso(cursor);
    const exit = formatIso(cursor + length - 1);
    rows.push([entry, exit]);
    cursor += length + gapAfter;
  }
  const on = rows[rows.length - 1][1];
  return scenario(id, "long-history", rows, on, {
    note: `${count} stays, built from ${start}, ${length} day(s) each, ${gapAfter} day(s) apart.`,
  });
}

function fiftyOne(): [string, string][] {
  const rows: [string, string][] = [];
  let cursor = parseIso("2024-01-01");
  for (let i = 0; i < 51; i += 1) {
    rows.push([formatIso(cursor), formatIso(cursor)]);
    cursor += 3;
  }
  return rows;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ri(rand: () => number, lo: number, hi: number): number {
  return lo + Math.floor(rand() * (hi - lo + 1));
}

const ANCHORS = [
  "2024-02-29", "2028-02-29", "2020-02-29", "2025-02-28", "2023-02-28",
  "2024-03-31", "2025-03-30", "2026-03-29", "2027-03-28", "2028-03-26",
  "2024-10-27", "2025-10-26", "2026-10-25", "2027-10-31",
  "2026-04-10", "2026-04-09", "2026-04-11",
  "2024-12-31", "2025-01-01", "2025-12-31", "2026-01-01", "2023-12-31",
  "2013-04-22", "2013-10-18", "2014-01-01", "2019-12-31",
];

function randomScenarios(): DeepScenario[] {
  const rand = mulberry32(DEEP_SEED);
  const out: DeepScenario[] = [];
  for (let i = 0; i < RANDOM_HISTORIES; i += 1) {
    const kind = i % 10;
    const anchor = ANCHORS[i % ANCHORS.length];
    let cursor = kind === 1
      ? parseIso(anchor) - ri(rand, 0, 50)
      : parseIso("2014-01-01") + ri(rand, 0, 3800);
    if (cursor < EARLIEST) cursor = EARLIEST;
    const count = kind === 0 ? ri(rand, 12, 28) : ri(rand, 1, 8);
    const open = kind === 3;
    const sameDayHeavy = kind === 4;
    const longStayBias = kind === 2;
    const rows: { entry: number; exit: number }[] = [];
    for (let n = 0; n < count; n += 1) {
      const span = longStayBias && n === count - 1 ? ri(rand, 60, 120) : 1 + Math.floor(rand() * (rand() < 0.25 ? 90 : 28));
      const entry = cursor;
      const exit = entry + span - 1;
      if (exit > LATEST) break;
      rows.push({ entry, exit });
      const sameDay = sameDayHeavy ? rand() < 0.5 : rand() < 0.08;
      const gap = sameDay ? 0 : 1 + Math.floor(rand() * (kind === 0 ? 25 : 70));
      cursor = exit + gap;
    }
    if (rows.length === 0) continue;
    const last = rows[rows.length - 1];
    let on = last.exit + (rand() < 0.45 ? 0 : ri(rand, 0, 160));
    if (on > LATEST) on = last.exit;
    const closed: StayInput[] = rows.map((row) => ({ entry: formatIso(row.entry), exit: formatIso(row.exit) }));
    const id = `r-${DEEP_SEED}-${String(i).padStart(3, "0")}`;
    if (open) {
      on = Math.max(on, last.exit);
      const engine: StayInput[] = closed.map((stay, index) => (
        index === closed.length - 1 ? { entry: stay.entry, exit: null } : stay
      ));
      const calculator: StayInput[] = closed.map((stay, index) => (
        index === closed.length - 1 ? { entry: stay.entry, exit: formatIso(on) } : stay
      ));
      out.push({
        id,
        group: "random",
        stays: engine,
        calculatorStays: calculator,
        on: formatIso(on),
        domain: "in",
        note: "Open stay. The Commission form requires an exit, so it is entered as ending on the control date.",
      });
    } else {
      out.push({ id, group: "random", stays: closed, on: formatIso(on), domain: "in" });
    }
  }
  return out;
}

function assertInDomain(s: DeepScenario): void {
  if (s.domain !== "in") return;
  const form = s.calculatorStays ?? s.stays;
  if (form.length < 1 && s.stays.length > 0) throw new Error(`${s.id}: empty form`);
  if (form.length > 50) throw new Error(`${s.id}: more than 50 stays`);
  let previousExit: number | null = null;
  form.forEach((stay, index) => {
    if (stay.exit === null) throw new Error(`${s.id}: form stay ${index} has no exit`);
    const entry = parseIso(stay.entry);
    const exit = parseIso(stay.exit);
    if (entry < EARLIEST) throw new Error(`${s.id}: stay before 22 April 2013`);
    if (exit < entry) {
      if (s.group !== "refusal") throw new Error(`${s.id}: exit before entry`);
      return;
    }
    if (exit > parseIso(s.on)) throw new Error(`${s.id}: exit after control`);
    if (previousExit !== null && entry < previousExit && index !== 1) {
      throw new Error(`${s.id}: overlap the script rejects`);
    }
    previousExit = exit;
  });
  if (s.calculatorStays) {
    if (s.calculatorStays.length !== s.stays.length) throw new Error(`${s.id}: stay count differs`);
    s.stays.forEach((stay, index) => {
      const formStay = s.calculatorStays![index];
      if (formStay.entry !== stay.entry) throw new Error(`${s.id}: entry differs`);
      if (stay.exit === null) {
        if (formStay.exit !== s.on) throw new Error(`${s.id}: open stay was not closed on the control date`);
      } else if (formStay.exit !== stay.exit) throw new Error(`${s.id}: exit differs`);
    });
  }
}

export function buildDeepScenarios(): DeepScenario[] {
  const all = [...handScenarios(), ...randomScenarios()];
  const ids = new Set<string>();
  for (const s of all) {
    if (ids.has(s.id)) throw new Error(`Duplicate scenario id ${s.id}`);
    ids.add(s.id);
    assertInDomain(s);
  }
  return all;
}

export const DEEP_SCENARIOS: DeepScenario[] = buildDeepScenarios();

/** A fixed sample replayed against the live page. One from each hand-built group, plus the original 14. */
export const LIVE_SAMPLE_IDS: string[] = [
  "kom-2-4",
  "kom-overstay-1",
  "leap-2024-last-day-in-window",
  "leap-2024-day-after-window",
  "dst-spring-2026-03-29-stay-across",
  "dst-autumn-2026-10-25-on-the-day",
  "ees-stay-crosses-cutoff",
  "ees-exactly-90-ending-on-cutoff",
  "overlap-first-and-second",
  "overlap-overstay-two-trips",
  "open-exactly-90",
  "open-day-91",
  "same-day-reentry-on-day-90",
  "exactly-90-from-2024-12-31",
  "exactly-91-from-2025-01-01",
  "day-after-90-from-2024-01-01",
  "year-boundary-2024-12-20-to-2025-01-10-on-2025-01-10",
  "long-50-one-day-stays",
  "refusal-exit-before-entry",
  "eighty-nine-days",
];
