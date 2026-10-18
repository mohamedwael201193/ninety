import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";

export default function HomePage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-4 py-6">Loading…</main>}>
      <AppShell />
    </Suspense>
  );
}
