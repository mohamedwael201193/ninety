import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { failedRunIds } from "../../../scripts/ci/failed-runs.mjs";

const read = (name: string) => readFileSync(`.github/workflows/${name}`, "utf8");

/** The `on:` block of a workflow, as the list of trigger names. */
function triggers(yaml: string): string[] {
  const block = yaml.split(/^on:\s*$/m)[1]?.split(/^\S/m)[0] ?? "";
  return [...block.matchAll(/^ {2}([a-z_]+):/gm)].map((m) => m[1]);
}

describe("TestSprite CLI workflow", () => {
  const yaml = read("testsprite-cli.yml");

  it("never runs on push or pull_request (every run bills the whole suite)", () => {
    expect(triggers(yaml).sort()).toEqual(["deployment_status", "schedule", "workflow_dispatch"]);
  });

  it("after a merge, runs only on a successful Production deployment of main, and only when TESTSPRITE_ON_MAIN is on", () => {
    expect(yaml).toContain("github.event.deployment_status.state == 'success'");
    expect(yaml).toContain("github.event.deployment.environment == 'Production'");
    expect(yaml).toContain("github.event.deployment.ref == 'main'");
    expect(yaml).toContain("vars.TESTSPRITE_ON_MAIN == 'true'");
  });

  it("runs nightly only when TESTSPRITE_NIGHTLY is switched on (off by default)", () => {
    expect(yaml).toContain("github.event_name == 'schedule' && vars.TESTSPRITE_NIGHTLY == 'true'");
  });

  it("uses the official TestSprite action pinned to a commit, with a pinned CLI", () => {
    expect(yaml).toMatch(/uses: TestSprite\/testsprite-action@[0-9a-f]{40}\b/);
    expect(yaml).toMatch(/TESTSPRITE_CLI_VERSION: "\d+\.\d+\.\d+"/);
  });

  it("pins every third-party action to a full commit SHA", () => {
    const uses = [...yaml.matchAll(/uses: (\S+)/g)].map((m) => m[1]);
    expect(uses.length).toBeGreaterThan(3);
    for (const ref of uses) expect(ref, ref).toMatch(/@[0-9a-f]{40}$/);
  });

  it("runs testsprite doctor before spending credits", () => {
    expect(yaml.indexOf("testsprite doctor")).toBeGreaterThan(-1);
    expect(yaml.indexOf("testsprite doctor")).toBeLessThan(yaml.indexOf("TestSprite/testsprite-action@"));
  });

  it("publishes the JUnit report as test results and keeps failure bundles even when tests fail", () => {
    expect(yaml).toContain("dorny/test-reporter@");
    expect(yaml).toContain("reporter: java-junit");
    expect(yaml).toMatch(/Failure bundles for every failed test\n\s+if: \$\{\{ failure\(\)/);
    expect(yaml).toContain("testsprite test artifact get");
    expect(yaml).toMatch(/Job summary\n\s+if: \$\{\{ always\(\) \}\}/);
  });

  it("reads the key only from the repository secret", () => {
    const keyLines = yaml.match(/(TESTSPRITE_API_KEY|api-key): .+/g) ?? [];
    expect(keyLines.length).toBeGreaterThan(0);
    expect(keyLines.every((l) => l.endsWith("${{ secrets.TESTSPRITE_API_KEY }}"))).toBe(true);
  });
});

describe("failed run ids from a JUnit report", () => {
  it("returns the run of each failed case, once, and ignores passed cases", () => {
    const xml = `<testsuites><testsuite>
      <testcase name="a" runId="run-ok"></testcase>
      <testcase name="b" runId="run-bad"><failure message="x">boom</failure></testcase>
      <testcase name="c" runId="run-err"><error message="y"/></testcase>
      <testcase name="d" runId="run-self"/>
      <testcase name="e" runId="run-bad"><failure/></testcase>
    </testsuite></testsuites>`;
    expect(failedRunIds(xml)).toEqual(["run-bad", "run-err"]);
  });

  it("drops a run id that is not a plain token (it reaches a shell)", () => {
    expect(failedRunIds(`<testcase runId="x;rm -rf /"><failure/></testcase>`)).toEqual([]);
  });
});

describe("CI workflow", () => {
  it("runs unit tests on pull requests", () => {
    expect(triggers(read("ci.yml"))).toContain("pull_request");
  });
});
