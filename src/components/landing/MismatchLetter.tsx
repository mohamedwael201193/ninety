"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Landmark, TriangleAlert } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LETTER = [
  "To the competent authority,",
  "Under Article 52 of Regulation (EU) 2017/2226 I request",
  "rectification of my Entry/Exit System record.",
  "My exit on 30 June was not recorded. My passport stamps",
  "show 56 days used, leaving 34 — not the 90 used it shows.",
  "Please correct the record within the legal time limit.",
];

const STEPS = [
  ["01", "Your count", "Rebuilt from your own trips: 56 used, 34 left."],
  ["02", "The border's count", "The EES record says 90 used, 0 left. Someone is wrong."],
  ["03", "The reason", "A missing exit on 30 June explains the 34-day gap."],
  ["04", "The fix", "A rectification request, written for you."],
];

/**
 * Pinned scroll story (desktop, motion allowed): the section pins and the scroll
 * scrubs four beats. Everything renders fully visible by default, so first paint,
 * mobile and reduced-motion users always see the finished state.
 */
export default function MismatchLetter() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: q(".ml-stage")[0], start: "top top+=72", end: "+=1600", pin: true, scrub: 0.6, anticipatePin: 1 },
      });
      const step = (i: number) => {
        tl.to(q(".ml-step"), { opacity: 0.75, duration: 0.2 }, `s${i}`)
          .to(q(".ml-step")[i], { opacity: 1, duration: 0.2 }, `s${i}`)
          .to(q(".ml-bar"), { scaleY: (i + 1) / 4, duration: 0.4 }, `s${i}`);
      };
      tl.set(q(".ml-step"), { opacity: 0.75 }).set(q(".ml-bar"), { scaleY: 0 });
      step(0);
      tl.fromTo(q(".ml-ours"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "s0");
      step(1);
      tl.from(q(".ml-ees"), { x: 60, opacity: 0, rotate: 4, duration: 0.6 }, "s1");
      step(2);
      tl.from(q(".ml-alert"), { scale: 0.85, opacity: 0, duration: 0.5, ease: "back.out(2)" }, "s2")
        .to(q(".ml-ees"), { boxShadow: "0 0 0 2px #C2361F", duration: 0.3 }, "s2");
      step(3);
      tl.from(q(".ml-letter"), { y: 50, opacity: 0, duration: 0.5 }, "s3")
        .from(q(".ml-line"), { opacity: 0.08, duration: 0.35, stagger: 0.25, ease: "none" }, "s3+=0.3")
        .from(q(".ml-seal"), { scale: 0, rotate: -40, duration: 0.4, ease: "back.out(2.4)" }, ">");
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} id="mismatch" className="relative bg-paper py-24 md:py-32">
      <div className="ml-stage mx-auto max-w-page px-5 md:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <p className="eyebrow">EES mismatch</p>
            <h2 className="mt-4 font-display text-4xl font-medium leading-[1.05] tracking-tight md:text-5xl">Spot the border&apos;s mistake. Send the fix in one tap.</h2>
            <ol className="relative mt-10 hidden space-y-6 pl-6 lg:block">
              <span aria-hidden className="absolute left-0 top-1 h-full w-px bg-line-soft" />
              <span aria-hidden className="ml-bar absolute left-0 top-1 h-full w-px origin-top bg-ink" />
              {STEPS.map(([n, t, d]) => (
                <li key={n} className="ml-step">
                  <p className="font-mono text-xs text-ink-hushed">{n}</p>
                  <p className="font-display text-lg font-medium">{t}</p>
                  <p className="text-sm text-ink-hushed">{d}</p>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-lg text-ink-hushed lg:hidden">Same trips, two counts: you used 56 days, the EES says 90. Ninety shows you which number is right and why.</p>
          </div>
          <div className="grid items-start gap-6 lg:col-span-8 lg:grid-cols-2">
            <div className="grain relative rounded-3xl bg-paper-warm p-6 md:p-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="ml-ours card-soft p-5 !transition-none">
                  <p className="text-xs text-ink-hushed">Ninety</p>
                  <p className="mt-1 font-display text-5xl font-semibold tnum">56</p>
                  <p className="text-sm text-ink-hushed">days used</p>
                  <p className="mt-2 text-xs font-medium text-ok">34 left</p>
                </div>
                <div className="ml-ees rounded-3xl bg-spring-wash p-5">
                  <p className="flex items-center gap-1 text-xs text-ink-hushed"><Landmark size={12} aria-hidden /> EES record</p>
                  <p className="mt-1 font-display text-5xl font-semibold tnum">90</p>
                  <p className="text-sm text-ink-hushed">days used</p>
                  <p className="mt-2 text-xs font-medium text-risk">0 left</p>
                </div>
              </div>
              <div className="ml-alert mt-4 flex items-start gap-3 rounded-2xl bg-risk-wash p-4 text-sm">
                <TriangleAlert size={18} className="mt-0.5 shrink-0 text-risk" aria-hidden />
                <span><strong className="text-risk">34 days apart.</strong> Likely: your exit on 30 June wasn&apos;t recorded.</span>
              </div>
            </div>
            <div className="ml-letter relative overflow-hidden rounded-2xl bg-paper shadow-pop">
              <p className="bg-smolder px-6 py-3 font-mono text-xs uppercase tracking-wider text-paper">Request under Art. 52 Reg. (EU) 2017/2226</p>
              <div className="space-y-3 p-6 pb-20 text-[15px] leading-7 md:p-7 md:pb-20">
                <p className="ml-line">{LETTER[0]}</p>
                <p>{LETTER.slice(1).map((line) => <span key={line} className="ml-line inline">{line} </span>)}</p>
              </div>
              <div aria-hidden className="ml-seal absolute bottom-5 right-5 grid h-14 w-14 place-items-center rounded-full border-2 border-dashed border-ok text-[10px] font-mono font-semibold uppercase text-ok">Ready</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
