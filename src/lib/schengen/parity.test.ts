import { describe, expect, it } from "vitest";
import { COMMISSION_CALCULATOR_URL, fetchCommissionCalculator } from "./commission-reference";
import { parityFromHtml, unverified } from "./parity";
import { VENDORED_HTML, VENDORED_SHA256 } from "./vendor/commission-calculator";
import { sha256 } from "./vendor/hash";

// PR runs use the stored, hashed copy of the Commission page, so `npm test` passes offline.
// The nightly "Commission drift" workflow sets PARITY_LIVE=1 and checks the live page.
const LIVE = process.env.PARITY_LIVE === "1";

function expectFullMatch(html: string) {
  const report = parityFromHtml(html, COMMISSION_CALCULATOR_URL);
  expect(report.status, JSON.stringify(report.mismatches, null, 2)).toBe("match");
  expect(report.score).toBe("14/14");
  expect(report.matched).toBe(14);
  expect(report.rows).toHaveLength(14);
  for (const row of report.rows ?? []) {
    expect(row.match).toBe(true);
    expect(row.ours).toBe(row.theirs);
  }
}

describe("parity report", () => {
  it("does not call a failed reference a match", () => {
    const report = parityFromHtml("<html><script>var x = 1;</script></html>", COMMISSION_CALCULATOR_URL);
    expect(report.status).toBe("couldn't verify");
    expect(report.score).toBe("");
    expect(report.status).not.toContain("match");
    const fallback = unverified("offline", COMMISSION_CALCULATOR_URL);
    expect(fallback.status).toBe("couldn't verify");
    expect(fallback.score).toBe("");
    expect(fallback.mismatches).toEqual([]);
  });

  it("the stored Commission page is the one we hashed", () => {
    expect(sha256(VENDORED_HTML)).toBe(VENDORED_SHA256);
  });

  it("matches the stored Commission calculator on all 14 scenarios", () => {
    expectFullMatch(VENDORED_HTML);
  });

  it.runIf(LIVE)("the live Commission page has not changed since it was stored", async () => {
    const html = await fetchCommissionCalculator();
    expect(sha256(html), "The live Commission page changed: re-check parity and refresh the stored copy").toBe(VENDORED_SHA256);
  }, 60_000);

  it.runIf(LIVE)("matches the live Commission calculator on all 14 scenarios", async () => {
    expectFullMatch(await fetchCommissionCalculator());
  }, 60_000);
});
