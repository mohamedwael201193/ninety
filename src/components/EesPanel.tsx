"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isIsoDate, localToday } from "@/lib/schengen/dates";
import { parseEesRecords, reconcile, type Reconciliation } from "@/lib/ees/reconcile";
import { loadTrips } from "@/lib/trips";

export function EesPanel() {
  const params = useSearchParams();
  const rawToday = params.get("today");
  const todayInvalid = rawToday !== null && !isIsoDate(rawToday);
  const today = rawToday && isIsoDate(rawToday) ? rawToday : localToday();
  const [ready, setReady] = useState(false);
  const [daysUsed, setDaysUsed] = useState("");
  const [recordsText, setRecordsText] = useState("");
  const [result, setResult] = useState<Reconciliation | null>(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setReady(true);
  }, []);

  function compare(event: FormEvent) {
    event.preventDefault();
    if (!/^\d+$/.test(daysUsed)) {
      setFormError("Enter the EES days-used figure as a whole number.");
      setResult(null);
      return;
    }
    const parsed = parseEesRecords(recordsText);
    if (parsed.errors.length > 0) {
      setFormError(parsed.errors.join(" "));
      setResult(null);
      return;
    }
    setFormError("");
    const trips = loadTrips(window.localStorage);
    setResult(
      reconcile(trips, {
        daysUsed: Number(daysUsed),
        on: today,
        records: recordsText.trim() === "" ? undefined : parsed.records,
      }),
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6" data-testid={ready ? "ees-ready" : "ees-loading"}>
      <p>
        <Link href="/">Ninety</Link>
        {" · "}
        <Link href="/letter" data-testid="nav-letter">Article 52 letter</Link>
      </p>
      <h1>EES reconciliation</h1>
      <p>
        Compare the days-used figure from the Entry/Exit System with the trips saved in this browser.
        Leave the records blank if you only have the number. Otherwise enter one record per line:
        an entry date, or an entry date and an exit date.
      </p>
      <p>
        Counting on <span data-testid="ees-on">{today}</span>
        {rawToday && isIsoDate(rawToday) ? " (from the today parameter)" : ""}.
      </p>
      {todayInvalid ? (
        <p data-testid="ees-today-error" role="alert">
          The today parameter is not a real calendar date. Showing the actual local date instead.
        </p>
      ) : null}
      <form onSubmit={compare} className="space-y-3">
        <div>
          <label htmlFor="ees-days-used" className="block">EES days used</label>
          <input
            id="ees-days-used"
            data-testid="ees-days-used"
            inputMode="numeric"
            value={daysUsed}
            onChange={(event) => setDaysUsed(event.target.value)}
            className="border px-2 py-1"
          />
        </div>
        <div>
          <label htmlFor="ees-records" className="block">EES entry and exit records</label>
          <textarea
            id="ees-records"
            data-testid="ees-records"
            value={recordsText}
            onChange={(event) => setRecordsText(event.target.value)}
            rows={5}
            className="w-full border px-2 py-1"
            placeholder="2024-06-01 2024-06-10"
          />
        </div>
        <button type="submit" data-testid="ees-compare" className="border px-3 py-1">Compare</button>
      </form>
      {formError ? <p data-testid="ees-error" role="alert">{formError}</p> : null}
      {result ? (
        <section aria-live="polite" className="space-y-2">
          <p data-testid="ees-codes">{result.codes.join(" ") || "none"}</p>
          <p>
            Trips: <span data-testid="ees-traveller-days">{result.travellerDaysUsed}</span>
            {". EES figure gap: "}
            <span data-testid="ees-figure-gap">{result.figureGap}</span>
          </p>
          <p data-testid="ees-explanation">{result.explanation}</p>
          <ul data-testid="ees-differences">
            {result.differences.length === 0 ? <li data-testid="ees-difference">none</li> : null}
            {result.differences.map((difference) => (
              <li key={`${difference.date}-${difference.side}`} data-testid="ees-difference">
                {difference.date} {difference.side}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
