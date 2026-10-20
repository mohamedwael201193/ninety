import { handle, methodNotAllowed, preflight } from "@/lib/api/http";
import { check } from "@/lib/api/v1";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(): Response {
  return methodNotAllowed();
}

export function OPTIONS(): Response {
  return preflight();
}

export async function POST(request: Request): Promise<Response> {
  return handle(request, (input) => check(input));
}
