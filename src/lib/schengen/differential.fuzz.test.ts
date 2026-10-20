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
import type { StayInput } from "./engine";
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

/** Sorted, non-overlapping stays (the calculator's input model), and a control date on or after the last exit. */
export function randomHistory(rand: () => number): { stays: StayInput[]; on: IsoDate } {
  const count = 1 + Math.floor(rand() * 6);
  let cursor = parseIso("2024-01-01") + Math.floor(rand() * 400);
  const stays: StayInput[] = [];
  for (let i = 0; i < count; i += 1) {
    const length = 1 + Math.floor(rand() * (rand() < 0.3 ? 95 : 30));
    stays.push({ entry: formatIso(cursor), exit: formatIso(cursor + length - 1) });
    cursor += length + 1 + Math.floor(rand() * 60);
  }
  const lastExit = parseIso(stays[stays.length - 1].exit as IsoDate);
  const on = formatIso(rand() < 0.5 ? lastExit : lastExit + Math.floor(rand() * 120));
  return { stays, on };
}

describe(`differential fuzz vs the Commission calculator (seed ${SEED}, ${RUNS} histories)`, () => {
  it("agrees on every random history", () => {
    const rand = mulberry32(SEED);
    const failures: string[] = [];
    for (let run = 0; run < RUNS; run += 1) {
      const scenario = randomHistory(rand);
      const result = runCommissionScenario(VENDORED_HTML, scenario.stays, scenario.on);
      const problems = compareScenario(scenario, result.control, result.planning);
      if (problems.length > 0) failures.push(`run ${run}: ${JSON.stringify(scenario)} → ${problems.join(" ")}`);
    }
    expect(failures, `seed ${SEED}\n${failures.slice(0, 5).join("\n")}`).toEqual([]);
  }, 300_000);
});
