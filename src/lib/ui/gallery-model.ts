import { addDays } from "@/lib/schengen/dates";
import { closeStays, evaluate, isPresentOn } from "@/lib/schengen/engine";
import { SCENARIOS, SCENARIO_ORDER, scenarioHref, scenarioTrips } from "@/lib/scenarios";

export type GalleryCard = {
  id: string;
  title: string;
  shows: string;
  href: string;
  on: string;
  used: number;
  left: number;
  overstayDays: number;
  /** Why used + left is not 90, when it isn't (old days leave the window during a new stay); otherwise null. */
  leftNote: string | null;
  guardedBy: string[];
};

/** Gallery cards with their figures computed by the engine, so a card can never disagree with the calculator. */
export function galleryCards(): GalleryCard[] {
  return SCENARIO_ORDER.map((id) => {
    const scenario = SCENARIOS[id];
    const trips = scenarioTrips(scenario);
    const result = evaluate(trips, scenario.on);
    const href = scenarioHref(scenario);
    return {
      id,
      title: scenario.title,
      shows: scenario.shows,
      // The calculator lives in #check on the home page; jump straight to it.
      href: scenario.page === "/" ? `${href}#check` : href,
      on: scenario.on,
      used: result.daysUsed,
      left: result.daysLeft,
      overstayDays: result.overstays.reduce((sum, o) => sum + o.days, 0),
      guardedBy: scenario.guardedBy,
      leftNote: leftNote(trips, scenario.on, result.daysUsed, result.daysLeft),
    };
  });
}

/** When a stay starting on `on` can last longer than 90 − used, say so and say when the used days drop out. */
function leftNote(trips: ReturnType<typeof scenarioTrips>, on: string, used: number, left: number): string | null {
  if (used === 0 || used >= 90 || left <= 90 - used) return null;
  const { stays } = closeStays(trips, on);
  let last = on;
  for (let i = 0; i < 180; i += 1) { last = addDays(on, -i); if (isPresentOn(stays, last)) break; }
  const gone = addDays(last, 180);
  return `${left} left, not ${90 - used}: the ${used} days already used drop out of the 180-day window by ${gone}, before a stay starting on ${on} would reach day ${90 - used + 1}, so that stay can last ${left} days.`;
}
