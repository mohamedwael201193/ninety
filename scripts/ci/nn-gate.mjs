#!/usr/bin/env node
/**
 * TestSprite N/N gate: fails unless BOTH TestSprite suites passed every test on the same commit.
 *
 *   - Frontend: the "TestSprite V3" commit status that the TestSprite GitHub App (testsprite[bot])
 *     posts on the PR head SHA. Its description is the only place the count is given:
 *     "All 54 tests passed" or "42/43 passed · 1 failed" (copied from our own PRs, see
 *     docs/NN-GATE.md). The newest final status for that SHA is read; pending means "wait".
 *   - Backend: backend-results.json, written for the same SHA by scripts/ci/backend-run.mjs in the
 *     same workflow run. Its size must equal testsprite_tests/backend-ids.json.
 *
 * Fail closed: no status, a status from anyone but testsprite[bot], an unknown description,
 * N = 0, passed < N, a "success" state whose numbers say otherwise, a missing or short results
 * file: each one fails the gate. The only non-run the gate accepts for the backend is the
 * explicit docs-only skip that testsprite-backend.yml already applies (no code reaches the API).
 *
 *   GH_TOKEN=... REPO=owner/name SHA=<head sha> node scripts/ci/nn-gate.mjs [backend-results.json]
 */
import { appendFileSync, existsSync, readFileSync } from "node:fs";

export const CONTEXT = "TestSprite V3";
export const APP_LOGIN = "testsprite[bot]";

/** "All 54 tests passed" → {passed: 54, total: 54}; "42/43 passed · 1 failed" → {42, 43}; else null. */
export function parseDescription(description) {
  const text = String(description ?? "").trim();
  let m = /^All (\d+) tests? passed$/.exec(text);
  if (m) return { passed: Number(m[1]), total: Number(m[1]) };
  m = /^(\d+)\/(\d+) passed(?: · .*)?$/.exec(text);
  if (m) return { passed: Number(m[1]), total: Number(m[2]) };
  return null;
}

/**
 * Reads the frontend result for one SHA from the commit statuses API payload
 * (GET /repos/{owner}/{repo}/commits/{sha}/statuses).
 * Returns { ok, pending, passed, total, reason, status }.
 */
export function frontendResult(statuses) {
  const own = (Array.isArray(statuses) ? statuses : [])
    .filter((s) => s && s.context === CONTEXT)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)) || (b.id ?? 0) - (a.id ?? 0));
  if (own.length === 0) return { ok: false, pending: true, reason: `no "${CONTEXT}" status on this commit yet` };
  const latest = own[0];
  if (latest.creator?.login !== APP_LOGIN) {
    return { ok: false, pending: false, reason: `newest "${CONTEXT}" status was posted by ${latest.creator?.login ?? "unknown"}, not ${APP_LOGIN}`, status: latest };
  }
  if (latest.state === "pending") return { ok: false, pending: true, reason: `"${CONTEXT}" is pending: ${latest.description}`, status: latest };
  const counts = parseDescription(latest.description);
  if (!counts) return { ok: false, pending: false, reason: `cannot read a count from "${latest.description}" (state ${latest.state})`, status: latest };
  const { passed, total } = counts;
  if (total <= 0) return { ok: false, pending: false, passed, total, reason: "TestSprite reported 0 tests", status: latest };
  if (passed !== total) return { ok: false, pending: false, passed, total, reason: `${passed}/${total} passed (state ${latest.state})`, status: latest };
  if (latest.state !== "success") return { ok: false, pending: false, passed, total, reason: `count says ${passed}/${total} but state is ${latest.state}`, status: latest };
  return { ok: true, pending: false, passed, total, reason: `${passed}/${total} passed`, status: latest };
}

/**
 * Reads backend-results.json ({ target, sha, rows: [{ status }] }) against the expected test count.
 * With `sha`, the file must say it tested that commit (backend-run.mjs records it since this gate).
 */
export function backendResult(results, expected, sha) {
  if (!Number.isInteger(expected) || expected <= 0) return { ok: false, reason: `expected backend test count is ${expected}` };
  const rows = results && Array.isArray(results.rows) ? results.rows : null;
  if (!rows) return { ok: false, reason: "no backend results file (the backend job did not finish its run)" };
  if (sha && results.sha !== sha) return { ok: false, reason: `backend results are for ${results.sha ?? "an unrecorded commit"}, not ${sha.slice(0, 7)}` };
  const passed = rows.filter((r) => r && r.status === "passed").length;
  const total = rows.length;
  if (total !== expected) return { ok: false, passed, total, reason: `${total} backend results, ${expected} expected` };
  if (passed !== total) return { ok: false, passed, total, reason: `${passed}/${total} passed` };
  return { ok: true, passed, total, reason: `${passed}/${total} passed against ${results.target}` };
}

/** Both must pass. `docsOnly` is the backend job's explicit docs-only skip, never a missing file. */
export function decide(frontend, backend, { docsOnly = false } = {}) {
  const back = docsOnly ? { ok: true, reason: "skipped: docs-only change (no code reaches the API)" } : backend;
  return { ok: Boolean(frontend.ok && back.ok), frontend, backend: back };
}

async function main() {
  const { GH_TOKEN, REPO, SHA } = process.env;
  const docsOnly = process.env.DOCS_ONLY === "true";
  const file = process.argv[2] ?? "backend-results.json";
  if (!GH_TOKEN || !REPO || !/^[0-9a-f]{40}$/.test(SHA ?? "")) {
    console.error("::error::N/N gate needs GH_TOKEN, REPO and a 40-character SHA");
    process.exit(1);
  }
  const waitMinutes = Number(process.env.WAIT_MINUTES ?? 45);
  const deadline = Date.now() + waitMinutes * 60_000;
  let frontend;
  for (;;) {
    let statuses = [];
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/commits/${SHA}/statuses?per_page=100`, {
        headers: { authorization: `Bearer ${GH_TOKEN}`, accept: "application/vnd.github+json" },
      });
      statuses = res.ok ? await res.json() : [];
    } catch { statuses = []; }
    frontend = frontendResult(statuses);
    if (!frontend.pending || Date.now() > deadline) break;
    console.log(`waiting: ${frontend.reason}`);
    await new Promise((r) => setTimeout(r, 30_000));
  }
  if (frontend.pending) frontend = { ...frontend, ok: false, reason: `${frontend.reason} after ${waitMinutes} minutes` };

  const expected = Object.keys(JSON.parse(readFileSync("testsprite_tests/backend-ids.json", "utf8"))).filter((k) => /^BE\d+/.test(k)).length;
  let results = null;
  if (existsSync(file)) { try { results = JSON.parse(readFileSync(file, "utf8")); } catch { results = null; } }
  const verdict = decide(frontend, backendResult(results, expected, SHA), { docsOnly });

  const short = SHA.slice(0, 7);
  const lines = [
    `### TestSprite N/N gate on ${short}: ${verdict.ok ? "passed" : "FAILED"}`,
    "",
    "| Suite | Result | Source |",
    "|---|---|---|",
    `| ${CONTEXT} (frontend) | ${verdict.frontend.ok ? "✅" : "❌"} ${verdict.frontend.reason} | ${verdict.frontend.status ? `"${verdict.frontend.status.description}" by ${verdict.frontend.status.creator?.login}` : "no status"} |`,
    `| TestSprite backend | ${verdict.backend.ok ? "✅" : "❌"} ${verdict.backend.reason} | ${docsOnly ? "docs-only skip" : file} |`,
    "",
  ];
  console.log(lines.join("\n"));
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n"));
  if (!verdict.ok) {
    console.log(`::error::TestSprite N/N gate failed: frontend ${verdict.frontend.reason}; backend ${verdict.backend.reason}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
