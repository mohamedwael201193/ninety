#!/usr/bin/env node
// Prints the TestSprite run id of every failed test case in a JUnit report,
// one per line, so CI can download each run's failure bundle.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

/** Run ids of <testcase> elements that contain a <failure> or <error>. */
export function failedRunIds(xml) {
  const ids = [];
  for (const match of xml.matchAll(/<testcase\b([^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g)) {
    const body = match[3] ?? "";
    if (!/<(failure|error)\b/.test(body)) continue;
    const run = match[1].match(/\brunId="([^"]+)"/);
    if (run && /^[\w-]+$/.test(run[1])) ids.push(run[1]);
  }
  return [...new Set(ids)];
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  for (const id of failedRunIds(readFileSync(process.argv[2], "utf8"))) console.log(id);
}
