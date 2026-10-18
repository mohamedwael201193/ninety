"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

/** Bottom sheet on mobile, centered dialog on md+. Esc / backdrop close, focus restored on close. */
export function Sheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("button,input,[href],[tabindex]:not([tabindex='-1'])");
        const list = [...f].filter((el) => !el.hasAttribute("disabled"));
        if (!list.length) return;
        const first = list[0], last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      returnTo.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <motion.div className="absolute inset-0 bg-ink/40" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            data-testid="trip-sheet"
            className="relative w-full max-w-lg rounded-t-3xl bg-paper p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-pop md:rounded-3xl md:p-8"
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line md:hidden" aria-hidden="true" />
            <div className="mb-5 flex items-center justify-between">
              <h2 id="sheet-title" className="font-display text-2xl font-medium tracking-[-0.015em]">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="focus-ring grid size-11 place-items-center rounded-full hover:bg-paper-sunk">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
