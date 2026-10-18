"use client";

import { useState, type FormEvent } from "react";
import { isIsoDate } from "@/lib/schengen/dates";
import type { Trip } from "@/lib/trips";

type TripEditorProps = {
  initial: Trip | null;
  onSave: (trip: Trip) => void;
  onCancel: () => void;
};

export function TripEditor({ initial, onSave, onCancel }: TripEditorProps) {
  const [entry, setEntry] = useState(initial?.entry ?? "");
  const [exit, setExit] = useState(initial?.exit ?? "");
  const [open, setOpen] = useState(initial ? initial.exit === null : false);
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!isIsoDate(entry)) {
      setError("Enter an entry date.");
      return;
    }
    if (!open) {
      if (!isIsoDate(exit)) {
        setError("Enter an exit date, or mark the trip as still in the Schengen area.");
        return;
      }
      if (exit < entry) {
        setError("The exit date is before the entry date.");
        return;
      }
    }
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      entry,
      exit: open ? null : exit,
    });
  }

  return (
    <form data-testid="trip-form" onSubmit={submit} className="space-y-3">
      <div>
        <label htmlFor="trip-entry" className="block">
          Entry
        </label>
        <input
          id="trip-entry"
          data-testid="trip-entry"
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
        <label htmlFor="trip-open" className="inline-flex items-center gap-2">
          <input
            id="trip-open"
            data-testid="trip-open"
            type="checkbox"
            checked={open}
            onChange={(event) => setOpen(event.target.checked)}
          />
          Still in the Schengen area
        </label>
      </div>
      <div>
        <label htmlFor="trip-exit" className="block">
          Exit
        </label>
        <input
          id="trip-exit"
          data-testid="trip-exit"
          type="text"
          inputMode="numeric"
          placeholder="YYYY-MM-DD"
          autoComplete="off"
          value={open ? "" : exit}
          onChange={(event) => setExit(event.target.value)}
          disabled={open}
          required={!open}
          className="border px-2 py-1"
        />
      </div>
      {error ? (
        <p data-testid="trip-form-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button type="submit" data-testid="trip-save" className="border px-3 py-1">
          {initial ? "Save trip" : "Add trip"}
        </button>
        {initial ? (
          <button type="button" data-testid="trip-cancel" onClick={onCancel} className="border px-3 py-1">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
