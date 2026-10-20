import { describe, expect, it } from "vitest";
import { parseTrips, serializeTrips, type Trip } from "./trips";

describe("trip storage", () => {
  it("round-trips valid trips and drops corrupt records", () => {
    const trips: Trip[] = [
      { id: "a", entry: "2024-06-01", exit: "2024-06-14" },
      { id: "b", entry: "2024-08-01", exit: null },
    ];
    expect(parseTrips(serializeTrips(trips))).toEqual(trips);
    expect(parseTrips(null)).toEqual([]);
    expect(parseTrips("{")).toEqual([]);
    expect(
      parseTrips(
        JSON.stringify([
          { id: "ok", entry: "2024-01-01", exit: "2024-01-02" },
          { id: "", entry: "2024-01-01", exit: null },
          { id: "bad", entry: "01-01-2024", exit: null },
          { entry: "2024-01-01", exit: null },
          "nope",
        ]),
      ),
    ).toEqual([{ id: "ok", entry: "2024-01-01", exit: "2024-01-02" }]);
  });
});

describe("stored trips with an exit before the entry", () => {
  it("are dropped when loading, and the valid trips are kept", () => {
    const raw = JSON.stringify([
      { id: "a", entry: "2024-06-10", exit: "2024-06-01" },
      { id: "b", entry: "2024-07-01", exit: "2024-07-10" },
    ]);
    expect(parseTrips(raw)).toEqual([{ id: "b", entry: "2024-07-01", exit: "2024-07-10" }]);
  });
});
