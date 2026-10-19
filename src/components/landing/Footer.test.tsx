// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Footer from "./Footer";

afterEach(cleanup);

describe("Footer", () => {
  it("links every tool page, not only parity", () => {
    render(<Footer />);
    expect(screen.getByTestId("footer-ees").getAttribute("href")).toBe("/ees");
    expect(screen.getByTestId("footer-letter").getAttribute("href")).toBe("/letter");
    expect(screen.getByTestId("footer-proof").getAttribute("href")).toBe("/proof");
    expect(screen.getByRole("link", { name: "Try a history" }).getAttribute("href")).toBe("/#scenarios");
  });
  it("credits the author and links the source", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo").textContent).toContain("Built by devmo");
    expect(screen.getByTestId("footer-source").getAttribute("href")).toBe("https://github.com/mohamedwael201193/ninety");
  });
});
