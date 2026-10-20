import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("packages/ninety-mcp npm test", () => {
  it("passes test files to node --test, not a directory (Node 22, which CI pins, reads `test/` as a module and fails)", () => {
    const pkg = JSON.parse(readFileSync("packages/ninety-mcp/package.json", "utf8")) as { scripts: { test: string } };
    const args = pkg.scripts.test.split("node --test")[1]?.trim().split(/\s+/).filter(Boolean) ?? [];
    expect(args.length).toBeGreaterThan(0);
    for (const a of args) expect(a, a).toMatch(/\.test\.mjs$/);
  });
});
