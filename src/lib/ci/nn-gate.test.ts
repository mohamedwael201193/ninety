import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as gate from "../../../scripts/ci/nn-gate.mjs";

// Real payloads recorded from this repository's own PRs (GitHub API, unedited):
//   v3-statuses-pr57-78ee487  GET commits/78ee487…/statuses  "34/43 passed · 8 failed · 1 blocked"
//   v3-statuses-pr57-dae0081  GET commits/dae0081…/statuses  "42/43 passed · 1 failed"
//   v3-statuses-pr57-1963cc1  GET commits/1963cc1…/statuses  "All 43 tests passed"
//   backend-results-pr68-db7776c  artifact of Actions run 40047453023 (0/30: every trigger rate limited)
//   backend-results-pr69-1e49cea  artifact of Actions run 40051369568 (30/30)
const fx = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), "utf8"));
const partial = fx("v3-statuses-pr57-dae0081");
const blocked = fx("v3-statuses-pr57-78ee487");
const full = fx("v3-statuses-pr57-1963cc1");
const backRed = fx("backend-results-pr68-db7776c");
const backGreen = fx("backend-results-pr69-1e49cea");
const BE = 30;

describe("TestSprite N/N gate", () => {
  it("reads both description formats TestSprite posts", () => {
    expect(gate.parseDescription("All 54 tests passed")).toEqual({ passed: 54, total: 54 });
    expect(gate.parseDescription("42/43 passed · 1 failed")).toEqual({ passed: 42, total: 43 });
    expect(gate.parseDescription("34/43 passed · 8 failed · 1 blocked")).toEqual({ passed: 34, total: 43 });
    expect(gate.parseDescription("43 tests queued")).toBeNull();
    expect(gate.parseDescription("TestSprite could not start this run. See the project activity for details.")).toBeNull();
  });

  it("fails the recorded 42/43 run on PR #57 (dae0081)", () => {
    const r = gate.frontendResult(partial);
    expect(r).toMatchObject({ ok: false, pending: false, passed: 42, total: 43 });
    expect(gate.decide(r, gate.backendResult(backGreen, BE)).ok).toBe(false);
  });

  it("fails the recorded 34/43 run with a blocked test (78ee487)", () => {
    expect(gate.frontendResult(blocked)).toMatchObject({ ok: false, passed: 34, total: 43 });
  });

  it("passes the recorded 43/43 run (1963cc1) only with a full backend run", () => {
    const r = gate.frontendResult(full);
    expect(r).toMatchObject({ ok: true, passed: 43, total: 43 });
    expect(gate.decide(r, gate.backendResult(backGreen, BE)).ok).toBe(true);
    expect(gate.decide(r, gate.backendResult(backRed, BE)).ok).toBe(false);
  });

  it("reads the recorded backend artifacts: 30/30 on #69, 0/30 on #68", () => {
    expect(gate.backendResult(backGreen, BE)).toMatchObject({ ok: true, passed: 30, total: 30 });
    expect(gate.backendResult(backRed, BE)).toMatchObject({ ok: false, passed: 0, total: 30 });
  });

  // The cases below have no real example on this repo, so they are built from the recorded payloads
  // to show the gate fails closed on each.
  it("waits while only the pending status exists, and treats no status as not done", () => {
    expect(gate.frontendResult(full.filter((s: { state: string }) => s.state === "pending"))).toMatchObject({ ok: false, pending: true });
    expect(gate.frontendResult([])).toMatchObject({ ok: false, pending: true });
    expect(gate.frontendResult(null)).toMatchObject({ ok: false, pending: true });
  });

  it("fails a success state whose numbers are not N/N, and a status not posted by the App", () => {
    const newest = full.find((s: { state: string }) => s.state === "success");
    const lying = [{ ...newest, id: newest.id + 1, created_at: "2099-01-01T00:00:00Z", description: "42/43 passed · 1 failed" }, ...full];
    expect(gate.frontendResult(lying)).toMatchObject({ ok: false, passed: 42, total: 43 });
    const forged = [{ ...newest, id: newest.id + 1, created_at: "2099-01-01T00:00:00Z", creator: { login: "someone" } }, ...full];
    expect(gate.frontendResult(forged).ok).toBe(false);
    const unreadable = [{ ...newest, id: newest.id + 1, created_at: "2099-01-01T00:00:00Z", description: "done" }, ...full];
    expect(gate.frontendResult(unreadable).ok).toBe(false);
    const zero = [{ ...newest, id: newest.id + 1, created_at: "2099-01-01T00:00:00Z", description: "All 0 tests passed" }, ...full];
    expect(gate.frontendResult(zero).ok).toBe(false);
  });

  it("fails a missing, short or zero-size backend result", () => {
    expect(gate.backendResult(null, BE).ok).toBe(false);
    expect(gate.backendResult({ rows: backGreen.rows.slice(1) }, BE).ok).toBe(false);
    expect(gate.backendResult({ rows: [] }, 0).ok).toBe(false);
    // In CI the gate also requires the file to name the PR head SHA it tested.
    const head = "1e49cea".padEnd(40, "0");
    expect(gate.backendResult(backGreen, BE, head).ok).toBe(false);
    expect(gate.backendResult({ ...backGreen, sha: head }, BE, head).ok).toBe(true);
  });

  it("accepts the backend's explicit docs-only skip, never a missing file by itself", () => {
    const r = gate.frontendResult(full);
    expect(gate.decide(r, gate.backendResult(null, BE)).ok).toBe(false);
    expect(gate.decide(r, gate.backendResult(null, BE), { docsOnly: true }).ok).toBe(true);
    expect(gate.decide(gate.frontendResult(partial), gate.backendResult(null, BE), { docsOnly: true }).ok).toBe(false);
  });

  it("is wired into the backend workflow under the required check's name", () => {
    const wf = readFileSync(".github/workflows/testsprite-backend.yml", "utf8");
    expect(wf).toContain("name: TestSprite N/N gate");
    expect(wf).toContain("node scripts/ci/nn-gate.mjs");
  });
});
