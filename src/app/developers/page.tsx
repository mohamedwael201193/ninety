import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/site/meta";
import { OPENAPI } from "@/lib/api/openapi";
import { article52Letter, check, eesReconcile } from "@/lib/api/v1";

export const metadata: Metadata = pageMetadata("/developers");

const TRIPS = [{ entry: "2026-05-01", exit: "2026-06-15" }, { entry: "2026-08-20", exit: "2026-09-30" }];
const EES_TRIPS = [{ entry: "2026-06-01", exit: "2026-06-10" }];
const EES = { daysUsed: 30, on: "2026-06-30", records: [{ entry: "2026-06-01", exit: null }] };
const IDENTITY = { fullName: "Jane Doe", dateOfBirth: "1990-05-04", nationality: "Egyptian", documentNumber: "A1234567", email: "jane@example.com", memberState: "France" };

/** The examples are run through the real API functions when the page is built, so the answers shown are the answers you get. */
function example(path: string, body: object, run: (b: object) => { body: unknown }, abridge?: (o: Record<string, unknown>) => object) {
  const answer = run(body).body as Record<string, unknown>;
  return { id: path.split("/").pop()!, path, body: JSON.stringify(body), answer: JSON.stringify(abridge ? abridge(answer) : answer, null, 1) };
}

const ENDPOINTS = [
  example("/api/v1/check", { trips: TRIPS, on: "2026-10-19" }, check),
  example("/api/v1/ees-reconcile", { trips: EES_TRIPS, ees: EES }, eesReconcile, ({ explanation, ...rest }) => ({ ...rest, explanation: String(explanation).slice(0, 80) + "…" })),
  example("/api/v1/letter", { trips: EES_TRIPS, ees: EES, identity: IDENTITY }, article52Letter, ({ text, evidence, title }) => ({ title, evidence, text: String(text).slice(0, 120) + "…" })),
];

export default function DevelopersPage() {
  const ops = OPENAPI.paths;
  return (
    <main id="main" className="mx-auto max-w-page space-y-10 px-5 py-16 md:px-8">
      <header className="space-y-3">
        <p className="eyebrow">For developers</p>
        <h1 data-testid="developers-heading" className="font-display text-4xl font-medium tracking-tight">The same engine, as an API and an MCP server</h1>
        <p className="max-w-prose text-ink-hushed">
          Every answer the calculator gives is available as JSON. No key, no account, open CORS, and nothing you send is stored.
          It is a helping tool, not a decision by a border authority.
        </p>
        <p>
          <a data-testid="openapi-link" className="underline underline-offset-4" href="/api/openapi.json">OpenAPI 3.1 document (/api/openapi.json)</a>
          {" · "}
          <a className="underline underline-offset-4" href="https://github.com/mohamedwael201193/ninety/tree/main/packages/ninety-mcp">MCP server source</a>
        </p>
      </header>

      {ENDPOINTS.map((e) => (
        <section key={e.id} data-testid={`endpoint-${e.id}`} aria-labelledby={`ep-${e.id}`} className="card-soft space-y-3 p-6">
          <h2 id={`ep-${e.id}`} className="font-mono text-lg"><span className="text-ok">POST</span> {e.path}</h2>
          <p className="text-ink-hushed">{ops[e.path as keyof typeof ops].post.summary}</p>
          <pre tabIndex={0} className="overflow-x-auto rounded-xl bg-ink p-4 text-sm text-paper"><code>{`curl -s -X POST https://ninety-coral.vercel.app${e.path} \\\n  -H 'content-type: application/json' \\\n  -d '${e.body}'`}</code></pre>
          <p className="text-sm text-ink-hushed">Answer{e.id === "check" ? "" : " (long text shortened)"}:</p>
          <pre tabIndex={0} className="overflow-x-auto rounded-xl bg-paper-warm p-4 text-sm"><code>{e.answer}</code></pre>
        </section>
      ))}

      <section aria-labelledby="errors" className="space-y-2">
        <h2 id="errors" className="font-display text-2xl font-medium">Errors</h2>
        <p className="text-ink-hushed"><code>400</code> invalid JSON or a field failed validation (each issue names its field path), <code>413</code> body over 64 KB, <code>415</code> not JSON, <code>422</code> valid shape but the dates cannot be counted (for example an exit before its entry).</p>
      </section>

      <section aria-labelledby="mcp" className="space-y-2">
        <h2 id="mcp" className="font-display text-2xl font-medium">MCP server</h2>
        <p className="text-ink-hushed">
          <code>packages/ninety-mcp</code> runs over stdio and exposes three tools, <code>schengen_check</code>, <code>ees_reconcile</code> and <code>article52_letter</code>,
          which call the same functions as the API. Install steps are in its README. The same tools are served over streamable HTTP at{" "}
          <code data-testid="developers-mcp-http">POST /api/mcp</code> (stateless JSON-RPC: <code>initialize</code>, <code>tools/list</code>, <code>tools/call</code>), so an MCP client can use them without installing anything. Back to the <Link className="underline underline-offset-4" href="/">calculator</Link>.
        </p>
      </section>
    </main>
  );
}
