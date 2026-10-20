import { CalendarClock } from "lucide-react";
import { EES_CUTOFF, cutoffExamples } from "@/lib/ees/cutoff-explainer";

/** States the 10 April 2026 cutoff rule and shows it on two histories, with figures from the reconciler. */
export function CutoffExplainer() {
  const examples = cutoffExamples();
  return (
    <section data-testid="cutoff-explainer" aria-labelledby="cutoff-title" className="card-soft mt-8 p-6 md:p-8">
      <h2 id="cutoff-title" className="flex items-center gap-2 font-display text-xl font-medium tracking-tight">
        <CalendarClock size={18} aria-hidden /> Why stays before {EES_CUTOFF} are not compared
      </h2>
      <p data-testid="cutoff-rule" className="mt-3 max-w-3xl text-sm leading-6 text-ink-hushed">
        The Entry/Exit System was phased in at the borders and reached full operation on 10 April 2026. Ninety compares your count with the EES figure only for stays that began on or after that date. Days from a stay that began earlier are listed separately: they are not an EES error and not a reason to ask for a correction. A border officer applying the 90/180 rule may still count them, so they stay in your own count.
      </p>
      <ul className="mt-5 grid gap-4 md:grid-cols-2">
        {examples.map((example) => (
          <li key={example.scenarioId} data-testid="cutoff-example" data-scenario={example.scenarioId} className="rounded-2xl bg-paper-sunk p-4 text-sm">
            <p className="font-medium">{example.stays}, EES says {example.eesDaysUsed}</p>
            <p className="mt-1 text-ink-hushed tnum">
              <span data-testid="cutoff-left-out">{example.leftOut}</span> days left out, <span data-testid="cutoff-compared">{example.compared}</span> compared{example.compared === 0 ? ": nothing to compare, so no EES error." : example.matches ? ": they match." : "."}
            </p>
            <a href={example.href} className="mt-2 inline-block font-medium underline underline-offset-4">Load this history</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
