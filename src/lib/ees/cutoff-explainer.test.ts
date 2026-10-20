import { describe, expect, it } from "vitest";
import { EES_CUTOFF, cutoffExamples } from "./cutoff-explainer";

describe("cutoff explainer examples", () => {
  it("uses the reconciler's own figures", () => {
    expect(EES_CUTOFF).toBe("2026-04-10");
    const [span, mixed] = cutoffExamples();
    expect([span.leftOut, span.compared, span.matches]).toEqual([20, 0, true]);
    expect([mixed.leftOut, mixed.compared, mixed.matches]).toEqual([20, 10, true]);
  });
  it("links each example to its scenario on the EES check", () => {
    expect(cutoffExamples().map((e) => e.href)).toEqual(["/ees?scenario=cutoff-span", "/ees?scenario=cutoff-mixed"]);
  });
});
