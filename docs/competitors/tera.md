# Tera — competitor review

**Name:** Tera
**Author:** Pugar Huda Mantoro (`PugarHuda`)
**Repo:** https://github.com/PugarHuda/tera
**Live:** https://tera-orpin-three.vercel.app
**Also checked:** https://tera-orpin-three.vercel.app/simulator?s=S05 and https://tera-orpin-three.vercel.app/parity
**TestSprite PRs called out in the brief:** [#18](https://github.com/PugarHuda/tera/pull/18), [#38](https://github.com/PugarHuda/tera/pull/38), [#40](https://github.com/PugarHuda/tera/pull/40) (closed, not merged)
**Demo:** https://github.com/PugarHuda/tera/blob/main/docs/tera-demo.mp4
**Article:** https://dev.to/hudapugar/i-let-stripe-grade-my-tests-building-a-billing-simulator-where-no-expected-value-comes-from-my-own-4iil
**Review date:** 2026-10-23
**Reviewer model:** Grok 4.7
**Repo HEAD reviewed:** `05fdac6e64d8ac63dc1b4127b844853eedbf386e` (merge of [#47](https://github.com/PugarHuda/tera/pull/47), 2026-10-23T08:45:14Z)
**Method:** shallow clone (`git clone --depth 200`), `gh` read-only, curl of the live site, `ffprobe` on the raw demo MP4, local `npm test`. No comments, stars, forks, or writes to the competitor repo. `node_modules` removed after the test run.

Every number below is **VERIFIED** (reproduced here, or read from a GitHub/API/live response on this date) or **UNVERIFIED** / **FALSE** with the evidence that makes it so.

---

## What it is

Tera is a no-account Stripe-parity billing simulator for someone about to change SaaS pricing. You describe a customer timeline (subscribe, trial, seats, upgrade, coupon, tax, pause, metered usage, one-off invoice item, cancel) and it returns every invoice to the cent, plus the webhook events Stripe would send. A second surface, the migration planner, estimates MRR if you move existing seats to a new price, with or without grandfathering. The product rule, stated in the [dev.to article](https://dev.to/hudapugar/i-let-stripe-grade-my-tests-building-a-billing-simulator-where-no-expected-value-comes-from-my-own-4iil) and in [README](https://github.com/PugarHuda/tera/blob/main/README.md), is that expected invoices are derived by hand and then replayed in a real Stripe test-mode test clock. The engine is not allowed to snapshot its own output and call that the oracle. It never moves live money. Repo created 2026-10-17, 0 stars, 0 forks, public, no license, description “TestSprite Hackathon S4” ([`gh repo view`](https://github.com/PugarHuda/tera)).

## Architecture

Stack from [package.json](https://github.com/PugarHuda/tera/blob/main/package.json) and the README “Develop” section: Next.js `16.4.2` (App Router, `cacheComponents`), React `19.3.0`, TypeScript 5, Tailwind 4, Zod 4, Vitest `5.0.5`, `stripe@23`, `mcp-handler@2` / `@modelcontextprotocol/server@2`. Node 24 in CI. Deployed on Vercel (`server: Vercel` on live responses). Production host `tera-orpin-three.vercel.app`. Preview hosts are branch aliases of the form `tera-git-<slug>-hudas-projects-a8e7f558.vercel.app` (hard-coded in [e2e.yml](https://github.com/PugarHuda/tera/blob/main/.github/workflows/e2e.yml) and [testsprite-api.yml](https://github.com/PugarHuda/tera/blob/main/.github/workflows/testsprite-api.yml)).

One engine, [src/lib/billing.ts](https://github.com/PugarHuda/tera/blob/main/src/lib/billing.ts) (1,108 lines), feeds the pages, the REST API, and the MCP server. Validation is a separate trust boundary in [src/lib/validate.ts](https://github.com/PugarHuda/tera/blob/main/src/lib/validate.ts) (257 lines). Money formatting is [src/lib/money.ts](https://github.com/PugarHuda/tera/blob/main/src/lib/money.ts) (19 lines). Stripe test-clock replay, invoice diff, webhook diff, catalog push, and the shared cooldown live in [src/lib/stripe-parity.ts](https://github.com/PugarHuda/tera/blob/main/src/lib/stripe-parity.ts) (580 lines).

| Surface | Role | Source |
|---|---|---|
| `/` | Landing hero with S05’s computed invoice and the parity count | [src/app/page.tsx](https://github.com/PugarHuda/tera/blob/main/src/app/page.tsx) |
| `/simulator` | Timeline editor, invoices, webhooks, “Verify in Stripe”. `?s=S05` loads a golden; `?t=` is a share link. Old `/?t=` and `/?s=` redirect | [simulator/page.tsx](https://github.com/PugarHuda/tera/blob/main/src/app/simulator/page.tsx), [next.config.ts](https://github.com/PugarHuda/tera/blob/main/next.config.ts) |
| `/builder` | Custom catalog, push to Stripe test mode, import the account catalog | [builder/page.tsx](https://github.com/PugarHuda/tera/blob/main/src/app/builder/page.tsx) |
| `/migrate` | MRR impact, grandfathering, CSV, import live test-mode subscriptions | [migrate/page.tsx](https://github.com/PugarHuda/tera/blob/main/src/app/migrate/page.tsx) |
| `/parity` | Stored Stripe evidence, one row per timeline | [parity/page.tsx](https://github.com/PugarHuda/tera/blob/main/src/app/parity/page.tsx) |
| `/reference` | Scalar API reference | [reference/route.ts](https://github.com/PugarHuda/tera/blob/main/src/app/reference/route.ts) |
| `/mcp-setup` | Live `tools/list` from this deployment | [mcp-setup/page.tsx](https://github.com/PugarHuda/tera/blob/main/src/app/mcp-setup/page.tsx) |
| `/api/mcp` | Streamable HTTP MCP | [api/mcp/route.ts](https://github.com/PugarHuda/tera/blob/main/src/app/api/mcp/route.ts) |
| `/llms.txt` | Agent index built from the same sources | [llms.txt/route.ts](https://github.com/PugarHuda/tera/blob/main/src/app/llms.txt/route.ts) |

REST paths in the live OpenAPI 3.1 document (`GET /api/openapi.json`, 2026-10-23): `/api/simulate`, `/api/migrate`, `/api/migrate/stripe`, `/api/parity`, `/api/scenarios`, `/api/scenarios/{id}`, `/api/stripe/catalog`, `/api/stripe/push`. Unknown `/api/*` is a JSON 404 from [api/[...path]/route.ts](https://github.com/PugarHuda/tera/blob/main/src/app/api/%5B...path%5D/route.ts).

Goldens are data, not snapshots of the engine: [golden/scenarios.json](https://github.com/PugarHuda/tera/blob/main/golden/scenarios.json) (7,661 lines). Stripe receipts are [golden/parity/Sxx.json](https://github.com/PugarHuda/tera/tree/main/golden/parity) plus [index.json](https://github.com/PugarHuda/tera/blob/main/golden/parity/index.json). S05’s receipt records `match: true`, API `2026-09-30.endive`, test clock `clock_1USeuI2QR5nixgqN068NZs7f`, verified `2026-10-20T15:25:22.754Z` ([S05.json](https://github.com/PugarHuda/tera/blob/main/golden/parity/S05.json)).

There is no database. State is the timeline in the URL and the committed JSON. CSP allows TestSprite to frame the app (`frame-ancestors 'self' https://testsprite.com https://*.testsprite.com`) in [next.config.ts](https://github.com/PugarHuda/tera/blob/main/next.config.ts). That header is present on the live home response.

The demo is a second Remotion project under [video/](https://github.com/PugarHuda/tera/tree/main/video) (its own `package.json`, excluded from the root ESLint config). Playwright records the live app; Remotion adds narration from [video/narration.json](https://github.com/PugarHuda/tera/blob/main/video/narration.json).

### Counts in the repo right now

Counted from `golden/scenarios.json` and `golden/parity/` on `05fdac6`:

| Count | What |
|---|---|
| 143 | Scenario objects |
| 140 | With a `timeline` (replayable) |
| 3 | Migration scenarios, no invoices (`migration` flag; S24 and S25 are the ones the triage script names) |
| 140 | Files `golden/parity/Sxx.json` |
| 140 | Rows in `index.json`, **140 with `match: true`, 0 mismatches** |
| 0 | Timeline ids missing evidence, or evidence ids without a timeline |
| 355 | Stripe invoice objects summed across the 140 `stripe` arrays |
| 140 | Of those files also store a `webhooks` recording |

Live agrees: `GET /api/scenarios` returned a JSON array of length **143**. `/parity` SSR text is `140 / 140 scenarios match Stripe to the cent` (`data-testid=parity-summary`), 140 `parity-Sxx-badge` nodes, 140 “✅ Match”, 0 “❌ Diff”, 0 “Not replayable”. The landing `data-testid=proof` reads **140 / 140** and **355** “Stripe invoices compared line by line”.

The [article](https://dev.to/hudapugar/i-let-stripe-grade-my-tests-building-a-billing-simulator-where-no-expected-value-comes-from-my-own-4iil) and the [demo narration](https://github.com/PugarHuda/tera/blob/main/video/narration.json) still say **138 scenarios / 135 timelines**. That pair was true at the merge of [#43](https://github.com/PugarHuda/tera/pull/43) through [#46](https://github.com/PugarHuda/tera/pull/46) (evidence index length 135, all `match`). [#47](https://github.com/PugarHuda/tera/pull/47) added S139–S143 the same morning and moved the live number to 140/140. The article and the video were not updated.

## TestSprite integration depth

**Depth score: 9 / 10.**

Two TestSprite projects, both named in [AGENTS.md](https://github.com/PugarHuda/tera/blob/main/AGENTS.md):

- UI project `279e68e6-64c8-4c60-956e-6432e9e40f00` (also the `projectId` on every file in [testsprite/plans/](https://github.com/PugarHuda/tera/tree/main/testsprite/plans)).
- API project `065f775a-db05-4c9e-a4f4-bfd6605e7fd7`.

CLI pin in workflows and scripts: `@testsprite/testsprite-cli@0.15.0`. There is no `.testsprite` directory and no TestSprite MCP config. The `.claude/skills/testsprite-*` files are agent-skill notes for the CLI, not an MCP server. Tera’s own MCP server (section below) is a product surface, not a TestSprite integration.

What earns the 9: a GitHub App check on almost every PR, plans and hand-written Playwright committed and diffed against the cloud copy including stored code, a second CLI project whose tests are rewritten onto the PR preview, a declared nightly TestSprite test-list schedule that CI asserts still matches, a triage script wired to `check_run`, a generated per-commit ledger, and a planted-bug PR that stayed unmerged. What keeps it off 10: the triage job has never posted a comment; the API job exits 0 when credits are short, so a “required” API check can go green without testing; eight PRs merged while the latest `TestSprite V3` verdict was a credit failure; `docs/LOOP.md` on `main` stops at #43.

### GitHub App check `TestSprite V3`

Not a file in `.github/workflows`. It is a commit status and, on later SHAs, a check run, both named `TestSprite V3`. This review listed all 47 PRs (`gh pr list --state all --limit 100`) and, for every commit on every PR, read `GET /commits/{sha}/status` and `GET /commits/{sha}/check-runs` (the same two sources [scripts/loop-ledger.mjs](https://github.com/PugarHuda/tera/blob/main/scripts/loop-ledger.mjs) uses).

**44 of 47 PRs have at least one `TestSprite V3` verdict. Three do not:** [#14](https://github.com/PugarHuda/tera/pull/14) (closed, not merged), [#24](https://github.com/PugarHuda/tera/pull/24) (merged 2026-10-20), [#25](https://github.com/PugarHuda/tera/pull/25) (merged 2026-10-20).

Dashboard org/project prefix, from the status `target_url`s: `https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/`.

The suite grew in public: 16 tests (PR #1) → 18 → 20 → 22 → 23 → 24 → 26 → 28 → **29** (PR #46, “All 29 tests passed”). Credit-failure descriptions quote the price: “24 tests need 12”, “26 tests need 13”, “28 tests need 14”. [AGENTS.md](https://github.com/PugarHuda/tera/blob/main/AGENTS.md) now says a UI run is 0.5 credits, so 29 tests cost 14.5.

#### Every PR and its `TestSprite V3` result

“Final” is the last commit on the PR that had a verdict, else “none”. Credit rows are failures whose description matches `/credit|billing/i` (the ledger script’s rule). Links are the dashboard execution when the status carried one.

| PR | Merged? | Final `TestSprite V3` | Trail (short SHA, as GitHub recorded it) |
|---|---|---|---|
| [#1](https://github.com/PugarHuda/tera/pull/1) | yes | success, 16/16 | one commit none, then `456f763` success |
| [#2](https://github.com/PugarHuda/tera/pull/2) | yes | success, 16/16 | [`f8b8603` 13/16 · 2 failed · 1 blocked](https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/execution/b4adf14a-48f5-4ee1-b13f-0b0c16aa80cd) → `e53c9e6` success |
| [#3](https://github.com/PugarHuda/tera/pull/3) | yes | success, 16/16 | [`55ed5ad` 15/16 · 1 failed](https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/execution/47dfb445-7f41-4da0-9b13-51070fd9e60d) → `d7d1228` success |
| [#4](https://github.com/PugarHuda/tera/pull/4) | yes | success, 16/16 | three successes (`9a8302b`, `a8b9a66`, `efdf9eb`); two commits with no check |
| [#5](https://github.com/PugarHuda/tera/pull/5) | no | success, 16/16 | `54f4cc7` success. Closed unmerged (superseded by #9) |
| [#6](https://github.com/PugarHuda/tera/pull/6) | yes | success, 18/18 | [`5157bfa` 17/18 · 1 failed](https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/execution/6c250bcb-50e0-44e2-84de-a502122b5195) → `a3156fe` success |
| [#7](https://github.com/PugarHuda/tera/pull/7) | yes | success, 18/18 | `42b15bf` success |
| [#8](https://github.com/PugarHuda/tera/pull/8) | yes | success, 18/18 | four successes |
| [#9](https://github.com/PugarHuda/tera/pull/9) | yes | success, 16/16 | four successes (shares early SHAs with #4/#5) |
| [#10](https://github.com/PugarHuda/tera/pull/10) | yes | success, 18/18 | `b171000` success |
| [#11](https://github.com/PugarHuda/tera/pull/11) | yes | success, 18/18 | four successes |
| [#12](https://github.com/PugarHuda/tera/pull/12) | yes | success, 20/20 | `e065dfc` success |
| [#13](https://github.com/PugarHuda/tera/pull/13) | yes | success, 20/20 | two successes |
| [#14](https://github.com/PugarHuda/tera/pull/14) | no | **no check on any of 7 commits** | closed unmerged |
| [#15](https://github.com/PugarHuda/tera/pull/15) | yes | success, 22/22 | `e1039c7` success (earlier commits none) |
| [#16](https://github.com/PugarHuda/tera/pull/16) | yes | success, 22/22 | `dd6d3ad` success |
| [#17](https://github.com/PugarHuda/tera/pull/17) | yes | success, 22/22 | `989641d` success |
| [#18](https://github.com/PugarHuda/tera/pull/18) | yes | success, 23/23 | [`bfe689f` 21/22](https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/execution/60181450-dacc-4388-9509-73e0e4875d4b) → [`81625ef` 22/23](https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/execution/620e3540-448a-4610-a0e1-6d163904e1dd) → [`1d1e0f6` 23/23](https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/execution/6a71b9ca-b499-42b0-89ff-fd2c3dd43c1e) |
| [#19](https://github.com/PugarHuda/tera/pull/19) | yes | success, 24/24 | `11ed46c` success |
| [#20](https://github.com/PugarHuda/tera/pull/20) | yes | success, 24/24 | `40c0ed6` success |
| [#21](https://github.com/PugarHuda/tera/pull/21) | yes | success, 24/24 | `fc885fc` success |
| [#22](https://github.com/PugarHuda/tera/pull/22) | no | **credits**, 24 tests need 12, 6.4 left | `266e223` failure. Closed unmerged |
| [#23](https://github.com/PugarHuda/tera/pull/23) | **yes, while red** | credits, three commits | `d29cc19`, `4547fb1`, `e1695bc` all “Not enough credits” |
| [#24](https://github.com/PugarHuda/tera/pull/24) | **yes** | **no check** | both commits none |
| [#25](https://github.com/PugarHuda/tera/pull/25) | **yes** | **no check** | one commit none |
| [#26](https://github.com/PugarHuda/tera/pull/26) | **yes, while red** | credits | `15e51a3`, `ee16060` |
| [#27](https://github.com/PugarHuda/tera/pull/27) | **yes, while red** | credits | `e017ca3`, `ca6f5cf` |
| [#28](https://github.com/PugarHuda/tera/pull/28) | yes | success, 24/24 | 19 credit failures, then `d364f7e` success |
| [#29](https://github.com/PugarHuda/tera/pull/29) | yes | success, 24/24 | two successes |
| [#30](https://github.com/PugarHuda/tera/pull/30) | yes | success, 24/24 | `1ce806f` |
| [#31](https://github.com/PugarHuda/tera/pull/31) | yes | success, 24/24 | `3afb7de` |
| [#32](https://github.com/PugarHuda/tera/pull/32) | yes | success, 26/26 | `2238724` |
| [#33](https://github.com/PugarHuda/tera/pull/33) | yes | success, 26/26 | `f9c5515` |
| [#34](https://github.com/PugarHuda/tera/pull/34) | yes | success, 26/26 | `5d6ba2b` |
| [#35](https://github.com/PugarHuda/tera/pull/35) | **yes, head was red** | credits on head `d8fa6c7` | `6d086d7` 26/26 → [`d227dab` 25/26](https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/execution/2633fbd1-405d-4c50-a6de-75f1c81fcfc4) → `3be6953` 26/26 → `d8fa6c7` credits ([check run 119082728131](https://github.com/PugarHuda/tera/runs/119082728131)). Merged 2026-10-21T08:44:25Z at that head |
| [#36](https://github.com/PugarHuda/tera/pull/36) | **yes, while red** | credits, 28 tests need 14, 2.3 left | three commits, never green |
| [#37](https://github.com/PugarHuda/tera/pull/37) | **yes, while red** | credits, down to 1.8 left | three commits, never green |
| [#38](https://github.com/PugarHuda/tera/pull/38) | **yes, while red** | credits, 28 tests need 14, 0.8 left | 10 credit failures, never green. Merged 2026-10-22 |
| [#39](https://github.com/PugarHuda/tera/pull/39) | **yes, while red** | credits | `988993b` |
| [#40](https://github.com/PugarHuda/tera/pull/40) | no | credits, **not a test result** | `e7c52f6` “28 tests need 14, 0.8 available” ([check run 119701202200](https://github.com/PugarHuda/tera/runs/119701202200)). Closed unmerged. The rounding bug was caught by other checks; see below |
| [#41](https://github.com/PugarHuda/tera/pull/41) | yes | success, 28/28 | three credit failures, then `468b5c2` and `dfd8b93` success |
| [#42](https://github.com/PugarHuda/tera/pull/42) | yes | success, 28/28 | `9f4b481` credits → `4068599` success |
| [#43](https://github.com/PugarHuda/tera/pull/43) | yes | success, 28/28 | `5289a85` credits → `1909ef2` success |
| [#44](https://github.com/PugarHuda/tera/pull/44) | yes | success, 28/28 | `da8d41e` success. **Not in `docs/LOOP.md`** |
| [#45](https://github.com/PugarHuda/tera/pull/45) | yes | success, 28/28 | `c0190ec` success. Not in the ledger |
| [#46](https://github.com/PugarHuda/tera/pull/46) | yes | success, **29/29** | [`1c86013`](https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/execution/2528d95e-a2b5-4245-aaa6-8afae7e18d61). Not in the ledger |
| [#47](https://github.com/PugarHuda/tera/pull/47) | yes | success, **29/29** | [`4f3504d`](https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/execution/1b35a8db-adb5-4e56-a4d8-97e30303ef75). Not in the ledger |

The dashboard pages themselves are behind a TestSprite login (fetched execution `60181450…` returned a sign-in wall). The pass/fail counts above are the GitHub status descriptions, not a re-read of the dashboard UI.

**Real red → green (a test ran and failed, then a later commit on the same PR passed): 5 PRs.** #2, #3, #6, #18, #35. That matches the ledger’s “5 went red on a real test result; 5 of them were fixed in the same PR”. #35 was then merged on a *later* credit-failure head, so the real failure was fixed and the merge SHA’s check was still red.

**PRs with at least one credit-outage verdict: 14.** #22 (closed), #23, #26, #27, #28, #35, #36, #37, #38, #39, #40, #41, #42, #43. The article’s “nine” does not match this count or the ledger’s 14.

**Merged while the latest `TestSprite V3` verdict was a failure: 8.** #23, #26, #27, #35, #36, #37, #38, #39. All eight descriptions are “Not enough credits”, not a failed assertion. #24 and #25 merged with no verdict at all. After the credit boost, #41–#47 each merged on a success (28/28 or 29/29).

### Is `TestSprite V3` a required check?

`GET /repos/PugarHuda/tera/branches/main/protection` returned **403** (`Resource not accessible by integration`). `GET /repos/PugarHuda/tera/rulesets` returned **`[]`**. GraphQL `branchProtectionRules` returned **403**. Admin enforcement is **not confirmed by the API**.

What is confirmed:

- [docs/screens/pr40-merge-blocked.png](https://github.com/PugarHuda/tera/blob/main/docs/screens/pr40-merge-blocked.png) shows the #40 checks panel: “4 failing, 1 skipped, 3 successful”. **Required** badges are on `CI / Tests, types, lint, build`, `E2E user journeys / User journeys on the deployed app`, and `TestSprite V3` (“Not enough credits: 28 tests need 14, 0.8 available”). `Stripe parity / Golden scenarios match Stripe` is also failing. `Differential fuzzing vs Stripe` is skipped (path filter; #40 only changed the rounding line, which is inside `billing.ts`, so the golden job *did* run and failed). The footer still says “Still in progress? Convert to draft”, so the screenshot is the checks panel, not a crop that includes the sentence “Merging is blocked”.
- The author’s closing comment on [#40](https://github.com/PugarHuda/tera/pull/40#issuecomment-6335862406) (2026-10-22T08:03:42Z) says the merge button stayed disabled: “Merging is blocked due to failing merge requirements.” That comment is the author’s claim, consistent with the Required badges, and it is the only place that sentence appears.
- The same comment’s table is the accurate account of which checks actually saw the bug (quoted in the claim table below). `TestSprite V3` is listed as “not a verdict on this bug”. `TestSprite API tests` is listed as “✅ (did not run)”.
- Before 2026-10-23 the project itself says admins merged through credit failures. That history (the eight red merges above) means “admins included, and it held for the whole hackathon” is **false**. “After the boost, the last seven PRs merged only once V3 was green” is **VERIFIED** from the table.

### CLI usage

[scripts/testsprite-api-run.mjs](https://github.com/PugarHuda/tera/blob/main/scripts/testsprite-api-run.mjs) is the API runner. TestSprite backend tests have no target URL, so the script:

1. Reads `testsprite credits`.
2. If credits < 1.0 (5 tests × 0.2), writes a job summary and **`process.exit(0)`**. The comment in the file says a credit shortfall is not a test verdict.
3. Otherwise, for each file, rewrites the default `BASE_URL`, `testsprite test code put <id> --force`, `testsprite test run <id> --no-auto-heal --wait --timeout 300`, and in a `finally` puts the production URL back.
4. Exit 11 (in-flight limit) retries up to 30 times, 60s apart. A failed test exits 1.

Cloud ids:

| File | Cloud test id |
|---|---|
| `golden_contract.py` | `bfdc40f6-c768-4902-aefd-1c0a4c6c8967` |
| `credit_balance.py` | `04d59f1f-2f2d-4141-9e93-ed5fd5f92387` |
| `rejections.py` | `c7ac463c-21f9-4979-85e7-0eda50cfab4c` |
| `parity_evidence.py` | `e279d4e3-86a7-4335-ab6a-09e8744e1b97` |
| `platform.py` | `3a506d0b-dad6-48c4-9db7-5c1f17567caf` |

[scripts/testsprite-sync.mjs](https://github.com/PugarHuda/tera/blob/main/scripts/testsprite-sync.mjs) runs from [ci.yml](https://github.com/PugarHuda/tera/blob/main/.github/workflows/ci.yml) when `TESTSPRITE_API_KEY` is set. It fails if a plan’s steps differ from the cloud test, if the stored cloud code differs from `testsprite/code/<same-name>.py`, if a cloud test has no plan file, or if the test list / schedule in [testsprite/suite.json](https://github.com/PugarHuda/tera/blob/main/testsprite/suite.json) differs. `--apply` pushes lists and schedules. Latest `main` CI after #47, [run 39926896831](https://github.com/PugarHuda/tera/actions/runs/39926896831): `29/29 valid, 0 problem(s)` from `testsprite test lint`, then `29 cloud tests, 29 matched to plan files, 1 test list(s), 1 schedule(s), 0 problem(s)`. That is the evidence the nightly money-math schedule exists in the TestSprite project and matches the repo. This review could not call the TestSprite API directly (no key).

`golden_contract.py` is not a self-comparison of one function. It `GET`s `/api/scenarios` and `/api/scenarios/:id` (the committed hand-derived `expect`) and `POST`s the timeline to `/api/simulate`, then asserts lines, totals, and the amount-due formula. A rounding bug in the engine fails it, which is why #40 would have gone red if the runner had had 1.0 credits. On #40 the log is `::warning::TestSprite API tests not run: 1.0 credits needed, 0.8 available` and the check **succeeded** ([job on run 39741951030](https://github.com/PugarHuda/tera/actions/runs/39741951030)).

Nightly API runs (`workflow testsprite-api.yml`, event `schedule`):

| When (createdAt) | Result | Run |
|---|---|---|
| 2026-10-21T08:02:52Z | **failure** | [39566339357](https://github.com/PugarHuda/tera/actions/runs/39566339357). Log: the CLI rejected `--target-url` together with a full-project run (`target-url applies to a single-test run only`). That is the old shape of the workflow. The current per-id runner does not do that |
| 2026-10-22T08:00:25Z | success | [39744537991](https://github.com/PugarHuda/tera/actions/runs/39744537991) |
| 2026-10-23T07:59:37Z | success | [39921508111](https://github.com/PugarHuda/tera/actions/runs/39921508111) |

Declared cron is `0 3 * * *`. Observed starts are about five hours later. The same lag shows up on the `30 3 * * *` workflows (mutation and Stripe parity start near 08:45 UTC). Treat that as GitHub schedule delay, not a second cron.

### MCP usage (product server, not TestSprite)

`registerTool` in [src/app/api/mcp/route.ts](https://github.com/PugarHuda/tera/blob/main/src/app/api/mcp/route.ts) defines **10 tools**. [src/lib/mcp.test.ts](https://github.com/PugarHuda/tera/blob/main/src/lib/mcp.test.ts) asserts that exact set, each with `annotations` and an `outputSchema`. Live `POST /api/mcp` `tools/list` on 2026-10-23 returned the same 10, each with an output schema (HTTP 200, `text/event-stream`):

1. `simulate_timeline`
2. `verify_timeline_in_stripe`
3. `plan_price_migration`
4. `plan_stripe_price_migration`
5. `import_stripe_catalog`
6. `list_golden_scenarios`
7. `get_golden_scenario`
8. `get_parity_evidence`
9. `create_share_link`
10. `push_catalog_to_stripe`

Resources registered in source: `tera://catalog`, `tera://openapi.json`, `tera://parity`, and template `tera://scenarios/{id}`. Live `resources/list` expanded that to **146** entries (the 3 static URIs plus one URI per scenario, S01–S143). Live `prompts/list` returned **2**: `explain_invoice`, `audit_price_change`. There is no separate stdio package. `maxDuration` is 300 because `verify_timeline_in_stripe` waits on a test clock.

### Plans, code, and API tests in git

| Kind | Count | Path |
|---|---|---|
| UI plans | **29** JSON | [testsprite/plans/](https://github.com/PugarHuda/tera/tree/main/testsprite/plans) |
| UI code | **29** `.py` plus `code/_generate.py` (generator, not a test) | [testsprite/code/](https://github.com/PugarHuda/tera/tree/main/testsprite/code) |
| API tests | **5** `.py` | [testsprite/api/](https://github.com/PugarHuda/tera/tree/main/testsprite/api) |

Names (plans and code match 1:1): `ui-add-delete-events`, `ui-builder`, `ui-cancel-now`, `ui-credit-balance`, `ui-default-scenario`, `ui-edit-event`, `ui-golden-badge`, `ui-grandfather`, `ui-grandfather-mrr`, `ui-landing`, `ui-locale`, `ui-locale-de`, `ui-mcp`, `ui-migrate-default`, `ui-migrate-grandfather-toggle`, `ui-migrate-invalid`, `ui-migrate-invalid-input`, `ui-one-off-items`, `ui-out-of-order`, `ui-out-of-order-events`, `ui-parity`, `ui-pause`, `ui-reset-anchor`, `ui-s05-breakdown`, `ui-s05-totals`, `ui-trial-change`, `ui-trial-no-card`, `ui-verify-stripe`, `ui-webhooks`.

[ui-s05-totals.json](https://github.com/PugarHuda/tera/blob/main/testsprite/plans/ui-s05-totals.json) asserts “Invoice 1 dated 2027-01-01 totals $29.00, Invoice 2 dated 2027-02-01 totals $103.20 with lines -$14.03, $38.23 and $79.00”. [ui-builder.py](https://github.com/PugarHuda/tera/blob/main/testsprite/code/ui-builder.py) asserts `¥4,500`.

[testsprite/README.md](https://github.com/PugarHuda/tera/blob/main/testsprite/README.md) still says “All 28 UI tests” and its file→id table has 28 rows. It omits `ui-one-off-items.py` (cloud id `3bbfcff3-57ec-4518-8048-fdc3d3a690c4`, added in [#46](https://github.com/PugarHuda/tera/pull/46)). The same README’s API blurb omits `pull_request`, which the workflow has had since the #38 commit `16ea1df`. CI on `main` is ahead of that README: 29 matched.

[testsprite/suite.json](https://github.com/PugarHuda/tera/blob/main/testsprite/suite.json) declares one list, `Money math canary`, containing `ui-s05-totals`, `ui-edit-event`, `ui-credit-balance`, `ui-golden-badge`, and one schedule `Nightly money-math canary on production`, cron `0 3 * * *`, timezone `UTC`.

### Triage: exact classification logic, and the comment that was never posted

[scripts/testsprite-triage.mjs](https://github.com/PugarHuda/tera/blob/main/scripts/testsprite-triage.mjs), triggered by [.github/workflows/testsprite-triage.yml](https://github.com/PugarHuda/tera/blob/main/.github/workflows/testsprite-triage.yml) on `check_run` completed when `name == TestSprite V3` and `conclusion == failure` (also `workflow_dispatch` with a PR number).

Logic, in order:

1. Resolve the PR’s branch to the Vercel branch alias.
2. Load every plan in `testsprite/plans/`. `scenariosOf(testName)` finds the plan with that name and pulls `\bS\d{2,4}\b` out of the step descriptions. If none match and the text contains `Simulator`, it adds `S05`. If the text contains `Migration`, it adds `S24` and `S25`. Ids that are not in `golden/scenarios.json` are dropped.
3. `testsprite test list` / `test result --history --source github_action --since 7d`. It keeps the latest **failed** run whose `targetUrl` starts with the preview. A credit failure has no runs, so the script prints `No failed TestSprite run against <preview>: nothing to triage` and **exits 0 without commenting**.
4. For each failed run it downloads the artifact (`test artifact get`), reads `meta.json`, `failure.json`, and `steps/<failedStepIndex>-evidence.json`.
5. `check(id)` `POST`s `/api/simulate` (or `/api/migrate` for a migration scenario) on the preview and diffs totals (or numeric fields of `expect_report`) against the hand-derived JSON. The proof line is the recorded test clock id when `golden/parity/index.json` has `match: true`, otherwise the words “hand-derived”.
6. Verdict text, exact branches:
   - no scenarios mapped → “No golden scenario behind this test, so there is no Stripe ground truth to compare.”
   - every scenario has an empty diff list → “**The billing engine on this preview still matches Stripe** for {ids}, so the regression is in the UI.”
   - otherwise → “**The billing engine regressed:** it no longer produces the Stripe-verified invoices.”
7. It upserts one issue comment whose body starts with `<!-- testsprite-triage -->`.

**No such comment exists.** A search of issue comments for `TestSprite triage` returned nothing. All **17** non-skipped triage runs (the other 62 of the latest 100 were `skipped` because the completed check was not a failing `TestSprite V3`) printed the “nothing to triage” line. They all correspond to credit failures, which have no test runs. Examples:

- [run 39741998616](https://github.com/PugarHuda/tera/actions/runs/39741998616) (2026-10-22T07:39:22Z), the #40 preview `https://tera-git-study-truncated-proration-hudas-projects-a8e7f558.vercel.app`: “nothing to triage (a check that failed before running, e.g. on credits, has no runs).”
- [run 39818477826](https://github.com/PugarHuda/tera/actions/runs/39818477826), the #43 preview, same message.

The real red→green PRs (#2, #3, #6, #18, #35) predate this workflow or were not re-triaged. The classification logic is real and specific. It has not produced the PR comment the README describes. There is no example link to give.

### Red → green loops with links

| PR | What went red | Green | Note |
|---|---|---|---|
| [#2](https://github.com/PugarHuda/tera/pull/2) | 13/16, [execution b4adf14a](https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/execution/b4adf14a-48f5-4ee1-b13f-0b0c16aa80cd) | 16/16 | README: golden badge did not return after reverting an edit |
| [#3](https://github.com/PugarHuda/tera/pull/3) | 15/16, [execution 47dfb445](https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/execution/47dfb445-7f41-4da0-9b13-51070fd9e60d) | 16/16 | CI for the API suite |
| [#6](https://github.com/PugarHuda/tera/pull/6) | 17/18, [execution 6c250bcb](https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/execution/6c250bcb-50e0-44e2-84de-a502122b5195) | 18/18 | MCP + API reference PR |
| [#18](https://github.com/PugarHuda/tera/pull/18) | 21/22 then 22/23, executions [60181450](https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/execution/60181450-dacc-4388-9509-73e0e4875d4b) and [620e3540](https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/execution/620e3540-448a-4610-a0e1-6d163904e1dd) | [23/23, execution 6a71b9ca](https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/execution/6a71b9ca-b499-42b0-89ff-fd2c3dd43c1e) | The green commit message is `fix(builder): a custom catalog starts on its first licensed price, not a metered one` (`1d1e0f6`). That is the ¥4,500 bug. The dashboard body was login-walled, so the failing assertion text was not re-read |
| [#35](https://github.com/PugarHuda/tera/pull/35) | 25/26, [execution 2633fbd1](https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/execution/2633fbd1-405d-4c50-a6de-75f1c81fcfc4) | 26/26 on `3be6953`, then the head went credit-red and merged | Mutation-testing PR |

### Credits

The ledger script and the API runner both refuse to treat “Not enough credits” as a failed test. The UI check does the opposite at the GitHub layer: it is a **failed** check, which is what shows the Required badge on #40, but the description says the suite did not run. Descriptions document the balance falling from 6.4 to 0.8 credits. The article’s Oct 23 update says a boost arrived; #41’s later commits and #44–#47 are green, which matches that.

### Every workflow file

Six files under [.github/workflows/](https://github.com/PugarHuda/tera/tree/main/.github/workflows). `gh workflow list` shows the same six, all active. No other workflow YAML in the repo (`api-workflows/tera.arazzo.yaml` is an Arazzo document, not a GitHub workflow).

| File | Triggers | What the jobs actually run |
|---|---|---|
| [ci.yml](https://github.com/PugarHuda/tera/blob/main/.github/workflows/ci.yml) | `pull_request`; `push` to `main` | `npm ci`, `npm test`, `next typegen`, `tsc --noEmit`, `npm run lint`, `npm run build`, `testsprite test lint --plan-from-dir testsprite/plans`, then `node scripts/testsprite-sync.mjs` if the API key is present. Concurrency cancels in progress. Timeout 15 min. Node 24 |
| [e2e.yml](https://github.com/PugarHuda/tera/blob/main/.github/workflows/e2e.yml) | `pull_request`; `push` to `main`; `workflow_dispatch` | Waits up to 10 min for the Vercel commit status. On a PR, targets the branch alias; on `main`, production. Then `node e2e/user-journeys.mjs` (Playwright + axe). Then, even if an earlier step failed (`if: !cancelled()`): Schemathesis `4.32.2` against `/api/openapi.json` excluding `stripe\|parity`, `--max-examples 100`, 4 workers; Redocly CLI `2.1.0` lint; `node api-workflows/respect-spec.mjs` then Redocly Respect on [tera.arazzo.yaml](https://github.com/PugarHuda/tera/blob/main/api-workflows/tera.arazzo.yaml); Lighthouse CI `@lhci/cli@0.15.1` on `/`, `/simulator`, `/builder`, `/migrate`, `/parity`. Uploads video, Lighthouse, and Schemathesis artifacts for 14 days. Timeout 25 min |
| [testsprite-api.yml](https://github.com/PugarHuda/tera/blob/main/.github/workflows/testsprite-api.yml) | `pull_request`; `push` to `main`; schedule **`0 3 * * *`**; `workflow_dispatch` | Waits for Vercel on PRs, picks the branch alias or production, installs CLI `0.15.0`, runs `testsprite-api-run.mjs`. Concurrency group `testsprite-api`, **not** cancel-in-progress (the stored cloud code is shared). Timeout 40 min |
| [testsprite-triage.yml](https://github.com/PugarHuda/tera/blob/main/.github/workflows/testsprite-triage.yml) | `check_run` types `completed`; `workflow_dispatch` with input `pr` | Job `if` restricts to a failing `TestSprite V3` or a manual run. Checks out, resolves the preview, runs `testsprite-triage.mjs`. `issues: write`. Timeout 15 min |
| [stripe-parity.yml](https://github.com/PugarHuda/tera/blob/main/.github/workflows/stripe-parity.yml) | `pull_request` with path filter (`billing.ts`, `stripe-parity.ts`, `timeline-gen.ts`, `golden/scenarios.json`, `verify-golden.mts`, `fuzz-parity.mts`); schedule **`30 3 * * *`**; `workflow_dispatch` | Job `golden` runs only when the event is not `schedule`: `node scripts/verify-golden.mts` with `STRIPE_SECRET_KEY`. Job `fuzz` runs only when the event is not `pull_request`: 24 classic timelines at seed `run_number*1000`, 24 flexible at `+500`, 8 classic metered at `+800`, 8 flexible metered at `+900`. One concurrency group for the whole workflow, not cancelled, because test clocks are rate-limited. Timeout 30 min each |
| [mutation.yml](https://github.com/PugarHuda/tera/blob/main/.github/workflows/mutation.yml) | `pull_request` with path filter (`validate.ts`, `money.ts`, `csv.ts`, `share.ts`, `src/lib/*.test.ts`, `stryker.config.json`); schedule **`30 3 * * *`**; `workflow_dispatch` | `npx stryker run`, upload `reports/mutation/` for 14 days. Timeout 90 min. **Not every PR.** #46 and #47’s check lists have no Stryker job |

Actions pins are SHA-pinned (`actions/checkout`, `actions/setup-node`, `actions/upload-artifact`).

### Nightly differential fuzz, including today’s failure

Latest schedule run [39926974390](https://github.com/PugarHuda/tera/actions/runs/39926974390) (2026-10-23T08:45:55Z, `main` at `05fdac6`) **failed**. The golden job was skipped, which is what the workflow says for `schedule`. The fuzz job:

- 24 classic timelines, seeds 68000+: **0 findings**
- 24 flexible, seeds 68500+: **1 finding**. `seed 68515 MATCH WEBHOOK-DIFF` (4 invoices, clock `clock_1UTeGq2QR5nixgqNspNTLduW`). Invoices matched. Webhooks did not: `event 4 (resume) invoice.paid #2: tera=0 stripe=1`. Timeline: flexible subscribe `pro_m` qty 4 with a billing anchor, `FOREVER25`, a one-off `add_invoice_item` of 400, pause, resume `unchanged`, `advance_to`.
- 8 classic metered and 8 flexible metered: **0 findings** (those steps still ran because their `if` is `!cancelled()`).

So the nightly oracle is real, it is red on `main` as of this review, and the miss is a webhook count on resume, not a cent. Prior schedule results: [39750799280](https://github.com/PugarHuda/tera/actions/runs/39750799280) success (2026-10-22), [39572003646](https://github.com/PugarHuda/tera/actions/runs/39572003646) success (2026-10-21), [39395958965](https://github.com/PugarHuda/tera/actions/runs/39395958965) failure (2026-10-20; the failure body was not re-read).

### Stryker

[stryker.config.json](https://github.com/PugarHuda/tera/blob/main/stryker.config.json): command runner (the Vitest runner “does not activate mutants under Vitest 5”), concurrency 2, timeout 60s, thresholds high 90 / low 80 / **break 85**. Mutates only `validate.ts`, `money.ts`, `csv.ts`, `share.ts`. The comment in the config says `billing.test.ts` and the 5,000 random timelines are left out, and that concurrency 4 on a 4-vCPU runner timed out 928 of 1,000 mutants and scored them as killed (98.8%), which is why concurrency is 2.

The string “87.6” does not appear in the repo. The number that rounds to 87.6% is the first successful run, on the PR that added Stryker:

- [run 39553236307](https://github.com/PugarHuda/tera/actions/runs/39553236307) (2026-10-21, PR #35): **87.58%**. All files: 871 killed, 3 timeout, 124 survived, 0 no coverage, 0 errors. `(871+3)/(871+3+124) = 874/998 = 87.58%`. Break threshold at that time was 75 (the log says “greater than or equal to break threshold 75”).

Current nightly, after more mutants:

- [run 39926982076](https://github.com/PugarHuda/tera/actions/runs/39926982076) (2026-10-23T08:45:59Z, same SHA as HEAD, success, 31 min 37s): **87.85%**, break threshold 85.

| File | Score | Killed | Timeout | Survived | No coverage | Errors |
|---|---|---|---|---|---|---|
| All files | 87.85 | 959 | 3 | 133 | 0 | 0 |
| `csv.ts` | 82.68 | 148 | 0 | 31 | 0 | 0 |
| `money.ts` | 92.11 | 35 | 0 | 3 | 0 | 0 |
| `share.ts` | 83.33 | 19 | 1 | 4 | 0 | 0 |
| `validate.ts` | 88.88 | 757 | 2 | 95 | 0 | 0 |

Total mutants now: 959+3+133 = **1,095**. HTML/JSON report is an Actions artifact `mutation-report` on that run (`reports/mutation/mutation.html`), retained 14 days, not committed. The Oct 22 nightly [39750808552](https://github.com/PugarHuda/tera/actions/runs/39750808552) logged 87.80%.

This score does not cover [billing.ts](https://github.com/PugarHuda/tera/blob/main/src/lib/billing.ts). A mutant that truncates proration, which is what #40 planted, is outside the mutation set. Calling it “the” mutation score of the billing engine would be wrong. As the score of the API trust boundary on the introducing run, 87.6% is the rounded 87.58.

### `docs/LOOP.md`

[docs/LOOP.md](https://github.com/PugarHuda/tera/blob/main/docs/LOOP.md) is generated by [scripts/loop-ledger.mjs](https://github.com/PugarHuda/tera/blob/main/scripts/loop-ledger.mjs). Header on `main`: generated 2026-10-23, **43 pull requests, 40 with a TestSprite check, 5 real reds all fixed in-PR, 14 credit blocks**. The table runs from #1 through #43 and then stops. The file is 58 lines.

The generator’s rules match what this review re-derived: a credit description is not a “real red”; “red → green” means a success exists after the last real failure; a credit-only PR that ends green is “blocked while credits ran out, then green”; a credit-only PR that never goes green is “credits ran out: the suite did not run”.

The committed file is **stale relative to HEAD**. PRs #44–#47 merged after it was last written (the #44 commit is itself the ledger refresh, and it does not include #44). Re-running the script would pick them up; nobody has committed that. The header sentence “every PR has merged through all of them” was written when the last merged PR in the file was #43, and it remains true for #44–#47’s TestSprite verdicts, which this review checked separately.

### Judge path in the README

[README.md lines 23–30](https://github.com/PugarHuda/tera/blob/main/README.md) are the section “For judges: two minutes”:

1. Open `/simulator?s=S05`. Invoice 2 is **$103.20** (−14.03 + 38.23 + 79.00), green “Matches golden expected”.
2. Change any event, press **Verify in Stripe**.
3. Open `/parity`.
4. Open `docs/LOOP.md`. PR #18 is the ¥4,500 catch.

A following paragraph, “Red on purpose”, points at #40 and the screenshot. The judging-criteria table maps “Project quality”, “Tests that run themselves”, and “Innovation” onto routes and checks. The “two minutes” is this path, not the video. The video is 2:46 (below).

Live check of step 1, without pressing Verify (that would create a test clock): `GET /simulator?s=S05` is 200, HTML contains `$103.20`, `14.03`, `38.23`, `79.00`, `Matches golden`, and `S05`. `103.19` does not appear.

### PR #38 and 114 → 121

[#38](https://github.com/PugarHuda/tera/pull/38) base `559519b`: evidence index **114** rows, all `match`; scenarios file **117** objects, **114** timelines, last id S117.

Commit `79f3d3b` on that PR (“fix(engine): metered usage…”): evidence index **121** rows, all `match`. The PR body says “S118–S124, 7/7 verified in Stripe (121/121 timelines)”. 114+7=121. **VERIFIED** as the count at that commit.

The PR did not merge there. Head `5dae341`: **127** matching timelines, **130** scenarios, last id S130 (volume tiers and the $0 final invoice, S125–S130, are later commits on the same branch). Merged 2026-10-22 while every `TestSprite V3` verdict on the branch was a credit failure.

Later growth, evidence-index length at each merge, all `match`: #41 = 127, #42 = 128 (S131), #43 = 135, #45 = 135, #46 = 135, #47 = 140.

### PR #40, the planted cent

[#40](https://github.com/PugarHuda/tera/pull/40) is one line, closed unmerged. Head checks from the API:

| Check | Conclusion | What the log shows |
|---|---|---|
| Tests, types, lint, build | failure | `Failed Tests 105`. Files: `billing.test.ts` 52 failed of 156, `parity-evidence.test.ts` 52 failed of 127, `mcp.test.ts` 1 failed. First failure is S05: expected `[-1403, 3823, 7900]`, got a truncated sibling. [run 39741950978](https://github.com/PugarHuda/tera/actions/runs/39741950978), job `119701060911` |
| User journeys | failure | 10 FAILED, including landing hero not `$103.20`, stub `$129.78` instead of `$129.79`, and `MCP simulate_timeline … ($103.19)`. Arazzo: 3 workflows passed, 1 failed, 5 checks failed. [run 39741950929](https://github.com/PugarHuda/tera/actions/runs/39741950929), job `119701060949` |
| Golden scenarios match Stripe | failure | Dozens of `DIFF` lines, one cent each, e.g. S110 `tera=-72902 stripe=-72903`. Exit 1. [run 39741950981](https://github.com/PugarHuda/tera/actions/runs/39741950981), job `119701061196` |
| TestSprite V3 | failure | “Not enough credits: 28 tests need 14, 0.8 available.” [check run 119701202200](https://github.com/PugarHuda/tera/runs/119701202200) |
| TestSprite API tests | **success** | Did not run. Warning in [run 39741951030](https://github.com/PugarHuda/tera/actions/runs/39741951030) |
| Differential fuzzing | skipped | Not a schedule, and the job is `if: event != pull_request` |
| Vercel | success | Preview deployed |

The author’s comment matches those logs, including “105 of 563 tests failed” and “52 goldens differ”. 52+52+1=105. The “52” is the unit/evidence count, and the Stripe replay log shows the same class of one-cent diffs (this review did not re-count every `DIFF` banner in that 22-minute log; the author’s 52 is consistent with the 52 failed golden tests).

“Every required check refused it” is **not true as a sentence**. The checks that executed the buggy code refused it (unit, browser, Stripe replay). `TestSprite V3` refused the SHA because of credits, which would also block a required check, but it did not see the cent. `TestSprite API tests` went green without running. The PR was closed unmerged. That part is true.

## Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
|---|---|---|---|---|
| Vitest | “unit tests”; #40 comment says 563 tests on that SHA | **603 passed, 15 files, 2.36s**, local `npm test` (Vitest 5.0.5) on 2026-10-23 after `npm ci`. Includes one `it` per golden (143) plus webhook recordings and evidence replays. The 5,000 random timelines are loops inside a handful of tests, not 5,000 extra test cases | Local run. Script: [package.json](https://github.com/PugarHuda/tera/blob/main/package.json) `"test": "vitest run"`. The 5,000 figure is the loop in [billing.test.ts](https://github.com/PugarHuda/tera/blob/main/src/lib/billing.test.ts) | **VERIFIED** (603 now). 563 was the #40 log, **VERIFIED** there, stale as a current total |
| Golden timelines vs Stripe | Article: 135/135. README: 140/140 | Repo index 140/140 match. Live `/parity` `140 / 140`. Landing proof `140 / 140` and 355 invoices. 355 re-counted from the JSON | [index.json](https://github.com/PugarHuda/tera/blob/main/golden/parity/index.json), live `/parity` | **140/140 VERIFIED** now. **135/135 FALSE** as a current fact; **VERIFIED** as the count from #43 through #46 |
| Golden scenarios | Article: 138 | 143 in the file and in `GET /api/scenarios` | scenarios.json, live API | **143 VERIFIED** now. 138 was 135 timelines + 3 migration scenarios, true through #46 |
| TestSprite UI | Article and demo: 28. README and AGENTS.md: 29 | 29 plans, 29 code files, CI “29 cloud tests, 29 matched”, PR #46 and #47 “All 29 tests passed” | [run 39926896831](https://github.com/PugarHuda/tera/actions/runs/39926896831), [execution 1b35a8db](https://www.testsprite.com/dashboard-v3/o/b784808c-edd4-56c9-bff3-97b8ab6e21be/projects/279e68e6-64c8-4c60-956e-6432e9e40f00/execution/1b35a8db-adb5-4e56-a4d8-97e30303ef75) | **29 VERIFIED** now. **28 FALSE** as of HEAD; true before #46 |
| TestSprite API | 5, every PR preview, `main`, nightly | 5 files, 5 cloud ids. Nightly success Oct 22 and Oct 23. Oct 21 nightly failed before tests. #40 “success” did not run | workflow + [39921508111](https://github.com/PugarHuda/tera/actions/runs/39921508111) | Count **VERIFIED**. “Ran on #40” **FALSE** |
| Playwright journeys + axe | Every PR | `e2e/user-journeys.mjs` has 42 `ok()` assertions and an axe WCAG 2.2 AA scan. Not re-run here (needs a deployed URL and Chromium). #40 log: 10 FAILED on the buggy preview, which shows the journey does assert the cents | [e2e.yml](https://github.com/PugarHuda/tera/blob/main/.github/workflows/e2e.yml) | Source **VERIFIED**. Latest green run not re-downloaded assertion-by-assertion |
| Schemathesis | Every PR, “2,000+ per run locally” | Workflow: `--max-examples 100`, schemathesis `4.32.2`. The “2,000+” local figure was not re-run | [schemathesis.toml](https://github.com/PugarHuda/tera/blob/main/schemathesis.toml), e2e.yml | CI shape **VERIFIED**. Local 2,000+ **UNVERIFIED** |
| Arazzo / Redocly Respect | Every PR | File [tera.arazzo.yaml](https://github.com/PugarHuda/tera/blob/main/api-workflows/tera.arazzo.yaml). #40 log: 3 workflows passed, 1 failed, 5 checks failed | e2e.yml | Present **VERIFIED**. Not re-executed locally |
| Lighthouse | a11y, best-practices, SEO = 100; performance ≥ 70; CLS < 0.1; 5 pages × 3 runs | [lighthouserc.json](https://github.com/PugarHuda/tera/blob/main/lighthouserc.json) matches that. Scores of the latest run were not downloaded | e2e.yml | Config **VERIFIED**. Latest numeric scores **UNVERIFIED** this session |
| Stryker | 87.6% | 87.58% on [39553236307](https://github.com/PugarHuda/tera/actions/runs/39553236307) (871 killed, 3 timeout, 124 survived). **87.85%** now on [39926982076](https://github.com/PugarHuda/tera/actions/runs/39926982076) (959 / 3 / 133). Not on `billing.ts` | Logs quoted above | **87.6 VERIFIED** as the rounded introducing-run score. Current score is 87.85. “On every PR” **FALSE** (path filter + nightly) |
| Differential fuzz | Nightly, both billing modes | Workflow seeds as above. Today: 0 / 1 webhook / 0 / 0 across the four batches | [39926974390](https://github.com/PugarHuda/tera/actions/runs/39926974390) | **VERIFIED**, and currently red |
| MCP tools | 10 | 10 in source, 10 in `mcp.test.ts`, 10 from live `tools/list` | route + live POST | **VERIFIED** |
| MCP resources / prompts | 4 resources, 2 prompts | 4 definitions in source; live list expands the scenario template to 146 resource entries; 2 prompts live | route + live POST | **VERIFIED** |
| Mutation of the billing engine | (implied if someone reads “mutation score” as the product) | 0 files. `billing.ts` is not in `mutate` | stryker.config.json | **VERIFIED** absent |
| Local test run | | 603 passed. No Stripe key, so `verify-golden.mts` and fuzz were not run. They need `STRIPE_SECRET_KEY` | this session | Unit **VERIFIED**. Stripe replay **not runnable locally: no test key, and running it would create test clocks in their account** |

## Claim verification

Claims from the [dev.to article](https://dev.to/hudapugar/i-let-stripe-grade-my-tests-building-a-billing-simulator-where-no-expected-value-comes-from-my-own-4iil) and the extra list in the brief.

| Claim | Verdict | Why |
|---|---|---|
| “2-minute judge path at the top” | **VERIFIED** | [README “For judges: two minutes”](https://github.com/PugarHuda/tera/blob/main/README.md). It is four steps, not a timer. The video is longer |
| “138 golden scenarios derived by hand” | **FALSE now, true through #46** | 143 today ([scenarios.json](https://github.com/PugarHuda/tera/blob/main/golden/scenarios.json), live `/api/scenarios`). 135 timelines + 3 migration = 138 at the #43–#46 merges |
| “135/135 timelines match to the cent (`/parity`)” | **FALSE now** | Live and repo are **140/140**. 135/135 was the index at #43–#46. Demo narration still says “one hundred and thirty-five” |
| “28 UI tests, plans + hand-written code in the repo, exact amounts” | **PARTIAL** | Plans and hand-written code with exact amounts: **VERIFIED**. Count is **29** on HEAD, and CI says the cloud project matches. 28 was true before #46. [testsprite/README.md](https://github.com/PugarHuda/tera/blob/main/testsprite/README.md) still says 28 |
| “TestSprite API tests against that PR’s own preview” | **VERIFIED** as the workflow | [testsprite-api.yml](https://github.com/PugarHuda/tera/blob/main/.github/workflows/testsprite-api.yml) + the BASE_URL rewrite. On #40 they did not run |
| “Every PR: TestSprite V3 … plus unit, Playwright + axe, Schemathesis, Arazzo, Lighthouse. Required on main, admins included” | **PARTIAL / overstated** | Those jobs exist (axe, Schemathesis, Arazzo, and Lighthouse are steps of the one E2E job). V3 was absent on #14, #24, #25. Eight PRs merged on a red V3 credit check. Required badges are in the #40 screenshot; the protection API is 403; rulesets are `[]`. “Admins included” for the whole history is contradicted by those merges. Post-boost #41–#47 merged green |
| “PR #40 plants a one-cent rounding bug; every required check refused it, closed unmerged” | **PARTIAL** | Closed unmerged: **VERIFIED**. One-cent bug caught by 105 unit failures, browser journeys (`$103.19`), and the Stripe golden job: **VERIFIED** in logs. “Every required check” **FALSE**: API check succeeded without running; V3 failed on credits, which the author calls “not a verdict on this bug” ([comment](https://github.com/PugarHuda/tera/pull/40#issuecomment-6335862406)) |
| “Nightly differential fuzzing vs Stripe” | **VERIFIED** | [stripe-parity.yml](https://github.com/PugarHuda/tera/blob/main/.github/workflows/stripe-parity.yml). Latest run failed on one webhook diff |
| “`docs/LOOP.md`: every PR’s TestSprite verdicts, including ones blocked while credits ran out” | **PARTIAL** | True for #1–#43, and the credit rows are explicitly labeled. **Stale**: #44–#47 are missing. Header still says 43 PRs |
| “Five went red on real test results, all fixed in the same PR” | **VERIFIED** | #2, #3, #6, #18, #35. #35’s merge SHA was a later credit failure |
| “Nine pull requests hit that wall” (credits) | **FALSE** | 14 PRs have a credit-outage verdict. The ledger says 14 |
| “114 → 121 timelines (PR #38)” | **VERIFIED as a midpoint** | Base 114. Commit `79f3d3b` index length 121, all match. Merged head of the same PR is **127**, not 121 |
| “StrykerJS mutation score 87.6%” | **VERIFIED as 87.58% on the introducing run** | [39553236307](https://github.com/PugarHuda/tera/actions/runs/39553236307). Current nightly is **87.85%** ([39926982076](https://github.com/PugarHuda/tera/actions/runs/39926982076)). Scope is four non-engine files |
| “MCP server with 10 tools” | **VERIFIED** | Source, unit test, and live `tools/list` |
| “Stripe-parity billing sim” | **VERIFIED** | 140 stored clocks, live page, S05 amounts on `/simulator?s=S05` |
| “TestSprite V3 required check on every PR” | **PARTIAL** | Required badge on #40. Not present on #24 and #25, which merged. Not effective against admin merges during the credit outage |
| “Failure-triage script posting UI-vs-engine verdict PR comments” | **FALSE as an event, VERIFIED as code** | Script and workflow exist. 17/17 real runs exited with “nothing to triage”. No comment with the marker |
| “Nightly money-math canary” | **VERIFIED as a declared schedule CI says matches the cloud** | [suite.json](https://github.com/PugarHuda/tera/blob/main/testsprite/suite.json) + CI log `1 schedule(s), 0 problem(s)` on [39926896831](https://github.com/PugarHuda/tera/actions/runs/39926896831). A TestSprite-side execution of that schedule was not visible from GitHub |

## Code quality

The split is clear: rules and hand math in `golden/scenarios.json` and [docs/PRD.md](https://github.com/PugarHuda/tera/blob/main/docs/PRD.md) (R1–R25), engine in `billing.ts`, one parser used by REST and MCP, Stripe I/O isolated in `stripe-parity.ts`. TypeScript is strict enough that CI runs `tsc --noEmit` after `next typegen`. ESLint is `eslint-config-next` core-web-vitals plus typescript ([eslint.config.mjs](https://github.com/PugarHuda/tera/blob/main/eslint.config.mjs)). No `any`-driven escape hatch was spotted in the MCP route; tools use Zod input and output schemas.

CI hygiene is ahead of a typical hackathon repo: SHA-pinned actions, concurrency controls, a single Stripe concurrency group so two test-clock jobs cannot overlap, artifacts retained 14 days, and a sync job that fails if the cloud copy of a test drifts (including auto-healed code). Security headers on the live response match the config: CSP, HSTS, `nosniff`, `Referrer-Policy`, a locked-down `Permissions-Policy`, `payment=()`.

Smells, all visible without a style argument:

- **The API TestSprite job treats “did not run” as success.** That is a deliberate comment in the script. It makes a green check on #40 that did not see the planted bug. If that check is in the required set, it does not protect `main`.
- **Triage cannot see a credit failure**, and credit failures were the only failures after the workflow existed. The feature the README sells has a zero count of posted comments.
- **`docs/LOOP.md` and `testsprite/README.md` lag HEAD** by one to four PRs and by one UI test. The generator is good; the committed output is not current.
- **Stryker does not touch the engine** that #40 broke. The config is honest about why (`billing.test.ts` is slow, and a high concurrency inflated the score with timeouts). A reader who stops at “87.6%” will think the billing rules are mutation-tested. They are not.
- **Hard-coded Vercel team slug** `hudas-projects-a8e7f558` in three workflows. Forks and a renamed team get the wrong preview URL. The comment in e2e.yml acknowledges the pattern.
- **No license file.** `licenseInfo` is null.
- **README line 5 of the fuzzing section is one enormous paragraph** (the whole R-series narrative). It is evidence-rich and not reviewable as a list.
- **Demo and article still teach 135/135** while the product teaches 140/140. A judge who follows the video and then opens `/parity` sees a discrepancy the project has not reconciled.
- **Today’s nightly fuzz is red on `main`** and nothing in the README says so. The failure is a webhook, invoices matched. Leaving it red overnight is honest CI; not mentioning an open finding is a verifiability gap.
- Evidence timestamps are not “replayed today”. S05’s committed clock is `2026-10-20`. The page shows stored evidence. A live re-run exists (`live={STRIPE key present}` in the parity page) but this review did not press it.

## Live-site behavior

Curled 2026-10-23 with a normal GET. No forms submitted, no “Verify in Stripe”, no catalog push.

| Request | Status | Time | What came back |
|---|---|---|---|
| `GET /` | 200 `text/html` | 0.10s, `x-vercel-cache: HIT` | Title `Tera · Stripe-parity pricing simulator`. Proof widget `140 / 140` and `355` invoices. Hero shows `$103.20` |
| `GET /simulator` | 200 | 0.62s | Title `Simulator · Tera` |
| `GET /simulator?s=S05` | 200 | 0.14s | `$103.20`, `$14.03` / `38.23` / `79.00` present as `14.03`, `38.23`, `79.00`, `Matches golden`, no `103.19` |
| `GET /parity` | 200 | 0.16s | Title `Stripe parity · Tera`. `data-testid=parity-summary`: `140 / 140 scenarios match Stripe to the cent`. 140 match badges, 0 diffs. API version text `2026-09-30.endive` |
| `GET /builder` | 200 | 0.08s | Title `Pricing builder · Tera` |
| `GET /migrate` | 200 | 0.11s | Title `Migration planner · Tera` |
| `GET /reference` | 200 | 0.11s | Title `Tera API reference` (small HTML shell; Scalar mounts client-side) |
| `GET /mcp-setup` | 200 | 0.13s | Title `MCP server · Tera`. Tool names load client-side; the endpoint itself was called separately |
| `POST /api/mcp` `tools/list` | 200 `text/event-stream` | | 10 tools, output schemas present |
| `POST /api/mcp` `resources/list` | 200 | | 146 resources |
| `POST /api/mcp` `prompts/list` | 200 | | 2 prompts |
| `GET /api/openapi.json` | 200 `application/json` | 0.28s | OpenAPI 3.1.0, title `Tera API`, version `0.1.0`, 8 paths |
| `GET /api/scenarios` | 200 | 0.10s | JSON array, length 143, first id S01 |
| `GET /api/scenarios/S05` | 200 | 0.08s | `status: verified`, rules `R3`, timeline present |
| `GET /api/simulate` | 405 `application/json` | | method not allowed |
| `POST /api/simulate` `{}` | 400 | | `{"error":"timeline must be a non-empty array"}` |
| `GET /api/nope` | 404 `application/json` | | `{"error":"No API route /api/nope; see /api/openapi.json"}` |
| `GET /llms.txt` | 200 `text/plain` | 0.21s | Starts `# Tera` |
| `GET /robots.txt` | 200 | 0.05s | `Allow: /`, `Disallow: /api/`, sitemap URL |
| `GET /sitemap.xml` | 200 `application/xml` | 0.04s | XML urlset |
| `GET /no-such-page` | 404 `text/html` | 0.04s | Next.js `404: This page could not be found.` |

Home response also carries CSP, HSTS (`max-age=63072000; includeSubDomains; preload`), `x-content-type-options: nosniff`, and `permissions-policy` with `payment=()`. Nothing fetched returned a 5xx.

## Demo

The file is in the repo: [docs/tera-demo.mp4](https://github.com/PugarHuda/tera/blob/main/docs/tera-demo.mp4). Raw download `https://github.com/PugarHuda/tera/raw/main/docs/tera-demo.mp4` is **10,256,296 bytes (9.8 MB)**. `ffprobe`: H.264 1280×720, AAC audio, duration **165.674 s (2 min 46 s)**, bitrate ~495 kb/s. A poster is [docs/screens/demo-poster.png](https://github.com/PugarHuda/tera/blob/main/docs/screens/demo-poster.png), linked from the README. The README also links an X post, which was not opened.

Narration ([video/narration.json](https://github.com/PugarHuda/tera/blob/main/video/narration.json)), nine beats: why pricing changes hurt; S05 at $103.20 with the golden badge; editing the date to $104.80 and a German locale; **“every one of the one hundred and thirty-five”** timelines; builder and migration planner; MCP and OpenAPI; PR #18 and the ¥4,500 bug; 28 UI tests, API tests on the preview, triage, nightly money-math; PR #40 and “every required check refused it”, plus journeys, axe, Schemathesis, Lighthouse, nightly fuzz, mutation. The picture it paints is the right product. Three sentences in it are now stale or overstated: 135 timelines, 28 tests, and “every required check”.

## Weaknesses / risks for judges

1. **The article, the video, `testsprite/README.md`, and `docs/LOOP.md` disagree with the live site.** Live is 140/140 and 29 UI tests. The published story is 135/135 and 28 tests. The ledger stops at PR #43. A judge who cross-checks will find the gap in under a minute. It is a bookkeeping miss, not a fake product, and it is still a miss.
2. **#40 does not prove TestSprite caught the cent.** Unit tests, Playwright, and the Stripe replay caught it. TestSprite V3 was out of credits. The API check went green without running, by design of `process.exit(0)`. The README sentence “every required check refused it” is stronger than the author’s own comment on the PR.
3. **Eight merged PRs have a failing final `TestSprite V3` check**, all credit outages, plus two merged PRs with no check. The project discloses this. “Required, admins included” was not true for that window. The protection API still returns 403, so the current ruleset is not independently readable. The post-boost window (#41–#47) is clean.
4. **Triage has never classified a failure.** The interesting idea (UI vs engine, using Stripe receipts) is implemented and unused. Every invocation bailed out because the only red checks were credit walls.
5. **Mutation testing does not cover `billing.ts`.** 87.85% on the parser, CSV, money, and share-link code is a real number. It is not a score for proration.
6. **`main` is red on nightly Stripe fuzz right now** (webhook `invoice.paid` count, seed 68515, flexible resume after a one-off item). Invoices matched. The job still fails the workflow.
7. **No license.** Fine for a hackathon, awkward if someone treats the engine as a library.
8. **Preview URL is a hard-coded team slug.** The TestSprite and E2E jobs assume that alias exists.

## Where it beats Ninety

Ninety is the Schengen 90/180 calculator at https://github.com/mohamedwael201193/ninety (live https://ninety-coral.vercel.app): one engine, Commission-calculator oracle, 43 frontend TestSprite plans, 28 backend CLI tests, Vitest 367/3, nightly fuzz, no mutation testing, no demo video, no UI-vs-engine triage, nightly TestSprite schedules skipped, PR #63 merged while `TestSprite V3` was red. Each item below is a dimension where Tera is actually ahead, and the concrete thing that would put Ninety strictly ahead of Tera rather than level.

1. **A planted bug that stayed unmerged, with the Required badges in a screenshot.** [#40](https://github.com/PugarHuda/tera/pull/40) is closed, and [pr40-merge-blocked.png](https://github.com/PugarHuda/tera/blob/main/docs/screens/pr40-merge-blocked.png) shows `TestSprite V3`, CI, and E2E marked Required while failing. Ninety merged [#63](https://github.com/mohamedwael201193/ninety/pull/63) while V3 was 42/43. To be strictly better, Ninety needs a one-line defect PR that CI, the browser suite, and the oracle all fail, that stays unmerged, and that cannot be merged by an admin, with the ruleset readable (Tera’s API result is still 403, so a public ruleset or a screenshot that also shows “admins must pass” would pass Tera).

2. **Hand-written TestSprite code, not only plans, diffed against the cloud copy on every CI run.** [testsprite-sync.mjs](https://github.com/PugarHuda/tera/blob/main/scripts/testsprite-sync.mjs) fails if stored Playwright differs, which is how they catch auto-heal rewriting an assertion. Latest proof: [run 39926896831](https://github.com/PugarHuda/tera/actions/runs/39926896831) `29 cloud tests, 29 matched … 0 problem(s)`. Ninety commits plans and Python tests but does not diff cloud-stored code. To be strictly better, Ninety needs that diff in CI, including the code bodies, and it needs to fail the job when they diverge.

3. **A nightly TestSprite schedule that CI asserts is actually configured.** [suite.json](https://github.com/PugarHuda/tera/blob/main/testsprite/suite.json) plus the same sync log (`1 schedule(s), 0 problem(s)`). Ninety’s full CLI and smoke crons are skipped, and the smoke workflow’s only real run failed before any test. To be strictly better, Ninety needs a schedule that has executed (a GitHub run or a TestSprite execution id) in the last night, not only a cron that exits on a variable flag. Tera has not shown this review a TestSprite execution id for the canary itself, only the CI assertion that the schedule object matches, so a published canary execution would also move Ninety past Tera’s evidence.

4. **Mutation testing with a breaking threshold and a published mutant table.** [39926982076](https://github.com/PugarHuda/tera/actions/runs/39926982076): 87.85%, 959 killed, 3 timeout, 133 survived, break at 85. Ninety has none. To be strictly better, Ninety needs mutation on the decision engine (Tera’s set is `validate.ts` / `money.ts` / `csv.ts` / `share.ts`, not `billing.ts`), a threshold that fails the job, and a score above 87.85 on a mutant count in the same range or larger. Matching Tera’s boundary-only score would not be strictly better.

5. **A failure-triage program that knows the difference between a UI regression and an oracle regression.** The classifier is [testsprite-triage.mjs](https://github.com/PugarHuda/tera/blob/main/scripts/testsprite-triage.mjs) (quoted above). It has never posted a comment ([run 39741998616](https://github.com/PugarHuda/tera/actions/runs/39741998616) is the #40 no-op). Ninety has no equivalent. To be strictly better, Ninety needs the same UI-vs-engine split **and** at least one PR comment produced from a real failed TestSprite run. That bar is higher than Tera has cleared.

6. **Per-commit TestSprite ledger that separates credit outages from real failures, generated from the API.** [loop-ledger.mjs](https://github.com/PugarHuda/tera/blob/main/scripts/loop-ledger.mjs) and [LOOP.md](https://github.com/PugarHuda/tera/blob/main/docs/LOOP.md). Ninety’s `LOOP-ITERATIONS.md` records red/green narrative; it does not classify “Not enough credits” as a non-result, and Tera’s history is the one that actually hit that wall. To be strictly better, Ninety needs a generator run on every merge so the file cannot lag by four PRs the way Tera’s does, covering every commit, with credit-vs-fail labels. Tera is ahead on the classifier and behind on freshness.

7. **Two TestSprite projects, and the API suite is aimed at the PR preview by rewriting stored code, with `--no-auto-heal`.** [testsprite-api-run.mjs](https://github.com/PugarHuda/tera/blob/main/scripts/testsprite-api-run.mjs). Nightly green: [39921508111](https://github.com/PugarHuda/tera/actions/runs/39921508111). Ninety also runs 28 backend tests on each PR, which is more tests. To be strictly better on this dimension, Ninety needs the preview-retarget plus a non-zero exit when the run does not happen. Tera’s `exit 0` on a credit shortfall is the hole; Ninety’s backend workflow already fails closed more strictly if it errors. The piece Ninety lacks is the stored-code swap that lets one cloud test hit many preview URLs without `--target-url`.

8. **Demo video with measured length.** [docs/tera-demo.mp4](https://github.com/PugarHuda/tera/blob/main/docs/tera-demo.mp4), 165.7s, 1280×720, narrated, in the repo. Ninety has no demo video. To be strictly better, Ninety needs a narrated recording of the real UI whose spoken numbers match the live site the day it is judged. Tera’s narration still says 135 timelines and 28 tests, so a video that matches live counts would pass it.

9. **MCP surface: 10 tools, output schemas, structured content, 2 prompts, a scenario template, tested with the official client, and live `tools/list`.** [route.ts](https://github.com/PugarHuda/tera/blob/main/src/app/api/mcp/route.ts), [mcp.test.ts](https://github.com/PugarHuda/tera/blob/main/src/lib/mcp.test.ts), live POST. Ninety has 3 tools on HTTP and stdio. To be strictly better, Ninety needs more than 10 tools with output schemas, or the same 10-tool bar plus a stdio package Tera does not have **and** prompts/resources. Simply adding a fourth tool does not pass Tera. (Neither project has a TestSprite MCP config. That gap is shared.)

10. **User-facing live oracle, not only CI.** “Verify in Stripe” and `verify_timeline_in_stripe` replay an arbitrary timeline (max 15 events, 2 years) in a fresh test clock. Ninety’s `/parity` compares to the Commission script, which is a strong oracle, and it does not give the visitor a button that re-executes the official calculator on a timeline they just typed and returns the foreign system’s ids. To be strictly better, Ninety needs a live re-run of the Commission script on a user-edited history, with the foreign output stored or shown, plus the nightly drift watch it already has. Tera’s stored S05 clock is from 2026-10-20, so “live on every page view” is not claimed and was not observed.

11. **Committed third-party receipts at scenario scale.** 140 `golden/parity/Sxx.json` files, 355 Stripe invoices, test clock ids, API version `2026-09-30.endive`, webhook recordings on all 140. Ninety’s parity is 14/14 plus a deep 399/400 against a vendored script, which is a different and also serious oracle. To be strictly better on *receipts*, Ninety needs one stored foreign artifact per case (not only a boolean from re-executing JS) for a set larger than 140. On *case volume of an independent oracle*, Ninety’s 399 is already larger than 140; this bullet is about the receipt, not the count.

12. **Arazzo workflows and Lighthouse budgets inside the PR gate.** [e2e.yml](https://github.com/PugarHuda/tera/blob/main/.github/workflows/e2e.yml), [lighthouserc.json](https://github.com/PugarHuda/tera/blob/main/lighthouserc.json) (accessibility, best practices, and SEO must be 100). Ninety has Schemathesis and axe, not Arazzo, and the baseline does not show Lighthouse. To be strictly better, Ninety needs both in the required PR job with thresholds at least as tight, and a failed Lighthouse run that has actually blocked a merge (Tera’s #40 e2e failure was the journeys and an Arazzo workflow, which is evidence the job can go red).

13. **Webhook-level differential testing against the system of record.** Fuzz compares `diffWebhooks` as well as invoices, and today’s red build is a webhook finding ([39926974390](https://github.com/PugarHuda/tera/actions/runs/39926974390)). Ninety’s fuzz is larger (3,000 histories) and green. To be strictly better, Ninety needs an external event stream in the diff, not only day counts. If the product has no such stream, this dimension does not transfer; it is listed because it is a real testing surface Tera has and Ninety does not.

14. **Exact-money UI assertions that survived contact with a one-cent bug in the browser.** #40’s journey log failed the landing hero, the stub invoice, the locale string, and the live MCP structured content (`$103.19`). Ninety’s UI plans assert day counts, which is the right oracle for that product. To be strictly better on *sensitivity*, Ninety needs a planted off-by-one that the browser suite fails and the unit suite fails, left unmerged. Tera did that for money. The TestSprite UI check did not participate, so Ninety can pass this bar without using TestSprite if the Playwright job is the one that goes red. Doing it with TestSprite V3 actually executing would pass Tera on the point Tera missed.

Dimensions that are **not** Tera wins, so they are not in the list: Vitest volume (Ninety 367 cases vs Tera 603, but Tera’s 5,000 timelines are inner loops and Ninety’s property tests are large too), frontend plan count (Ninety 43 plans vs Tera 29), backend TestSprite count (Ninety 28 vs Tera 5), fuzz volume (Ninety 3,000 vs Tera 64 timelines a night), Schemathesis presence (both), axe presence (both), and a Commission-or-Stripe oracle (both have one). Tera’s API credit-shortfall `exit 0` is a place Ninety’s backend gate is stricter.

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 9 | Pricing changes produce invoices founders cannot predict. The simulator, the migration MRR view, and the agent tools are a coherent product, not a test harness with a UI. It does not move money, and it does not replace Stripe |
| TestSprite depth | 9 | App check, second CLI project on the preview, plans and code in git, cloud sync including stored code, a schedule CI vouches for, triage code, a ledger, red→green history, a planted PR. Not a 10: triage never commented, the API job goes green when it skips, and eight PRs merged on a red V3 check |
| Verifiability | 8 | Almost every load-bearing number is in GitHub or on the live page, and the credit outage is disclosed. Points off for the stale 135/28 story in the article, video, and ledger, and for “every required check refused #40” |
| Polish | 9 | Live routes, JSON errors, CSP/HSTS, axe in the PR job, Lighthouse budgets, a readable simulator. The open nightly fuzz failure and the stale docs are the deductions |
| Demo | 8 | A real 2:46 narrated 720p video in the repo, showing S05, an edit, parity, MCP, and the loop. It teaches three numbers that are no longer true |
| **Overall** | **9** | The strongest TestSprite integration in this comparison, with a real oracle and a real product. The gaps are bookkeeping and one exit code, not a missing product |

## Bottom line for the decider

Tera is a Stripe-parity billing simulator with the oracle, the UI, the API, and the MCP server on one engine. The TestSprite story is deep and mostly checkable. The sentences that do not survive contact with the API are the current 135/135 and 28-test claims, “nine” credit PRs, “every required check refused #40”, “triage posts a PR comment”, and reading 87.6% as the score of the billing engine. The live site today is 140/140, the UI suite is 29/29 on the latest PR, Stryker’s latest score is 87.85% on four non-engine files, and nightly Stripe fuzz is red on a single webhook.
