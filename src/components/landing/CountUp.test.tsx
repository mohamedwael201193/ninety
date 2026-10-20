// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CountUp } from "./motion";

class NoopObserver { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
(globalThis as unknown as { IntersectionObserver: typeof NoopObserver }).IntersectionObserver ??= NoopObserver;
window.matchMedia ??= ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })) as unknown as typeof window.matchMedia;

afterEach(cleanup);

describe("CountUp", () => {
  it("shows the real figure before (or without) the in-view animation, never a stray 0", () => {
    render(<span data-testid="n"><CountUp value={88} /></span>);
    expect(screen.getByTestId("n").textContent).toBe("88");
  });
  it("follows a new value at once (scenario loaded after mount)", () => {
    const { rerender } = render(<span data-testid="n"><CountUp value={56} /></span>);
    rerender(<span data-testid="n"><CountUp value={2} /></span>);
    expect(screen.getByTestId("n").textContent).toBe("2");
  });
});
