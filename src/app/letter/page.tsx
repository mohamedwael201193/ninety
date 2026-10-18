import { Suspense } from "react";
import { LetterPanel } from "@/components/LetterPanel";

export default function LetterPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-4 py-6">Loading…</main>}>
      <LetterPanel />
    </Suspense>
  );
}
