import { defineConfig } from "vitest/config";

// The stored Commission output in src/lib/schengen/deep was produced in UTC.
// Workers inherit this; the clock-change test sets its own TZ for its child run.
if (process.env.DEEP_TZ_CHILD !== "1") process.env.TZ = "UTC";

export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
