import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PAGES, SITE_URL, pageMetadata } from "./meta";

const FILES: Record<string, string> = {
  "/": "src/app/page.tsx",
  "/ees": "src/app/ees/page.tsx",
  "/letter": "src/app/letter/page.tsx",
  "/parity": "src/app/parity/page.tsx",
  "/proof": "src/app/proof/page.tsx",
};

describe("page metadata", () => {
  it("gives every page a distinct title and a description a search result can show", () => {
    const entries = Object.values(PAGES);
    expect(new Set(entries.map((p) => p.title)).size).toBe(entries.length);
    for (const p of entries) {
      expect(p.description.length).toBeGreaterThan(50);
      expect(p.description.length).toBeLessThanOrEqual(200);
    }
  });
  it("sets canonical and Open Graph to the same path and text", () => {
    const meta = pageMetadata("/ees");
    expect(meta.title).toBe(PAGES["/ees"].title);
    expect(meta.alternates?.canonical).toBe("/ees");
    expect(meta.openGraph).toMatchObject({ url: "/ees", title: PAGES["/ees"].title, description: PAGES["/ees"].description });
  });
  it("leaves the home title to the layout default", () => {
    expect(pageMetadata("/").title).toBeUndefined();
  });
  it("is used by every page and by the layout", () => {
    for (const [path, file] of Object.entries(FILES)) expect(readFileSync(file, "utf8"), file).toContain(`pageMetadata("${path}")`);
    const layout = readFileSync("src/app/layout.tsx", "utf8");
    expect(layout).toContain("metadataBase: new URL(SITE_URL)");
    expect(layout).not.toContain("canonical");
    expect(SITE_URL).toBe("https://ninety-coral.vercel.app");
  });
});
