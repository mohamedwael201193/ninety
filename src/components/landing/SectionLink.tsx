"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { sectionHref } from "@/lib/ui/section-link";

/** A link to a home-page section that keeps ?scenario= and ?today= when already on the home page. */
export function SectionLink({ hash, className, children }: { hash: string; className?: string; children: ReactNode }) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (window.location.pathname !== "/") return;
    const target = document.getElementById(hash.replace(/^#/, ""));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", sectionHref(hash, window.location));
  }
  return (
    <Link href={`/${hash.startsWith("#") ? hash : `#${hash}`}`} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
