import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMetadata } from "@/lib/site/meta";
import { AppShell } from "@/components/AppShell";
import { StatusPending } from "@/components/StatusPanel";
import CountBand from "@/components/landing/CountBand";
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
      <Footer />
    </>
  );
}
