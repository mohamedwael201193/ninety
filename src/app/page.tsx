import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMetadata } from "@/lib/site/meta";
import { AppShell } from "@/components/AppShell";
import { StatusPending } from "@/components/StatusPanel";
import CountBand from "@/components/landing/CountBand";
import VerifiedNumbers from "@/components/proof/VerifiedNumbers";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import MismatchLetter from "@/components/landing/MismatchLetter";
import Nav from "@/components/landing/Nav";
import ScenarioGallery from "@/components/landing/ScenarioGallery";
import { SmoothScroll } from "@/components/fx/SmoothScroll";

export const metadata: Metadata = pageMetadata("/");

export default function HomePage() {
  return (
    <>
      {/* Smooth scroll belongs to the landing story only; the tool pages keep native scrolling. */}
      <SmoothScroll />
      <Nav />
      <Hero />
      <CountBand />
      <section id="check" className="scroll-mt-16 bg-paper-warm">
        <Suspense fallback={<div className="mx-auto max-w-[1200px] px-5 pt-6 md:px-8"><StatusPending /></div>}>
          <AppShell />
        </Suspense>
      </section>
      <ScenarioGallery />
      <MismatchLetter />
      <section id="verified" aria-label="Verified numbers" className="bg-paper-warm">
        <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-8">
          <VerifiedNumbers />
          <p className="mt-4 text-sm"><a className="underline underline-offset-4" href="/proof">Every rule and the tests that guard it</a></p>
        </div>
      </section>
      <Footer />
    </>
  );
}
