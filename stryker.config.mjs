// Mutation testing of the 90/180 engine with StrykerJS: `npm run mutation` (Node 22+).
// Mutates engine.ts and dates.ts and runs the Vitest suites that cover them.
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: "vitest",
  vitest: { configFile: "vitest.stryker.config.ts" },
  mutate: ["src/lib/schengen/engine.ts", "src/lib/schengen/dates.ts"],
  coverageAnalysis: "perTest",
  reporters: ["clear-text", "progress", "html", "json"],
  htmlReporter: { fileName: "reports/mutation/mutation.html" },
  jsonReporter: { fileName: "reports/mutation/mutation.json" },
  thresholds: { high: 92, low: 85, break: null },
  concurrency: 4,
  timeoutMS: 60000,
};
