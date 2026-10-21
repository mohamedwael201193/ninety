import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site/meta";
import { ParityPanel } from "@/components/ParityPanel";
import { deepParityView } from "@/lib/schengen/deep/view";
import { storedParityReport } from "@/lib/schengen/parity-live";

export const metadata: Metadata = pageMetadata("/parity");

export default function ParityPage() {
  return <ParityPanel deep={deepParityView()} initial={storedParityReport()} />;
}
