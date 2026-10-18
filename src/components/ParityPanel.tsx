"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ParityReport } from "@/lib/schengen/parity";

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

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <p>
        <Link href="/">Back to Ninety</Link>
      </p>
      <h1>Parity with the Commission calculator</h1>
      <p>
        Each fixed scenario is run through Ninety and through the European Commission&apos;s
        short-stay calculator script. The reference is loaded from the Commission site when this
        page opens.
      </p>
      {!status ? <p data-testid="parity-pending">Checking the Commission calculator…</p> : null}
      {status ? (
        <p data-testid="parity-status">{status}</p>
      ) : null}
      {verified && report ? (
        <p data-testid="parity-score">
          {report.score} match
        </p>
      ) : null}
      {status === "couldn't verify" ? (
        <p data-testid="parity-reason">{report?.reason ?? "The reference calculator could not be loaded."}</p>
      ) : null}
      {report && report.mismatches.length > 0 ? (
        <ul data-testid="parity-mismatches">
          {report.mismatches.map((mismatch) => (
            <li key={mismatch.scenario} data-testid="parity-mismatch">
              <strong>{mismatch.scenario}.</strong> {mismatch.detail}
            </li>
          ))}
        </ul>
      ) : null}
      {report?.source ? (
        <p>
          Reference:{" "}
          <a href={report.source} data-testid="parity-source">
            {report.source}
          </a>
        </p>
      ) : null}
    </main>
  );
}
