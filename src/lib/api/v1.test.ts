import { describe, expect, it } from "vitest";
import { article52Letter, check, eesReconcile, nextLegalEntry } from "./v1";
import { OPENAPI } from "./openapi";
import { handle, preflight } from "./http";
import { evaluate } from "../schengen/engine";
import { PARITY_SCENARIOS } from "../schengen/scenarios";

const NEAR = [{ entry: "2026-05-01", exit: "2026-06-15" }, { entry: "2026-08-20", exit: "2026-09-30" }];
const ID = { fullName: "Jane Doe", dateOfBirth: "1990-05-04", nationality: "Egyptian", documentNumber: "A1234567", email: "jane@example.com", memberState: "France" };

describe("POST /api/v1/check", () => {
  it("counts the near-limit history: 88 used, 2 left on 2026-10-19", () => {
    const r = check({ trips: NEAR, on: "2026-10-19" });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ on: "2026-10-19", daysUsed: 88, daysLeft: 2, present: false, overstays: [] });
  });
  it("gives the same answer as the app's engine on every parity scenario", () => {
    for (const s of PARITY_SCENARIOS) {
      const a = evaluate(s.stays, s.on, s.on);
      const r = check({ trips: s.stays, on: s.on }).body as { daysLeft: number; daysUsed: number; latestExit: string | null };
      expect([r.daysUsed, r.daysLeft, r.latestExit], s.id).toEqual([a.daysUsed, a.daysLeft, a.latestExit]);
    }
  });
  it("finds the next legal entry after a full 90 days: the day the first day leaves the window", () => {
    // 2024-01-01..03-30 is 90 days; 2024-01-01 leaves the 180-day window on 2024-06-29.
    expect(nextLegalEntry([{ entry: "2024-01-01", exit: "2024-03-30" }], "2024-03-31")).toBe("2024-06-29");
    const r = check({ trips: [{ entry: "2024-01-01", exit: "2024-03-30" }], on: "2024-03-31" }).body as { daysLeft: number; nextLegalEntry: string };
    expect(r.daysLeft).toBe(0);
    expect(r.nextLegalEntry).toBe("2024-06-29");
  });
  it("answers whether a planned trip fits", () => {
    const fits = check({ trips: NEAR, on: "2026-10-19", planned: { entry: "2026-10-20", exit: "2026-10-21" } }).body as { planned: { fits: boolean } };
    const over = check({ trips: NEAR, on: "2026-10-19", planned: { entry: "2026-10-20", exit: "2026-10-22" } }).body as { planned: { fits: boolean } };
    expect(fits.planned.fits).toBe(true);
    expect(over.planned.fits).toBe(false);
  });
  it("rejects bad input with the field path", () => {
    const r = check({ trips: [{ entry: "2026-02-30", exit: "2026-03-01" }] });
    expect(r.status).toBe(400);
    expect(r.body).toMatchObject({ error: "invalid_request", issues: [{ path: "trips.0.entry" }] });
    expect(check({ trips: [], extra: 1 }).status).toBe(400);
    expect(check({ trips: Array.from({ length: 201 }, () => ({ entry: "2026-01-01", exit: "2026-01-01" })) }).status).toBe(400);
  });
  it("returns 422 when the dates are valid but cannot be counted", () => {
    const r = check({ trips: [{ entry: "2026-03-10", exit: "2026-03-01" }], on: "2026-04-01" });
    expect(r.status).toBe(422);
  });
});

describe("POST /api/v1/ees-reconcile and /api/v1/letter", () => {
  const missingExit = { trips: [{ entry: "2026-06-01", exit: "2026-06-10" }], ees: { daysUsed: 30, on: "2026-06-30", records: [{ entry: "2026-06-01", exit: null }] } };
  it("names a missing EES exit and the days that differ", () => {
    const r = eesReconcile(missingExit);
    expect(r.status).toBe(200);
    const b = r.body as { travellerDaysUsed: number; eesDaysUsed: number; figureGap: number; codes: string[]; differences: { from: string; to: string; count: number }[] };
    expect([b.travellerDaysUsed, b.eesDaysUsed, b.figureGap]).toEqual([10, 30, 20]);
    expect(b.codes).toContain("likely-missing-exit");
    expect(b.differences).toEqual([{ from: "2026-06-11", to: "2026-06-30", side: "ees-only", count: 20 }]);
  });
  it("drafts the letter with both counts, and refuses when there is nothing to correct", () => {
    const r = article52Letter({ ...missingExit, identity: ID });
    expect(r.status).toBe(200);
    const b = r.body as { text: string; evidence: { ours: number; ees: number; gap: number } };
    expect(b.evidence).toMatchObject({ ours: 10, ees: 30, gap: 20 });
    expect(b.text).toContain("Jane Doe");
    expect(b.text).toContain("Article 52");
    const same = article52Letter({ trips: missingExit.trips, ees: { daysUsed: 10, on: "2026-06-30" }, identity: ID });
    expect(same.status).toBe(422);
    expect(article52Letter({ ...missingExit, identity: { ...ID, email: "nope" } }).status).toBe(400);
  });
});

describe("HTTP layer", () => {
  const req = (body: string, type = "application/json") => new Request("https://x/api/v1/check", { method: "POST", headers: { "content-type": type }, body });
  it("answers the CORS preflight and sends CORS on every answer, with no caching", async () => {
    const p = preflight();
    expect(p.status).toBe(204);
    expect(p.headers.get("access-control-allow-origin")).toBe("*");
    const r = await handle(req(JSON.stringify({ trips: [] })), check);
    expect(r.status).toBe(200);
    expect(r.headers.get("access-control-allow-origin")).toBe("*");
    expect(r.headers.get("cache-control")).toBe("no-store");
  });
  it("rejects non-JSON, broken JSON and oversized bodies", async () => {
    expect((await handle(req("{}", "text/plain"), check)).status).toBe(415);
    expect((await handle(req("{nope"), check)).status).toBe(400);
    expect((await handle(req(" ".repeat(70_000)), check)).status).toBe(413);
  });
});

describe("OpenAPI 3.1 document", () => {
  it("is 3.1, lists the three operations, and its check example runs to a 200 with every documented field", () => {
    expect(OPENAPI.openapi).toBe("3.1.0");
    expect(Object.keys(OPENAPI.paths).sort()).toEqual(["/api/v1/check", "/api/v1/ees-reconcile", "/api/v1/letter"]);
    const example = OPENAPI.paths["/api/v1/check"].post.requestBody.content["application/json"].example;
    const r = check(example);
    expect(r.status).toBe(200);
    for (const key of OPENAPI.components.schemas.Check.required) expect(r.body).toHaveProperty(key);
    expect(Object.keys(r.body as object).sort()).toEqual([...OPENAPI.components.schemas.Check.required].sort());
  });
});
