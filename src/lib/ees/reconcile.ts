/**
 * Compare a traveller's trips with the EU Entry/Exit System's days-used figure
 * and, when they are supplied, its entry/exit records.
 *
 * Presence days use the same calendar rules as the 90/180 engine: the entry
 * day and the exit day both count, and a day counts once. An EES record with
 * no exit is treated as still inside on the reference date, which is how a
 * missing exit inflates the days-used figure.
 */

import { days } from "../plural";
import { dateFormatError, formatIso, isIsoDate, parseIso, type IsoDate } from "../schengen/dates";
import { closeStays, daysUsedOn, type StayInput } from "../schengen/engine";

export type EesRecord = {
  entry: IsoDate;
  /** Null means the EES has an entry and no exit. */
  exit: IsoDate | null;
};

export type EesClaim = {
  /** Days-used figure stated by the EES for `on`. */
  daysUsed: number;
  on: IsoDate;
  /**
   * Records held by the EES. Omit this when only the days-used figure is known.
   * An empty array means the EES lists no crossings.
   */
  records?: EesRecord[];
};

export type DayDifference = {
  date: IsoDate;
  side: "traveller-only" | "ees-only";
};

export type MismatchCode =
  | "match"
  | "figure-differs"
  | "likely-missing-exit"
  | "likely-missing-entry"
  | "exit-dates-disagree"
  | "ees-figure-inconsistent"
  /** Stays that began before EES_CUTOFF explain the gap; the EES tool is working as published. */
  | "ees-ignores-pre-cutoff-stay";

export type Reconciliation = {
  on: IsoDate;
  windowStart: IsoDate;
  travellerDaysUsed: number;
  eesDaysUsed: number;
  /** EES figure minus the trip count. Positive means the EES counts more days. */
  figureGap: number;
  /** Days used when the EES records are run through the same engine, or null if no records were supplied. */
  eesRecordDaysUsed: number | null;
  differences: DayDifference[];
  codes: MismatchCode[];
  explanation: string;
  errors: string[];
  /** Trip days in the window that the EES ignores because their stay began before EES_CUTOFF. */
  preCutoffDays: IsoDate[];
  /** Trip days the EES is expected to count (travellerDaysUsed minus preCutoffDays). */
  eesComparableDaysUsed: number;
};

const WINDOW_BACK = 179;

/**
 * The EES counts only stays from the start of full operation. The official
 * days-used figure ignores any stay that began before this date, so days from
 * such stays are not EES mismatches. The cutoff applies when the reference
 * date is on or after it.
 */
export const EES_CUTOFF: IsoDate = "2026-04-10";

function windowPresence(stays: StayInput[], on: IsoDate): {
  dates: Set<IsoDate>;
  daysUsed: number;
  errors: string[];
} {
  const closed = closeStays(stays, on);
  const end = parseIso(on);
  const start = end - WINDOW_BACK;
  const dates = new Set<IsoDate>();
  for (const stay of closed.stays) {
    const from = Math.max(parseIso(stay.entry), start);
    const to = Math.min(parseIso(stay.exit), end);
    for (let day = from; day <= to; day += 1) dates.add(formatIso(day));
  }
  return {
    dates,
    daysUsed: closed.errors.length > 0 ? daysUsedOn(closed.stays, on) : dates.size,
    errors: closed.errors,
  };
}

function sorted(dates: Iterable<IsoDate>): IsoDate[] {
  return [...dates].sort();
}

function dayRanges(dates: IsoDate[]): string {
  if (dates.length === 0) return "none";
  const ranges: string[] = [];
  let start = dates[0];
  let previous = dates[0];
  for (let index = 1; index <= dates.length; index += 1) {
    const current = dates[index];
    if (current && parseIso(current) === parseIso(previous) + 1) {
      previous = current;
      continue;
    }
    ranges.push(start === previous ? start : `${start} through ${previous}`);
    start = current;
    previous = current;
  }
  return ranges.join(", ");
}

const pluralDays = days;

const LABEL = /^(entry|exit|entered|exited|in|out)[:]?$/i;

function badDate(label: string, token: string): string {
  return dateFormatError(token) ? `${label}: ${dateFormatError(token)}` : `${label} should contain YYYY-MM-DD dates.`;
}

/**
 * One record per line: `ENTRY [EXIT]`, or labelled lines such as
 * `Entry 2026-06-01` followed by `Exit 2026-06-10` (also on one line).
 */
export function parseEesRecords(text: string): { records: EesRecord[]; errors: string[] } {
  const records: EesRecord[] = [];
  const errors: string[] = [];
  text.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim().replace(/[,;|]/g, " ").replace(/\s+(→|->|–|—|to)\s+/gi, " ");
    if (!trimmed) return;
    const label = `Line ${index + 1}`;
    const raw = trimmed.split(/\s+/);
    if (raw.some((token) => LABEL.test(token))) {
      for (let i = 0; i < raw.length; i += 1) {
        const word = raw[i].replace(/:$/, "").toLowerCase();
        if (!LABEL.test(raw[i])) {
          errors.push(`${label} should look like "Entry 2026-06-01" or "Exit 2026-06-10".`);
          return;
        }
        const token = raw[i + 1] ?? "";
        i += 1;
        if (!isIsoDate(token)) {
          errors.push(badDate(label, token));
          return;
        }
        const isExit = word === "exit" || word === "exited" || word === "out";
        if (!isExit) {
          records.push({ entry: token, exit: null });
          continue;
        }
        const open = records[records.length - 1];
        if (!open || open.exit !== null) {
          errors.push(`${label} has an exit with no entry before it.`);
          return;
        }
        if (token < open.entry) {
          errors.push(`${label} ends before it starts.`);
          return;
        }
        open.exit = token;
      }
      return;
    }
    const parts = raw;
    if (parts.length === 1) {
      if (!isIsoDate(parts[0])) errors.push(dateFormatError(parts[0]) ? badDate(label, parts[0]) : `${label} is not a YYYY-MM-DD entry date.`);
      else records.push({ entry: parts[0], exit: null });
      return;
    }
    if (parts.length === 2) {
      if (!isIsoDate(parts[0]) || !isIsoDate(parts[1])) {
        errors.push(badDate(label, isIsoDate(parts[0]) ? parts[1] : parts[0]));
        return;
      }
      if (parts[1] < parts[0]) {
        errors.push(`${label} ends before it starts.`);
        return;
      }
      records.push({ entry: parts[0], exit: parts[1] });
      return;
    }
    errors.push(`${label} should be an entry date, or an entry date and an exit date.`);
  });
  return { records, errors };
}

/** True when the only finding is the EES cutoff: nothing in the EES needs correcting. */
export function explainedByCutoff(codes: MismatchCode[]): boolean {
  return codes.length === 1 && codes[0] === "ees-ignores-pre-cutoff-stay";
}

/**
 * The last day of the stay that `exit` belongs to, following trips that continue it on the same day
 * or the next day (moving between Schengen states is an internal crossing, which the EES does not record).
 */
function continuedStay(trips: StayInput[], on: IsoDate, exit: IsoDate): IsoDate {
  const closed = trips
    .filter((t) => isIsoDate(t.entry) && (t.exit === null ? parseIso(t.entry) <= parseIso(on) : isIsoDate(t.exit)))
    .map((t) => ({ entry: parseIso(t.entry), exit: t.exit === null ? parseIso(on) : parseIso(t.exit) }));
  let end = parseIso(exit);
  for (let grew = true; grew; ) {
    grew = false;
    for (const t of closed) if (t.entry <= end + 1 && t.exit > end) { end = t.exit; grew = true; }
  }
  return formatIso(end);
}

export function reconcile(trips: StayInput[], claim: EesClaim): Reconciliation {
  const on = claim.on;
  const errors: string[] = [];
  const figureValid = Number.isInteger(claim.daysUsed) && claim.daysUsed >= 0;
  if (!figureValid) {
    errors.push("The EES days-used figure must be a whole number that is zero or greater.");
  }
  if (!isIsoDate(on)) {
    return {
      on,
      windowStart: on,
      travellerDaysUsed: 0,
      eesDaysUsed: claim.daysUsed,
      figureGap: 0,
      eesRecordDaysUsed: null,
      differences: [],
      codes: [],
      explanation: "The reference date is not a valid calendar date.",
      preCutoffDays: [],
      eesComparableDaysUsed: 0,
      errors: [...errors, "The reference date is not a valid calendar date."],
    };
  }
  const windowStart = formatIso(parseIso(on) - WINDOW_BACK);

  const traveller = windowPresence(trips, on);
  errors.push(...traveller.errors);

  const cutoffApplies = parseIso(on) >= parseIso(EES_CUTOFF);
  const preCutoff = new Set<IsoDate>();
  if (cutoffApplies) {
    const { stays } = closeStays(trips, on);
    // A day that a stay starting on or after the cutoff also covers (overlapping
    // trips) is one the EES does count, so it stays comparable.
    const counted = new Set<IsoDate>();
    for (const stay of stays) {
      if (parseIso(stay.entry) < parseIso(EES_CUTOFF)) continue;
      for (let day = parseIso(stay.entry); day <= parseIso(stay.exit); day += 1) counted.add(formatIso(day));
    }
    for (const stay of stays) {
      if (parseIso(stay.entry) >= parseIso(EES_CUTOFF)) continue;
      for (let day = parseIso(stay.entry); day <= parseIso(stay.exit); day += 1) {
        const date = formatIso(day);
        if (traveller.dates.has(date) && !counted.has(date)) preCutoff.add(date);
      }
    }
  }
  const comparableDates = new Set([...traveller.dates].filter((date) => !preCutoff.has(date)));
  const comparableDaysUsed = traveller.daysUsed - preCutoff.size;

  let eesDates = new Set<IsoDate>();
  let eesRecordDaysUsed: number | null = null;
  if (claim.records && isIsoDate(on)) {
    const fromRecords = windowPresence(claim.records, on);
    eesDates = fromRecords.dates;
    eesRecordDaysUsed = fromRecords.daysUsed;
    errors.push(...fromRecords.errors.map((error) => error.replace(/^Trip/, "EES record")));
  }

  const travellerOnly = sorted([...comparableDates].filter((date) => !eesDates.has(date)));
  const eesOnly = sorted([...eesDates].filter((date) => !comparableDates.has(date)));
  const differences: DayDifference[] = [
    ...travellerOnly.map((date) => ({ date, side: "traveller-only" as const })),
    ...eesOnly.map((date) => ({ date, side: "ees-only" as const })),
  ].sort((a, b) => a.date.localeCompare(b.date) || a.side.localeCompare(b.side));

  const notes: string[] = [];
  const codes: MismatchCode[] = [];
  const eesOnlySet = new Set(eesOnly);

  if (claim.records && isIsoDate(on)) {
    const explained = new Set<IsoDate>();
    for (const record of claim.records) {
      if (record.exit !== null || !isIsoDate(record.entry) || parseIso(record.entry) > parseIso(on)) continue;
      // Of the trips that cover this entry and ended before `on`, the latest exit: the EES has
      // no exit at all, so only days after the last one the trips record are extra.
      const trip = trips
        .filter((item) => {
          if (item.exit === null || !isIsoDate(item.entry) || !isIsoDate(item.exit)) return false;
          return parseIso(item.entry) <= parseIso(record.entry) && parseIso(item.exit) >= parseIso(record.entry) && parseIso(item.exit) < parseIso(on);
        })
        .sort((a, b) => parseIso(b.exit!) - parseIso(a.exit!))[0];
      if (!trip || trip.exit === null) continue;
      const stayEnd = continuedStay(trips, on, trip.exit);
      if (parseIso(stayEnd) >= parseIso(on)) continue;
      const extra: IsoDate[] = [];
      for (let day = parseIso(stayEnd) + 1; day <= parseIso(on); day += 1) {
        const date = formatIso(day);
        if (eesOnlySet.has(date)) extra.push(date);
      }
      if (extra.length === 0) continue;
      extra.forEach((date) => explained.add(date));
      notes.push(
        `Likely missing exit. The EES has no exit for the entry on ${record.entry}. The trips show an exit on ${stayEnd}. The EES still counts ${pluralDays(extra.length)} after that exit (${dayRanges(extra)}).`,
      );
    }
    if (explained.size > 0) codes.push("likely-missing-exit");

    const exitNotes: string[] = [];
    // Days after an earlier EES exit, up to the traveller's later exit. The
    // entry is recorded, so these days are an exit disagreement, not a missing entry.
    const earlierExitDays = new Set<IsoDate>();
    for (const record of claim.records) {
      if (record.exit === null) continue;
      // A trip with no exit is still inside: it ends on the reference date, as the count assumes.
      const sameEntry = trips
        .filter((item) => item.entry === record.entry && (item.exit !== null || (isIsoDate(item.entry) && parseIso(item.entry) <= parseIso(on))))
        .map((item) => (item.exit === null ? { ...item, exit: on } : item));
      // Two trips can share an entry date; only flag when none of them ends where the EES record ends,
      // either at its own exit or at the end of the stay it continues into (an internal crossing).
      if (sameEntry.some((item) => item.exit === record.exit || continuedStay(trips, on, item.exit!) === record.exit)) continue;
      // Two trips with the same entry are one stay as far as the EES is concerned: compare with the latest exit.
      const latest = [...sameEntry].sort((a, b) => parseIso(b.exit!) - parseIso(a.exit!))[0];
      const trip = latest ? { ...latest, exit: continuedStay(trips, on, latest.exit!) } : latest;
      if (trip && trip.exit !== null && trip.exit > record.exit) {
        for (let day = parseIso(record.exit) + 1; day <= parseIso(trip.exit); day += 1) earlierExitDays.add(formatIso(day));
      }
      if (trip && trip.exit !== record.exit) {
        exitNotes.push(
          `Exit dates disagree for the entry on ${record.entry}: trips end on ${trip.exit}, the EES ends on ${record.exit}.`,
        );
      }
    }
    if (exitNotes.length > 0) {
      codes.push("exit-dates-disagree");
      notes.push(...exitNotes);
    }

    const missingEntryDays = travellerOnly.filter((date) => !earlierExitDays.has(date));
    if (missingEntryDays.length > 0) {
      codes.push("likely-missing-entry");
      notes.push(
        `Likely missing entry. These days are in the trips and not in the EES records: ${dayRanges(missingEntryDays)}.`,
      );
    }

    const unexplained = eesOnly.filter((date) => !explained.has(date));
    if (unexplained.length > 0 && !codes.includes("exit-dates-disagree")) {
      notes.push(`The EES counts these days and the trips do not: ${dayRanges(unexplained)}.`);
    }

    if (figureValid && eesRecordDaysUsed !== claim.daysUsed) {
      codes.push("ees-figure-inconsistent");
      notes.push(
        `The EES states ${pluralDays(claim.daysUsed)}, but its own entry and exit records count ${pluralDays(eesRecordDaysUsed ?? 0)} under the 90/180 rules.`,
      );
    }
  }

  let cutoffNote = "";
  if (preCutoff.size > 0) {
    cutoffNote =
      `${pluralDays(preCutoff.size)} (${dayRanges(sorted([...preCutoff]))}) belong to stays that began before ${EES_CUTOFF}. The EES does not count stays that began before it started full operation, so these days are not treated as mismatches and are not a reason to ask for a correction. A border officer applying the 90/180 rule may still count them.`;
  }

  if (figureValid && claim.daysUsed !== comparableDaysUsed) {
    codes.unshift("figure-differs");
  }

  if (preCutoff.size > 0) codes.push("ees-ignores-pre-cutoff-stay");
  else if (codes.length === 0 && figureValid) codes.push("match");

  const head = `Compared on ${on}, over the 180-day period ${windowStart} to ${on}. The trips count ${pluralDays(traveller.daysUsed)}. The EES states ${figureValid ? pluralDays(claim.daysUsed) : "an unusable figure"}.`;
  let explanation = head;
  if (!claim.records && figureValid && claim.daysUsed !== comparableDaysUsed) {
    explanation += " No entry/exit records were provided, so the days that differ cannot be listed.";
  } else if (!claim.records && explainedByCutoff(codes)) {
    explanation += " No entry/exit records were provided. Leaving out the stays the EES does not count, the stated figure matches the trips.";
  } else if (!claim.records && codes.includes("match")) {
    explanation += " No entry/exit records were provided. The stated figure matches the trips.";
  } else if (notes.length > 0) {
    explanation += ` ${notes.join(" ")}`;
  } else if (codes.includes("match") && claim.records) {
    explanation += " The EES records and the stated figure match the trips.";
  }
  if (cutoffNote) explanation += ` ${cutoffNote}`;
  if (errors.length > 0) explanation += ` ${errors.join(" ")}`;

  return {
    on,
    windowStart,
    travellerDaysUsed: traveller.daysUsed,
    eesDaysUsed: claim.daysUsed,
    figureGap: figureValid ? claim.daysUsed - comparableDaysUsed : 0,
    eesRecordDaysUsed,
    differences: claim.records ? differences : [],
    codes,
    explanation,
    errors,
    preCutoffDays: sorted([...preCutoff]),
    eesComparableDaysUsed: comparableDaysUsed,
  };
}

export type DifferenceRange = { from: IsoDate; to: IsoDate; side: DayDifference["side"]; count: number };

/** Collapse consecutive differing days on the same side into ranges. */
export function groupDifferences(differences: DayDifference[]): DifferenceRange[] {
  const sortedDiffs = [...differences].sort((a, b) => (a.side === b.side ? a.date.localeCompare(b.date) : a.side.localeCompare(b.side)));
  const ranges: DifferenceRange[] = [];
  for (const diff of sortedDiffs) {
    const last = ranges[ranges.length - 1];
    if (last && last.side === diff.side && parseIso(diff.date) === parseIso(last.to) + 1) {
      last.to = diff.date;
      last.count += 1;
    } else {
      ranges.push({ from: diff.date, to: diff.date, side: diff.side, count: 1 });
    }
  }
  return ranges.sort((a, b) => a.from.localeCompare(b.from));
}
