"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { carryQuery } from "@/lib/ui/carry-query";
import { sectionHref } from "@/lib/ui/section-link";

/** A link to a home-page section that keeps ?scenario= and ?today=, from the home page and from every other page. */
export function SectionLink({ hash, className, children }: { hash: string; className?: string; children: ReactNode }) {
  const fragment = hash.startsWith("#") ? hash : `#${hash}`;
  const [href, setHref] = useState(`/${fragment}`);
  // After mount, carry the shown history (?scenario=, ?today=) like CarryLink does for /ees and /letter.
  useEffect(() => { setHref(`${carryQuery("/", window.location.search)}${fragment}`); }, [fragment]);
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (window.location.pathname !== "/") return;
    const target = document.getElementById(hash.replace(/^#/, ""));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", sectionHref(hash, window.location));
  }
  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
