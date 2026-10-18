"use client";

import { useState, type FormEvent } from "react";
import { checkPlannedTrip, type StayInput } from "@/lib/schengen/engine";
import { isIsoDate, type IsoDate } from "@/lib/schengen/dates";

type PlannedTripFormProps = {
  history: StayInput[];
  today: IsoDate;
};

export function PlannedTripForm({ history, today }: PlannedTripFormProps) {
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [result, setResult] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!isIsoDate(entry) || !isIsoDate(exit)) {
      setResult("Enter both an entry date and an exit date.");
      return;
    }
    const check = checkPlannedTrip(history, today, { entry, exit });
    if (check.errors.length > 0) {
      setResult(check.errors.join(" "));
      return;
    }
    if (check.fits) {
      setResult(
        `Fits. ${check.plannedDays} days, from ${entry} to ${exit}. Latest legal exit is ${check.latestExit}.`,
      );
      return;
    }
    if (check.latestExit) {
      setResult(
        `Does not fit. Latest legal exit for an entry on ${entry} is ${check.latestExit}. This plan is ${check.plannedDays} days.`,
      );
      return;
    }
    setResult(`Does not fit. A stay starting on ${entry} would not be authorised.`);
  }

  return (
    <section aria-labelledby="planned-heading" className="space-y-3">
      <h2 id="planned-heading">Planned trip</h2>
      <form data-testid="planned-form" onSubmit={submit} className="space-y-3">
        <div>
          <label htmlFor="planned-entry" className="block">
            Planned entry
          </label>
          <input
            id="planned-entry"
            data-testid="planned-entry"
            type="text"
            inputMode="numeric"
            placeholder="YYYY-MM-DD"
            autoComplete="off"
            value={entry}
            onChange={(event) => setEntry(event.target.value)}
            required
            className="border px-2 py-1"
          />
        </div>
        <div>
          <label htmlFor="planned-exit" className="block">
            Planned exit
          </label>
          <input
            id="planned-exit"
            data-testid="planned-exit"
            type="text"
            inputMode="numeric"
            placeholder="YYYY-MM-DD"
            autoComplete="off"
            value={exit}
            onChange={(event) => setExit(event.target.value)}
            required
            className="border px-2 py-1"
          />
        </div>
        <button type="submit" data-testid="planned-check" className="border px-3 py-1">
          Check planned trip
        </button>
      </form>
      <p data-testid="planned-result" aria-live="polite">
        {result}
      </p>
    </section>
  );
}
