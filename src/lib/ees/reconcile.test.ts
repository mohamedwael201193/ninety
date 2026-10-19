import { describe, expect, it } from "vitest";
import { buildCorrectionLetter } from "../letter/letter";
import { daysUsedOn } from "../schengen/engine";
import { parseEesRecords, explainedByCutoff, reconcile } from "./reconcile";

describe("parseEesRecords", () => {
  it("reads closed lines and open entries", () => {
    const parsed = parseEesRecords("2024-06-01 2024-06-10\n\n2024-07-01\n");
    expect(parsed.errors).toEqual([]);
    expect(parsed.records).toEqual([
      { entry: "2024-06-01", exit: "2024-06-10" },
      { entry: "2024-07-01", exit: null },
    ]);
  });

  it("rejects a reversed stay and a bad token", () => {
    const parsed = parseEesRecords("2024-06-10 2024-06-01\nnope");
    expect(parsed.records).toEqual([]);
    expect(parsed.errors).toHaveLength(2);
  });
});

describe("reconcile", () => {
  const trips = [{ entry: "2024-06-01", exit: "2024-06-10" }];

  it("matches when only the figure is known and it agrees", () => {
    const result = reconcile(trips, { daysUsed: 10, on: "2024-06-14" });
    expect(result.codes).toEqual(["match"]);
    expect(result.figureGap).toBe(0);
    expect(result.differences).toEqual([]);
    expect(result.eesRecordDaysUsed).toBeNull();
    expect(result.travellerDaysUsed).toBe(10);
  });

  it("reports a figure gap without inventing days when records are absent", () => {
    const result = reconcile(trips, { daysUsed: 14, on: "2024-06-14" });
    expect(result.codes).toEqual(["figure-differs"]);
    expect(result.figureGap).toBe(4);
    expect(result.differences).toEqual([]);
    expect(result.explanation).toContain("cannot be listed");
  });

  it("explains a likely missing exit as the days after the traveller left", () => {
    const result = reconcile(trips, {
      daysUsed: 14,
      on: "2024-06-14",
      records: [{ entry: "2024-06-01", exit: null }],
    });
    expect(result.eesRecordDaysUsed).toBe(14);
    expect(result.figureGap).toBe(4);
    expect(result.codes).toEqual(["figure-differs", "likely-missing-exit"]);
    expect(result.differences).toEqual([
      { date: "2024-06-11", side: "ees-only" },
      { date: "2024-06-12", side: "ees-only" },
      { date: "2024-06-13", side: "ees-only" },
      { date: "2024-06-14", side: "ees-only" },
    ]);
    expect(result.explanation).toContain("Likely missing exit");
    expect(result.explanation).toContain("2024-06-10");
  });

  it("does not call an open stay a missing exit when the traveller is still there", () => {
    const result = reconcile([{ entry: "2024-06-01", exit: null }], {
      daysUsed: 14,
      on: "2024-06-14",
      records: [{ entry: "2024-06-01", exit: null }],
    });
    expect(result.codes).toEqual(["match"]);
    expect(result.differences).toEqual([]);
    expect(result.travellerDaysUsed).toBe(14);
  });

  it("names days the EES never recorded as a likely missing entry", () => {
    const result = reconcile(trips, {
      daysUsed: 0,
      on: "2024-06-14",
      records: [],
    });
    expect(result.codes).toEqual(["figure-differs", "likely-missing-entry"]);
    expect(result.differences.map((difference) => difference.date)).toEqual([
      "2024-06-01",
      "2024-06-02",
      "2024-06-03",
      "2024-06-04",
      "2024-06-05",
      "2024-06-06",
      "2024-06-07",
      "2024-06-08",
      "2024-06-09",
      "2024-06-10",
    ]);
    expect(result.differences.every((difference) => difference.side === "traveller-only")).toBe(true);
  });

  it("reports disagreeing exit dates without calling the exit missing", () => {
    const result = reconcile(trips, {
      daysUsed: 12,
      on: "2024-06-14",
      records: [{ entry: "2024-06-01", exit: "2024-06-12" }],
    });
    expect(result.codes).toEqual(["figure-differs", "exit-dates-disagree"]);
    expect(result.differences).toEqual([
      { date: "2024-06-11", side: "ees-only" },
      { date: "2024-06-12", side: "ees-only" },
    ]);
    expect(result.explanation).toContain("Exit dates disagree");
    expect(result.explanation).not.toContain("Likely missing exit");
  });

  it("flags an EES figure that does not match its own records", () => {
    const result = reconcile(trips, {
      daysUsed: 99,
      on: "2024-06-14",
      records: [{ entry: "2024-06-01", exit: "2024-06-10" }],
    });
    expect(result.differences).toEqual([]);
    expect(result.eesRecordDaysUsed).toBe(10);
    expect(result.codes).toEqual(["figure-differs", "ees-figure-inconsistent"]);
  });

  it("matches a same-day stay, counting that day once", () => {
    const result = reconcile([{ entry: "2024-10-27", exit: "2024-10-27" }], {
      daysUsed: 1,
      on: "2024-10-27",
      records: [{ entry: "2024-10-27", exit: "2024-10-27" }],
    });
    expect(result.codes).toEqual(["match"]);
    expect(result.travellerDaysUsed).toBe(1);
  });

  it("rejects a negative figure instead of calling it a match", () => {
    const result = reconcile(trips, { daysUsed: -1, on: "2024-06-14" });
    expect(result.codes).not.toContain("match");
    expect(result.errors[0]).toContain("whole number");
  });
});

const IDENTITY = { fullName: "Test Traveller", dateOfBirth: "1990-01-01", nationality: "EG", documentNumber: "A1234567", email: "t@example.com", memberState: "France" };

describe("EES cutoff (stays that began before 10 April 2026)", () => {
  it("does not flag days from a stay that began before the cutoff", () => {
    const trips = [
      { entry: "2026-03-20", exit: "2026-04-15" },
      { entry: "2026-05-01", exit: "2026-05-10" },
    ];
    const result = reconcile(trips, {
      daysUsed: 10,
      on: "2026-05-20",
      records: [{ entry: "2026-05-01", exit: "2026-05-10" }],
    });
    expect(result.travellerDaysUsed).toBe(37);
    expect(result.eesComparableDaysUsed).toBe(10);
    expect(result.preCutoffDays).toHaveLength(27);
    expect(result.preCutoffDays[0]).toBe("2026-03-20");
    expect(result.differences).toEqual([]);
    expect(result.figureGap).toBe(0);
    expect(result.codes).toEqual(["ees-ignores-pre-cutoff-stay"]);
    expect(explainedByCutoff(result.codes)).toBe(true);
    expect(result.explanation).toContain("before 2026-04-10");
    expect(result.explanation).toContain("border officer");
  });

  it("still flags a real gap in stays after the cutoff", () => {
    const result = reconcile([{ entry: "2026-03-01", exit: "2026-03-05" }, { entry: "2026-05-01", exit: "2026-05-10" }], {
      daysUsed: 14,
      on: "2026-05-20",
    });
    expect(result.eesComparableDaysUsed).toBe(10);
    expect(result.figureGap).toBe(4);
    expect(result.codes).toContain("figure-differs");
    expect(result.codes).toContain("ees-ignores-pre-cutoff-stay");
    expect(explainedByCutoff(result.codes)).toBe(false);
  });

  it("drops the whole pre-cutoff stay, including days after 10 April (judging-day case)", () => {
    const trips = [{ entry: "2026-04-01", exit: "2026-04-30" }];
    const result = reconcile(trips, { daysUsed: 0, on: "2026-10-19" });
    expect(daysUsedOn(trips, "2026-10-19")).toBe(8);
    expect(result.travellerDaysUsed).toBe(8);
    expect(result.eesComparableDaysUsed).toBe(0);
    expect(result.codes).toEqual(["ees-ignores-pre-cutoff-stay"]);
    expect(result.codes).not.toContain("figure-differs");
    expect(() => buildCorrectionLetter(IDENTITY, result)).toThrow(/No correction to request/);
  });

  it("does not report a missing entry for a pre-cutoff stay the EES never recorded", () => {
    const result = reconcile([{ entry: "2026-03-01", exit: "2026-03-20" }], { daysUsed: 0, on: "2026-06-01", records: [] });
    expect(result.travellerDaysUsed).toBe(20);
    expect(result.codes).toEqual(["ees-ignores-pre-cutoff-stay"]);
    expect(result.differences).toEqual([]);
  });

  it("still finds a missing entry after the cutoff next to an ignored March stay", () => {
    const trips = [{ entry: "2026-03-01", exit: "2026-03-10" }, { entry: "2026-05-01", exit: "2026-05-10" }];
    const result = reconcile(trips, { daysUsed: 0, on: "2026-06-01", records: [] });
    expect(result.codes).toContain("likely-missing-entry");
    expect(result.codes).toContain("ees-ignores-pre-cutoff-stay");
    expect(result.differences.every((d) => d.date >= "2026-05-01")).toBe(true);
    const letter = buildCorrectionLetter(IDENTITY, result);
    expect(letter.paragraphs.join(" ")).toContain("does not concern them");
  });

  it("counts a stay that begins on the cutoff day", () => {
    const result = reconcile([{ entry: "2026-04-10", exit: "2026-04-12" }], { daysUsed: 3, on: "2026-04-20" });
    expect(result.preCutoffDays).toEqual([]);
    expect(result.codes).toEqual(["match"]);
  });

  it("does not apply before the cutoff date", () => {
    const result = reconcile([{ entry: "2026-03-01", exit: "2026-03-05" }], { daysUsed: 5, on: "2026-04-01" });
    expect(result.preCutoffDays).toEqual([]);
    expect(result.codes).toEqual(["match"]);
  });
});

describe("trips that share an entry date", () => {
  it("does not report disagreeing exits when the records copy the trips", () => {
    const trips = [{ entry: "2027-04-04", exit: "2027-04-04" }, { entry: "2027-04-04", exit: "2027-04-05" }];
    const result = reconcile(trips, { daysUsed: 2, on: "2027-04-05", records: trips });
    expect(result.codes).toEqual(["match"]);
  });
});

describe("cutoff with overlapping trips", () => {
  it("keeps a day comparable when a post-cutoff trip also covers it", () => {
    const r = reconcile([{ entry: "2026-04-10", exit: "2026-04-10" }, { entry: "2026-04-09", exit: "2026-04-10" }], { daysUsed: 1, on: "2026-04-10" });
    expect(r.eesComparableDaysUsed).toBe(1);
    expect(r.preCutoffDays).toEqual(["2026-04-09"]);
  });
});

describe("same-day re-entry on or after the EES cutoff", () => {
  it("counts a re-entry on the exit day as a new, comparable visit", () => {
    const trips = [
      { entry: "2026-03-20", exit: "2026-04-15" },
      { entry: "2026-04-15", exit: "2026-04-20" },
    ];
    const result = reconcile(trips, {
      daysUsed: 6,
      on: "2026-05-01",
      records: [{ entry: "2026-04-15", exit: "2026-04-20" }],
    });
    // 20 Mar - 14 Apr belong only to the pre-cutoff stay; 15 Apr is the first day of the new visit.
    expect(result.preCutoffDays).toHaveLength(26);
    expect(result.preCutoffDays).not.toContain("2026-04-15");
    expect(result.eesComparableDaysUsed).toBe(6);
    expect(result.differences).toEqual([]);
    expect(result.figureGap).toBe(0);
    expect(result.codes).toEqual(["ees-ignores-pre-cutoff-stay"]);
  });

  it("treats a re-entry on the cutoff day itself as a new visit", () => {
    const result = reconcile(
      [
        { entry: "2026-04-01", exit: "2026-04-10" },
        { entry: "2026-04-10", exit: "2026-04-12" },
      ],
      { daysUsed: 3, on: "2026-05-01", records: [{ entry: "2026-04-10", exit: "2026-04-12" }] },
    );
    expect(result.preCutoffDays).toHaveLength(9);
    expect(result.eesComparableDaysUsed).toBe(3);
    expect(result.figureGap).toBe(0);
  });
});
