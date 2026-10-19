// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PlannedTripForm } from "./PlannedTripForm";

afterEach(cleanup);
window.matchMedia ??= ((query: string) => ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false })) as typeof window.matchMedia;

async function check(entry: string, exit: string) {
  (screen.getByTestId("planned-entry") as HTMLInputElement).value = entry;
  (screen.getByTestId("planned-exit") as HTMLInputElement).value = exit;
  await act(async () => {
    fireEvent.click(screen.getByTestId("planned-check"));
    await new Promise((r) => setTimeout(r, 30));
  });
  return screen.getAllByTestId("planned-result").map((el) => el.textContent ?? "");
}

describe("PlannedTripForm during an open stay", () => {
  it("shows one up-to-date verdict when only the exit changes", async () => {
    render(<PlannedTripForm history={[{ entry: "2026-10-01", exit: null }]} today="2026-10-19" />);
    const first = await check("2026-12-01", "2026-12-29");
    expect(first).toHaveLength(1);
    expect(first[0]).toMatch(/^Fits/);
    const second = await check("2026-12-01", "2026-12-30");
    expect(second).toHaveLength(1);
    expect(second[0]).toMatch(/^Does not fit/);
    expect(second[0]).toContain("2026-12-29");
  });
});
