/**
 * Safety net for the engine rewrite: the interval engine (engine.ts) and the
 * frozen day-by-day engine it replaced (engine.legacy.ts) must return the same
 * assessment, planned-trip check and overstay list for every random history:
 * overlapping trips, same-day re-entry, open stays, invalid rows, overstays.
 * The unit, property, parity (14/14 vs the Commission) and differential fuzz
 * suites run unchanged against the new engine.
 *
 * One deliberate difference: overlapping trips that overstay are listed once, as one merged stay
 * (the differential fuzzer found the old listing counted the shared days twice; seed 20261019,
 * run 14). So overstays are compared with the old engine run on the merged stays.
 *
 * Second deliberate difference: the old allowance looked only backwards, so a booked stay after the
 * date was ignored (found by an independent review: 2026-07-01 to 09-28 booked, one day on 06-01 "fit").
 * The days-left fields are compared with the old engine only when nothing is recorded after the date;
 * `allowance matches brute force` checks the rest.
 */
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { formatIso, parseIso, type IsoDate } from "./dates";
import * as next from "./engine";
import * as legacy from "./engine.legacy";

const BASE = parseIso("2025-01-01");
const RUNS = Number(process.env.REWRITE_RUNS ?? 3000);

const iso = (offset: number): IsoDate => formatIso(BASE + offset);
const stay = fc.oneof(
  { weight: 8, arbitrary: fc.record({ start: fc.integer({ min: 0, max: 500 }), length: fc.integer({ min: 1, max: 120 }) }).map(({ start, length }) => ({ entry: iso(start), exit: iso(start + length - 1) as IsoDate | null })) },
  { weight: 1, arbitrary: fc.integer({ min: 0, max: 600 }).map((start) => ({ entry: iso(start), exit: null as IsoDate | null })) },
  { weight: 1, arbitrary: fc.record({ start: fc.integer({ min: 10, max: 500 }), back: fc.integer({ min: 1, max: 9 }) }).map(({ start, back }) => ({ entry: iso(start), exit: iso(start - back) as IsoDate | null })) },
);
const history = fc.array(stay, { maxLength: 9 });
const day = fc.integer({ min: 0, max: 720 }).map(iso);

/** Stays that overlap (an entry before the previous exit) merged into one; a same-day re-entry stays separate. */
function merged(stays: next.ClosedStay[]): next.ClosedStay[] {
  const out: next.ClosedStay[] = [];
  for (const st of [...stays].sort((a, b) => parseIso(a.entry) - parseIso(b.entry) || parseIso(a.exit) - parseIso(b.exit))) {
    const last = out[out.length - 1];
    if (last && parseIso(st.entry) < parseIso(last.exit)) { if (parseIso(st.exit) > parseIso(last.exit)) last.exit = st.exit; }
    else out.push({ ...st });
  }
  return out;
}

describe("engine rewrite: interval engine = frozen day-by-day engine", () => {
  it("evaluate() is identical on random histories", () => {
    fc.assert(
      fc.property(history, day, day, (trips, a, b) => {
        const [on, today] = a <= b ? [a, b] : [b, a];
        const ours = next.evaluate(trips, on, today);
        const old = legacy.evaluate(trips, on, today);
        const later = next.closeStays(trips, today).stays.some((s) => parseIso(s.exit) > parseIso(on));
        const strip = <T extends object>(x: T) => (later ? { ...x, overstays: [], daysLeft: 0, latestExit: null } : { ...x, overstays: [] });
        expect(strip(ours)).toEqual(strip(old));
        expect(ours.overstays).toEqual(legacy.findOverstays(merged(next.closeStays(trips, today).stays)));
      }),
      { numRuns: RUNS },
    );
  }, 600_000);

  it("checkPlannedTrip() is identical on random plans", () => {
    fc.assert(
      fc.property(history, day, fc.integer({ min: 0, max: 200 }), fc.integer({ min: -3, max: 120 }), (trips, today, ahead, length) => {
        const entry = formatIso(parseIso(today) + ahead);
        const plan = { entry, exit: formatIso(parseIso(entry) + length) };
        if (next.closeStays(trips, today).stays.some((s) => parseIso(s.exit) >= parseIso(entry))) return true;
        expect(next.checkPlannedTrip(trips, today, plan)).toEqual(legacy.checkPlannedTrip(trips, today, plan));
      }),
      { numRuns: RUNS },
    );
  }, 600_000);

  it("the exported helpers are identical", () => {
    fc.assert(
      fc.property(history, day, (trips, on) => {
        const closed = next.closeStays(trips, on).stays;
        expect(next.findOverstays(closed)).toEqual(legacy.findOverstays(merged(closed)));
        expect(next.daysUsedOn(closed, on)).toBe(legacy.daysUsedOn(closed, on));
        expect(next.isPresentOn(closed, on)).toBe(legacy.isPresentOn(closed, on));
        if (!closed.some((s) => parseIso(s.exit) > parseIso(on))) expect(next.inclusiveAllowance(closed, on)).toBe(legacy.inclusiveAllowance(closed, on));
      }),
      { numRuns: RUNS },
    );
  }, 600_000);

  it("allowance matches brute force, booked stays after the date included", () => {
    fc.assert(
      fc.property(history, day, (trips, on) => {
        const closed = next.closeStays(trips, on).stays;
        const rec = new Set<number>();
        for (const s of closed) for (let d = parseIso(s.entry); d <= parseIso(s.exit); d += 1) rec.add(d);
        const over = (set: Set<number>, from: number, to: number) => {
          for (let e = from; e <= to; e += 1) { let c = 0; for (let d = e - 179; d <= e; d += 1) if (set.has(d)) c += 1; if (c > 90) return true; }
          return false;
        };
        const o = parseIso(on);
        if (over(rec, o - 400, o + 600)) return true; // the record itself overstays somewhere: not this property
        const fits = (len: number) => { const u = new Set(rec); for (let i = 0; i < len; i += 1) u.add(o + i); return !over(u, o, o + len + 178); };
        let n = 0;
        while (n < 120 && fits(n + 1)) n += 1;
        expect(next.inclusiveAllowance(closed, on)).toBe(n);
      }),
      { numRuns: Math.min(RUNS, 300) },
    );
  }, 600_000);

  it("the edges the old engine special-cased stay the same", () => {
    const cases: { stays: next.StayInput[]; on: IsoDate }[] = [
      { stays: [{ entry: "2026-01-01", exit: "2026-01-10" }, { entry: "2026-01-10", exit: "2026-01-20" }], on: "2026-01-20" },
      { stays: [{ entry: "2026-01-01", exit: "2026-03-31" }], on: "2026-03-31" },
      { stays: [{ entry: "2026-01-01", exit: "2026-04-01" }], on: "2026-04-01" },
      { stays: [{ entry: "2026-01-01", exit: "2026-01-31" }, { entry: "2026-02-01", exit: "2026-03-31" }], on: "2026-06-29" },
      { stays: [], on: "2026-10-19" },
    ];
    for (const c of cases) expect(next.evaluate(c.stays, c.on)).toEqual(legacy.evaluate(c.stays, c.on));
  });
});
