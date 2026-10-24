#!/usr/bin/env node
/**
 * Runs the TestSprite smoke tests one at a time against a deployed URL and writes
 * testsprite-junit.xml + smoke-summary.json. Used by .github/workflows/testsprite-smoke.yml.
 *
 *   TESTSPRITE_API_KEY=... SMOKE_PLANS="TS01-example-trips TS03-add-trip" \
 *     node scripts/ci/smoke-run.mjs https://ninety-coral.vercel.app
 *
 * Why one call per test: `testsprite test run <id> <id> --target-url <url>` (CLI 0.15.0) refuses
 * several ids against a remote URL; several ids in one call are accepted only with `--local`
 * (one shared tunnel). One `test run <id> --target-url <url> --wait` per test costs the same
 * (0.5 credits per frontend test) and gives each test its own verdict and run id.
 * Exits 1 if any test does not pass.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";

const BIN = process.env.TESTSPRITE_BIN ?? "testsprite";
const target = (process.argv[2] ?? "").replace(/\/+$/, "");
if (!/^https:\/\/[a-z0-9.-]+$/i.test(target)) {
  console.error(`Usage: smoke-run.mjs https://host (got "${target}")`);
  process.exit(5);
}
// Ids come from the main project (test-ids.json, the one the GitHub App runs on every PR) and from the
// "Ninety phone width (CLI only)" project (phone-ids.json): the App runs tests in a desktop-size browser
// that cannot be resized, so phone-width checks live in that second project and run only from the CLI,
// whose replay honours the viewport the stored code sets.
const map = { ...JSON.parse(readFileSync("testsprite_tests/test-ids.json", "utf8")), ...JSON.parse(readFileSync("testsprite_tests/phone-ids.json", "utf8")) };
const plans = (process.env.SMOKE_PLANS ?? "").split(/\s+/).filter(Boolean);
if (!plans.length) { console.error("SMOKE_PLANS is empty"); process.exit(5); }

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rows = [];
for (const name of plans) {
  const id = map[name];
  if (!id) throw new Error(`no test id for ${name}`);
  const t0 = Date.now();
  let code = 0, out = "";
  try {
    out = execFileSync(BIN, ["test", "run", id, "--target-url", target, "--wait", "--timeout", "900", "--output", "json"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) { code = e.status ?? 1; out = String(e.stdout ?? ""); }
  let body = {};
  try { body = JSON.parse(out.slice(out.indexOf("{"))); } catch { /* keep empty */ }
  const status = body.status ?? (code === 0 ? "passed" : code === 7 ? "timedOut" : "error");
  rows.push({ name, id, status, runId: body.runId ?? "", exitCode: code, seconds: Math.round((Date.now() - t0) / 1000),
    detail: String(body.error ?? body.message ?? "").split("\n")[0].slice(0, 300) });
  console.log(`${status.padEnd(8)} ${name} ${rows.at(-1).runId}`);
}

const failed = rows.filter((r) => r.status !== "passed");
const summary = { target, total: rows.length, passed: rows.length - failed.length,
  failed: rows.filter((r) => r.status === "failed").length, timedOut: rows.filter((r) => r.status === "timedOut").length,
  skipped: 0, runs: rows };
writeFileSync("smoke-summary.json", JSON.stringify(summary, null, 2));
writeFileSync("testsprite-junit.xml", [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<testsuites><testsuite name="testsprite-smoke" tests="${rows.length}" failures="${failed.length}">`,
  ...rows.map((r) => `  <testcase classname="testsprite" name="${esc(r.name)}" runId="${esc(r.runId)}" time="${r.seconds}">${
    r.status === "passed" ? "" : `<failure message="${esc(r.status + (r.detail ? ": " + r.detail : ""))}"/>`}</testcase>`),
  `</testsuite></testsuites>`, ""].join("\n"));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, [
  `### TestSprite smoke: ${summary.passed}/${rows.length} passed against ${target}`, "",
  "| Test | Result | TestSprite run |", "|---|---|---|",
  ...rows.map((r) => `| ${r.name} | ${r.status}${r.detail ? `: ${r.detail.replace(/\|/g, "/")}` : ""} | ${r.runId} |`), ""].join("\n"));
console.log(`${summary.passed}/${rows.length} passed against ${target}`);
process.exit(failed.length ? 1 : 0);
