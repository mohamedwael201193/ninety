import { parseIso, type IsoDate } from "@/lib/schengen/dates";

const LONG = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const SHORT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** Calendar date -> "12 March 2026". Always UTC so no timezone drift. */
export function longDate(iso: IsoDate): string {
  return LONG.format(new Date(parseIso(iso) * 86_400_000));
}
export function shortDate(iso: IsoDate): string {
  return SHORT.format(new Date(parseIso(iso) * 86_400_000));
}

export type Tone = "ok" | "warn" | "risk";
export function toneFor(daysLeft: number, overstay: boolean, latestExit: string | null): Tone {
  if (overstay || latestExit === null) return "risk";
  if (daysLeft < 15) return "warn";
  return "ok";
}
export const TONE_LABEL: Record<Tone, string> = { ok: "Safe", warn: "Low", risk: "Over limit" };
