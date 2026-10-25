import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("docs/DEFECTS.md", () => {
  it("has one ledger row per red-then-green PR and names the 7 bugs", () => {
    const md = readFileSync("docs/DEFECTS.md", "utf8");
    const its = (JSON.parse(readFileSync("src/data/loop-iterations.json", "utf8")).iterations as { pr: number; redThenGreen: boolean }[]).filter((i) => i.redThenGreen);
    const ledger = md.split("## Ledger")[1].split("\n").filter((l) => l.startsWith("| [#"));
    expect(ledger.map((l) => Number(/\[#(\d+)\]/.exec(l)![1]))).toEqual(its.map((i) => i.pr));
    const bugs = md.split("## The 7 real app bugs")[1].split("## ")[0].split("\n").filter((l) => /^\| \d+ \|/.test(l));
    expect(bugs).toHaveLength(7);
  });
});
