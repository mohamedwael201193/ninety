/**
 * Bugs found by an independent Cursor review of the code and reproduced here, one test each.
 * Rule sources are in /BUG_HUNT_LEDGER.md (kept outside the repo) and the test names.
 */
import { describe, expect, it } from "vitest";
import { checkPlannedTrip, evaluate } from "@/lib/schengen/engine";
import { reconcile } from "@/lib/ees/reconcile";
import { article52Letter } from "@/lib/api/v1";
import { callTool } from "@/lib/api/mcp-tools";
import { handle } from "@/lib/api/http";
import { handleMcp } from "@/lib/api/mcp-http";

const identity = { fullName: "Ana Test", dateOfBirth: "1990-01-01", nationality: "Brazilian", documentNumber: "X1", email: "a@example.com", memberState: "France" };

describe("02: a planned trip must respect later booked stays (Art. 6(1) Schengen Borders Code: any 180-day window)", () => {
  const history = [{ entry: "2026-07-01", exit: "2026-09-28" }]; // 90 days
  it("1 day on 2026-06-01 does not fit: the 180 days ending 2026-09-28 would hold 91", () => {
    const r = checkPlannedTrip(history, "2026-01-15", { entry: "2026-06-01", exit: "2026-06-01" });
    expect(r.fits).toBe(false);
  });
  it("the status line on 2026-01-15 gives no latest exit that runs into that window", () => {
    // Entering on 2026-01-15: a stay up to 2026-03-31 (76 days) is still clear of every window
    // that also holds July to September? The window ending 2026-07-01 starts 2026-01-03, so any
    // day from 2026-01-15 counts with 07-01. The first window that also holds all 90 later days ends
    // 09-28 and starts 04-02; days before 04-02 are free of it. Brute force decides.
    const a = evaluate(history, "2026-01-15");
    const free = (len: number) => {
      const days = new Set<number>();
      const d0 = Date.UTC(2026, 0, 15) / 864e5;
      for (let i = 0; i < len; i++) days.add(d0 + i);
      for (let d = Date.UTC(2026, 6, 1) / 864e5; d <= Date.UTC(2026, 8, 28) / 864e5; d++) days.add(d);
      const all = [...days];
      for (const end of all) if (all.filter((x) => x <= end && x > end - 180).length > 90) return false;
      return true;
    };
    let n = 0; while (free(n + 1) && n < 120) n++;
    const d0 = Date.UTC(2026, 0, 15);
    expect(a.latestExit).toBe(new Date(d0 + (n - 1) * 864e5).toISOString().slice(0, 10));
  });
});

describe("03: reconcile uses the trip that matches the EES exit when two trips share an entry", () => {
  it("trips 06-01..06-10 and 06-01..06-20, EES 06-01..06-15 on 06-25: exit dates disagree with the latest trip, no missing entry", () => {
    const trips = [{ entry: "2026-06-01", exit: "2026-06-10" }, { entry: "2026-06-01", exit: "2026-06-20" }];
    const r = reconcile(trips, { daysUsed: 15, on: "2026-06-25", records: [{ entry: "2026-06-01", exit: "2026-06-15" }] });
    expect(r.codes).not.toContain("likely-missing-entry");
    expect(r.explanation).toContain("trips end on 2026-06-20");
  });
  it("missing exit: same-entry trips 06-01..06-03 and 06-01..06-10, EES open entry 06-01, on 06-25: the extra days start after 06-10", () => {
    const trips = [{ entry: "2026-06-01", exit: "2026-06-03" }, { entry: "2026-06-01", exit: "2026-06-10" }];
    const r = reconcile(trips, { daysUsed: 25, on: "2026-06-25", records: [{ entry: "2026-06-01", exit: null }] });
    expect(r.explanation).toContain("The trips show an exit on 2026-06-10");
    expect(r.explanation).toContain("15 days after that exit");
  });
});

describe("04: the letter refuses, not throws, when the only finding is the 10 April 2026 cutoff", () => {
  const body = { trips: [{ entry: "2026-04-01", exit: "2026-04-20" }], ees: { daysUsed: 0, on: "2026-05-01" }, identity }; // the whole stay began before the cutoff, so the EES counts 0
  it("POST /api/v1/letter gives 422 naming 2026-04-10", () => {
    const r = article52Letter(body);
    expect(r.status).toBe(422);
    expect(JSON.stringify(r.body)).toContain("2026-04-10");
  });
  it("MCP article52_letter gives isError:true", () => {
    expect(callTool("article52_letter", body).isError).toBe(true);
  });
});

describe("05: the 64 KB limit is in bytes, not characters", () => {
  const big = JSON.stringify({ trips: [], on: "2026-10-19", pad: "é".repeat(40000) }); // 40,000 chars of 2 bytes
  it("REST handle() gives 413", async () => {
    const r = await handle(new Request("http://x", { method: "POST", headers: { "content-type": "application/json" }, body: big }), () => ({ status: 200, body: {} }));
    expect(r.status).toBe(413);
  });
  it("/api/mcp gives 413", async () => {
    const r = await handleMcp(new Request("http://x", { method: "POST", headers: { "content-type": "application/json" }, body: big }));
    expect(r.status).toBe(413);
  });
});
