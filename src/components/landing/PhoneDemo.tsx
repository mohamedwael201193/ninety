"use client";

import { AnimatePresence, animate, motion, useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotionSafe";
import { CircleAlert, CircleCheck, MousePointer2, Plane, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DaysRing } from "../DaysRing";
import { EASE } from "./motion";

const TRIPS = [
  { place: "Lisbon → Porto", dates: "02 Jun – 30 Jun", days: 29 },
  { place: "Berlin", dates: "18 Aug – 13 Sep", days: 27 },
];
const TYPED = "18 Aug – 13 Sep";

// step: 0 one trip, 1 typing, 2 tap, 3 second trip added, 4 ring filled, 5 hold
// 5: EES mismatch card flash
const STEPS_MS = [900, 1500, 600, 700, 1800, 3600];
// How long the finished first paint (card included) holds before the loop starts.
const FIRST_HOLD_MS = 4000;

/** The ring's figure: a dash while the trips are still being added, the running count once it fills. */
export function phoneFigure(filled: boolean, count: number): string {
  return filled ? String(count) : "–";
}

export function PhoneDemo() {
  const reduce = useReducedMotion();
  // First paint shows the finished state (34 days left), then the loop replays.
  const [step, setStep] = useState(5);
  const [typed, setTyped] = useState("");
  const [count, setCount] = useState(34);
  const rootRef = useRef<HTMLDivElement>(null);
  // Only run the loop while the phone is on screen, so a visitor never lands mid-loop with the card hidden.
  const inView = useInView(rootRef, { amount: 0.4 });

  useEffect(() => {
    if (reduce || !inView) { setStep(5); setCount(34); setTyped(""); return; }
    let s = 0;
    let timer: number;
    const run = () => {
      setStep(s);
      const next = s === STEPS_MS.length - 1 ? 0 : s + 1;
      timer = window.setTimeout(() => { s = next; run(); }, STEPS_MS[s]);
    };
    timer = window.setTimeout(run, FIRST_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [reduce, inView]);

  useEffect(() => {
    if (reduce) return;
    if (step === 0) { setTyped(""); setCount(0); }
    if (step === 1) {
      let i = 0;
      const id = window.setInterval(() => { i += 1; setTyped(TYPED.slice(0, i)); if (i >= TYPED.length) window.clearInterval(id); }, 80);
      return () => window.clearInterval(id);
    }
    if (step === 3) setTyped("");
    if (step === 4) {
      const c = animate(0, 34, { duration: 1.1, ease: EASE, onUpdate: (v) => setCount(Math.round(v)) });
      return () => c.stop();
    }
  }, [step, reduce]);

  const trips = step >= 3 ? TRIPS : TRIPS.slice(0, 1);
  const filled = step >= 4;
  const mismatch = step === 5;

  return (
    <div ref={rootRef} className="relative mx-auto w-[300px] sm:w-[320px]" role="img" aria-label="Ninety app preview: two trips added, 34 of 90 days left, safe.">
      <div className="rounded-[3rem] bg-ink p-3 shadow-pop">
        <div className="relative h-[620px] overflow-hidden rounded-[2.4rem] bg-paper-warm">
          <div className="absolute left-1/2 top-2.5 z-10 h-6 w-24 -translate-x-1/2 rounded-pill bg-ink" />
          <div className="flex items-center justify-between px-7 pt-3 text-[11px] font-medium tnum">
            <span>9:41</span><span className="opacity-60">5G</span>
          </div>
          <div className="px-5 pt-6" aria-hidden>
            <div className="flex items-center gap-1.5 font-display text-lg font-semibold">
              ninety<span className="h-2 w-2 rounded-full bg-solar" />
            </div>
            <div className="mt-4 flex justify-center">
              <DaysRing left={filled ? 34 : 0} size={180} stroke={12}>
                <span className="font-display text-6xl font-semibold leading-none tracking-tight tnum">{phoneFigure(filled, count)}</span>
                <span className="mt-1 text-[11px] text-ink-hushed">of 90 days left</span>
              </DaysRing>
            </div>
            <div className="mt-3 flex justify-center">
              <motion.span
                animate={{ opacity: filled ? 1 : 0, y: filled ? 0 : 6 }}
                transition={filled ? { duration: 0.4, ease: EASE, delay: 0.8 } : { duration: 0 }}
                className="inline-flex items-center gap-1 rounded-pill bg-ok-wash px-2.5 py-1 text-[11px] font-medium text-ok"
              >
                <CircleCheck size={12} /> Safe · 34 days left
              </motion.span>
            </div>

            <div className="mt-4 rounded-2xl bg-paper p-3 shadow-card">
              <p className="text-[10px] font-medium uppercase tracking-wider text-ink-hushed">Add trip</p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex h-9 flex-1 items-center rounded-lg border border-line px-2.5 text-[13px] tnum">
                  {typed ? <span className={step === 1 ? "caret" : ""}>{typed}</span> : <span className="text-ink-faint">Entered – Left</span>}
                </div>
                <motion.div
                  animate={{ scale: step === 2 ? 0.9 : 1 }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-solar"
                >
                  <Plus size={16} />
                </motion.div>
              </div>
            </div>

            <ul className="mt-3 space-y-2">
              <AnimatePresence initial={false}>
                {trips.map((t) => (
                  <motion.li
                    key={t.place}
                    layout
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.32, ease: EASE }}
                    className="flex items-center gap-3 rounded-2xl bg-paper px-3 py-2.5 shadow-card"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-sunk"><Plane size={14} /></span>
                    <span className="flex-1">
                      <span className="block text-[13px] font-medium">{t.place}</span>
                      <span className="block text-[11px] text-ink-hushed tnum">{t.dates}</span>
                    </span>
                    <span className="rounded-pill bg-paper-sunk px-2 py-0.5 text-[11px] font-medium tnum">{t.days}d</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>

          {/* initial={false}: the card is in the server HTML at full opacity, so it shows even before hydration. */}
          <AnimatePresence initial={false}>
            {mismatch && (
              <motion.div
                aria-hidden
                data-testid="hero-ees-card"
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.45, ease: EASE }}
                // Docked to the bottom of the screen like a sheet, so it never covers the phone's header or counter.
                className="absolute inset-x-4 bottom-4 z-30 rounded-2xl bg-ink p-3 text-paper shadow-pop"
              >
                <div className="flex items-center gap-2 text-[12px] font-medium">
                  <CircleAlert size={14} className="text-solar" /> EES count disagrees
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-center tnum">
                  <div className="rounded-xl bg-white/10 py-1.5"><div className="font-display text-xl font-semibold">90</div><div className="text-[10px] opacity-70">EES says used</div></div>
                  <div className="rounded-xl bg-solar py-1.5 text-ink"><div className="font-display text-xl font-semibold">56</div><div className="text-[10px] opacity-70">You actually used</div></div>
                </div>
                <div className="mt-2 text-[11px] opacity-80">34-day gap · Art. 52 letter ready</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* moving pointer */}
          <motion.div
            aria-hidden
            className="absolute z-20 text-ink drop-shadow"
            initial={false}
            animate={
              step === 1 ? { left: 120, top: 395, opacity: 1 } :
              step === 2 ? { left: 262, top: 392, opacity: 1, scale: 0.85 } :
              step === 3 ? { left: 230, top: 470, opacity: 1, scale: 1 } :
              { left: 230, top: 560, opacity: 0 }
            }
            transition={{ duration: 0.7, ease: EASE }}
          >
            <MousePointer2 size={22} fill="white" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
