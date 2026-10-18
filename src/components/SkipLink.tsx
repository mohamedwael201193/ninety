"use client";

/** Skip link that actually moves keyboard focus to the main tool on the page. */
export function SkipLink() {
  function skip(event: React.MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById("calculator") ?? document.querySelector<HTMLElement>("main");
    if (!target) return;
    event.preventDefault();
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.scrollIntoView({ block: "start" });
    target.focus({ preventScroll: true });
    if (target.id) history.replaceState(null, "", `#${target.id === "calculator" ? "check" : target.id}`);
  }
  return (
    <a href="#check" data-testid="skip-link" onClick={skip} className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
      Skip to main content
    </a>
  );
}
