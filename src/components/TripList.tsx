"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Plane, Trash2 } from "lucide-react";
import { stayLength } from "@/lib/schengen/engine";
import type { IsoDate } from "@/lib/schengen/dates";
import type { Trip } from "@/lib/trips";
import { longDate } from "./dashboard/format";

type TripListProps = {
  trips: Trip[];
  today: IsoDate;
  onEdit: (trip: Trip) => void;
  onDelete: (id: string) => void;
  onAdd?: () => void;
  onExample?: () => void;
};

export function TripList({ trips, today, onEdit, onDelete, onAdd, onExample }: TripListProps) {
  if (trips.length === 0) {
    return (
      <div data-testid="trip-empty" className="rounded-3xl border border-dashed border-line p-8 text-center">
        <Plane className="mx-auto size-8 text-ink-faint" aria-hidden="true" />
        <p className="mt-3 font-display text-xl font-medium">No trips yet.</p>
        <p className="mt-1 text-sm text-ink-hushed">Add your first trip — or try an example.</p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          {onAdd ? (
            <button type="button" onClick={onAdd} className="focus-ring h-12 rounded-full bg-solar px-6 font-medium hover:bg-solar-deep">
              Add a trip
            </button>
          ) : null}
          {onExample ? (
            <button type="button" data-testid="trip-example" onClick={onExample} className="focus-ring h-12 rounded-full px-5 hover:bg-paper-sunk">
              Try an example
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  const ordered = [...trips].sort((a, b) => a.entry.localeCompare(b.entry) || a.id.localeCompare(b.id));

  return (
    <ul data-testid="trip-list" className="divide-y divide-line-soft overflow-hidden rounded-3xl bg-paper shadow-card">
      <AnimatePresence initial={false}>
        {ordered.map((trip) => {
          const length = stayLength(trip, today);
          return (
            <motion.li
              layout
              key={trip.id}
              data-testid="trip-row"
              data-trip-id={trip.id}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -12, transition: { duration: 0.2 } }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm tabular-nums">
                  <time dateTime={trip.entry} aria-label={longDate(trip.entry)} data-testid="trip-entry-display">{trip.entry}</time>
                  <span className="text-ink-faint">{" to "}</span>
                  {trip.exit ? (
                    <time dateTime={trip.exit} aria-label={longDate(trip.exit)} data-testid="trip-exit-display">{trip.exit}</time>
                  ) : (
                    <span data-testid="trip-exit-display">still there</span>
                  )}
                </p>
                {length !== null ? (
                  <p className="text-xs text-ink-hushed">
                    {length} {length === 1 ? "day" : "days"}
                    {trip.exit === null ? <span className="ml-2 rounded-full bg-solar-wash px-2 py-0.5 text-ink">Now</span> : null}
                  </p>
                ) : null}
              </div>
              <button type="button" data-testid="trip-edit" onClick={() => onEdit(trip)} aria-label={`Edit trip from ${trip.entry}`}
                className="focus-ring grid size-11 place-items-center rounded-full hover:bg-paper-sunk">
                <Pencil className="size-4" aria-hidden="true" /><span className="sr-only">Edit</span>
              </button>
              <button type="button" data-testid="trip-delete" onClick={() => onDelete(trip.id)} aria-label={`Delete trip from ${trip.entry}`}
                className="focus-ring grid size-11 place-items-center rounded-full text-risk hover:bg-risk-wash">
                <Trash2 className="size-4" aria-hidden="true" /><span className="sr-only">Delete</span>
              </button>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
