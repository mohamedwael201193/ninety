// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

afterEach(() => { cleanup(); window.sessionStorage.clear(); window.localStorage.clear(); });

let query = "";
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(query) }));
vi.mock("./tools/ToolShell", () => ({
  ToolShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
  FieldBlock: ({ children, label, id }: { children: React.ReactNode; label: string; id: string }) => (
    <div><label htmlFor={id}>{label}</label>{children}</div>
  ),
}));
vi.mock("./fx/NumberTicker", () => ({ NumberTicker: ({ value }: { value: number }) => <span>{value}</span> }));

import { EesPanel } from "./EesPanel";
import { LetterPanel } from "./LetterPanel";

// Manual QA: the "Draft the Article 52 correction letter" link opened /letter with the EES fields empty.
describe("/ees → /letter", () => {
  it("carries the EES days and records into the letter form", async () => {
    query = "scenario=near-limit";
    render(<EesPanel />);
    fireEvent.change(screen.getByTestId("ees-days-used"), { target: { value: "95" } });
    fireEvent.change(screen.getByTestId("ees-records"), { target: { value: "2026-01-02 2026-03-31" } });
    fireEvent.click(screen.getByTestId("ees-compare"));
    await screen.findByTestId("ees-traveller-days");
    cleanup();
    render(<LetterPanel />);
    expect((screen.getByTestId("letter-ees-days") as HTMLInputElement).value).toBe("95");
    expect((screen.getByTestId("letter-records") as HTMLTextAreaElement).value).toBe("2026-01-02 2026-03-31");
  });

  it("finding chips lead with words and show the code after them (manual QA: a raw 'figure-differs' chip; TS13 reads the code)", async () => {
    query = "scenario=near-limit";
    render(<EesPanel />);
    fireEvent.change(screen.getByTestId("ees-days-used"), { target: { value: "95" } });
    fireEvent.click(screen.getByTestId("ees-compare"));
    await screen.findByTestId("ees-traveller-days");
    const chips = screen.getAllByTestId("ees-code");
    expect(chips.length).toBeGreaterThan(0);
    for (const chip of chips) {
      const code = chip.getAttribute("data-code") ?? "";
      expect(chip.textContent).toMatch(new RegExp(`^[A-Z][^·]+ · ${code}$`));
      expect(chip.querySelector("[data-testid=ees-code-id]")?.textContent).toBe(code);
    }
  });
});
