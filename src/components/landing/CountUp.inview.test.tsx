// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

// The band is on screen: in-view fires at once.
vi.mock("framer-motion", async (orig) => ({ ...(await orig<typeof import("framer-motion")>()), useInView: () => true }));
window.matchMedia ??= ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })) as unknown as typeof window.matchMedia;

import { CountUp } from "./motion";

afterEach(cleanup);

describe("CountUp on screen", () => {
  it("never drops below the real value once shown (no 0 flash on scroll-in)", async () => {
    render(<span data-testid="n"><CountUp value={88} /></span>);
    const el = screen.getByTestId("n");
    const seen = new Set<string>([el.textContent ?? ""]);
    const mo = new MutationObserver(() => seen.add(el.textContent ?? ""));
    mo.observe(el, { subtree: true, characterData: true, childList: true });
    await new Promise((r) => setTimeout(r, 1200));
    mo.disconnect();
    expect([...seen]).toEqual(["88"]);
  });
});
