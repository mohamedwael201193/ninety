/** Readable names for the parity scenarios, shared by /parity and /proof. */
export const NAMES: Record<string, string> = {
  "no-previous-stay": "No previous stay",
  "manual-14-jun-2024": "Manual example: 14 Jun 2024",
  "manual-entry-19-jun-2024": "Manual example: entry on 19 Jun 2024",
  "manual-entry-7-aug-2024": "Manual example: entry on 7 Aug 2024",
  "manual-last-day-29-aug-2024": "Manual example: last legal day, 29 Aug 2024",
  "calculator-example-kom-1-1": "Calculator's built-in example",
  "same-day-stay": "Same-day stay",
  "day-after-spring-dst": "Day after the spring clock change",
  "same-day-turnaround": "Same-day exit and re-entry",
  "exact-90-days": "Exactly 90 days",
  "day-91-overstay": "Day 91 (overstay)",
  "reentry-after-full-90": "Re-entry after a full 90 days",
  "entry-refused-next-day": "Entry refused the next day",
  "overstay-through-15-apr": "Overstay through 15 Apr",
};

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Readable scenario name. Known ids get a written name; others are derived, with month names capitalised. */
export function label(id: string): string {
  if (NAMES[id]) return NAMES[id];
  const text = id
    .split("-")
    .map((word) => (MONTHS.includes(word) ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
