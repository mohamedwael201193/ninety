"use client";

import { motion } from "framer-motion";
import { Landmark, TriangleAlert } from "lucide-react";
import { EASE, Reveal, useTypewriter } from "./motion";

const LETTER = [
  "To the competent authority,",
  "Under Article 52 of Regulation (EU) 2017/2226 I request",
  "rectification of my Entry/Exit System record.",
  "My exit on 30 June was not recorded. My passport stamps",
  "show 56 days used, leaving 34 — not the 90 shown.",
  "Please correct the record within the legal time limit.",
];

export default function MismatchLetter() {
  const { ref, shown, activeLine } = useTypewriter(LETTER, 22);
  return (
    <section id="mismatch" className="mx-auto max-w-page px-5 py-24 md:px-8 md:py-32">
      <Reveal className="max-w-2xl">
        <p className="eyebrow">EES mismatch</p>
        <h2 className="mt-4 font-display text-4xl font-medium leading-[1.05] tracking-tight md:text-5xl">Spot the border&apos;s mistake. Send the fix in one tap.</h2>
        <p className="mt-4 text-lg text-ink-hushed">Two travellers, same trips: one was told 34 days, the other 90. Ninety shows you which number is right and why.</p>
      </Reveal>
      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <Reveal className="rounded-3xl bg-paper-warm p-6 md:p-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-paper p-5 shadow-card">
              <p className="text-xs text-ink-hushed">Ninety</p>
              <p className="mt-1 font-display text-5xl font-semibold tnum">34</p>
              <p className="text-sm text-ink-hushed">days left</p>
            </div>
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: EASE, delay: 0.3 }}
              className="rounded-2xl bg-spring-wash p-5">
              <p className="flex items-center gap-1 text-xs text-ink-hushed"><Landmark size={12} /> EES record</p>
              <p className="mt-1 font-display text-5xl font-semibold tnum">90</p>
              <p className="text-sm text-ink-hushed">days left</p>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.6 }}
            className="mt-4 flex items-start gap-3 rounded-2xl bg-risk-wash p-4 text-sm">
            <TriangleAlert size={18} className="mt-0.5 shrink-0 text-risk" />
            <span><strong className="text-risk">56 days apart.</strong> Likely: your exit on 30 June wasn&apos;t recorded.</span>
          </motion.div>
        </Reveal>
        <Reveal delay={0.1}>
          <div ref={ref} className="overflow-hidden rounded-xl bg-paper shadow-pop">
            <p className="bg-smolder px-6 py-3 font-mono text-xs uppercase tracking-wider text-paper">Request under Art. 52 Reg. (EU) 2017/2226</p>
            <div className="min-h-[260px] space-y-1 p-6 text-[15px] leading-7 md:p-8">
              {shown.map((line, i) => (
                <p key={i} className={i === activeLine ? "caret" : ""}>{line || "\u00a0"}</p>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
