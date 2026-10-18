"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Tone } from "./format";
import { NumberTicker } from "../fx/NumberTicker";

const STROKE: Record<Tone, string> = { ok: "#E4F222", warn: "#B86E00", risk: "#C2361F" };

/** Ring = share of the 90-day allowance still available. Number counts up. */
export function DaysRing({ daysLeft, daysUsed, tone }: { daysLeft: number; daysUsed: number; tone: Tone }) {
  const reduce = useReducedMotion();
  const fraction = tone === "risk" ? 1 : Math.max(0, Math.min(1, daysLeft / 90));
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[280px]" aria-hidden="true">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r="52" fill="none" stroke="#EFECE8" strokeWidth="10" />
        <circle cx="60" cy="60" r="44" fill="url(#ring-glow)" />
        <defs><radialGradient id="ring-glow"><stop offset="0" stopColor="#F7FBC8" stopOpacity=".9" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient></defs>
        <motion.circle
          cx="60" cy="60" r="52" fill="none" strokeWidth="10" strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: fraction, stroke: STROKE[tone] }}
          transition={{ pathLength: { duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }, stroke: { duration: 0.32 } }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <NumberTicker value={daysLeft} className="font-display text-[5.5rem] leading-none font-semibold tracking-[-0.045em] md:text-[7rem]" />
        <span className="mt-1 font-mono text-xs tracking-[0.08em] text-ink-hushed uppercase">
          days left · {daysUsed}/90 used
        </span>
      </div>
    </div>
  );
}
