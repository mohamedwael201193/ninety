/**
 * Property tests: random travel histories checked against invariants of the
 * 90/180 rule. About 10,000 random histories run on every `npm test`.
 */
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { addDays, formatIso, parseIso, type IsoDate } from "./dates";
import { checkPlannedTrip, evaluate, type StayInput } from "./engine";
import { reconcile } from "../ees/reconcile";

const BASE = parseIso("2026-04-10");
const RUNS = 1250;

const stay = fc
  .record({ start: fc.integer({ min: 0, max: 400 }), length: fc.integer({ min: 1, max: 75 }) })
  .map(({ start, length }): StayInput => ({ entry: formatIso(BASE + start), exit: formatIso(BASE + start + length - 1) }));
const history = fc.array(stay, { minLength: 0, maxLength: 8 });
const day = fc.integer({ min: 0, max: 520 }).map((offset): IsoDate => formatIso(BASE + offset));

function bruteDaysUsed(stays: StayInput[], on: IsoDate): number {
  const present = new Set<number>();
  for (const s of stays) for (let d = parseIso(s.entry); d <= parseIso(s.exit!); d += 1) present.add(d);
  let count = 0;
  for (let d = parseIso(on) - 179; d <= parseIso(on); d += 1) if (present.has(d)) count += 1;
  return count;
}

describe("90/180 engine invariants (random histories)", () => {
  it("days used equals a brute-force count of distinct days in the 180-day window", () => {
    fc.assert(fc.property(history, day, (trips, on) => evaluate(trips, on).daysUsed === bruteDaysUsed(trips, on)), { numRuns: RUNS });
  });

  it("adding a trip never lowers days used and never raises days left", () => {
    fc.assert(
      fc.property(history, stay, day, (trips, extra, on) => {
        const before = evaluate(trips, on);
        const after = evaluate([...trips, extra], on);
        return after.daysUsed >= before.daysUsed && (after.present !== before.present || after.daysLeft <= before.daysLeft);
      }),
      { numRuns: RUNS },
    );
  });

  it("trip order and duplicate trips do not change the result", () => {
    fc.assert(
      fc.property(history, day, fc.integer(), (trips, on, seed) => {
        const shuffled = [...trips].sort((a, b) => ((a.entry + seed).localeCompare(b.entry + seed) * (seed % 2 ? 1 : -1)));
        const doubled = [...trips, ...trips];
        const base = evaluate(trips, on);
        for (const other of [evaluate(shuffled, on), evaluate(doubled, on)]) {
          expect([other.daysUsed, other.daysLeft, other.latestExit, other.overstay]).toEqual([base.daysUsed, base.daysLeft, base.latestExit, base.overstay]);
        }
      }),
      { numRuns: RUNS },
    );
  });

  it("days used stays within 0–180 and days left within 0–90", () => {
    fc.assert(
      fc.property(history, day, (trips, on) => {
        const r = evaluate(trips, on);
        return r.daysUsed >= 0 && r.daysUsed <= 180 && r.daysLeft >= 0 && r.daysLeft <= 90;
      }),
      { numRuns: RUNS },
    );
  });

  it("staying until the latest legal exit is legal, and one day more is not", () => {
    fc.assert(
      fc.property(history, day, (trips, on) => {
        const r = evaluate(trips, on);
        if (r.latestExit === null) return true;
        const legal = evaluate([...trips, { entry: on, exit: r.latestExit }], r.latestExit);
        expect(legal.overstay).toBe(false);
        expect(legal.daysUsed).toBeLessThanOrEqual(90);
        const oneMore = addDays(r.latestExit, 1);
        const over = evaluate([...trips, { entry: on, exit: oneMore }], oneMore);
        expect(over.daysUsed).toBeGreaterThan(90);
      }),
      { numRuns: RUNS },
    );
  });

  it("an overstay is reported exactly when a day of stay has more than 90 days in its window", () => {
    fc.assert(
      fc.property(history, (trips) => {
        const present = new Set<number>();
        for (const t of trips) for (let d = parseIso(t.entry); d <= parseIso(t.exit!); d += 1) present.add(d);
        const anyOver = [...present].some((d) => {
          let count = 0;
          for (let c = d - 179; c <= d; c += 1) if (present.has(c)) count += 1;
          return count > 90;
        });
        return (evaluate(trips, "2026-04-10").overstays.length > 0) === anyOver;
      }),
      { numRuns: RUNS },
    );
  }, 30_000);
});

describe("EES reconciliation invariants (random histories)", () => {
  it("records identical to the trips always match", () => {
    fc.assert(
      fc.property(history, day, (trips, on) => {
        const past = trips.filter((t) => t.exit! <= on);
        const r = reconcile(past, { daysUsed: evaluate(past, on).daysUsed, on, records: past });
        expect(r.codes).toEqual(["match"]);
        expect(r.differences).toEqual([]);
      }),
      { numRuns: RUNS },
    );
  });

  it("the figure gap is the EES figure minus the trips' comparable count", () => {
    fc.assert(
      fc.property(history, day, fc.integer({ min: 0, max: 180 }), (trips, on, figure) => {
        const r = reconcile(trips, { daysUsed: figure, on });
        expect(r.figureGap).toBe(figure - r.eesComparableDaysUsed);
        expect(r.codes.includes("figure-differs")).toBe(r.figureGap !== 0);
      }),
      { numRuns: RUNS },
    );
  });
});

describe("open stay invariants (random histories)", () => {
  it("a plan during an open stay fits only if the same dates as one closed stay are legal", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 60 }), fc.integer({ min: 1, max: 60 }), fc.integer({ min: 1, max: 90 }), (inside, gap, length) => {
        const today = "2026-10-19";
        const entry = formatIso(parseIso(today) - inside);
        const planEntry = formatIso(parseIso(today) + gap);
        const planExit = formatIso(parseIso(planEntry) + length - 1);
        const check = checkPlannedTrip([{ entry, exit: null }], today, { entry: planEntry, exit: planExit });
        const asOne = evaluate([{ entry, exit: planExit }], planExit);
        expect(check.fits).toBe(asOne.daysUsed <= 90);
      }),
      { numRuns: 1250 },
    );
  });
});
