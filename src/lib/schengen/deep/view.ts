/**
 * The /parity deep section. It judges the stored calculator output.
 * It does not execute the Commission script.
 */
import { CommissionSourceError } from "../commission-reference";
import { COMPARED_FIELDS } from "./parse";
import { tally, type DeepComparison } from "./compare";
import { executeScenario, judgeStored, type StoredOracle } from "./execute";
import { DEEP_SCENARIOS, DEEP_SEED, LIVE_SAMPLE_IDS, type DeepScenario } from "./scenarios";
import { VENDORED_SHA256 } from "../vendor/commission-calculator";
import oracleFile from "./oracle-output.json";

type OracleFile = {
  seed: number;
  sourceSha256: string;
  timezone: string;
  cases: ({ id: string } & StoredOracle)[];
};

const oracle = oracleFile as OracleFile;

export type DeepDisagreement = {
  id: string;
  group: string;
  classification: DeepComparison["classification"];
  note?: string;
  diffs: { field: string; commission: string; ninety: string }[];
  /** Raw report lines from the stored calculator run. Empty when the script was not run. */
  control: string[];
  planning: string[];
};

export type DeepGroupCount = {
  group: string;
  total: number;
  inDomain: number;
  matched: number;
};

export type DeepParityView = {
  headline: string;
  matched: number;
  inDomain: number;
  total: number;
  ourBugs: number;
  seed: number;
  sourceSha256: string;
  fields: readonly string[];
  groups: DeepGroupCount[];
  disagreements: DeepDisagreement[];
};

export type DeepLiveSample = {
  status: "ran";
  total: number;
  matched: number;
  headline: string;
  disagreements: { id: string; classification: string; detail: string }[];
};

function storedById(): Map<string, StoredOracle> {
  if (oracle.seed !== DEEP_SEED) {
    throw new Error(`Stored oracle seed is ${oracle.seed}, expected ${DEEP_SEED}.`);
  }
  if (oracle.sourceSha256 !== VENDORED_SHA256) {
    throw new Error("Stored oracle was produced from a different calculator script.");
  }
  if (oracle.timezone !== "UTC") {
    throw new Error(`Stored oracle timezone is ${oracle.timezone}, expected UTC.`);
  }
  return new Map(oracle.cases.map((row) => [row.id, row]));
}

function judged(): DeepComparison[] {
  const byId = storedById();
  return DEEP_SCENARIOS.map((scenario) => {
    const stored = byId.get(scenario.id);
    if (!stored) throw new Error(`No stored calculator output for ${scenario.id}.`);
    return judgeStored(scenario, stored);
  });
}

let cachedView: DeepParityView | null = null;

export function deepParityView(): DeepParityView {
  if (cachedView) return cachedView;
  const byId = storedById();
  const results = judged();
  const summary = tally(results);
  const disagreements: DeepDisagreement[] = results
    .filter((result) => result.classification !== "match")
    .map((result) => {
      const stored = byId.get(result.id)!;
      return {
        id: result.id,
        group: result.group,
        classification: result.classification,
        note: result.note,
        diffs: result.diffs,
        control: stored.control,
        planning: stored.planning,
      };
    });
  cachedView = {
    headline: summary.headline,
    matched: summary.matched,
    inDomain: summary.inDomain,
    total: summary.total,
    ourBugs: summary.ourBugs.length,
    seed: DEEP_SEED,
    sourceSha256: VENDORED_SHA256,
    fields: COMPARED_FIELDS,
    groups: summary.byGroup,
    disagreements,
  };
  return cachedView;
}

function detailOf(result: DeepComparison): string {
  if (result.diffs.length === 0) return result.note ?? result.classification;
  return result.diffs.map((diff) => `${diff.field}: calculator “${diff.commission}”; Ninety “${diff.ninety}”`).join(" ");
}

/** Replays the fixed sample through a calculator page. The caller supplies the HTML. */
export function liveSampleFromHtml(html: string): DeepLiveSample {
  if (!html.includes("function Beregn2") || !html.includes("function leggInndager")) {
    throw new CommissionSourceError(
      "The downloaded page does not contain the Commission calculator functions.",
    );
  }
  const wanted = new Set(LIVE_SAMPLE_IDS);
  const scenarios: DeepScenario[] = DEEP_SCENARIOS.filter((scenario) => wanted.has(scenario.id));
  if (scenarios.length !== LIVE_SAMPLE_IDS.length) {
    throw new Error("A live-sample id is missing from the scenario set.");
  }
  const results = scenarios.map((scenario) => executeScenario(html, scenario).comparison);
  const matched = results.filter((result) => result.match).length;
  const disagreements = results
    .filter((result) => !result.match)
    .map((result) => ({
      id: result.id,
      classification: result.classification,
      detail: detailOf(result),
    }));
  return {
    status: "ran",
    total: results.length,
    matched,
    headline: `${matched}/${results.length} of the live sample match the Commission page on every field`,
    disagreements,
  };
}
