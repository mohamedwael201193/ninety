"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE = "button,input,select,textarea,[href],[tabindex]:not([tabindex='-1'])";

/** Bottom sheet on mobile, centered dialog on md+. Esc / backdrop close, focus moves in on open and back on close, page behind is inert. */
export function Sheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  // The latest onClose, so a parent passing a new function each render does not re-run the open effect
  // (which used to try to restore focus while the page was still inert, then lose the opener).
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // While the sheet is open, the rest of the page is inert, so a screen reader
  // cannot wander into the content behind the overlay.
  useEffect(() => {
    if (!open) return;
    const layer = document.getElementById("sheet-layer");
    // The attribute (not the property) so it also works where `inert` is not reflected.
    const others = [...document.body.children].filter((el) => el !== layer && !el.hasAttribute("inert"));
    others.forEach((el) => el.setAttribute("inert", ""));
    return () => others.forEach((el) => el.removeAttribute("inert"));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>(FOCUSABLE);
        const list = [...f].filter((el) => !el.hasAttribute("disabled"));
        if (!list.length) return;
        const first = list[0], last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    // Move focus into the dialog: the first field if there is one, else the close button.
    const frame = requestAnimationFrame(() => {
      const fields = panel.current?.querySelectorAll<HTMLElement>("input,select,textarea");
      (fields?.[0] ?? panel.current?.querySelector<HTMLElement>(FOCUSABLE))?.focus();
    });
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      // Restore focus after this commit, once the inert attribute is off the page.
      const target = returnTo.current;
      returnTo.current = null;
      if (target) queueMicrotask(() => { if (target.isConnected) target.focus(); });
    };
  }, [open]);

  if (!mounted) return null;
  return createPortal(
    <div id="sheet-layer">
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
    </div>,
    document.body,
  );
}
