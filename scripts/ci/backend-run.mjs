#!/usr/bin/env node
/**
 * Runs the 30 TestSprite backend tests ("Ninety API") against one base URL and exits 1 on any
 * failure. Used by .github/workflows/testsprite-backend.yml.
 *
 *   TESTSPRITE_API_KEY=... node scripts/ci/backend-run.mjs https://<preview>.vercel.app
 *
 * The backend tests are Python files in testsprite_tests/backend/ with the base URL in one line,
 * `BASE_URL = "https://ninety-coral.vercel.app"`. TestSprite passes no environment URL or variable
 * to backend tests (checked: `__VARS__` is empty even with an environment variable set, and the
 * Starter plan allows one environment). So before each run this uploads the repository's copy of
 * the test with that line pointing at the target (`test code put`). Every run starts from the repo
 * files, so a cancelled job cannot leave a stale URL behind for the next one. The workflow
 * serialises runs with a concurrency group because the tests are shared.
 * Cost: 0.2 credits per test, 6.0 per run.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BIN = process.env.TESTSPRITE_BIN ?? "testsprite";
const target = (process.argv[2] ?? "").replace(/\/+$/, "");
if (!/^https:\/\/[a-z0-9.-]+$/i.test(target)) {
  console.error(`Usage: backend-run.mjs https://host (got "${target}")`);
  process.exit(5);
}
const LINE = /^BASE_URL = "https:\/\/ninety-coral\.vercel\.app"$/m;
const allIds = JSON.parse(readFileSync("testsprite_tests/backend-ids.json", "utf8"));
// BACKEND_ONLY=BE01,BE28 runs a subset (local checks); CI always runs all 30.
const only = (process.env.BACKEND_ONLY ?? "").split(",").filter(Boolean);
const ids = Object.fromEntries(Object.entries(allIds).filter(([n]) => !only.length || only.some((o) => n.startsWith(o))));
const dir = mkdtempSync(join(tmpdir(), "be-"));

function once(args) {
  try {
    return { code: 0, out: execFileSync(BIN, [...args, "--output", "json"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }), err: "" };
  } catch (e) {
    return { code: e.status ?? 1, out: String(e.stdout ?? ""), err: String(e.stderr ?? "") };
  }
}

// Exit 11 is "rate limited": per-minute throttling or the in-flight cap (50 runs per account, every
// source counted). The TestSprite GitHub App starts the 54 frontend tests on the same push, so on PR
// #68 every backend trigger was refused for about 45 seconds and all 30 ended as "error" with no run.
// Wait and retry instead (up to ~15 minutes), as the CLI help says: "runs have to finish first".
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
function cli(args) {
  let r = once(args);
  for (let attempt = 1; r.code === 11 && attempt <= 30; attempt += 1) {
    console.log(`  rate limited (exit 11), retry ${attempt} in 30 s`);
    sleep(30_000);
    r = once(args);
  }
  return r;
}

const rows = [];
for (const [name, id] of Object.entries(ids)) {
  const src = readFileSync(`testsprite_tests/backend/${name}.py`, "utf8");
  if (!LINE.test(src)) throw new Error(`${name}: no BASE_URL line to point at the target`);
  const file = join(dir, `${name}.py`);
  writeFileSync(file, src.replace(LINE, `BASE_URL = ${JSON.stringify(target)}`));
  const put = cli(["test", "code", "put", id, "--code-file", file, "--force"]);
  if (put.code !== 0) { rows.push({ name, id, status: "error", detail: "code put failed" }); continue; }
  const run = cli(["test", "run", id, "--no-auto-heal", "--wait", "--timeout", "300"]);
  let body = {};
  try { body = JSON.parse(run.out.slice(run.out.indexOf("{"))); } catch { /* keep empty */ }
  rows.push({ name, id, status: body.status ?? (run.code === 0 ? "passed" : "error"), runId: body.runId ?? "", exitCode: run.code, detail: (body.error || run.err.trim().split("\n").pop() || "").split("\n")[0].slice(0, 200) });
  console.log(`${rows.at(-1).status.padEnd(7)} ${name} ${rows.at(-1).runId}`);
}

const failed = rows.filter((r) => r.status !== "passed");
const summary = [
  `### TestSprite backend: ${rows.length - failed.length}/${rows.length} passed against ${target}`,
  "",
  "| Test | Result | Run |",
  "|---|---|---|",
  ...rows.map((r) => `| ${r.name} | ${r.status}${r.detail ? `: ${r.detail.replace(/\|/g, "/")}` : ""} | ${r.runId} |`),
  "",
].join("\n");
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
writeFileSync("backend-results.json", JSON.stringify({ target, rows }, null, 2));
console.log(`${rows.length - failed.length}/${rows.length} passed against ${target}`);
process.exit(failed.length ? 1 : 0);
