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
});
