"use client";

import { ScrollRegion } from "./ScrollRegion";
import { useEffect, useState } from "react";
import { CircleCheck, CircleX, ExternalLink } from "lucide-react";
import type { GoldenRow, ParityReport, ParityRow } from "@/lib/schengen/parity";
import type { DeepParityView } from "@/lib/schengen/deep/view";
import { GOLDEN_SCENARIOS } from "@/lib/schengen/golden";
import { ToolShell } from "./tools/ToolShell";

import { label } from "@/lib/schengen/scenario-names";

export { label };

function ParityTableRow({ row, number }: { row: ParityRow; number: number }) {
  return (
    <tr data-testid="parity-row" data-match={row.match} className="border-t border-line-soft transition-colors hover:bg-paper-warm">
      <td className="px-5 py-3 font-mono text-xs text-ink-hushed tnum">{String(number).padStart(2, "0")}</td>
      <td className="px-5 py-3 font-medium">
        {label(row.scenario)}<span className="ml-2 text-xs font-normal text-ink-hushed">{row.stays} {row.stays === 1 ? "stay" : "stays"}</span>
        {row.span ? (
          <span className="mt-1 block text-xs font-normal text-ink-hushed">
            Ninety: <span data-testid="parity-span-ours">{row.span.ours}</span>. Calculator: <q data-testid="parity-span-theirs">{row.span.theirs}</q>
          </span>
        ) : null}
      </td>
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

const WHY = Object.fromEntries(GOLDEN_SCENARIOS.map((g) => [g.id, g]));

function GoldenTable({ rows }: { rows: GoldenRow[] }) {
  return (
    <section aria-labelledby="golden-heading" className="space-y-3">
      <h2 id="golden-heading" className="font-display text-2xl font-medium">Boundary cases worked out by hand</h2>
      <p className="max-w-prose text-sm text-ink-hushed">
        Each answer was written down before either calculator ran, and each case is a different situation. The check also requires the calculator to print the quoted sentences word for word.
        One answer we first wrote down was wrong, and is kept on record below.
      </p>
      <div className="card-soft overflow-hidden">
        <ScrollRegion label="Hand-worked cases">
          <table data-testid="golden-table" className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Hand-worked boundary cases, Ninety and the Commission calculator</caption>
            <thead className="bg-paper-sunk">
              <tr className="eyebrow">
                <th scope="col" className="px-5 py-3 font-medium">Situation</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">By hand</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Ninety</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">EC calculator</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Match</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const g = WHY[row.scenario];
                return (
                  <tr key={row.scenario} data-testid="golden-row" data-scenario={row.scenario} data-match={row.match} className="border-t border-line-soft align-top">
                    <td className="px-5 py-3">
                      <span className="font-medium">{row.name}</span> <span className="font-mono text-xs text-ink-hushed">{row.on}</span>
                      <span data-testid="golden-why" className="mt-1 block text-xs text-ink-hushed">{g?.why}</span>
                      <span className="mt-1 block text-xs text-ink-hushed">Calculator: {g?.calculatorSays.map((line) => <q key={line} data-testid="golden-says" className="mr-2">{line}</q>)}</span>
                      {g?.firstExpected ? (
                        <span data-testid="golden-first-expected" className="mt-1 block text-xs text-warn">First written down as “{g.firstExpected.answer}”, which was wrong. {g.firstExpected.mistake}</span>
                      ) : null}
                    </td>
                    <td data-testid="golden-expected" className="px-5 py-3 text-right font-mono tnum">{row.expected}</td>
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
              })}
            </tbody>
          </table>
        </ScrollRegion>
      </div>
    </section>
  );
}

/** Every scenario gets a row; the displayed number is 1-based, the index is not. */
export function tableRows(rows: ParityRow[]) {
  return rows.map((row, index) => <ParityTableRow key={row.scenario} row={row} number={index + 1} />);
}

const CLASS_LABEL: Record<DeepParityView["disagreements"][number]["classification"], string> = {
  match: "Match",
  "our-bug": "Ninety bug",
  "commission-quirk": "Commission quirk",
  "outside-domain": "Outside the calculator",
};

function DeepSection({ deep, report, failed }: { deep: DeepParityView; report: ParityReport | null; failed: boolean }) {
  const live = report?.deepLive;
  const outside = deep.total - deep.inDomain;
  const inDomainMisses = deep.inDomain - deep.matched;
  return (
    <section aria-labelledby="deep-parity-heading" className="space-y-3">
      <h2 id="deep-parity-heading" className="font-display text-2xl font-medium">Every field the calculator prints</h2>
      <p data-testid="deep-parity-score" className="font-display text-2xl font-semibold">{deep.headline}</p>
      <p className="max-w-prose text-sm text-ink-hushed">
        {deep.total} scenarios were compared with stored output from the Commission script (seed {deep.seed}). {deep.inDomain} are inputs the form accepts and calculates.
        {" "}{inDomainMisses === 0 ? "All of them agree on every printed field." : `${inDomainMisses} accepted ${inDomainMisses === 1 ? "input does" : "inputs do"} not match, and ${inDomainMisses === 1 ? "is" : "are"} listed below.`}
        {" "}{outside} more are outside that form. They are listed too, and they are not part of the {deep.inDomain}.
        The visa-sticker sentence is printed only beside “Possible stay until”, and the words do not change, so it is not one of the compared fields.
        Days used on the control date are printed only inside an overstay window. An open stay is typed into the form as ending on the control date, because the form requires an exit.
      </p>
      <p className="max-w-prose text-sm text-ink-hushed">
        Compared fields: {deep.fields.join(", ")}. This page judges the stored output. It does not re-run all {deep.total} scenarios. The test re-runs the vendored script and fails if the stored output changes.
      </p>
      <div className="card-soft overflow-hidden">
        <ScrollRegion label="Coverage by group">
          <table data-testid="deep-parity-groups" className="w-full min-w-[480px] text-left text-sm">
            <caption className="sr-only">How many scenarios in each group match the calculator</caption>
            <thead className="bg-paper-sunk">
              <tr className="eyebrow">
                <th scope="col" className="px-5 py-3 font-medium">Group</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Matched</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Accepted by the form</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {deep.groups.map((group) => (
                <tr key={group.group} className="border-t border-line-soft">
                  <td className="px-5 py-3 font-mono text-xs">{group.group}</td>
                  <td className="px-5 py-3 text-right font-mono tnum">{group.matched}</td>
                  <td className="px-5 py-3 text-right font-mono tnum">{group.inDomain}</td>
                  <td className="px-5 py-3 text-right font-mono tnum">{group.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
      </div>
      <ul data-testid="deep-parity-disagreements" className="space-y-2">
        {deep.disagreements.map((row) => (
          <li key={row.id} data-testid="deep-parity-disagreement" data-classification={row.classification} className="rounded-2xl bg-paper-sunk p-4 text-sm">
            <p>
              <span className="font-mono text-xs">{row.id}</span>
              {" "}
              <span className="font-medium">{CLASS_LABEL[row.classification]}</span>
            </p>
            {row.note ? <p className="mt-1 text-ink-hushed">{row.note}</p> : null}
            {row.diffs.map((diff) => (
              <p key={diff.field} className="mt-1">
                <span className="font-medium">{diff.field}.</span> Calculator: {diff.commission}. Ninety: {diff.ninety}.
              </p>
            ))}
            {row.control.length > 0 ? (
              <p className="mt-1 text-ink-hushed">Calculator, control: {row.control.join(" / ")}</p>
            ) : null}
            {row.planning.length > 0 ? (
              <p className="mt-1 text-ink-hushed">Calculator, planning: {row.planning.join(" / ")}</p>
            ) : null}
          </li>
        ))}
      </ul>
      <div>
        <h3 className="font-display text-lg font-medium">Live sample</h3>
        {!report && !failed ? (
          <p data-testid="deep-live-pending" className="mt-1 text-sm text-ink-hushed">Checking a sample on the live Commission page…</p>
        ) : null}
        {failed || (report && live?.status !== "ran") ? (
          <p data-testid="deep-live-sample" className="mt-1 text-sm text-warn">Couldn&apos;t verify. {live?.reason ?? "The live sample could not be run."}</p>
        ) : null}
        {live && live.status === "ran" ? (
          <div className="mt-1 space-y-2 text-sm">
            <p data-testid="deep-live-score">{live.headline}</p>
            {live.disagreements.length > 0 ? (
              <ul data-testid="deep-live-disagreements" className="space-y-1">
                {live.disagreements.map((row) => (
                  <li key={row.id}><span className="font-mono text-xs">{row.id}</span> ({CLASS_LABEL[row.classification as DeepParityView["disagreements"][number]["classification"]] ?? row.classification}). {row.detail}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function ParityPanel({ deep }: { deep: DeepParityView }) {
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
          <ScrollRegion label="Parity table">
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
          </ScrollRegion>
        </div>

        <DeepSection deep={deep} report={report} failed={failed} />

        {report?.golden?.length ? <GoldenTable rows={report.golden} /> : null}

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
