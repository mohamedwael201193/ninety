/**
 * Safety net for the engine rewrite: the interval engine (engine.ts) and the
 * frozen day-by-day engine it replaced (engine.legacy.ts) must return the same
 * assessment, planned-trip check and overstay list for every random history:
 * overlapping trips, same-day re-entry, open stays, invalid rows, overstays.
 * The unit, property, parity (14/14 vs the Commission) and differential fuzz
 * suites run unchanged against the new engine.
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

describe("engine rewrite: interval engine = frozen day-by-day engine", () => {
  it("evaluate() is identical on random histories", () => {
    fc.assert(
      fc.property(history, day, day, (trips, a, b) => {
        const [on, today] = a <= b ? [a, b] : [b, a];
        expect(next.evaluate(trips, on, today)).toEqual(legacy.evaluate(trips, on, today));
      }),
      { numRuns: RUNS },
    );
  }, 600_000);

  it("checkPlannedTrip() is identical on random plans", () => {
    fc.assert(
      fc.property(history, day, fc.integer({ min: 0, max: 200 }), fc.integer({ min: -3, max: 120 }), (trips, today, ahead, length) => {
        const entry = formatIso(parseIso(today) + ahead);
        const plan = { entry, exit: formatIso(parseIso(entry) + length) };
        expect(next.checkPlannedTrip(trips, today, plan)).toEqual(legacy.checkPlannedTrip(trips, today, plan));
      }),
      { numRuns: RUNS },
    );
  }, 600_000);

  it("the exported helpers are identical", () => {
    fc.assert(
      fc.property(history, day, (trips, on) => {
        const closed = next.closeStays(trips, on).stays;
        expect(next.findOverstays(closed)).toEqual(legacy.findOverstays(closed));
        expect(next.daysUsedOn(closed, on)).toBe(legacy.daysUsedOn(closed, on));
        expect(next.isPresentOn(closed, on)).toBe(legacy.isPresentOn(closed, on));
        expect(next.inclusiveAllowance(closed, on)).toBe(legacy.inclusiveAllowance(closed, on));
      }),
      { numRuns: RUNS },
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
