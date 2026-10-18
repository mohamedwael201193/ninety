"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotionSafe";
import { useEffect } from "react";

/** Rolling digit ticker: each digit is a vertical 0–9 reel that springs into place. */
function Reel({ digit }: { digit: number }) {
  const reduce = useReducedMotion();
  const spring = useSpring(reduce ? digit : 0, { stiffness: 90, damping: 18, mass: 0.8 });
  useEffect(() => { if (reduce) spring.jump(digit); else spring.set(digit); }, [digit, spring, reduce]);
  const y = useTransform(spring, (v) => `${-v * 10}%`);
  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-top leading-none" style={{ width: "0.62em" }}>
      <motion.span aria-hidden="true" className="absolute inset-x-0 top-0 flex flex-col" style={{ y }}>
        {Array.from({ length: 10 }, (_, n) => <span key={n} className="block h-[1em] text-center leading-none">{n}</span>)}
      </motion.span>
    </span>
  );
}

export function NumberTicker({ value, className }: { value: number; className?: string }) {
  const digits = String(Math.max(0, Math.round(value))).split("").map(Number);
  return (
    <span className={`inline-flex tabular-nums ${className ?? ""}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="inline-flex">
        {digits.map((d, i) => <Reel key={`${digits.length}-${i}`} digit={d} />)}
      </span>
    </span>
  );
}
