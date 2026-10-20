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

type Ref = { id: string; latest: { verdict: string } | null };

/**
 * The /proof headline: distinct TestSprite tests named by the rules, how many have a latest
 * cloud run, how many of those passed, and which have not run yet (so they are not counted as failing).
 */
export function proofSummary(rules: { testsprite: Ref[] }[]): { tests: number; ran: number; passed: number; notRun: string[] } {
  const byId = new Map<string, Ref["latest"]>();
  for (const rule of rules) for (const ref of rule.testsprite) byId.set(ref.id, ref.latest);
  const ran = [...byId.values()].filter((l) => l !== null);
  return {
    tests: byId.size,
    ran: ran.length,
    passed: ran.filter((l) => l?.verdict === "passed").length,
    notRun: [...byId].filter(([, l]) => l === null).map(([id]) => id),
  };
}

/** The whole cloud suite, from `suite` in proof.json: passed out of the tests that ran, and the ones not run yet. */
export function suiteSummary(suite: Ref[]): { tests: number; ran: number; passed: number; notRun: string[] } {
  return proofSummary([{ testsprite: suite }]);
}
