"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CircleCheck, Landmark, TriangleAlert, UserRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { isIsoDate, localToday } from "@/lib/schengen/dates";
import { parseEesRecords, reconcile, type MismatchCode, type Reconciliation } from "@/lib/ees/reconcile";
import { loadTrips } from "@/lib/trips";
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
          <FieldBlock id="ees-records" label="EES entry and exit records (optional)" hint="One per line: an entry date, or an entry date and an exit date.">
            <textarea id="ees-records" data-testid="ees-records" value={recordsText} onChange={(event) => setRecordsText(event.target.value)}
              rows={5} className="field !h-auto py-3 font-mono text-sm" placeholder={"2024-06-01 2024-06-10\n2024-07-02"} />
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
                      {result.figureGap === 0 ? "No gap in the figure." : `${Math.abs(result.figureGap)} day(s) apart — the EES counts ${result.figureGap > 0 ? "more" : "fewer"}.`}
                      <span className="sr-only">EES figure gap: <span data-testid="ees-figure-gap">{result.figureGap}</span></span>
                    </p>
                    <ul data-testid="ees-codes" data-codes={result.codes.join(" ")} className="mt-2 flex flex-wrap gap-1.5">
                      {result.codes.length === 0 ? <li className="rounded-pill bg-paper px-2.5 py-0.5 text-xs text-ink">No findings</li> : null}
                      {result.codes.map((code) => <li key={code} className="rounded-pill bg-paper px-2.5 py-0.5 text-xs font-medium text-ink">{CODE_LABEL[code] ?? code}</li>)}
                    </ul>
                  </div>
                </div>
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
                    {result.differences.map((difference) => (
                      <li key={`${difference.date}-${difference.side}`} data-testid="ees-difference"
                        className={`rounded-xl px-3 py-1.5 font-mono text-xs ${difference.side === "ees-only" ? "bg-spring-wash" : "bg-solar-wash"}`}>
                        {difference.date} · {difference.side === "ees-only" ? "EES only" : "your trips only"}
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
                  <div className="mx-auto flex w-fit items-center gap-3" aria-hidden>
                    <span className="grid h-20 w-20 place-items-center rounded-3xl bg-paper font-display text-3xl font-semibold shadow-lift">56</span>
                    <span className="font-mono text-xs text-ink-hushed">vs</span>
                    <span className="grid h-20 w-20 place-items-center rounded-3xl bg-spring-wash font-display text-3xl font-semibold shadow-lift">90</span>
                  </div>
                  <p className="mt-6 font-display text-xl font-medium">Your comparison appears here.</p>
                  <p className="mt-1 text-sm text-ink-hushed">Enter the EES figure and press Compare.</p>
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
