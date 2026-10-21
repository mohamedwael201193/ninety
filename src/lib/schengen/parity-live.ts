import { COMMISSION_CALCULATOR_URL, fetchCommissionCalculator } from "./commission-reference";
import { liveSampleFromHtml } from "./deep/view";
import { parityFromHtml, unverified, type ParityReport } from "./parity";
import { sha256 } from "./vendor/hash";
import { VENDORED_FETCHED_AT, VENDORED_HTML, VENDORED_SHA256 } from "./vendor/commission-calculator";

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/**
 * Parity for /api/parity. The live Commission page is tried first. When it cannot be loaded, or
 * what comes back is not the calculator (seen from Vercel's servers on 2026-10-21, caught by
 * TestSprite TS02), the report is built from the stored copy, but only if that copy still has the
 * SHA-256 recorded when it was fetched. The report then says so: it is never presented as live.
 */
export async function parityReport(fetchHtml: () => Promise<string> = fetchCommissionCalculator): Promise<ParityReport> {
  let liveReason: string;
  try {
    const html = await fetchHtml();
    const report = parityFromHtml(html, COMMISSION_CALCULATOR_URL);
    if (report.status !== "couldn't verify") {
      report.origin = "live";
      try {
        report.deepLive = liveSampleFromHtml(html);
      } catch (error) {
        report.deepLive = { status: "couldn't verify", total: 0, matched: 0, headline: "", reason: errorText(error, "The live sample could not be run."), disagreements: [] };
      }
      return report;
    }
    liveReason = report.reason ?? "The downloaded page is not the calculator.";
  } catch (error) {
    liveReason = errorText(error, "The live page could not be loaded.");
  }

  return storedParityReport(liveReason);
}

/**
 * The 14 scenarios against the stored, hash-checked copy of the Commission page. With a live error
 * it is the fallback for /api/parity; without one it is what /parity shows at once, before the
 * live check answers (the page says the live check is still running).
 */
export function storedParityReport(liveReason?: string): ParityReport {
  const hash = sha256(VENDORED_HTML);
  if (hash !== VENDORED_SHA256) {
    return unverified(`${liveReason ?? ""} The stored copy does not match its recorded hash, so it was not used either.`.trim(), COMMISSION_CALCULATOR_URL);
  }
  const report = parityFromHtml(VENDORED_HTML, COMMISSION_CALCULATOR_URL);
  report.origin = "stored";
  const copy = `the stored official copy (SHA-256 ${hash}, fetched ${VENDORED_FETCHED_AT} from ${COMMISSION_CALCULATOR_URL})`;
  report.notice = liveReason === undefined
    ? `Checked against ${copy}. The live Commission page is being checked now.`
    : `Live Commission page unreachable from server; checked against ${copy}. Live error: ${liveReason}`;
  report.deepLive = {
    status: "couldn't verify",
    total: 0,
    matched: 0,
    headline: "",
    reason: liveReason === undefined ? "The live sample runs once the live Commission page has loaded." : "The live Commission page was unreachable from the server, so no live sample ran.",
    disagreements: [],
  };
  return report;
}
