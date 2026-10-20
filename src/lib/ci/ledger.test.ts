import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as ledger from "../../../scripts/ci/ledger.mjs";

const run = {
  id: 42,
  url: "https://github.com/o/r/actions/runs/42",
  workflow: "TestSprite CLI",
  event: "schedule",
  sha: "abcdef1234567890",
  conclusion: "failure",
  createdAt: "2026-10-21T02:29:00Z",
};

const junit = `<testsuites><testsuite>
  <testcase name="Example trips: 90 days used" runId="r1"></testcase>
  <testcase name="Letter &amp; law | Article 52" runId="r2"><failure message="Expected &quot;Article 52&quot;">x</failure></testcase>
</testsuite></testsuites>`;

describe("run ledger", () => {
  it("reads counts and failing tests from JUnit, decoding entities", () => {
    const s = ledger.summarizeJunit(junit);
    expect(s).toMatchObject({ total: 2, passed: 1, failed: 1 });
    expect(s.failing[0]).toEqual({ name: "Letter & law | Article 52", runId: "r2", message: 'Expected "Article 52"' });
    expect(ledger.summarizeJunit("")).toMatchObject({ total: 0, failed: 0, failing: [] });
  });

  it("ignores skipped and cancelled runs (every preview deployment produces a skipped run)", () => {
    for (const conclusion of ["skipped", "cancelled", "neutral"]) {
      expect(ledger.plan({ ...run, conclusion }, ledger.summarizeJunit(junit), null)).toEqual({ log: null, red: null });
    }
  });

  it("a red run with no open issue opens one with the run link and the failing test", () => {
    const step = ledger.plan(run, ledger.summarizeJunit(junit), null);
    expect(step.log).toContain("🔴 red");
    expect(step.log).toContain("1/2 passed");
    expect(step.red?.action).toBe("open");
    expect(step.red?.title).toBe("TestSprite CLI is red");
    expect(step.red?.body).toContain(run.url);
    expect(step.red?.body).toContain("Letter & law \\| Article 52");
    expect(step.red?.body).toContain("Fixes #");
  });

  it("a second red run comments on the open issue instead of opening another", () => {
    const step = ledger.plan(run, ledger.summarizeJunit(junit), 7);
    expect(step.red).toMatchObject({ action: "comment", issue: 7 });
    expect(step.red?.body).toContain("Still red");
  });

  it("a green run comments 'green again' on the open issue and leaves closing to the fix PR", () => {
    const green = { ...run, conclusion: "success" };
    const step = ledger.plan(green, { total: 2, passed: 2, failed: 0, failing: [] }, 7);
    expect(step.log).toContain("🟢 green");
    expect(step.red).toMatchObject({ action: "comment", issue: 7 });
    expect(step.red?.body).toContain("Green again");
    expect(ledger.plan(green, { total: 0, passed: 0, failed: 0, failing: [] }, null).red).toBeNull();
  });

  it("a red run without a JUnit report still opens an issue that says why", () => {
    const step = ledger.plan({ ...run, workflow: "Commission drift" }, ledger.summarizeJunit(""), null);
    expect(step.red?.body).toContain("No JUnit report");
  });
});

describe("Run ledger workflow", () => {
  const yaml = readFileSync(".github/workflows/run-ledger.yml", "utf8");
  it("listens to the TestSprite and Commission workflows by their exact names", () => {
    for (const file of ["testsprite-cli.yml", "drift.yml"]) {
      const name = readFileSync(`.github/workflows/${file}`, "utf8").match(/^name: (.+)$/m)?.[1];
      expect(yaml).toContain(`"${name}"`);
    }
  });
  it("can write issues but not code, and pins its actions", () => {
    expect(yaml).toMatch(/issues: write/);
    expect(yaml).toMatch(/contents: read/);
    expect(yaml).not.toMatch(/contents: write/);
    for (const m of yaml.matchAll(/uses: (\S+)/g)) expect(m[1]).toMatch(/@[0-9a-f]{40}$/);
  });
});
