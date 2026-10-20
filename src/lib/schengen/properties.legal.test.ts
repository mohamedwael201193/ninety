/**
 * Legality properties: when Ninety says a stay is legal, no 180-day window may hold more than 90
 * days, checked by brute force over every day. Plus determinism and order independence.
 */
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { formatIso, parseIso, type IsoDate } from "./dates";
import { checkPlannedTrip, evaluate, type StayInput } from "./engine";

const BASE = parseIso("2025-01-01");
const RUNS = 1000;
const stay = fc
  .record({ start: fc.integer({ min: 0, max: 360 }), length: fc.integer({ min: 1, max: 60 }) })
  .map(({ start, length }): StayInput => ({ entry: formatIso(BASE + start), exit: formatIso(BASE + start + length - 1) }));
const history = fc.array(stay, { minLength: 0, maxLength: 6 });

/** The largest number of distinct presence days in any 180-day window that contains one of `days`. */
function worstWindow(stays: StayInput[]): number {
  const present = new Set<number>();
  for (const s of stays) for (let d = parseIso(s.entry); d <= parseIso(s.exit!); d += 1) present.add(d);
  let worst = 0;
  for (const d of present) {
    let n = 0;
    for (let k = d - 179; k <= d; k += 1) if (present.has(k)) n += 1;
    worst = Math.max(worst, n);
  }
  return worst;
}

describe("legality, checked by brute force", () => {
  it("a history Ninety reports without an overstay never has more than 90 days in any 180-day window", () => {
    fc.assert(fc.property(history, (trips) => {
      const last = trips.reduce((m, t) => Math.max(m, parseIso(t.exit!)), BASE);
      const a = evaluate(trips, formatIso(last));
      return a.overstays.length > 0 || worstWindow(trips) <= 90;
    }), { numRuns: RUNS });
  });

  it("a planned trip Ninety says fits keeps every window at 90 days or fewer, and one that does not fit breaks one", () => {
    fc.assert(fc.property(history, fc.integer({ min: 1, max: 120 }), fc.integer({ min: 1, max: 100 }), (trips, gap, length) => {
      const last = trips.reduce((m, t) => Math.max(m, parseIso(t.exit!)), BASE);
      if (trips.length && worstWindow(trips) > 90) return true; // already an overstay; not this property
      const entry = formatIso(last + gap) as IsoDate;
      const exit = formatIso(last + gap + length - 1) as IsoDate;
      const r = checkPlannedTrip(trips, formatIso(last + 1) as IsoDate, { entry, exit });
      const worst = worstWindow([...trips, { entry, exit }]);
      return r.fits ? worst <= 90 : worst > 90;
    }), { numRuns: RUNS });
  });

  it("the same input always gives the same answer (deterministic)", () => {
    fc.assert(fc.property(history, fc.integer({ min: 0, max: 500 }), (trips, off) => {
      const on = formatIso(BASE + off) as IsoDate;
      expect(evaluate(trips, on)).toEqual(evaluate(structuredClone(trips), on));
      return true;
    }), { numRuns: 300 });
  });

  it("reversing the trip order changes nothing (order independence)", () => {
    fc.assert(fc.property(history, fc.integer({ min: 0, max: 500 }), (trips, off) => {
      const on = formatIso(BASE + off) as IsoDate;
      const a = evaluate(trips, on), b = evaluate([...trips].reverse(), on);
      return a.daysUsed === b.daysUsed && a.daysLeft === b.daysLeft && a.latestExit === b.latestExit && a.overstays.length === b.overstays.length;
    }), { numRuns: RUNS });
  });
});
