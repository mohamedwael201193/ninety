// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { evaluate } from "@/lib/schengen/engine";
import { SCENARIOS, scenarioTrips } from "@/lib/scenarios";
import { StatusPanel } from "./StatusPanel";

class NoopObserver { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
(globalThis as unknown as { IntersectionObserver: typeof NoopObserver }).IntersectionObserver ??= NoopObserver;
window.matchMedia ??= ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })) as unknown as typeof window.matchMedia;

afterEach(cleanup);

function renderScenario(id: keyof typeof SCENARIOS) {
  const trips = scenarioTrips(SCENARIOS[id]);
  render(<StatusPanel assessment={evaluate(trips, SCENARIOS[id].on)} todayOverride todayInvalid={false} trips={trips} />);
}

describe("StatusPanel figures list", () => {
  it("groups inside the <dl> contain only <dt> and <dd> (axe definition-list)", () => {
    renderScenario("overstay");
    const groups = [...document.querySelectorAll("dl > div")];
    expect(groups.length).toBe(5);
    for (const group of groups) for (const child of group.children) expect(["DT", "DD"]).toContain(child.tagName);
  });
  it("keeps each figure's own value alone in its test id, with the hint as a separate <dd>", () => {
    renderScenario("open-stay");
    expect(screen.getByTestId("latest-exit").textContent).toBe("2026-12-29");
    const hint = screen.getByTestId("latest-exit").nextElementSibling;
    expect(hint?.tagName).toBe("DD");
    expect(hint?.textContent).toContain("2026");
  });
  it("lists the earlier overstay hint under 'Not today'", () => {
    renderScenario("overstay");
    expect(screen.getByTestId("overstay-status").textContent).toBe("Not today");
    expect(screen.getByTestId("overstay-status").nextElementSibling?.textContent).toBe("An earlier overstay is listed below");
  });
});
