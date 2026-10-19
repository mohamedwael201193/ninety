import { isIsoDate, type IsoDate } from "./schengen/dates";

export type Trip = {
  id: string;
  entry: IsoDate;
  exit: IsoDate | null;
};

export const TRIP_STORAGE_KEY = "ninety.trips.v1";

export function parseTrips(raw: string | null): Trip[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const trips: Trip[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    if (typeof record.id !== "string" || record.id.length === 0) continue;
    if (typeof record.entry !== "string" || !isIsoDate(record.entry)) continue;
    if (record.exit === null) {
      trips.push({ id: record.id, entry: record.entry, exit: null });
      continue;
    }
    // A stored exit before its entry cannot come from the form; skip it like the engine does.
    if (typeof record.exit === "string" && isIsoDate(record.exit) && record.exit >= record.entry) {
      trips.push({ id: record.id, entry: record.entry, exit: record.exit });
    }
  }
  return trips;
}

export function serializeTrips(trips: Trip[]): string {
  return JSON.stringify(trips);
}

export function loadTrips(storage: Pick<Storage, "getItem"> | null): Trip[] {
  if (!storage) return [];
  return parseTrips(storage.getItem(TRIP_STORAGE_KEY));
}

export function saveTrips(storage: Pick<Storage, "setItem">, trips: Trip[]): void {
  storage.setItem(TRIP_STORAGE_KEY, serializeTrips(trips));
  // Same-tab listeners (the landing band) hear about the change; "storage" only fires in other tabs.
  if (typeof window !== "undefined") window.dispatchEvent(new Event(TRIPS_CHANGED_EVENT));
}

export const TRIPS_CHANGED_EVENT = "ninety:trips-changed";

/** Pairs of trips whose date ranges share at least one day (open trips run to `today`). */
export function findOverlaps(trips: Trip[], today: string): Array<[Trip, Trip]> {
  const pairs: Array<[Trip, Trip]> = [];
  const end = (trip: Trip) => trip.exit ?? (today > trip.entry ? today : trip.entry);
  const ordered = [...trips].sort((a, b) => a.entry.localeCompare(b.entry));
  for (let i = 0; i < ordered.length; i += 1) {
    for (let j = i + 1; j < ordered.length; j += 1) {
      if (ordered[j].entry > end(ordered[i])) break;
      pairs.push([ordered[i], ordered[j]]);
    }
  }
  return pairs;
}
