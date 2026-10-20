"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentProps } from "react";
import { carryQuery } from "@/lib/ui/carry-query";

/**
 * A link to another page that keeps `?scenario=` and `?today=`. Reads the query after
 * mount (no useSearchParams), so it works in statically rendered pages without a Suspense boundary.
 */
export function CarryLink({ href, ...rest }: ComponentProps<typeof Link> & { href: string }) {
  const [target, setTarget] = useState(href);
  useEffect(() => {
    const update = () => setTarget(carryQuery(href, window.location.search));
    update();
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, [href]);
  return <Link href={target} {...rest} />;
}
