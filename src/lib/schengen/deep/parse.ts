/**
 * Turns the Commission calculator's report lines into fields.
 * Anything the script prints that is not recognised is kept, so a new sentence
 * cannot pass a comparison by being ignored.
 */
import { fromCommissionDate, type IsoDate } from "../dates";
import type { OverstaySpan } from "../engine";

const DATE = "(\\d{2}/\\d{2}/\\d{2})";

const NO_OVERSTAY = /^No overstay in the registration period\.$/;
const POSSIBLE_UNTIL = new RegExp(`^Possible stay until ${DATE}$`);
const VISA_REMINDER = /^For holder of a short stay visa, remember to check the number of days on the visa sticker or in the VIS$/;
const AT_DATE = new RegExp(`^At ${DATE} a stay may be authorized for (\\d+) days$`);
const ENTRY_REFUSED = /^A stay may not be authorised\.$/;
const WINDOW = new RegExp(`^Days of stay in the 180-days period from ${DATE} to ${DATE}: (\\d+) day\\(s\\)$`);
const OVERSTAY = new RegExp(`^Overstay in the period from ${DATE} to ${DATE} \\((\\d+) days\\)$`);
const PERIOD_90 = new RegExp(`^Start of 90 days period: ${DATE}$`);
const PERIOD_180 = new RegExp(`^Start of 180 days period: ${DATE}$`);
const DAYS_LEFT = /^The stay may be authorised for up to:\s*(\d+)\s*day\(s\)$/;
const NO_ENTRY = new RegExp(`^The stay with exit date ${DATE} has no entering date$`);
const NO_EXIT = new RegExp(`^The stay with entering date ${DATE} has no exit date$`);
const REVERSED = new RegExp(`^The stay with entering date ${DATE} is later than the exit date ${DATE}$`);
const EXIT_AFTER = new RegExp(`^The exit date ${DATE} is later than the Entry/Control date ${DATE}$`);
const OVERLAP = new RegExp(`^The stay with entering date ${DATE} is before exit date in the previous stay ${DATE}$`);
const NOT_POSSIBLE = /^Calculation of stay is not possible$/;

export type AuthorisedOn = { on: IsoDate; days: number };

export type ParsedReport = {
  overstays: OverstaySpan[];
  noOverstay: boolean;
  possibleStayUntil: IsoDate | null;
  /** "At DATE a stay may be authorized for 0 days" when DATE is the control date. */
  zeroDaysOn: IsoDate | null;
  entryRefused: boolean;
  /** "At DATE a stay may be authorized for N days" with N > 0. */
  nextAuthorised: AuthorisedOn | null;
  daysLeft: number | null;
  period90Start: IsoDate | null;
  period180Start: IsoDate | null;
  visaReminder: boolean;
  notPossible: boolean;
  refusalLines: string[];
  unparsed: string[];
  /** Set when overstay lines are not clean window/span pairs, or a field is repeated. */
  structure: string[];
};

function iso(value: string): IsoDate {
  return fromCommissionDate(value);
}

export function parseReport(lines: string[], controlDate: IsoDate): ParsedReport {
  const parsed: ParsedReport = {
    overstays: [],
    noOverstay: false,
    possibleStayUntil: null,
    zeroDaysOn: null,
    entryRefused: false,
    nextAuthorised: null,
    daysLeft: null,
    period90Start: null,
    period180Start: null,
    visaReminder: false,
    notPossible: false,
    refusalLines: [],
    unparsed: [],
    structure: [],
  };
  const windows: { windowStart: IsoDate; windowEnd: IsoDate; daysInWindow: number }[] = [];
  const spans: { from: IsoDate; to: IsoDate; days: number }[] = [];

  for (const line of lines) {
    let match: RegExpMatchArray | null;
    if (NO_OVERSTAY.test(line)) {
      if (parsed.noOverstay) parsed.structure.push("Repeated: no overstay");
      parsed.noOverstay = true;
    } else if ((match = line.match(POSSIBLE_UNTIL))) {
      if (parsed.possibleStayUntil) parsed.structure.push("Repeated: possible stay until");
      parsed.possibleStayUntil = iso(match[1]);
    } else if (VISA_REMINDER.test(line)) {
      parsed.visaReminder = true;
    } else if ((match = line.match(AT_DATE))) {
      const on = iso(match[1]);
      const days = Number(match[2]);
      if (days === 0 && on === controlDate) {
        if (parsed.zeroDaysOn) parsed.structure.push("Repeated: zero days on the control date");
        parsed.zeroDaysOn = on;
      } else if (days > 0) {
        if (parsed.nextAuthorised) parsed.structure.push("Repeated: next authorised stay");
        parsed.nextAuthorised = { on, days };
      } else {
        parsed.structure.push(`Unexpected zero-day authorisation on ${on}`);
      }
    } else if (ENTRY_REFUSED.test(line)) {
      parsed.entryRefused = true;
    } else if ((match = line.match(WINDOW))) {
      windows.push({ windowStart: iso(match[1]), windowEnd: iso(match[2]), daysInWindow: Number(match[3]) });
    } else if ((match = line.match(OVERSTAY))) {
      spans.push({ from: iso(match[1]), to: iso(match[2]), days: Number(match[3]) });
    } else if ((match = line.match(PERIOD_90))) {
      parsed.period90Start = iso(match[1]);
    } else if ((match = line.match(PERIOD_180))) {
      parsed.period180Start = iso(match[1]);
    } else if ((match = line.match(DAYS_LEFT))) {
      parsed.daysLeft = Number(match[1]);
    } else if (NO_ENTRY.test(line) || NO_EXIT.test(line) || REVERSED.test(line) || EXIT_AFTER.test(line) || OVERLAP.test(line) || NOT_POSSIBLE.test(line)) {
      if (NOT_POSSIBLE.test(line)) parsed.notPossible = true;
      parsed.refusalLines.push(line);
    } else {
      parsed.unparsed.push(line);
    }
  }

  if (windows.length !== spans.length) {
    parsed.structure.push(`Overstay lines do not pair: ${windows.length} window line(s), ${spans.length} span line(s).`);
  }
  const pairs = Math.min(windows.length, spans.length);
  for (let i = 0; i < pairs; i += 1) {
    parsed.overstays.push({ ...windows[i], ...spans[i] });
  }
  return parsed;
}

export const COMPARED_FIELDS = [
  "days left",
  "start of the 90-day period",
  "start of the 180-day period",
  "possible stay until",
  "last legal day (0 days left)",
  "entry refused",
  "next date a stay is allowed, and for how many days",
  "overstay window and length",
  "length of each stay",
  "refusal, when the script refuses an exit-before-entry stay",
] as const;
