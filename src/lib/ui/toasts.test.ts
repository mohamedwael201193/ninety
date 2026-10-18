import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { UNDO_TOAST_DURATION } from "./toasts";

describe("undo toast", () => {
  it("persists until dismissed", () => {
    expect(UNDO_TOAST_DURATION).toBe(Infinity);
    const shell = readFileSync("src/components/AppShell.tsx", "utf8");
    expect(shell).toMatch(/toast\("Trip deleted",[\s\S]*duration: UNDO_TOAST_DURATION/);
  });
});
