import { describe, expect, it } from "vitest";
import { parityReport } from "./parity-live";
import { VENDORED_HTML, VENDORED_SHA256 } from "./vendor/commission-calculator";

// TS02 (TestSprite, PR #57 and production, 2026-10-21): from Vercel's servers the Commission URL
// returned a page without the calculator, and /parity showed "couldn't verify".
const NOT_THE_CALCULATOR = "<html><head><title>European Commission</title></head><body><p>Access denied</p></body></html>";

describe("/api/parity falls back to the stored copy, and says so", () => {
  it("a non-calculator page: 14/14 from the stored copy, origin stored, notice names the hash", async () => {
    const r = await parityReport(async () => NOT_THE_CALCULATOR);
    expect(r.status).toBe("match");
    expect(r.score).toBe("14/14");
    expect(r.origin).toBe("stored");
    expect(r.notice).toContain("Live Commission page unreachable from server; checked against the stored official copy");
    expect(r.notice).toContain(VENDORED_SHA256);
    expect(r.notice).toContain("does not contain the Commission calculator functions");
    expect(r.deepLive?.status).toBe("couldn't verify");
  });

  it("a fetch error (timeout, HTTP 403): the same fallback, with the error in the notice", async () => {
    const r = await parityReport(async () => { throw new Error("Commission calculator responded with HTTP 403."); });
    expect(r.origin).toBe("stored");
    expect(r.score).toBe("14/14");
    expect(r.notice).toContain("HTTP 403");
  });

  it("the real page: origin live, no notice", async () => {
    const r = await parityReport(async () => VENDORED_HTML);
    expect(r.origin).toBe("live");
    expect(r.notice).toBeUndefined();
    expect(r.score).toBe("14/14");
  });
});
