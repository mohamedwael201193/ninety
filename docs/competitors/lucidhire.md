# LucidHire

- **Name:** LucidHire
- **Author:** jnzlab (Jameel Ahmad)
- **Repo:** https://github.com/jnzlab/lucid-hire (public, created 2026-10-22, default branch `main`, 136 commits, 24 merged PRs, 0 stars, no license file)
- **Live:** https://lucidhire.io/ (API https://api.lucidhire.io)
- **TestSprite PRs:** https://github.com/jnzlab/lucid-hire/pull/4 , https://github.com/jnzlab/lucid-hire/pull/15
- **Demo:** https://pub-0686376a5a4f49fcb467526886de4a33.r2.dev/lucidhire-demo-v3-2x.mp4
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7
- **Portal project (from check links):** `82987c71-2d08-4b4a-8bb9-2929eb1511c6`

## What it is

LucidHire is a recruiter tool for posting a job, taking CVs, and getting a ranked shortlist where every score is computed from requirement-level quotes rather than a model-invented number. The user is a small hiring team: companies have admin and member roles, and Free / Pro / Max plans cap CVs per job, jobs per month, and AI calls. Candidates apply on a public job page. The hackathon entry is a one-day Cloudflare rebuild (Workers, D1, R2, Workflows, Clerk, Polar sandbox, Gemini) whose stated bar is that every pull request is gated by a TestSprite 3.0 browser suite against the live site.

## Architecture

Monorepo (`pnpm` 10.33, Node `>=22.18`). Two Cloudflare Workers, one production environment, no preview URLs.

| Piece | What it is | Where |
| --- | --- | --- |
| Web | Vite SPA, React 19, TanStack Router and Query, Tailwind 4. A small Worker does the `www` → apex redirect, security headers, `/sitemap.xml`, and per-job Open Graph tags. | [apps/web/worker/index.ts](https://github.com/jnzlab/lucid-hire/blob/main/apps/web/worker/index.ts), [apps/web/cloudflare.config.ts](https://github.com/jnzlab/lucid-hire/blob/main/apps/web/cloudflare.config.ts) |
| API | Hono + Zod. Clerk bearer auth, company scoping, jobs, CV upload to R2, a Workflow (`lucidhire-score-cv`) that waits for a reading slot then sends the PDF to `gemini-3.5-flash-lite`, interview questions, public apply + Turnstile, Polar webhooks, team invites. | [apps/api/src/index.ts](https://github.com/jnzlab/lucid-hire/blob/main/apps/api/src/index.ts), [apps/api/src/app.ts](https://github.com/jnzlab/lucid-hire/blob/main/apps/api/src/app.ts), [apps/api/cloudflare.config.ts](https://github.com/jnzlab/lucid-hire/blob/main/apps/api/cloudflare.config.ts) |
| Plans | One shared definition of Free / Pro / Max (price, CV cap, job cap, AI cap, queue head start). | [packages/plans/src/index.ts](https://github.com/jnzlab/lucid-hire/blob/main/packages/plans/src/index.ts) |
| Roles | `admin` and `member` only. Last admin cannot be demoted. | [apps/api/src/db/schema.ts](https://github.com/jnzlab/lucid-hire/blob/main/apps/api/src/db/schema.ts) |
| Deploy | Cloudflare Workers Builds runs `pnpm check` then [scripts/deploy.sh](https://github.com/jnzlab/lucid-hire/blob/main/scripts/deploy.sh) (D1 migrate, API deploy, web deploy, wait for `/health` and the home page). No GitHub Actions workflows (none in the tree; Actions workflows API returned an empty list). Docs say Actions is unavailable on `jnzlab`. | [docs/hackathon-s4.md](https://github.com/jnzlab/lucid-hire/blob/main/docs/hackathon-s4.md) |

The planning doc still describes Vectorize, queues, and a Durable Object leaderboard. The shipped Worker config does not bind those. Scoring is one Gemini call per CV plus a Workflow queue (5 concurrent per company, 10 global, Pro/Max head start). Every PR branch deploys onto the same production Workers, so the last push wins the live site.

## TestSprite integration depth

**Score: 7 / 10.** While credits lasted, this is a real GitHub App gate: the suite runs only after `Workers Builds: lucidhire-app` goes green, against the fixed live URL, on both the PR and a push to `main`, with bot comments that name every test. There is no CLI workflow, no MCP config, no schedule, and no test code in git. The gate stopped holding on the evening of 2026-10-22, and a push-trigger status once reported success while its own text said a test failed.

### GitHub App check

The result is a commit **status** context `TestSprite V3` (app `testsprite`), not a GitHub Actions check, on every successful run. Dashboard pages return a login shell to an anonymous fetch, so pass/fail counts below are the status description and the `testsprite[bot]` comment, not a re-count of the portal UI.

Suite growth on PR heads (bot comment or status):

| When | Result | Evidence |
| --- | --- | --- |
| PR #1 head | 3/3 | [execution 5037650b](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/5037650b-d91e-40bc-9ab1-4b0cbdf7d463) |
| PR #2 head | 8/8 | [execution c8d3361e](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/c8d3361e-54b8-48dc-bd8d-ac3d03e456e2) |
| PR #3 | 9/10 blocked, then 10/10 | [41fabb72](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/41fabb72-7df6-4b63-b815-03333cb39593) on `b50863f`, then [6bcc0a04](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/6bcc0a04-86a3-4ff7-beb6-873d8edbd296) on `cf164ce0` ("re-run the TestSprite gate with the updated project instructions") |
| PR #4 | 14/15 failed, then 15/15 | [d2dd8c65](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/d2dd8c65-2fd0-4708-a553-3a96de1d78cc) state **failure** on `6dd1869`; [2bfe3170](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/2bfe3170-31fd-4bb9-8335-e140365ce76a) on `e475e714`. Comment lists 15 named tests. |
| PR #5 | 18/18 | [ce2072f2](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/ce2072f2-18b1-42b8-95bf-67a2f3f25b97) |
| PR #6 | 19/19 | [c29ea56a](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/c29ea56a-1661-4d7a-bb83-1405bd89ffe1) |
| PR #7, #8 | 20/20 | [50ecd0df](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/50ecd0df-d3af-408b-996e-a51f229ce8e9), [34fb453b](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/34fb453b-2ea3-492d-a372-b94855c93eb2) |
| PR #9 | 25/25 | [15030e81](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/15030e81-3e66-4e58-8af1-9004d193bca5) |
| PR #10 | 28/29 blocked, then 29/29 | [7b396daf](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/7b396daf-0f95-4018-b731-46ae66639cce) state **failure** on `16560c9`; [d20124e2](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/d20124e2-860c-48b8-a7cd-66c2ac102762) on `5a19c05` |
| PR #11 merge | 33/33 | [efa02334](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/efa02334-21fd-4807-9185-8bf19886124e) |
| PR #12 head | 36/36 | [2a3e9be6](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/2a3e9be6-8127-441d-b7f4-4c9a7ce4afcc) |
| PR #13 | 39/40 failed, then 42/42 | [898e5f30](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/898e5f30-6956-4a2c-8a09-f9dbc2c28236) state **failure** on `db3baad`; [d498a486](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/d498a486-2e93-41cd-9b5e-9b35851ce0c9) on head `7651033` |
| PR #14 head | 44/44 | [98605035](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/98605035-944e-4691-a064-9700e54c6c52). Comment names 44 tests. |
| PR #15 head | 44/44 | [949f91a5](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/949f91a5-603d-46f1-a761-57e250a7cc51) |
| PR #16 head | 44/44 | [ae4b5b85](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/ae4b5b85-c796-4933-a05c-f7a079201b63) |
| PR #17 head and main | 44/44 | PR [fc33b5e4](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/fc33b5e4-a53b-40ba-ad57-7a04a6d4d4c4); main merge [fc471d14](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/fc471d14-3a9f-4d42-b18d-ec52c7ede2b6) at 2026-10-22T22:41:20Z. Last full green run. |
| PRs #18–#24 | no test run | Check run title `Not enough credits: 44 tests need 22, 14.5 available.` Example head of #18: [run 120131955920](https://github.com/jnzlab/lucid-hire/runs/120131955920). |

The bot comment is updated in place, so the red narrative is gone from the PR thread. The failing status on the earlier SHA is what preserves 14/15, 9/10, 28/29, and 39/40.

### Is it a required check?

`GET /repos/jnzlab/lucid-hire/branches/main/protection` returned **403**. `GET /repos/jnzlab/lucid-hire/rulesets` returned `[]`. No public proof of a required-context rule.

What the history shows:

- The red SHA `6dd1869` (14/15, state `failure`) was not the merged commit. PR #4 merged `e475e714` after 15/15. Same pattern for the 9/10, 28/29, and 39/40 SHAs. That is consistent with a gate or with discipline.
- Their own rules file says branch protection requires `Workers Builds: lucidhire-app` and `TestSprite V3`, and that admins can bypass ([docs/hackathon-s4.md](https://github.com/jnzlab/lucid-hire/blob/main/docs/hackathon-s4.md) §5).
- On 2026-10-23, `jnzlab` merged PRs #18–#22 while a `TestSprite V3` **check run** was already `failure` on the head (credit exhaustion). #18's failure was posted at 22:44Z on the 22nd; the merge was 00:00:29Z. #22's failure completed 8 seconds before the merge. A failing check did not stop those merges.
- Credit failures are check runs. Successful runs are commit statuses. On those red credit SHAs the combined commit status is `pending` with zero statuses. If protection required the status context, a missing status should have blocked the button unless an admin bypassed it. The merger is the repo owner.

### Push trigger on main

Verified for the period the suite could run. Merge commits #2 through #17 carry a `TestSprite V3` status posted after the merge (a second execution, not a copy of the PR run). Two of those main runs are not clean, and the status state does not match the text:

- Merge of #14 (`e52edfc`): state **success**, description `43/44 passed · 1 failed`. [execution 1d014a83](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/1d014a83-2c18-4e79-bfae-aeb237a48302).
- Merge of #15 (`ecab4f6`): state **success**, description `43/44 passed · 1 blocked`. [execution 1e54f8aa](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/1e54f8aa-dc0a-480a-b6f0-a7fb9bf70902).

So a PR failure flips the status to `failure` (14/15 did), but at least one **main** rerun posted `success` while describing a failed test. The push trigger reruns; it does not reliably fail the commit.

Merge of #1 and merge of #19 have no TestSprite status and no TestSprite check run. #19 was merged in the same minute as #18 and #20; the push trigger simply did not record a result on that SHA. Merges of #18 and #20–#24 did get the credit-failure check run.

### CLI, MCP, schedules, triage

- No `.github/workflows`. No `testsprite` CLI invocation, no `testsprite ci run`, no JUnit upload.
- `.testsprite/` is gitignored ([docs/hackathon-s4.md](https://github.com/jnzlab/lucid-hire/blob/main/docs/hackathon-s4.md) §9). No MCP config in the repo. The CLI is described as a local agent tool (`@testsprite/testsprite-cli` v0.15.0), not as CI.
- No nightly, no Test List schedule, no on-merge workflow beyond the portal push trigger.
- Triage is the bot comment on the PR (screenshot table, "what could be better"). Zero GitHub issues. No auto-fix bot. Comments are overwritten on the next run, so the failure write-up does not stay on the PR.

### Red → green loops

1. **PR #3 sign-in / instructions.** `b50863f` status failure `9/10 passed · 1 blocked` ([41fabb72](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/41fabb72-7df6-4b63-b815-03333cb39593)). Next commit `cf164ce0` is 10/10 ([6bcc0a04](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/6bcc0a04-86a3-4ff7-beb6-873d8edbd296)). The commit message says the rerun used updated project instructions. The doc's claim that the instructions still said "don't sign in" is only in that doc.
2. **PR #4 jobs.** `6dd1869` failure `14/15 passed · 1 failed` ([d2dd8c65](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/d2dd8c65-2fd0-4708-a553-3a96de1d78cc)). `e475e714` success 15/15 ([2bfe3170](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/2bfe3170-31fd-4bb9-8335-e140365ce76a)). Details in the claim table.
3. **PR #10 apply.** `16560c9` failure `28/29 passed · 1 blocked` ([7b396daf](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/7b396daf-0f95-4018-b731-46ae66639cce)). Follow-up `6969a84` explains a disabled apply button when the Turnstile check fails; `5a19c05` is 29/29 ([d20124e2](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/d20124e2-860c-48b8-a7cd-66c2ac102762)). README says the apply test stops at the security check and the submit itself is API-tested.
4. **PR #13 plans.** `db3baad` failure `39/40 passed · 1 failed` ([898e5f30](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/898e5f30-6956-4a2c-8a09-f9dbc2c28236)). Head later green at 42/42 ([d498a486](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/d498a486-2e93-41cd-9b5e-9b35851ce0c9)). The status text does not name the failed test. Intermediate commits have no TestSprite status.
5. **Invite link, across #14's main run and #15.** Main after #14: `43/44 passed · 1 failed` but state **success** ([1d014a83](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/1d014a83-2c18-4e79-bfae-aeb237a48302)). PR #15 head `122ddaf` is 44/44 ([949f91a5](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/949f91a5-603d-46f1-a761-57e250a7cc51)). The next main run is `43/44 passed · 1 blocked`, state success ([1e54f8aa](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/1e54f8aa-dc0a-480a-b6f0-a7fb9bf70902)). Production was not left at 44/44.

### Credits

Check-run title on #18–#24: `Not enough credits: 44 tests need 22, 14.5 available.` Not zero credits: 14.5 left, and a 44-test run wants 22, so the suite cannot start. Last successful execution is the #17 main rerun at 22:41Z on the 22nd. Everything after that (webhook secret, auth redesign, overview-first, job-form layout, dashboard redesign, landing edit) shipped with no passing suite. #23 and #24 were merged before the head's Workers Build had even started; the credit failure landed on the merge commit afterwards.

### Tests committed in git

The 44 end-to-end tests are **not** in the repo. The inventory is the README table (44 rows) plus the portal. [README.md](https://github.com/jnzlab/lucid-hire/blob/main/README.md) lines under "TestSprite coverage". No test-plan JSON, no generated Playwright files.

## Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
| --- | --- | --- | --- | --- |
| TestSprite 3.0 frontend E2E, live site | 44, grown from 8 | 44 names in the README table; 44 unique names in the PR #17 bot comment; growth 3 → 8 → 10 → 15 → 18 → 19 → 20 → 25 → 29 → 33 → 36 → 42 → 44 | [README](https://github.com/jnzlab/lucid-hire/blob/main/README.md), [PR #2 comment run](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/c8d3361e-54b8-48dc-bd8d-ac3d03e456e2), [PR #17](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/fc33b5e4-a53b-40ba-ad57-7a04a6d4d4c4) | VERIFIED as a count. The first suite was 3 (PR #1), then 8 on the landing PR. Portal UI itself was login-walled. |
| TestSprite backend / CLI | none claimed | 0 workflows, 0 committed backend TestSprite tests | repo tree; bot comments say the run is the frontend suite | VERIFIED absence |
| Vitest API (`apps/api`) | not in the submission blurb (PR #4 body said 34 at that time) | **378 passed** locally (`vitest run`, 2026-10-23, 17 files) | local run this review | VERIFIED local |
| Vitest web (`apps/web`, includes the Worker unit tests) | not in the submission blurb | **534 tests, 532 passed, 2 failed** locally | local run this review | VERIFIED local, not a clean pass |
| Vitest plans package | not claimed | **5 passed** | local run | VERIFIED local |
| Workers Builds `pnpm check` | implied by green deploys | latest main build check is success, which is their signal that `pnpm check` passed in CI | [run 120266752318](https://github.com/jnzlab/lucid-hire/runs/120266752318) on merge of #24 | CI log text is on the Cloudflare dashboard, not re-read here |

Local failures (this machine, Node v22.23.4, fresh `pnpm install --frozen-lockfile`, then `node_modules` removed):

- `apps/web/src/candidates/detail/use-cv-preview.test.tsx`: `blob.text()` resolved to `"[object Blob]"` instead of the fake PDF bytes.
- `apps/web/src/app-flow.test.tsx` "adds, replaces and removes a cover image": never found `img` named "Current cover".

Both look like jsdom behavior. The same commit's Workers Builds check is green, so CI did not fail closed on them. API tests did run here against Miniflare (378 passed, ~34s) with no secrets.

## Claim verification

| Claim | Verdict | Evidence |
| --- | --- | --- |
| Teams with roles, and Free / Pro / Max plans | VERIFIED | Roles `admin` \| `member` in [schema.ts](https://github.com/jnzlab/lucid-hire/blob/main/apps/api/src/db/schema.ts). Plans ($0 / 10 CVs / 10 jobs, $10 / 100 CVs / 20 jobs, $30 / 1000 CVs / unlimited jobs) in [packages/plans/src/index.ts](https://github.com/jnzlab/lucid-hire/blob/main/packages/plans/src/index.ts). A 44/44 run includes "Terms page lists the plans and their limits", "Settings shows the company's plan", and "Admin creates a team invite link" ([PR #14 execution](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/98605035-944e-4691-a064-9700e54c6c52)). Demo frame shows a Pro badge and an Admin user. This review did not sign in. |
| 44 end-to-end tests in the 3.0 portal against the live app, grown from 8 | VERIFIED | Counts above. Target URL in their rules and README is https://lucidhire.io. "From 8" matches PR #2; the suite before that was 3 tests on PR #1. Tests are portal-side, not files in git. |
| TestSprite V3 check blocks a failing merge | UNVERIFIED as a GitHub requirement | Protection API 403, rulesets empty. The 14/15 SHA was not merged. Later, PRs #18–#22 merged with a failing `TestSprite V3` check run already on the head. Their doc says admins can bypass. No recorded "merge blocked" event. |
| Push trigger reruns on main | VERIFIED | Distinct executions on merge commits #2–#17. After credits died, merge commits #18 and #20–#24 still received a TestSprite check run (the credit failure). #19's merge commit got nothing. |
| Credits ran out on the final day; PRs #18–#23 merged without the gate | VERIFIED, with two corrections | Check title: 44 tests need 22 credits, 14.5 available ([run 120131955920](https://github.com/jnzlab/lucid-hire/runs/120131955920) and the same title on #19–#24). The check still fired and failed; the tests did not run, and the merge was not blocked. #24 (after #23) is in the same state. #23 and #24 were merged before the head check existed. |
| First run 14/15 caught a deleted job still listed; `dedc709` fixed it with a regression test; rerun 15/15 | VERIFIED counts and fix; the red test's cause is narrower than the claim | Status failure `14/15 passed · 1 failed` on [`6dd1869`](https://github.com/jnzlab/lucid-hire/commit/6dd1869abec21057f4edc2e201fee0595da119e8) ([d2dd8c65](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/d2dd8c65-2fd0-4708-a553-3a96de1d78cc)). [`dedc709`](https://github.com/jnzlab/lucid-hire/commit/dedc7099b05a6973e140eb36cbc436830dfa7745) drops the job from the React Query cache in [jobs.ts](https://github.com/jnzlab/lucid-hire/blob/main/apps/web/src/lib/jobs.ts) and the flow test holds the refetch ([app-flow.test.tsx](https://github.com/jnzlab/lucid-hire/blob/main/apps/web/src/app-flow.test.tsx) "lets an admin delete a job after confirming"). 15/15 is the **next** commit `e475e714`, not `dedc709` (that SHA has no TestSprite status). [PR #4 body](https://github.com/jnzlab/lucid-hire/pull/4) says the failing assertion was a parallel-run collision (post and delete tests shared the title "Sprite test role"); the stale cached row was a second bug that same run exposed. The status text does not name the test. The demo repeats the cache-drop story. |
| Revoked invite left a dead link; fixed in PR #15; 44/44 | VERIFIED for the PR gate, not for the following production run | [PR #15 body](https://github.com/jnzlab/lucid-hire/pull/15) and commit [`122ddaf`](https://github.com/jnzlab/lucid-hire/commit/122ddafd576b) ("stop offering an invite link once it is revoked"), plus the unit test in [team-page.test.tsx](https://github.com/jnzlab/lucid-hire/blob/main/apps/web/src/settings/team-page.test.tsx). Head status: `All 44 tests passed` ([949f91a5](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/949f91a5-603d-46f1-a761-57e250a7cc51)). The main run that found it was after #14: `43/44 passed · 1 failed` with state success ([1d014a83](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/1d014a83-2c18-4e79-bfae-aeb237a48302)). After #15 merged, main was `43/44 passed · 1 blocked`, state success ([1e54f8aa](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/1e54f8aa-dc0a-480a-b6f0-a7fb9bf70902)). |
| README: every PR is gated by a TestSprite check against a live deployment | FALSE for the last seven PRs | [README](https://github.com/jnzlab/lucid-hire/blob/main/README.md). #18–#24 merged with a credit failure or, for #23/#24 heads, no TestSprite result yet. |

## Code quality

The code is careful for a one-day build. TypeScript `strict` (and `noUnusedLocals` on the web app), oxlint in `pnpm check`, Zod on the API, conventional commits, merge commits so the red/green SHAs stay on `main`. Comments explain invariants (last-admin update, webhook ordering, queue slot). The plans package is the single source for numbers shown in the UI and enforced by the API. 69 test files, and the API suite actually drives D1 through Miniflare.

Smells that matter to a judge:

- One production environment. A PR deploy replaces https://lucidhire.io before the suite runs, and two open PRs cannot be tested at once. #18, #19, and #20 were merged within 34 seconds.
- The TestSprite company is comped to Max by migration `0008_comp_test_company` so the suite can create jobs past the Free cap ([README](https://github.com/jnzlab/lucid-hire/blob/main/README.md)).
- Docs say Clerk bot protection was turned off on the production instance so the cloud browser can sign in with a password.
- Billing is Polar sandbox. AI is Gemini free tier (`gemini-3.5-flash-lite`), which they already hit the daily cap of once and swapped models mid-build.
- SPA fallback: `GET /assets/nope.js` returned **200 `text/html`** with `cache-control: public, max-age=31536000, immutable`. A miss under `/assets/` is cached as immutable HTML.
- Unknown routes return 200 HTML. The not-found page is client-rendered. `GET /jobs/no-such-job-00000000` with `Accept: text/html` kept the default title (the real job in the sitemap did get a per-job title).
- No `any` / `ts-ignore` sweep was clean enough to call out; the `TODO|any` grep mostly hit the word "any" in comments. No GitHub issues, no license.
- Planned Vectorize / Durable Object leaderboard is not in the Worker config. The product does not do semantic search over CVs.

## Live-site behavior

Checked 2026-10-23 with curl. No forms submitted, no sign-in.

| URL | Result |
| --- | --- |
| https://lucidhire.io/ | 200 in ~0.21s. HTML shell (~3.9 KB) with title "LucidHire: we read every CV, you meet the best ones", description, canonical, OG image. The visible page is the JS bundle, not prerendered body copy. |
| https://www.lucidhire.io/ | 301 to https://lucidhire.io/ with HSTS, `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'`, `nosniff`, referrer policy, permissions policy. |
| `/sign-in`, `/sign-up`, `/privacy`, `/terms`, `/dashboard`, `/does-not-exist-xyz` | 200, same SPA shell. Auth redirect and the not-found page are client-side. |
| `/jobs/full-stack-developer-backend-focused-100-remote-yv9ihwyv` with `Accept: text/html` | 200, title rewritten to `Full Stack Developer (Backend focused- 100% REMOTE) \| LucidHire` and a meta description from the job. Worker OG injection works for a real job. |
| `/jobs/no-such-job-00000000` with `Accept: text/html` | 200, default site title. Friendly copy would be client-rendered. |
| `/sitemap.xml` | 200 XML: home, privacy, terms, and that one public job. |
| `/robots.txt` | 200. Allows `/`, disallows dashboard, onboarding, sign-in, sign-up, sign-out, invite. |
| `/favicon.svg`, `/og-image.png` | 200 (PNG ~52 KB). |
| `/assets/nope.js` | 200 `text/html`, immutable cache for a year. |
| https://api.lucidhire.io/health | 200 `{"ok":true,"service":"lucidhire-api"}` ~0.17s. |
| `GET /` on the API | 404 `not_found`. |
| `GET /jobs` with no token | 401 `unauthenticated` / "Sign in to continue". |

Security headers on the HTML responses are real (HSTS preload-shaped, frame denial, permissions policy). This review did not exercise sign-up, billing, upload, or apply.

## Demo

The file exists. `ffprobe` duration **145.5 seconds** (~2 min 26 sec), 18,343,945 bytes, `video/mp4`, HTTP 200, last-modified 2026-10-23 06:10:49 GMT.

Frames sampled at 5s, 40s, 80s, and 120s:

- 5s: marketing story ("Follow one CV from the pile to the interview"), chapter bar Pile → Meet, sample CVs (Kenji Tanaka, Grace Turner, Oliver Hayes, Rayan).
- 40s: signed-in dashboard for Sprite Labs, plan badge Pro, user "Jameel Ahmad" / Admin, opening an iOS Engineer job ("Job opened. The apply page is live.").
- 80s: four CVs scored, Grace Turner 93 highlighted, Amelia Nguyen 21 with a pink gap, interview questions generated from the gaps. Overlay: "Questions that probe the gaps in each CV."
- 120s: the `dedc709` diff in `useDeleteJob`, overlay "Commit dedc709 drops the job from the cached list at once, with a regression test."

It shows the product and the TestSprite fix story, not a screen recording of the TestSprite dashboard itself.

## Weaknesses / risks for judges

- The suite has not passed since 22:41Z on 2026-10-22. The dashboard redesign (PR #23, +20k lines) and the auth-page redesign (PR #20) never had a green TestSprite run. Current `main` is a credit-failure check.
- "Blocks a failing merge" is not visible in the protection API, and the owner merged later PRs with `TestSprite V3` already red. A main rerun also posted **success** for `43/44 passed · 1 failed`, so a failed test on the push trigger did not fail the commit.
- After the invite fix, the production rerun was 43/44 blocked, not 44/44. The claim's "44/44" is the PR head only.
- The 14/15 status does not name the failed test. The PR body attributes that failure to parallel tests sharing a job title. The stale-list bug is a real code fix with a Vitest regression, and it is what the demo sells.
- E2E tests live only in the portal. A judge who cannot open that project cannot re-run or read the assertions. Bot comments are rewritten, so the red report is not on the PR.
- No CLI, no MCP, no schedule, no issues, no GitHub Actions. Nothing reruns if the GitHub App is out of credits.
- Tests mutate the one production company (create and delete jobs, upload CVs). A leaked test password or a stuck run dirties the live tenant. Bot protection on Clerk production was turned off for the suite.
- Public apply submit is not in the browser suite (Turnstile). That path is unit-tested only.
- SPA 404s and the immutable HTML response for a missing `/assets/` URL are real polish bugs.
- Two web unit tests failed in a clean local Vitest run. CI's green Workers Build is the counter-evidence, and the build log was not readable from GitHub.

## Where it beats Ninety

Ninety is a stateless Schengen calculator (Next.js on Vercel, engine tests in git, TestSprite GitHub App plus a CLI workflow). LucidHire is ahead in these specific ways:

1. **A push-to-`main` portal rerun that actually executed.** Merge commits through PR #17 have their own `TestSprite V3` executions, for example 44/44 on the #17 merge: [fc471d14](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/fc471d14-3a9f-4d42-b18d-ec52c7ede2b6). Ninety's nightly schedules are disabled and `testsprite-smoke.yml` is broken. To match this, Ninety needs a portal (or CLI) trigger that runs after the production deploy on `main` and posts a status, and it has to stay enabled.
2. **Several portal red → green loops left on the branch and fixed before merge.** 9/10 → 10/10 ([41fabb72](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/41fabb72-7df6-4b63-b815-03333cb39593) → [6bcc0a04](https://www.testsprite.com/dashboard-v3/o/099c9493-9977-5d5d-bc58-74726f8dffba/projects/82987c71-2d08-4b4a-8bb9-2929eb1511c6/execution/6bcc0a04-86a3-4ff7-beb6-873d8edbd296)), 14/15 → 15/15, 28/29 → 29/29, 39/40 → 42/42. Ninety merged PR #63 while TestSprite V3 was red. The honest limit: LucidHire did the same thing on #18–#24 once credits ran out. To exceed this, Ninety needs the red SHA preserved, a fix commit, a later green run, and no merge while the check is red.
3. **A demo that shows both the product and a named fix.** 2 min 26 sec, [mp4](https://pub-0686376a5a4f49fcb467526886de4a33.r2.dev/lucidhire-demo-v3-2x.mp4), including the `dedc709` diff. Ninety has no demo video. Matching it is a short recording of the live app plus one red/green proof.
4. **The suite waits for the deploy check, then drives a signed-in production UI.** Trigger is `Workers Builds: lucidhire-app` completing, target `https://lucidhire.io` ([deploy.sh](https://github.com/jnzlab/lucid-hire/blob/main/scripts/deploy.sh), [rules §5](https://github.com/jnzlab/lucid-hire/blob/main/docs/hackathon-s4.md)). Tests sign in, post and delete jobs, upload a CV, and revoke an invite. Ninety's strength is the opposite (tests in git, CLI, engine parity). To match the trigger shape, Ninety would point the GitHub App at a check that flips only after the Vercel deploy is reachable, and add a few authenticated flows if the product had accounts.

TestSprite techniques Ninety does not have:

- Portal trigger bound to a **deploy-finished** check (Workers Builds), with a fixed production URL and no preview placeholder.
- A **push trigger on the default branch** that reruns the same suite after merge (it ran, through PR #17).
- Portal **project instructions** that gate runs read. The 9/10 block was cleared by a commit whose message is "re-run the TestSprite gate with the updated project instructions" (`cf164ce0`).
- Bot comments that list **every test by name with a screenshot** on the PR ([PR #4 comment](https://github.com/jnzlab/lucid-hire/pull/4) updated to the 15/15 table).

Ninety still leads on tests committed in git, a CLI gate, differential fuzz, and an external oracle. LucidHire has none of those. Neither project has a TestSprite MCP config.

## Estimated judging scores

| Criterion | Score | Why |
| --- | --- | --- |
| Problem value | 8 | A full screening loop (post, apply, score with quotes, shortlist, questions, team, plans). Crowded category, but it is a product, not a wrapper demo. |
| TestSprite depth | 7 | Real App gate, deploy-complete trigger, main reruns, four red→green loops, 44 named live E2E tests. No CLI, no MCP, no schedule, tests not in git, and the gate died with 14.5 credits left. |
| Verifiability | 7 | Pass/fail counts are on public commit statuses with execution URLs. Portal bodies are login-walled, branch protection is 403, the 14/15 test name is not on the status, and the post-redesign site has no green run. |
| Polish | 8 | Strict TypeScript, a locked design system, security headers, per-job OG, accessible dialogs in tests. SPA asset fallback and the single production tenant keep it off a 9. |
| Demo | 8 | 2:26, plays, shows the product and the `dedc709` proof. Does not show the TestSprite dashboard or a red run. |
| **Overall** | **7** | Strongest as a "suite on every PR" story until 22:41Z. The last seven merges, including the dashboard rewrite, have no passing TestSprite run, and a main status went green while describing 43/44 with one failure. |
