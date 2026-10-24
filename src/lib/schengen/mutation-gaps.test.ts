/**
 * Behaviour the StrykerJS run of 2026-10-24 (npm run mutation) showed no test pinned down:
 * every mutant listed in each test's name survived the whole suite before this file.
 */
import { describe, expect, it } from "vitest";
import { dateFormatError, formatIso, fromCommissionDate, isIsoDate, localToday, parseIso } from "./dates";
import { checkPlannedTrip, closeStays, evaluate, nextLegalEntry, stayLength } from "./engine";

describe("dates: exact formats, anchors and messages", () => {
  it("isIsoDate is anchored at both ends and refuses non-dates", () => {
    expect(isIsoDate("2026-06-14")).toBe(true);
    expect(isIsoDate("x2026-06-14")).toBe(false);
    expect(isIsoDate("2026-06-14x")).toBe(false);
    expect(isIsoDate("abc")).toBe(false);
  });

  it("parseIso refuses an impossible date and a non-date, naming the input", () => {
    expect(() => parseIso("2026-02-30")).toThrow("Invalid date: 2026-02-30");
    expect(() => parseIso("2026-04-31")).toThrow("Invalid date: 2026-04-31");
    expect(() => parseIso("garbage")).toThrow("Invalid date: garbage");
  });

  it("formatIso pads a year below 1000 to four digits", () => {
    expect(formatIso(parseIso("0999-12-31"))).toBe("0999-12-31");
  });

  it("localToday pads month and day", () => {
    expect(localToday(new Date(2026, 0, 5, 12))).toBe("2026-01-05");
  });

  it("fromCommissionDate reads DD/MM/YY only, anchored, and names a bad input", () => {
    expect(fromCommissionDate("01/02/26")).toBe("2026-02-01");
    expect(() => fromCommissionDate("x01/02/26")).toThrow("Invalid Commission date: x01/02/26");
    expect(() => fromCommissionDate("01/02/26x")).toThrow("Invalid Commission date: 01/02/26x");
  });

  it("dateFormatError trims, and flags only a whole slash date", () => {
    expect(dateFormatError(" 06/14/2026 ")).toBe('"06/14/2026" looks like MM/DD/YYYY or DD/MM/YYYY. Use YYYY-MM-DD, for example 2026-06-14.');
    expect(dateFormatError("x06/14/2026")).toBeNull();
    expect(dateFormatError("06/14/2026x")).toBeNull();
    expect(dateFormatError("hello")).toBeNull();
  });
});

describe("engine: invalid input paths", () => {
  it("closeStays names an invalid entry and an invalid exit by trip number", () => {
    expect(closeStays([{ entry: "2026-02-30", exit: "2026-03-01" }], "2026-10-19")).toEqual({ stays: [], errors: ["Trip 1 has an invalid entry date."] });
    expect(closeStays([{ entry: "2026-03-01", exit: "2026-03-01" }, { entry: "2026-03-01", exit: "2026-13-01" }], "2026-10-19")).toEqual({
      stays: [{ entry: "2026-03-01", exit: "2026-03-01" }],
      errors: ["Trip 2 has an invalid exit date."],
    });
  });

  it("checkPlannedTrip with an impossible plan date refuses with one message", () => {
    expect(checkPlannedTrip([], "2026-10-19", { entry: "2026-02-30", exit: "2026-03-05" })).toEqual({
      plannedDays: 0, daysLeft: 0, latestExit: null, fits: false, daysUsedOnEntry: 0, overstay: false,
      errors: ["Enter a valid entry date and exit date."], assumedContinuousPresence: false,
    });
  });

  it("stayLength is null for a trip that ends before it starts", () => {
    expect(stayLength({ entry: "2026-01-05", exit: "2026-01-01" }, "2026-10-19")).toBeNull();
  });

  it("evaluate refuses an impossible date to count on", () => {
    expect(() => evaluate([], "2026-02-30")).toThrow("Invalid date: 2026-02-30");
  });

  it("nextLegalEntry finds an answer exactly 180 days ahead", () => {
    // Present 1 Jan to 31 Mar 2026 (90 days): no new entry is possible until 1 Jan drops out, on 30 Jun = 1 Jan + 180.
    expect(nextLegalEntry([{ entry: "2026-01-01", exit: "2026-03-31" }], "2026-01-01")).toBe("2026-06-30");
  });
});
