import type { ApiResult } from "./v1";

/** Open CORS: the API is public, takes no credentials and stores nothing. */
export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const MAX_BODY = 64 * 1024;

/** RFC 9110 15.5.6: a 405 names the methods the route allows. */
export function methodNotAllowed(): Response {
  return Response.json({ error: "method_not_allowed", messages: ["Use POST with a JSON body."] }, { status: 405, headers: { ...CORS_HEADERS, Allow: "POST, OPTIONS", "Cache-Control": "no-store" } });
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/** Read a JSON body (size-capped), run `handler`, and answer with CORS and no caching. */
export async function handle(request: Request, handler: (input: unknown) => ApiResult): Promise<Response> {
  const headers = { ...CORS_HEADERS, "Cache-Control": "no-store" };
  // RFC 9110 8.3.1: the media type is case-insensitive and may carry parameters; application/jsonp is not JSON.
  const mediaType = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (mediaType !== "application/json") {
    return Response.json({ error: "unsupported_media_type", messages: ["Send Content-Type: application/json."] }, { status: 415, headers });
  }
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > MAX_BODY) return Response.json({ error: "payload_too_large", messages: ["The body is over 64 KB."] }, { status: 413, headers });
  const raw = new TextDecoder().decode(bytes);
  let input: unknown;
  try { input = JSON.parse(raw); } catch {
    return Response.json({ error: "invalid_json", messages: ["The body is not valid JSON."] }, { status: 400, headers });
  }
  const { status, body } = handler(input);
  return Response.json(body, { status, headers });
}
