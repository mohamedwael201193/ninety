import type { Metadata } from "next";

export const SITE_URL = "https://ninety-coral.vercel.app";

type PagePath = "/" | "/ees" | "/letter" | "/parity" | "/proof" | "/developers";

/** Title (without the "· Ninety" suffix the layout adds) and description for every page. */
export const PAGES: Record<PagePath, { title: string; description: string }> = {
  "/": {
    title: "Ninety — Schengen days left",
    description: "How many Schengen days do you really have left? A 90/180 count rebuilt from your trips, with a check against the EU Entry/Exit System's count.",
  },
  "/ees": {
    title: "EES check — compare your days with the border's count",
    description: "Compare the EES days-used figure with your own trips and see exactly which days differ, and why.",
  },
  "/letter": {
    title: "Article 52 correction letter",
    description: "Draft a request to rectify Entry/Exit System data under Article 52 of Regulation (EU) 2017/2226, with your figures and the EES figures side by side.",
  },
  "/parity": {
    title: "Parity with the Commission calculator",
    description: "Ninety and the European Commission's own short-stay calculator: 14 scenarios fetched live, and a larger stored set compared on every field the calculator prints.",
  },
  "/developers": {
    title: "API and MCP server",
    description: "A public JSON API and an MCP server for the same 90/180 engine, EES comparison and Article 52 letter. OpenAPI 3.1, no key, nothing stored.",
  },
  "/proof": {
    title: "Proof: every rule and the tests that guard it",
    description: "Each 90/180, EES and Article 52 rule Ninety implements, with its engine test, its Commission parity scenario and its TestSprite end-to-end test.",
  },
};

/** Metadata for a page: title, description, canonical URL and matching Open Graph tags. */
export function pageMetadata(path: PagePath): Metadata {
  const { title, description } = PAGES[path];
  return {
    ...(path === "/" ? {} : { title }),
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: "Ninety", url: path, title, description },
    twitter: { card: "summary", title, description },
  };
}
