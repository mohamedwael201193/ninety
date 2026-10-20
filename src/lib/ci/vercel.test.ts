import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const { ignoreCommand } = JSON.parse(readFileSync("vercel.json", "utf8")) as { ignoreCommand: string };

describe("vercel.json ignoreCommand", () => {
  // PR #44: the last commit only touched CI and docs, so the preview build was skipped, the
  // preview URL served "Deployment was cancelled" and TestSprite V3 came back 0/17, all blocked.
  it("never skips a preview build: TestSprite V3 tests every PR preview", () => {
    expect(ignoreCommand.startsWith('[ "$VERCEL_ENV" = "production" ] &&')).toBe(true);
  });
  it("still skips production builds of CI/docs-only commits", () => {
    expect(ignoreCommand).toContain("git diff --quiet HEAD^ HEAD -- .");
    for (const path of [".github", "docs", "*.md"]) expect(ignoreCommand).toContain(`':(exclude)${path}'`);
  });
});
