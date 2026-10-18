"use client";

import type { Assessment } from "@/lib/schengen/engine";

type StatusPanelProps = {
  assessment: Assessment;
  todayOverride: boolean;
  todayInvalid: boolean;
};

function daysLeftNote(assessment: Assessment): string {
  if (assessment.overstay) {
    return "This date is already over the 90-day limit.";
  }
  if (assessment.present && assessment.daysLeft === 0 && assessment.latestExit) {
    return "No days left after today. Today is your last legal day.";
  }
  if (assessment.present && assessment.daysLeft > 0) {
    return `You can stay ${assessment.daysLeft} more ${assessment.daysLeft === 1 ? "day" : "days"} after today.`;
  }
  if (!assessment.present && assessment.daysLeft > 0) {
    return `If you enter today, you can stay ${assessment.daysLeft} ${assessment.daysLeft === 1 ? "day" : "days"}, including today.`;
  }
  return "A stay starting today would not be authorised.";
}

export function StatusPanel({ assessment, todayOverride, todayInvalid }: StatusPanelProps) {
  return (
    <section aria-labelledby="days-left-heading" className="space-y-2" aria-live="polite">
      <h2 id="days-left-heading">Days left today</h2>
      <p>
        Counting on <span data-testid="today-date">{assessment.on}</span>
        {todayOverride ? " (from the today parameter)" : ""}.
      </p>
      <p className="sr-only" data-testid="today-override">
        {todayOverride ? "yes" : "no"}
      </p>
      {todayInvalid ? (
        <p data-testid="today-error" role="alert">
          The today parameter is not a real calendar date. Showing the actual local date instead.
        </p>
      ) : null}
      {assessment.errors.length > 0 ? (
        <ul data-testid="trip-errors">
          {assessment.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
      <dl className="space-y-1">
        <div>
          <dt>Days used in the last 180 days</dt>
          <dd data-testid="days-used">{assessment.daysUsed}</dd>
        </div>
        <div>
          <dt>Days left</dt>
          <dd data-testid="days-left">{assessment.daysLeft}</dd>
        </div>
        <div>
          <dt>Latest legal exit</dt>
          <dd data-testid="latest-exit">{assessment.latestExit ?? "none"}</dd>
        </div>
        <div>
          <dt>In the Schengen area on this date</dt>
          <dd data-testid="present-status">{assessment.present ? "in" : "out"}</dd>
        </div>
        <div>
          <dt>Overstay on this date</dt>
          <dd data-testid="overstay-status">{assessment.overstay ? "overstay" : "ok"}</dd>
        </div>
      </dl>
      <p data-testid="days-left-note">{daysLeftNote(assessment)}</p>
      {assessment.overstays.length > 0 ? (
        <ul data-testid="overstay-detail">
          {assessment.overstays.map((span) => (
            <li key={`${span.from}-${span.to}`}>
              Overstay from {span.from} to {span.to} ({span.days} days). Days of stay in the
              180-day period {span.windowStart} to {span.windowEnd}: {span.daysInWindow}.
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
