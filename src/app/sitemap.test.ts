import { readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import robots from "./robots";
import sitemap from "./sitemap";

describe("sitemap and robots", () => {
  it("list every public page and keep the API out", () => {
    expect(sitemap().map((entry) => entry.url)).toEqual([
      "https://ninety-coral.vercel.app",
      "https://ninety-coral.vercel.app/ees",
      "https://ninety-coral.vercel.app/letter",
      "https://ninety-coral.vercel.app/parity",
      "https://ninety-coral.vercel.app/proof",
    ]);
    const rules = robots().rules as { disallow: string }[];
    expect(rules[0].disallow).toBe("/api/");
    expect(robots().sitemap).toBe("https://ninety-coral.vercel.app/sitemap.xml");
  });
  it("misses no page folder in src/app", () => {
    const pages = readdirSync("src/app").filter((d) => statSync(`src/app/${d}`).isDirectory() && readdirSync(`src/app/${d}`).includes("page.tsx"));
    const listed = sitemap().map((e) => new URL(e.url).pathname);
    for (const page of pages) expect(listed, page).toContain(`/${page}`);
  });
});
