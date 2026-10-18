"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isIsoDate, localToday } from "@/lib/schengen/dates";
import { parseEesRecords, reconcile } from "@/lib/ees/reconcile";
import { buildCorrectionLetter, type CorrectionLetter } from "@/lib/letter/letter";
import { loadTrips } from "@/lib/trips";

const FONT_URL = "/fonts/NotoSans-Regular.ttf";

export function LetterPanel() {
  const params = useSearchParams();
  const rawToday = params.get("today");
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

  useEffect(() => {
    setReady(true);
  }, []);

  function generate(event: FormEvent) {
    event.preventDefault();
    if (!/^\d+$/.test(daysUsed)) {
      setError("Enter the EES days-used figure as a whole number.");
      setLetter(null);
      return;
    }
    const parsed = parseEesRecords(recordsText);
    if (parsed.errors.length > 0) {
      setError(parsed.errors.join(" "));
      setLetter(null);
      return;
    }
    try {
      const reconciliation = reconcile(loadTrips(window.localStorage), {
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
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6" data-testid={ready ? "letter-ready" : "letter-loading"}>
      <p>
        <Link href="/">Ninety</Link>
        {" · "}
        <Link href="/ees" data-testid="nav-ees">EES reconciliation</Link>
      </p>
      <h1>Article 52 correction request</h1>
      <p>
        Draft a request to rectify Entry/Exit System data under Article 52 of Regulation (EU) 2017/2226.
        Trips are read from this browser. Review the text before you sign or send it.
      </p>
      <p>
        Counting on <span data-testid="letter-on">{today}</span>.
      </p>
      <form onSubmit={generate} className="space-y-3">
        <Field id="letter-name" label="Full name" value={fullName} onChange={setFullName} />
        <Field id="letter-birth" label="Date of birth" value={dateOfBirth} onChange={setDateOfBirth} placeholder="YYYY-MM-DD" />
        <Field id="letter-nationality" label="Nationality" value={nationality} onChange={setNationality} />
        <Field id="letter-document" label="Travel document number" value={documentNumber} onChange={setDocumentNumber} />
        <Field id="letter-email" label="Email" value={email} onChange={setEmail} />
        <Field id="letter-member-state" label="Member State" value={memberState} onChange={setMemberState} />
        <Field id="letter-ees-days" label="EES days used" value={daysUsed} onChange={setDaysUsed} />
        <div>
          <label htmlFor="letter-records" className="block">EES entry and exit records</label>
          <textarea
            id="letter-records"
            data-testid="letter-records"
            value={recordsText}
            onChange={(event) => setRecordsText(event.target.value)}
            rows={4}
            className="w-full border px-2 py-1"
            placeholder="2024-06-01"
          />
        </div>
        <button type="submit" data-testid="letter-generate" className="border px-3 py-1">Draft letter</button>
      </form>
      {error ? <p data-testid="letter-error" role="alert">{error}</p> : null}
      {letter ? (
        <section className="space-y-3">
          <pre data-testid="letter-text" className="whitespace-pre-wrap border p-3">{letter.text}</pre>
          <button type="button" data-testid="letter-download" onClick={download} className="border px-3 py-1">
            Download PDF
          </button>
        </section>
      ) : null}
    </main>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block">{label}</label>
      <input
        id={id}
        data-testid={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="border px-2 py-1"
      />
    </div>
  );
}
