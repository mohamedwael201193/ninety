import { defineConfig, mergeConfig } from "vitest/config";
import base from "./vitest.config";

// Used only by Stryker (stryker.config.mjs): instrumented code runs slower, so the per-test
// timeout is raised; the suites themselves are the normal ones.
export default mergeConfig(base, defineConfig({ test: { testTimeout: 600_000, hookTimeout: 600_000 } }));
