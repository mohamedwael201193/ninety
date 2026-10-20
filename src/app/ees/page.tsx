import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site/meta";
import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { EesPanel } from "@/components/EesPanel";

export const metadata: Metadata = pageMetadata("/ees");

export default function EesPage() {
  return (
    <Suspense fallback={<PageShell title={"Does the border's count match yours?"} lead={"Enter the days the EU Entry/Exit System (EES) counts for you, and Ninety lists the exact days that differ from your own trips."} fields={["EES days used", "EES entry and exit records (optional)"]} />}>
      <EesPanel />
    </Suspense>
  );
}
