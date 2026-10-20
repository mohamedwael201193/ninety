import { describe, expect, it } from "vitest";
import { galleryCards } from "./gallery-model";

describe("scenario gallery cards", () => {
  const cards = Object.fromEntries(galleryCards().map((c) => [c.id, c]));
  it("computes each card's figures with the engine", () => {
    expect([cards["open-stay"].used, cards["open-stay"].left]).toEqual([19, 71]);
    expect([cards["near-limit"].used, cards["near-limit"].left]).toEqual([88, 2]);
    expect([cards.overstay.used, cards.overstay.left, cards.overstay.overstayDays]).toEqual([107, 0, 17]);
    expect(cards["same-day"].used).toBe(12);
    expect(cards["cutoff-span"].used).toBe(20);
    expect(cards["cutoff-mixed"].used).toBe(30);
  });
  it("links calculator scenarios to the calculator and EES scenarios to the EES check", () => {
    expect(cards["near-limit"].href).toBe("/?scenario=near-limit#check");
    expect(cards["cutoff-mixed"].href).toBe("/ees?scenario=cutoff-mixed");
  });

  it("explains a card whose used and left do not add up to 90", () => {
    const cards = Object.fromEntries(galleryCards().map((c) => [c.id, c]));
    expect(cards["same-day"].used).toBe(12);
    expect(cards["same-day"].left).toBe(90);
    expect(cards["same-day"].leftNote).toBe("90 left, not 78: the 12 days already used drop out of the 180-day window by 2026-11-08, before a stay starting on 2026-10-19 would reach day 79, so that stay can last 90 days.");
    expect(cards["near-limit"].leftNote).toBeNull();
  });
});
