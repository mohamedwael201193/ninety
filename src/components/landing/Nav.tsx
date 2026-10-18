"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Nav() {
  const { scrollY } = useScroll();
  const border = useTransform(scrollY, [0, 40], ["rgba(26,25,25,0)", "rgba(26,25,25,0.1)"]);
  return (
    <motion.header style={{ borderColor: border }} className="sticky top-0 z-40 border-b bg-paper/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-page items-center justify-between px-5 md:px-8" aria-label="Main">
        <Link href="/" className="flex items-center gap-1.5 font-display text-xl font-semibold tracking-tight">
          ninety<span className="h-2.5 w-2.5 rounded-full bg-solar" aria-hidden />
        </Link>
        <div className="hidden items-center gap-8 text-sm text-ink-hushed md:flex">
          <Link href="/#check" className="hover:text-ink">Check</Link>
          <Link href="/#planned-heading" className="hover:text-ink">Plan</Link>
          <Link href="/ees" className="hover:text-ink">EES check</Link>
          <Link href="/letter" className="hover:text-ink">Letter</Link>
          <Link href="/parity" className="hover:text-ink">Parity</Link>
        </div>
        <Link href="/#check" className="btn btn-primary !min-h-9 px-4 text-sm">Check my days</Link>
      </nav>
    </motion.header>
  );
}
