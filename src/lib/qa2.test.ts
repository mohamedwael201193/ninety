import { describe, expect, it } from "vitest";
import { dateFormatError } from "./schengen/dates";
import { groupDifferences, parseEesRecords, reconcile } from "./ees/reconcile";
import { findOverlaps } from "./trips";
import { buildCorrectionLetter } from "./letter/letter";

describe("QA batch 2", () => {
  it("clearly rejects MM/DD/YYYY dates", () => {
    expect(dateFormatError("06/14/2026")).toMatch(/YYYY-MM-DD/);
    expect(dateFormatError("2026-06-14")).toBeNull();
    expect(parseEesRecords("06/01/2026 06/10/2026").errors[0]).toMatch(/MM\/DD\/YYYY/);
  });

  it("accepts Entry/Exit lines", () => {
    const parsed = parseEesRecords("Entry 2026-06-01\nExit 2026-06-10\nEntry: 2026-07-02 Exit: 2026-07-05\nEntry 2026-08-01");
    expect(parsed.errors).toEqual([]);
    expect(parsed.records).toEqual([
      { entry: "2026-06-01", exit: "2026-06-10" },
      { entry: "2026-07-02", exit: "2026-07-05" },
      { entry: "2026-08-01", exit: null },
    ]);
    expect(parseEesRecords("Exit 2026-06-10").errors).toHaveLength(1);
    expect(parseEesRecords("2026-06-01 2026-06-10").records).toHaveLength(1);
  });

  it("finds overlapping trips", () => {
    const trips = [
      { id: "a", entry: "2026-01-01", exit: "2026-01-10" },
      { id: "b", entry: "2026-01-10", exit: "2026-01-12" },
      { id: "c", entry: "2026-02-01", exit: "2026-02-02" },
    ];
    expect(findOverlaps(trips, "2026-03-01").map(([x, y]) => x.id + y.id)).toEqual(["ab"]);
    expect(findOverlaps([trips[0], trips[2]], "2026-03-01")).toEqual([]);
  });

  it("groups differing days into ranges", () => {
    const ranges = groupDifferences([
      { date: "2026-06-03", side: "ees-only" },
      { date: "2026-06-01", side: "ees-only" },
      { date: "2026-06-02", side: "ees-only" },
      { date: "2026-06-05", side: "ees-only" },
      { date: "2026-06-04", side: "traveller-only" },
    ]);
    expect(ranges).toEqual([
      { from: "2026-06-01", to: "2026-06-03", side: "ees-only", count: 3 },
      { from: "2026-06-04", to: "2026-06-04", side: "traveller-only", count: 1 },
      { from: "2026-06-05", to: "2026-06-05", side: "ees-only", count: 1 },
    ]);
  });

  it("keeps the letter in the traveller's first person, without the analysis paragraph", () => {
    const r = reconcile([{ entry: "2026-06-01", exit: "2026-06-10" }], {
      daysUsed: 20,
      on: "2026-07-01",
      records: [{ entry: "2026-06-01", exit: "2026-06-20" }],
    });
    const letter = buildCorrectionLetter(
      { fullName: "A B", dateOfBirth: "1990-01-01", nationality: "Egyptian", documentNumber: "X1", email: "a@b.c", memberState: "France" },
      r,
    );
    expect(letter.paragraphs).not.toContain(r.explanation);
    expect(letter.text).not.toMatch(/not a decision by a border authority/);
    expect(letter.text).not.toMatch(/\bthe traveller\b/i);
    expect(letter.text).toMatch(/2026-06-11 to 2026-06-20 \(10 days\)/);
  });
});
