#!/usr/bin/env node
/**
 * Builds LOOP.md and src/data/loop.json from TestSprite's own run history.
 * Nothing here is typed by hand: every row comes from
 * `testsprite test result <id> --history --output json` (a read; it runs nothing).
 *
 *   TESTSPRITE_API_KEY=... node scripts/loop-proof.mjs
 *
 * TESTSPRITE_BIN overrides the CLI path. Run history is kept 30 days on the Starter plan,
 * so older runs drop out; the generated files keep what was there when they were made.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const BIN = process.env.TESTSPRITE_BIN ?? "testsprite";
const REPO = "https://github.com/mohamedwael201193/ninety";
const ids = JSON.parse(readFileSync("testsprite_tests/test-ids.json", "utf8"));
const kinds = JSON.parse(readFileSync("testsprite_tests/red-runs.json", "utf8"));
const KIND = { app: "App defect", "plan-ci": "Test plan or CI", blocked: "Blocked, not a catch" };
// The GitHub "TestSprite V3" check on each red commit (written by scripts/loop-iterations.mjs).
// The check counts every test the run had; the history below counts only tests still in test-ids.json.
let checkSaid = {};
try {
  for (const it of JSON.parse(readFileSync("src/data/loop-iterations.json", "utf8")).iterations)
    checkSaid[it.pr] = it.checks.filter((c) => c.state !== "success").map((c) => c.description).filter(Boolean);
} catch { checkSaid = {}; }

function cli(args) {
  return JSON.parse(execFileSync(BIN, [...args, "--output", "json"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
}

const runs = [];
for (const [plan, testId] of Object.entries(ids)) {
  let cursor = null;
  do {
    const page = cli(["test", "result", testId, "--history", "--page-size", "100", ...(cursor ? ["--cursor", cursor] : [])]);
    for (const r of page.runs) {
      const env = r.environment?.name ?? "default";
      const pr = /^github-pr-(\d+)$/.exec(env)?.[1];
      runs.push({
        test: plan.split("-")[0],
        plan,
        runId: r.runId,
        status: r.status,
        failureKind: r.failureKind,
        source: r.source,
        env,
        pr: pr ? Number(pr) : null,
        at: r.createdAt,
        target: r.targetUrl,
      });
    }
    cursor = page.nextCursor;
  } while (cursor);
}
runs.sort((a, b) => a.at.localeCompare(b.at));

// One "execution" = one run of the suite on one PR (or production): runs started within 10 minutes
// of each other, until a test repeats (a repeat means the suite was started again).
const executions = [];
for (const r of runs.filter((x) => x.status !== "running" && x.status !== "queued")) {
  const key = r.pr ?? r.env;
  const last = executions.findLast((e) => e.key === key);
  if (last && Date.parse(r.at) - Date.parse(last.end) < 10 * 60_000 && !last.runs.some((x) => x.plan === r.plan)) {
    last.runs.push(r);
    last.end = r.at;
  } else {
    executions.push({ key, pr: r.pr, env: r.env, start: r.at, end: r.at, runs: [r] });
  }
}
const summary = executions.map((e) => {
  const failed = e.runs.filter((r) => r.status !== "passed");
  return {
    pr: e.pr,
    env: e.env,
    start: e.start,
    tests: e.runs.length,
    passed: e.runs.length - failed.length,
    failed: failed.map((r) => ({ test: r.test, runId: r.runId, failureKind: r.failureKind })),
  };
});

// PRs whose history shows a red execution followed by a green one.
const loops = [];
for (const pr of new Set(summary.filter((s) => s.pr).map((s) => s.pr))) {
  const list = summary.filter((s) => s.pr === pr);
  const red = list.find((s) => s.failed.length > 0);
  const green = red && list.find((s) => s.start > red.start && s.failed.length === 0);
  if (red) loops.push({ pr, red, green: green ?? null, kind: kinds[pr]?.kind ?? "unclassified" });
}

const out = { generatedAt: new Date().toISOString(), source: "testsprite test result --history", runs: runs.length, executions: summary, loops };
writeFileSync("src/data/loop.json", JSON.stringify(out, null, 2) + "\n");

function checkOnly() {
  return Object.entries(checkSaid).filter(([p, d]) => d.some((x) => /\d+ failed/.test(x)) && !loops.some((l) => l.pr === Number(p))).map(([p]) => Number(p));
}
function summaryLine() {
  const by = (k) => loops.filter((l) => l.kind === k).map((l) => `#${l.pr}`);
  const onCheck = loops.filter((l) => (checkSaid[l.pr] ?? []).some((d) => /\d+ failed/.test(d)));
  return `${loops.length} PRs have a red execution, then a green one, in the run history: ${by("app").length} app defects (${by("app").join(", ")}), ${by("plan-ci").length} test plan or CI (${by("plan-ci").join(", ")}), ${by("blocked").length} blocked (${by("blocked").join(", ") || "none"}). ${onCheck.length} of them also show failed tests on the GitHub check (the count in LOOP-ITERATIONS.md and the README); the others: ${loops.filter((l) => !onCheck.includes(l)).map((l) => `#${l.pr}${l.kind === "blocked" ? " (blocked on the check)" : " (no red check)"}`).join(", ")}. ${checkOnly().length ? `Red on the GitHub check but not in this history (the failing test was later replaced): ${checkOnly().map((p) => `#${p} (${KIND[kinds[p]?.kind] ?? "unclassified"})`).join(", ")}.` : ""} So the GitHub check shows ${onCheck.length + checkOnly().length} PRs red, then green.`;
}
if (loops.some((l) => l.kind === "unclassified")) console.warn("unclassified red PRs:", loops.filter((l) => l.kind === "unclassified").map((l) => l.pr));
const prLink = (n) => `[#${n}](${REPO}/pull/${n})`;
const lines = [
  "# The TestSprite loop",
  "",
  `Generated ${out.generatedAt} by \`scripts/loop-proof.mjs\` from \`testsprite test result --history\` (${runs.length} runs). Do not edit by hand.`,
  "",
  "Counts cover the tests listed in `testsprite_tests/test-ids.json`. Runs of tests that were later replaced (the first TS09/TS10) are not included, so an execution can show fewer tests than the suite had at the time.",
  "",
  "## Red, then green",
  "",
  summaryLine(),
  "",
  "The two counts differ for a reason: the \"Red run\" fraction is from the run history and counts only the tests still in `test-ids.json`; the \"GitHub check\" column quotes the PR's `TestSprite V3` status word for word, which counted every test the run had. The README quotes the GitHub check.",
  "",
  "| PR | Kind | Red run (history, UTC) | Failing tests | GitHub check said | Green run (history, UTC) |",
  "|---|---|---|---|---|---|",
  ...loops.map((l) => `| ${prLink(l.pr)} | ${KIND[l.kind] ?? l.kind} | ${l.red.start.slice(0, 16)}Z, ${l.red.passed}/${l.red.tests} | ${l.red.failed.map((f) => f.test).join(", ")} | ${(checkSaid[l.pr] ?? []).join("; ") || "no red check (history only)"} | ${l.green ? `${l.green.start.slice(0, 16)}Z, ${l.green.passed}/${l.green.tests}` : "not yet"} |`),
  "",
  "## Every execution",
  "",
  "| When (UTC) | Where | Result | Failed |",
  "|---|---|---|---|",
  ...summary.map((s) => `| ${s.start.slice(0, 16)} | ${s.pr ? prLink(s.pr) : s.env} | ${s.passed}/${s.tests} | ${s.failed.map((f) => f.test).join(", ") || "none"} |`),
  "",
];
writeFileSync("LOOP.md", lines.join("\n"));
console.log(`${runs.length} runs, ${summary.length} executions, ${loops.length} red-then-green PRs`);
