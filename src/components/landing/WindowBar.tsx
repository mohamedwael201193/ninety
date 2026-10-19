"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

// 180-day sample window: used days in two trips, today at the end.
const USED = new Set<number>([...Array(29)].map((_, i) => 40 + i).concat([...Array(27)].map((_, i) => 118 + i)));

function Cell({ i, progress }: { i: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [i / 180 - 0.02, i / 180], [0.25, 1]);
  const color = i === 179 ? "bg-solar" : USED.has(i) ? "bg-ink" : "bg-paper-sunk";
  return <motion.span style={{ opacity }} className={`${color} block h-full`} />;
}

export default function WindowBar() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "end 40%"] });
  return (
    <div ref={ref}>
      <div role="img" aria-label="180-day window: 56 days used across two trips, 34 days left." className="grid h-10 gap-px overflow-hidden rounded-lg" style={{ gridTemplateColumns: "repeat(180, 1fr)" }}>
        {Array.from({ length: 180 }, (_, i) => <Cell key={i} i={i} progress={scrollYProgress} />)}
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink-hushed tnum"><span>180 days ago</span><span className="inline-flex items-center gap-1.5"><i className="inline-block size-2 rounded-[2px] bg-solar" aria-hidden="true" />Today</span></div>
    </div>
  );
}
