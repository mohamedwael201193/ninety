// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import CountBand from "./CountBand";

// jsdom has no IntersectionObserver; framer-motion's whileInView/useInView need one.
class NoopObserver { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
(globalThis as unknown as { IntersectionObserver: typeof NoopObserver }).IntersectionObserver ??= NoopObserver;
window.matchMedia ??= ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })) as unknown as typeof window.matchMedia;

afterEach(() => { cleanup(); window.history.replaceState(null, "", "/"); });

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
});
