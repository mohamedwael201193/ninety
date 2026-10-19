"use client";

import { useEffect, useState } from "react";
import { CircleCheck, CircleX, ExternalLink } from "lucide-react";
import type { ParityReport, ParityRow } from "@/lib/schengen/parity";
import { ToolShell } from "./tools/ToolShell";

const NAMES: Record<string, string> = {
  "no-previous-stay": "No previous stay",
  "manual-14-jun-2024": "Manual example: 14 Jun 2024",
  "manual-entry-19-jun-2024": "Manual example: entry on 19 Jun 2024",
  "manual-entry-7-aug-2024": "Manual example: entry on 7 Aug 2024",
  "manual-last-day-29-aug-2024": "Manual example: last legal day, 29 Aug 2024",
  "calculator-example-kom-1-1": "Calculator's built-in example",
  "same-day-stay": "Same-day stay",
  "day-after-spring-dst": "Day after the spring clock change",
  "same-day-turnaround": "Same-day exit and re-entry",
  "exact-90-days": "Exactly 90 days",
  "day-91-overstay": "Day 91 (overstay)",
  "reentry-after-full-90": "Re-entry after a full 90 days",
  "entry-refused-next-day": "Entry refused the next day",
  "overstay-through-15-apr": "Overstay through 15 Apr",
};

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Readable scenario name. Known ids get a written name; others are derived, with month names capitalised. */
export function label(id: string): string {
  if (NAMES[id]) return NAMES[id];
  const text = id
    .split("-")
    .map((word) => (MONTHS.includes(word) ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function ParityTableRow({ row, number }: { row: ParityRow; number: number }) {
  return (
    <tr data-testid="parity-row" data-match={row.match} className="border-t border-line-soft transition-colors hover:bg-paper-warm">
      <td className="px-5 py-3 font-mono text-xs text-ink-hushed tnum">{String(number).padStart(2, "0")}</td>
      <td className="px-5 py-3 font-medium">{label(row.scenario)}<span className="ml-2 text-xs font-normal text-ink-hushed">{row.stays} {row.stays === 1 ? "stay" : "stays"}</span></td>
      <td className="px-5 py-3 font-mono text-xs tnum">{row.on}</td>
      <td className="px-5 py-3 text-right font-mono tnum">{row.ours}</td>
      <td className="px-5 py-3 text-right font-mono tnum">{row.theirs}</td>
      <td className="px-5 py-3 text-right">
        <span className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-medium ${row.match ? "bg-ok-wash text-ok" : "bg-risk-wash text-risk"}`}>
          {row.match ? <CircleCheck size={12} aria-hidden /> : <CircleX size={12} aria-hidden />}
          {row.match ? "Match" : "Differs"}
        </span>
      </td>
    </tr>
  );
}

/** Every scenario gets a row; the displayed number is 1-based, the index is not. */
export function tableRows(rows: ParityRow[]) {
  return rows.map((row, index) => <ParityTableRow key={row.scenario} row={row} number={index + 1} />);
}

export function ParityPanel() {
  const [report, setReport] = useState<ParityReport | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/parity")
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return (await response.json()) as ParityReport;
      })
      .then((body) => {
        if (!cancelled) setReport(body);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const status = failed ? "couldn't verify" : report?.status;
  const verified = status === "match" || status === "mismatch";
  const rows = report?.rows ?? [];

  return (
    <ToolShell
      testId="parity-page"
      eyebrow="Parity check"
      title="Same answer as the Commission calculator."
      intro={<p>Each fixed scenario runs through Ninety and through the European Commission&apos;s own short-stay calculator script, fetched live from the Commission site when this page opens.</p>}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className={`rounded-3xl p-6 ${status === "match" ? "bg-ok-wash" : status ? "bg-risk-wash" : "bg-paper-sunk"}`}>
            <p className="eyebrow">Result</p>
            {!status ? <p data-testid="parity-pending" className="mt-2 font-display text-2xl font-medium">Checking the Commission calculator…</p> : null}
            {status ? (
              <p className={`mt-2 flex items-center gap-2 font-display text-3xl font-semibold capitalize ${status === "match" ? "text-ok" : "text-risk"}`}>
                {status === "match" ? <CircleCheck size={26} aria-hidden /> : <CircleX size={26} aria-hidden />}
                <span data-testid="parity-status">{status}</span>
              </p>
            ) : null}
          </div>
          <div className="card-soft p-6">
            <p className="eyebrow">Scenarios matched</p>
            {verified && report ? (
              <p className="mt-2 font-display text-4xl font-semibold tnum"><span data-testid="parity-score">{report.score} match</span></p>
            ) : <div className="skeleton mt-3 h-9 w-28 rounded-xl" />}
          </div>
          <div className="card-soft p-6">
            <p className="eyebrow">Reference</p>
            {report?.source ? (
              <a href={report.source} data-testid="parity-source" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 break-all text-sm font-medium underline underline-offset-4">
                European Commission short-stay calculator <ExternalLink size={14} aria-hidden />
              </a>
            ) : <div className="skeleton mt-3 h-5 w-40 rounded-lg" />}
          </div>
        </div>

        {status === "couldn't verify" ? (
          <p data-testid="parity-reason" role="alert" className="rounded-2xl bg-warn-wash p-4 text-sm text-warn">{report?.reason ?? "The reference calculator could not be loaded."}</p>
        ) : null}

        <div className="card-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table data-testid="parity-table" className="w-full min-w-[620px] text-left text-sm">
              <caption className="sr-only">Ninety and the Commission calculator, scenario by scenario</caption>
              <thead className="bg-paper-sunk">
                <tr className="eyebrow">
                  <th scope="col" className="px-5 py-3 font-medium">#</th>
                  <th scope="col" className="px-5 py-3 font-medium">Scenario</th>
                  <th scope="col" className="px-5 py-3 font-medium">Checked on</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Ninety</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">EC calculator</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Match</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && !status
                  ? Array.from({ length: 6 }, (_, i) => (
                      <tr key={i} className="border-t border-line-soft"><td colSpan={6} className="px-5 py-3"><div className="skeleton h-5 rounded-lg" /></td></tr>
                    ))
                  : null}
                {tableRows(rows)}
              </tbody>
            </table>
          </div>
        </div>

        {report && report.mismatches.length > 0 ? (
          <ul data-testid="parity-mismatches" className="space-y-2">
            {report.mismatches.map((mismatch) => (
              <li key={mismatch.scenario} data-testid="parity-mismatch" className="rounded-2xl bg-risk-wash p-4 text-sm">
                <strong>{mismatch.scenario}.</strong> {mismatch.detail}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </ToolShell>
  );
}
