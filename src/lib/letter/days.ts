/** A day count with its unit, as shown in the letter's evidence table ("1 day", "2 days"). */
export function daysLabel(n: number): string {
  const v = Math.abs(n);
  return `${v} ${v === 1 ? "day" : "days"}`;
}
