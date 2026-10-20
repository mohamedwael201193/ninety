// @vitest-environment jsdom
/** Round 3 of the independent Cursor review, UI findings 9 and 10, reproduced here. */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { checkPlannedTrip, evaluate } from "@/lib/schengen/engine";
import { StatusPanel } from "./StatusPanel";
import { WindowBar } from "./dashboard/WindowBar";

class NoopObserver { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
(globalThis as unknown as { IntersectionObserver: typeof NoopObserver }).IntersectionObserver ??= NoopObserver;
window.matchMedia ??= ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })) as unknown as typeof window.matchMedia;
afterEach(cleanup);

describe("R3-9: the planned-trip bar counts what the fit verdict assumes during an open stay", () => {
  it("open stay since 2026-10-01, today 10-19, plan 12-01..12-29: the bar counts 61 + 29 = 90", () => {
    const trips = [{ entry: "2026-10-01", exit: null }];
    const plan = { entry: "2026-12-01", exit: "2026-12-29" };
    expect(checkPlannedTrip(trips, "2026-10-19", plan).fits).toBe(true);
    render(<WindowBar trips={trips} today="2026-10-19" end={plan.exit} planned={plan} />);
    const label = screen.getByTestId("window-bar").querySelector("[role=img]")!.getAttribute("aria-label")!;
    expect(label.startsWith("61 of the last 180 days counted")).toBe(true);
  });
});

describe("R3-10: an overstay after the date is not called earlier", () => {
  it("booked 2024-01-01..04-15, read on 2024-03-01", () => {
    const trips = [{ entry: "2024-01-01", exit: "2024-04-15" }];
    render(<StatusPanel assessment={evaluate(trips, "2024-03-01")} todayOverride todayInvalid={false} trips={trips} />);
    expect(screen.getByTestId("overstay-status").nextElementSibling?.textContent).toBe("A later overstay is listed below");
  });
});
