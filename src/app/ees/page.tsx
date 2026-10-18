import type { Metadata } from "next";
import { Suspense } from "react";
import { EesPanel } from "@/components/EesPanel";

export const metadata: Metadata = { title: "EES check — compare your days with the border's count" };

export default function EesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-page space-y-4 px-5 py-16"><div className="skeleton h-10 w-2/3 rounded-2xl" /><div className="skeleton h-80 rounded-3xl" /><p className="sr-only">Loading…</p></div>}>
      <EesPanel />
    </Suspense>
  );
}
