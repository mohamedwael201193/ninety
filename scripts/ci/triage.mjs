// Builds the triage comment a red TestSprite gate posts on its pull request.
// Input is what the gate itself wrote (backend-results.json from backend-run.mjs), never a
// made-up failure: no results file means the job stopped before any test ran, and the
// comment says exactly that. Pure functions; .github/workflows/testsprite-backend.yml
// posts the text with the GitHub API.

export const MARKER = "<!-- testsprite-triage -->";

const TS_RUN = "https://www.testsprite.com/dashboard-v3";

/** A first guess at the cause from TestSprite's own error line, labelled as a guess. */
export function classify(row) {
  const d = `${row.status} ${row.detail ?? ""}`.toLowerCase();
  if (row.status === "timedOut" || /timed? ?out/.test(d)) return "timeout (TestSprite run did not finish in time)";
  if (row.exitCode === 11 || /rate.?limit|inflight/.test(d)) return "rate limited by TestSprite (in-flight cap or per-minute limit), not a test result";
  if (/code put failed/.test(d)) return "infrastructure (could not upload the test to TestSprite)";
  if (/\b5\d\d\b|econn|enotfound|fetch failed|unreachable|dns/.test(d)) return "target unreachable or server error";
  if (/assert|expected|mismatch|!=|not equal/.test(d)) return "assertion failed (the app answered, but not as the test expects)";
  if (row.status === "failed") return "test failed (see the TestSprite run for the step)";
  return `run ended as \`${row.status}\``;
}

function cell(text) {
  return String(text ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
}

/**
 * @param {{target:string, rows:{name:string,id:string,status:string,runId?:string,detail?:string}[]}|null} results
 * @param {{runUrl:string, sha:string, workflow:string, repoUrl:string, ref:string}} ctx
 */
export function triageComment(results, ctx) {
  const head = `${MARKER}\n### 🔴 ${ctx.workflow} failed on \`${ctx.sha.slice(0, 7)}\``;
  if (!results || !Array.isArray(results.rows) || results.rows.length === 0) {
    return [head, "", `The job stopped before any TestSprite test ran (deployment not ready, missing secret or CLI error), so there is no test verdict. Step log: ${ctx.runUrl}`, ""].join("\n");
  }
  const failed = results.rows.filter((r) => r.status !== "passed");
  if (failed.length === 0) return null;
  return [
    head,
    "",
    `**${failed.length} of ${results.rows.length}** tests did not pass against ${results.target}. Workflow run: ${ctx.runUrl}`,
    "",
    "| Test | Result | Likely cause | TestSprite error (first line) | Test code |",
    "|---|---|---|---|---|",
    ...failed.map((r) => `| ${cell(r.name)} | ${cell(r.status)} | ${cell(classify(r))} | ${cell(r.detail) || "(none)"} | [${cell(r.name)}.py](${ctx.repoUrl}/blob/${ctx.ref}/testsprite_tests/backend/${encodeURIComponent(r.name)}.py) |`),
    "",
    `Reproduce one test: \`BACKEND_ONLY=${failed.map((r) => r.name.split("-")[0]).join(",")} node scripts/ci/backend-run.mjs ${results.target}\` (needs \`TESTSPRITE_API_KEY\`).`,
    `TestSprite run ids: ${failed.map((r) => r.runId ? `\`${r.runId}\`` : "(none)").join(", ")} (open them from the TestSprite portal: ${TS_RUN}).`,
    "",
    "The cause column is a first guess from the error text; the TestSprite run is the source of truth.",
    "",
  ].join("\n");
}
