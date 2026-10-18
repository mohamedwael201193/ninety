"use client";

import { motion } from "framer-motion";
import Nav from "../landing/Nav";
import Footer from "../landing/Footer";
import { Spotlight } from "../fx/Spotlight";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Shared premium frame for the tool pages: sticky nav, layered header, warm body. */
export function ToolShell({ eyebrow, title, intro, children, testId }: { eyebrow: string; title: string; intro: React.ReactNode; children: React.ReactNode; testId: string }) {
  return (
    <>
      <Nav />
      <main data-testid={testId} className="bg-paper-warm">
        <header className="grain relative overflow-hidden bg-paper">
          <div aria-hidden className="mesh pointer-events-none absolute inset-0" />
          <div aria-hidden className="grid-fade pointer-events-none absolute inset-0" />
          <Spotlight />
          <div className="relative mx-auto max-w-page px-5 pb-12 pt-12 md:px-8 md:pb-16 md:pt-20">
            <motion.p initial={{ y: 6 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="eyebrow inline-flex items-center gap-2 rounded-pill border border-line-soft bg-paper px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-solar-deep" /> {eyebrow}
            </motion.p>
            <motion.h1 initial={{ y: 12 }} animate={{ y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.05 }} className="mt-5 max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.035em] md:text-6xl">{title}</motion.h1>
            <motion.div initial={{ y: 12 }} animate={{ y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.12 }} className="mt-5 max-w-2xl text-lg text-ink-hushed">{intro}</motion.div>
          </div>
        </header>
        <div className="mx-auto max-w-page px-5 py-10 md:px-8 md:py-14">{children}</div>
      </main>
      <Footer />
    </>
  );
}

export function FieldBlock({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-ink-hushed">{hint}</p> : null}
    </div>
  );
}
