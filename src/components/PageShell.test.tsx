import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import EesPage from "@/app/ees/page";
import LetterPage from "@/app/letter/page";

// Without JavaScript the client panels never mount; the server HTML must still say what the page is.
describe("/ees and /letter server HTML", () => {
  it.each([
    ["/ees", EesPage, "Does the border&#x27;s count match yours?", "EES days used"],
    ["/letter", LetterPage, "Your correction request, written for you.", "Travel document number"],
  ])("%s renders a heading, the form fields and a no-JS note, not only Loading…", (_p, Page, title, field) => {
    const html = renderToStaticMarkup(<Page />);
    expect(html).toContain(`<h1`);
    expect(html).toContain(title);
    expect(html).toContain(field);
    expect(html).toContain("needs JavaScript");
    expect(html).not.toMatch(/>Loading…</);
  });
});
