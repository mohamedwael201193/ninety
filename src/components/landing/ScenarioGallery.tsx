import { ArrowRight, ShieldCheck } from "lucide-react";
import { galleryCards } from "@/lib/ui/gallery-model";

/**
 * Six worked histories. Each card's figures come from the engine at build time, and each
 * names the TestSprite tests that drive the same history against every preview.
 */
export default function ScenarioGallery() {
  const cards = galleryCards();
  return (
    <section id="scenarios" data-testid="scenario-gallery" className="scroll-mt-20 bg-paper py-20 md:py-24">
      <div className="mx-auto max-w-page px-5 md:px-8">
        <p className="eyebrow">Try a history</p>
        <h2 className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight md:text-4xl">Six cases the count has to get right</h2>
        <p className="mt-3 max-w-2xl text-ink-hushed">
          Open one to load it into the calculator or the EES check. Your saved trips are not touched. Each card names the TestSprite tests that check the same history on every pull request; the full list is on the{" "}
          <a href="/proof" className="underline underline-offset-2">proof page</a>.
        </p>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <li key={card.id} data-testid="scenario-card" data-scenario={card.id} className="card-soft flex flex-col p-6">
              <p className="font-mono text-xs text-ink-hushed">Read on {card.on}</p>
              <h3 className="mt-2 font-display text-lg font-medium leading-snug">{card.title}</h3>
              <p className="mt-3 flex items-baseline gap-3 tnum">
                <span><strong data-testid="scenario-card-used" className="font-display text-3xl font-semibold">{card.used}</strong> <span className="text-sm text-ink-hushed">used</span></span>
                <span><strong data-testid="scenario-card-left" className="font-display text-3xl font-semibold">{card.left}</strong> <span className="text-sm text-ink-hushed">left</span></span>
                {card.overstayDays > 0 ? <span className="text-sm font-medium text-risk">{card.overstayDays} days over</span> : null}
              </p>
              <p className="mt-3 flex-1 text-sm text-ink-hushed">{card.shows}</p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Guarded by TestSprite tests">
                {card.guardedBy.map((ts) => (
                  <li key={ts} data-testid="scenario-guard" data-ts={ts} className="inline-flex items-center gap-1 rounded-full bg-spring-wash px-2.5 py-1 font-mono text-xs">
                    <ShieldCheck size={12} aria-hidden /> guarded by {ts}
                  </li>
                ))}
              </ul>
              <a href={card.href} data-testid="scenario-open" className="mt-5 inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4">
                Open this history <ArrowRight size={14} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
