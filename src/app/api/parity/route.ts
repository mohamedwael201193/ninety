import { parityReport } from "@/lib/schengen/parity-live";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const report = await parityReport();
  return Response.json(report, {
    headers: { "Cache-Control": "no-store" },
  });
}
