"use client";

import { motion, useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotionSafe";
import { useEffect, useRef, useState } from "react";

export const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ y: 24 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Words({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "0.18em", opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: delay + i * 0.04 }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Counts to `value` when scrolled into view. */
/**
 * A figure in the landing band. It shows the real value from the first paint and never animates:
 * a count-up from 0 made a nearly full allowance read "0 used / 0 left" for a moment (browser QA).
 */
export function CountUp({ value, className }: { value: number; duration?: number; className?: string }) {
  return <span className={`tnum ${className ?? ""}`}>{value}</span>;
}

/** Types lines one after another once in view. */
export function useTypewriter(lines: string[], speed = 18) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const reduce = useReducedMotion();
  const total = lines.reduce((a, l) => a + l.length, 0);
  const [chars, setChars] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setChars(total); return; }
    let c = 0;
    const id = window.setInterval(() => {
      c += 2;
      setChars(Math.min(c, total));
      if (c >= total) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [inView, reduce, total, speed]);
  let left = chars;
  const shown = lines.map((l) => {
    const s = l.slice(0, Math.max(0, left));
    left -= l.length;
    return s;
  });
  const activeLine = shown.findIndex((s, i) => s.length < lines[i].length);
  return { ref, shown, activeLine, done: chars >= total };
}
