"use client";

import { stayLength } from "@/lib/schengen/engine";
import type { IsoDate } from "@/lib/schengen/dates";
import type { Trip } from "@/lib/trips";

type TripListProps = {
  trips: Trip[];
  today: IsoDate;
  onEdit: (trip: Trip) => void;
  onDelete: (id: string) => void;
};

export function TripList({ trips, today, onEdit, onDelete }: TripListProps) {
  if (trips.length === 0) {
    return <p data-testid="trip-empty">No trips yet.</p>;
  }

  const ordered = [...trips].sort((a, b) => a.entry.localeCompare(b.entry) || a.id.localeCompare(b.id));

  return (
    <ul data-testid="trip-list" className="space-y-2">
      {ordered.map((trip) => {
        const length = stayLength(trip, today);
        return (
          <li key={trip.id} data-testid="trip-row" data-trip-id={trip.id} className="border p-2">
            <p>
              <span data-testid="trip-entry-display">{trip.entry}</span>
              {" to "}
              <span data-testid="trip-exit-display">{trip.exit ?? "still there"}</span>
              {length !== null ? ` (${length} ${length === 1 ? "day" : "days"})` : ""}
            </p>
            <div className="mt-2 flex gap-2">
              <button type="button" data-testid="trip-edit" onClick={() => onEdit(trip)} className="border px-2 py-1">
                Edit
              </button>
              <button type="button" data-testid="trip-delete" onClick={() => onDelete(trip.id)} className="border px-2 py-1">
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
