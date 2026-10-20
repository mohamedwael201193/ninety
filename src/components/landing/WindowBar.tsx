"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

function Cell({ i, used, progress }: { i: number; used: boolean; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [i / 180 - 0.02, i / 180], [0.25, 1]);
  const color = i === 179 ? "bg-solar" : used ? "bg-ink" : "bg-paper-sunk";
  return <motion.span style={{ opacity }} className={`${color} block h-full`} />;
}

/** The 180-day strip, oldest day first; `days[179]` is today. */
export default function WindowBar({ days, used, left }: { days: boolean[]; used: number; left: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "end 40%"] });
  return (
    <div ref={ref}>
      <div role="img" aria-label={`180-day window: ${used} days used, ${left} days left.`} className="grid h-10 gap-px overflow-hidden rounded-lg" style={{ gridTemplateColumns: "repeat(180, 1fr)" }}>
        {Array.from({ length: 180 }, (_, i) => <Cell key={i} i={i} used={days[i]} progress={scrollYProgress} />)}
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink-hushed tnum"><span>180 days ago</span><span className="inline-flex items-center gap-1.5"><i className="inline-block size-2 rounded-[2px] bg-solar" aria-hidden="true" />Today</span></div>
    </div>
  );
}
