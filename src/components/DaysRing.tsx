"use client";

import { motion } from "framer-motion";

type Props = { left: number; size?: number; stroke?: number; tone?: "solar" | "warn" | "risk" | "spring"; children?: React.ReactNode };

const TONE = { solar: "var(--color-solar)", warn: "var(--color-warn)", risk: "var(--color-risk)", spring: "var(--color-spring)" };

export function DaysRing({ left, size = 220, stroke = 14, tone = "solar", children }: Props) {
  const r = (size - stroke) / 2;
  const fraction = Math.max(0, Math.min(90, left)) / 90;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-paper-sunk)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: fraction, stroke: TONE[tone] }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
