// End to end over stdio: start the built server, list its tools, call each one.
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const server = fileURLToPath(new URL("../dist/server.mjs", import.meta.url));
const trips = [{ entry: "2026-06-01", exit: "2026-06-10" }];
const ees = { daysUsed: 30, on: "2026-06-30", records: [{ entry: "2026-06-01", exit: null }] };

test("the stdio server lists and runs schengen_check, ees_reconcile and article52_letter", async () => {
  const client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [server] }));
  try {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((t) => t.name), ["schengen_check", "ees_reconcile", "article52_letter"]);

    const c = await client.callTool({ name: "schengen_check", arguments: { trips: [{ entry: "2026-05-01", exit: "2026-06-15" }, { entry: "2026-08-20", exit: "2026-09-30" }], on: "2026-10-19" } });
    assert.equal(c.isError, false);
    const count = JSON.parse(c.content[0].text);
    assert.equal(count.daysUsed, 88);
    assert.equal(count.daysLeft, 2);

    const r = JSON.parse((await client.callTool({ name: "ees_reconcile", arguments: { trips, ees } })).content[0].text);
    assert.deepEqual([r.travellerDaysUsed, r.eesDaysUsed, r.figureGap], [10, 30, 20]);

    const l = await client.callTool({ name: "article52_letter", arguments: { trips, ees, identity: { fullName: "Jane Doe", dateOfBirth: "1990-05-04", nationality: "Egyptian", documentNumber: "A1234567", email: "jane@example.com", memberState: "France" } } });
    assert.equal(l.isError, false);
    assert.match(JSON.parse(l.content[0].text).text, /Article 52/);

    const bad = await client.callTool({ name: "schengen_check", arguments: { trips: [{ entry: "2026-02-30" }] } });
    assert.equal(bad.isError, true);
  } finally {
    await client.close();
  }
});
