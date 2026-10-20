import { describe, expect, it } from "vitest";
import { dateFormatError, fromCommissionDate, isIsoDate, toCommissionDate } from "./dates";

describe("dates that cannot exist", () => {
  it("say the date does not exist rather than that it is missing", () => {
    expect(dateFormatError("2024-02-30")).toMatch(/does not exist/);
    expect(dateFormatError("2023-02-29")).toMatch(/does not exist/);
    expect(dateFormatError("2026-13-01")).toMatch(/does not exist/);
  });
  it("accept real dates, including a leap day", () => {
    expect(dateFormatError("2024-02-29")).toBeNull();
    expect(isIsoDate("2024-02-29")).toBe(true);
    expect(isIsoDate("2100-02-29")).toBe(false);
    expect(isIsoDate("2000-02-29")).toBe(true);
  });
  it("still explains a slash date", () => {
    expect(dateFormatError("06/14/2026")).toMatch(/YYYY-MM-DD/);
  });
  it("round-trips the Commission date format", () => {
    expect(fromCommissionDate(toCommissionDate("2013-10-27"))).toBe("2013-10-27");
  });
});
