import { describe, expect, it } from "vitest";
import { markdown, summarize } from "../../../scripts/a11y-report.mjs";

const page = (path: string, violations: { id: string; impact: string | null; nodes: string[] }[]) => ({ path, violations, passes: 20, incomplete: 1 });

describe("axe report", () => {
  it("counts elements by impact and fails only on serious or critical", () => {
    const minorOnly = summarize([page("/", [{ id: "region", impact: "minor", nodes: ["a", "b"] }])]);
    expect(minorOnly.ok).toBe(true);
    expect(minorOnly.rows[0]).toMatchObject({ rules: 1, nodes: 2, minor: 2, serious: 0, blocking: [] });
    const serious = summarize([page("/", []), page("/parity", [{ id: "color-contrast", impact: "serious", nodes: ["td"] }])]);
    expect(serious.ok).toBe(false);
    expect(serious.rows[1].blocking).toEqual(["color-contrast"]);
  });
  it("says what it measures and names the blocking pages", () => {
    const md = markdown(summarize([page("/parity", [{ id: "color-contrast", impact: "critical", nodes: ["td"] }])]), { url: "http://x", tags: ["wcag2aa"], axeVersion: "4.14.0" });
    expect(md).toContain("does not replace a manual audit");
    expect(md).toContain("| `/parity` | 1 | 1 | 1 | 0 | 0 | 0 | 20 | 1 |");
    expect(md).toContain("Blocking: `/parity` (color-contrast)");
  });
});

describe("a11y workflow", () => {
  it("runs on pull requests against a production build", async () => {
    const { readFileSync } = await import("node:fs");
    const yaml = readFileSync(".github/workflows/a11y.yml", "utf8");
    expect(yaml).toMatch(/^ {2}pull_request:/m);
    expect(yaml).toContain("npm run build");
    expect(yaml).toContain("npm run a11y -- http://localhost:3000");
  });
});
