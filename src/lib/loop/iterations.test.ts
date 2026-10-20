import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Check = { sha: string; state: string; execution: string; description: string | null };
type Iteration = { n: number; pr: number; mergeCommit: string; checks: Check[]; redThenGreen: boolean; stoppedThenGreen: boolean };
const data = JSON.parse(readFileSync("src/data/loop-iterations.json", "utf8")) as { iterations: Iteration[] };
const md = readFileSync("LOOP-ITERATIONS.md", "utf8");

describe("LOOP-ITERATIONS (generated from the GitHub API and TestSprite history)", () => {
  it("numbers the iterations 1..N with one merged PR each", () => {
    expect(data.iterations.map((i) => i.n)).toEqual(data.iterations.map((_, k) => k + 1));
    expect(new Set(data.iterations.map((i) => i.pr)).size).toBe(data.iterations.length);
    for (const i of data.iterations) expect(i.mergeCommit).toMatch(/^[0-9a-f]{40}$/);
  });

  it("links each check to a TestSprite execution (a run that never started has none)", () => {
    for (const c of data.iterations.flatMap((i) => i.checks)) {
      if (c.execution === null) { expect(c.description).toMatch(/could not start/); continue; }
      expect(c.execution).toMatch(/^https:\/\/www\.testsprite\.com\/dashboard-v3\/o\/[0-9a-f-]+\/projects\/[0-9a-f-]+\/execution\/[0-9a-f-]{36}$/);
    }
  });

  it("calls an iteration red-then-green only when a check reported failed tests and a later commit passed", () => {
    for (const i of data.iterations.filter((x) => x.redThenGreen)) {
      const red = i.checks.findIndex((c) => c.state === "failure" && /\d+ failed/.test(c.description ?? ""));
      expect(red, `#${i.pr}`).toBeGreaterThanOrEqual(0);
      expect(i.checks.slice(red + 1).some((c) => c.state === "success"), `#${i.pr}`).toBe(true);
    }
  });

  it("the markdown has one heading per iteration", () => {
    expect((md.match(/^## Iteration \d+:/gm) ?? []).length).toBe(data.iterations.length);
  });
});
