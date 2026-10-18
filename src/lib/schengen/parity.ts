import { fromCommissionDate, type IsoDate } from "./dates";
import { CommissionSourceError, runCommissionScenario } from "./commission-reference";
import { evaluate, type OverstaySpan, type StayInput } from "./engine";
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

export function parityFromHtml(html: string, source: string): ParityReport {
  const mismatches: ParityMismatch[] = [];
  const rows: ParityRow[] = [];
  try {
    for (const scenario of PARITY_SCENARIOS) {
      const result = runCommissionScenario(html, scenario.stays, scenario.on);
      const problems = compareScenario(scenario, result.control, result.planning);
      const summary = summarise(scenario, result.control, result.planning);
      rows.push({ scenario: scenario.id, on: scenario.on, stays: scenario.stays.length, ...summary, match: problems.length === 0 });
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

  const total = PARITY_SCENARIOS.length;
  const matched = total - mismatches.length;
  return {
    status: mismatches.length === 0 ? "match" : "mismatch",
    score: `${matched}/${total}`,
    matched,
    total,
    mismatches,
    rows,
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
