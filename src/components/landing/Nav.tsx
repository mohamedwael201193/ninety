"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SectionLink } from "./SectionLink";
import { CarryLink } from "../CarryLink";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** aria-current for the page a link points at, so the current page is announced and styled. */
function current(pathname: string | null, href: string) {
  return pathname === href ? ({ "aria-current": "page" } as const) : {};
}

const LINK = "hover:text-ink aria-[current=page]:font-medium aria-[current=page]:text-ink";

export default function Nav() {
  const { scrollY } = useScroll();
  const pathname = usePathname();
  // When the phone row is wider than the screen, fade its right edge so the cut-off link reads as
  // "scroll for more" rather than a clipped word (at 384px "Proof" used to show as "Pr").
  const row = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const check = () => setMore(el.scrollWidth - el.clientWidth - el.scrollLeft > 2);
    check();
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    // The row's own size changes on rotation, breakpoint changes and font loading, often without a
    // window resize event reaching us after layout; observe the row and its links directly.
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => check()) : null;
    ro?.observe(el);
    [...el.children].forEach((c) => ro?.observe(c));
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
      ro?.disconnect();
    };
  }, []);
  const border = useTransform(scrollY, [0, 40], ["rgba(26,25,25,0)", "rgba(26,25,25,0.1)"]);
  return (
    <motion.header style={{ borderColor: border }} className="sticky top-0 z-40 border-b bg-paper/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-x-4 px-5 py-3 md:h-16 md:flex-nowrap md:px-8 md:py-0" aria-label="Main">
        <Link href="/" className="flex items-center gap-1.5 font-display text-xl font-semibold tracking-tight">
          ninety<span className="h-2.5 w-2.5 rounded-full bg-solar" aria-hidden />
        </Link>
        {/* On phones the links sit on their own scrollable row under the logo, so the EES check, the letter and the proof are one tap away. */}
        <div ref={row} data-testid="nav-links" data-more={more ? "true" : "false"} className="order-last -mx-1 flex w-full items-center gap-5 overflow-x-auto px-1 pr-6 pt-2 data-[more=true]:[mask-image:linear-gradient(to_right,#000_calc(100%-2.5rem),transparent)] md:pr-0 md:data-[more=true]:[mask-image:none] text-sm whitespace-nowrap text-ink-hushed md:order-none md:mx-0 md:w-auto md:gap-8 md:overflow-visible md:px-0 md:pt-0">
          <SectionLink hash="#check" className={LINK}>Check</SectionLink>
          <SectionLink hash="#planned-heading" className={LINK}>Plan</SectionLink>
          <CarryLink href="/ees" data-testid="nav-ees" className={LINK} {...current(pathname, "/ees")}>EES check</CarryLink>
          <CarryLink href="/letter" data-testid="nav-letter" className={LINK} {...current(pathname, "/letter")}>Letter</CarryLink>
          <Link href="/parity" data-testid="nav-parity" className={LINK} {...current(pathname, "/parity")}>Parity</Link>
          <Link href="/proof" data-testid="nav-proof" className={LINK} {...current(pathname, "/proof")}>Proof</Link>
          <Link href="/developers" data-testid="nav-developers" className={LINK} {...current(pathname, "/developers")}>API</Link>
        </div>
        <SectionLink hash="#check" className="btn btn-primary !min-h-9 px-4 text-sm">Check my days</SectionLink>
      </nav>
    </motion.header>
  );
}
