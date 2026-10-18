import { COMMISSION_CALCULATOR_URL, fetchCommissionCalculator } from "@/lib/schengen/commission-reference";
import { parityFromHtml, unverified, type ParityReport } from "@/lib/schengen/parity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  let report: ParityReport;
  try {
    const html = await fetchCommissionCalculator();
    report = parityFromHtml(html, COMMISSION_CALCULATOR_URL);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "The reference calculator could not be loaded.";
    report = unverified(reason, COMMISSION_CALCULATOR_URL);
  }
  return Response.json(report, {
    headers: { "Cache-Control": "no-store" },
  });
}
