"use client";

import { useEffect, useState } from "react";

/**
 * Hydration-safe reduced-motion flag. Always `false` on the server and on the
 * first client render, then reads the media query after mount so the first
 * client render matches the server HTML.
 */
export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduce;
}
