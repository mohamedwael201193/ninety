"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { isIsoDate, localToday } from "@/lib/schengen/dates";
import { evaluate } from "@/lib/schengen/engine";
import { loadTrips, saveTrips, type Trip } from "@/lib/trips";
import { PlannedTripForm } from "./PlannedTripForm";
import { StatusPanel } from "./StatusPanel";
import { TripEditor } from "./TripEditor";
import { TripList } from "./TripList";

export function AppShell() {
  const params = useSearchParams();
  const rawToday = params.get("today");
  const todayInvalid = rawToday !== null && !isIsoDate(rawToday);
  const today = rawToday && isIsoDate(rawToday) ? rawToday : localToday();
  const todayOverride = rawToday !== null && isIsoDate(rawToday);

  const [ready, setReady] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    setTrips(loadTrips(window.localStorage));
    setReady(true);
  }, []);

  function persist(next: Trip[]) {
    setTrips(next);
    saveTrips(window.localStorage, next);
  }

  function saveTrip(trip: Trip) {
    const next = trips.some((item) => item.id === trip.id)
      ? trips.map((item) => (item.id === trip.id ? trip : item))
      : [...trips, trip];
    persist(next);
    setEditing(null);
    setFormKey((value) => value + 1);
  }

  function deleteTrip(id: string) {
    persist(trips.filter((trip) => trip.id !== id));
    if (editing?.id === id) setEditing(null);
  }

  const assessment = useMemo(
    () => evaluate(trips, today, today),
    [trips, today],
  );

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-6" data-testid={ready ? "app-ready" : "trips-loading"}>
      <header className="space-y-2">
        <p className="text-sm">Ninety</p>
        <h1>How many Schengen days do I really have left?</h1>
        <p>
          Rebuilds the 90 days / 180-day count from your trips. Entry day and exit day both count.
          This is a helping tool only; it is not a decision by a border authority.
        </p>
        <p>
          <Link href="/parity" data-testid="nav-parity">
            Calculator parity
          </Link>
          {" · "}
          <Link href="/ees" data-testid="nav-ees">
            EES reconciliation
          </Link>
          {" · "}
          <Link href="/letter" data-testid="nav-letter">
            Article 52 letter
          </Link>
        </p>
      </header>

      {!ready ? <p>Loading trips…</p> : null}

      <StatusPanel assessment={assessment} todayOverride={todayOverride} todayInvalid={todayInvalid} />

      <section aria-labelledby="trips-heading" className="space-y-3">
        <h2 id="trips-heading">{editing ? "Edit trip" : "Trips"}</h2>
        {ready ? (
          <TripEditor
            key={editing?.id ?? `new-${formKey}`}
            initial={editing}
            onSave={saveTrip}
            onCancel={() => setEditing(null)}
          />
        ) : null}
        <TripList trips={trips} today={today} onEdit={setEditing} onDelete={deleteTrip} />
      </section>

      <PlannedTripForm history={trips} today={today} />
    </main>
  );
}
