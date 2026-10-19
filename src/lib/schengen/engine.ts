/**
 * Schengen short-stay (90/180) engine.
 *
 * The rules follow the European Commission's short-stay calculator and its
 * user manual:
 * - Calculator: https://ec.europa.eu/assets/home/visa-calculator/calculator.htm
 * - Manual: https://ec.europa.eu/assets/home/visa-calculator/docs/short_stay_schengen_calculator_user_manual_en.pdf
 *
 * Confirmed from the public script (`daysBetween`, `leggInndager`, `Beregn2`,
 * `BeregnControl`, `BeregnVisa`) and the manual's worked examples:
 *
 * - The entry date and the exit date both count as days of stay.
 * - A calendar day covered by more than one stay counts once (including a
 *   same-day exit and re-entry, which the script special-cases in `leggInndager`).
 * - On each day of stay the reference period is the 180 calendar days ending
 *   that day, inclusive: [day − 179, day]. The manual's 14 June 2024 example
 *   uses 18 December 2023–14 June 2024, which is that window.
 * - The day is within the rule while the number of presence days in the window
 *   is at most 90. 91 or more is an overstay.
 * - "Days left" matches the calculator's planning line "The stay may be
 *   authorised for up to N day(s)":
 *   - if `on` is already a day of stay, N is the number of further days after
 *     `on` (the script subtracts the control day when it equals the last exit);
 *   - if `on` is a new entry, N includes `on`.
 * - "Latest legal exit" matches control mode's "Possible stay until". On the
 *   last legal day the script says a stay may be authorised for 0 days and
 *   does not print "Possible stay until"; the latest exit is still that day.
 *
 * Dates are calendar dates. The engine never constructs a local `Date` from a
 * trip, so a DST transition cannot add or drop a day.
 */

import {
  addDays,
  daysInclusive,
  formatIso,
  parseIso,
  type IsoDate,
} from "./dates";

export type StayInput = {
  entry: IsoDate;
  /** Null means the traveller has not exited yet. Closed on `today`. */
  exit: IsoDate | null;
};

export type ClosedStay = {
  entry: IsoDate;
  exit: IsoDate;
};

export type OverstaySpan = {
  /** First day of the 180-day window ending on the stay's exit. */
  windowStart: IsoDate;
  windowEnd: IsoDate;
  /** Presence days in that window, matching the calculator's "Days of stay" line. */
  daysInWindow: number;
  from: IsoDate;
  to: IsoDate;
  days: number;
};

export type Assessment = {
  on: IsoDate;
  today: IsoDate;
  daysUsed: number;
  present: boolean;
  daysLeft: number;
  latestExit: IsoDate | null;
  overstay: boolean;
  overstays: OverstaySpan[];
  errors: string[];
};

export type PlannedTripCheck = {
  plannedDays: number;
  daysLeft: number;
  latestExit: IsoDate | null;
  fits: boolean;
  daysUsedOnEntry: number;
  overstay: boolean;
  errors: string[];
  /**
   * True when a stay with no exit was treated as continuous presence from its
   * entry up to the planned entry, because nothing says the traveller left.
   */
  assumedContinuousPresence: boolean;
};

const MAX_FORWARD_DAYS = 120;

function presenceDays(stays: ClosedStay[]): Set<number> {
  const days = new Set<number>();
  for (const stay of stays) {
    const entry = parseIso(stay.entry);
    const exit = parseIso(stay.exit);
    for (let day = entry; day <= exit; day += 1) days.add(day);
  }
  return days;
}

function countInWindow(presence: Set<number>, day: number): number {
  let count = 0;
  for (let cursor = day - 179; cursor <= day; cursor += 1) {
    if (presence.has(cursor)) count += 1;
  }
  return count;
}

/**
 * Inclusive length of a continuous stay that starts on `on` and never exceeds
 * 90 presence days in any 180-day window. Zero means that day itself is already
 * over the limit (recorded, or as a new entry).
 */
export function inclusiveAllowance(stays: ClosedStay[], on: IsoDate): number {
  const presence = presenceDays(stays);
  const start = parseIso(on);
  let length = 0;
  while (length < MAX_FORWARD_DAYS) {
    const day = start + length;
    let count = 0;
    for (let cursor = day - 179; cursor <= day; cursor += 1) {
      if (presence.has(cursor) || (cursor >= start && cursor <= day)) count += 1;
    }
    if (count > 90) break;
    length += 1;
  }
  return length;
}

export function daysUsedOn(stays: ClosedStay[], on: IsoDate): number {
  return countInWindow(presenceDays(stays), parseIso(on));
}

export function isPresentOn(stays: ClosedStay[], on: IsoDate): boolean {
  return presenceDays(stays).has(parseIso(on));
}

export function findOverstays(stays: ClosedStay[]): OverstaySpan[] {
  const presence = presenceDays(stays);
  const spans: OverstaySpan[] = [];
  const ordered = [...stays].sort(
    (a, b) => parseIso(a.entry) - parseIso(b.entry) || parseIso(a.exit) - parseIso(b.exit),
  );
  for (const stay of ordered) {
    const entry = parseIso(stay.entry);
    const exit = parseIso(stay.exit);
    let first: number | null = null;
    for (let day = entry; day <= exit; day += 1) {
      if (countInWindow(presence, day) > 90) {
        first = day;
        break;
      }
    }
    if (first === null) continue;
    spans.push({
      windowStart: formatIso(exit - 179),
      windowEnd: stay.exit,
      daysInWindow: countInWindow(presence, exit),
      from: formatIso(first),
      to: stay.exit,
      days: exit - first + 1,
    });
  }
  return spans;
}

export function closeStays(
  stays: StayInput[],
  today: IsoDate,
): { stays: ClosedStay[]; errors: string[] } {
  const todayNumber = parseIso(today);
  const closed: ClosedStay[] = [];
  const errors: string[] = [];
  stays.forEach((stay, index) => {
    const label = `Trip ${index + 1}`;
    let entryNumber: number;
    try {
      entryNumber = parseIso(stay.entry);
    } catch {
      errors.push(`${label} has an invalid entry date.`);
      return;
    }
    if (stay.exit === null) {
      if (entryNumber > todayNumber) {
        errors.push(`${label} starts after ${today} and has no exit date.`);
        return;
      }
      closed.push({ entry: stay.entry, exit: today });
      return;
    }
    let exitNumber: number;
    try {
      exitNumber = parseIso(stay.exit);
    } catch {
      errors.push(`${label} has an invalid exit date.`);
      return;
    }
    if (exitNumber < entryNumber) {
      errors.push(`${label} ends before it starts.`);
      return;
    }
    closed.push({ entry: stay.entry, exit: stay.exit });
  });
  return { stays: closed, errors };
}

export function evaluate(stays: StayInput[], on: IsoDate, today: IsoDate = on): Assessment {
  parseIso(on);
  const { stays: closed, errors } = closeStays(stays, today);
  const presence = presenceDays(closed);
  const onNumber = parseIso(on);
  const present = presence.has(onNumber);
  const daysUsed = countInWindow(presence, onNumber);
  const overstays = findOverstays(closed);
  const inclusive = inclusiveAllowance(closed, on);
  const overstay = daysUsed > 90 && present;

  let daysLeft = 0;
  let latestExit: IsoDate | null = null;
  if (inclusive > 0) {
    latestExit = addDays(on, inclusive - 1);
    daysLeft = present ? inclusive - 1 : inclusive;
  }

  return {
    on,
    today,
    daysUsed,
    present,
    daysLeft,
    latestExit,
    overstay,
    overstays,
    errors,
  };
}

export function checkPlannedTrip(
  history: StayInput[],
  today: IsoDate,
  plan: { entry: IsoDate; exit: IsoDate },
): PlannedTripCheck {
  const errors: string[] = [];
  let entryNumber: number;
  let exitNumber: number;
  try {
    entryNumber = parseIso(plan.entry);
    exitNumber = parseIso(plan.exit);
  } catch {
    return {
      plannedDays: 0,
      daysLeft: 0,
      latestExit: null,
      fits: false,
      daysUsedOnEntry: 0,
      overstay: false,
      errors: ["Enter a valid entry date and exit date."],
      assumedContinuousPresence: false,
    };
  }
  if (exitNumber < entryNumber) {
    errors.push("The planned exit is before the planned entry.");
  }
  // A stay with no exit means the traveller is still inside. Until an exit is
  // recorded, the safe reading is that they stay inside up to the planned
  // entry, so the plan continues that stay instead of starting after a gap.
  const todayNumber = parseIso(today);
  const openStay = entryNumber > todayNumber && history.some((stay) => stay.exit === null);
  const assumed = openStay
    ? history.map((stay) => (stay.exit === null && parseIso(stay.entry) <= todayNumber ? { entry: stay.entry, exit: addDays(plan.entry, -1) } : stay))
    : history;
  const atEntry = evaluate(assumed, plan.entry, today);
  const plannedDays = exitNumber >= entryNumber ? daysInclusive(plan.entry, plan.exit) : 0;
  const fits =
    errors.length === 0 &&
    atEntry.errors.length === 0 &&
    atEntry.latestExit !== null &&
    exitNumber <= parseIso(atEntry.latestExit);
  return {
    plannedDays,
    daysLeft: atEntry.daysLeft,
    latestExit: atEntry.latestExit,
    fits,
    daysUsedOnEntry: atEntry.daysUsed,
    overstay: atEntry.overstay,
    errors: [...errors, ...atEntry.errors],
    assumedContinuousPresence: openStay,
  };
}

export function stayLength(stay: StayInput, today: IsoDate): number | null {
  const { stays } = closeStays([stay], today);
  if (stays.length !== 1) return null;
  return daysInclusive(stays[0].entry, stays[0].exit);
}
