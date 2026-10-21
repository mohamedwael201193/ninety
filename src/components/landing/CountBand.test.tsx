// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { saveTrips } from "@/lib/trips";
import CountBand from "./CountBand";
import { consumeFresh } from "@/lib/ui/fresh";

// jsdom has no IntersectionObserver; framer-motion's whileInView/useInView need one.
class NoopObserver { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
(globalThis as unknown as { IntersectionObserver: typeof NoopObserver }).IntersectionObserver ??= NoopObserver;
window.matchMedia ??= ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })) as unknown as typeof window.matchMedia;

afterEach(() => { cleanup(); window.localStorage.clear(); window.history.replaceState(null, "", "/"); });

describe("CountBand", () => {
  it("says it is an example when no scenario is open", () => {
    render(<CountBand />);
    expect(screen.getByTestId("count-band").getAttribute("data-source")).toBe("example");
    expect(screen.getByTestId("band-label").textContent).toBe("Example history, read on 2026-10-19");
  });

  it("follows ?scenario= so it agrees with the calculator below", async () => {
    window.history.replaceState(null, "", "/?scenario=near-limit");
    render(<CountBand />);
    expect(screen.getByTestId("count-band").getAttribute("data-source")).toBe("near-limit");
    expect(screen.getByTestId("band-label").textContent).toContain("Demo scenario");
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("180-day window: 88 days used, 2 days left.");
  });

  it("follows the saved trips, read on today, when no scenario is open", () => {
    window.history.replaceState(null, "", "/?today=2026-10-19");
    saveTrips(window.localStorage, [{ id: "a", entry: "2026-10-01", exit: "2026-10-10" }]);
    render(<CountBand />);
    expect(screen.getByTestId("count-band").getAttribute("data-source")).toBe("saved");
    expect(screen.getByTestId("band-label").textContent).toBe("Your saved trips, read on 2026-10-19");
    expect(screen.getByTestId("band-used").getAttribute("data-value")).toBe("10");
  });

  it("updates when trips are saved on the page", () => {
    window.history.replaceState(null, "", "/?today=2026-10-19");
    render(<CountBand />);
    expect(screen.getByTestId("count-band").getAttribute("data-source")).toBe("example");
    act(() => saveTrips(window.localStorage, [{ id: "a", entry: "2026-10-15", exit: null }]));
    expect(screen.getByTestId("count-band").getAttribute("data-source")).toBe("saved");
    expect(screen.getByTestId("band-used").getAttribute("data-value")).toBe("5");
  });

  it("drops the saved trips when ?fresh=1 clears them after the band has read them (watchdog: 64/26 under \"Your saved trips\" on a fresh page)", () => {
    saveTrips(window.localStorage, [{ id: "a", entry: "2026-06-01", exit: "2026-08-03" }]);
    window.history.replaceState(null, "", "/?today=2026-10-19&fresh=1");
    render(<CountBand />);
    expect(screen.getByTestId("count-band").getAttribute("data-source")).toBe("saved");
    act(() => { consumeFresh(window); });
    expect(screen.getByTestId("count-band").getAttribute("data-source")).toBe("example");
    expect(screen.getByTestId("band-label").textContent).toBe("Example history, read on 2026-10-19");
  });
});
