import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Check = { sha: string; state: string; execution: string; description: string | null };
type Iteration = { n: number; pr: number; mergeCommit: string; checks: Check[]; redThenGreen: boolean; stoppedThenGreen: boolean; kind: string | null };
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

  it("classifies every red-then-green PR as an app defect or a test plan or CI case, and the README and LOOP.md agree", () => {
    const rg = data.iterations.filter((i) => i.redThenGreen);
    for (const i of rg) expect(["app", "ux", "plan-ci"], `#${i.pr}`).toContain(i.kind);
    const app = rg.filter((i) => i.kind === "app").length;
    const ux = rg.filter((i) => i.kind === "ux").length;
    const readme = readFileSync("README.md", "utf8");
    const loopMd = readFileSync("LOOP.md", "utf8");
    expect(readme).toContain(`${rg.length} iterations went red, then green (${app} app defects, ${ux} UX loading state, ${rg.length - app - ux} test plan or CI)`);
    // The headline row: app bugs + UX loading-state catches + review bugs.
    expect(readme).toContain(`| **${app + 1} + ${ux} + 8** |`); // +1: #41 caught two app bugs in one PR
    expect(loopMd).toMatch(new RegExp(`gives ${rg.length}: the red-then-green count`));
    expect(loopMd).toContain(`${app} app defects (`);
    // Each fraction the README quotes for a PR is that PR's GitHub check, word for word.
    for (const m of readme.matchAll(/^\| #(\d+) \| `([^`]+)`/gm)) {
      const it = data.iterations.find((i) => i.pr === Number(m[1]));
      expect(it?.checks.map((c) => c.description), `#${m[1]}`).toContain(m[2]);
    }
  });
});
