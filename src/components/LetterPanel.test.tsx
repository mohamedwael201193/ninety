// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

afterEach(cleanup);

let query = "";
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(query) }));
vi.mock("./tools/ToolShell", () => ({
  ToolShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
  FieldBlock: ({ children, label, id }: { children: React.ReactNode; label: string; id: string }) => (
    <div><label htmlFor={id}>{label}</label>{children}</div>
  ),
}));

import { LetterPanel } from "./LetterPanel";

const type = (id: string, value: string) => fireEvent.change(screen.getByTestId(id), { target: { value } });

describe("LetterPanel", () => {
  it("shows a message on each missing field instead of doing nothing", () => {
    query = "today=2026-10-19";
    render(<LetterPanel />);
    type("letter-name", "Jane Traveller");
    fireEvent.click(screen.getByTestId("letter-generate"));
    expect(screen.queryByTestId("letter-text")).toBeNull();
    expect(screen.getByTestId("letter-error").textContent).toBe("Fix the 6 highlighted fields to draft the letter.");
    expect(screen.queryByTestId("letter-name-error")).toBeNull();
    expect(screen.getByTestId("letter-document-error").textContent).toBe("Enter your travel document number.");
    expect(screen.getByTestId("letter-ees-days-error").textContent).toBe("Enter the days-used figure the EES shows.");
    expect(screen.getByTestId("letter-birth").getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(screen.getByTestId("letter-birth"));
  });

  it("drafts from the open scenario's trips and shows the three figures", () => {
    window.localStorage.clear();
    query = "scenario=near-limit";
    render(<LetterPanel />);
    type("letter-name", "Jane Traveller");
    type("letter-birth", "1990-05-04");
    type("letter-nationality", "Egypt");
    type("letter-document", "A1234567");
    type("letter-email", "jane@example.com");
    type("letter-member-state", "France");
    type("letter-ees-days", "90");
    fireEvent.click(screen.getByTestId("letter-generate"));
    expect(screen.getByTestId("letter-evidence-ours").textContent).toBe("88 days");
    expect(screen.getByTestId("letter-evidence-ees").textContent).toBe("90 days");
    expect(screen.getByTestId("letter-evidence-gap").textContent).toBe("2 days");
    const text = screen.getByTestId("letter-text").textContent ?? "";
    expect(text).toContain("show 88 days in that same period");
    expect(text).toContain("In figures: my dates 88 days; EES 90 days; difference 2 days, the EES counting more.");
  });

  it("names the evidence as an accessible table: date, your dates, EES figure, difference", () => {
    window.localStorage.clear();
    query = "scenario=near-limit";
    render(<LetterPanel />);
    for (const [id, v] of [["letter-name", "Jane Traveller"], ["letter-birth", "1990-05-04"], ["letter-nationality", "Egypt"], ["letter-document", "A1234567"], ["letter-email", "jane@example.com"], ["letter-member-state", "France"], ["letter-ees-days", "90"]]) type(id, v);
    fireEvent.click(screen.getByTestId("letter-generate"));
    const table = screen.getByRole("table", { name: /evidence/i });
    const headers = Array.from(table.querySelectorAll("th[scope=col]")).map((th) => th.textContent);
    expect(headers).toEqual(["Date", "Your dates", "EES figure", "Difference"]);
    const cells = Array.from(table.querySelectorAll("tbody tr > *")).map((c) => c.textContent);
    expect(cells).toEqual(["2026-10-19", "88 days", "90 days", "2 days"]);
    // Every body cell is a plain <td> under its column header: four headers, four cells, read in order.
    expect(table.querySelectorAll("tbody td").length).toBe(4);
  });

  it("?scenario=demo opens the landing demo history, as on /ees", () => {
    window.localStorage.clear();
    query = "scenario=demo";
    render(<LetterPanel />);
    expect(screen.getByTestId("scenario-banner").getAttribute("data-scenario")).toBe("near-limit");
    expect(screen.getByTestId("letter-on").textContent).toBe("2026-10-19");
  });

  it("?scenario=demo prefills the EES side (Member State France, 90 days) so the table shows on one click", () => {
    window.localStorage.clear();
    query = "scenario=demo";
    render(<LetterPanel />);
    expect((screen.getByTestId("letter-member-state") as HTMLInputElement).value).toBe("France");
    expect((screen.getByTestId("letter-ees-days") as HTMLInputElement).value).toBe("90");
  });

  it("a named scenario does not prefill anything", () => {
    window.localStorage.clear();
    query = "scenario=near-limit";
    render(<LetterPanel />);
    expect((screen.getByTestId("letter-ees-days") as HTMLInputElement).value).toBe("");
  });
});
