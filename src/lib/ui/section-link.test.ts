import { describe, expect, it } from "vitest";
import { sectionHref } from "./section-link";

describe("sectionHref", () => {
  it("keeps the query on the home page", () => {
    expect(sectionHref("#check", { pathname: "/", search: "?scenario=open-stay" })).toBe("/?scenario=open-stay#check");
    expect(sectionHref("planned-heading", { pathname: "/", search: "" })).toBe("/#planned-heading");
  });
  it("goes to the home page from elsewhere", () => {
    expect(sectionHref("#check", { pathname: "/ees", search: "?x=1" })).toBe("/#check");
  });
});
