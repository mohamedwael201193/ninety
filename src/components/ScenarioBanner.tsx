import Link from "next/link";
import type { Scenario } from "@/lib/scenarios";

/** Shown on /ees and /letter when a demo scenario is open, so it is clear which history is compared. */
export function ScenarioBanner({ scenario, path }: { scenario: Scenario; path: string }) {
  return (
    <p data-testid="scenario-banner" data-scenario={scenario.id} className="mb-6 rounded-2xl bg-paper p-4 text-sm text-ink-hushed">
      Demo scenario: <b className="text-ink">{scenario.title}</b>, read on {scenario.on}. Compared with this history, not your saved trips.{" "}
      <Link href={path} className="font-medium text-ink underline underline-offset-4">Use my trips</Link>
    </p>
  );
}
