"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Copy, Download, FileText, PenLine } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { isIsoDate, localToday } from "@/lib/schengen/dates";
import { parseEesRecords, reconcile } from "@/lib/ees/reconcile";
import { buildCorrectionLetter, type CorrectionLetter } from "@/lib/letter/letter";
import { loadTrips } from "@/lib/trips";
import { LETTER_FIELD_IDS, validateLetterForm, type LetterForm } from "@/lib/letter/validate";
import { scenarioById, scenarioTrips } from "@/lib/scenarios";
import { CarryLink } from "./CarryLink";
import { ScenarioBanner } from "./ScenarioBanner";
import { FieldBlock, ToolShell } from "./tools/ToolShell";

const FONT_URL = "/fonts/NotoSans-Regular.ttf";

export function LetterPanel() {
  const params = useSearchParams();
  // ?scenario=<id> compares the named demo history (the one shown on /), not the saved trips.
  const scenario = scenarioById(params.get("scenario"));
  const rawToday = params.get("today") ?? scenario?.on ?? null;
  const currentTrips = () => (scenario ? scenarioTrips(scenario) : loadTrips(window.localStorage));
  const today = rawToday && isIsoDate(rawToday) ? rawToday : localToday();
  const [ready, setReady] = useState(false);
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [memberState, setMemberState] = useState("");
  const [daysUsed, setDaysUsed] = useState("");
  const [recordsText, setRecordsText] = useState("");
  const [letter, setLetter] = useState<CorrectionLetter | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LetterForm, string>>>({});

  useEffect(() => {
    setReady(true);
  }, []);

  async function copyLetter() {
    if (!letter) return;
    try {
      await navigator.clipboard.writeText(letter.text);
      toast.success("Letter copied to the clipboard.");
    } catch {
      toast.error("Couldn't copy. Select the text and copy it manually.");
    }
  }

  function generate(event: FormEvent) {
    event.preventDefault();
    const invalid = validateLetterForm({ fullName, dateOfBirth, nationality, documentNumber, email, memberState, daysUsed });
    setFieldErrors(invalid);
    const keys = Object.keys(invalid) as (keyof LetterForm)[];
    if (keys.length > 0) {
      setLetter(null);
      setError(keys.length === 1 ? "Fix the highlighted field to draft the letter." : `Fix the ${keys.length} highlighted fields to draft the letter.`);
      document.getElementById(LETTER_FIELD_IDS[keys[0]])?.focus();
      return;
    }
    const parsed = parseEesRecords(recordsText);
    if (parsed.errors.length > 0) {
      setError(parsed.errors.join(" "));
      setLetter(null);
      return;
    }
    try {
      const reconciliation = reconcile(currentTrips(), {
        daysUsed: Number(daysUsed),
        on: today,
        records: recordsText.trim() === "" ? undefined : parsed.records,
      });
      setLetter(
        buildCorrectionLetter(
          { fullName, dateOfBirth, nationality, documentNumber, email, memberState },
          reconciliation,
        ),
      );
      setError(reconciliation.errors.join(" "));
    } catch (caught) {
      setLetter(null);
      setError(caught instanceof Error ? caught.message : "The letter could not be drafted.");
    }
  }

  async function download() {
    if (!letter) return;
    setError("");
    try {
      const response = await fetch(FONT_URL);
      if (!response.ok) throw new Error("The letter font could not be loaded.");
      const bytes = new Uint8Array(await response.arrayBuffer());
      const { letterToPdf } = await import("@/lib/letter/pdf");
      const pdf = await letterToPdf(letter, bytes);
      const copy = new ArrayBuffer(pdf.byteLength);
      new Uint8Array(copy).set(pdf);
      const blob = new Blob([copy], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "ninety-article-52-request.pdf";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The PDF could not be built.");
    }
  }

  return (
    <ToolShell
      testId={ready ? "letter-ready" : "letter-loading"}
      eyebrow="Article 52 · Reg. (EU) 2017/2226"
      title="Your correction request, written for you."
      intro={<p>Draft a request to rectify Entry/Exit System data. Trips are read from this browser; nothing leaves your device. Review the text before you sign or send it.</p>}
    >
      {ready && scenario ? <ScenarioBanner scenario={scenario} path="/letter" /> : null}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        <form onSubmit={generate} className="card-soft space-y-6 p-6 md:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-medium tracking-tight">Your details</h2>
            <span className="rounded-pill bg-paper-sunk px-3 py-1 font-mono text-xs text-ink-hushed">on <span data-testid="letter-on">{today}</span></span>
          </div>
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="sr-only">Identity</legend>
            <div className="sm:col-span-2"><Field id="letter-name" error={fieldErrors.fullName} label="Full name" value={fullName} onChange={setFullName} autoComplete="name" /></div>
            <Field id="letter-birth" error={fieldErrors.dateOfBirth} label="Date of birth" value={dateOfBirth} onChange={setDateOfBirth} placeholder="YYYY-MM-DD" autoComplete="bday" />
            <Field id="letter-nationality" error={fieldErrors.nationality} label="Country of nationality" value={nationality} onChange={setNationality} placeholder="e.g. Egypt" />
            <Field id="letter-document" error={fieldErrors.documentNumber} label="Travel document number" value={documentNumber} onChange={setDocumentNumber} />
            <Field id="letter-email" error={fieldErrors.email} label="Email" value={email} onChange={setEmail} autoComplete="email" />
          </fieldset>
          <div className="h-px bg-line-soft" />
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 font-display text-lg font-medium">The EES record</legend>
            <Field id="letter-member-state" error={fieldErrors.memberState} label="Member State" value={memberState} onChange={setMemberState} placeholder="e.g. France" />
            <Field id="letter-ees-days" error={fieldErrors.daysUsed} label="EES days used" value={daysUsed} onChange={setDaysUsed} placeholder="e.g. 90" />
            <div className="sm:col-span-2">
              <FieldBlock id="letter-records" label="EES entry and exit records (optional)" hint="One per line: an entry date, or an entry and an exit date.">
                <textarea id="letter-records" data-testid="letter-records" value={recordsText} onChange={(event) => setRecordsText(event.target.value)}
                  rows={4} className="field !h-auto py-3 font-mono text-sm" placeholder="2026-06-01" />
              </FieldBlock>
            </div>
          </fieldset>
          {error ? <p data-testid="letter-error" role="alert" className="rounded-2xl bg-risk-wash p-3 text-sm text-risk">{error}</p> : null}
          <button type="submit" data-testid="letter-generate" className="btn btn-dark h-12 w-full"><PenLine size={16} aria-hidden /> Draft letter</button>
          <p className="text-sm text-ink-hushed">Not sure of the numbers? <CarryLink href="/ees" data-testid="nav-ees" className="font-medium text-ink underline underline-offset-4">Run the EES check first</CarryLink></p>
        </form>

        <AnimatePresence mode="wait">
          {letter ? (
            <motion.section key={letter.text} initial={{ y: 20, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden rounded-2xl bg-paper shadow-pop lg:sticky lg:top-24">
              <div className="flex items-center justify-between gap-3 bg-smolder px-6 py-3 text-paper">
                <p className="font-mono text-xs uppercase tracking-wider">Request under Art. 52</p>
                <span className="rounded-pill bg-solar px-2.5 py-0.5 text-xs font-medium text-ink">Draft</span>
              </div>
              <table data-testid="letter-evidence" className="w-full border-b border-line-soft bg-paper-warm text-center">
                <caption className="sr-only">Evidence: days used in the 180 days ending on the date read</caption>
                <thead>
                  <tr className="text-xs text-ink-hushed">
                    <th scope="col" className="px-3 pt-3 font-normal">Date</th>
                    <th scope="col" className="px-3 pt-3 font-normal">Your dates</th>
                    <th scope="col" className="px-3 pt-3 font-normal">EES figure</th>
                    <th scope="col" className="px-3 pt-3 font-normal">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="divide-x divide-line-soft">
                    <td data-testid="letter-evidence-on" className="px-3 pb-3 font-mono text-sm">{today}</td>
                    <td data-testid="letter-evidence-ours" className="px-3 pb-3 font-display text-2xl font-semibold tnum">{letter.evidence.ours}</td>
                    <td data-testid="letter-evidence-ees" className="px-3 pb-3 font-display text-2xl font-semibold tnum">{letter.evidence.ees}</td>
                    <td data-testid="letter-evidence-gap" className="px-3 pb-3 font-display text-2xl font-semibold tnum">{Math.abs(letter.evidence.gap)}</td>
                  </tr>
                </tbody>
              </table>
              <pre data-testid="letter-text" className="max-h-[70vh] overflow-auto whitespace-pre-wrap p-6 font-sans text-[15px] leading-7 md:p-8">{letter.text}</pre>
              <div className="flex flex-col gap-3 border-t border-line-soft bg-paper-warm p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-ink-hushed">Review, sign and send it yourself. Not a decision by a border authority.</p>
                <div className="flex shrink-0 gap-2">
                  <button type="button" data-testid="letter-copy" onClick={copyLetter} className="btn btn-ghost h-11"><Copy size={16} aria-hidden /> Copy</button>
                  <button type="button" data-testid="letter-download" onClick={download} className="btn btn-primary h-11"><Download size={16} aria-hidden /> Download PDF</button>
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.div key="empty" className="card-soft relative grid min-h-[420px] place-items-center overflow-hidden p-8 text-center">
              <div aria-hidden className="mesh pointer-events-none absolute inset-0 opacity-70" />
              <div className="relative">
                <div aria-hidden className="relative mx-auto h-32 w-28">
                  <div className="absolute inset-0 translate-x-3 rotate-6 rounded-xl bg-paper-sunk shadow-card" />
                  <div className="absolute inset-0 space-y-2 rounded-xl bg-paper p-3 shadow-lift">
                    <div className="h-2 w-3/4 rounded bg-smolder" />
                    {[90, 70, 85, 60, 80].map((w) => <div key={w} className="skeleton h-1.5 rounded" style={{ width: `${w}%` }} />)}
                    <FileText size={18} className="absolute bottom-2 right-2 text-ok" />
                  </div>
                </div>
                <p className="mt-6 font-display text-xl font-medium">Your letter appears here.</p>
                <p className="mt-1 text-sm text-ink-hushed">Fill in your details and press Draft letter.</p>
                <p className="mt-4 inline-flex items-center gap-1 text-xs text-ink-hushed">Download as PDF, accents included <ArrowRight size={12} aria-hidden /></p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolShell>
  );
}

function Field({ id, label, value, onChange, placeholder, autoComplete, error }: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder?: string; autoComplete?: string; error?: string }) {
  return (
    <FieldBlock id={id} label={label}>
      <input id={id} data-testid={id} value={value} placeholder={placeholder} autoComplete={autoComplete}
        aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)} className={`field ${error ? "!border-risk" : ""}`} />
      {error ? <p id={`${id}-error`} data-testid={`${id}-error`} className="mt-1.5 text-xs font-medium text-risk">{error}</p> : null}
    </FieldBlock>
  );
}
