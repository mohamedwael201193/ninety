import type { ReactNode } from "react";

/**
 * A horizontally scrollable wrapper for wide tables. On a phone the table is wider than
 * the screen, so keyboard users must be able to focus the region to scroll it
 * (axe: scrollable-region-focusable); the label names it for screen readers.
 */
export function ScrollRegion({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div role="region" aria-label={label} tabIndex={0} className={`focus-ring overflow-x-auto ${className}`.trim()}>
      {children}
    </div>
  );
}
