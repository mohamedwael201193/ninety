/**
 * Public API v1: the same engine as the app, behind validated JSON. Pure functions, so the
 * Vercel routes, the MCP server and the tests all call exactly this code. Nothing is stored.
 */
import { z } from "zod";
import { isIsoDate, type IsoDate } from "../schengen/dates";
import { checkPlannedTrip, evaluate, nextLegalEntry, type StayInput } from "../schengen/engine";

export { nextLegalEntry };
import { EES_CUTOFF, explainedByCutoff, groupDifferences, reconcile } from "../ees/reconcile";
import { buildCorrectionLetter } from "../letter/letter";

export const API_VERSION = "1.0.0";
const MAX_TRIPS = 200;

// Years 1900 to 2199: every answer (latest exit, next entry) is then a four-digit YYYY-MM-DD date too.
const isoDate = z.string().trim().refine(isIsoDate, { message: "Use a real calendar date as YYYY-MM-DD." })
  .refine((v) => v >= "1900-01-01" && v <= "2199-12-31", { message: "Use a date from 1900-01-01 to 2199-12-31." })
  .transform((v) => v as IsoDate);
const trip = z.object({ entry: isoDate, exit: isoDate.nullable().optional() }).strict()
  .transform((t): StayInput => ({ entry: t.entry, exit: t.exit ?? null }));
const trips = z.array(trip).max(MAX_TRIPS, `At most ${MAX_TRIPS} trips per request.`);

export const CheckRequest = z.object({
  trips,
  on: isoDate.optional(),
  planned: z.object({ entry: isoDate, exit: isoDate }).strict().optional(),
}).strict();

export const ReconcileRequest = z.object({
  trips,
  ees: z.object({
    daysUsed: z.number().int().min(0).max(180),
    on: isoDate,
    records: z.array(z.object({ entry: isoDate, exit: isoDate.nullable() }).strict()).max(MAX_TRIPS).optional(),
  }).strict(),
}).strict();

// Single-line text: control characters, line and paragraph separators and bidi controls would let a
// field forge paragraphs in the letter (its paragraphs are joined with blank lines) or reorder its text.
const UNSAFE = /[\p{Cc}\u2028\u2029\u202A-\u202E\u2066-\u2069]/u;
const text = (max: number) => z.string().refine((v) => !UNSAFE.test(v), { message: "Use one line of plain text, without line breaks or direction controls." }).transform((v) => v.trim()).pipe(z.string().min(1).max(max));
export const LetterRequest = ReconcileRequest.extend({
  identity: z.object({
    fullName: text(120),
    dateOfBirth: isoDate,
    nationality: text(60),
    documentNumber: text(40),
    // The same rule as the letter form (buildCorrectionLetter), so a form-valid address is API-valid.
    email: z.string().trim().max(200).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Use a full address, for example jane@example.com."),
    memberState: text(60),
  }).strict(),
}).strict();

export type ApiResult = { status: number; body: unknown };

function invalid(error: z.ZodError): ApiResult {
  return {
    status: 400,
    body: { error: "invalid_request", issues: error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
  };
}

function utcToday(): IsoDate {
  return new Date().toISOString().slice(0, 10) as IsoDate;
}

export function check(input: unknown, today: IsoDate = utcToday()): ApiResult {
  const parsed = CheckRequest.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { trips: stays, on = today, planned } = parsed.data;
  const a = evaluate(stays, on, on);
  if (a.errors.length) return { status: 422, body: { error: "invalid_trips", messages: a.errors } };
  const body: Record<string, unknown> = {
    on,
    daysUsed: a.daysUsed,
    daysLeft: a.daysLeft,
    present: a.present,
    latestExit: a.latestExit,
    nextLegalEntry: a.present ? null : nextLegalEntry(stays, on),
    overstays: a.overstays.map(({ from, to, days }) => ({ from, to, days })),
  };
  if (planned) {
    const p = checkPlannedTrip(stays, on, planned);
    if (p.errors.length) return { status: 422, body: { error: "invalid_plan", messages: p.errors } };
    body.planned = { fits: p.fits, plannedDays: p.plannedDays, daysLeftOnEntry: p.daysLeft, latestExit: p.latestExit };
  }
  return { status: 200, body };
}

export function eesReconcile(input: unknown): ApiResult {
  const parsed = ReconcileRequest.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const r = reconcile(parsed.data.trips, parsed.data.ees);
  if (r.errors.length) return { status: 422, body: { error: "invalid_input", messages: r.errors } };
  return {
    status: 200,
    body: {
      on: r.on,
      windowStart: r.windowStart,
      travellerDaysUsed: r.travellerDaysUsed,
      eesDaysUsed: r.eesDaysUsed,
      figureGap: r.figureGap,
      codes: r.codes,
      explanation: r.explanation,
      differences: groupDifferences(r.differences),
    },
  };
}

export function article52Letter(input: unknown): ApiResult {
  const parsed = LetterRequest.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const r = reconcile(parsed.data.trips, parsed.data.ees);
  if (r.errors.length) return { status: 422, body: { error: "invalid_input", messages: r.errors } };
  if (r.codes.includes("match")) return { status: 422, body: { error: "no_difference", messages: ["The EES figure matches your trips; there is nothing to correct."] } };
  if (explainedByCutoff(r.codes)) return { status: 422, body: { error: "no_difference", messages: [`The gap comes only from stays that began before ${EES_CUTOFF}, which the EES does not count. There is nothing in the EES to correct.`] } };
  const letter = buildCorrectionLetter(parsed.data.identity, r);
  return { status: 200, body: { title: letter.title, addressee: letter.addressee, text: letter.text, evidence: letter.evidence } };
}
