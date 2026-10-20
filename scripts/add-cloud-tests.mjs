#!/usr/bin/env node
/**
 * Creates TestSprite cloud tests from plan files and records their ids in
 * testsprite_tests/test-ids.json, so the repo and the cloud suite stay in step.
 *
 *   TESTSPRITE_API_KEY=... node scripts/add-cloud-tests.mjs testsprite_tests/plans/TS27-overstay-scenario.json ...
 *
 * A plan already listed in test-ids.json is skipped (its cloud steps are updated
 * with `testsprite test plan put` instead). TESTSPRITE_BIN overrides the CLI path.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

const BIN = process.env.TESTSPRITE_BIN ?? "testsprite";
const IDS = "testsprite_tests/test-ids.json";
const ids = JSON.parse(readFileSync(IDS, "utf8"));

for (const file of process.argv.slice(2)) {
  const key = basename(file, ".json");
  if (ids[key]) {
    console.log(`${key}: already ${ids[key]}, skipped`);
    continue;
  }
  const out = JSON.parse(execFileSync(BIN, ["test", "create", "--plan-from", file, "--output", "json"], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }));
  const id = out.testId ?? out.id;
  if (!id) throw new Error(`${key}: no test id in the CLI output`);
  ids[key] = id;
  writeFileSync(IDS, JSON.stringify(ids, null, 2) + "\n");
  console.log(`${key}: created ${id}`);
}
