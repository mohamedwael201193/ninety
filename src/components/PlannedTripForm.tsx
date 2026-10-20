"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, OctagonAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { checkPlannedTrip, type StayInput } from "@/lib/schengen/engine";
import { dateFormatError, isIsoDate, type IsoDate } from "@/lib/schengen/dates";
import { DateField } from "./dashboard/DateField";
import { WindowBar } from "./dashboard/WindowBar";
import { longDate } from "./dashboard/format";

type PlannedTripFormProps = { history: StayInput[]; today: IsoDate };

const schema = z.object({ entry: z.string(), exit: z.string() });
type Values = z.infer<typeof schema>;
type Verdict = { tone: "ok" | "risk" | "error"; text: string; latestExit?: IsoDate | null; plan?: { entry: IsoDate; exit: IsoDate } };

export function PlannedTripForm({ history, today }: PlannedTripFormProps) {
  const { register, handleSubmit, setValue } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { entry: "", exit: "" } });
  const [v, setV] = useState<Verdict | null>(null);
  // On phones a fixed "days left / Add trip" bar covers the bottom 4 rem. After each check, bring the
  // verdict into view once it has opened (scroll-margin keeps it above the bar).
  const verdictRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!v) return;
    const timer = window.setTimeout(() => {
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      verdictRef.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    }, 340);
    return () => window.clearTimeout(timer);
  }, [v]);

  // Result strings identical to PR #1.
  function run({ entry, exit }: Values) {
    if (!isIsoDate(entry) || !isIsoDate(exit)) {
      const problem = dateFormatError(entry) ?? dateFormatError(exit);
      return setV({ tone: "error", text: problem ?? "Enter both an entry date and an exit date." });
    }
    const c = checkPlannedTrip(history, today, { entry, exit });
    const plan = { entry, exit };
    if (c.errors.length > 0) return setV({ tone: "error", text: c.errors.join(" ") });
    const note = c.assumedContinuousPresence ? " This assumes you stay in the Schengen area until the planned entry, because your current stay has no exit date." : "";
    if (c.fits) return setV({ tone: "ok", plan, latestExit: c.latestExit,
      text: `Fits. ${c.plannedDays} days, from ${entry} to ${exit}. Latest legal exit is ${c.latestExit}.${note}` });
    if (c.latestExit) return setV({ tone: "risk", plan, latestExit: c.latestExit,
      text: `Does not fit. Latest legal exit for an entry on ${entry} is ${c.latestExit}. This plan is ${c.plannedDays} days.${note}` });
    setV({ tone: "risk", plan, latestExit: null, text: `Does not fit. A stay starting on ${entry} would not be authorised.` });
  }

  const banner = v?.tone === "ok" ? "bg-ok-wash text-ok" : v?.tone === "risk" ? "bg-risk-wash text-risk" : "bg-warn-wash text-warn";

  return (
    <section aria-labelledby="planned-heading" className="space-y-5 card-soft card-hover p-6 md:p-8">
      <div>
        <h2 id="planned-heading" className="font-display text-2xl font-medium tracking-[-0.015em]">Planned trip</h2>
        <p className="text-sm text-ink-hushed">Will a future trip fit? Enter the dates you plan to travel.</p>
      </div>
      <form data-testid="planned-form" noValidate onSubmit={(event) => {
        // Read the fields as they are now, so a value set without a change event still counts.
        const form = event.currentTarget;
        for (const name of ["entry", "exit"] as const) {
          const field = form.elements.namedItem(name) as HTMLInputElement | null;
          if (field) setValue(name, field.value.trim());
        }
        return handleSubmit(run)(event);
      }} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <DateField id="planned-entry" testId="planned-entry" label="Planned entry" {...register("entry")} />
        <DateField id="planned-exit" testId="planned-exit" label="Planned exit" {...register("exit")} />
        <button type="submit" data-testid="planned-check"
          className="focus-ring h-12 rounded-full bg-ink px-6 font-medium text-paper transition-[background,transform] duration-200 hover:bg-ink-soft active:scale-[.98]">
          Check planned trip
        </button>
      </form>

      <div aria-live="polite">
        <AnimatePresence mode="wait">
          {v ? (
            <motion.div key="planned-verdict" ref={verdictRef} data-testid="planned-verdict" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }} className="scroll-mb-24 overflow-hidden md:scroll-mb-0">
              <div className={`flex gap-3 rounded-2xl p-5 ${banner}`}>
                {v.tone === "ok" ? <CircleCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> : <OctagonAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />}
                <div className="space-y-3">
                  <p data-testid="planned-result" className="font-medium tabular-nums">{v.text}</p>
                  {v.tone === "risk" && v.latestExit && v.plan ? (
                    <button type="button" data-testid="planned-use-latest"
                      onClick={() => { setValue("exit", v.latestExit!); run({ entry: v.plan!.entry, exit: v.latestExit! }); }}
                      className="focus-ring h-11 rounded-full bg-paper px-4 text-sm font-medium text-ink shadow-card">
                      Use {longDate(v.latestExit)}
                    </button>
                  ) : null}
                </div>
              </div>
              {v.plan ? <div className="mt-4"><WindowBar trips={history} today={today} end={v.plan.exit} planned={v.plan} /></div> : null}
            </motion.div>
          ) : (
            <p data-testid="planned-result" className="sr-only" />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
