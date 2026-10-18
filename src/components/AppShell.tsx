"use client";

import { MotionConfig } from "framer-motion";
import { Plus, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { addDays, isIsoDate, localToday } from "@/lib/schengen/dates";
import { evaluate } from "@/lib/schengen/engine";
import { findOverlaps, loadTrips, saveTrips, type Trip } from "@/lib/trips";
import { Sheet } from "./dashboard/Sheet";
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
  // undefined = sheet closed, null = adding, Trip = editing
  const [editing, setEditing] = useState<Trip | null | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    setTrips(loadTrips(window.localStorage));
    setReady(true);
  }, []);

  // The mobile summary bar belongs to the dashboard only: show it while the
  // dashboard (#check, or this component's own main on other routes) fills the
  // middle of the screen; hide it above and once the user scrolls past.
  const [barVisible, setBarVisible] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const target = document.getElementById("check") ?? document.getElementById("calculator");
    if (!target) return;
    const io = new IntersectionObserver(([entry]) => setBarVisible(entry.isIntersecting), { rootMargin: "-40% 0px -40% 0px" });
    io.observe(target);
    return () => io.disconnect();
  }, [ready]);

  function persist(next: Trip[]) {
    setTrips(next);
    saveTrips(window.localStorage, next);
  }
  const close = useCallback(() => setEditing(undefined), []);
  function openAdd() {
    setFormKey((k) => k + 1);
    setEditing(null);
  }
  function saveTrip(trip: Trip) {
    const next = trips.some((t) => t.id === trip.id) ? trips.map((t) => (t.id === trip.id ? trip : t)) : [...trips, trip];
    persist(next);
    close();
    if (findOverlaps(next, today).some(([a, b]) => a.id === trip.id || b.id === trip.id)) {
      toast.warning("This trip overlaps another trip. Overlapping days are only counted once — check the dates.");
    }
  }
  function deleteTrip(id: string) {
    const removed = trips.find((t) => t.id === id);
    const index = trips.findIndex((t) => t.id === id);
    persist(trips.filter((t) => t.id !== id));
    if (editing && editing.id === id) close();
    if (removed) {
      toast("Trip deleted", {
        description: `${removed.entry} → ${removed.exit ?? "still in"}`,
        action: {
          label: "Undo",
          onClick: () => {
            const current = loadTrips(window.localStorage);
            if (current.some((t) => t.id === removed.id)) return;
            const restored = [...current];
            restored.splice(Math.min(index, restored.length), 0, removed);
            persist(restored);
          },
        },
      });
    }
  }
  function loadExample() {
    persist([
      { id: crypto.randomUUID(), entry: addDays(today, -150), exit: addDays(today, -131) },
      { id: crypto.randomUUID(), entry: addDays(today, -90), exit: addDays(today, -62) },
      { id: crypto.randomUUID(), entry: addDays(today, -20), exit: addDays(today, -6) },
    ]);
  }

  const overlaps = useMemo(() => findOverlaps(trips, today), [trips, today]);
  const assessment = useMemo(() => evaluate(trips, today, today), [trips, today]);

  return (
    <MotionConfig reducedMotion="user">
      <main
        id="calculator"
        tabIndex={-1}
        data-testid={ready ? "app-ready" : "trips-loading"}
        className="mx-auto min-h-dvh max-w-[1200px] bg-paper-warm px-5 pt-6 pb-28 md:px-8 md:pb-12"
      >
        <header className="mb-8 space-y-2">
          <h2 className="font-display text-3xl leading-[1.05] font-medium tracking-[-0.03em] md:text-5xl">
            How many Schengen days do I really have left?
          </h2>
          <p className="max-w-[640px] text-ink-hushed">
            Rebuilds the 90 days / 180-day count from your trips. Entry day and exit day both count.
            This is a helping tool only; it is not a decision by a border authority.
          </p>
        </header>

        {!ready ? (
          <div aria-busy="true" className="grid gap-6 lg:grid-cols-[1fr_400px]">
            <div className="space-y-6">
              <div className="skeleton h-[420px] rounded-3xl" />
              <div className="skeleton h-[220px] rounded-3xl" />
            </div>
            <div className="space-y-3">
              <div className="skeleton h-11 w-40 rounded-full" />
              <div className="skeleton h-[240px] rounded-3xl" />
            </div>
            <p className="sr-only">Loading trips…</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
            <div className="contents lg:col-start-1 lg:row-start-1 lg:block lg:space-y-6">
              <StatusPanel assessment={assessment} todayOverride={todayOverride} todayInvalid={todayInvalid} trips={trips} />
              <div className="order-3 lg:order-none"><PlannedTripForm history={trips} today={today} /></div>
            </div>

            <section aria-labelledby="trips-heading" className="order-2 space-y-3 lg:order-none lg:sticky lg:top-20 lg:col-start-2 lg:row-start-1 lg:self-start">
              <div className="flex items-center justify-between">
                <h2 id="trips-heading" className="font-display text-2xl font-medium tracking-[-0.015em]">Trips</h2>
                <button type="button" data-testid="trip-add" onClick={openAdd}
                  className="press focus-ring inline-flex h-11 items-center gap-1.5 rounded-full bg-solar px-4 text-sm font-medium hover:bg-solar-deep active:scale-[.98]">
                  <Plus className="size-4" aria-hidden="true" /> Add trip
                </button>
              </div>
              {overlaps.length > 0 ? (
                <p data-testid="trip-overlap-warning" role="alert" className="flex items-start gap-2 rounded-2xl bg-warn-wash p-3 text-sm text-warn">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>
                    {overlaps.length === 1 ? "Two trips overlap" : `${overlaps.length} pairs of trips overlap`}:{" "}
                    {overlaps.map(([a, b]) => `${a.entry} and ${b.entry}`).join("; ")}. Overlapping days count once; fix the dates if this is a typo.
                  </span>
                </p>
              ) : null}
              <TripList trips={trips} today={today} onEdit={setEditing} onDelete={deleteTrip} onAdd={openAdd} onExample={loadExample} />
            </section>

          </div>
        )}


        <footer className="mt-6 text-xs text-ink-hushed">
          Matches the European Commission&apos;s short-stay calculator. Not an official decision. Trips are stored only in this browser.
        </footer>
      </main>

      {ready && barVisible ? (
        <div data-testid="mobile-days-bar" className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-between bg-ink px-5 text-paper md:hidden">
          <span className="tabular-nums"><b className="font-display text-xl">{assessment.daysLeft}</b> days left</span>
          <button type="button" onClick={openAdd} className="press focus-ring h-11 rounded-full bg-solar px-4 text-sm font-medium text-ink">
            Add trip
          </button>
        </div>
      ) : null}

      <Sheet open={editing !== undefined} title={editing ? "Edit trip" : "Add a trip"} onClose={close}>
        <TripEditor key={editing?.id ?? `new-${formKey}`} initial={editing ?? null} onSave={saveTrip} onCancel={close} />
      </Sheet>
    </MotionConfig>
  );
}
