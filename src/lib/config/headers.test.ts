import { describe, expect, it } from "vitest";
import nextConfig, { SECURITY_HEADERS } from "../../../next.config";

describe("security headers", () => {
  it("apply to every route", async () => {
    const rules = await nextConfig.headers!();
    expect(rules).toEqual([{ source: "/:path*", headers: SECURITY_HEADERS }]);
  });
  it("forbid framing by other sites and send no referrer", () => {
    const get = (key: string) => SECURITY_HEADERS.find((h) => h.key === key)?.value ?? "";
    expect(get("Content-Security-Policy")).toContain("frame-ancestors 'self'");
    expect(get("Content-Security-Policy")).toContain("object-src 'none'");
    expect(get("Referrer-Policy")).toBe("no-referrer");
    expect(get("X-Content-Type-Options")).toBe("nosniff");
  });
});
