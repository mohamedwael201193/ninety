import type { Metadata } from "next";
import { ProofMatrix } from "@/components/ProofMatrix";

export const metadata: Metadata = {
  title: "Proof: every rule and the tests that guard it",
  description: "Each 90/180, EES and Article 52 rule Ninety implements, with its engine test, its Commission parity scenario and its TestSprite end-to-end test.",
};

export default function ProofPage() {
  return <ProofMatrix />;
}
