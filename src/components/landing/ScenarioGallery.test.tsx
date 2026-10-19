// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import ScenarioGallery from "./ScenarioGallery";

afterEach(cleanup);

describe("ScenarioGallery", () => {
  it("renders six cards, each with a working link and at least one guard badge", () => {
    render(<ScenarioGallery />);
    const cards = screen.getAllByTestId("scenario-card");
    expect(cards.map((c) => c.getAttribute("data-scenario"))).toEqual(["open-stay", "near-limit", "overstay", "same-day", "cutoff-span", "cutoff-mixed"]);
    for (const card of cards) {
      expect(card.querySelectorAll('[data-testid="scenario-guard"]').length).toBeGreaterThan(0);
      expect(card.querySelector('[data-testid="scenario-open"]')?.getAttribute("href")).toContain(`scenario=${card.getAttribute("data-scenario")}`);
    }
  });
  it("shows the overstay in days on the overstay card", () => {
    render(<ScenarioGallery />);
    const card = screen.getAllByTestId("scenario-card").find((c) => c.getAttribute("data-scenario") === "overstay")!;
    expect(card.textContent).toContain("17 days over");
    expect(card.querySelector('[data-ts="TS27"]')?.textContent).toContain("guarded by TS27");
  });
});
