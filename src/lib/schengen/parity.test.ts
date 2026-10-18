import { describe, expect, it } from "vitest";
import { COMMISSION_CALCULATOR_URL, fetchCommissionCalculator } from "./commission-reference";
import { parityFromHtml, unverified } from "./parity";

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

  it("matches the live Commission calculator on the fixed scenarios", async () => {
    const html = await fetchCommissionCalculator();
    const report = parityFromHtml(html, COMMISSION_CALCULATOR_URL);
    expect(report.status, JSON.stringify(report.mismatches, null, 2)).toBe("match");
    expect(report.score).toBe(`${report.total}/${report.total}`);
    expect(report.matched).toBe(report.total);
    expect(report.total).toBeGreaterThan(0);
  }, 60_000);
});
