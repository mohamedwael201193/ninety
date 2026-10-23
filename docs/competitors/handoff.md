# Handoff

- **Name:** Handoff
- **Author:** Satianurag (README byline Anurag Sati)
- **Repo:** https://github.com/Satianurag/handoff
- **Live:** https://admired-fish-176.convex.site (sample: https://admired-fish-176.convex.site/demo)
- **TestSprite PR:** https://github.com/Satianurag/handoff/pull/12 (also comments on https://github.com/Satianurag/handoff/pull/8, https://github.com/Satianurag/handoff/pull/10, https://github.com/Satianurag/handoff/pull/11)
- **Demo video:** none (submission: none; no mp4/webm/mov in the repo)
- **Article:** https://dev.to/anurag_sati_5b77a6578f780/test-each-convex-pr-preview-with-testsprite-before-it-can-merge-4foc
- **Log:** https://github.com/Satianurag/handoff/blob/main/LOOP.md
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7
- **HEAD reviewed:** `ea7516a7e9c1ae5cc85dc37dc83683561b34d8a7`

## What it is

Handoff is a shared workspace for adult children coordinating an aging parent’s care: original documents, the next visit, the ride, and who actually accepted the next responsibility stay in one household. The public site is an evaluation release. The sample family is fictional (Maya and Leo, “Sample Clinic”), and the product does not claim real caregiver adoption or clinical certification ([README](https://github.com/Satianurag/handoff/blob/main/README.md), [live landing](https://admired-fish-176.convex.site/landing.html)).

## Architecture

Vanilla browser app on Convex static hosting, with a Convex backend (auth, queries/mutations, workflows, crons) and a Cloudflare Worker that gives each pull request a stable hostname. Deploy target is the Convex deployment `admired-fish-176` (`https://admired-fish-176.convex.site` and `https://admired-fish-176.convex.cloud`).

| Piece | Role | Link |
|---|---|---|
| `convex/schema.ts`, `convex/tasks.ts`, `convex/handovers.ts`, `convex/visits.ts`, `convex/records.ts` | Household data, responsibilities, handover receipts, visits, private files | [tasks.ts](https://github.com/Satianurag/handoff/blob/main/convex/tasks.ts) |
| `convex/auth.ts`, `convex/model/access.ts`, `convex/recordsAccess.ts` | Email-code auth, membership, record permissions | [auth.ts](https://github.com/Satianurag/handoff/blob/main/convex/auth.ts) |
| `convex/http.ts` | Static SPA fallback, `/records/file`, `/demo-fixtures/*`, AgentMail webhook | [http.ts](https://github.com/Satianurag/handoff/blob/main/convex/http.ts) |
| `convex/convex.config.ts` | Static hosting, rate limiter, workflow, Firecrawl | [convex.config.ts](https://github.com/Satianurag/handoff/blob/main/convex/convex.config.ts) |
| `convex/demoStore.ts` | Sample household: “Maya (demo)”, “Leo (demo)”, “Sample Clinic logistics visit”, synthetic note | [demoStore.ts](https://github.com/Satianurag/handoff/blob/main/convex/demoStore.ts) |
| `web/` | Client routes, views, styles. `web/entry.js` fetches `/landing.html` for the signed-out page | [routes.js](https://github.com/Satianurag/handoff/blob/main/web/routes.js) |
| `.github/workflows/preview.yml` | Same-repo PRs only: Convex preview `pr-<N>`, then OIDC registration of `handoff-pr-<N>.satimon.com` | [preview.yml](https://github.com/Satianurag/handoff/blob/main/.github/workflows/preview.yml) |
| `infra/preview-alias/` | Worker + SQLite durable object. Config declares custom domains `handoff-pr-1` through `handoff-pr-60` (60 patterns) | [wrangler.toml](https://github.com/Satianurag/handoff/blob/main/infra/preview-alias/wrangler.toml) |
| Integrations named in README | AgentMail, Firecrawl, Gemini, MapLibre / OpenFreeMap / Photon | [README](https://github.com/Satianurag/handoff/blob/main/README.md) |

CI is two workflows only: [ci.yml](https://github.com/Satianurag/handoff/blob/main/.github/workflows/ci.yml) (worker tests, `tsc`, Vitest, `npm run test:web`) and [preview.yml](https://github.com/Satianurag/handoff/blob/main/.github/workflows/preview.yml). There is no TestSprite CLI job and no schedule.

## TestSprite integration depth

**Score: 8 / 10.** The GitHub App is a real merge gate on same-repo PRs, it runs against that PR’s Convex preview, and PR #12 still shows a red status on the pre-fix commit and a green status on the fix. Points come off for no MCP config, no TestSprite CLI in GitHub Actions, no nightly schedule, frontend-only coverage, and a push trigger that posts `TestSprite V3` as **success** when tests fail.

Project id in LOOP: `98d946ba-f237-453f-b6e5-2b1fea4ca0fa`. Dashboard links below require a TestSprite login. Commit-status descriptions were read from the GitHub commit status API on 2026-10-23.

### GitHub App check

Context name is `TestSprite V3`. The app comments as `testsprite[bot]` on PRs #8, #10, #11, and #12 only. PRs #1–#7 and #9 have no TestSprite comment.

| SHA | When (status `created_at`) | GitHub state | Description | Execution |
|---|---|---|---|---|
| `93e9731` (PR #10, first trigger) | 2026-10-20 14:29Z | **success** | 2/16 passed · 1 failed · 13 blocked | [91e86e74](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/91e86e74-6adb-4d39-b35a-13670d79628e) |
| `ed74b93` | 2026-10-20 14:14Z | success | All 16 tests passed | [4de6aa07](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/4de6aa07-1572-40ba-90f4-2e08b082ee6e) |
| `ca1c902` (PR #8) | 2026-10-20 15:15Z | success | All 16 tests passed | [0774513f](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/0774513f-5129-4fb7-b278-8ded6432a267) |
| `65d92a4` (push on main after PR #10) | 2026-10-20 15:08Z | **success** | 15/16 passed · 1 failed | [32c56fe1](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/32c56fe1-62e5-494b-9b50-08bbf9185804) |
| `5bf6aee` | 2026-10-20 15:55Z | success | All 16 tests passed | [111bbaaa](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/111bbaaa-2d96-49e9-907b-a1e3c7ed4627) |
| `779757b` (push on main after PR #11) | 2026-10-20 16:31Z | **success** | 16/17 passed · 1 failed | [0e2a6b78](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/0e2a6b78-4497-44a7-b247-d15567e4efe3) |
| `67ea994` (PR #12, evidence only) | 2026-10-20 16:35Z | **failure** | 16/17 passed · 1 failed | [8f623eac](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/8f623eac-e412-4a48-ba88-33daf04999d1) |
| `2b84d15` (PR #12 fix) | 2026-10-20 16:40Z | success | All 17 tests passed | [ee743e6c](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/ee743e6c-dfc6-4cf8-b893-fce1adeca656) |
| `4339847` | 2026-10-20 16:51Z | success | All 17 tests passed | [463da903](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/463da903-bb9a-4756-b7dc-9fd0c20fae2b) |
| `ea7516a` (merge SHA) | 2026-10-20 17:10Z | success | All 17 tests passed | [7cca54b4](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/7cca54b4-c454-4c48-a42f-f45e53f66b0a) |

PR comments (latest body only; GitHub does not expose the pre-edit body):

- PR #8: 16/16, execution [b95c0706](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/b95c0706-9503-445e-831f-1dd2f56aef1c) — [comment](https://github.com/Satianurag/handoff/pull/8#issuecomment-6294863767)
- PR #10: 16/16, execution [39ec1d57](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/39ec1d57-3b8a-41b2-bc42-e2484e7c84ea) — [comment](https://github.com/Satianurag/handoff/pull/10#issuecomment-6293704929)
- PR #11: 16/16, execution [53954151](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/53954151-4259-4706-b71e-7bc66504d558) — [comment](https://github.com/Satianurag/handoff/pull/11#issuecomment-6295650192)
- PR #12: 17/17, execution [c434f608](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/c434f608-3f45-402e-b0b1-0c544e402bf7) — [comment](https://github.com/Satianurag/handoff/pull/12#issuecomment-6296374733) created 16:56Z, updated 17:00Z

`c434f608` is not the execution id on any commit status. The status on the merged SHA is `7cca54b4`, posted at 17:10Z. One GitHub context per SHA means a later push-trigger status replaces the PR-trigger status (`5bf6aee` and `779757b` are examples).

### Is `TestSprite V3` required?

Yes, on the default branch, via ruleset **`main-gate`** id `25486633`, enforcement `active`, created 2026-10-20T15:41:54Z. Rules: `deletion`, `non_fast_forward`, and `required_status_checks` with context `TestSprite V3` (integration id `2756476`). `strict_required_status_checks_policy` is false. There is no “require a pull request” rule. Public page: https://github.com/Satianurag/handoff/rules/25486633

Classic branch protection `GET /branches/main/protection` returned **403**. `bypass_actors` was absent from the ruleset payload this token could read. `current_user_can_bypass` was `never` for this token. Collaborators API returned 403, so whether Devin can bypass is unknown.

PR #12 was merged by `devin-ai-integration[bot]` at 2026-10-20T17:02:38Z onto `ea7516a` ([merge event](https://github.com/Satianurag/handoff/pull/12)). `TestSprite V3` on that SHA was created at 17:10:00Z, about seven minutes after the merge. The fix commit `2b84d15` was already success (“All 17 tests passed”) at 16:40Z, and the docs commit `4339847` was success at 16:51Z. The red SHA `67ea994` was not the merge SHA. GitHub does not retain `mergeable_state`; the merged PR now reports `unknown`.

### CLI, MCP, schedules, triage

- **CLI:** `testsprite test run` is described in [LOOP.md](https://github.com/Satianurag/handoff/blob/main/LOOP.md). [run-history.json](https://github.com/Satianurag/handoff/blob/main/testsprite/run-history.json) has 50 rows with `source: cli` and 179 with `source: github_action`. No workflow file invokes the CLI.
- **MCP:** no TestSprite MCP config, `mcp.json`, or MCP calls in the repo.
- **Schedules:** no nightly or on-merge TestSprite workflow. Push-trigger runs on `main` are the production monitor, and they post success even when a test fails (see `32c56fe1` and `0e2a6b78`).
- **Triage:** TestSprite bot comments with per-test screenshots. No GitHub issues (issue list empty). No TestSprite auto-fix bot. Devin authored every PR. CodeRabbit skipped review because the author is a bot. Failure bundles live in [`testsprite/failures/`](https://github.com/Satianurag/handoff/tree/main/testsprite/failures) (5 run ids).
- **Credits:** no credit ledger or spend figure in the repo or article. UNVERIFIED.

### Plans in git

17 JSON plans in [`testsprite/plans/`](https://github.com/Satianurag/handoff/tree/main/testsprite/plans). All `type: frontend`. No field marks generated vs hand-written.

| Plan id | Name |
|---|---|
| `ce8bf137` | Demo boots an isolated sample household |
| `a033a1a7` | Used role link explains it was already used |
| `f4787787` | Unknown route shows a helpful not-found page |
| `43f11454` | Signed-out deep link redirects to sign-in and keeps the destination |
| `ea32770a` | Handover is published, acknowledged by the recipient and receipted |
| `e52cc40b` | Handover cannot be acknowledged without the review confirmation |
| `eb1429e1` | Responsibility assignment is accepted and completed by the recipient with attribution |
| `b59c2a62` | A pending assignment request cannot be bypassed with Take this |
| `991855f0` | Responsibility requires a title |
| `a459915c` | Create a recurring responsibility |
| `c6f0f64a` | Another household's workspace is denied |
| `9a829b0f` | Care-circle member cannot manage the household |
| `4b7bbb18` | Complete the visit from the details panel |
| `de0c4563` | Create a return journey request |
| `17eecef2` | Add a visit question after granting care access |
| `12a8c2a2` | Place search returns selectable, fully visible results |
| `cfba56d3` | Sample office message arrives in the shared Inbox |

15 plans share `createdAt` within the same second at 2026-10-20T11:42:16Z. `17eecef2` was created at 13:01:27Z. `b59c2a62` was created at 16:26:24Z.

### Run history

[run-history.json](https://github.com/Satianurag/handoff/blob/main/testsprite/run-history.json): **229** rows, 17 distinct `testId`s, from 2026-10-20T11:42:27Z through 16:37:04Z. Statuses: 209 passed, 13 blocked, 7 failed. Hosts: production `admired-fish-176.convex.site` (97), `handoff-pr-10.satimon.com` (49), `handoff-pr-12.satimon.com` (34), `handoff-pr-8.satimon.com` (32), `handoff-pr-11.satimon.com` (16), `fortunate-moose-341.convex.site` (1). Nothing after 16:40Z is in the file, so the later green executions `463da903`, `c434f608`, and `7cca54b4` are not in the ledger. LOOP’s “as of 16:40 UTC” matches that cutoff.

Grouped bursts in that file (passed/failed/blocked):

| Time | Source | Target | Result |
|---|---|---|---|
| 11:42 | cli | production | 12 passed, 3 failed (15 rows) |
| 12:50 | cli | production | 15 passed |
| 13:01 | cli | production | 1 passed |
| 14:11 | github_action | production | 16 passed |
| 14:26 | github_action | pr-10 alias | 2 passed, 1 failed, 13 blocked |
| 14:35–14:36 | cli | production, direct preview, alias | 1 passed each |
| 14:43 | cli | pr-10 alias | 16 passed |
| 14:49 | github_action | pr-10 alias | 16 passed |
| 15:03 | github_action | production | 15 passed, 1 failed |
| 15:11 | github_action | pr-8 alias | 16 passed |
| 15:43 | github_action | pr-8 alias | 16 passed |
| 15:50 | github_action | production | 16 passed |
| 16:20 | github_action | pr-11 alias | 16 passed |
| 16:26 | github_action | production | 16 passed, 1 failed |
| 16:31 | github_action | pr-12 alias | 16 passed, 1 failed |
| 16:37 | github_action | pr-12 alias | 17 passed |

### Red → green loops

1. **Baseline product bugs (mail, used link, history label).** CLI burst at 11:42 has three failures whose bundles are in git: [e46d51b6](https://github.com/Satianurag/handoff/blob/main/testsprite/failures/e46d51b6-1085-42ee-9d29-4a9a41917828/failure.json) (mailbox capacity), [cf03f6c1](https://github.com/Satianurag/handoff/blob/main/testsprite/failures/cf03f6c1-aad1-4966-b679-d5f05ac8c990/failure.json) (used link shown as a connection error), [13cc3b7d](https://github.com/Satianurag/handoff/blob/main/testsprite/failures/13cc3b7d-f0a5-40a9-be91-d65dfdb7bfbc/failure.json) (History says “Visit completed” without the visit name). Fixes are PRs [#2](https://github.com/Satianurag/handoff/pull/2), [#3](https://github.com/Satianurag/handoff/pull/3), [#4](https://github.com/Satianurag/handoff/pull/4). The 12:50 burst is 15 passed. LOOP’s execution ids `56442753` and `e811c248` are not on GitHub statuses (CLI). The per-test outcomes are in run-history.
2. **Replaced visit-question plan.** LOOP says run `dbef2b7f` was blocked because the recipient role has no medical access, and the plan was deleted with its runs. The replacement plan `17eecef2` (“Add a visit question after granting care access”) exists, created 13:01Z, and run-history has one passing row at 13:01. The retired plan file is not in the repo.
3. **Pending assignment, on the PR preview.** Push on main, execution [32c56fe1](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/32c56fe1-62e5-494b-9b50-08bbf9185804), description “15/16 passed · 1 failed”, GitHub state **success**. Bundle [099f367d](https://github.com/Satianurag/handoff/blob/main/testsprite/failures/099f367d-efca-4eea-bbdb-2cad176736cf/failure.json): History showed “Responsibility taken” for “TS pick up prescription” and not “Responsibility assignment accepted”. TestSprite’s hypothesis is a mislabeled event. The authors’ fix rejects `claim` while `requestedOwnerId` is set (`ASSIGNMENT_PENDING` in [tasks.ts](https://github.com/Satianurag/handoff/blob/main/convex/tasks.ts)) and adds Convex test “claims cannot bypass pending assignment requests” in [domain.test.ts](https://github.com/Satianurag/handoff/blob/main/convex/domain.test.ts). New browser plan `b59c2a62` then failed on production (execution [0e2a6b78](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/0e2a6b78-4497-44a7-b247-d15567e4efe3), state success, “16/17”) and on the PR #12 preview (execution [8f623eac](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/8f623eac-e412-4a48-ba88-33daf04999d1), state **failure**, “16/17”; run-history run `0c25e3ba` on `handoff-pr-12.satimon.com`). After `2b84d15`, execution [ee743e6c](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/ee743e6c-dfc6-4cf8-b893-fce1adeca656) is “All 17 tests passed”. [PR #12](https://github.com/Satianurag/handoff/pull/12) merged later.
4. **Unexplained stall, not a product fix.** PR #10 at 14:26 was 2/16 with 13 blocked ([91e86e74](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/91e86e74-6adb-4d39-b35a-13670d79628e), GitHub state success). Bundle [95e11890](https://github.com/Satianurag/handoff/blob/main/testsprite/failures/95e11890-4262-4070-8ab8-3dffd7318a5a/failure.json) is “Demo boots” on the alias. The next full runs passed. LOOP calls the cause unknown.

## Test inventory

| Layer | Claimed | Verified | Evidence | Status |
|---|---|---|---|---|
| TestSprite browser plans | 17 | 17 JSON files | [testsprite/plans](https://github.com/Satianurag/handoff/tree/main/testsprite/plans) | VERIFIED |
| Of which generated by TestSprite | 4 | No `source` field. 15 plans were created in the same second | [LOOP scorecard](https://github.com/Satianurag/handoff/blob/main/LOOP.md) | UNVERIFIED |
| Hand-written browser plans | 13 | Same as above | LOOP / README | UNVERIFIED |
| TestSprite proposals discarded | 49 of 53 | 53 proposal files are not in the repo | [recipe](https://github.com/Satianurag/handoff/blob/main/docs/testsprite-convex-recipe.md) | UNVERIFIED |
| Recorded TestSprite test runs | 229 | 229 rows, 17 test ids, 209/13/7 passed/blocked/failed | [run-history.json](https://github.com/Satianurag/handoff/blob/main/testsprite/run-history.json) | VERIFIED |
| Failure bundles | 5 runs (not claimed as a total) | 5 directories | [testsprite/failures](https://github.com/Satianurag/handoff/tree/main/testsprite/failures) | VERIFIED |
| Vitest (Convex) | not given as a number; `npm test` | 122 passed / 15 files | Local run 2026-10-23; CI [run 39462818556](https://github.com/Satianurag/handoff/actions/runs/39462818556) log: `Tests 122 passed` | VERIFIED |
| `npm run test:web` (node:test) | not numbered | 50 passed | Same CI run: `# tests 50` / `# pass 50`; local run matched | VERIFIED |
| Preview-alias worker tests | “They run in CI” | 14 passed | [worker.test.mjs](https://github.com/Satianurag/handoff/blob/main/infra/preview-alias/test/worker.test.mjs); CI `# tests 14` / `# pass 14`; local run matched | VERIFIED |
| TestSprite API / backend tests | none; LOOP says access rules are UI-only | No API suite in `testsprite/` or workflows | [LOOP known gaps](https://github.com/Satianurag/handoff/blob/main/LOOP.md) | VERIFIED (absence) |

**Local run:** `npm ci`, then `npx vitest run` (122 passed), `npm run test:web` (50 passed), `node --test infra/preview-alias/test/worker.test.mjs` (14 passed). `node_modules` removed afterward. `npm ci` audit reported 5 vulnerabilities (2 moderate, 3 high); CVEs were not triaged. Provider live scripts under `scripts/verify-*-live.mjs` were not run (they need Convex and provider secrets).

## Claim verification

| Claim | Verdict | Evidence |
|---|---|---|
| Public demo uses fictional care info | VERIFIED | Live [landing.html](https://admired-fish-176.convex.site/landing.html) says “Use fictional care information” and names Maya, Leo, and a sample office. Live `workspace.js` includes “Evaluation release: use fictional care information.” Seed data is synthetic in [demoStore.ts](https://github.com/Satianurag/handoff/blob/main/convex/demoStore.ts). |
| TestSprite caught the pending-assignment bug on the PR’s own Convex preview: 16/17, merge blocked; after the fix 17/17, merged | VERIFIED, with a timing caveat | Failure status on `67ea994`: “16/17 passed · 1 failed”, state failure, execution [8f623eac](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/8f623eac-e412-4a48-ba88-33daf04999d1), target in run-history `handoff-pr-12.satimon.com`. Fix SHA `2b84d15` status “All 17 tests passed”, [ee743e6c](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/ee743e6c-dfc6-4cf8-b893-fce1adeca656). [PR #12](https://github.com/Satianurag/handoff/pull/12) merged 17:02Z. The ruleset requires `TestSprite V3`, so a failing check blocks a normal merge. The stored `mergeable_state` string is gone. The merged SHA’s own status was posted at 17:10Z, after the merge. TestSprite’s written hypothesis was a wrong history label; the pending-request cause is the authors’ diagnosis, then locked in by plan `b59c2a62`. |
| 17 browser tests | VERIFIED | 17 plan files, and the green statuses say “All 17 tests passed”. |
| 4 generated by TestSprite, 13 hand-written | UNVERIFIED | Author text in [README](https://github.com/Satianurag/handoff/blob/main/README.md) and [LOOP](https://github.com/Satianurag/handoff/blob/main/LOOP.md). Plans have no authorship field, and 15 share one `createdAt` second. |
| Coverage: handover receipts, responsibility transfer, cross-household denial, permissions, one-time links, required fields, visits, places, mail | VERIFIED | Plan names above match each of those areas. |
| Caught four app bugs | VERIFIED | Bundles `e46d51b6`, `cf03f6c1`, `13cc3b7d`, `099f367d` plus fix PRs #2, #3, #4, #12. PRs #5–#7 are explicitly “not by TestSprite” in LOOP. |
| A separate incorrect test plan was replaced | VERIFIED as a replacement; the retired plan itself is not in git | Plan `17eecef2` created 13:01Z and one passing run-history row at 13:01. LOOP says retired id `dbef2b7f` was deleted. That file and its runs are absent, so the incorrect steps are author-attested. |
| Required `TestSprite V3` status gates merging | VERIFIED for the PR trigger | Ruleset `main-gate` requires that context. The pre-fix SHA’s status is `failure`. Push-trigger failures on `65d92a4` and `779757b` are GitHub **success**, so a red production run does not fail the check. |
| Fork PRs excluded | VERIFIED in the workflow | [preview.yml](https://github.com/Satianurag/handoff/blob/main/.github/workflows/preview.yml) `deploy` job runs only when `head.repo.full_name == github.repository`. No fork PR exists in the repo to observe a skipped run. |
| First production run 12/16 with 3 failed and 1 blocked | PARTLY VERIFIED | 11:42 burst is 12 passed and 3 failed (15 rows). The blocked 16th row is not in the file; LOOP says those runs were deleted with the plan. |
| 229 recorded runs as of 16:40Z | VERIFIED | 229 rows, max timestamp 16:37:04Z. |
| Alias hostnames for PRs 1–60 | VERIFIED in config; live-checked for PR 12 only | 60 `handoff-pr-N` patterns in [wrangler.toml](https://github.com/Satianurag/handoff/blob/main/infra/preview-alias/wrangler.toml). On 2026-10-23, `https://handoff-pr-12.satimon.com/demo` returned 302 to `https://lovely-weasel-724.convex.site/demo` (then 200). |
| Preview alias 302 is checked before TestSprite starts | VERIFIED in workflow | `preview` job fetches the alias and fails unless status is 302 and `Location` is the preview `/demo`. |
| Push trigger does not gate | VERIFIED | Status state stays `success` on “15/16 passed · 1 failed” and “16/17 passed · 1 failed”. |

## Code quality

Strict TypeScript for Convex (`strict: true` in [convex/tsconfig.json](https://github.com/Satianurag/handoff/blob/main/convex/tsconfig.json)). CI typechecks, pins Actions by commit SHA, sets workflow `permissions: {}`, and splits the preview so the job that runs PR code does not hold the OIDC token. The worker tests cover bad audience, repository, owner, workflow, expiry, and `alg: none` (14 tests, all passing).

Smells: many `web/views/*.js` and some `convex/*.ts` files are compressed onto very long lines (`web/views/care.js` averages well over 500 characters per line), so review is harder than the architecture deserves. The web app is untyped JavaScript and is outside `tsc`. No ESLint or Biome config. No license file. All 12 merged PRs are from `devin-ai-integration`. Zero issues. SPA fallback means unknown URLs are HTTP 200. `npm ci` reported 5 audit findings that were not triaged here.

## Live-site behavior

Checked 2026-10-23 with curl. No demo household was created (that would be a client mutation after JavaScript boots).

| URL | Result |
|---|---|
| https://admired-fish-176.convex.site/ | 200 in 0.53s, `text/html`, title “Handoff — A little less to carry.”, boot copy “Opening your space…” |
| https://admired-fish-176.convex.site/demo | 200 in 0.14s, same shell |
| `/sign-in`, `/help`, `/terms`, `/privacy` | 200, same shell |
| `/does-not-exist` | 200, same shell (SPA fallback, not an HTTP 404) |
| https://admired-fish-176.convex.site/landing.html | 200, 33607 bytes. Hero, fictional-care note, Maya/Leo sample, links to `/demo` |
| https://admired-fish-176.convex.site/robots.txt | 200, `User-agent: *` / `Allow: /` |
| `/favicon.svg`, `/tokens.css`, `/entry.js`, `/workspace.js` | 200 |
| `/demo-fixtures/not-a-real-id` | 404, body `Synthetic fixture unavailable.` |
| https://admired-fish-176.convex.cloud/ | 200, `This Convex deployment is running.` |
| https://handoff-pr-12.satimon.com/demo | 302 in 0.20s to `https://lovely-weasel-724.convex.site/demo`, which returned 200 |

`/api` is also the SPA shell (200 HTML), not a JSON API. The Convex HTTP API is on `.convex.cloud`. The signed-out page and the fictional disclaimer are in the static landing and `workspace.js`. The interactive sample flow itself was not clicked.

## Demo

No demo video in the repo, the article, or the submission (`demo: none`). What exists is a live product: [landing](https://admired-fish-176.convex.site/landing.html) plus [sample entry](https://admired-fish-176.convex.site/demo). Length: not applicable. The landing shows a fictional family (Maya, Leo, sample office, handover receipt copy) and tells visitors to use fictional care information.

## Weaknesses / risks for judges

- The push trigger reports `TestSprite V3` **success** when tests fail. A red production run cannot block anything, and it overwrites the earlier PR status on that SHA.
- The commit that actually landed (`ea7516a`) received its TestSprite status at 17:10Z, after the 17:02Z merge. The ruleset has no pull-request requirement, and a bypass list was not visible. The red commit itself stayed red and was not the merge commit.
- Frontend TestSprite only. Backend rules are Vitest, not TestSprite API tests.
- The 4-vs-13 authorship split and the “53 proposals” figure have no committed proposal export.
- The retired wrong plan and the blocked baseline row were deleted, so that part of the story is the authors’ account plus the replacement plan.
- TestSprite’s own write-up of bug 4 blamed a history label. The pending-request root cause is the project’s diagnosis.
- PR #10’s 2/16 stall is unexplained, and that failing run was posted as GitHub success.
- One-day project history (all 12 PRs merged on 2026-10-20, all by Devin). No license, no issues, compressed UI source.
- Free Convex previews expire (the recipe says 5 days). The PR 12 alias still redirected on review day.
- Sample mail stays inside Convex, so the suite does not hit real AgentMail.
- Dashboard executions are login-walled. Public proof is the GitHub status text, PR comments, and the committed ledger.

## Where it beats Ninety

Ninety is https://github.com/mohamedwael201193/ninety (live https://ninety-coral.vercel.app): Schengen 90/180 calculator, 43 frontend TestSprite plans and 28 backend CLI tests in git, but branch protection is API 403 and PR #63 merged while TestSprite V3 was red. No TestSprite MCP. CLI nightly and `testsprite-smoke.yml` are disabled or broken.

1. **A readable ruleset that requires `TestSprite V3`, plus a commit that is still red.** Ruleset [`main-gate`](https://github.com/Satianurag/handoff/rules/25486633) requires that context, and [`67ea994`](https://github.com/Satianurag/handoff/commit/67ea99432f60b504160ba9466edf6644b31284a9) is state `failure` (“16/17 passed · 1 failed”, [8f623eac](https://www.testsprite.com/dashboard-v3/o/2a412a58-535a-50c7-acd5-60264d0a7740/projects/98d946ba-f237-453f-b6e5-2b1fea4ca0fa/execution/8f623eac-e412-4a48-ba88-33daf04999d1)). Ninety would need a default-branch ruleset whose required check is `TestSprite V3`, and it would need to leave the failing SHA unmerged until a later SHA is green.
2. **The suite targets that PR’s Convex preview, not production.** Run-history rows for the 16/17 failure use `https://handoff-pr-12.satimon.com`. The alias is registered with GitHub OIDC and the workflow refuses to go green unless the alias 302s to the preview ([preview.yml](https://github.com/Satianurag/handoff/blob/main/.github/workflows/preview.yml), [worker](https://github.com/Satianurag/handoff/blob/main/infra/preview-alias/src/worker.js)). Ninety would need the PR trigger’s URL pattern to be the PR deployment, and a failing run on that deployment to fail the check.
3. **Committed per-test ledger and failure bundles next to a same-PR red/green pair.** [229 rows](https://github.com/Satianurag/handoff/blob/main/testsprite/run-history.json) and [5 bundles](https://github.com/Satianurag/handoff/tree/main/testsprite/failures), including the production symptom [099f367d](https://github.com/Satianurag/handoff/blob/main/testsprite/failures/099f367d-efca-4eea-bbdb-2cad176736cf/failure.json) and the later preview failure that GitHub recorded as a failed check. Ninety would need TestSprite artifacts in git and a failing check that stays `failure` until the fix commit.

Technique Ninety does not have: a Cloudflare alias so TestSprite’s `{pr}` pattern can address a random Convex preview hostname, with the mapping written by a GitHub OIDC token that is checked for repository id, owner id, `pull_request`, and `preview.yml`. Ninety’s Vercel previews already have predictable URLs, so the missing piece for Ninety is binding the required check to the PR deployment and failing the status when that deployment is red. Handoff has fewer TestSprite tests (17 frontend vs Ninety’s 43 frontend plus 28 backend) and no TestSprite CLI workflow.

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 8 | Real family-coordination problem and a broad product (records, visits, handovers, mail, permissions). Evaluation-only, fictional data, no adoption claim. |
| TestSprite depth | 8 | Required App check, preview targeting, red then green on PR #12, plans and run ledger in git. No MCP, no CLI in CI, no schedule, push check stays green on failure, frontend only. |
| Verifiability | 8 | Status API, ruleset API, PR comments, 17 plans, 229-row ledger, 5 bundles, live fictional copy. Gaps: 4/13 split, deleted plan, login-walled dashboard, merge state not archived, comment execution id ≠ status execution id. |
| Polish | 7 | Pinned CI, strict Convex types, OIDC split, careful worker tests, polished landing. Compressed source, no linter, no license, Devin-only PR history, HTTP 200 for unknown paths. |
| Demo | 5 | No video. Live landing and `/demo` shell are up, with an explicit fictional sample. |
| **Overall** | **7** | Strongest public “block the merge until the preview is green” story in this review, with honest gaps written down. The push-check false green, the merge that landed before the final status, and the missing video keep it from an 8. |
