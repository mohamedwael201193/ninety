import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/landing/Footer";
import Nav from "@/components/landing/Nav";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

const PAGES = [
  { href: "/#check", label: "Check my days", note: "The 90/180 calculator", testId: "not-found-check" },
  { href: "/ees", label: "EES check", note: "Compare the border's count with yours", testId: "not-found-ees" },
  { href: "/letter", label: "Article 52 letter", note: "Ask for a correction", testId: "not-found-letter" },
  { href: "/parity", label: "Parity", note: "Ninety against the Commission calculator", testId: "not-found-parity" },
  { href: "/proof", label: "Proof", note: "Every rule and the tests that check it", testId: "not-found-proof" },
];

export default function NotFound() {
  return (
    <>
      <Nav />
      <main data-testid="not-found" className="bg-paper-warm px-5 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">404</p>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight md:text-5xl">This page is outside the window.</h1>
          <p className="mt-3 text-ink-hushed">The page you asked for does not exist. Your trips are still saved in this browser.</p>
        </div>
        <ul className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          {PAGES.map((page) => (
            <li key={page.href}>
              <Link href={page.href} data-testid={page.testId} className="card-soft block p-5 hover:shadow-lift">
                <span className="font-display text-lg font-medium">{page.label}</span>
                <span className="mt-1 block text-sm text-ink-hushed">{page.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
