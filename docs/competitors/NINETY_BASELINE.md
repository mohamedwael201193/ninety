# Ninety — factual baseline

Inspected 2026-10-23 against git `22dd129` (`main` and this workspace). Remote: `https://github.com/mohamedwael201193/ninety`. Live site: `https://ninety-coral.vercel.app`. Hackathon: TestSprite Season 4, deadline Mon 26 Oct 2026 11:59 PM PT.

Every count below is tagged **VERIFIED** (reproduced here, or read from a GitHub run/API response on this date) or **UNVERIFIED** (claimed in the repo, not re-executed). GitHub branch-protection and Actions variables returned HTTP 403 to this token, so “required check” is not re-confirmed from the API.

## What it is

Ninety counts a non-EU traveller’s Schengen days under the 90-days-in-any-180 rule, compares that count with the EU Entry/Exit System (EES) figure, and drafts an Article 52 (Regulation (EU) 2017/2226) correction letter when the border’s count is wrong. No account. Trips stay in the browser.

Source: [README.md](https://github.com/mohamedwael201193/ninety/blob/main/README.md). GitHub repo description (stale) still says “Every PR gated by a 14-test TestSprite suite” (`gh repo view`, 2026-10-23). The suite is 43 frontend + 28 backend tests.

Product surfaces:

| Surface | Role |
|---|---|
| `/` | Days used/left, latest legal exit, planned-trip fit, overstay |
| `/ees` | EES figure vs trips: gap, likely cause, differing days |
| `/letter` | Article 52 request as text or PDF |
| `/parity` | Side-by-side with the European Commission short-stay calculator |
| `/proof` | 12 rules mapped to engine, parity, and TestSprite tests |
| `/developers` | OpenAPI + MCP |

## Architecture

Stack, from [package.json](https://github.com/mohamedwael201193/ninety/blob/main/package.json) and [ci.yml](https://github.com/mohamedwael201193/ninety/blob/main/.github/workflows/ci.yml): Next.js `15.5.28`, React `19.1.0`, TypeScript 5, Tailwind 4, Zod 4, Vitest `4.1.12`, fast-check, axe-core, pdf-lib. Node 22. Deployed on Vercel (`server: Vercel` on live responses). [vercel.json](https://github.com/mohamedwael201193/ninety/blob/main/vercel.json) skips production rebuilds when a commit only touches docs, CI, or markdown.

One engine in `src/lib/schengen` serves the pages, three REST routes, and three MCP tools. EES comparison is `src/lib/ees`. The letter and PDF are `src/lib/letter`. HTTP MCP is `POST /api/mcp` ([src/app/api/mcp/route.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/app/api/mcp/route.ts)). A separate stdio server is [packages/ninety-mcp](https://github.com/mohamedwael201193/ninety/blob/main/packages/ninety-mcp/src/server.ts) (`schengen_check`, `ees_reconcile`, `article52_letter`), bundling the same `src/lib/api/mcp-tools.ts`.

### Commission oracle

Ninety does not reimplement the Commission calculator. [commission-reference.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/commission-reference.ts) loads the public page `https://ec.europa.eu/assets/home/visa-calculator/calculator.htm` and runs its script (`Beregn2` / `BeregnControl` / `BeregnVisa`) inside a Node `vm`. If the HTML is not that calculator, the result is “couldn't verify”, never a match.

A SHA-256-pinned copy of that page is [commission-calculator.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/vendor/commission-calculator.ts) (`VENDORED_SHA256 = bd538a7d744ce090cb110b3c0bb0eaf4e65cb9b6ad1ec7cc0bb923d3d1ce4513`). `/parity` renders that stored report immediately ([parity/page.tsx](https://github.com/mohamedwael201193/ninety/blob/main/src/app/parity/page.tsx) calls `storedParityReport()`). `GET /api/parity` tries the live page first and falls back to the stored copy ([parity-live.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/parity-live.ts)).

### The 14 parity cases

Defined as `PARITY_SCENARIOS` in [src/lib/schengen/scenarios.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/scenarios.ts). Compared in [parity.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/parity.ts) (`parityFromHtml`) and asserted `14/14` in [parity.test.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/parity.test.ts).

| id | Stays / control date |
|---|---|
| `no-previous-stay` | no stays, on 2024-06-01 |
| `manual-14-jun-2024` | 2024-01-01→01-01 and 2024-06-01→06-14, on 2024-06-14 |
| `manual-entry-19-jun-2024` | three 2024 stays, on 2024-06-19 |
| `manual-entry-7-aug-2024` | same three stays, on 2024-08-07 |
| `manual-last-day-29-aug-2024` | 2024-01-01 and 2024-06-01→08-29, on 2024-08-29 |
| `calculator-example-kom-1-1` | Commission “Ex. KOM” 2013-10-27→2014-03-15, on 2014-03-15 |
| `same-day-stay` | 2024-10-27→10-27, on 2024-10-27 |
| `day-after-spring-dst` | 2024-03-30→03-31, on 2024-04-01 |
| `same-day-turnaround` | exit and re-entry 2024-05-10, on 2024-05-12 |
| `exact-90-days` | 2024-01-01→03-30, on 2024-03-30 |
| `day-91-overstay` | 2024-01-01→03-31, on 2024-03-31 |
| `reentry-after-full-90` | 90-day stay, on 2024-07-01 |
| `entry-refused-next-day` | 90-day stay, on 2024-03-31 |
| `overstay-through-15-apr` | 2024-01-01→04-15, on 2024-04-15 |

**VERIFIED** locally: `npx vitest run` on 2026-10-23 included the stored-copy 14/14 assertion (the two live-page tests in that file are skipped unless `PARITY_LIVE=1`). **VERIFIED** live: `GET /api/parity` returned `status=match`, `score=14/14`, `origin=live`, all 14 row ids above, all `match: true` (2026-10-23).

Separate from those 14:

- **12 golden cases** in [golden.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/golden.ts): `overlapping-trips`, `open-stay-through-today`, `refused-until-first-day-leaves`, `spring-clock-change-2026`, `leap-day-last-day-in-window`, `leap-day-left-window`, `exit-before-entry-refused`, `old-days-leave-during-the-stay`, `exit-and-entry-on-consecutive-days`, `stay-across-ees-cutoff`, `two-stays-add-up-to-93`, `overlap-overstay-counted-once`. Live `/api/parity` returned all 12 with `match: true` (**VERIFIED**).
- **Deep set**: [deep/scenarios.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/deep/scenarios.ts) (`DEEP_SEED = 20261020`, `RANDOM_HISTORIES = 240`). [deep.test.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/deep/deep.test.ts) expects the headline `399/400 scenarios match the Commission calculator on every field`, `total` 412, group `existing-14` matched 14/14, one in-domain quirk `overlap-overstay-two-trips`, and 11 out-of-domain ids. That assertion passed in the local Vitest run (**VERIFIED**). SSR of `/parity` includes `399/400 scenarios match…` (**VERIFIED** by curl). The live sample is 20 ids in `LIVE_SAMPLE_IDS` (not the original 14). Live `/api/parity` `deepLive` was `19/20`, disagreement `overlap-overstay-two-trips` classified `commission-quirk` (**VERIFIED**).

## TestSprite integration

Two TestSprite projects. Frontend project id `bd039118-0c25-4707-b018-b25619a37fce` ([testsprite-cli.yml](https://github.com/mohamedwael201193/ninety/blob/main/.github/workflows/testsprite-cli.yml)). Backend project id `790eba05-abdb-41c5-ae1a-4b2b0131b438` (named in [README](https://github.com/mohamedwael201193/ninety/blob/main/README.md); tests run one id at a time by [backend-run.mjs](https://github.com/mohamedwael201193/ninety/blob/main/scripts/ci/backend-run.mjs)). CLI pin: `@testsprite/testsprite-cli@0.15.0`. No `.testsprite` directory and no TestSprite MCP config in the repo.

### Present

| Piece | What it does | Evidence |
|---|---|---|
| GitHub App check `TestSprite V3` on PRs | Cloud browser suite against the Vercel preview. Not a file in `.github/workflows`. | PR [#62](https://github.com/mohamedwael201193/ninety/pull/62) check: “All 43 tests passed”, [execution b43fc678](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/b43fc678-1b47-4f4f-9c4c-cd08eb76daac). PR [#63](https://github.com/mohamedwael201193/ninety/pull/63) check: “42/43 passed · 1 failed”, [execution 9fea50d8](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/9fea50d8-d7b4-48ad-a708-b37aff1d34eb). Setup PR [#4](https://github.com/mohamedwael201193/ninety/pull/4). |
| Backend CLI gate | [testsprite-backend.yml](https://github.com/mohamedwael201193/ninety/blob/main/.github/workflows/testsprite-backend.yml) on `pull_request`, `push` to `main`, and `workflow_dispatch`. Waits for the Vercel commit status, then runs all 28 tests against the preview or production. | PR #63 [run 39525371656](https://github.com/mohamedwael201193/ninety/actions/runs/39525371656) success. `main` after merge [run 39527070542](https://github.com/mohamedwael201193/ninety/actions/runs/39527070542) success. PR #62 [run 39519798095](https://github.com/mohamedwael201193/ninety/actions/runs/39519798095) success. |
| Official action, second path | [testsprite-cli.yml](https://github.com/mohamedwael201193/ninety/blob/main/.github/workflows/testsprite-cli.yml) uses `TestSprite/testsprite-action@9f3ac52`. Triggers: `workflow_dispatch`, nightly cron `29 2 * * *` only if repo variable `TESTSPRITE_NIGHTLY=true`, and `deployment_status` only if `TESTSPRITE_ON_MAIN=true`. Never on push or pull_request. | Only three runs exist, all skipped schedules: [39891398096](https://github.com/mohamedwael201193/ninety/actions/runs/39891398096) (2026-10-23), [39713176927](https://github.com/mohamedwael201193/ninety/actions/runs/39713176927), [39534815236](https://github.com/mohamedwael201193/ninety/actions/runs/39534815236). **VERIFIED**: no successful Actions run of the full CLI suite. |
| Smoke workflow | See the next section. | |
| Plans in git | 43 frontend plans in [testsprite_tests/plans](https://github.com/mohamedwael201193/ninety/tree/main/testsprite_tests/plans), ids in [test-ids.json](https://github.com/mohamedwael201193/ninety/blob/main/testsprite_tests/test-ids.json). 28 Python tests in [testsprite_tests/backend](https://github.com/mohamedwael201193/ninety/tree/main/testsprite_tests/backend), ids in [backend-ids.json](https://github.com/mohamedwael201193/ninety/blob/main/testsprite_tests/backend-ids.json). Index: [testsprite_tests/README.md](https://github.com/mohamedwael201193/ninety/blob/main/testsprite_tests/README.md). | File counts **VERIFIED** (43 plans = 43 ids, 28 `.py` = 28 ids, no orphans). |
| Red→green record | [LOOP-ITERATIONS.md](https://github.com/mohamedwael201193/ninety/blob/main/LOOP-ITERATIONS.md) and [LOOP.md](https://github.com/mohamedwael201193/ninety/blob/main/LOOP.md), generated by [scripts/loop-iterations.mjs](https://github.com/mohamedwael201193/ninety/blob/main/scripts/loop-iterations.mjs). Why red: [red-runs.json](https://github.com/mohamedwael201193/ninety/blob/main/testsprite_tests/red-runs.json). | Narrative **UNVERIFIED** as a full replay. The #62 green and #63 red statuses above were re-read from `gh pr checks`. |
| Issue triage for two workflows | [run-ledger.yml](https://github.com/mohamedwael201193/ninety/blob/main/.github/workflows/run-ledger.yml) listens only to `workflow_run` of **TestSprite CLI** and **Commission drift**. A red run opens/comments a `testsprite-red` issue; green comments “green again”. | Latest ledger after drift: [run 39897197615](https://github.com/mohamedwael201193/ninety/actions/runs/39897197615) success (2026-10-23). |

“Required” is what the README and [docs/evidence/testsprite/gh-branch-protection-testsprite-v3-required.png](https://github.com/mohamedwael201193/ninety/blob/main/docs/evidence/testsprite/gh-branch-protection-testsprite-v3-required.png) claim for `TestSprite V3` and `TestSprite backend (28 API tests)`. **UNVERIFIED now**: `GET /repos/.../branches/main/protection` and the GraphQL `branchProtectionRules` field both returned 403; `rulesets` was an empty list. PR #63 merged at `7bdf5b1` (2026-10-21T01:23:48Z) while `TestSprite V3` was still failure. The gate can be bypassed, or it is not actually required.

### `.github/workflows/testsprite-smoke.yml`

File: [testsprite-smoke.yml](https://github.com/mohamedwael201193/ninety/blob/main/.github/workflows/testsprite-smoke.yml).

- **Enabled as a workflow file** (it is on `main` and GitHub schedules it). **The nightly job does not run tests.** `if` is `workflow_dispatch` OR (`schedule` AND `vars.TESTSPRITE_SMOKE == 'true'`). Cron `41 3 * * *`.
- **What it is supposed to run:** three frontend tests against `https://ninety-coral.vercel.app`, CLI 0.15.0: `TS01-example-trips`, `TS03-add-trip`, `TS07-ees-gap`. It resolves those names through `test-ids.json` and calls `testsprite test run <id> <id> <id> --target-url … --wait --timeout 900` with JUnit + `dorny/test-reporter`. Comment in the file: 3 × 0.5 = 1.5 credits vs 21.5 for all 43.
- **Scheduled runs are skipped**, which is the intended off switch. Latest: [run 39897150801](https://github.com/mohamedwael201193/ninety/actions/runs/39897150801) (2026-10-23, skipped), also [39719042867](https://github.com/mohamedwael201193/ninety/actions/runs/39719042867) and [39540784511](https://github.com/mohamedwael201193/ninety/actions/runs/39540784511).
- **The only execution failed.** Manual `workflow_dispatch` [run 39724385899](https://github.com/mohamedwael201193/ninety/actions/runs/39724385899) (2026-10-22, 16s, commit `22dd129`) passed `testsprite doctor` (CLI 0.15.0, key accepted) and then:

```
Error: Invalid request.
Flag `--test-id` is invalid: several test ids run through one tunnel with --local <port>. For tests the runner can already reach, use `testsprite test run --all --project <id> [--filter <text>]`, or run them one at a time.
Process completed with exit code 5.
```

The command passed three ids and `--target-url` and did not pass `--local`. CLI 0.15.0 rejects that. Backend runs avoid it by calling `test run` once per id ([backend-run.mjs](https://github.com/mohamedwael201193/ninety/blob/main/scripts/ci/backend-run.mjs) line 51). The README still says the smoke workflow “has not run yet”. That sentence is stale: it has run, and it failed before any test started.

The ledger does not subscribe to this workflow, so the failure opened no `testsprite-red` issue.

### Missing

- No TestSprite MCP server config in the repo.
- Nightly full-suite CLI and post-merge production CLI are off (variables not observed; every Actions run of that workflow is `skipped`). The backend workflow’s own comment says this Vercel project does not emit GitHub `deployment_status`, so the `TESTSPRITE_ON_MAIN` path would not fire even if the variable were set.
- No schedule that actually executes TestSprite tests. Smoke’s schedule skips; the CLI schedule skips.
- Triage does not cover the GitHub App check, the backend workflow, or the smoke workflow.
- Frontend plans `TS43-developers-api` and `TS44-openapi-document` are parked in [docs/testsprite-parked/](https://github.com/mohamedwael201193/ninety/tree/main/docs/testsprite-parked) and are not in `test-ids.json` ([docs/AFTER-CREDIT-BOOST.md](https://github.com/mohamedwael201193/ninety/blob/main/docs/AFTER-CREDIT-BOOST.md)).
- Plan ids are not contiguous (no TS11, TS12, TS19, TS20, TS22–TS25, TS32, TS33). 43 plans exist; the numbers go up to TS52.

## Test inventory

| Count | What | Where | Status |
|---|---|---|---|
| 367 passed, 3 skipped (370) | Vitest cases, 67 files | Local `npx vitest run` on 2026-10-23, default `FUZZ_RUNS` (150). Same 367/3 in nightly CI with `FUZZ_RUNS=3000`: [run 39890581863](https://github.com/mohamedwael201193/ninety/actions/runs/39890581863) job log. Script: [package.json](https://github.com/mohamedwael201193/ninety/blob/main/package.json) `"test": "vitest run"`. | **VERIFIED** |
| 3 skipped | Live Commission tests, `it.runIf(PARITY_LIVE)` | 2 in [parity.test.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/parity.test.ts), 1 in [deep.test.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/deep/deep.test.ts) | **VERIFIED** (they skipped locally) |
| 14/14 stored | Parity scenarios vs vendored script | [parity.test.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/parity.test.ts) | **VERIFIED** (inside the 367) |
| 399/400 of 412 | Deep field parity | [deep.test.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/deep/deep.test.ts) | **VERIFIED** (inside the 367) |
| 12 | Hand-worked golden cases | [golden.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/golden.ts), [golden.test.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/golden.test.ts) | **VERIFIED** (file count + live API matches) |
| 150 histories, 0 disagreements | Differential fuzz, local default | [differential.fuzz.test.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/differential.fuzz.test.ts). Local stdout: seed `20261019`, 150 histories, 0 disagreements. | **VERIFIED** |
| 500 per PR / 3000 per night | Same fuzzer under CI | [ci.yml](https://github.com/mohamedwael201193/ninety/blob/main/.github/workflows/ci.yml) `FUZZ_RUNS`. Nightly log: seed `39890581863`, 3000 histories, 0 disagreements ([run 39890581863](https://github.com/mohamedwael201193/ninety/actions/runs/39890581863)). PR-time 500 was not re-run here. | 3000 **VERIFIED** from the log; 500 **UNVERIFIED** this session (defined in the workflow) |
| fast-check properties | Inside the 367, not extra cases | [properties.test.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/properties.test.ts) `RUNS = 1250`; [properties.legal.test.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/schengen/properties.legal.test.ts) `RUNS = 1000` (one property `numRuns: 300`); [cutoff.properties.test.ts](https://github.com/mohamedwael201193/ninety/blob/main/src/lib/ees/cutoff.properties.test.ts) `numRuns: 1000` | **VERIFIED** as part of the green Vitest run; per-property run counts **UNVERIFIED** beyond reading the source |
| 43 | TestSprite frontend plans | [test-ids.json](https://github.com/mohamedwael201193/ninety/blob/main/testsprite_tests/test-ids.json) and `testsprite_tests/plans/*.json` | Count **VERIFIED**. Last full green cloud run **VERIFIED** as a GitHub check on #62 (43/43), not re-executed here. Latest PR #63 is 42/43. |
| 28 | TestSprite backend API tests | [backend-ids.json](https://github.com/mohamedwael201193/ninety/blob/main/testsprite_tests/backend-ids.json) and `testsprite_tests/backend/*.py` | Count **VERIFIED**. Latest Actions runs on #63 and `main` succeeded (links above). Individual pass/fail lines were not re-downloaded. |
| 2 | stdio MCP end-to-end tests | [stdio.test.mjs](https://github.com/mohamedwael201193/ninety/blob/main/packages/ninety-mcp/test/stdio.test.mjs), [unknown-tool.test.mjs](https://github.com/mohamedwael201193/ninety/blob/main/packages/ninety-mcp/test/unknown-tool.test.mjs). Local `npm test` in that package: 2 pass, 0 fail. CI job in [run 39890581863](https://github.com/mohamedwael201193/ninety/actions/runs/39890581863) also success. | **VERIFIED** |
| 0 | Mutation testing | No Stryker (or similar) in [package.json](https://github.com/mohamedwael201193/ninety/blob/main/package.json) or workflows | **VERIFIED** absent |
| Schemathesis | OpenAPI fuzz, not a unit count | [api-contract.yml](https://github.com/mohamedwael201193/ninety/blob/main/.github/workflows/api-contract.yml), `schemathesis==4.0.0`, `--max-examples 200`, phases `examples,fuzzing`. PR #63 [run 39525371703](https://github.com/mohamedwael201193/ninety/actions/runs/39525371703) success. | Run **VERIFIED** via Actions; not re-executed locally |
| axe, 8 pages × 2 viewports | Accessibility job | [a11y.yml](https://github.com/mohamedwael201193/ninety/blob/main/.github/workflows/a11y.yml). PR #63 [run 39525371604](https://github.com/mohamedwael201193/ninety/actions/runs/39525371604) success. | Run **VERIFIED** via Actions; not re-executed locally |
| 59 merged PRs | `gh pr list --state merged` length | [merged PR search](https://github.com/mohamedwael201193/ninety/pulls?q=is%3Apr+is%3Amerged). Closed unmerged: [#2](https://github.com/mohamedwael201193/ninety/pull/2), [#19](https://github.com/mohamedwael201193/ninety/pull/19). No open PRs. | **VERIFIED** |
| Nightly live 14/14 | Commission drift | [drift.yml](https://github.com/mohamedwael201193/ninety/blob/main/.github/workflows/drift.yml) runs only `parity.test.ts` with `PARITY_LIVE=1`. Latest success [run 39897153358](https://github.com/mohamedwael201193/ninety/actions/runs/39897153358) (2026-10-23). Failure [run 39540790020](https://github.com/mohamedwael201193/ninety/actions/runs/39540790020) (2026-10-21): stored hash `bd538a7d…` ≠ live `5746055a…`, and status was `couldn't verify`. | **VERIFIED** from logs. Deep live sample is not in this workflow. |

README’s “7 real app bugs + 1 UX loading state + 8 review bugs reproduced red-then-green” is the project’s own classification in [README.md](https://github.com/mohamedwael201193/ninety/blob/main/README.md). **UNVERIFIED** as an independent recount. The #63 TS42 flake is **VERIFIED** as the failing check description “42/43 passed · 1 failed”.

## Live site

Curled 2026-10-23 (no browser). Status and what the HTML contains:

| Request | Status | What came back |
|---|---|---|
| `GET /` | 200 `text/html` | Title `Ninety — Schengen days left`. H1 `Know your Schengen days before the border does.` |
| `GET /ees` | 200 | Title `EES check — compare your days with the border's count · Ninety`. H1 `Does the border's count match yours?` |
| `GET /letter` | 200 | Title `Article 52 correction letter · Ninety`. H1 `Your correction request, written for you.` |
| `GET /parity` | 200 | SSR `data-testid=parity-score` text `14/14 match`. Origin label starts `Stored official copy (checking the live page…)`. `data-testid=deep-parity-score` is `399/400 scenarios match the Commission calculator on every field`. The serialized initial `deepLive` is `couldn't verify` until the client fetch. |
| `GET /proof` | 200 | Title `Proof: every rule and the tests that guard it · Ninety` |
| `GET /developers` | 200 | Title `API and MCP server · Ninety`. H1 `The same engine, as an API and an MCP server` |
| `GET /sitemap.xml` | 200 | `/`, `/ees`, `/letter`, `/parity`, `/developers`, `/proof` |
| `GET /robots.txt` | 200 | `Allow: /`, `Disallow: /api/` |
| `GET /no-such-page` | 404 `text/html` | HTML 404 (not a Vercel platform error) |
| `GET /api/openapi.json` | 200 | OpenAPI `3.1.0`, title `Ninety API`, paths `/api/v1/check`, `/api/v1/ees-reconcile`, `/api/v1/letter` |
| `GET /api/parity` | 200 | `origin=live`, `score=14/14`, 14/14 rows match, 12/12 golden match, `deepLive` `19/20`. Source `https://ec.europa.eu/assets/home/visa-calculator/calculator.htm` |
| `GET /api/v1/check` | 405 `application/json` | GET not allowed |
| `POST /api/v1/check` | 200 | Example trips on `2026-10-19`: `daysUsed=88`, `daysLeft=2`, `latestExit=2026-10-20`, `overstays=[]`. CORS `access-control-allow-origin: *` |
| `POST /api/v1/ees-reconcile` | 200 | Trips 10 days vs EES 30: `figureGap=20`, codes `figure-differs` and `likely-missing-exit` |
| `GET /api/mcp` | 405 | |
| `POST /api/mcp` `initialize` | 200 | JSON-RPC result, `protocolVersion` `2025-06-18`, server `ninety` `1.0.0` |

Security headers on the check response: `content-security-policy: frame-ancestors 'self'; …`, `referrer-policy: no-referrer`, `x-content-type-options: nosniff`, `strict-transport-security`. No `video`, YouTube, or Loom URL in those six HTML documents.

## Demo

No demo video in the repo (no `.mp4`, no YouTube/Loom URL in markdown, TSX, or JSON) and none linked from the six live pages. Still images: [docs/screens/](https://github.com/mohamedwael201193/ninety/tree/main/docs/screens) (`hero.png`, `calculator.png`, `ees-check.png`, `letter.png`, `parity.png`) embedded in the README. The live site itself is the demo.

## Known gaps and weaknesses

- **Smoke workflow is broken on the only path that executes it.** CLI 0.15.0 rejects multiple test ids on `test run` unless `--local` is set. The file passes three ids plus `--target-url`. [Run 39724385899](https://github.com/mohamedwael201193/ninety/actions/runs/39724385899) failed in 16s with exit 5, before any test. Nightly stays skipped. README still says it has not run.
- **No scheduled TestSprite execution is turned on.** Full CLI nightly and post-merge flags default off; every CLI Actions run is skipped. `deployment_status` is the wrong signal for this Vercel project (stated in the backend workflow).
- **The last merged PR is red on the frontend cloud check.** #63 is 42/43. README calls TS42 an agent-read flake and says an isolated rerun passed 9/9. That isolated rerun was not repeated for this baseline. Merging over the red check means the “required” gate did not block `main`.
- **Branch protection could not be re-read** (API 403). Treat “required checks” as a README/screenshot claim, not a current API fact.
- **Triage is narrow.** The run ledger ignores the GitHub App, the backend workflow, and the smoke workflow. A smoke failure does not open an issue.
- **Live Commission dependency is flaky.** Drift failed on 2026-10-21 (hash mismatch and `couldn't verify`) and passed on 2026-10-23. `/parity` first paint is always the stored copy; the API happened to reach the live page during this curl (`origin=live`). One deep-sample disagreement remains (`overlap-overstay-two-trips`, counted as a Commission quirk, so the badge is 399/400, not 400/400).
- **Repo description is stale** (“14-test” suite). Two frontend plans (developers page, OpenAPI document) are still parked.
- **No mutation testing. No demo video.** Fuzzing that does exist: differential histories vs the Commission script, fast-check properties, and Schemathesis on the OpenAPI document.
- **No TestSprite MCP** in this repo. The product’s own MCP server is real (stdio tests passed locally; live `initialize` returned 200).
- **TestSprite frontend runs are outside the repo’s workflows.** A reviewer cannot see the GitHub App’s config, schedule, or heal settings from git. The Actions CLI path that would duplicate them has never completed a run.
