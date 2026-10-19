import { evaluate } from "@/lib/schengen/engine";
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
  guardedBy: string[];
};

/** Gallery cards with their figures computed by the engine, so a card can never disagree with the calculator. */
export function galleryCards(): GalleryCard[] {
  return SCENARIO_ORDER.map((id) => {
    const scenario = SCENARIOS[id];
    const result = evaluate(scenarioTrips(scenario), scenario.on);
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
    };
  });
}
