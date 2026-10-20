import { describe, expect, it } from "vitest";
import { validateLetterForm, type LetterForm } from "./validate";

const filled: LetterForm = {
  fullName: "Jane Traveller", dateOfBirth: "1990-05-04", nationality: "Egypt", documentNumber: "A1234567",
  email: "jane@example.com", memberState: "France", daysUsed: "90",
};

describe("validateLetterForm", () => {
  it("passes a complete form", () => {
    expect(validateLetterForm(filled)).toEqual({});
  });

  it("names every missing field, in form order, with its own message", () => {
    const errors = validateLetterForm({ ...filled, fullName: " ", documentNumber: "", daysUsed: "" });
    expect(Object.keys(errors)).toEqual(["fullName", "documentNumber", "daysUsed"]);
    expect(errors.fullName).toBe("Enter your full name as it appears in your travel document.");
    expect(errors.documentNumber).toBe("Enter your travel document number.");
    expect(errors.daysUsed).toBe("Enter the days-used figure the EES shows.");
  });

  it("checks formats, not just presence", () => {
    const errors = validateLetterForm({ ...filled, dateOfBirth: "04/05/1990", email: "jane@", daysUsed: "ninety" });
    expect(errors).toEqual({
      dateOfBirth: "Use YYYY-MM-DD, for example 1990-05-04.",
      email: "Enter a full address, for example jane@example.com.",
      daysUsed: "Enter the EES figure as a whole number.",
    });
  });

  it("blocks an empty form on all seven fields", () => {
    const empty = Object.fromEntries(Object.keys(filled).map((k) => [k, ""])) as LetterForm;
    expect(Object.keys(validateLetterForm(empty))).toHaveLength(7);
  });
});
