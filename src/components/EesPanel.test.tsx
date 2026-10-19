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
vi.mock("./fx/NumberTicker", () => ({ NumberTicker: ({ value }: { value: number }) => <span>{value}</span> }));

import { EesPanel } from "./EesPanel";

async function compareWith(figure: string) {
  fireEvent.change(screen.getByTestId("ees-days-used"), { target: { value: figure } });
  fireEvent.click(screen.getByTestId("ees-compare"));
  return (await screen.findByTestId("ees-traveller-days")).textContent;
}

describe("EesPanel with ?scenario=", () => {
  it("compares the scenario's history, not the (empty) saved trips", async () => {
    window.localStorage.clear();
    query = "scenario=near-limit";
    render(<EesPanel />);
    expect((await screen.findByTestId("scenario-banner")).getAttribute("data-scenario")).toBe("near-limit");
    expect(await compareWith("90")).toContain("88");
  });

  it("uses the saved trips when no scenario is open", async () => {
    window.localStorage.clear();
    query = "today=2026-10-19";
    render(<EesPanel />);
    expect(screen.queryByTestId("scenario-banner")).toBeNull();
    expect(await compareWith("90")).toContain("0");
  });
});
