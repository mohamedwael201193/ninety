#!/usr/bin/env node
/**
 * Writes src/data/proof.json: for each rule in src/data/rules.json, the TestSprite
 * test id and its latest cloud result (`testsprite test result <id> --output json`,
 * a read that runs nothing). The /proof page renders this file and shows when it was made.
 *
 *   TESTSPRITE_API_KEY=... node scripts/proof-matrix.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const BIN = process.env.TESTSPRITE_BIN ?? "testsprite";
const rules = JSON.parse(readFileSync("src/data/rules.json", "utf8"));
const ids = JSON.parse(readFileSync("testsprite_tests/test-ids.json", "utf8"));
const byShort = Object.fromEntries(Object.entries(ids).map(([plan, id]) => [plan.split("-")[0], { plan, id }]));

const cache = new Map();
function latest(id) {
  if (!cache.has(id)) {
    // PROOF_ENV=github-pr-70 pins the page to the newest run in that environment (a merged PR's final run),
    // read from the run history; without it, the newest run anywhere.
    const env = process.env.PROOF_ENV;
    const r = env
      ? (() => {
          const h = JSON.parse(execFileSync(BIN, ["test", "result", id, "--history", "--output", "json"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
          const run = h.runs.find((x) => x.environment?.name === env);
          return run ? { ...run, verdict: run.status, runIdIfAvailable: run.runId } : {};
        })()
      : JSON.parse(execFileSync(BIN, ["test", "result", id, "--output", "json"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
    // A test that has never run reports a non-terminal state such as "ready": record it as not run (null),
    // so the page neither counts it as passing nor as failing.
    const ran = r.startedAt && ["passed", "failed", "blocked"].includes(r.verdict);
    cache.set(id, !ran ? null : { verdict: r.verdict ?? r.executionStatus ?? "unknown", at: r.startedAt ?? null, environment: r.environment?.name ?? null, runId: r.runIdIfAvailable ?? r.runId ?? null });
  }
  return cache.get(id);
}

const out = {
  generatedAt: new Date().toISOString(),
  source: "src/data/rules.json + testsprite test result",
  rules: rules.map((rule) => ({
    ...rule,
    testsprite: rule.testsprite.map((short) => {
      const t = byShort[short];
      return t ? { id: short, plan: t.plan, testId: t.id, latest: latest(t.id) } : { id: short, plan: null, testId: null, latest: null };
    }),
  })),
};
// Every test in the cloud suite, including those not tied to a rule (UI, accessibility, navigation).
const planName = (plan) => { try { return JSON.parse(readFileSync(`testsprite_tests/plans/${plan}.json`, "utf8")).name ?? null; } catch { return null; } };
out.suite = Object.entries(ids).map(([plan, id]) => ({ id: plan.split("-")[0], plan, name: planName(plan), testId: id, latest: latest(id) }));
// Which cloud runs the figures come from, so the page can say so (a test that never ran stays null and is not counted).
out.environments = [...new Set([...out.rules.flatMap((r) => r.testsprite), ...out.suite].map((t) => t.latest?.environment).filter(Boolean))];
writeFileSync("src/data/proof.json", JSON.stringify(out, null, 2) + "\n");
const n = out.rules.flatMap((r) => r.testsprite).length;
const passed = out.suite.filter((t) => t.latest?.verdict === "passed").length;
console.log(`${out.rules.length} rules, ${n} TestSprite references, suite ${passed}/${out.suite.length} passed, generated ${out.generatedAt}`);
