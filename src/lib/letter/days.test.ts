import { describe, expect, it } from "vitest";
import { daysLabel } from "./days";

describe("daysLabel", () => {
  it("names the unit, singular for one", () => {
    expect(daysLabel(2)).toBe("2 days");
    expect(daysLabel(1)).toBe("1 day");
    expect(daysLabel(0)).toBe("0 days");
    expect(daysLabel(-3)).toBe("3 days");
  });
});
