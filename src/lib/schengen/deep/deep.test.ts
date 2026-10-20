import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { nextLegalEntry } from "../engine";
import { runCommissionDetailed } from "../commission-reference";
import { VENDORED_HTML, VENDORED_SHA256 } from "../vendor/commission-calculator";
import { fetchCommissionCalculator } from "../commission-reference";
import { tally } from "./compare";
import { executeScenario, judgeStored, type StoredOracle } from "./execute";
import { DEEP_SCENARIOS, DEEP_SEED, LIVE_SAMPLE_IDS, lastSunday } from "./scenarios";
import { deepParityView, liveSampleFromHtml } from "./view";

const FIXTURE_PATH = new URL("./oracle-output.json", import.meta.url);

function storedOnly(row: { id: string } & StoredOracle): StoredOracle {
  return {
    control: row.control,
    planning: row.planning,
    stayDays: row.stayDays,
    ...(row.notRun ? { notRun: row.notRun } : {}),
  };
}

type OracleFile = {
  seed: number;
  sourceSha256: string;
  timezone: string;
  cases: ({ id: string } & StoredOracle)[];
};

function freshFile(): OracleFile {
  return {
    seed: DEEP_SEED,
    sourceSha256: VENDORED_SHA256,
    timezone: "UTC",
    cases: DEEP_SCENARIOS.map((scenario) => {
      const { stored } = executeScenario(VENDORED_HTML, scenario);
      return { id: scenario.id, ...stored };
    }),
  };
}

const QUIRKS = ["kom-overstay-3", "outside-unsorted", "overlap-overstay-two-trips"];
const OUTSIDE = [
  "kom-1-4",
  "kom-inconsistance-1",
  "overlap-second-and-third",
  "overlap-all-three-rows",
  "refusal-second-trip-reversed",
  "outside-before-22-apr-2013",
  "outside-exit-after-control",
  "outside-control-during-a-stay",
  "outside-51-stays",
  "outside-future-open-stay",
];

describe("deep parity against the Commission calculator", () => {
  it("uses the EU clock-change Sundays", () => {
    expect(lastSunday(2024, 3)).toBe("2024-03-31");
    expect(lastSunday(2026, 3)).toBe("2026-03-29");
    expect(lastSunday(2024, 10)).toBe("2024-10-27");
    expect(lastSunday(2026, 10)).toBe("2026-10-25");
  });

  it("matches the script on every in-domain field except one documented quirk", () => {
    expect(new Date().getTimezoneOffset(), "the stored oracle was produced in UTC").toBe(0);
    const produced = freshFile();
    if (process.env.WRITE_ORACLE === "1") {
      writeFileSync(FIXTURE_PATH, `${JSON.stringify(produced)}\n`);
    }
    const saved = JSON.parse(readFileSync(FIXTURE_PATH, "utf8")) as OracleFile;
    expect(saved.sourceSha256).toBe(VENDORED_SHA256);
    expect(saved.seed).toBe(DEEP_SEED);
    expect(saved.cases.map((row) => row.id)).toEqual(produced.cases.map((row) => row.id));
    expect(saved.cases).toEqual(produced.cases);

    const byId = new Map(saved.cases.map((row) => [row.id, row]));
    const comparisons = DEEP_SCENARIOS.map((scenario) => judgeStored(scenario, byId.get(scenario.id)!));
    const summary = tally(comparisons);
    expect(summary.ourBugs, JSON.stringify(summary.ourBugs, null, 2)).toEqual([]);
    expect(summary.quirks.map((row) => row.id).sort()).toEqual([...QUIRKS].sort());
    expect(summary.outside.map((row) => row.id).sort()).toEqual([...OUTSIDE].sort());
    expect(summary.headline).toBe("399/400 scenarios match the Commission calculator on every field");
    expect(summary.total).toBe(DEEP_SCENARIOS.length);
    expect(summary.byGroup.find((group) => group.group === "existing-14")).toMatchObject({ inDomain: 14, matched: 14 });
    expect(summary.byGroup.find((group) => group.group === "random")?.inDomain).toBe(240);

    for (const id of LIVE_SAMPLE_IDS) {
      expect(byId.has(id), id).toBe(true);
    }

    const view = deepParityView();
    expect(view.headline).toBe(summary.headline);
    expect(view.matched).toBe(399);
    expect(view.inDomain).toBe(400);
    expect(view.total).toBe(412);
    expect(view.ourBugs).toBe(0);
    expect(view.disagreements.map((row) => row.id).sort()).toEqual([...QUIRKS, ...OUTSIDE].sort());
    expect(view.disagreements.find((row) => row.id === "overlap-overstay-two-trips")?.diffs[0]?.field).toBe("overstay count");
  }, 120_000);

  it("does not score a page that is not the calculator", () => {
    expect(() => liveSampleFromHtml("<html><script>var x = 1;</script></html>")).toThrow(/does not contain/);
  });

  it("sorting Overstay 3 still cannot calculate the stay before 22 April 2013", () => {
    const scenario = DEEP_SCENARIOS.find((row) => row.id === "kom-overstay-3");
    expect(scenario).toBeDefined();
    const run = runCommissionDetailed(VENDORED_HTML, scenario!.stays, scenario!.on, { confirmSort: true });
    expect(run.control).toContain("Calculation of stay is not possible");
    expect(run.planning).toContain("Calculation of stay is not possible");
  });

  const LIVE = process.env.PARITY_LIVE === "1";

  it.runIf(LIVE)("replays the live sample against the Commission page", async () => {
    const html = await fetchCommissionCalculator();
    const saved = JSON.parse(readFileSync(FIXTURE_PATH, "utf8")) as OracleFile;
    const byId = new Map(saved.cases.map((row) => [row.id, row]));
    expect(html, "the live response was not the calculator page").toContain("function Beregn2");
    for (const id of LIVE_SAMPLE_IDS) {
      const scenario = DEEP_SCENARIOS.find((row) => row.id === id);
      expect(scenario, id).toBeDefined();
      const fresh = executeScenario(html, scenario!).stored;
      const saved = byId.get(id);
      expect(saved, id).toBeDefined();
      expect(fresh, id).toEqual(storedOnly(saved!));
    }
    const sample = liveSampleFromHtml(html);
    expect(sample.total).toBe(LIVE_SAMPLE_IDS.length);
    const view = deepParityView();
    const expectedMisses = view.disagreements.filter((row) => LIVE_SAMPLE_IDS.includes(row.id)).map((row) => row.id).sort();
    expect(sample.disagreements.map((row) => row.id).sort()).toEqual(expectedMisses);
    expect(sample.matched).toBe(sample.total - expectedMisses.length);
  }, 120_000);

  it("accepting the sort dialog makes the unsorted pair agree", () => {
    const stays = [
      { entry: "2024-05-01", exit: "2024-05-10" },
      { entry: "2024-03-01", exit: "2024-03-10" },
    ];
    const run = runCommissionDetailed(VENDORED_HTML, stays, "2024-06-01", { confirmSort: true });
    const comparison = judgeStored(
      { id: "sorted", group: "outside-domain", domain: "in", stays, on: "2024-06-01" },
      { control: run.control, planning: run.planning, stayDays: run.stayDays },
    );
    expect(comparison.match, JSON.stringify(comparison.diffs)).toBe(true);
  });

  it("does not invent an exit while a stay is still open", () => {
    const open = DEEP_SCENARIOS.find((scenario) => scenario.id === "open-exactly-90");
    expect(open?.calculatorStays).toBeDefined();
    expect(nextLegalEntry(open!.stays, open!.on)).toBeNull();
    expect(nextLegalEntry(open!.calculatorStays!, open!.on)).not.toBeNull();
  });

  it("clock-change dates give the same report in Europe/Brussels", () => {
    if (process.env.DEEP_TZ_CHILD === "1") {
      expect(new Date().getTimezoneOffset()).not.toBe(0);
      const saved = JSON.parse(readFileSync(FIXTURE_PATH, "utf8")) as OracleFile;
      const byId = new Map(saved.cases.map((row) => [row.id, row]));
      const dst = DEEP_SCENARIOS.filter((scenario) => scenario.group === "dst");
      expect(dst.length).toBeGreaterThan(0);
      const drifted = dst.flatMap((scenario) => {
        const fresh = executeScenario(VENDORED_HTML, scenario).stored;
        const saved = byId.get(scenario.id);
        const rest = saved ? storedOnly(saved) : { control: [], planning: [], stayDays: [] };
        if (JSON.stringify(fresh) === JSON.stringify(rest)) return [];
        return [{ id: scenario.id, utc: rest, brussels: fresh }];
      });
      expect(drifted).toEqual([]);
      return;
    }
    const result = spawnSync(
      process.execPath,
      ["./node_modules/vitest/vitest.mjs", "run", "src/lib/schengen/deep/deep.test.ts", "-t", "clock-change dates"],
      {
        cwd: process.cwd(),
        env: { ...process.env, TZ: "Europe/Brussels", DEEP_TZ_CHILD: "1" },
        encoding: "utf8",
        timeout: 60_000,
      },
    );
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  }, 90_000);
});
