import { Suspense } from "react";
import { EesPanel } from "@/components/EesPanel";

export default function EesPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-4 py-6">Loading…</main>}>
      <EesPanel />
    </Suspense>
  );
}
