# Ranking — TestSprite Hackathon Season 4 (internal)

Internal analysis only. Do not copy competitor names into any public Ninety copy (README, site).

- Review date: 2026-10-23. Per-project evidence lives in `docs/competitors/<slug>.md`, each written by a read-only reviewer that cloned the repo, ran what it could, curled the live site, and read PR statuses, check runs and rulesets.
- Ninety's own baseline: [`NINETY_BASELINE.md`](./NINETY_BASELINE.md).
- 29 competitor submissions plus Ninety = 30 entries.

## Scoring model

The five criteria are the ones we expect judges to use. The weights are a decision, not a published rubric:

| Criterion | Weight | Why |
|---|---|---|
| TestSprite depth | 35% | It's a TestSprite hackathon. Covers gates, CLI, MCP, schedules, triage, and red-to-green loops with links. |
| Problem value | 20% | A real user with a real cost. |
| Verifiability | 20% | Whether the claimed numbers survive a click. Reviewers marked FALSE claims; those cost points here. |
| Polish | 15% | Live site, code, UX. |
| Demo | 10% | A video a judge can watch in under 3 minutes. |

Each criterion is scored 1–10 by the per-project reviewer. I adjusted three of those scores where the per-file evidence supported a different call:

- **Penny**, TestSprite depth 8 → 9. A required check that actually stayed red, a CLI run on production, a closed auto-fix loop and a planted-bug study is the second-deepest integration in the field.
- **Handoff**, TestSprite depth 8 → 7. It has no CLI or schedule.
- **Ninety**: self-assessed from the baseline (see the Ninety row below).

`Weighted = 0.35·TS + 0.20·Problem + 0.20·Verif + 0.15·Polish + 0.10·Demo`

## Table

| # | Project | Problem | TS depth | Verif. | Polish | Demo | **Weighted** | Key evidence |
|---|---|---|---|---|---|---|---|---|
| 1 | [Tera](./tera.md) | 9 | 9 | 8 | 9 | 8 | **8.70** | V3 on 44/47 PRs; planted-cent [PR #40](https://github.com/PugarHuda/tera/pull/40) unmerged; API CLI nightly [run](https://github.com/PugarHuda/tera/actions/runs/39921508111); Stryker 87.85% [run](https://github.com/PugarHuda/tera/actions/runs/39926982076); 165.7 s demo |
| 2 | [Penny](./penny.md) | 7 | 9* | 8 | 8 | 3 | **7.65** | Required V3 red 18/21 on [PR #10](https://github.com/ramakrishnanhulk20/penny/pull/10); auto-fix [run](https://github.com/ramakrishnanhulk20/penny/actions/runs/39374963904); CLI 16/16 [run](https://github.com/ramakrishnanhulk20/penny/actions/runs/39556648357) |
| 3 | [LucidHire](./lucidhire.md) | 8 | 7 | 7 | 8 | 8 | **7.45** | Four red-to-green loops (e.g. [14/15](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/d2dd8c65-2fd0-4708-a553-3a96de1d78cc)); ran out of credits, [check run](https://github.com/jnzlab/lucid-hire/runs/120131955920) |
| 4 | [HexKit](./hexkit.md) | 8 | 8 | 7 | 6 | 7 | **7.40** | Required V3 [ruleset](https://github.com/Timidan/hexkit/rules/13392431); CLI nightly 20/20 [run](https://github.com/Timidan/hexkit/actions/runs/39955429296) |
| 5 | [Saboteur](./saboteur.md) | 8 | 8 | 7 | 8 | 4 | **7.40** | Kill matrix 5/14 → 14/14 in [report.json](https://github.com/zkasuran/saboteur/blob/main/public/report.json); [PR #2](https://github.com/zkasuran/saboteur/pull/2) blocked at 23/28 |
| 6 | [Alibi](./alibi.md) | 8 | 7 | 8 | 7 | 6 | **7.30** | Required V3 [ruleset](https://github.com/N-45div/alibi/rules/25535358); exact-value plans in [suite.jsonl](https://github.com/N-45div/alibi/blob/main/testsprite/suite.jsonl) |
| 7 | [Handoff](./handoff.md) | 8 | 7* | 8 | 7 | 5 | **7.20** | Required V3 [ruleset](https://github.com/Satianurag/handoff/rules/25486633); 229-row [run-history.json](https://github.com/Satianurag/handoff/blob/main/testsprite/run-history.json) |
| 8 | [Tide](./tide.md) | 7 | 7 | 8 | 7 | 7 | **7.20** | Git↔portal suite-sync [script](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/scripts/suite-sync.py); but PR #7 merged at 28/31 |
| 9 | [Nudge](./nudge.md) | 6 | 7 | 8 | 7 | 8 | **7.10** | Required [ruleset](https://github.com/hackid02/nudge-spike/rules/25539464); planted tenant leak red [f3c33f3c](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/f3c33f3c-5c2d-4845-9ca3-0621ef615436) |
| **10** | **Ninety (us)** | 8 | 7 | 8 | 8 | 2 | **7.05** | V3 43/43 on [PR #62](https://github.com/mohamedwael201193/ninety/pull/62); backend CLI gate [run](https://github.com/mohamedwael201193/ninety/actions/runs/39525371656); but [PR #63](https://github.com/mohamedwael201193/ninety/pull/63) merged red; smoke [failed](https://github.com/mohamedwael201193/ninety/actions/runs/39724385899); no demo |
| 11 | [SafePlate](./safeplate.md) | 8 | 6 | 7 | 8 | 6 | **6.90** | V3 required with `enforcement_level: everyone` ([API](https://api.github.com/repos/Milliebanned/safeplate/branches/main)); `/verified` page |
| 12 | [CareLog](./carelog.md) | 8 | 6 | 8 | 7 | 5 | **6.85** | 28/32 posted as a GitHub failure ([commit](https://github.com/IamHarrie-Labs/carelog/commit/bfb3c730396609adb2c7105d8939f7d30a0ad20b)), then 32/32 |
| 13 | [Lectern](./lectern.md) | 7 | 6 | 7 | 7 | 8 | **6.75** | V3 on 9 SHAs; 726 Vitest tests; 124 s demo on the live site |
| 14 | [AgentPulse](./agentpulse.md) | 4 | 7 | 8 | 6 | 7 | **6.45** | Required V3 for admins ([API](https://api.github.com/repos/naufalfx805-source/agentpulse/branches/main)); 33 → 37/37 on [PR #5](https://github.com/naufalfx805-source/agentpulse/pull/5) |
| 15 | [RoomTrace](./roomtrace.md) | 7 | 6 | 7 | 7 | 5 | **6.45** | CLI `--fail-on-skipped` on the commit's own preview: [5/11](https://github.com/PRADDZY/roomtrace/actions/runs/39907502140) → [11/11](https://github.com/PRADDZY/roomtrace/actions/runs/39910245024) |
| 16 | [Forge](./forge.md) | 8 | 6 | 5 | 8 | 3 | **6.20** | Waits for its build id before running ([run](https://github.com/ForgeAILab/forge/actions/runs/39704473553)); 0/59 runs green |
| 17 | [Syncly](./syncly.md) | 8 | 5 | 6 | 7 | 5 | **6.10** | 10 red runs → 19/19 on open [PR #1](https://github.com/neromtoobad/syncly/pull/1); check not required |
| 18 | [Vaka](./vaka.md) | 8 | 4 | 7 | 7 | 6 | **6.05** | pytest 493 [run](https://github.com/canzorlu-eng/Vaka/actions/runs/39822568459); V3 not required |
| 19 | [Vetly](./vetly.md) | 7 | 5 | 6 | 7 | 6 | **6.00** | 53/53 [execution](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/8ff95254-8950-4d60-abd9-994e7ec07bcd); its HttpOnly claim is FALSE |
| 20 | [Flight Evidence](./flight-evidence.md) | 5 | 6 | 8 | 7 | 2 | **5.95** | Never green (31/44 + 13 blocked); separate Playwright run 44/44 ([run](https://github.com/airdropcucoinci/flight-evidence/actions/runs/39663108049)) |
| 21 | [Pot](./pot.md) | 6 | 5 | 6 | 7 | 6 | **5.80** | 12/13 → 13/13 on [PR #2](https://github.com/Baheet18/pot/pull/2); check optional |
| 22 | [Feint](./feint.md) | 6 | 5 | 6 | 7 | 5 | **5.70** | Green "All 168 tests passed" on [`7e1e9c3`](https://github.com/nftkingiii/feint/commit/7e1e9c33f7b6edceda69b4636452ed70bacc5824); `main` unprotected; "84-test run on every PR" is FALSE |
| 23 | [Ready72](./ready72.md) | 8 | 4 | 6 | 7 | 1 | **5.35** | 44/50 first and last ([PR #3 comment](https://github.com/MuhammadNabiyev/ready72/pull/3#issuecomment-6292728854)); "82% → 90%" is FALSE |
| 24 | [Usenami Pools](./usenami-pools.md) | 7 | 4 | 6 | 7 | 2 | **5.25** | 8-test suite; 7/8 posted as success |
| 25 | [Chog Mischief](./chog-mischief.md) | 6 | 5 | 6 | 6 | 2 | **5.25** | Went green only after a test was removed ([commit](https://github.com/cipoklean/chog-mischief/commit/29d02830f55a10523abd7d9551af52972a36c210)) |
| 26 | [Cognivern](./cognivern.md) | 6 | 6 | 4 | 5 | 2 | **5.05** | CLI on every PR but red (7 failures, all HTTP 429) ([run](https://github.com/thisyearnofear/cognivern/actions/runs/39808897365)); "required" is FALSE |
| 27 | [FairReveal](./fairreveal.md) | 7 | 4 | 5 | 6 | 3 | **5.00** | 27/34 → 34/34; several math claims FALSE |
| 28 | [PatiLingo](./patilingo.md) | 7 | 4 | 5 | 6 | 1 | **4.80** | 11/11 local suites; claim that merges were blocked is FALSE |
| 29 | [DevSentinel AI](./devsentinel-ai.md) | 6 | 3 | 5 | 6 | 1 | **4.25** | No TestSprite PR check ever produced (0 check runs, [API](https://api.github.com/repos/festac-dev/devsentinel-ai/commits/e73fa656cd46308d6a25398de1f48cf5b47be5a9/check-suites)) |
| 30 | [QuickPoll](./quickpoll.md) | 4 | 3 | 5 | 6 | 2 | **3.95** | testsprite-action 9/9 [run](https://github.com/tujack39/quickpoll/actions/runs/38016829940); "push to main" is FALSE |

\* = score adjusted by me (see the scoring model above).

## The Ninety row

Ninety's scores are self-assessed from [`NINETY_BASELINE.md`](./NINETY_BASELINE.md):

- **Problem 8.** Schengen 90/180 plus the EU Entry/Exit System affects every non-EU visitor, and a wrong count carries real penalties.
- **TestSprite depth 7.** Present:
  - the App check with 43 plans committed in git
  - a backend CLI gate on every PR covering 28 API tests
  - a product MCP

  Missing or broken:
  - [PR #63](https://github.com/mohamedwael201193/ninety/pull/63) merged while V3 was red
  - required status can't be verified (classic protection API returns 403; no ruleset)
  - smoke workflow broken ([run 39724385899](https://github.com/mohamedwael201193/ninety/actions/runs/39724385899))
  - nightly CLI skipped ([run 39891398096](https://github.com/mohamedwael201193/ninety/actions/runs/39891398096))
  - no TestSprite MCP config
  - triage covers only CLI and Commission drift
- **Verifiability 8.** The Commission oracle runs the official script. Live `/api/parity` reports 14/14, and deep parity is 399/400. Gaps: the GitHub description still says "14-test", and the README "required" claim isn't readable from the API.
- **Polish 8.**
- **Demo 2.** No video exists.

## What the field tells us

1. **Tera is the only entry clearly ahead of Ninety on every criterion.** Ninety leads it in places:
   - the oracle is the regulator's own calculator, run in-process on every request, not a one-time replay
   - backend TestSprite tests run against every PR's preview (Tera's API check went green without running on [PR #40](https://github.com/PugarHuda/tera/pull/40))
   - 43 + 28 committed tests versus 29 + 5

   Tera's weak points:
   - its triage script never posted a comment (17 runs said "nothing to triage")
   - Stryker doesn't mutate `billing.ts`
   - tonight's Stripe fuzz is red ([run](https://github.com/PugarHuda/tera/actions/runs/39926974390))
   - 14 PRs merged on a credit-failure V3 check
2. **Enforcing the gate is the field's main dividing line.** Nine projects show a required V3 check readable through the rulesets or branches API, or a red PR that stayed unmerged: Penny, HexKit, Alibi, Handoff, Nudge, SafePlate, AgentPulse, Saboteur and Tera (the last by screenshot). Ninety currently shows the opposite, with PR #63 merged while red.
3. **The App posts `success` while tests fail.** Seen at Nudge, LucidHire, HexKit, FairReveal, Tide, Usenami, Vetly, PatiLingo and Feint. CareLog switched on the project setting that posts `failure`. A gate that reads the *description* (`N/M passed · F failed · B blocked`) closes this hole for everyone. Nobody in the field does that, so it's open ground for Ninety.
4. **Demo.** Sixteen of 29 entries have a video (per the submission posts and reviews). Ninety's 2/10 here costs about 0.6 weighted points, more than any other single gap.
5. **Credits are a real failure mode.** LucidHire ([check run](https://github.com/jnzlab/lucid-hire/runs/120131955920)) and Tera both merged PRs without a passing gate after running out. The plan budgets credits explicitly.

## Projected Ninety score after WIN_PLAN P0+P1

Problem 8, TS depth 10, Verifiability 9, Polish 9, Demo 8 → 0.35·10 + 0.2·8 + 0.2·9 + 0.15·9 + 0.1·8 = **9.05**, ahead of Tera's 8.70. See [`../WIN_PLAN.md`](../WIN_PLAN.md).
