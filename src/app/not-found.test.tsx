// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({ usePathname: () => "/nope" }));
window.matchMedia ??= ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })) as unknown as typeof window.matchMedia;

import NotFound, { metadata } from "./not-found";

afterEach(cleanup);

describe("404 page", () => {
  it("says the page does not exist and that saved trips are safe", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("This page is outside the window.");
    expect(screen.getByTestId("not-found").textContent).toContain("Your trips are still saved in this browser.");
  });
  it("links to every page of the app", () => {
    render(<NotFound />);
    const hrefs = ["check", "ees", "letter", "parity", "proof"].map((id) => screen.getByTestId(`not-found-${id}`).getAttribute("href"));
    expect(hrefs).toEqual(["/#check", "/ees", "/letter", "/parity", "/proof"]);
  });
  it("has its own title and is not indexed", () => {
    expect(metadata.title).toBe("Page not found");
    expect(metadata.robots).toEqual({ index: false });
  });
});
