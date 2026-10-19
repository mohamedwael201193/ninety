import type { MetadataRoute } from "next";
import { PAGES, SITE_URL } from "@/lib/site/meta";

/** Every public page, from the same list that gives each page its title and description. */
export default function sitemap(): MetadataRoute.Sitemap {
  return Object.keys(PAGES).map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
