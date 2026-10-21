// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { TripEditor } from "./TripEditor";

afterEach(cleanup);

async function submit() {
  await act(async () => {
    fireEvent.click(screen.getByTestId("trip-save"));
    await new Promise((r) => setTimeout(r, 50));
  });
}
/** Set a value the way autofill or a script does: no input or change event. */
function setSilently(testId: string, value: string) {
  (screen.getByTestId(testId) as HTMLInputElement).value = value;
}

describe("TripEditor", () => {
  it("says \"Save trip\" when adding and when editing (manual QA: \"Save changes\" in one, \"Save trip\" in the other)", () => {
    render(<TripEditor initial={null} onSave={() => {}} onCancel={() => {}} />);
    expect(screen.getByTestId("trip-save").textContent).toBe("Save trip");
    cleanup();
    render(<TripEditor initial={{ id: "a", entry: "2026-10-01", exit: "2026-10-05" }} onSave={() => {}} onCancel={() => {}} />);
    expect(screen.getByTestId("trip-save").textContent).toBe("Save trip");
  });

  it("saves an open stay entered by typing", async () => {
    const onSave = vi.fn();
    render(<TripEditor initial={null} onSave={onSave} onCancel={() => {}} />);
    fireEvent.input(screen.getByTestId("trip-entry"), { target: { value: "2026-10-01" } });
    fireEvent.click(screen.getByTestId("trip-open"));
    await submit();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ entry: "2026-10-01", exit: null }));
  });

  it("saves values set without a change event", async () => {
    const onSave = vi.fn();
    render(<TripEditor initial={null} onSave={onSave} onCancel={() => {}} />);
    setSilently("trip-entry", "2026-09-01");
    setSilently("trip-exit", "2026-09-10");
    await submit();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ entry: "2026-09-01", exit: "2026-09-10" }));
  });

  it("ignores whatever is in the exit field once the stay is marked open", async () => {
    const onSave = vi.fn();
    render(<TripEditor initial={null} onSave={onSave} onCancel={() => {}} />);
    setSilently("trip-entry", "2026-10-01");
    fireEvent.click(screen.getByTestId("trip-open"));
    setSilently("trip-exit", "not a date");
    await submit();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ entry: "2026-10-01", exit: null }));
  });

  it("still refuses an exit before the entry", async () => {
    const onSave = vi.fn();
    render(<TripEditor initial={null} onSave={onSave} onCancel={() => {}} />);
    setSilently("trip-entry", "2026-09-10");
    setSilently("trip-exit", "2026-09-01");
    await submit();
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByTestId("trip-form-error").textContent).toContain("before the entry");
  });
});
