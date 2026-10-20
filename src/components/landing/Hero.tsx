"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotionSafe";
import { useRef } from "react";
import { Spotlight } from "../fx/Spotlight";
import { ArrowRight, FileText, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { EASE, Words } from "./motion";
import FlightPath from "./FlightPath";
import { PhoneDemo } from "./PhoneDemo";

type Pointer = { mx: MotionValue<number>; my: MotionValue<number>; scrollY: MotionValue<number> };

function FloatCard({ children, className, delay, float, solar, depth, p }: { children: React.ReactNode; className: string; delay: number; float: number; solar?: boolean; depth: number; p: Pointer }) {
  const x = useTransform(p.mx, (v) => v * depth * 18);
  const yMouse = useTransform(p.my, (v) => v * depth * 14);
  const yScroll = useTransform(p.scrollY, [0, 600], [0, -depth * 90]);
  const y = useTransform([yMouse, yScroll], ([a, b]: number[]) => a + b);
  return (
    <motion.div aria-hidden style={{ x, y }} className={`absolute z-20 hidden sm:block ${className}`}>
      <motion.div
        initial={{ y: 8, scale: 0.96 }}
        animate={{ y: [0, -6, 0], scale: 1 }}
        transition={{ y: { duration: 4 + float, repeat: Infinity, ease: "easeInOut", delay }, scale: { duration: 0.5, ease: EASE, delay } }}
        className={`flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,.8)_inset,0_0_0_1px_rgba(26,25,25,.08),0_20px_40px_-18px_rgba(12,10,8,.35)] ${solar ? "bg-solar text-ink" : "bg-white/85 text-ink"}`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 20 });
  const my = useSpring(rawY, { stiffness: 60, damping: 20 });
  const { scrollY: sy } = useScroll();
  const still = useMotionValue(0);
  const p: Pointer = { mx, my, scrollY: reduce ? still : sy };
  const phoneY = useTransform(p.scrollY, [0, 600], [0, -30]);
  function onMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width - 0.5);
    rawY.set((e.clientY - r.top) / r.height - 0.5);
  }
  return (
    <section ref={ref} onPointerMove={onMove} className="grain relative overflow-hidden">
      <div aria-hidden className="mesh pointer-events-none absolute inset-0" />
      <div aria-hidden className="grid-fade pointer-events-none absolute inset-0" />
      <Spotlight />
      <div className="relative mx-auto grid max-w-page items-center gap-x-14 gap-y-8 px-5 pb-20 pt-10 md:px-8 md:pt-24 lg:grid-cols-12">
        <div className="lg:col-span-7 lg:row-start-1">
          <motion.p initial={{ y: 6 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: EASE }}
            className="eyebrow inline-flex items-center gap-2 rounded-pill border border-line-soft bg-paper px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" /> 90/180 · Schengen
          </motion.p>
          <h1 className="mt-6 font-display text-5xl font-medium leading-[1.0] tracking-[-0.035em] md:text-7xl">
            <Words text="Know your Schengen days" />
            <Words text="before the border does." className="text-ink-hushed" delay={0.2} />
          </h1>
        </div>
        <div className="lg:col-span-7 lg:row-start-2 lg:self-start">
          <motion.p initial={{ y: 10 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
            className="max-w-[560px] text-lg text-ink-hushed">
            Count your 90/180 days in seconds, catch where the EU&apos;s new EES count disagrees with you, and get the correction letter written for you.
          </motion.p>
          <motion.div initial={{ y: 10 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.55 }}
            className="mt-8 flex flex-wrap gap-3">
            <a href="#check" className="btn btn-primary group h-14 px-8 text-lg">
              Check my days <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </a>
            <Link href="/parity" className="btn btn-ghost h-14 px-6">See calculator parity</Link>
          </motion.div>
          <motion.ul initial={{ y: 6 }} animate={{ y: 0 }} transition={{ delay: 0.6, duration: 0.6, ease: EASE }}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-hushed">
            <li className="flex items-center gap-1.5"><ShieldCheck size={16} /> Matches the European Commission&apos;s calculator</li>
            <li className="flex items-center gap-1.5"><Lock size={16} /> No account · data stays in your browser</li>
          </motion.ul>
        </div>
        <motion.div className="row-start-3 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1" initial={{ y: 24 }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}>
          <div className="relative mx-auto max-w-[460px] py-6 lg:scale-[1.1]">
            <FlightPath width={420} height={160} color="#17332D" duration={1.8} className="pointer-events-none absolute -left-10 top-[30%] z-0 hidden w-[120%] -rotate-12 sm:block" />
            <motion.div style={{ y: phoneY }} className="relative z-10">
              <PhoneDemo />
              <p data-testid="hero-illustration-note" className="mt-4 text-center text-xs text-ink-hushed">Illustration with example trips, not your data. Your own count is below.</p>
            </motion.div>
            <FloatCard className="left-[-18%] top-[-2%]" delay={0.6} float={0} depth={1.2} p={p}>
              <span className="h-2 w-2 rounded-full bg-risk" /> <span>EES says <b className="tnum">90 used</b></span>
            </FloatCard>
            <FloatCard className="right-[-10%] top-[46%]" delay={1.0} float={1} depth={0.8} p={p}>
              <FileText size={14} /> <span>Letter ready</span>
            </FloatCard>
            <FloatCard className="bottom-[10%] left-[-10%]" delay={1.4} float={2} solar depth={1.6} p={p}>
              <span className="font-display text-base font-semibold tnum">34</span> <span>days left</span>
            </FloatCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
