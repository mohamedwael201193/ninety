// Turns a finished workflow run into GitHub Issues activity:
//   - one comment per run on the pinned "Run log" issue;
//   - a failing run opens an issue labelled `testsprite-red` with the run link
//     and the failing tests (or comments on the one already open);
//   - a green run after a red one says so on the open red issue. The fix PR
//     closes it with "Fixes #N", so the issue, the red run and the fix link up.
// Pure functions here; the workflow wires them to the GitHub API.

export const RED_LABEL = "testsprite-red";
export const LOG_LABEL = "testsprite-log";
export const LOG_TITLE = "Run log";

/** Conclusions worth recording. `skipped` happens on every preview deployment. */
export function shouldRecord(conclusion) {
  return ["success", "failure", "timed_out"].includes(conclusion);
}

export function isRed(conclusion) {
  return conclusion === "failure" || conclusion === "timed_out";
}

function decode(text) {
  return text.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

/** Counts and failing case names from a JUnit report (empty report → zeros). */
export function summarizeJunit(xml) {
  const cases = [...(xml ?? "").matchAll(/<testcase\b([^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g)];
  const failing = [];
  for (const c of cases) {
    if (!/<(failure|error)\b/.test(c[3] ?? "")) continue;
    const name = c[1].match(/\bname="([^"]*)"/);
    const run = c[1].match(/\brunId="([^"]*)"/);
    const message = (c[3] ?? "").match(/<(?:failure|error)\b[^>]*\bmessage="([^"]*)"/);
    failing.push({ name: decode(name?.[1] ?? "(unnamed)"), runId: run?.[1] ?? "", message: decode(message?.[1] ?? "") });
  }
  return { total: cases.length, failed: failing.length, passed: cases.length - failing.length, failing };
}

/** Inline-safe text for a Markdown table cell. */
function cell(text) {
  return String(text).replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
}

export function runLine(run, summary) {
  const verdict = isRed(run.conclusion) ? "🔴 red" : "🟢 green";
  const counts = summary.total > 0 ? ` · ${summary.passed}/${summary.total} passed` : "";
  return `${verdict} · **${cell(run.workflow)}** · ${run.event} · \`${run.sha.slice(0, 7)}\`${counts} · [run ${run.id}](${run.url}) · ${run.createdAt}`;
}

export function redTitle(workflow) {
  return `${workflow} is red`;
}

export function redIssueBody(run, summary) {
  const lines = [
    `The **${cell(run.workflow)}** workflow failed on \`${run.sha.slice(0, 7)}\` (${run.event}).`,
    "",
    `Run: ${run.url}`,
    "",
  ];
  if (summary.failing.length > 0) {
    lines.push("| test | TestSprite run | message |", "|---|---|---|");
    for (const f of summary.failing) lines.push(`| ${cell(f.name)} | ${cell(f.runId)} | ${cell(f.message)} |`);
    lines.push("", "The failure bundle of each failed test is attached to the run as an artifact.");
  } else {
    lines.push("No JUnit report was produced (the failure happened outside a test verdict). See the run log.");
  }
  lines.push("", "Close this from the pull request that fixes it: put `Fixes #<this issue>` in its description.");
  return lines.join("\n");
}

export function stillRedComment(run, summary) {
  const names = summary.failing.map((f) => cell(f.name)).join(", ");
  return `Still red on \`${run.sha.slice(0, 7)}\`: ${run.url}${names ? `\nFailing: ${names}` : ""}`;
}

export function greenAgainComment(run, summary) {
  const counts = summary.total > 0 ? ` (${summary.passed}/${summary.total} passed)` : "";
  return `Green again on \`${run.sha.slice(0, 7)}\`${counts}: ${run.url}\nThe fix PR closes this issue with \`Fixes #N\`.`;
}

/** What to do for one finished run, given the open red issue for that workflow (if any). */
export function plan(run, summary, openRed) {
  if (!shouldRecord(run.conclusion)) return { log: null, red: null };
  const log = runLine(run, summary);
  if (isRed(run.conclusion)) {
    return openRed
      ? { log, red: { action: "comment", issue: openRed, body: stillRedComment(run, summary) } }
      : { log, red: { action: "open", title: redTitle(run.workflow), body: redIssueBody(run, summary) } };
  }
  return openRed ? { log, red: { action: "comment", issue: openRed, body: greenAgainComment(run, summary) } } : { log, red: null };
}
