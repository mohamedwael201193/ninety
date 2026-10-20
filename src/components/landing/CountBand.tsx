"use client";

import { useEffect, useState } from "react";
import { scenarioById } from "@/lib/scenarios";
import { isIsoDate, localToday } from "@/lib/schengen/dates";
import { loadTrips, TRIP_STORAGE_KEY, TRIPS_CHANGED_EVENT } from "@/lib/trips";
import { bandModel, type BandModel } from "@/lib/ui/band-model";
import WindowBar from "./WindowBar";
import { CountUp, Reveal } from "./motion";

/**
 * "Every day of the last 180": the open ?scenario=, else the trips saved in this browser read on
 * today (or ?today=), else the sample history. Reads after mount, so the page stays static, and
 * re-reads whenever trips are saved, so it agrees with the calculator below it.
 */
export default function CountBand() {
  const [model, setModel] = useState<BandModel>(() => bandModel(null));
  useEffect(() => {
    const read = () => {
      const params = new URLSearchParams(window.location.search);
      const rawToday = params.get("today");
      const on = rawToday && isIsoDate(rawToday) ? rawToday : localToday();
      let trips: ReturnType<typeof loadTrips> = [];
      try { trips = loadTrips(window.localStorage); } catch { trips = []; }
      setModel(bandModel(scenarioById(params.get("scenario")), { trips, on }));
    };
    read();
    const onStorage = (event: StorageEvent) => { if (event.key === null || event.key === TRIP_STORAGE_KEY) read(); };
    window.addEventListener(TRIPS_CHANGED_EVENT, read);
    window.addEventListener("storage", onStorage);
    return () => { window.removeEventListener(TRIPS_CHANGED_EVENT, read); window.removeEventListener("storage", onStorage); };
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
            <div><dt className="text-xs text-ink-hushed">Days used</dt><dd data-testid="band-used" data-value={model.used} className="font-display text-4xl font-semibold"><CountUp value={model.used} /></dd></div>
            <div><dt className="text-xs text-ink-hushed">Days left</dt><dd data-testid="band-left" data-value={model.left} className="font-display text-4xl font-semibold"><CountUp value={model.left} /></dd></div>
          </dl>
        </div>
        <div className="mt-8"><WindowBar days={model.days} used={model.used} left={model.left} /></div>
      </Reveal>
    </section>
  );
}
