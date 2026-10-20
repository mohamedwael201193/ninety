import { fromCommissionDate, type IsoDate } from "./dates";
import { CommissionSourceError, runCommissionScenario } from "./commission-reference";
import { evaluate, nextLegalEntry, type OverstaySpan, type StayInput } from "./engine";
import { GOLDEN_SCENARIOS, type GoldenScenario } from "./golden";
import { PARITY_SCENARIOS, type ParityScenario } from "./scenarios";

export type ParityMismatch = {
  scenario: string;
  detail: string;
};

export type ParityRow = {
  scenario: string;
  on: IsoDate;
  stays: number;
  /** Ninety's result: days left, or overstay days when an overstay exists. */
  ours: string;
  /** The Commission calculator's result in the same unit. */
  theirs: string;
  match: boolean;
  /** The span behind the figure: Ninety's latest legal day or overstay window, and the calculator's own sentence for it. */
  span?: { ours: string; theirs: string };
};

export type ParityReport = {
  rows?: ParityRow[];
  status: "match" | "mismatch" | "couldn't verify";
  /** `matched/total` when the reference ran. Empty when it did not. */
  score: string;
  matched: number;
  total: number;
  mismatches: ParityMismatch[];
  source: string;
  reason?: string;
  /**
   * Which calculator HTML the report was built from: the page fetched just now, or the stored,
   * hash-verified copy when the live page could not be loaded as the calculator from the server.
   */
  origin?: "live" | "stored";
  /** Shown with a stored-copy report: why the live page was not used, and the copy's hash. */
  notice?: string;
  /** Hand-worked boundary cases (golden.ts), run against the same calculator copy. */
  golden?: GoldenRow[];
  /**
   * A separate sample of the deep set, replayed on the calculator HTML this
   * report was built from. Absent when that HTML was never fetched.
   */
  deepLive?: {
    status: "ran" | "couldn't verify";
    total: number;
    matched: number;
    headline: string;
    reason?: string;
    disagreements: { id: string; classification: string; detail: string }[];
  };
};

export type GoldenRow = {
  scenario: string;
  name: string;
  on: IsoDate;
  expected: string;
  ours: string;
  theirs: string;
  match: boolean;
  problems: string[];
};

const PLANNING_DAYS = /The stay may be authorised for up to:\s*(\d+)\s*day/;
const STAY_UNTIL = /Possible stay until\s+(\d{2}\/\d{2}\/\d{2})/;
const ZERO_DAYS = /At\s+(\d{2}\/\d{2}\/\d{2})\s+a stay may be authorized for 0 days/;
const REFUSED = "A stay may not be authorised.";
const OVERSTAY_WINDOW =
  /Days of stay in the 180-days period from\s+(\d{2}\/\d{2}\/\d{2})\s+to\s+(\d{2}\/\d{2}\/\d{2}):\s*(\d+)\s*day/;
const OVERSTAY_SPAN =
  /Overstay in the period from\s+(\d{2}\/\d{2}\/\d{2})\s+to\s+(\d{2}\/\d{2}\/\d{2})\s+\((\d+)\s*days\)/;

function firstMatch(lines: string[], pattern: RegExp): RegExpMatchArray | null {
  for (const line of lines) {
    const match = line.match(pattern);
    if (match) return match;
  }
  return null;
}

function parseOverstays(lines: string[]): OverstaySpan[] {
  const windows = lines
    .map((line) => line.match(OVERSTAY_WINDOW))
    .filter((match): match is RegExpMatchArray => match !== null);
  const spans = lines
    .map((line) => line.match(OVERSTAY_SPAN))
    .filter((match): match is RegExpMatchArray => match !== null);
  return spans.map((span, index) => {
    const window = windows[index];
    return {
      windowStart: window ? fromCommissionDate(window[1]) : "",
      windowEnd: window ? fromCommissionDate(window[2]) : "",
      daysInWindow: window ? Number(window[3]) : Number.NaN,
      from: fromCommissionDate(span[1]),
      to: fromCommissionDate(span[2]),
      days: Number(span[3]),
    };
  });
}

function sameSpan(actual: OverstaySpan, expected: OverstaySpan): boolean {
  return (
    actual.windowStart === expected.windowStart &&
    actual.windowEnd === expected.windowEnd &&
    actual.daysInWindow === expected.daysInWindow &&
    actual.from === expected.from &&
    actual.to === expected.to &&
    actual.days === expected.days
  );
}

export function compareScenario(
  scenario: { stays: StayInput[]; on: IsoDate },
  control: string[],
  planning: string[],
): string[] {
  const assessment = evaluate(scenario.stays, scenario.on);
  const problems: string[] = [];
  if (control.length === 0 || planning.length === 0) {
    return ["The Commission calculator returned an empty report."];
  }

  if (assessment.overstays.length > 0) {
    const reported = parseOverstays(control);
    if (reported.length !== assessment.overstays.length) {
      problems.push(
        `Overstay count ${reported.length} from the calculator, ${assessment.overstays.length} from Ninety.`,
      );
    } else {
      assessment.overstays.forEach((span, index) => {
        if (!sameSpan(reported[index], span)) {
          problems.push(
            `Overstay ${index + 1} differs. Calculator: ${JSON.stringify(reported[index])}. Ninety: ${JSON.stringify(span)}.`,
          );
        }
      });
    }
    const planningReported = parseOverstays(planning);
    if (planningReported.length !== assessment.overstays.length) {
      problems.push("Planning mode did not report the same overstay as control mode.");
    }
    return problems;
  }

  const planningMatch = firstMatch(planning, PLANNING_DAYS);
  const planningDays = planningMatch ? Number(planningMatch[1]) : null;
  if (planningDays !== assessment.daysLeft) {
    problems.push(
      `Planning days: calculator ${planningDays ?? "none"}, Ninety ${assessment.daysLeft}.`,
    );
  }

  if (assessment.present && assessment.daysLeft === 0 && assessment.latestExit) {
    const zero = firstMatch(control, ZERO_DAYS);
    const zeroOn = zero ? fromCommissionDate(zero[1]) : null;
    if (zeroOn !== assessment.latestExit) {
      problems.push(
        `Last legal day: calculator ${zeroOn ?? "none"}, Ninety ${assessment.latestExit}.`,
      );
    }
  } else if (assessment.latestExit) {
    const until = firstMatch(control, STAY_UNTIL);
    const untilOn = until ? fromCommissionDate(until[1]) : null;
    if (untilOn !== assessment.latestExit) {
      problems.push(
        `Possible stay until: calculator ${untilOn ?? "none"}, Ninety ${assessment.latestExit}.`,
      );
    }
  } else if (!control.some((line) => line.includes(REFUSED))) {
    problems.push(`Expected "${REFUSED}" from control mode.`);
  }

  return problems;
}

export function summarise(
  scenario: { stays: StayInput[]; on: IsoDate },
  control: string[],
  planning: string[],
): { ours: string; theirs: string } {
  const assessment = evaluate(scenario.stays, scenario.on);
  if (assessment.overstays.length > 0) {
    const ours = assessment.overstays.reduce((sum, span) => sum + span.days, 0);
    const reported = parseOverstays(control);
    const theirs = reported.reduce((sum, span) => sum + span.days, 0);
    return { ours: `${ours} overstay`, theirs: reported.length ? `${theirs} overstay` : "none" };
  }
  const planningMatch = firstMatch(planning, PLANNING_DAYS);
  return {
    ours: `${assessment.daysLeft} left`,
    theirs: planningMatch ? `${Number(planningMatch[1])} left` : control.some((l) => l.includes(REFUSED)) ? "0 left" : "none",
  };
}

const SPAN_LINES = [STAY_UNTIL, ZERO_DAYS, OVERSTAY_SPAN];

/** Ninety's latest legal day or overstay window, and the calculator's sentence for the same thing. */
export function spanOf(scenario: { stays: StayInput[]; on: IsoDate }, control: string[]): { ours: string; theirs: string } {
  const a = evaluate(scenario.stays, scenario.on);
  const ours = a.overstays.length > 0
    ? a.overstays.map((o) => `overstay ${o.from} to ${o.to}, ${o.days} ${o.days === 1 ? "day" : "days"} (window ${o.windowStart} to ${o.windowEnd}: ${o.daysInWindow} days)`).join("; ")
    : a.latestExit ? `latest legal day ${a.latestExit}` : "entry refused";
  const said = control.filter((line) => SPAN_LINES.some((re) => re.test(line)) || line.includes(REFUSED));
  return { ours, theirs: said.join(" ") || "none" };
}

function describeExpected(g: GoldenScenario): string {
  const e = g.expect;
  if (e.refused) return "refused";
  if (e.overstay) return `${e.overstay.days} overstay`;
  return `${e.daysLeft} left`;
}

/** Checks one hand-worked case against Ninety and the calculator. Empty when every stated field agrees. */
export function checkGolden(html: string, g: GoldenScenario): GoldenRow {
  const problems: string[] = [];
  const run = runCommissionScenario(html, g.calculatorStays ?? g.stays, g.on);
  const lines = [...run.control, ...run.planning];
  for (const sentence of g.calculatorSays) {
    if (!lines.includes(sentence)) problems.push(`The calculator did not print "${sentence}".`);
  }
  const a = evaluate(g.stays, g.on);
  const e = g.expect;
  let ours: string;
  let theirs: string;
  if (e.refused) {
    if (!a.errors.includes(e.refused)) problems.push(`Ninety did not refuse with "${e.refused}" (${JSON.stringify(a.errors)}).`);
    ours = a.errors.length ? "refused" : `${a.daysLeft} left`;
    theirs = lines.includes("Calculation of stay is not possible") ? "refused" : "counted";
  } else {
    problems.push(...compareScenario({ stays: g.stays, on: g.on }, run.control, run.planning));
    const summary = summarise({ stays: g.stays, on: g.on }, run.control, run.planning);
    ours = summary.ours;
    theirs = summary.theirs;
    if (e.daysUsed !== undefined && a.daysUsed !== e.daysUsed) problems.push(`Days used: Ninety ${a.daysUsed}, by hand ${e.daysUsed}.`);
    if (e.daysLeft !== undefined && a.daysLeft !== e.daysLeft) problems.push(`Days left: Ninety ${a.daysLeft}, by hand ${e.daysLeft}.`);
    if (e.latestExit !== undefined && a.latestExit !== e.latestExit) problems.push(`Latest legal day: Ninety ${a.latestExit}, by hand ${e.latestExit}.`);
    if (e.overstay) {
      const o = a.overstays[0];
      if (a.overstays.length !== 1 || !o || o.from !== e.overstay.from || o.to !== e.overstay.to || o.days !== e.overstay.days || o.windowStart !== e.overstay.windowStart || o.daysInWindow !== e.overstay.daysInWindow) {
        problems.push(`Overstay: Ninety ${JSON.stringify(a.overstays)}, by hand ${JSON.stringify(e.overstay)}.`);
      }
    } else if (a.overstays.length > 0) problems.push("Ninety reports an overstay the hand count does not.");
    if (e.nextEntry) {
      const next = nextLegalEntry(g.stays, g.on);
      const then = next ? evaluate(g.stays, next, next).daysLeft : null;
      if (next !== e.nextEntry.on || then !== e.nextEntry.daysLeft) problems.push(`Next legal entry: Ninety ${next} with ${then} days, by hand ${e.nextEntry.on} with ${e.nextEntry.daysLeft}.`);
    }
  }
  return { scenario: g.id, name: g.name, on: g.on, expected: describeExpected(g), ours, theirs, match: problems.length === 0, problems };
}

export function goldenFromHtml(html: string): GoldenRow[] {
  return GOLDEN_SCENARIOS.map((g) => checkGolden(html, g));
}

export function parityFromHtml(html: string, source: string): ParityReport {
  const mismatches: ParityMismatch[] = [];
  const rows: ParityRow[] = [];
  try {
    for (const scenario of PARITY_SCENARIOS) {
      const result = runCommissionScenario(html, scenario.stays, scenario.on);
      const problems = compareScenario(scenario, result.control, result.planning);
      const summary = summarise(scenario, result.control, result.planning);
      rows.push({ scenario: scenario.id, on: scenario.on, stays: scenario.stays.length, ...summary, match: problems.length === 0, span: spanOf(scenario, result.control) });
      if (problems.length > 0) {
        mismatches.push({ scenario: scenario.id, detail: problems.join(" ") });
      }
    }
  } catch (error) {
    const reason = error instanceof CommissionSourceError
      ? error.message
      : "The Commission calculator could not be executed.";
    return unverified(reason, source);
  }

  let golden: GoldenRow[] | undefined;
  try {
    golden = goldenFromHtml(html);
  } catch {
    golden = undefined;
  }
  const total = PARITY_SCENARIOS.length;
  const matched = total - mismatches.length;
  return {
    status: mismatches.length === 0 ? "match" : "mismatch",
    score: `${matched}/${total}`,
    matched,
    total,
    mismatches,
    rows,
    golden,
    source,
  };
}

export function unverified(reason: string, source: string): ParityReport {
  return {
    status: "couldn't verify",
    score: "",
    matched: 0,
    total: PARITY_SCENARIOS.length,
    mismatches: [],
    source,
    reason,
  };
}

export function scenarioIds(): string[] {
  return PARITY_SCENARIOS.map((scenario: ParityScenario) => scenario.id);
}
