// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { phoneFigure } from "./PhoneDemo";

describe("PhoneDemo figure", () => {
  it("never shows a 0 count beside the Safe badge: a dash until the count runs", () => {
    expect(phoneFigure(false, 0)).toBe("–");
    expect(phoneFigure(true, 12)).toBe("12");
    expect(phoneFigure(true, 34)).toBe("34");
  });
});
