import { describe, expect, it } from "vitest";
import { addDays, daysInclusive, formatIso, isIsoDate, localToday, parseIso } from "./dates";
import { checkPlannedTrip, evaluate, stayLength } from "./engine";

describe("calendar dates", () => {
  it("round-trips calendar dates, including DST boundaries", () => {
    for (const iso of ["2024-01-01", "2024-02-29", "2024-03-31", "2024-10-27", "2013-10-27"]) {
      expect(formatIso(parseIso(iso))).toBe(iso);
      expect(isIsoDate(iso)).toBe(true);
    }
  });

  it("rejects impossible dates", () => {
    expect(isIsoDate("2023-02-29")).toBe(false);
    expect(isIsoDate("2024-13-01")).toBe(false);
    expect(isIsoDate("01/01/2024")).toBe(false);
  });

  it("counts both the entry day and the exit day", () => {
    expect(daysInclusive("2024-03-30", "2024-03-30")).toBe(1);
    expect(daysInclusive("2024-03-30", "2024-03-31")).toBe(2);
    expect(daysInclusive("2024-10-26", "2024-10-27")).toBe(2);
    expect(daysInclusive("2024-01-01", "2024-03-30")).toBe(90);
    expect(daysInclusive("2024-01-01", "2024-03-31")).toBe(91);
    expect(daysInclusive("2024-02-01", "2024-02-29")).toBe(29);
  });

  it("uses the local calendar day for an un-overridden today", () => {
    expect(localToday(new Date(2024, 5, 14, 23, 30))).toBe("2024-06-14");
  });
});

describe("90/180 engine", () => {
  it("gives a first entry 90 days through the 89th day after entry", () => {
    const result = evaluate([], "2024-06-01");
    expect(result.daysUsed).toBe(0);
    expect(result.present).toBe(false);
    expect(result.daysLeft).toBe(90);
    expect(result.latestExit).toBe("2024-08-29");
    expect(result.overstay).toBe(false);
  });

  it("matches the manual's 14 June 2024 check (15 days used, stay until 29 August)", () => {
    const result = evaluate(
      [
        { entry: "2024-01-01", exit: "2024-01-01" },
        { entry: "2024-06-01", exit: "2024-06-14" },
      ],
      "2024-06-14",
    );
    expect(result.daysUsed).toBe(15);
    expect(result.present).toBe(true);
    expect(result.daysLeft).toBe(76);
    expect(result.latestExit).toBe("2024-08-29");
    expect(result.overstay).toBe(false);
  });

  it("matches the manual's 19 June and 7 August entry projections", () => {
    const history = [
      { entry: "2024-01-01", exit: "2024-01-10" },
      { entry: "2024-03-01", exit: "2024-03-30" },
      { entry: "2024-05-01", exit: "2024-06-09" },
    ];
    const june = evaluate(history, "2024-06-19");
    expect(june.daysUsed).toBe(80);
    expect(june.present).toBe(false);
    expect(june.daysLeft).toBe(20);
    expect(june.latestExit).toBe("2024-07-08");

    const august = evaluate(history, "2024-08-07");
    expect(august.daysUsed).toBe(70);
    expect(august.daysLeft).toBe(20);
    expect(august.latestExit).toBe("2024-08-26");
  });

  it("treats the 90th day as legal and the 91st as an overstay", () => {
    const last = evaluate([{ entry: "2024-01-01", exit: "2024-03-30" }], "2024-03-30");
    expect(last.daysUsed).toBe(90);
    expect(last.daysLeft).toBe(0);
    expect(last.latestExit).toBe("2024-03-30");
    expect(last.overstay).toBe(false);

    const over = evaluate([{ entry: "2024-01-01", exit: "2024-03-31" }], "2024-03-31");
    expect(over.daysUsed).toBe(91);
    expect(over.overstay).toBe(true);
    expect(over.daysLeft).toBe(0);
    expect(over.latestExit).toBeNull();
    expect(over.overstays).toEqual([
      {
        windowStart: "2023-10-04",
        windowEnd: "2024-03-31",
        daysInWindow: 91,
        from: "2024-03-31",
        to: "2024-03-31",
        days: 1,
      },
    ]);
  });

  it("describes a longer overstay the way the calculator does", () => {
    const result = evaluate([{ entry: "2024-01-01", exit: "2024-04-15" }], "2024-04-15");
    expect(result.daysUsed).toBe(106);
    expect(result.overstays[0]).toMatchObject({
      windowStart: "2023-10-19",
      windowEnd: "2024-04-15",
      daysInWindow: 106,
      from: "2024-03-31",
      to: "2024-04-15",
      days: 16,
    });
  });

  it("drops a presence day on the 180th day before the control date and keeps the 179th", () => {
    const stay = [{ entry: "2024-01-01", exit: "2024-01-01" }];
    const stillInside = addDays("2024-01-01", 179);
    const justOutside = addDays("2024-01-01", 180);
    expect(evaluate(stay, stillInside).daysUsed).toBe(1);
    expect(evaluate(stay, justOutside).daysUsed).toBe(0);
  });

  it("counts a same-day exit and re-entry once", () => {
    const result = evaluate(
      [
        { entry: "2024-05-01", exit: "2024-05-10" },
        { entry: "2024-05-10", exit: "2024-05-12" },
      ],
      "2024-05-12",
    );
    expect(result.daysUsed).toBe(12);
    expect(result.daysLeft).toBe(78);
    expect(result.latestExit).toBe("2024-07-29");
  });

  it("keeps a two-day stay across the spring clock change at two days", () => {
    const result = evaluate([{ entry: "2024-03-30", exit: "2024-03-31" }], "2024-04-01");
    expect(result.daysUsed).toBe(2);
    expect(result.present).toBe(false);
    expect(result.daysLeft).toBe(88);
    expect(result.latestExit).toBe("2024-06-27");
  });

  it("matches calculator example KOM 1.1", () => {
    const result = evaluate(
      [
        { entry: "2013-10-27", exit: "2013-11-06" },
        { entry: "2013-12-28", exit: "2014-01-09" },
        { entry: "2014-03-06", exit: "2014-03-15" },
      ],
      "2014-03-15",
    );
    expect(result.daysUsed).toBe(34);
    expect(result.daysLeft).toBe(67);
    expect(result.latestExit).toBe("2014-05-21");
  });

  it("allows 90 days again once the earlier stay has fallen out of the window", () => {
    const result = evaluate([{ entry: "2024-01-01", exit: "2024-03-30" }], "2024-07-01");
    expect(result.daysUsed).toBe(87);
    expect(result.present).toBe(false);
    expect(result.daysLeft).toBe(90);
    expect(result.latestExit).toBe("2024-09-28");
  });

  it("refuses an entry on the day after a 90-day stay", () => {
    const result = evaluate([{ entry: "2024-01-01", exit: "2024-03-30" }], "2024-03-31");
    expect(result.daysUsed).toBe(90);
    expect(result.present).toBe(false);
    expect(result.daysLeft).toBe(0);
    expect(result.latestExit).toBeNull();
    expect(result.overstay).toBe(false);
  });

  it("closes an open trip on the reference day and does not extend it into a later plan", () => {
    const open = [{ entry: "2024-06-01", exit: null }];
    const today = evaluate(open, "2024-06-14", "2024-06-14");
    expect(today.present).toBe(true);
    expect(today.daysUsed).toBe(14);
    expect(stayLength(open[0], "2024-06-14")).toBe(14);

    const later = evaluate(open, "2024-06-19", "2024-06-14");
    expect(later.present).toBe(false);
    expect(later.daysUsed).toBe(14);
  });

  it("accepts a planned exit on the latest legal day and rejects the day after", () => {
    const history = [
      { entry: "2024-01-01", exit: "2024-01-10" },
      { entry: "2024-03-01", exit: "2024-03-30" },
      { entry: "2024-05-01", exit: "2024-06-09" },
    ];
    const fits = checkPlannedTrip(history, "2024-06-19", {
      entry: "2024-06-19",
      exit: "2024-07-08",
    });
    expect(fits.fits).toBe(true);
    expect(fits.plannedDays).toBe(20);
    expect(fits.latestExit).toBe("2024-07-08");

    const tooLong = checkPlannedTrip(history, "2024-06-19", {
      entry: "2024-06-19",
      exit: "2024-07-09",
    });
    expect(tooLong.fits).toBe(false);
    expect(tooLong.latestExit).toBe("2024-07-08");
  });

  it("rejects a planned exit before entry", () => {
    const result = checkPlannedTrip([], "2024-06-01", {
      entry: "2024-06-10",
      exit: "2024-06-01",
    });
    expect(result.fits).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe("planned trip while a stay is still open", () => {
  const open = [{ entry: "2026-10-01", exit: null }];
  const today = "2026-10-19";

  it("treats the traveller as present until the plan and refuses a plan past day 90", () => {
    const check = checkPlannedTrip(open, today, { entry: "2026-12-01", exit: "2027-01-15" });
    expect(check.fits).toBe(false);
    expect(check.latestExit).toBe("2026-12-29");
    const asOneStay = evaluate([{ entry: "2026-10-01", exit: "2027-01-15" }], "2027-01-15");
    expect(asOneStay.overstays[0]?.from).toBe("2026-12-30");
  });

  it("gives the same latest exit as the status panel, and the boundary is day 90", () => {
    expect(evaluate(open, today, today).latestExit).toBe("2026-12-29");
    expect(checkPlannedTrip(open, today, { entry: "2026-12-01", exit: "2026-12-29" }).fits).toBe(true);
    expect(checkPlannedTrip(open, today, { entry: "2026-12-01", exit: "2026-12-30" }).fits).toBe(false);
  });
});

describe("calendar edges", () => {
  it("a leap-day stay leaves the window exactly 180 days later", () => {
    const leap = [{ entry: "2024-02-29", exit: "2024-02-29" }];
    expect(evaluate(leap, "2024-08-26").daysUsed).toBe(1);
    expect(evaluate(leap, "2024-08-27").daysUsed).toBe(0);
  });
  it("counts across a year end and through 2100, which is not a leap year", () => {
    expect(evaluate([{ entry: "2025-12-25", exit: "2026-01-05" }], "2026-01-05").daysUsed).toBe(12);
    expect(evaluate([{ entry: "2100-02-27", exit: "2100-03-02" }], "2100-03-02").daysUsed).toBe(4);
  });
});
