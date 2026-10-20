"use client";

import { CircleCheck, OctagonAlert, TriangleAlert } from "lucide-react";
import type { Assessment, StayInput } from "@/lib/schengen/engine";
import { DaysRing } from "./dashboard/DaysRing";
import { WindowBar } from "./dashboard/WindowBar";
import { longDate, TONE_LABEL, toneFor } from "./dashboard/format";

type StatusPanelProps = {
  assessment: Assessment;
  todayOverride: boolean;
  todayInvalid: boolean;
  trips: StayInput[];
};

// Wording unchanged from PR #1 (tests may assert on it).
function daysLeftNote(a: Assessment): string {
  if (a.overstay) return "This date is already over the 90-day limit.";
  if (a.present && a.daysLeft === 0 && a.latestExit) return "No days left after today. Today is your last legal day.";
  if (a.present && a.daysLeft > 0) return `You can stay ${a.daysLeft} more ${a.daysLeft === 1 ? "day" : "days"} after today.`;
  if (!a.present && a.daysLeft > 0)
    return `If you enter today, you can stay ${a.daysLeft} ${a.daysLeft === 1 ? "day" : "days"}, including today.`;
  return "A stay starting today would not be authorised.";
}

const CHIP = {
  ok: { Icon: CircleCheck, cls: "bg-ok-wash text-ok" },
  warn: { Icon: TriangleAlert, cls: "bg-warn-wash text-warn" },
  risk: { Icon: OctagonAlert, cls: "bg-risk-wash text-risk" },
} as const;

export function StatusPanel({ assessment: a, todayOverride, todayInvalid, trips }: StatusPanelProps) {
  const tone = toneFor(a.daysLeft, a.overstay, a.latestExit);
  const { Icon, cls } = CHIP[tone];

  return (
    <section
      aria-labelledby="days-left-heading"
      data-testid="status-panel"
      data-tone={tone}
      className="space-y-6 card-soft card-hover p-6 md:p-8"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="days-left-heading" className="font-mono text-xs tracking-[0.08em] text-ink-hushed uppercase">
          Days left today
        </h2>
        <span data-testid="status-chip" className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${cls}`}>
          <Icon className="size-4" aria-hidden="true" />
          {tone === "risk" && !a.overstay ? "No days left" : TONE_LABEL[tone]}
        </span>
      </div>

      <p className="text-sm text-ink-hushed">
        Counting on{" "}
        <time dateTime={a.on} aria-label={longDate(a.on)} className="font-medium text-ink tabular-nums" data-testid="today-date">
          {a.on}
        </time>
        {todayOverride ? " (from the today parameter)" : ""}.
      </p>
      <p hidden aria-hidden="true" data-testid="today-override">{todayOverride ? "yes" : "no"}</p>

      {todayInvalid ? (
        <p data-testid="today-error" role="alert" className="rounded-xl bg-warn-wash p-3 text-sm text-warn">
          The today parameter is not a real calendar date. Showing the actual local date instead.
        </p>
      ) : null}
      {a.errors.length > 0 ? (
        <ul data-testid="trip-errors" role="alert" className="space-y-1 rounded-xl bg-risk-wash p-3 text-sm text-risk">
          {a.errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      ) : null}

      <div className="grid items-center gap-6 md:grid-cols-[280px_1fr]">
        <DaysRing daysLeft={a.daysLeft} daysUsed={a.daysUsed} tone={tone} />
        <div className="space-y-4" aria-live="polite">
          <p data-testid="days-left-note" className="font-display text-2xl leading-tight font-medium tracking-[-0.015em]">
            {daysLeftNote(a)}
          </p>
          <dl className="grid grid-cols-2 gap-3">
            <Tile label="Days left" testId="days-left" value={String(a.daysLeft)} strong />
            <Tile label="Days used in the last 180 days" testId="days-used" value={String(a.daysUsed)} />
            <Tile
              label="Latest legal exit"
              testId="latest-exit"
              value={a.latestExit ?? "none"}
              hint={a.latestExit ? longDate(a.latestExit) : "Not allowed to stay"}
              wide
            />
            <Tile label="In the Schengen area on this date" testId="present-status" value={a.present ? "Inside" : "Outside"} />
            <Tile label="Overstay on this date" testId="overstay-status" value={a.overstay ? "Overstay" : a.overstays.length > 0 ? "Not today" : "No overstay"}
              hint={!a.overstay && a.overstays.length > 0 ? "An earlier overstay is listed below" : undefined} />
          </dl>
        </div>
      </div>

      <WindowBar trips={trips} today={a.today} end={a.on} />

      {a.overstays.length > 0 ? (
        <div className="rounded-2xl bg-risk-wash p-5 text-risk">
          <p className="flex items-center gap-2 font-medium">
            <OctagonAlert className="size-5" aria-hidden="true" /> Over the 90-day limit
          </p>
          <ul data-testid="overstay-detail" className="mt-2 space-y-1 text-sm tabular-nums">
            {a.overstays.map((s) => (
              <li key={`${s.from}-${s.to}`}>
                Overstay from {s.from} to {s.to} ({s.days} days). Days of stay in the 180-day period {s.windowStart} to{" "}
                {s.windowEnd}: {s.daysInWindow}.
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function Tile({ label, value, testId, hint, strong, wide }: {
  label: string; value: string; testId: string; hint?: string; strong?: boolean; wide?: boolean;
}) {
  return (
    <div className={`rounded-2xl bg-paper-warm p-4 ${wide ? "col-span-2" : ""}`}>
      <dt className="text-xs text-ink-hushed">{label}</dt>
      <dd data-testid={testId} className={`mt-1 tabular-nums ${strong ? "font-display text-3xl font-semibold" : "text-lg font-medium"}`}>
        {value}
      </dd>
      {hint ? <p className="text-xs text-ink-hushed">{hint}</p> : null}
    </div>
  );
}
