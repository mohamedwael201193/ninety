"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CircleCheck, Info, Landmark, TriangleAlert, UserRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { isIsoDate, localToday } from "@/lib/schengen/dates";
import { EES_CUTOFF, groupDifferences, parseEesRecords, reconcile, type MismatchCode, type Reconciliation } from "@/lib/ees/reconcile";
import { days } from "@/lib/plural";
import { loadTrips } from "@/lib/trips";
import { evaluate } from "@/lib/schengen/engine";
import { NumberTicker } from "./fx/NumberTicker";
import { FieldBlock, ToolShell } from "./tools/ToolShell";

const CODE_LABEL: Record<MismatchCode, string> = {
  match: "Counts match",
  "figure-differs": "Days-used figures differ",
  "likely-missing-exit": "Likely missing exit",
  "likely-missing-entry": "Likely missing entry",
  "exit-dates-disagree": "Exit dates disagree",
  "ees-figure-inconsistent": "EES figure contradicts its own records",
};

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

  const [savedDays, setSavedDays] = useState<{ trips: number; used: number } | null>(null);

  useEffect(() => {
    const trips = loadTrips(window.localStorage);
    setSavedDays({ trips: trips.length, used: trips.length ? evaluate(trips, today, today).daysUsed : 0 });
    setReady(true);
  }, [today]);

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

  const matched = result?.codes.includes("match");

  return (
    <ToolShell
      testId={ready ? "ees-ready" : "ees-loading"}
      eyebrow="EES reconciliation"
      title="Does the border's count match yours?"
      intro={<p>Compare the days-used figure from the Entry/Exit System with the trips saved in this browser. Add the EES records if you have them and Ninety pinpoints the exact days that differ.</p>}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        <form onSubmit={compare} className="card-soft space-y-5 p-6 md:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-medium tracking-tight">What the EES says</h2>
            <span className="rounded-pill bg-paper-sunk px-3 py-1 font-mono text-xs text-ink-hushed">
              on <span data-testid="ees-on">{today}</span>
            </span>
          </div>
          {rawToday && isIsoDate(rawToday) ? <p className="text-xs text-ink-hushed">Date taken from the today parameter.</p> : null}
          {todayInvalid ? (
            <p data-testid="ees-today-error" role="alert" className="rounded-2xl bg-warn-wash p-3 text-sm text-warn">
              The today parameter is not a real calendar date. Showing the actual local date instead.
            </p>
          ) : null}
          <FieldBlock id="ees-days-used" label="EES days used" hint="The number shown by the EES or the border officer.">
            <input id="ees-days-used" data-testid="ees-days-used" inputMode="numeric" value={daysUsed}
              onChange={(event) => setDaysUsed(event.target.value)} className="field font-display text-lg" placeholder="e.g. 90" />
          </FieldBlock>
          <FieldBlock id="ees-records" label="EES entry and exit records (optional)" hint="YYYY-MM-DD. One per line: an entry date, an entry and an exit date, or Entry/Exit lines.">
            <textarea id="ees-records" data-testid="ees-records" value={recordsText} onChange={(event) => setRecordsText(event.target.value)}
              rows={5} className="field !h-auto py-3 font-mono text-sm" placeholder={"2026-06-01 2026-06-10\nEntry 2026-07-02\nExit 2026-07-09"} />
          </FieldBlock>
          {formError ? <p data-testid="ees-error" role="alert" className="rounded-2xl bg-risk-wash p-3 text-sm text-risk">{formError}</p> : null}
          <button type="submit" data-testid="ees-compare" className="btn btn-dark h-12 w-full">
            Compare <ArrowRight size={16} aria-hidden />
          </button>
        </form>

        <div aria-live="polite">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.section key={result.codes.join() + result.eesDaysUsed} initial={{ y: 16, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="card-soft p-5">
                    <p className="flex items-center gap-1.5 text-xs text-ink-hushed"><UserRound size={12} aria-hidden /> Your trips</p>
                    <p className="mt-1 font-display text-5xl font-semibold">
                      <span className="sr-only" data-testid="ees-traveller-days">{result.travellerDaysUsed}</span>
                      <NumberTicker value={result.travellerDaysUsed} />
                    </p>
                    <p className="text-sm text-ink-hushed">days used</p>
                  </div>
                  <div className={`rounded-3xl p-5 ${matched ? "bg-ok-wash" : "bg-spring-wash"}`}>
                    <p className="flex items-center gap-1.5 text-xs text-ink-hushed"><Landmark size={12} aria-hidden /> EES</p>
                    <p className="mt-1 font-display text-5xl font-semibold"><NumberTicker value={result.eesDaysUsed} /></p>
                    <p className="text-sm text-ink-hushed">days used</p>
                  </div>
                </div>
                <div className={`flex items-start gap-3 rounded-2xl p-4 text-sm ${matched ? "bg-ok-wash text-ok" : "bg-risk-wash"}`}>
                  {matched ? <CircleCheck size={18} className="mt-0.5 shrink-0" aria-hidden /> : <TriangleAlert size={18} className="mt-0.5 shrink-0 text-risk" aria-hidden />}
                  <div>
                    <p className={`font-medium ${matched ? "" : "text-risk"}`}>
                      <span data-testid="ees-figure-gap" data-gap={result.figureGap}>
                        {result.figureGap === 0 ? "No gap in the figure." : `${days(Math.abs(result.figureGap))} apart — the EES counts ${result.figureGap > 0 ? "more" : "fewer"}.`}
                      </span>
                    </p>
                    <ul data-testid="ees-codes" data-codes={result.codes.join(" ")} className="mt-2 flex flex-wrap gap-1.5">
                      {result.codes.length === 0 ? <li className="rounded-pill bg-paper px-2.5 py-0.5 text-xs text-ink">No findings</li> : null}
                      {result.codes.map((code) => <li key={code} className="rounded-pill bg-paper px-2.5 py-0.5 text-xs font-medium text-ink">{CODE_LABEL[code] ?? code}</li>)}
                    </ul>
                  </div>
                </div>
                {result.preCutoffDays.length > 0 ? (
                  <div data-testid="ees-cutoff-note" data-days={result.preCutoffDays.length} className="flex items-start gap-3 rounded-2xl bg-paper-warm p-4 text-sm">
                    <Info size={18} className="mt-0.5 shrink-0 text-ink-hushed" aria-hidden />
                    <p>
                      {days(result.preCutoffDays.length)} of your trips are from stays that began before {EES_CUTOFF}. The EES does not count those stays, so they are left out of this comparison. They still count toward your 90/180 limit: {days(result.eesComparableDaysUsed)} are comparable with the EES.
                    </p>
                  </div>
                ) : null}
                <div className="card-soft p-6">
                  <p className="eyebrow">What happened</p>
                  <p data-testid="ees-explanation" className="mt-2 leading-7">{result.explanation}</p>
                  <p className="eyebrow mt-6">Days that differ</p>
                  <ul data-testid="ees-differences" className="mt-2 flex flex-wrap gap-2">
                    {result.differences.length === 0 ? (
                      <li data-testid="ees-difference" className="text-sm text-ink-hushed">
                        {result.eesRecordDaysUsed === null && result.figureGap !== 0 ? "Add the EES records to list the exact days." : "No individual days differ."}
                      </li>
                    ) : null}
                    {groupDifferences(result.differences).map((range) => (
                      <li key={`${range.from}-${range.side}`} data-testid="ees-difference" data-from={range.from} data-to={range.to} data-count={range.count}
                        className={`rounded-xl px-3 py-1.5 font-mono text-xs ${range.side === "ees-only" ? "bg-spring-wash" : "bg-solar-wash"}`}>
                        {range.from === range.to ? range.from : `${range.from} → ${range.to}`} · {days(range.count)} · {range.side === "ees-only" ? "EES only" : "your trips only"}
                      </li>
                    ))}
                  </ul>
                </div>
                {!matched ? (
                  <Link href="/letter" data-testid="nav-letter" className="btn btn-primary h-12 w-full">Draft the Article 52 correction letter <ArrowRight size={16} aria-hidden /></Link>
                ) : null}
              </motion.section>
            ) : (
              <motion.div key="empty" className="card-soft relative grid min-h-[360px] place-items-center overflow-hidden p-8 text-center">
                <div aria-hidden className="mesh pointer-events-none absolute inset-0 opacity-70" />
                <div className="relative">
                  {savedDays && savedDays.trips > 0 ? (
                    <div data-testid="ees-empty-count" className="mx-auto flex w-fit items-center gap-3">
                      <span className="grid h-20 w-20 place-items-center rounded-3xl bg-paper font-display text-3xl font-semibold shadow-lift tnum">{savedDays.used}</span>
                      <span className="font-mono text-xs text-ink-hushed">vs</span>
                      <span aria-hidden className="grid h-20 w-20 place-items-center rounded-3xl border-2 border-dashed border-line font-display text-3xl font-semibold text-ink-faint">?</span>
                    </div>
                  ) : (
                    <div data-testid="ees-empty-neutral" aria-hidden className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-paper shadow-lift"><Landmark size={28} /></div>
                  )}
                  <p className="mt-6 font-display text-xl font-medium">{savedDays && savedDays.trips > 0 ? `Your trips: ${days(savedDays.used)} used. Your comparison appears here.` : "Your comparison appears here."}</p>
                  <p className="mt-1 text-sm text-ink-hushed">{savedDays && savedDays.trips === 0 ? "No trips saved in this browser yet. Add them on the calculator, then enter the EES figure." : "Enter the EES figure and press Compare."}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!result || result.codes.includes("match") ? (
            <p className="mt-4 text-sm text-ink-hushed">Need the letter anyway? <Link href="/letter" data-testid="nav-letter" className="font-medium text-ink underline underline-offset-4">Article 52 letter</Link></p>
          ) : null}
        </div>
      </div>
    </ToolShell>
  );
}
