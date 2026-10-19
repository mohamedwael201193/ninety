"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; testId: string };

/** Text date input, YYYY-MM-DD only (no native picker: identical in every locale/TZ). */
export const DateField = forwardRef<HTMLInputElement, Props>(function DateField({ label, error, testId, id, "aria-describedby": describedBy, ...rest }, ref) {
  const errId = `${id}-error`;
  // Point only at messages that exist: this field's own error, and the
  // caller's shared message while this field is invalid.
  const invalid = error !== undefined;
  const describedByIds = [error ? errId : null, invalid ? describedBy : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <input
        ref={ref}
        id={id}
        data-testid={testId}
        type="text"
        inputMode="numeric"
        placeholder="YYYY-MM-DD"
        autoComplete="off"
        maxLength={10}
        {...rest}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedByIds}
        className="focus-ring h-12 w-full rounded-xl border border-line bg-paper px-4 font-mono tabular-nums transition-colors duration-200 placeholder:text-ink-faint hover:border-ink-faint disabled:bg-paper-sunk disabled:text-ink-faint aria-[invalid]:border-risk"
      />
      {error ? <p id={errId} className="text-sm text-risk">{error}</p> : null}
    </div>
  );
});
