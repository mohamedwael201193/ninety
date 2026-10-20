import { CORS_HEADERS } from "@/lib/api/http";
import { OPENAPI } from "@/lib/api/openapi";

export const dynamic = "force-static";

export function GET(): Response {
  return Response.json(OPENAPI, { headers: { ...CORS_HEADERS, "Access-Control-Allow-Methods": "GET" } });
}
