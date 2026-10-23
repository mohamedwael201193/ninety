# WIN_PLAN — make Ninety strictly better on every criterion

Internal. Do not name competitors in any public Ninety copy (README, site, PR titles of product PRs). Competitor evidence: [`docs/competitors/`](./competitors/), ranking: [`RANKING.md`](./competitors/RANKING.md).

Deadline: **Mon Oct 26, 11:59 PM PT** (Oct 27 09:59 Cairo). Status of this plan: **proposal, nothing implemented**.

## Credit model (used for every estimate below)

| Unit | Credits | Evidence |
|---|---|---|
| 1 frontend (browser) test run | 0.5 | `.github/workflows/testsprite-cli.yml` L12–13; `testsprite-smoke.yml` L3–8; matches [LucidHire "44 tests need 22"](https://github.com/jnzlab/lucid-hire/runs/120131955920) and Tera "28 tests need 14" ([tera.md](./competitors/tera.md)) |
| 1 backend (API) test run | 0.2 | `.github/workflows/testsprite-backend.yml` L11; `scripts/ci/backend-run.mjs` L15 |
| Full GitHub App run on a PR (43 FE) | 21.5 | 43 × 0.5 |
| Backend gate on a PR (28 BE) | 5.6 | 28 × 0.2 |
| **Every product PR** | **≈27.1** | App + backend gate both fire on `pull_request` |
| Smoke (3 FE) | 1.5 | TS01, TS03, TS07 |

Our balance isn't printed in any log: the only `testsprite credits` step is in `testsprite-cli.yml`, and it has always been skipped ([run 39891398096](https://github.com/mohamedwael201193/ninety/actions/runs/39891398096)). **Step 0: run `testsprite credits` locally and record the number before any PR.**

Guiding rule: **bundle work into few PRs.** Each PR costs about 27 credits however small it is, and pushing to an open PR re-runs both suites. Also, the draft docs PR that carries this plan may itself trigger the App run and the backend gate (about 27.1). See "Open question" at the end.

## Where competitors beat Ninety → the change that makes Ninety strictly better

### A. Gate integrity (TestSprite depth + verifiability)

| Competitor edge (evidence) | Ninety today | Change (strictly better) |
|---|---|---|
| Required `TestSprite V3` readable via rulesets/branches API: [HexKit](https://github.com/Timidan/hexkit/rules/13392431), [Alibi](https://github.com/N-45div/alibi/rules/25535358), [Handoff](https://github.com/Satianurag/handoff/rules/25486633), [Nudge](https://github.com/hackid02/nudge-spike/rules/25539464), [SafePlate](https://api.github.com/repos/Milliebanned/safeplate/branches/main), [AgentPulse](https://api.github.com/repos/naufalfx805-source/agentpulse/branches/main) | Protection API 403, no ruleset; [PR #63](https://github.com/mohamedwael201193/ninety/pull/63) merged while V3 was red | **Ruleset** on `main`: require `TestSprite V3` + `testsprite-backend` + new `testsprite-verdict` (below), `bypass_actors: []`, block force-push and deletion. Link the ruleset URL in the README. Add a short note in `LOOP-ITERATIONS.md` that #63 merged red before the ruleset existed. Being honest about that beats hiding it. |
| App posts **`success` while tests fail** at Nudge, LucidHire, HexKit, FairReveal, Tide, Usenami, Vetly, PatiLingo; CareLog fixed it with the project setting ([commit](https://github.com/IamHarrie-Labs/carelog/commit/bfb3c730396609adb2c7105d8939f7d30a0ad20b)) | Same hole; we haven't checked | (1) Turn on the TestSprite project setting that posts `failure` on failed tests. (2) **New `testsprite-verdict` workflow** on the `status` event for context `TestSprite V3`: parse the description `N/M passed · F failed · B blocked`. Pass only if N == M and F + B == 0. Write a job summary and fail otherwise. **No competitor does this.** |
| Planted bug left unmerged, every check red: Tera [PR #40](https://github.com/PugarHuda/tera/pull/40), but there the API check went green without running and V3 failed on credits, not on the bug ([tera.md](./competitors/tera.md)) | None | **Planted-engine-bug PR** (closed unmerged): off-by-one in the 180-day window lookback. Expected red on V3 (TS02 parity table and TS42 leap day), the backend gate (BE05), the Vitest Commission-oracle parity, *and* `testsprite-verdict`. The triage comment (B1) names it ENGINE. Every check genuinely ran. |
| CLI runs per id, waits for the exact build: [Forge build-id poll](https://github.com/ForgeAILab/forge/actions/runs/39704473553), RoomTrace commit-matched `--target-url` + `--fail-on-skipped` ([run](https://github.com/PRADDZY/roomtrace/actions/runs/39910245024)) | Smoke [died](https://github.com/mohamedwael201193/ninety/actions/runs/39724385899) at `test run <id> <id> <id>` without `--local` | **Fix `testsprite-smoke.yml`**: loop `testsprite test run <id> --target-url … --wait` once per id (TS01, TS03, TS07). Fail if any result isn't pass, skipped included. Before running, poll a new `GET /api/version` (returns `VERCEL_GIT_COMMIT_SHA`) until it matches `github.sha`. Trigger on `deployment_status` for production, plus nightly. Set `TESTSPRITE_SMOKE=true`. Add it to the `run-ledger.yml` watch list. |
| Nightly CLI that actually passes with JUnit: [HexKit 20/20](https://github.com/Timidan/hexkit/actions/runs/39955429296), [Tera API nightly](https://github.com/PugarHuda/tera/actions/runs/39921508111); credit preflight that fails closed ([Tide](./competitors/tide.md)) | `testsprite-cli.yml` always skipped; Tera's credit shortfall exits 0 | Nightly **backend** (28 BE) + **smoke** (3 FE) with a `testsprite credits` **preflight that fails closed** below a threshold, plus JUnit + summary artifacts. A full 43-test frontend run happens once, on final `main`, on Oct 26. Strictly better than Tera, whose shortfall passes silently. |
| Separate browser vs API projects (HexKit, Tide) | Already have them: frontend `bd039118…`, backend `790eba05…` | Keep. Say it in the README judge path. |
| Short branch names so the preview label stays ≤ 63 chars ([SafePlate](./competitors/safeplate.md)) | Recent branches 5–14 chars; early ones got truncated to 63 | Rule: product-PR branches ≤ 20 chars. |

### B. Triage, ledger, sync (TestSprite depth)

| Competitor edge | Ninety today | Change |
|---|---|---|
| UI-vs-engine triage script: Tera's exists but **never posted** (17 runs said "nothing to triage", [tera.md](./competitors/tera.md)). Usenami fetched `test result --include-analysis` and `test artifact get --failed-only` ([workflow](https://github.com/namixai/colosseum-pools/blob/80268f22a055bf9244709eddc42fc8048d9be23d/.github/workflows/testsprite.yml)) | `run-ledger.yml` only watches the CLI workflow and Commission drift | **B1 – CI triage on any TestSprite failure** (App verdict, backend gate, smoke). Steps: fetch `test result --include-analysis` and `artifact get --failed-only`; map the test id to its trip fixture from `testsprite_tests/plans/*.json` or `backend/*.py`; run the **Ninety engine and the Commission oracle** (`commission-reference.ts`) on those trips. Classify each failure into one of four buckets: **ENGINE** (engine ≠ oracle), **UI** (engine = oracle, but the page or API showed something else), **TEST** (the plan's expected value ≠ oracle), or **ENV** (blocked, timeout, credits, 5xx, preview not ready). Post one sticky PR comment, write a job summary and append to the ledger. **Proved by a real comment on the planted PR** (A). Strictly better than a script that never fired. |
| 229-row machine-readable ledger + failure bundles in git ([Handoff](https://github.com/Satianurag/handoff/blob/main/testsprite/run-history.json)) | Human-readable `LOOP-ITERATIONS.md` | **B2 – `testsprite_tests/run-history.json`** appended by the triage job (run id, SHA, PR, counts, verdict class, execution URL). Commit failure bundles under `testsprite_tests/failures/`. |
| Git↔portal sync that diffs **stored code** and fails if auto-heal rewrote it ([Tera sync](https://github.com/PugarHuda/tera/blob/main/scripts/testsprite-sync.mjs), [Tide suite-sync](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/scripts/suite-sync.py)) | Plans in git; nothing checks for drift | **B3 – `testsprite-sync` job** (PR + nightly): list cloud tests in both projects; diff plan JSON and stored code against `testsprite_tests/`; fail on any drift or `autoHeal != false`. |
| Public page that trusts only TestSprite's bot ([Penny /checks](./competitors/penny.md), [SafePlate /verified](https://safeplate.milliebanned.xyz/verified)) | `/proof` is a generated snapshot from 2026-10-21 | **B4 – `/proof` live section**: read the GitHub commit statuses for `main` HEAD, filtered to `testsprite[bot]` + `TestSprite V3`, and show counts plus links to the latest executions. Include the PR history rather than only HEAD (SafePlate hides old reds). |
| TestSprite MCP output committed ([Cognivern](./competitors/cognivern.md)) | No TestSprite MCP config | **B5** – commit the TestSprite MCP config (no keys) and use it to author the five new parity plans (C), with its report in `testsprite_tests/mcp/`. That gives one more integration point, used for real. |

### C. Verifiability / problem depth

| Competitor edge | Ninety today | Change |
|---|---|---|
| Golden cases grown under a gate: Tera 114 → 121 on [PR #38](https://github.com/PugarHuda/tera/pull/38), now 140/140 | 14/14 Commission parity (`PARITY_SCENARIOS` in [scenarios.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/scenarios.ts)) | **C1 – 5 new parity cases → 19/19.** The cases are `leap-day-29-feb-2024`, `window-edge-day-180`, `window-edge-day-181`, `autumn-dst-stay` and `year-boundary-stays`. None exists in the repo yet (checked every revision with `git log --all -S`). Each needs its expected value from the Commission oracle, not our engine. Files that hard-code 14, all of which must change together: TS02 + TS51 plans, BE05 (rename it), `parity.test.ts`, `parity-live.test.ts`, `page.test.tsx`, `golden.test.ts`, `deep.test.ts` + the regenerated `deep/oracle-output.json` (the deep headline moves off 399/400 of 412), `rules.json`, `proof.json` (`npm run proof:matrix`), `meta.ts`, the README (7 lines) and the `drift.yml` job title. |
| Mutation testing: Tera Stryker 87.85% but `billing.ts` **not mutated** ([run](https://github.com/PugarHuda/tera/actions/runs/39926982076)); Usenami 1176-id mutation catalog | None | **C2 – StrykerJS on `src/lib/schengen/**` including the core engine**, with a break threshold (start ≥ 85%). Nightly plus a README badge linked to the report. 0 credits. |
| TestSprite catch-rate study, auto-heal off: [Saboteur 5/14 → 14/14](https://github.com/zkasuran/saboteur/blob/main/public/report.json), [Penny 8 planted](https://github.com/ramakrishnanhulk20/penny/pull/16) | None | **C3 – kill matrix**: 5 engine faults behind a preview-only `NINETY_FAULT` env flag (refused in production). Run TS01, TS02, TS07 + BE05, BE23 per fault with `--no-auto-heal`, and also the Commission oracle. Publish the matrix in `/proof`. |
| Differential fuzz: Tera vs Stripe, **red tonight** ([run](https://github.com/PugarHuda/tera/actions/runs/39926974390)) | 3000 histories, 0 disagreements, nightly | Keep. Put the nightly link in the judge path. |
| Description says "14-test" | Stale ([baseline](./competitors/NINETY_BASELINE.md)) | Fix the GitHub description and every stale count. |

### D. Polish / demo

| Competitor edge | Ninety today | Change |
|---|---|---|
| Narrated demos: Tera 165.7 s, Lectern 124 s on the live site, LucidHire 2:26, Tide 97 s | **None** (demo score 2/10) | **D1 – 2:30 narrated demo**, embedded on the site and in the README. Script: problem (EES miscount) → calculator → EES reconcile → Article 52 letter → `/parity` 19/19 vs Commission → planted PR red on every gate with the triage comment saying ENGINE → fix → green → ruleset. |
| "2-minute judge path" at the top of the README (Tera) | None | **D2 – judge path**: 6 clicks, each with one link: live site, `/parity`, the planted PR, the triage comment, a green nightly, the ruleset. |
| 726 / 1,140 unit tests (Lectern, Penny) | 367 Vitest | Don't chase raw counts. Mutation score (C2) and the oracle are the stronger story. |

## Prioritized list (do in this order)

PR bundling: **PR-1 = gate + triage infrastructure**, **PR-2 = 19/19 parity + MCP-authored plans**, **PR-3 = planted bug (closed unmerged)**, **PR-4 (optional) = mutation + kill matrix + /proof live**. Videos and README edits go in PR-2 or PR-4.

| # | Item | Criterion | PR | Credits (est.) |
|---|---|---|---|---|
| 0 | Record `testsprite credits` balance locally | budget | — | 0 |
| 1 | Ruleset requiring V3 + backend + verdict, no bypass; TestSprite setting "post failure on failed tests" | TS depth, verif. | settings + PR-1 | 0 |
| 2 | `testsprite-verdict` workflow (parse the App description, fail on any failed or blocked test) | TS depth | PR-1 | 0 |
| 3 | Fix + enable `testsprite-smoke.yml` (one id per run, `/api/version` SHA wait, deploy-triggered + nightly, in the ledger) | TS depth | PR-1 | 1.5 per run; ≈ 9 to the deadline |
| 4 | B1 triage (ENGINE/UI/TEST/ENV against the Commission oracle) + B2 ledger JSON | TS depth | PR-1 | 0 (rides on failing runs) |
| 5 | C1: 5 parity cases → 19/19, all files listed above, authored via TestSprite MCP (B5) | verif., TS depth | PR-2 | PR run 27.1 + MCP authoring ≈ 1.5 |
| 6 | Planted-engine-bug PR, closed unmerged, triage comment proves ENGINE | TS depth, demo | PR-3 | 27.1 |
| 7 | D1 demo video + D2 judge path | demo, polish | PR-2/4 | 0 |
| 8 | Nightly backend + credit preflight that fails closed + JUnit; one full 43-FE run on final `main` Oct 26 | TS depth | PR-1 + Oct 26 | 5.6/night (≈ 16.8) + 21.5 |
| 9 | B3 git↔portal sync drift gate | TS depth | PR-1 | 0 (list/get calls; credit-free status UNVERIFIED) |
| 10 | C2 Stryker on the engine with a threshold | verif. | PR-4 | 0 |
| 11 | B4 live `/proof` from TestSprite bot statuses | verif., polish | PR-4 | 0 |
| 12 | C3 kill matrix (5 faults × 3 FE + 2 BE, auto-heal off) | TS depth | PR-4 | ≈ 9.5 |
| 13 | Stale description and counts; branch names ≤ 20 chars | verif. | any | 0 |

PR-1 itself is a product PR: ≈ 27.1.

### Credit budget

| Scenario | Items | Credits |
|---|---|---|
| Minimum to beat Tera on TS depth | Items 1–6 + item 8's single final run (PR-1, PR-2, PR-3 = 3 × 27.1; smoke ≈ 9; final full run 21.5; MCP 1.5) | **≈ 113** |
| Full plan | + nightly backend 16.8 + PR-4 27.1 + kill matrix 9.5 | **≈ 167** |
| Each extra push to an open product PR | Re-runs both suites | +27.1 |
| This draft docs PR, if the App/backend gate fire on it | — | up to 27.1 |

If the balance is under about 120, drop PR-4 (move C2 and B4 into PR-2) and skip nightly backend runs. Backend tests already run on every push to `main`.

## Why this makes Ninety strictly better than Tera

| Dimension | Tera (evidence) | Ninety after plan |
|---|---|---|
| Oracle | Stripe test-clock replay, one-time per scenario | Regulator's own calculator, executed in-process on every request, plus drift watch |
| Gate | Required by screenshot; 14 PRs merged on credit-failure V3 | Readable ruleset + verdict check that catches `success`-with-failures + a credit preflight that fails closed |
| Planted bug | API check green without running; V3 failed on credits | Every gate genuinely red, triage comment names ENGINE |
| Triage | Script never posted | Posted on a real red, plus a JSON ledger |
| Mutation | 87.85%, core billing file excluded | Core engine included, threshold enforced |
| Fuzz | Red tonight | 3000 histories, 0 disagreements |
| Tests in git | 29 FE + 5 API | 43+ FE + 28+ API |
| MCP | 10-tool product MCP | Product MCP (HTTP + stdio) **and** TestSprite MCP used for authoring |
| Demo | 165.7 s narrated | 2:30 narrated, showing a live red → green |

## Open question for the reviewer

Should future docs-only PRs skip the TestSprite App and backend gate (paths filter on `testsprite-backend.yml`, and an ignored-build step for docs in Vercel) to save about 27 credits each? That's a product/config change, so it isn't done in this PR.
