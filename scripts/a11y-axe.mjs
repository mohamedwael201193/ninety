// Runs axe-core in Chrome on each page of a running Ninety and writes a report.
// Usage: node scripts/a11y-axe.mjs [baseUrl]   (default http://localhost:3000)
// Needs Chrome (preinstalled on GitHub's ubuntu runners), or set CHROME_PATH.
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright-core";
import { markdown, summarize } from "./a11y-report.mjs";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const PAGES = [
  "/?today=2026-10-19&fresh=1",
  "/?scenario=near-limit",
  "/ees?scenario=near-limit",
  "/letter?scenario=near-limit",
  "/parity",
  "/proof",
];

// Desktop and a phone width: the nav and several layouts change below 768 px.
const VIEWPORTS = [{ name: "desktop", width: 1280, height: 900 }, { name: "phone", width: 390, height: 844 }];

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");
const axeSource = readFileSync(axePath, "utf8");
const axeVersion = JSON.parse(readFileSync(require.resolve("axe-core/package.json"), "utf8")).version;

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" });
const results = [];
try {
  for (const viewport of VIEWPORTS) for (const path of PAGES) {
    // Reduced motion: measure the finished page, not a frame of an entrance animation.
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.addScriptTag({ content: axeSource });
    const out = await page.evaluate(async (tags) => {
      // @ts-expect-error axe is injected above
      const r = await window.axe.run(document, { runOnly: { type: "tag", values: tags } });
      return { violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => n.target.join(" ")) })), passes: r.passes.length, incomplete: r.incomplete.length };
    }, TAGS);
    results.push({ path: `${path} (${viewport.name} ${viewport.width}px)`, ...out });
    await context.close();
  }
} finally {
  await browser.close();
}

const summary = summarize(results);
const md = markdown(summary, { url: base, tags: TAGS, axeVersion });
writeFileSync("axe-report.json", JSON.stringify({ base, axeVersion, tags: TAGS, generatedAt: new Date().toISOString(), pages: results }, null, 2));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
process.stdout.write(md);
for (const r of results) for (const v of r.violations) console.log(`${r.path}  [${v.impact}] ${v.id}: ${v.help}\n    ${v.nodes.join("\n    ")}`);
process.exit(summary.ok ? 0 : 1);
