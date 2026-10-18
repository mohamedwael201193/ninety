"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileText, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { EASE, Words } from "./motion";
import FlightPath from "./FlightPath";
import { PhoneDemo } from "./PhoneDemo";

function FloatCard({ children, className, delay, float, solar }: { children: React.ReactNode; className: string; delay: number; float: number; solar?: boolean }) {
  return (
    <motion.div
      aria-hidden
      initial={{ y: 8, scale: 0.96 }}
      animate={{ y: [0, -6, 0], scale: 1 }}
      transition={{ y: { duration: 4 + float, repeat: Infinity, ease: "easeInOut", delay }, scale: { duration: 0.5, ease: EASE, delay } }}
      className={`absolute z-20 hidden items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm shadow-lift sm:flex ${solar ? "bg-solar text-ink" : "bg-paper text-ink"} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-10 h-[640px] w-[640px] rounded-full bg-solar-wash blur-3xl opacity-70" />
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
        <motion.div className="row-start-2 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1" initial={{ y: 24 }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}>
          <div className="relative mx-auto max-w-[460px] py-6 lg:scale-[1.1]">
            <FlightPath width={420} height={160} color="#17332D" duration={1.8} className="pointer-events-none absolute -left-10 top-[30%] z-0 hidden w-[120%] -rotate-12 sm:block" />
            <div className="relative z-10"><PhoneDemo /></div>
            <FloatCard className="left-[-6%] top-[14%]" delay={0.6} float={0}>
              <span className="h-2 w-2 rounded-full bg-risk" /> <span>EES says <b className="tnum">90 days</b></span>
            </FloatCard>
            <FloatCard className="right-[-8%] top-[46%]" delay={1.0} float={1}>
              <FileText size={14} /> <span>Letter ready</span>
            </FloatCard>
            <FloatCard className="bottom-[10%] left-[-4%]" delay={1.4} float={2} solar>
              <span className="font-display text-base font-semibold tnum">34</span> <span>days left</span>
            </FloatCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
