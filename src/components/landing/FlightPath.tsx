"use client";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "./motion";
/** Dashed arc drawn on scroll with a plane/arrowhead travelling along it. */
export default function FlightPath({ width = 520, height = 160, color = "currentColor", duration = 1.6, className }:
  { width?: number; height?: number; color?: string; duration?: number; className?: string }) {
  const r = useReducedMotion();
  const d = `M 12 ${height - 20} Q ${width / 2} ${-height * 0.35} ${width - 12} ${height - 20}`;
  const t = { duration: r ? 0 : duration, ease: EASE };
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" className={className} aria-hidden fill="none">
      <path d={d} stroke={color} strokeOpacity={0.15} strokeWidth={2} strokeDasharray="4 8" strokeLinecap="round" />
      <motion.path d={d} stroke={color} strokeWidth={2} strokeLinecap="round"
        initial={{ pathLength: r ? 1 : 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, margin: "-80px" }} transition={t} />
      <circle cx={12} cy={height - 20} r={5} fill={color} />
      <motion.circle cx={width - 12} cy={height - 20} r={5} fill={color}
        initial={{ scale: r ? 1 : 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ ...t, delay: r ? 0 : duration * 0.9, duration: 0.4 }} />
      {!r && (
        <motion.g style={{ offsetPath: `path("${d}")`, offsetRotate: "auto" } as React.CSSProperties}
          initial={{ offsetDistance: "0%" }} whileInView={{ offsetDistance: "100%" }} viewport={{ once: true, margin: "-80px" }} transition={t}>
          <path d="M -8 -6 L 8 0 L -8 6 L -4 0 Z" fill={color} />
        </motion.g>
      )}
    </svg>
  );
}
/** Small arrow that nudges right on parent hover. Parent needs className="group". */
export function NudgeArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden fill="none"
      className={`transition-transform duration-300 [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:translate-x-1 motion-reduce:transition-none ${className ?? ""}`}>
      <path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
