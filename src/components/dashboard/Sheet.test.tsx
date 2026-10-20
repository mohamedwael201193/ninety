// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { Sheet } from "./Sheet";

window.matchMedia ??= ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })) as unknown as typeof window.matchMedia;

afterEach(cleanup);

function Page() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <section id="calculator"><button type="button" onClick={() => setOpen(true)}>Add trip</button></section>
      <Sheet open={open} title="Add a trip" onClose={() => setOpen(false)}>
        <label htmlFor="entry">Entry</label><input id="entry" />
      </Sheet>
    </>
  );
}

const nextFrame = () => act(() => new Promise((r) => requestAnimationFrame(() => r(undefined))));

describe("Sheet", () => {
  it("makes the page behind inert while open and restores it on Escape", async () => {
    render(<Page />);
    const opener = screen.getByRole("button", { name: "Add trip" });
    opener.focus();
    fireEvent.click(opener);
    expect(screen.getByRole("dialog", { name: "Add a trip" })).toBeTruthy();
    expect(document.getElementById("calculator")!.closest("[inert]")).not.toBeNull();
    expect(screen.getByRole("dialog").closest("[inert]")).toBeNull();
    fireEvent.keyDown(document, { key: "Escape" });
    // The exit animation keeps the panel briefly; the page is released at once.
    expect(document.querySelector("[inert]")).toBeNull();
    expect(document.activeElement).toBe(opener);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
  it("moves focus to the first field when it opens", async () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Add trip" }));
    await nextFrame();
    expect(document.activeElement).toBe(screen.getByLabelText("Entry"));
  });

  it("returns focus to the opener on Escape even after the page re-renders while the sheet is open", async () => {
    function Busy() {
      const [open, setOpen] = useState(false);
      const [, setTick] = useState(0);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Add trip</button>
          <button type="button" onClick={() => setTick((t) => t + 1)}>tick</button>
          {/* A new onClose on every render, as a parent component easily passes. */}
          <Sheet open={open} title="Add a trip" onClose={() => setOpen(false)}>
            <label htmlFor="entry2">Entry</label><input id="entry2" onChange={() => setTick((t) => t + 1)} />
          </Sheet>
        </>
      );
    }
    render(<Busy />);
    const opener = screen.getByRole("button", { name: "Add trip" });
    opener.focus();
    fireEvent.click(opener);
    await nextFrame();
    const field = screen.getByLabelText("Entry");
    expect(document.activeElement).toBe(field);
    // Real browsers refuse focus() on an element inside an inert page, so a focus attempt while the
    // sheet is still open is lost and leaves focus on <body> after close. Count the attempts.
    let attempts = 0;
    const focus = opener.focus.bind(opener);
    opener.focus = (opts?: FocusOptions) => { attempts += 1; focus(opts); };
    fireEvent.change(field, { target: { value: "2026-10-01" } }); // parent re-renders while open
    expect(attempts).toBe(0);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(attempts).toBe(1);
    expect(document.activeElement).toBe(opener);
  });
});
