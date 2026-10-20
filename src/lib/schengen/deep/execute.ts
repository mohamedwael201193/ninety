import { CommissionSourceError, runCommissionDetailed } from "../commission-reference";
import { evaluate } from "../engine";
import { compareDeep, declinedSortHangs, type DeepComparison, type OracleRun } from "./compare";
import type { DeepScenario } from "./scenarios";

export type StoredOracle = {
  control: string[];
  planning: string[];
  /** Null where the form's days cell was left blank. */
  stayDays: (number | null)[];
  notRun?: "declined-sort-hangs" | "no-exit" | "script-error";
};

function normDays(days: number[]): (number | null)[] {
  return days.map((day) => (Number.isNaN(day) ? null : day));
}

function hangResult(scenario: DeepScenario): DeepComparison {
  const assessment = evaluate(scenario.stays, scenario.on);
  const ninety = assessment.errors.length > 0
    ? assessment.errors.join("; ")
    : `${assessment.daysUsed} days used, ${assessment.daysLeft} left`;
  return {
    id: scenario.id,
    group: scenario.group,
    domain: scenario.domain,
    note: scenario.note,
    match: false,
    numbersAgree: false,
    classification: "commission-quirk",
    diffs: [{
      field: "sort dialog",
      commission: "Declining the sort dialog does not advance the loop in sortCron, so the script never finishes.",
      ninety,
    }],
    unparsed: [],
  };
}

function noExitResult(scenario: DeepScenario): DeepComparison {
  const assessment = evaluate(scenario.stays, scenario.on);
  return {
    id: scenario.id,
    group: scenario.group,
    domain: scenario.domain,
    note: scenario.note,
    match: false,
    numbersAgree: false,
    classification: scenario.domain === "out" ? "outside-domain" : "our-bug",
    diffs: [{
      field: "input",
      commission: "The form requires an exit for every stay.",
      ninety: assessment.errors.join("; ") || "A stay has no exit.",
    }],
    unparsed: [],
  };
}

export function judgeStored(scenario: DeepScenario, stored: StoredOracle): DeepComparison {
  if (stored.notRun === "declined-sort-hangs") return hangResult(scenario);
  if (stored.notRun === "no-exit") return noExitResult(scenario);
  if (stored.notRun === "script-error") {
    return {
      id: scenario.id,
      group: scenario.group,
      domain: scenario.domain,
      note: scenario.note,
      match: false,
      numbersAgree: false,
      classification: scenario.domain === "out" ? "outside-domain" : "our-bug",
      diffs: [{ field: "script error", commission: stored.control.join(" "), ninety: "n/a" }],
      unparsed: [],
    };
  }
  const run: OracleRun = {
    control: stored.control,
    planning: stored.planning,
    stayDays: stored.stayDays.map((day) => (day === null ? Number.NaN : day)),
  };
  return compareDeep(scenario, run);
}

export function executeScenario(html: string, scenario: DeepScenario): { comparison: DeepComparison; stored: StoredOracle } {
  const form = scenario.calculatorStays ?? scenario.stays;
  if (declinedSortHangs(form)) {
    return {
      comparison: hangResult(scenario),
      stored: { control: [], planning: [], stayDays: [], notRun: "declined-sort-hangs" },
    };
  }
  if (form.some((stay) => stay.exit === null)) {
    return {
      comparison: noExitResult(scenario),
      stored: { control: [], planning: [], stayDays: [], notRun: "no-exit" },
    };
  }
  try {
    const detailed = runCommissionDetailed(html, form, scenario.on);
    const stored: StoredOracle = {
      control: detailed.control,
      planning: detailed.planning,
      stayDays: normDays(detailed.stayDays),
    };
    return { comparison: compareDeep(scenario, detailed), stored };
  } catch (error) {
    const message = error instanceof CommissionSourceError ? error.message : String(error);
    const comparison: DeepComparison = {
      id: scenario.id,
      group: scenario.group,
      domain: scenario.domain,
      note: scenario.note,
      match: false,
      numbersAgree: false,
      classification: scenario.domain === "out" ? "outside-domain" : "our-bug",
      diffs: [{ field: "script error", commission: message, ninety: "n/a" }],
      unparsed: [],
    };
    return { comparison, stored: { control: [message], planning: [], stayDays: [], notRun: "script-error" } };
  }
}
