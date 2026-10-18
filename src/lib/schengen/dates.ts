/**
 * Calendar dates as UTC day numbers.
 *
 * `YYYY-MM-DD` is a calendar date, not a moment in time. Parsing through
 * `Date.UTC` and reading back with UTC getters avoids the timezone shift that
 * `new Date("YYYY-MM-DD")` plus local getters (or `new Date(y, m, d)` across
 * a DST boundary) can introduce.
 */

const DAY_MS = 86_400_000;

export type IsoDate = string;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(value: string): value is IsoDate {
  if (!ISO_DATE.test(value)) return false;
  try {
    parseIso(value);
    return true;
  } catch {
    return false;
  }
}

export function parseIso(iso: string): number {
  const match = ISO_DATE.exec(iso);
  if (!match) throw new Error(`Invalid date: ${iso}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = Date.UTC(year, month - 1, day);
  const check = new Date(utc);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new Error(`Invalid date: ${iso}`);
  }
  return Math.round(utc / DAY_MS);
}

export function formatIso(dayNumber: number): IsoDate {
  const date = new Date(dayNumber * DAY_MS);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  return formatIso(parseIso(iso) + days);
}

/** Inclusive length. Both the entry date and the exit date count. */
export function daysInclusive(entry: IsoDate, exit: IsoDate): number {
  return parseIso(exit) - parseIso(entry) + 1;
}

/** Local calendar date of `now` (the traveller's machine), not UTC. */
export function localToday(now: Date = new Date()): IsoDate {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromCommissionDate(value: string): IsoDate {
  const match = /^(\d{2})\/(\d{2})\/(\d{2})$/.exec(value);
  if (!match) throw new Error(`Invalid Commission date: ${value}`);
  return `20${match[3]}-${match[2]}-${match[1]}`;
}

export function toCommissionDate(iso: IsoDate): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year.slice(2)}`;
}

const SLASH_DATE = /^\d{1,2}[/.-]\d{1,2}[/.-]\d{4}$/;

/** Clear message for a date that is not YYYY-MM-DD, or null when it is valid. */
export function dateFormatError(value: string): string | null {
  const trimmed = value.trim();
  if (isIsoDate(trimmed)) return null;
  if (SLASH_DATE.test(trimmed)) {
    return `"${trimmed}" looks like MM/DD/YYYY or DD/MM/YYYY. Use YYYY-MM-DD, for example 2026-06-14.`;
  }
  return null;
}
