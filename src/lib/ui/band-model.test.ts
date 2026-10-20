import { describe, expect, it } from "vitest";
import { SCENARIOS } from "@/lib/scenarios";
import { bandModel } from "./band-model";

const count = (days: boolean[]) => days.filter(Boolean).length;

describe("bandModel", () => {
  it("labels the sample history as an example, and its numbers come from the engine", () => {
    const m = bandModel(null);
    expect(m.source).toBe("example");
    expect(m.label).toBe("Example history, read on 2026-10-19");
    expect([m.used, m.left]).toEqual([56, 34]);
    expect(m.days).toHaveLength(180);
    expect(count(m.days)).toBe(56);
  });

  it("follows the near-limit scenario: 88 used, 2 left", () => {
    const m = bandModel(SCENARIOS["near-limit"]);
    expect(m.source).toBe("near-limit");
    expect(m.label).toContain("Demo scenario: Two long stays");
    expect([m.used, m.left]).toEqual([88, 2]);
    expect(count(m.days)).toBe(88);
  });

  it("follows the open stay through today: 19 used, 71 left, today counted", () => {
    const m = bandModel(SCENARIOS["open-stay"]);
    expect([m.used, m.left]).toEqual([19, 71]);
    expect(m.days[179]).toBe(true);
    expect(m.days[160]).toBe(false);
  });

  it("follows the overstay: 107 days in the window, none left", () => {
    const m = bandModel(SCENARIOS.overstay);
    expect([m.used, m.left]).toEqual([107, 0]);
    expect(count(m.days)).toBe(107);
  });
});
