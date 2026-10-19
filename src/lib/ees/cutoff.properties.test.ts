import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { formatIso, parseIso, type IsoDate } from "../schengen/dates";
import type { StayInput } from "../schengen/engine";
import { EES_CUTOFF, reconcile } from "./reconcile";

const CUT = parseIso(EES_CUTOFF);
const stay = (min: number, max: number) =>
  fc.record({ start: fc.integer({ min, max }), length: fc.integer({ min: 1, max: 60 }) })
    .map(({ start, length }): StayInput => ({ entry: formatIso(CUT + start), exit: formatIso(CUT + start + length - 1) }));
const after = fc.array(stay(0, 300), { maxLength: 6 });
const before = fc.array(stay(-200, -1), { minLength: 1, maxLength: 4 });
const on = fc.integer({ min: 0, max: 400 }).map((d): IsoDate => formatIso(CUT + d));

describe("EES cutoff invariants (random histories)", () => {
  it("a stay that began before 10 April 2026 never changes what the EES is compared with", () => {
    fc.assert(
      fc.property(after, before, on, fc.integer({ min: 0, max: 180 }), (trips, early, date, figure) => {
        const base = reconcile(trips, { daysUsed: figure, on: date });
        const withEarly = reconcile([...trips, ...early], { daysUsed: figure, on: date });
        expect(withEarly.eesComparableDaysUsed).toBe(base.eesComparableDaysUsed);
        expect(withEarly.figureGap).toBe(base.figureGap);
        expect(withEarly.codes.includes("figure-differs")).toBe(base.codes.includes("figure-differs"));
      }),
      { numRuns: 1000 },
    );
  });

  it("the legal count is never below the EES-comparable count", () => {
    fc.assert(
      fc.property(after, before, on, (trips, early, date) => {
        const r = reconcile([...trips, ...early], { daysUsed: 0, on: date });
        expect(r.travellerDaysUsed).toBeGreaterThanOrEqual(r.eesComparableDaysUsed);
        expect(r.travellerDaysUsed - r.eesComparableDaysUsed).toBe(r.preCutoffDays.length);
      }),
      { numRuns: 1000 },
    );
  });
});
