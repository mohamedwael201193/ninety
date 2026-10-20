/**
 * Compares Ninety to the Commission calculator's own output.
 * The numbers on the Commission side are parsed from the script's report.
 * Ninety's numbers are never used as the expected value.
 */
import { addDays, daysInclusive, parseIso } from "../dates";
import { evaluate, nextLegalEntry, type OverstaySpan, type StayInput } from "../engine";
import type { DeepScenario } from "./scenarios";
import { parseReport, type AuthorisedOn, type ParsedReport } from "./parse";

export type FieldDiff = {
  field: string;
  commission: string;
  ninety: string;
};

export type OracleRun = {
  control: string[];
  planning: string[];
  stayDays: number[];
};

export type DeepComparison = {
  id: string;
  group: string;
  domain: "in" | "out";
  note?: string;
  /** True for an in-domain scenario whose printed fields all agree. */
  match: boolean;
  /** True when the printed fields agree, including an outside-domain input the script still answered. */
  numbersAgree: boolean;
  /**
   * in-domain: counted in the headline fraction.
   * outside-domain: the form rejected the input or cannot represent it.
   * commission-quirk: the script's own modes disagree, so there is no single oracle value.
   * our-bug: an in-domain field disagrees and the script is consistent.
   */
  classification: "match" | "our-bug" | "commission-quirk" | "outside-domain";
  diffs: FieldDiff[];
  /** Script sentences that the parser does not know. */
  unparsed: string[];
};

/**
 * In-domain disagreements that were read line by line. A new disagreement is
 * left as `our-bug` until it is investigated and added here.
 */
const INVESTIGATED: Record<string, DeepComparison["classification"]> = {
  // The script does not reject an overlap of the first and second rows, then
  // prints one overstay per row. Those spans are the same days (6, then 11
  // which include the 6). Entered as one stay, the script prints the 11.
  "overlap-overstay-two-trips": "commission-quirk",
};

function sameSpan(a: OverstaySpan, b: OverstaySpan): boolean {
  return a.windowStart === b.windowStart
    && a.windowEnd === b.windowEnd
    && a.daysInWindow === b.daysInWindow
    && a.from === b.from
    && a.to === b.to
    && a.days === b.days;
}

function spanText(span: OverstaySpan): string {
  return `${span.from} to ${span.to} (${span.days} days), window ${span.windowStart} to ${span.windowEnd}: ${span.daysInWindow} days`;
}

function authText(value: AuthorisedOn | null): string {
  return value ? `${value.on} for ${value.days} days` : "none";
}

function formStays(scenario: DeepScenario): StayInput[] {
  return scenario.calculatorStays ?? scenario.stays;
}

/**
 * The script's sort loop asks `confirm` and, on Cancel, does not advance.
 * That is an infinite loop. True when this input would hit that path.
 * Calendar day gaps match the script's `daysBetween` for dates built at 06:00.
 */
export function declinedSortHangs(stays: StayInput[]): boolean {
  for (let index = 1; index < stays.length; index += 1) {
    const previous = stays[index - 1];
    const next = stays[index];
    if (previous.exit === null || next.exit === null) return false;
    const entryGap = parseIso(next.entry) - parseIso(previous.entry);
    const entryBetween = entryGap < 0 ? -1 : entryGap + 1;
    const exitGap = parseIso(next.exit) - parseIso(previous.exit);
    const exitBetween = exitGap < 0 ? -1 : exitGap + 1;
    const accepted = entryBetween > 1 || (entryBetween === 1 && exitBetween > 0);
    if (!accepted) return true;
  }
  return false;
}

export function compareDeep(scenario: DeepScenario, run: OracleRun): DeepComparison {
  const control = parseReport(run.control, scenario.on);
  const planning = parseReport(run.planning, scenario.on);
  const diffs: FieldDiff[] = [];
  const unparsed = [...control.unparsed, ...planning.unparsed];
  const assessment = evaluate(scenario.stays, scenario.on);

  if (control.structure.length > 0 || planning.structure.length > 0) {
    diffs.push({
      field: "report structure",
      commission: [...control.structure, ...planning.structure].join("; "),
      ninety: "n/a",
    });
  }
  if (unparsed.length > 0) {
    diffs.push({
      field: "unparsed calculator output",
      commission: unparsed.join(" | "),
      ninety: "n/a",
    });
  }

  const scriptRefused = control.notPossible || planning.notPossible;
  if (scriptRefused) {
    const commissionText = control.refusalLines.join(" | ") || "calculation not possible";
    const ninetyText = assessment.errors.length > 0
      ? `rejected (${assessment.errors.join("; ")})`
      : `counted, ${assessment.daysUsed} days used, ${assessment.daysLeft} left`;
    if (control.refusalLines.join("\n") !== planning.refusalLines.join("\n")) {
      diffs.push({
        field: "refusal lines",
        commission: `control: ${control.refusalLines.join(" | ") || "none"}; planning: ${planning.refusalLines.join(" | ") || "none"}`,
        ninety: ninetyText,
      });
    }
    if (scenario.domain === "in") {
      if (assessment.errors.length === 0) {
        diffs.push({ field: "refusal", commission: commissionText, ninety: ninetyText });
      }
    } else {
      diffs.push({ field: "calculation", commission: commissionText, ninety: ninetyText });
    }
    return finish(scenario, diffs, unparsed, control, planning);
  }

  if (scenario.domain === "out") {
    // The form produced numbers for an input it does not reliably accept.
    // Still record any numeric difference; the classification stays outside-domain.
    pushCalculatedDiffs(scenario, assessment, control, planning, run.stayDays, diffs);
    return finish(scenario, diffs, unparsed, control, planning);
  }

  pushCalculatedDiffs(scenario, assessment, control, planning, run.stayDays, diffs);
  const quirk = modesDisagree(control, planning);
  if (quirk) {
    diffs.push({ field: "control mode vs planning mode", commission: quirk, ninety: "n/a" });
  }
  return finish(scenario, diffs, unparsed, control, planning);
}

function modesDisagree(control: ParsedReport, planning: ParsedReport): string | null {
  const problems: string[] = [];
  if (control.overstays.length > 0 || planning.overstays.length > 0) {
    if (control.overstays.length !== planning.overstays.length || control.overstays.some((span, i) => !sameSpan(span, planning.overstays[i]))) {
      problems.push("the two modes report different overstays");
    }
  }
  if (control.nextAuthorised && planning.nextAuthorised) {
    if (control.nextAuthorised.on !== planning.nextAuthorised.on || control.nextAuthorised.days !== planning.nextAuthorised.days) {
      problems.push(`next stay is ${authText(control.nextAuthorised)} in control and ${authText(planning.nextAuthorised)} in planning`);
    }
  } else if (Boolean(control.nextAuthorised) !== Boolean(planning.nextAuthorised) && control.overstays.length === 0) {
    problems.push("only one mode prints the next date a stay is allowed");
  }
  return problems.length > 0 ? problems.join("; ") : null;
}

function pushCalculatedDiffs(
  scenario: DeepScenario,
  assessment: ReturnType<typeof evaluate>,
  control: ParsedReport,
  planning: ParsedReport,
  stayDays: number[],
  diffs: FieldDiff[],
): void {
  if (control.overstays.length > 0) {
    if (assessment.overstays.length !== control.overstays.length) {
      diffs.push({
        field: "overstay count",
        commission: `${control.overstays.length}: ${control.overstays.map(spanText).join(" | ") || "none"}`,
        ninety: `${assessment.overstays.length}: ${assessment.overstays.map(spanText).join(" | ") || "none"}`,
      });
    } else {
      control.overstays.forEach((span, index) => {
        const ours = assessment.overstays[index];
        if (!sameSpan(span, ours)) {
          diffs.push({
            field: `overstay ${index + 1}`,
            commission: spanText(span),
            ninety: spanText(ours),
          });
        }
      });
    }
    // On an overstay the script prints the overstay and the per-stay lengths, not days left or a next entry.
    compareStayLengths(scenario, stayDays, diffs);
    return;
  }

  if (planning.daysLeft === null) {
    diffs.push({ field: "days left", commission: "not printed", ninety: String(assessment.daysLeft) });
  } else if (planning.daysLeft !== assessment.daysLeft) {
    diffs.push({ field: "days left", commission: String(planning.daysLeft), ninety: String(assessment.daysLeft) });
  }

  if (planning.period90Start !== null && planning.period90Start !== addDays(scenario.on, -89)) {
    diffs.push({ field: "start of the 90-day period", commission: planning.period90Start, ninety: addDays(scenario.on, -89) });
  }
  if (planning.period180Start !== null && planning.period180Start !== addDays(scenario.on, -179)) {
    diffs.push({ field: "start of the 180-day period", commission: planning.period180Start, ninety: addDays(scenario.on, -179) });
  }
  if (planning.period90Start === null || planning.period180Start === null) {
    diffs.push({
      field: "period starts",
      commission: `90: ${planning.period90Start ?? "not printed"}, 180: ${planning.period180Start ?? "not printed"}`,
      ninety: `${addDays(scenario.on, -89)}, ${addDays(scenario.on, -179)}`,
    });
  }

  if (control.possibleStayUntil) {
    if (assessment.latestExit !== control.possibleStayUntil) {
      diffs.push({
        field: "possible stay until",
        commission: control.possibleStayUntil,
        ninety: assessment.latestExit ?? "none",
      });
    }
  } else if (control.zeroDaysOn) {
    if (assessment.latestExit !== control.zeroDaysOn || assessment.daysLeft !== 0 || !assessment.present) {
      diffs.push({
        field: "last legal day",
        commission: `${control.zeroDaysOn}, 0 days, present`,
        ninety: `${assessment.latestExit ?? "none"}, ${assessment.daysLeft} days left, present ${assessment.present}`,
      });
    }
  } else if (control.entryRefused) {
    if (assessment.latestExit !== null || assessment.daysLeft !== 0 || assessment.present) {
      diffs.push({
        field: "entry refused",
        commission: "A stay may not be authorised.",
        ninety: `latest ${assessment.latestExit ?? "none"}, ${assessment.daysLeft} left, present ${assessment.present}`,
      });
    }
  } else if (!control.noOverstay) {
    diffs.push({
      field: "control result",
      commission: "no stay-until, no refusal, and no overstay",
      ninety: assessment.latestExit ?? "none",
    });
  }

  if (control.nextAuthorised) {
    // The form was given `formStays`. An open stay is closed on the control date there;
    // searching with the still-open trip would keep the traveller present on every later day.
    const asked = formStays(scenario);
    const next = nextLegalEntry(asked, scenario.on);
    const days = next === null ? null : evaluate(asked, next).daysLeft;
    if (next !== control.nextAuthorised.on || days !== control.nextAuthorised.days) {
      diffs.push({
        field: "next authorised stay",
        commission: authText(control.nextAuthorised),
        ninety: next === null ? "none within 180 days" : `${next} for ${days} days`,
      });
    }
  }

  compareStayLengths(scenario, stayDays, diffs);
}

function compareStayLengths(scenario: DeepScenario, stayDays: number[], diffs: FieldDiff[]): void {
  const expectedLengths = formStays(scenario).map((stay) => {
    if (stay.exit === null) return Number.NaN;
    return daysInclusive(stay.entry, stay.exit);
  });
  if (stayDays.length !== expectedLengths.length || stayDays.some((days, index) => days !== expectedLengths[index])) {
    diffs.push({
      field: "length of each stay",
      commission: stayDays.map((days) => (Number.isNaN(days) ? "blank" : String(days))).join(", ") || "none",
      ninety: expectedLengths.map((days) => (Number.isNaN(days) ? "blank" : String(days))).join(", ") || "none",
    });
  }
}

function finish(
  scenario: DeepScenario,
  diffs: FieldDiff[],
  unparsed: string[],
  control: ParsedReport,
  planning: ParsedReport,
): DeepComparison {
  const modeQuirk = diffs.some((diff) => diff.field === "control mode vs planning mode");
  const clean = diffs.length === 0 && unparsed.length === 0;
  let classification: DeepComparison["classification"];
  if (scenario.domain === "out") classification = "outside-domain";
  else if (clean) classification = "match";
  else if (INVESTIGATED[scenario.id]) classification = INVESTIGATED[scenario.id];
  else if (modeQuirk && diffs.every((diff) => diff.field === "control mode vs planning mode" || diff.ninety === "n/a")) classification = "commission-quirk";
  else classification = "our-bug";
  void control;
  void planning;
  return {
    id: scenario.id,
    group: scenario.group,
    domain: scenario.domain,
    note: scenario.note,
    match: classification === "match",
    numbersAgree: clean,
    classification,
    diffs,
    unparsed,
  };
}

export type DeepTally = {
  total: number;
  inDomain: number;
  matched: number;
  headline: string;
  ourBugs: DeepComparison[];
  quirks: DeepComparison[];
  outside: DeepComparison[];
  byGroup: { group: string; total: number; inDomain: number; matched: number }[];
};

export function tally(results: DeepComparison[]): DeepTally {
  const inDomain = results.filter((result) => result.domain === "in");
  const matched = inDomain.filter((result) => result.match);
  const groups = new Map<string, { group: string; total: number; inDomain: number; matched: number }>();
  for (const result of results) {
    const row = groups.get(result.group) ?? { group: result.group, total: 0, inDomain: 0, matched: 0 };
    row.total += 1;
    if (result.domain === "in") row.inDomain += 1;
    if (result.domain === "in" && result.match) row.matched += 1;
    groups.set(result.group, row);
  }
  return {
    total: results.length,
    inDomain: inDomain.length,
    matched: matched.length,
    headline: `${matched.length}/${inDomain.length} scenarios match the Commission calculator on every field`,
    ourBugs: results.filter((result) => result.classification === "our-bug"),
    quirks: results.filter((result) => result.classification === "commission-quirk"),
    outside: results.filter((result) => result.classification === "outside-domain"),
    byGroup: [...groups.values()],
  };
}
