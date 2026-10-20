/**
 * The MCP tools, without the MCP SDK: names, descriptions, JSON Schemas (taken from the OpenAPI
 * document, so the API and the tools cannot drift) and the call, which is the API function itself.
 * packages/ninety-mcp wires these to a stdio server.
 */
import { OPENAPI } from "./openapi";
import { article52Letter, check, eesReconcile, type ApiResult } from "./v1";

type Tool = { name: string; description: string; inputSchema: object; run: (input: unknown) => ApiResult };

const schemaOf = (path: keyof typeof OPENAPI.paths) => OPENAPI.paths[path].post.requestBody.content["application/json"].schema;

export const TOOLS: Tool[] = [
  {
    name: "schengen_check",
    description: "Count Schengen 90/180 days from a list of trips: days used and left on a date, latest legal exit, next legal entry, overstays, and optionally whether a planned trip fits. Dates are YYYY-MM-DD; entry and exit days both count.",
    inputSchema: schemaOf("/api/v1/check"),
    run: (input) => check(input),
  },
  {
    name: "ees_reconcile",
    description: "Compare the days-used figure (and records, if known) from the EU Entry/Exit System with the traveller's own trips, name the likely cause of a gap, and list the days that differ.",
    inputSchema: schemaOf("/api/v1/ees-reconcile"),
    run: (input) => eesReconcile(input),
  },
  {
    name: "article52_letter",
    description: "Draft the request under Article 52 of Regulation (EU) 2017/2226 to rectify EES data, from the traveller's details and the comparison. The traveller reviews, signs and sends it.",
    inputSchema: schemaOf("/api/v1/letter"),
    run: (input) => article52Letter(input),
  },
];

/** MCP tools/call result: the JSON answer as text, flagged as an error for any non-200 status. */
export function callTool(name: string, args: unknown): { content: { type: "text"; text: string }[]; isError: boolean } {
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) return { content: [{ type: "text", text: JSON.stringify({ error: "unknown_tool", name }) }], isError: true };
  const { status, body } = tool.run(args ?? {});
  return { content: [{ type: "text", text: JSON.stringify(body) }], isError: status !== 200 };
}
