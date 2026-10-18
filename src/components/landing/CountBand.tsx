import WindowBar from "./WindowBar";
import { CountUp, Reveal } from "./motion";

export default function CountBand() {
  return (
    <section className="mx-auto max-w-page px-5 py-20 md:px-8">
      <Reveal className="rounded-3xl border border-line-soft bg-paper-warm p-6 md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Count without the spreadsheet</p>
            <p className="mt-3 font-display text-3xl font-medium tracking-tight md:text-4xl">Every day of the last 180, at a glance.</p>
          </div>
          <dl className="flex gap-8">
            <div><dt className="text-xs text-ink-hushed">Days used</dt><dd className="font-display text-4xl font-semibold"><CountUp value={56} /></dd></div>
            <div><dt className="text-xs text-ink-hushed">Days left</dt><dd className="font-display text-4xl font-semibold"><CountUp value={34} /></dd></div>
          </dl>
        </div>
        <div className="mt-8"><WindowBar /></div>
      </Reveal>
    </section>
  );
}
