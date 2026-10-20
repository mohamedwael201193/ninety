// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { consumeFresh } from "./fresh";
import { TRIP_STORAGE_KEY } from "@/lib/trips";

describe("?fresh=1", () => {
  it("clears saved trips once and drops itself from the address, so a reload keeps new trips", () => {
    window.history.replaceState(null, "", "/?today=2026-10-19&fresh=1#check");
    window.localStorage.setItem(TRIP_STORAGE_KEY, "[]");
    expect(consumeFresh(window)).toBe(true);
    expect(window.localStorage.getItem(TRIP_STORAGE_KEY)).toBeNull();
    expect(window.location.search).toBe("?today=2026-10-19");
    expect(window.location.hash).toBe("#check");
    window.localStorage.setItem(TRIP_STORAGE_KEY, "[1]");
    expect(consumeFresh(window)).toBe(false);
    expect(window.localStorage.getItem(TRIP_STORAGE_KEY)).toBe("[1]");
  });
});
