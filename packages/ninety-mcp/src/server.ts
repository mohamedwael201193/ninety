/**
 * Ninety MCP server (stdio). The tools are the same functions as the public API
 * (src/lib/api), bundled in at build time; nothing is sent anywhere or stored.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from "@modelcontextprotocol/sdk/types.js";
import { callTool, TOOLS } from "../../../src/lib/api/mcp-tools";
import { API_VERSION } from "../../../src/lib/api/v1";

const server = new Server({ name: "ninety", version: API_VERSION }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // MCP 2025-06-18, Tools, error handling: an unknown tool is a protocol error, as on /api/mcp.
  if (!TOOLS.some((t) => t.name === request.params.name)) throw new McpError(ErrorCode.InvalidParams, `Unknown tool: ${request.params.name}`);
  return callTool(request.params.name, request.params.arguments);
});

await server.connect(new StdioServerTransport());
