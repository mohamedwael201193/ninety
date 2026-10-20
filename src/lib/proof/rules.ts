/**
 * The rules Ninety implements, and the tests that guard each one at every layer:
 * an engine unit or property test, a scenario the European Commission calculator
 * also runs (/parity), and a TestSprite end-to-end test in the cloud browser.
 * The data is in src/data/rules.json. `rules.test.ts` fails if any reference there stops existing, so the matrix on /proof cannot rot.
 */
export type TestRef = { file: string; name: string };

export type Rule = {
  id: string;
  rule: string;
  basis: string;
  unit: TestRef[];
  parity: string[];
  testsprite: string[];
};

import data from "@/data/rules.json";

/** Kept as JSON so `scripts/proof-matrix.mjs` can read it without a TypeScript loader. */
export const RULES: Rule[] = data;
