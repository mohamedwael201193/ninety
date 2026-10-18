"use client";

import { useEffect, useRef } from "react";

/** Cursor-following soft glow for a section. Writes CSS vars only (no React re-render). */
export function Spotlight({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        ref.current?.style.setProperty("--x", `${e.clientX - r.left}px`);
        ref.current?.style.setProperty("--y", `${e.clientY - r.top}px`);
        ref.current?.style.setProperty("--o", "1");
      });
    };
    const leave = () => ref.current?.style.setProperty("--o", "0");
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} aria-hidden className={`spotlight pointer-events-none absolute inset-0 ${className}`} />;
}
