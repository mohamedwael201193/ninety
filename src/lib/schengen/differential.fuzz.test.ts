/**
 * Differential fuzzer: random travel histories run through Ninety's engine and
 * through the European Commission's own calculator script (the vendored,
 * hashed copy), and the answers must agree.
 *
 * FUZZ_RUNS sets the number of histories (default 150; CI runs 500).
 * FUZZ_SEED sets the seed (default fixed so a PR run is reproducible; the
 * nightly job passes a fresh one). A disagreement prints the seed and the
 * history so it can be pinned as a golden test.
 */
import { describe, expect, it } from "vitest";
import { formatIso, parseIso, type IsoDate } from "./dates";
import { runCommissionScenario } from "./commission-reference";
import { compareScenario } from "./parity";
import { evaluate, type StayInput } from "./engine";
import { VENDORED_HTML } from "./vendor/commission-calculator";

const RUNS = Number(process.env.FUZZ_RUNS ?? 150);
const SEED = Number(process.env.FUZZ_SEED ?? 20261019);

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

export type FuzzCase = {
  /** What Ninety is given: may be out of order, overlapping, end with an open stay, or hold a reversed trip. */
  stays: StayInput[];
  /** What the Commission calculator is given: the same days in date order, an open stay closed on the control date. */
  calculatorStays: StayInput[];
  on: IsoDate;
  /** True when one trip has its exit before its entry: both tools must refuse to count. */
  reversed: boolean;
  shape: string[];
};

// Start dates are drawn from 2024 onward, and one history in four starts in the weeks around the
// EES start (10 April 2026) and the spring 2026 clock change (29 March).
const AROUND_CUTOFF = parseIso("2026-03-15");

/**
 * A random history in one of the shapes travellers actually produce: overlapping trips (a
 * duplicated or corrected entry), trips typed out of order, a stay still in progress, and now
 * and then a trip with its exit before its entry. The control date is on or after the last exit,
 * because the calculator refuses an exit after the control date.
 */
export function randomHistory(rand: () => number): FuzzCase {
  const shape: string[] = [];
  const count = 1 + Math.floor(rand() * 6);
  let cursor = rand() < 0.25 ? AROUND_CUTOFF + Math.floor(rand() * 40) : parseIso("2024-01-01") + Math.floor(rand() * 400);
  if (cursor >= AROUND_CUTOFF && cursor < AROUND_CUTOFF + 40) shape.push("around-10-april-2026");
  const sorted: { entry: number; exit: number }[] = [];
  for (let i = 0; i < count; i += 1) {
    const length = 1 + Math.floor(rand() * (rand() < 0.3 ? 95 : 30));
    sorted.push({ entry: cursor, exit: cursor + length - 1 });
    if (rand() < 0.15) {
      shape.push("overlap");
      cursor += Math.max(1, Math.floor(length / 2)); // the next trip starts inside this one
    } else {
      cursor += length + 1 + Math.floor(rand() * 60);
    }
  }
  const lastExit = Math.max(...sorted.map((s) => s.exit));
  const open = rand() < 0.2;
  let on = rand() < 0.5 ? lastExit : lastExit + Math.floor(rand() * 120);
  const calculatorStays: StayInput[] = sorted.map((s) => ({ entry: formatIso(s.entry), exit: formatIso(s.exit) }));
  let stays: StayInput[] = calculatorStays.map((s) => ({ ...s }));
  if (open) {
    // The last trip has no exit yet: Ninety counts it through the control date; the calculator is
    // given that same stay closed on the control date.
    shape.push("open-stay");
    const last = sorted.reduce((a, b) => (b.entry > a.entry ? b : a));
    on = Math.max(on, last.exit);
    const i = sorted.indexOf(last);
    stays[i] = { entry: formatIso(last.entry), exit: null };
    calculatorStays[i] = { entry: formatIso(last.entry), exit: formatIso(on) };
  }
  if (rand() < 0.3) {
    shape.push("out-of-order");
    stays = [...stays].reverse();
  }
  let reversed = false;
  if (rand() < 0.05) {
    shape.push("exit-before-entry");
    reversed = true;
    const bad = { entry: formatIso(lastExit + 10), exit: formatIso(lastExit + 3) };
    stays = [...stays, bad];
    calculatorStays.push(bad);
    on = Math.max(on, lastExit + 10);
  }
  // The calculator refuses overlapping stays (except, through an off-by-one in its own check, an
  // overlap between the first two), so it is given the same days as merged, non-overlapping stays.
  const merged = mergeForCalculator(calculatorStays.filter((st) => st.exit !== null && st.exit >= st.entry));
  const bad = calculatorStays.filter((st) => st.exit !== null && st.exit < st.entry);
  calculatorStays.length = 0;
  calculatorStays.push(...merged, ...bad);
  if (formatIso(on) === "2026-03-29" || sorted.some((s) => s.entry <= parseIso("2026-03-29") && s.exit >= parseIso("2026-03-29"))) shape.push("spring-clock-change-2026");
  return { stays, calculatorStays, on: formatIso(on), reversed, shape };
}

/** Merge stays where an entry falls before the previous exit; same-day exit and re-entry stays separate, as the calculator accepts it. */
export function mergeForCalculator(stays: StayInput[]): StayInput[] {
  const sorted = [...stays].sort((a, b) => a.entry.localeCompare(b.entry));
  const out: StayInput[] = [];
  for (const st of sorted) {
    const last = out[out.length - 1];
    if (last && st.entry < (last.exit as string)) {
      if ((st.exit as string) > (last.exit as string)) last.exit = st.exit;
    } else out.push({ ...st });
  }
  return out;
}

const REFUSED = "Calculation of stay is not possible";

/** Problems with one case; empty when Ninety and the calculator agree (or both refuse an impossible trip). */
export function disagreement(c: FuzzCase, html: string): string[] {
  const result = runCommissionScenario(html, c.calculatorStays, c.on);
  if (c.reversed) {
    const refusedByCalculator = [...result.control, ...result.planning].some((l) => l.includes(REFUSED));
    const refusedByNinety = evaluate(c.stays, c.on).errors.some((e) => e.includes("ends before it starts"));
    return refusedByCalculator && refusedByNinety ? [] : [`Reversed trip: calculator refused ${refusedByCalculator}, Ninety refused ${refusedByNinety}.`];
  }
  return compareScenario({ stays: c.stays, on: c.on }, result.control, result.planning);
}

describe(`differential fuzz vs the Commission calculator (seed ${SEED}, ${RUNS} histories)`, () => {
  it("agrees on every random history", () => {
    const rand = mulberry32(SEED);
    const failures: string[] = [];
    const shapes: Record<string, number> = {};
    for (let run = 0; run < RUNS; run += 1) {
      const c = randomHistory(rand);
      for (const s of c.shape) shapes[s] = (shapes[s] ?? 0) + 1;
      const problems = disagreement(c, VENDORED_HTML);
      if (problems.length > 0) failures.push(`run ${run}: ${JSON.stringify(c)} → ${problems.join(" ")}`);
    }
    // One line for the CI log: the seed to replay and what the histories covered.
    console.log(`differential fuzz: seed ${SEED}, ${RUNS} histories, ${failures.length} disagreements, shapes ${JSON.stringify(shapes)}`);
    expect(failures, `seed ${SEED}\n${failures.slice(0, 5).join("\n")}`).toEqual([]);
  }, 300_000);
});

describe("pinned fuzz finding", () => {
  it("seed 20261019, run 14: overlapping trips that overstay are listed once, as the calculator lists the merged stay", () => {
    const stays: StayInput[] = [
      { entry: "2024-01-29", exit: "2024-02-03" }, { entry: "2024-03-25", exit: "2024-04-07" }, { entry: "2024-04-16", exit: "2024-05-09" },
      { entry: "2024-05-23", exit: "2024-07-23" }, { entry: "2024-06-23", exit: "2024-08-27" }, { entry: "2024-10-23", exit: "2024-10-27" },
    ];
    const c: FuzzCase = { stays, calculatorStays: mergeForCalculator(stays), on: "2024-10-27", reversed: false, shape: ["overlap"] };
    expect(disagreement(c, VENDORED_HTML)).toEqual([]);
  });
});

