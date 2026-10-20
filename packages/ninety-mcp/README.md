# ninety-mcp

An [MCP](https://modelcontextprotocol.io) server for Ninety, over stdio. It gives an assistant the same three answers the app and the public API give, from the same code (`src/lib/api` in this repository, bundled in at build time):

| Tool | What it answers |
|---|---|
| `schengen_check` | Days used and days left on a date under the 90/180 rule, the latest legal exit, the next legal entry, any overstay, and whether a planned trip fits |
| `ees_reconcile` | How the EES days-used figure (and records, if known) compares with your trips, the likely cause of a gap, and the exact days that differ |
| `article52_letter` | The Article 52 request (Regulation (EU) 2017/2226) to rectify EES data, drafted from your details and the comparison |

Input schemas are the request schemas of the [OpenAPI document](https://ninety-coral.vercel.app/api/openapi.json). Nothing is sent over the network and nothing is stored. Answers are a helping tool, not a decision by a border authority.

## Install

Requires Node.js 20+.

```bash
git clone https://github.com/mohamedwael201193/ninety.git
cd ninety && npm ci                 # the engine and zod are bundled from the app
cd packages/ninety-mcp && npm ci && npm run build
```

Then add it to your MCP client. For Claude Desktop, Cursor or any client that takes a JSON config:

```json
{
  "mcpServers": {
    "ninety": { "command": "node", "args": ["/absolute/path/to/ninety/packages/ninety-mcp/dist/server.mjs"] }
  }
}
```

## Example

`schengen_check` with

```json
{ "trips": [{ "entry": "2026-05-01", "exit": "2026-06-15" }, { "entry": "2026-08-20", "exit": "2026-09-30" }], "on": "2026-10-19" }
```

answers `daysUsed: 88`, `daysLeft: 2`. Invalid input comes back as a tool error naming the field.

## Tests

`npm test` builds the server, starts it over stdio with the official MCP client, lists the tools and calls each one (`test/stdio.test.mjs`). The tool layer itself is unit-tested in the app (`src/lib/api/mcp-tools.test.ts`). CI runs both on every pull request.
