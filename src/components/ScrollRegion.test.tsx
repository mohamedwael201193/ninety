// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ScrollRegion } from "./ScrollRegion";
import { ProofMatrix } from "./ProofMatrix";

vi.mock("./tools/ToolShell", () => ({ ToolShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));

afterEach(cleanup);

describe("ScrollRegion", () => {
  it("is a named, keyboard-focusable region", () => {
    render(<ScrollRegion label="Wide table"><table /></ScrollRegion>);
    const region = screen.getByRole("region", { name: "Wide table" });
    expect(region.tabIndex).toBe(0);
    expect(region.className).toContain("overflow-x-auto");
  });
  it("wraps the /proof table", () => {
    render(<ProofMatrix />);
    const region = screen.getByRole("region", { name: "Rule-to-test matrix" });
    expect(region.querySelector('[data-testid="proof-table"]')).not.toBeNull();
  });
});
