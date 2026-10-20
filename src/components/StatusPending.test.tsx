import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams("today=2024-08-27"), usePathname: () => "/", useRouter: () => ({ push() {}, replace() {}, prefetch() {} }) }));
const { AppShell } = await import("./AppShell");
const { default: Home } = await import("@/app/page");

// TestSprite TS42 failed once on PR #60 reading "Days used" as empty: before the saved trips are
// read, the status area was a blank skeleton (and the server HTML said only "Loading…").
// Effects do not run in renderToStaticMarkup, so this is exactly the state before trips load.
function cell(html: string, id: string): string | undefined {
  return new RegExp(`data-testid="${id}"[^>]*>([^<]*)<`).exec(html)?.[1];
}

describe("the count is never an empty cell before the trips load", () => {
  it("the calculator's first render labels Days used and Days left as pending, in words", () => {
    const html = renderToStaticMarkup(<AppShell />);
    expect(cell(html, "days-used")).toBe("Counting your saved trips…");
    expect(cell(html, "days-left")).toBe("Counting your saved trips…");
    expect(html).toContain('data-state="pending"');
    // Without JavaScript: a noscript note that says so, and a style that hides "Counting…".
    expect(html).toMatch(/<noscript>[^]*needs JavaScript[^]*<\/noscript>/);
    expect(html).toMatch(/<noscript>[^]*\[data-state="pending"\]\{display:none\}[^]*<\/noscript>/);
  });

  it("the home page's server fallback shows the same pending tiles, not only Loading…", () => {
    const html = renderToStaticMarkup(<Home />);
    expect(cell(html, "days-used")).toMatch(/\S/);
    expect(html).not.toMatch(/>Loading…</);
  });
});
