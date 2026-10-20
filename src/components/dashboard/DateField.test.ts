import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DateField } from "./DateField";

const render = (props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(DateField, { id: "trip-entry", testId: "trip-entry", label: "Entered", ...props }));

describe("DateField aria-describedby", () => {
  it("does not point at a shared message while the field is valid", () => {
    expect(render({ "aria-describedby": "trip-form-error" })).not.toContain("aria-describedby");
  });
  it("points at the shared message once the field is invalid", () => {
    expect(render({ "aria-describedby": "trip-form-error", error: "" })).toContain('aria-describedby="trip-form-error"');
  });
  it("includes its own error id when it has a message", () => {
    expect(render({ error: "Bad date" })).toContain('aria-describedby="trip-entry-error"');
  });
});
