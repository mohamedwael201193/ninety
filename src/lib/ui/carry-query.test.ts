import { describe, expect, it } from "vitest";
import { carryQuery } from "./carry-query";

describe("carryQuery", () => {
  it("keeps the scenario and the pinned date", () => {
    expect(carryQuery("/ees", "?scenario=near-limit")).toBe("/ees?scenario=near-limit");
    expect(carryQuery("/letter", "?scenario=overstay&today=2026-10-19")).toBe("/letter?scenario=overstay&today=2026-10-19");
  });
  it("drops everything else, including fresh=1", () => {
    expect(carryQuery("/ees", "?fresh=1&today=2026-10-19&utm=x")).toBe("/ees?today=2026-10-19");
    expect(carryQuery("/ees", "?fresh=1")).toBe("/ees");
    expect(carryQuery("/ees", "")).toBe("/ees");
  });
});
