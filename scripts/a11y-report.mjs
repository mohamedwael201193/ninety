// Pure helpers for the axe check: turn axe results into counts, a Markdown table and a verdict.
// Kept separate from the browser script so they can be unit-tested.

/** Impact levels that fail the check. */
export const BLOCKING = ["serious", "critical"];

/**
 * @param {{ path: string, violations: { id: string, impact?: string | null, nodes: unknown[] }[], passes: number, incomplete: number }[]} pages
 */
export function summarize(pages) {
  const rows = pages.map((page) => {
    const byImpact = { minor: 0, moderate: 0, serious: 0, critical: 0 };
    for (const v of page.violations) byImpact[v.impact ?? "minor"] += v.nodes.length;
    const blocking = page.violations.filter((v) => BLOCKING.includes(v.impact ?? "")).map((v) => v.id);
    return { path: page.path, rules: page.violations.length, nodes: page.violations.reduce((n, v) => n + v.nodes.length, 0), ...byImpact, blocking, passes: page.passes, incomplete: page.incomplete };
  });
  return { rows, ok: rows.every((r) => r.blocking.length === 0) };
}

/** @param {ReturnType<typeof summarize>} summary @param {{ url: string, tags: string[], axeVersion: string }} meta */
export function markdown(summary, meta) {
  const lines = [
    `### axe-core ${meta.axeVersion}: automated accessibility rules (${meta.tags.join(", ")})`,
    "",
    `Target: ${meta.url}. Fails on any **serious** or **critical** violation. axe checks only what can be tested automatically; it does not replace a manual audit with a screen reader or keyboard.`,
    "",
    "| Page | Violated rules | Elements | Critical | Serious | Moderate | Minor | Rules passed | Needs review |",
    "|---|---|---|---|---|---|---|---|---|",
    ...summary.rows.map((r) => `| \`${r.path}\` | ${r.rules} | ${r.nodes} | ${r.critical} | ${r.serious} | ${r.moderate} | ${r.minor} | ${r.passes} | ${r.incomplete} |`),
    "",
    summary.ok ? "No serious or critical violations." : `Blocking: ${summary.rows.filter((r) => r.blocking.length).map((r) => `\`${r.path}\` (${r.blocking.join(", ")})`).join("; ")}`,
  ];
  return lines.join("\n") + "\n";
}
