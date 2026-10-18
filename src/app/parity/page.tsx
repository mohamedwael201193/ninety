import type { Metadata } from "next";
import { ParityPanel } from "@/components/ParityPanel";

export const metadata: Metadata = { title: "Parity with the Commission calculator" };

export default function ParityPage() {
  return <ParityPanel />;
}
