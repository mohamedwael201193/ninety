import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { OPENAPI } from "./openapi";

describe("docs/openapi.json", () => {
  it("is the same document the API serves (regenerate: npm run openapi:write)", () => {
    expect(JSON.parse(readFileSync("docs/openapi.json", "utf8"))).toEqual(JSON.parse(JSON.stringify(OPENAPI)));
  });
});
