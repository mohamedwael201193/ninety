import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site/meta";
import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { LetterPanel } from "@/components/LetterPanel";

export const metadata: Metadata = pageMetadata("/letter");

export default function LetterPage() {
  return (
    <Suspense fallback={<PageShell title={"Your correction request, written for you."} lead={"An Article 52 request (Regulation (EU) 2017/2226) to rectify your EES record, drafted in your words with the two counts and the differing days."} fields={["Full name", "Date of birth", "Country of nationality", "Travel document number", "Member State", "EES days used"]} />}>
      <LetterPanel />
    </Suspense>
  );
}
