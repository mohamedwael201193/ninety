"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { closeStays, type StayInput } from "@/lib/schengen/engine";
import { addDays, parseIso, type IsoDate } from "@/lib/schengen/dates";
import { shortDate } from "./format";

type Props = {
  trips: StayInput[];
  today: IsoDate;
  /** Window end; defaults to today. */
  end?: IsoDate;
  planned?: { entry: IsoDate; exit: IsoDate } | null;
};

/** 180 cells = the rolling window ending on `end`. Filled cell = a day counted. */
export function WindowBar({ trips, today, end = today, planned }: Props) {
  const reduce = useReducedMotion();
  const cells = useMemo(() => {
    const { stays } = closeStays(trips, today);
    const presence = new Set<number>();
    for (const s of stays) for (let d = parseIso(s.entry); d <= parseIso(s.exit); d += 1) presence.add(d);
    const p0 = planned ? parseIso(planned.entry) : Infinity;
    const p1 = planned ? parseIso(planned.exit) : -Infinity;
    const last = parseIso(end);
    return Array.from({ length: 180 }, (_, i) => {
      const day = last - 179 + i;
      return presence.has(day) ? "used" : day >= p0 && day <= p1 ? "plan" : "free";
    });
  }, [trips, today, end, planned]);
  const used = cells.filter((c) => c === "used").length;
  const start = addDays(end, -179);

  return (
    <figure className="space-y-2" data-testid="window-bar">
      <div
        role="img"
        aria-label={`${used} of the last 180 days counted, from ${shortDate(start)} to ${shortDate(end)}.`}
        className="grid grid-cols-[repeat(45,minmax(0,1fr))] gap-[2px] md:grid-cols-[repeat(90,minmax(0,1fr))]"
      >
        {cells.map((c, i) => (
          <motion.span
            key={i}
            initial={reduce ? false : { opacity: 0, scaleY: 0.4 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: reduce ? 0 : Math.min(i * 0.003, 0.5), duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className={`h-4 rounded-[2px] ${c === "used" ? "bg-ink" : c === "plan" ? "bg-spring" : "bg-paper-sunk"}`}
          />
        ))}
      </div>
      <figcaption className="flex justify-between font-mono text-xs text-ink-hushed tabular-nums">
        <span>{shortDate(start)}</span>
        <span className="flex gap-3">
          <span><i className="mr-1 inline-block size-2 rounded-[2px] bg-ink" />Counted</span>
          {planned ? <span><i className="mr-1 inline-block size-2 rounded-[2px] bg-spring" />Planned</span> : null}
        </span>
        <span>{shortDate(end)}</span>
      </figcaption>
    </figure>
  );
}
