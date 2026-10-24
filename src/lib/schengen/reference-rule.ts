/**
 * An independent reference implementation of the 90/180 rule, written from the legal text
 * and the Commission's user manual only, not from engine.ts (no shared code, its own date
 * arithmetic on UTC timestamps), so the engine can be checked against it.
 *
 * Sources:
 * - Regulation (EU) 2016/399 (Schengen Borders Code), Article 6(1): "intended stay ... of no more
 *   than 90 days in any 180-day period, which entails considering the 180-day period preceding
 *   each day of stay". https://eur-lex.europa.eu/eli/reg/2016/399/oj
 * - Commission short-stay calculator user manual: the entry and the exit day both count, and the
 *   180-day period of a day is that day and the 179 days before it.
 *   https://ec.europa.eu/assets/home/visa-calculator/docs/short_stay_schengen_calculator_user_manual_en.pdf
 *
 * Deliberately brute force: every quantity is a direct count over calendar days.
 * Scope: histories whose stays all end on or before the date asked about (no booked future
 * trips), where "days left" is unambiguous: the longest continuous stay starting on that date
 * in which every day's 180-day period holds at most 90 days of stay.
 */

const DAY_MS = 86_400_000;

export function refDay(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) throw new Error(`not a date: ${iso}`);
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(t);
  if (d.getUTCFullYear() !== Number(m[1]) || d.getUTCMonth() !== Number(m[2]) - 1 || d.getUTCDate() !== Number(m[3])) throw new Error(`not a date: ${iso}`);
  return t / DAY_MS;
}

export function refIso(day: number): string {
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

export type RefAnswer = { daysUsed: number; present: boolean; overstay: boolean; daysLeft: number; latestExit: string | null };

export function referenceAnswer(stays: { entry: string; exit: string }[], on: string): RefAnswer {
  const days = new Set<number>();
  for (const s of stays) for (let d = refDay(s.entry); d <= refDay(s.exit); d += 1) days.add(d);
  const D = refDay(on);
  for (const d of days) if (d > D) throw new Error("reference scope: no stay may end after the date asked about");
  const used = (set: Set<number>, end: number) => {
    let n = 0;
    for (let d = end - 179; d <= end; d += 1) if (set.has(d)) n += 1;
    return n;
  };
  const daysUsed = used(days, D);
  const present = days.has(D);
  // Longest continuous stay from D in which every day of stay has at most 90 days in its period.
  const hyp = new Set(days);
  let length = 0;
  for (;;) {
    const day = D + length;
    hyp.add(day);
    if (used(hyp, day) > 90) break;
    length += 1;
  }
  return {
    daysUsed,
    present,
    overstay: present && daysUsed > 90,
    daysLeft: length === 0 ? 0 : present ? length - 1 : length,
    latestExit: length === 0 ? null : refIso(D + length - 1),
  };
}
