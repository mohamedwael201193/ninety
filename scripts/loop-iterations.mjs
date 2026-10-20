#!/usr/bin/env node
/**
 * Numbers the loop: one iteration per merged pull request, in merge order.
 * Every link comes from the GitHub API (the PR, its commits, and the "TestSprite V3" commit
 * statuses, whose target URL is the TestSprite execution) and every failing-test name comes
 * from src/data/loop.json (written by scripts/loop-proof.mjs from TestSprite's run history).
 * Nothing is typed by hand. Reads only.
 *
 *   GITHUB_TOKEN=... node scripts/loop-iterations.mjs   (a token only raises the rate limit)
 */
import { readFileSync, writeFileSync } from "node:fs";

const REPO = "mohamedwael201193/ninety";
const API = `https://api.github.com/repos/${REPO}`;
const WEB = `https://github.com/${REPO}`;
const headers = { Accept: "application/vnd.github+json", "User-Agent": "ninety-loop-iterations" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function get(path) {
  const out = [];
  for (let page = 1; ; page += 1) {
    const sep = path.includes("?") ? "&" : "?";
    const res = await fetch(`${API}${path}${sep}per_page=100&page=${page}`, { headers });
    if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
    const body = await res.json();
    if (!Array.isArray(body)) return body;
    out.push(...body);
    if (body.length < 100) return out;
  }
}

const kinds = JSON.parse(readFileSync("testsprite_tests/red-runs.json", "utf8"));
const loop = JSON.parse(readFileSync("src/data/loop.json", "utf8"));
const pulls = (await get("/pulls?state=closed")).filter((p) => p.merged_at).sort((a, b) => a.merged_at.localeCompare(b.merged_at));

const iterations = [];
for (const pr of pulls) {
  const commits = await get(`/pulls/${pr.number}/commits`);
  const checks = [];
  for (const c of commits) {
    const statuses = (await get(`/commits/${c.sha}/statuses`)).filter((s) => s.context === "TestSprite V3");
    // Statuses are newest first; keep each execution's final state.
    const seen = new Map();
    for (const s of statuses) { const key = s.target_url ?? `${s.id}`; if (!seen.has(key)) seen.set(key, s); }
    for (const s of [...seen.values()].reverse()) {
      checks.push({ sha: c.sha, message: c.commit.message.split("\n")[0], state: s.state, at: s.created_at, execution: s.target_url, description: s.description });
    }
  }
  const executions = loop.executions.filter((e) => e.pr === pr.number);
  // Red = a check that reports failed tests. A run that could not start, or where every test was
  // blocked, is kept apart: it is an infrastructure stop, not a caught defect.
  const isRed = (s) => (s.state === "failure" || s.state === "error") && /\d+ failed/.test(s.description ?? "");
  const isStop = (s) => (s.state === "failure" || s.state === "error") && !isRed(s);
  const firstRed = checks.findIndex(isRed);
  const greenAfter = firstRed >= 0 ? checks.slice(firstRed + 1).find((s) => s.state === "success") : undefined;
  const firstStop = checks.findIndex(isStop);
  const stopThenGreen = firstStop >= 0 && checks.slice(firstStop + 1).some((s) => s.state === "success");
  iterations.push({
    n: iterations.length + 1,
    pr: pr.number,
    title: pr.title,
    mergedAt: pr.merged_at,
    mergeCommit: pr.merge_commit_sha,
    checks,
    executions: executions.map((e) => ({ start: e.start, passed: e.passed, tests: e.tests, failed: e.failed.map((f) => f.test) })),
    redThenGreen: Boolean(greenAfter),
    kind: greenAfter || (!greenAfter && stopThenGreen) ? kinds[pr.number]?.kind ?? "unclassified" : null,
    stoppedThenGreen: !greenAfter && stopThenGreen,
  });
}

writeFileSync("src/data/loop-iterations.json", JSON.stringify({ generatedAt: new Date().toISOString(), source: "GitHub API + src/data/loop.json", iterations }, null, 2) + "\n");

const rg = (k) => iterations.filter((i) => i.redThenGreen && i.kind === k).map((i) => `#${i.pr}`);
const short = (sha) => `[\`${sha.slice(0, 7)}\`](${WEB}/commit/${sha})`;
const lines = [
  "# The loop, iteration by iteration",
  "",
  `Generated ${new Date().toISOString()} by \`scripts/loop-iterations.mjs\`. One iteration = one merged pull request, in merge order. Links come from the GitHub API: the PR, its commits, and each commit's "TestSprite V3" status, which links the TestSprite execution. Test results come from TestSprite's run history (\`src/data/loop.json\`, see [LOOP.md](LOOP.md)). Do not edit by hand.`,
  "",
  "Screenshots of the runs and the merge gate: [docs/evidence/testsprite](docs/evidence/testsprite/README.md).",
  "",
  `${iterations.length} iterations, ${iterations.filter((i) => i.redThenGreen).length} of them red, then green (a PR check reported failed tests, and a later commit on the same PR passed): ${rg("app").length} app defects (${rg("app").join(", ")}) and ${rg("plan-ci").length} where the test plan or CI was wrong (${rg("plan-ci").join(", ")}). ${iterations.filter((i) => i.stoppedThenGreen).length} more had a run that could not start or was blocked before a green run; those are not counted as catches.`,
  "",
];
for (const it of iterations) {
  lines.push(`## Iteration ${it.n}: [#${it.pr}](${WEB}/pull/${it.pr}) ${it.title.replace(/\|/g, "/")}${it.redThenGreen ? ` (red, then green: ${it.kind === "app" ? "app defect" : "test plan or CI"})` : it.stoppedThenGreen ? " (run could not complete, then green)" : ""}`, "");
  lines.push(`Merged ${it.mergedAt.replace("T", " ").slice(0, 16)} UTC as ${short(it.mergeCommit)}.`, "");
  if (it.checks.length) {
    lines.push("| Commit | TestSprite V3 | Execution |", "|---|---|---|");
    for (const c of it.checks) lines.push(`| ${short(c.sha)} ${c.message.replace(/\|/g, "/").slice(0, 70)} | ${c.state}${c.description ? `: ${c.description.replace(/\|/g, "/")}` : ""} | ${c.execution ? `[run](${c.execution})` : "no execution (the run did not start)"} |`);
    lines.push("");
  } else lines.push("No TestSprite V3 status on this PR's commits.", "");
  const red = it.executions.filter((e) => e.failed.length);
  if (red.length && it.checks.some((c) => c.state === "failure" || c.state === "error")) {
    lines.push(`Run history: ${it.executions.map((e) => `${e.start.slice(0, 16)}Z ${e.passed}/${e.tests}${e.failed.length ? ` (failed ${e.failed.join(", ")})` : ""}`).join(" → ")}.`, "");
  }
}
writeFileSync("LOOP-ITERATIONS.md", lines.join("\n"));
console.log(`${iterations.length} iterations, ${iterations.filter((i) => i.redThenGreen).length} red then green (${rg("app").length} app, ${rg("plan-ci").length} plan/CI), ${iterations.filter((i) => i.stoppedThenGreen).length} stopped then green`);
