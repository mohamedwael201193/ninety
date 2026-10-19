import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(`.github/workflows/${name}`, "utf8");

/** The `on:` block of a workflow, as the list of trigger names. */
function triggers(yaml: string): string[] {
  const block = yaml.split(/^on:\s*$/m)[1]?.split(/^\S/m)[0] ?? "";
  return [...block.matchAll(/^ {2}([a-z_]+):/gm)].map((m) => m[1]);
}

describe("TestSprite CLI workflow", () => {
  const yaml = read("testsprite-cli.yml");
  it("never runs on push or pull_request (every run bills the whole suite)", () => {
    expect(triggers(yaml).sort()).toEqual(["schedule", "workflow_dispatch"]);
  });
  it("runs on schedule only when TESTSPRITE_NIGHTLY is switched on", () => {
    expect(yaml).toContain("if: ${{ github.event_name == 'workflow_dispatch' || vars.TESTSPRITE_NIGHTLY == 'true' }}");
  });
  it("writes a JUnit report and uploads it even when tests fail", () => {
    expect(yaml).toMatch(/--report junit --report-file testsprite-junit\.xml/);
    expect(yaml).toMatch(/Upload JUnit report and summary\n\s+if: always\(\)/);
  });
  it("pins the CLI version and reads the key only from the secret", () => {
    expect(yaml).toMatch(/@testsprite\/testsprite-cli@\d+\.\d+\.\d+/);
    const keyLines = yaml.match(/TESTSPRITE_API_KEY: .+/g) ?? [];
    expect(keyLines.length).toBeGreaterThan(0);
    expect(keyLines.every((l) => l.endsWith("${{ secrets.TESTSPRITE_API_KEY }}"))).toBe(true);
  });
});

describe("CI workflow", () => {
  it("runs unit tests on pull requests", () => {
    expect(triggers(read("ci.yml"))).toContain("pull_request");
  });
});
