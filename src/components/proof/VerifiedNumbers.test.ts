import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import data from "@/data/verification.json";

const get = (id: string) => data.items.find((i) => i.id === id)!.value;
const json = (p: string) => JSON.parse(readFileSync(p, "utf8"));

describe("verified numbers on / and /proof", () => {
  it("UI and API counts match the suites the gates run", () => {
    const ui = Object.keys(json("testsprite_tests/test-ids.json")).filter((k) => k !== "projectId").length;
    const api = Object.keys(json("testsprite_tests/backend-ids.json")).filter((k) => /^BE\d+/.test(k)).length;
    expect(get("ui")).toBe(`${ui}/${ui}`);
    expect(get("api")).toBe(`${api}/${api}`);
    expect(readFileSync(".github/workflows/testsprite-backend.yml", "utf8")).toContain(`TestSprite backend (${api} API tests)`);
  });
  it("red-then-green count matches the generated loop log", () => {
    const its = json("src/data/loop-iterations.json").iterations as { redThenGreen: boolean }[];
    expect(get("redgreen")).toBe(String(its.filter((i) => i.redThenGreen).length));
  });
  it("fuzz and reference sizes match CI", () => {
    const ci = readFileSync(".github/workflows/ci.yml", "utf8");
    expect(ci).toMatch(/FUZZ_RUNS[^\n]*5000/);
    expect(ci).toMatch(/REF_CASES[^\n]*1200/);
  });
  it("mutation, deep parity and Vitest tiles match their sources", () => {
    expect(readFileSync("docs/evidence/mutation/summary.json", "utf8")).toContain("94.47");
    expect(readFileSync("src/lib/schengen/deep/deep.test.ts", "utf8")).toContain(`${get("deep")} scenarios match`);
    expect(readFileSync("README.md", "utf8")).toContain(`| Vitest | **${get("vitest")}** passing`);
  });
});
