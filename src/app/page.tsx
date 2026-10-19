import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import CountBand from "@/components/landing/CountBand";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import MismatchLetter from "@/components/landing/MismatchLetter";
import Nav from "@/components/landing/Nav";
import { SmoothScroll } from "@/components/fx/SmoothScroll";

export default function HomePage() {
  return (
    <>
      {/* Smooth scroll belongs to the landing story only; the tool pages keep native scrolling. */}
      <SmoothScroll />
      <Nav />
      <Hero />
      <CountBand />
      <section id="check" className="scroll-mt-16 bg-paper-warm">
        <Suspense fallback={<div className="mx-auto max-w-page px-5 py-6">Loading…</div>}>
          <AppShell />
        </Suspense>
      </section>
      <MismatchLetter />
      <Footer />
    </>
  );
}
