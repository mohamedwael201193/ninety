/**
 * Ninety's engine against an independent reference of the 90/180 rule (reference-rule.ts, written
 * from Regulation (EU) 2016/399 Art. 6(1) and the Commission manual; no code shared with engine.ts).
 *
 * REF_CASES (default 1200) generated histories, seeded (REF_SEED, default 20261024), so a run
 * reproduces exactly. Half are random past histories; half put the date on a boundary: day 180
 * and day 181 after a stay day, 29 February (2024, 2028), the year change and the 2026 clock
 * changes. Every field must agree: days used, present, overstay, days left, latest exit.
 */
import { describe, expect, it } from "vitest";
import { evaluate } from "./engine";
import { referenceAnswer, refDay, refIso } from "./reference-rule";

const CASES = Number(process.env.REF_CASES ?? 1200);
const SEED = Number(process.env.REF_SEED ?? 20261024);

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ANCHORS = ["2024-02-29", "2028-02-29", "2026-12-31", "2027-01-01", "2026-03-29", "2026-10-25", "2025-12-31"];

type Case = { stays: { entry: string; exit: string }[]; on: string; kind: string };

export function generate(rand: () => number, i: number): Case {
  const boundary = i % 2 === 1;
  const anchor = refDay(ANCHORS[Math.floor(rand() * ANCHORS.length)]);
  let cursor = boundary ? anchor - 200 - Math.floor(rand() * 60) : refDay("2023-06-01") + Math.floor(rand() * 1500);
  const stays: { entry: number; exit: number }[] = [];
  const n = 1 + Math.floor(rand() * 6);
  for (let k = 0; k < n; k += 1) {
    const len = 1 + Math.floor(rand() * (rand() < 0.3 ? 100 : 35));
    stays.push({ entry: cursor, exit: cursor + len - 1 });
    cursor += rand() < 0.15 ? Math.max(1, Math.floor(len / 2)) : rand() < 0.1 ? len - 1 : len + Math.floor(rand() * 50); // overlaps and same-day re-entry too
  }
  const lastExit = Math.max(...stays.map((s) => s.exit));
  let on: number;
  let kind = "random";
  if (boundary) {
    const pick = rand();
    const someDay = stays[Math.floor(rand() * stays.length)];
    if (pick < 0.4) { on = Math.max(lastExit, someDay.entry + 179 + (rand() < 0.5 ? 0 : 1)); kind = "day-180-181"; }
    else if (pick < 0.8) { on = Math.max(lastExit, anchor + Math.floor(rand() * 3) - 1); kind = "anchor"; }
    else { on = lastExit; kind = "last-exit"; }
  } else on = lastExit + (rand() < 0.4 ? 0 : Math.floor(rand() * 200));
  return { stays: stays.map((s) => ({ entry: refIso(s.entry), exit: refIso(s.exit) })), on: refIso(on), kind };
}

describe(`engine vs independent reference (seed ${SEED}, ${CASES} cases)`, () => {
  it("agrees on days used, presence, overstay, days left and latest exit for every case", () => {
    const rand = mulberry32(SEED);
    const kinds: Record<string, number> = {};
    for (let i = 0; i < CASES; i += 1) {
      const c = generate(rand, i);
      kinds[c.kind] = (kinds[c.kind] ?? 0) + 1;
      const ref = referenceAnswer(c.stays, c.on);
      const a = evaluate(c.stays, c.on, c.on);
      const got = { daysUsed: a.daysUsed, present: a.present, overstay: a.overstay, daysLeft: a.daysLeft, latestExit: a.latestExit };
      expect(got, `case ${i} (${c.kind}) on ${c.on}: ${JSON.stringify(c.stays)}`).toEqual(ref);
    }
    expect(Object.values(kinds).reduce((x, y) => x + y, 0)).toBe(CASES);
    expect(kinds["day-180-181"] ?? 0).toBeGreaterThan(0);
    expect(kinds.anchor ?? 0).toBeGreaterThan(0);
  }, 300_000);
});

/** Worked by hand; both the reference and the engine must give these numbers. */
const NAMED: { name: string; stays: { entry: string; exit: string }[]; on: string; used: number; present: boolean; overstay: boolean; left: number }[] = [
  { name: "leap day counts on day 180 (2024-02-29 + 179 = 2024-08-26)", stays: [{ entry: "2024-02-29", exit: "2024-02-29" }], on: "2024-08-26", used: 1, present: false, overstay: false, left: 90 },
  { name: "leap day has left the window on day 181 (2024-08-27)", stays: [{ entry: "2024-02-29", exit: "2024-02-29" }], on: "2024-08-27", used: 0, present: false, overstay: false, left: 90 },
  { name: "day 180 counts, day 181 does not (2026-01-01 on 2026-06-29 / 2026-06-30)", stays: [{ entry: "2026-01-01", exit: "2026-01-01" }], on: "2026-06-29", used: 1, present: false, overstay: false, left: 90 },
  { name: "day 181: 2026-01-01 is out of the window on 2026-06-30", stays: [{ entry: "2026-01-01", exit: "2026-01-01" }], on: "2026-06-30", used: 0, present: false, overstay: false, left: 90 },
  { name: "spring clock change 2026: 28-30 March is 3 days, 87 more allowed", stays: [{ entry: "2026-03-28", exit: "2026-03-30" }], on: "2026-03-30", used: 3, present: true, overstay: false, left: 87 },
  { name: "autumn clock change 2026: 24-26 October is 3 days, 87 more allowed", stays: [{ entry: "2026-10-24", exit: "2026-10-26" }], on: "2026-10-26", used: 3, present: true, overstay: false, left: 87 },
  { name: "year boundary: 2026-12-30 to 2027-01-02 is 4 days, 86 more allowed", stays: [{ entry: "2026-12-30", exit: "2027-01-02" }], on: "2027-01-02", used: 4, present: true, overstay: false, left: 86 },
  { name: "exactly 90 days (1 January to 31 March 2026) is legal, 0 left", stays: [{ entry: "2026-01-01", exit: "2026-03-31" }], on: "2026-03-31", used: 90, present: true, overstay: false, left: 0 },
  { name: "day 91 (to 1 April 2026) is an overstay", stays: [{ entry: "2026-01-01", exit: "2026-04-01" }], on: "2026-04-01", used: 91, present: true, overstay: true, left: 0 },
];

describe("named edge cases, worked by hand", () => {
  for (const c of NAMED) {
    it(c.name, () => {
      const ref = referenceAnswer(c.stays, c.on);
      const a = evaluate(c.stays, c.on, c.on);
      for (const got of [ref, a]) {
        expect(got.daysUsed).toBe(c.used);
        expect(got.present).toBe(c.present);
        expect(got.overstay).toBe(c.overstay);
        expect(got.daysLeft).toBe(c.left);
      }
    });
  }
});
