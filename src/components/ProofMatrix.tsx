import { ScrollRegion } from "./ScrollRegion";
import Link from "next/link";
import proof from "@/data/proof.json";
import { label } from "@/lib/schengen/scenario-names";
import { proofSummary, suiteSummary } from "@/lib/proof/rules";
import VerifiedNumbers from "@/components/proof/VerifiedNumbers";
import { ToolShell } from "./tools/ToolShell";

const REPO = "https://github.com/mohamedwael201193/ninety";

type Law = { cite: string; href: string; text: string };

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
  const summary = proofSummary(proof.rules);
  const suiteRefs = ((proof as { suite?: { id: string; plan: string; name?: string | null; latest: Latest }[] }).suite ?? []);
  const suite = suiteSummary(suiteRefs);
  const tied = new Set(proof.rules.flatMap((r) => r.testsprite.map((t) => t.id)));
  const others = suiteRefs.filter((t) => !tied.has(t.id));
  const envs = proof.environments?.length ? proof.environments.join(", ") : null;
  return (
    <ToolShell
      testId="proof-page"
      eyebrow="Proof"
      title="Every rule, and the tests that guard it."
      intro={<p>Each rule Ninety applies is checked three ways: an engine unit or property test, a scenario that the European Commission&apos;s own calculator also runs, and a TestSprite end-to-end test in a cloud browser on every pull request.</p>}
    >
      <p data-testid="proof-headline" className="mb-3 text-lg font-medium">
        {suite.ran === suite.tests && suite.passed === suite.ran ? `All ${suite.tests} TestSprite tests passed` : `${suite.passed} of ${suite.tests} TestSprite tests passed`}{envs ? ` on their latest cloud run (${envs})` : ""}.
      </p>
      <p data-testid="proof-generated" className="mb-4 text-sm text-ink-hushed">
        Generated <time dateTime={proof.generatedAt}>{proof.generatedAt.slice(0, 16).replace("T", " ")} UTC</time> from <code>src/data/rules.json</code> and TestSprite&apos;s latest results (<code>npm run proof:matrix</code>).
        {" "}<span data-testid="proof-summary">{proof.rules.length} rules · {summary.passed}/{summary.ran} of the TestSprite tests tied to a rule passed on their latest cloud run · whole suite: <span data-testid="proof-suite">{suite.passed}/{suite.ran}</span> passed{proof.environments?.length ? ` (${proof.environments.join(", ")})` : ""}{suite.notRun.length > 0 ? ` · not run yet: ${suite.notRun.join(", ")}` : ""}.</span>
        {" "}History of every run: <a className="underline underline-offset-4" href={`${REPO}/blob/main/LOOP.md`}>LOOP.md</a>.
      </p>
      <section aria-label="Verified numbers" className="mb-8"><VerifiedNumbers heading={false} /></section>
      <section data-testid="proof-gate" aria-label="Merge gate and defect ledger" className="mb-8 grid gap-3 md:grid-cols-3">
        <div className="card-soft p-4 text-sm">
          <h2 className="mb-1 text-base font-medium">TestSprite N/N gate</h2>
          <p>A required check reads the real count from the <code>TestSprite V3</code> status and the backend run on the same commit. It fails unless both are N/N with N &gt; 0, and fails closed when a result is missing or unreadable. <a className="underline underline-offset-4" href={`${REPO}/blob/main/docs/NN-GATE.md`}>How it works and what we found</a>.</p>
        </div>
        <div className="card-soft p-4 text-sm">
          <h2 className="mb-1 text-base font-medium">Defect ledger</h2>
          <p>All 14 pull requests that went red on TestSprite, then green, with the red and green status for each commit: 6 with app defects (7 real bugs), 1 UX, 7 test plan or CI. <a className="underline underline-offset-4" href={`${REPO}/blob/main/docs/DEFECTS.md`}>docs/DEFECTS.md</a>.</p>
        </div>
        <div data-testid="proof-deep-diff" className="card-soft p-4 text-sm">
          <h2 className="mb-1 text-base font-medium">Deep parity 399/400: the one difference</h2>
          <p>Two overlapping trips, 1 Jan–5 Apr and 25 Mar–10 Apr 2024, checked on 10 Apr. The Commission script prints one overstay per row: 31 Mar–5 Apr (6 days) and 31 Mar–10 Apr (11 days). The 6 days sit inside the 11. Ninety lists the 11 days once, and the script itself prints one 11-day overstay when the same days are entered as one stay. <a className="underline underline-offset-4" href={`${REPO}/blob/main/docs/PARITY-399.md`}>Details</a>.</p>
        </div>
      </section>
      <ScrollRegion label="Rule-to-test matrix" className="card-soft">
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
                  {(rule as { law?: Law[] }).law?.length ? (
                    <ul data-testid="proof-law" className="mt-1 space-y-1 text-xs">
                      {(rule as { law?: Law[] }).law!.map((l) => (
                        <li key={l.cite}><a className="underline decoration-line underline-offset-4" href={l.href} title={`“${l.text}”`}>{l.cite}</a> <span className="text-ink-hushed">“{l.text}”</span></li>
                      ))}
                    </ul>
                  ) : null}
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
      </ScrollRegion>
      {others.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-base font-medium">The other {others.length} TestSprite tests</h2>
          <p className="mb-3 text-sm text-ink-hushed">Not tied to one rule: they check the interface, navigation and keyboard behaviour. Same latest cloud run as above.</p>
          <ScrollRegion label="TestSprite tests not tied to a rule" className="card-soft">
            <table data-testid="proof-other-table" className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs text-ink-hushed"><tr><th className="px-5 py-3">Test</th><th className="px-5 py-3">Checks</th><th className="px-5 py-3">Latest</th></tr></thead>
              <tbody>
                {others.map((t) => (
                  <tr key={t.id} data-testid="proof-other-row" data-ts={t.id} className="border-t border-line-soft">
                    <td className="px-5 py-3"><Verdict id={t.id} latest={t.latest ?? null} /></td>
                    <td className="px-5 py-3">{t.name ?? t.plan}</td>
                    <td className="px-5 py-3 font-mono text-xs" data-testid="proof-other-verdict">{t.latest?.verdict ?? "not run yet"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollRegion>
        </section>
      )}
    </ToolShell>
  );
}
