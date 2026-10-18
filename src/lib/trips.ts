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
    if (typeof record.exit === "string" && isIsoDate(record.exit)) {
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
}
