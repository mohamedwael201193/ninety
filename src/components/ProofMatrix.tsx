import Link from "next/link";
import proof from "@/data/proof.json";
import { label } from "@/lib/schengen/scenario-names";
import { ToolShell } from "./tools/ToolShell";

const REPO = "https://github.com/mohamedwael201193/ninety";

type Latest = { verdict: string; at: string | null; environment: string | null } | null;

function Verdict({ id, latest }: { id: string; latest: Latest }) {
  const tone = latest?.verdict === "passed" ? "bg-ok-wash text-ok" : latest ? "bg-risk-wash text-risk" : "bg-paper-sunk text-ink-hushed";
  const title = latest ? `${latest.verdict}${latest.at ? ` · ${latest.at.slice(0, 16).replace("T", " ")} UTC` : ""}${latest.environment ? ` · ${latest.environment}` : ""}` : "not run yet";
  return (
    <span data-testid="proof-ts" data-ts={id} data-verdict={latest?.verdict ?? "none"} title={title}
      className={`inline-flex items-center rounded-pill px-2 py-0.5 font-mono text-xs font-medium ${tone}`}>{id}</span>
  );
}

export function ProofMatrix() {
  const total = proof.rules.flatMap((r) => r.testsprite).length;
  const passed = proof.rules.flatMap((r) => r.testsprite).filter((t) => t.latest?.verdict === "passed").length;
  return (
    <ToolShell
      testId="proof-page"
      eyebrow="Proof"
      title="Every rule, and the tests that guard it."
      intro={<p>Each rule Ninety applies is checked three ways: an engine unit or property test, a scenario that the European Commission&apos;s own calculator also runs, and a TestSprite end-to-end test in a cloud browser on every pull request.</p>}
    >
      <p data-testid="proof-generated" className="mb-4 text-sm text-ink-hushed">
        Generated <time dateTime={proof.generatedAt}>{proof.generatedAt.slice(0, 16).replace("T", " ")} UTC</time> from <code>src/data/rules.json</code> and TestSprite&apos;s latest results (<code>npm run proof:matrix</code>).
        {" "}<span data-testid="proof-summary">{proof.rules.length} rules · {passed}/{total} TestSprite references passing on their latest run.</span>
        {" "}History of every run: <a className="underline underline-offset-4" href={`${REPO}/blob/main/LOOP.md`}>LOOP.md</a>.
      </p>
      <div className="card-soft overflow-x-auto">
        <table data-testid="proof-table" className="w-full min-w-[860px] text-left text-sm">
          <thead className="text-xs text-ink-hushed">
            <tr><th className="px-5 py-3">Rule</th><th className="px-5 py-3">Engine tests</th><th className="px-5 py-3">Commission parity</th><th className="px-5 py-3">TestSprite</th></tr>
          </thead>
          <tbody>
            {proof.rules.map((rule) => (
              <tr key={rule.id} data-testid="proof-row" data-rule={rule.id} className="border-t border-line-soft align-top">
                <td className="px-5 py-4">
                  <span className="font-mono text-xs text-ink-hushed">{rule.id}</span>
                  <p className="font-medium">{rule.rule}</p>
                  <p className="text-xs text-ink-hushed">{rule.basis}</p>
                </td>
                <td className="px-5 py-4">
                  <ul className="space-y-1">
                    {rule.unit.map((u) => (
                      <li key={u.name}><a className="underline decoration-line underline-offset-4 hover:decoration-ink" href={`${REPO}/blob/main/${u.file}`}>{u.name}</a></li>
                    ))}
                  </ul>
                </td>
                <td className="px-5 py-4">
                  {rule.parity.length ? (
                    <ul className="space-y-1">{rule.parity.map((p) => <li key={p}><Link className="underline decoration-line underline-offset-4" href="/parity">{label(p)}</Link></li>)}</ul>
                  ) : <span className="text-ink-hushed">Not a calculator feature</span>}
                </td>
                <td className="px-5 py-4"><div className="flex flex-wrap gap-1.5">{rule.testsprite.map((t) => <Verdict key={t.id} id={t.id} latest={t.latest} />)}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ToolShell>
  );
}
