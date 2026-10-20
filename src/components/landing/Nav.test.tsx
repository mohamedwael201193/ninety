// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
window.matchMedia ??= ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })) as unknown as typeof window.matchMedia;

import Nav from "./Nav";

afterEach(cleanup);

describe("Nav", () => {
  it("keeps the page links visible at every width (no 'hidden' below md)", () => {
    render(<Nav />);
    const row = screen.getByTestId("nav-links");
    expect(row.className.split(/\s+/)).not.toContain("hidden");
    expect(row.className).toContain("overflow-x-auto");
    expect(["nav-ees", "nav-letter", "nav-parity", "nav-proof"].map((id) => screen.getByTestId(id).getAttribute("href"))).toEqual(["/ees", "/letter", "/parity", "/proof"]);
  });
  it("marks the current page with aria-current", () => {
    pathname = "/ees";
    render(<Nav />);
    expect(screen.getByTestId("nav-ees").getAttribute("aria-current")).toBe("page");
    expect(screen.getByTestId("nav-letter").getAttribute("aria-current")).toBeNull();
  });
  it("carries the scenario to the EES check", async () => {
    pathname = "/";
    window.history.replaceState(null, "", "/?scenario=near-limit");
    render(<Nav />);
    await vi.waitFor(() => expect(screen.getByTestId("nav-ees").getAttribute("href")).toBe("/ees?scenario=near-limit"));
    window.history.replaceState(null, "", "/");
  });

  it("Check and Plan keep ?scenario= and ?today= from another page, like EES check and Letter", () => {
    pathname = "/ees";
    window.history.replaceState(null, "", "/ees?scenario=near-limit&today=2026-10-19&fresh=1");
    render(<Nav />);
    const hrefs = screen.getAllByRole("link").map((a) => [a.textContent, a.getAttribute("href")]);
    expect(hrefs).toContainEqual(["Check", "/?scenario=near-limit&today=2026-10-19#check"]);
    expect(hrefs).toContainEqual(["Plan", "/?scenario=near-limit&today=2026-10-19#planned-heading"]);
    window.history.replaceState(null, "", "/");
    pathname = "/";
  });
});
