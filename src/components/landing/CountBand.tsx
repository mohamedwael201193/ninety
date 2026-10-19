"use client";

import { useEffect, useState } from "react";
import { scenarioById } from "@/lib/scenarios";
import { bandModel, type BandModel } from "@/lib/ui/band-model";
import WindowBar from "./WindowBar";
import { CountUp, Reveal } from "./motion";

/**
 * "Every day of the last 180": the sample history, or the open ?scenario= so the band
 * agrees with the calculator below it. Reads the query after mount, so the page stays static.
 */
export default function CountBand() {
  const [model, setModel] = useState<BandModel>(() => bandModel(null));
  useEffect(() => {
    setModel(bandModel(scenarioById(new URLSearchParams(window.location.search).get("scenario"))));
  }, []);
  return (
    <section data-testid="count-band" data-source={model.source} className="mx-auto max-w-page px-5 py-20 md:px-8">
      <Reveal className="rounded-3xl border border-line-soft bg-paper-warm p-6 md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Count without the spreadsheet</p>
            <p className="mt-3 font-display text-3xl font-medium tracking-tight md:text-4xl">Every day of the last 180, at a glance.</p>
            <p data-testid="band-label" className="mt-2 text-sm text-ink-hushed">{model.label}</p>
          </div>
          <dl className="flex gap-8">
            <div><dt className="text-xs text-ink-hushed">Days used</dt><dd data-testid="band-used" className="font-display text-4xl font-semibold"><CountUp value={model.used} /></dd></div>
            <div><dt className="text-xs text-ink-hushed">Days left</dt><dd data-testid="band-left" className="font-display text-4xl font-semibold"><CountUp value={model.left} /></dd></div>
          </dl>
        </div>
        <div className="mt-8"><WindowBar days={model.days} used={model.used} left={model.left} /></div>
      </Reveal>
    </section>
  );
}
