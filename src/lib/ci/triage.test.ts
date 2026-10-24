import { describe, expect, it } from "vitest";
import * as triage from "../../../scripts/ci/triage.mjs";

const ctx = { runUrl: "https://github.com/o/r/actions/runs/1", sha: "abcdef1234", workflow: "TestSprite backend", repoUrl: "https://github.com/o/r", ref: "abcdef1234" };

describe("triage comment", () => {
  it("says no test ran when the gate wrote no results", () => {
    const body = triage.triageComment(null, ctx);
    expect(body).toContain(triage.MARKER);
    expect(body).toContain("stopped before any TestSprite test ran");
  });

  it("is null when every test passed", () => {
    expect(triage.triageComment({ target: "https://x", rows: [{ name: "BE01-a", id: "1", status: "passed" }] }, ctx)).toBeNull();
  });

  it("lists only the failing tests with cause, error line and code link", () => {
    const body = triage.triageComment({ target: "https://x.vercel.app", rows: [
      { name: "BE01-health", id: "1", status: "passed", runId: "r1" },
      { name: "BE07-status", id: "2", status: "failed", runId: "r2", detail: "AssertionError: expected 200, got 500" },
    ] }, ctx);
    expect(body).toContain("**1 of 2**");
    expect(body).toContain("BE07-status");
    expect(body).not.toContain("BE01-health |");
    expect(body).toContain("testsprite_tests/backend/BE07-status.py");
    expect(body).toContain("BACKEND_ONLY=BE07");
    expect(body).toContain("`r2`");
  });

  it("classifies from the error text", () => {
    expect(triage.classify({ status: "timedOut" })).toMatch(/timeout/);
    expect(triage.classify({ status: "error", exitCode: 11 })).toMatch(/rate limited/);
    expect(triage.classify({ status: "error", detail: "code put failed" })).toMatch(/infrastructure/);
    expect(triage.classify({ status: "failed", detail: "fetch failed ECONNREFUSED" })).toMatch(/unreachable/);
    expect(triage.classify({ status: "failed", detail: "AssertionError: expected 1" })).toMatch(/assertion/);
  });
});
