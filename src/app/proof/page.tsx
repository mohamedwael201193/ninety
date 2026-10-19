import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site/meta";
import { ProofMatrix } from "@/components/ProofMatrix";

export const metadata: Metadata = pageMetadata("/proof");

export default function ProofPage() {
  return <ProofMatrix />;
}
