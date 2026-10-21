import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ParityPage from "./page";

// Manual QA: /parity showed only "Checking the Commission calculator…" for 6-14 s. The stored-copy
// result is now in the first HTML, labelled as the stored copy while the live check runs.
describe("/parity first render", () => {
  const html = renderToStaticMarkup(<ParityPage />);
  it("already shows 14/14 and the 14 rows (what TS02 reads)", () => {
    expect(html).toContain("14/14 match");
    expect(html.match(/data-testid="parity-row"/g)?.length).toBe(14);
    expect(html).not.toContain('data-testid="parity-pending"');
  });
  it("says it is the stored copy and that the live page is being checked, not that it was fetched live", () => {
    expect(html).toContain("Stored official copy (checking the live page now…)");
    expect(html).toContain("The live Commission page is being checked now.");
    expect(html).not.toMatch(/fetched live from the Commission site when this page opens/);
  });
});
