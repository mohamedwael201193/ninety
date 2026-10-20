import { Info } from "lucide-react";

/** What Ninety does not count, shown wherever a count is shown. */
export function CoverageNote({ className = "" }: { className?: string }) {
  return (
    <aside data-testid="coverage-note" aria-label="What Ninety does not cover" className={`rounded-2xl bg-paper p-4 text-sm text-ink-hushed ${className}`}>
      <p className="flex items-start gap-2">
        <Info size={16} aria-hidden className="mt-0.5 shrink-0 text-ink" />
        <span>
          <b className="text-ink">Not covered.</b> Days spent on a national long-stay visa or a residence permit, extra time granted by a
          bilateral visa-waiver agreement, and days in Ireland or Cyprus (not in the Schengen area) are not counted here. If any of these
          apply to you, check with the Member State concerned.
        </span>
      </p>
    </aside>
  );
}
