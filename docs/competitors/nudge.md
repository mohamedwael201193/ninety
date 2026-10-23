# Nudge — competitor review

- **Name:** Nudge
- **Repo:** https://github.com/hackid02/nudge-spike (public, created 2026-10-20, default branch `main`, HEAD `bf69085` “Merge PR #10…”, pushed 2026-10-22)
- **Live:** https://nudge-spike.vercel.app/
- **TestSprite PRs:** https://github.com/hackid02/nudge-spike/pull/10 , https://github.com/hackid02/nudge-spike/pull/8
- **Demo:** https://x.com/web3_ysl/status/2113331204598436138 (HTTP 307 to that status on 2026-10-23; post body not read). The video file is in the repo: [docs/nudge-demo.mp4](https://github.com/hackid02/nudge-spike/blob/main/docs/nudge-demo.mp4)
- **Article:** https://dev.to/hackid02/i-planted-a-security-bug-to-test-my-own-ci-my-merge-gate-let-it-through-5843 (posted Oct 21, byline Seyifunmi Adedayo)
- **Release:** [v1.0](https://github.com/hackid02/nudge-spike/releases/tag/v1.0) (2026-10-21)
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7
- **Method:** shallow clone at `/tmp/competitors/nudge/repo`, `gh` GET only, curl of the live site, local `node` run of `lib/money.test.mjs`, and the repo’s `scripts/check-isolation.mjs` against the live URL. No comments, stars, forks, or issues were opened.

## What it is

Nudge is a seeded demo of freelancer invoicing where each client has a private portal and the freelancer sees a live read receipt when a client opens an invoice. The user is a freelancer (Maya) with two clients of the same studio (Northwind and Lumen). The value the project actually argues for is cross-client isolation inside one tenant: guessing `/portal/invoices/INV-1002` must not reveal another client’s invoice, and the page must look the same as a missing id. Creating invoices, inviting clients, email, and payments are explicitly out of scope ([README](https://github.com/hackid02/nudge-spike/blob/main/README.md)). The product a judge can use today is three one-click demo logins over a nightly-reseeded database.

## Architecture

Stack from [package.json](https://github.com/hackid02/nudge-spike/blob/main/package.json): Next.js `16.4.2`, React `19.3.0`, TypeScript 5 (`strict: true` in [tsconfig.json](https://github.com/hackid02/nudge-spike/blob/main/tsconfig.json)), Tailwind 4, `postgres` (node-postgres driver) `^3.4.9`. No auth library. Deploy target is Vercel (`server: Vercel` on live responses). `vercel-build` is `node scripts/preview-reset.mjs && next build`.

| Module | Role |
|---|---|
| [lib/queries.ts](https://github.com/hackid02/nudge-spike/blob/main/lib/queries.ts) | Every read and write. Owner id is in the SQL `WHERE`. `getClientInvoice` requires `client_id` and `status <> 'draft'`, then stamps `viewed_at` only when `status = 'sent'`. |
| [lib/money.ts](https://github.com/hackid02/nudge-spike/blob/main/lib/money.ts) | Integer cents, quantity in thousandths, tax in basis points, half-up rounding. |
| [lib/messages.ts](https://github.com/hackid02/nudge-spike/blob/main/lib/messages.ts) | Exact strings tests assert, including `Invoice not found.` and `Invalid email or password.` |
| [lib/session.ts](https://github.com/hackid02/nudge-spike/blob/main/lib/session.ts) | HMAC-SHA256 cookie `nudge_session`. Role in the cookie is a redirect hint; queries re-scope by the user id. |
| [lib/auth.ts](https://github.com/hackid02/nudge-spike/blob/main/lib/auth.ts) | `scrypt` password hashes, `timingSafeEqual`. |
| [app/login/DemoButtons.tsx](https://github.com/hackid02/nudge-spike/blob/main/app/login/DemoButtons.tsx) | Three buttons: Freelancer (Maya), Client A (Northwind), Client B (Lumen). |
| [app/not-found.tsx](https://github.com/hackid02/nudge-spike/blob/main/app/not-found.tsx) | One not-found page for another client, another freelancer, own draft, and unknown ids. |
| [scripts/preview-reset.mjs](https://github.com/hackid02/nudge-spike/blob/main/scripts/preview-reset.mjs) | On `VERCEL_ENV === 'preview'` only: apply schema and seed. Exits 0 on production and local builds. |
| [scripts/seed.mjs](https://github.com/hackid02/nudge-spike/blob/main/scripts/seed.mjs) | Truncate and insert. `INV-10xx` fixtures, `INV-11xx` disposables. Dates are `now()` offsets. |
| [scripts/check-isolation.mjs](https://github.com/hackid02/nudge-spike/blob/main/scripts/check-isolation.mjs) | 13 HTTP checks. Not wired into GitHub Actions. |
| [db/schema.sql](https://github.com/hackid02/nudge-spike/blob/main/db/schema.sql) | `users`, `invoices`, `invoice_items`. Trigger requires a client’s `freelancer_id` to be a freelancer. |
| [.github/workflows/unit-tests.yml](https://github.com/hackid02/nudge-spike/blob/main/.github/workflows/unit-tests.yml) | `npm test` on pull_request and push to `main`. |
| [.github/workflows/reseed-demo.yml](https://github.com/hackid02/nudge-spike/blob/main/.github/workflows/reseed-demo.yml) | Cron `0 2 * * *` and `workflow_dispatch`. Seeds with `DEMO_DATABASE_URL`. |

There is no `.testsprite` directory, no TestSprite CLI workflow, and no MCP config. `git log -S testsprite` over the clone’s 30 commits finds no committed TestSprite plan files. The suite lives in the TestSprite project `57d0f061-775e-42b8-aab1-1c33b131fb91` (org `38be704c-7290-5a79-a5db-3bc8900732f5`), visible only as GitHub statuses and bot comments.

## TestSprite integration depth

**Depth score: 7 / 10.** The GitHub App check is real, the ruleset that requires it is readable from the API, and a planted authz bug produced a red `TestSprite V3` status that was not the commit they merged. That is the integration judges can audit. It stays at 7 because the tests are not in git, there is no CLI, no MCP, no nightly TestSprite run, no failure-triage bot, and the merge-gate toggle was off until the middle of PR #10 (a failing test still posted `success`).

### GitHub App check `TestSprite V3`

Posted as a commit **status** (not a GitHub Actions check run). Ten statuses are on the repo. Dashboard pages return an HTML shell (HTTP 200) and do not include the per-test body without the app client, so counts below are the GitHub `description` strings.

| PR | Commit | Posted | GitHub state | Description | Execution |
|---|---|---|---|---|---|
| [#3](https://github.com/hackid02/nudge-spike/pull/3) | [`a8ce851`](https://github.com/hackid02/nudge-spike/commit/a8ce851) | 2026-10-20 18:11Z, **after** merge at 16:38Z | success | 10/11 passed · 1 blocked | [b2c6e033](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/b2c6e033-7f79-456a-bd3f-0da44872fb3c) |
| [#4](https://github.com/hackid02/nudge-spike/pull/4) | [`7bbfa19`](https://github.com/hackid02/nudge-spike/commit/7bbfa19) | 2026-10-20 18:25Z | success | All 11 tests passed | [f06dc6cd](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/f06dc6cd-35d5-4cf7-9249-66423e0ff206) |
| [#6](https://github.com/hackid02/nudge-spike/pull/6) | [`bb06753`](https://github.com/hackid02/nudge-spike/commit/bb06753) | 2026-10-21 10:49Z | success | All 12 tests passed | [43a12c31](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/43a12c31-5d60-4500-8ac3-966d70d4fb6c) |
| [#7](https://github.com/hackid02/nudge-spike/pull/7) | [`7518331`](https://github.com/hackid02/nudge-spike/commit/7518331) | 2026-10-21 11:21Z | success | All 12 tests passed | [07ec7e7d](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/07ec7e7d-9935-45fb-8c1c-48c1b9ddf4dd) |
| [#8](https://github.com/hackid02/nudge-spike/pull/8) | [`da0fb3b`](https://github.com/hackid02/nudge-spike/commit/da0fb3b) | 2026-10-21 11:58:04Z | success | All 15 tests passed | [17301e4c](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/17301e4c-3bc2-4849-b606-c3ff05cf3edd) |
| [#9](https://github.com/hackid02/nudge-spike/pull/9) | [`13733bd`](https://github.com/hackid02/nudge-spike/commit/13733bd) | 2026-10-21 12:03Z | success | All 15 tests passed | [0a6a0e36](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/0a6a0e36-620f-437b-b3bd-94506e7402a9) |
| [#10](https://github.com/hackid02/nudge-spike/pull/10) | [`1fbe8d7`](https://github.com/hackid02/nudge-spike/commit/1fbe8d7) | 2026-10-21 13:22Z | **success** | **14/15 passed · 1 failed** | [ae9fc160](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/ae9fc160-66e6-4238-85c1-ba16e5ac746d) |
| [#10](https://github.com/hackid02/nudge-spike/pull/10) | [`fca884d`](https://github.com/hackid02/nudge-spike/commit/fca884d) | 2026-10-21 13:32Z | **failure** | 14/15 passed · 1 failed | [f3c33f3c](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/f3c33f3c-5c2d-4845-9ca3-0621ef615436) |
| [#11](https://github.com/hackid02/nudge-spike/pull/11) | [`63b2818`](https://github.com/hackid02/nudge-spike/commit/63b2818) | 2026-10-21 13:45Z | success | All 15 tests passed | [71b29a6a](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/71b29a6a-f69b-4d05-bc4a-6f54732a20e1) |
| [#10](https://github.com/hackid02/nudge-spike/pull/10) | [`1803938`](https://github.com/hackid02/nudge-spike/commit/1803938) | 2026-10-22 07:28:58Z | success | All 15 tests passed | [0fd0d84b](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/0fd0d84b-0482-4d87-8767-f3fecc08e577) |

PRs with **no** `TestSprite V3` status on any commit: [#1](https://github.com/hackid02/nudge-spike/pull/1), [#2](https://github.com/hackid02/nudge-spike/pull/2), [#5](https://github.com/hackid02/nudge-spike/pull/5). PR #4’s first commit [`10f44d1`](https://github.com/hackid02/nudge-spike/commit/10f44d1) had Vercel only; the empty “Trigger TestSprite run” commit is what got the 11/11 status. PR #10’s first commit [`1601d75`](https://github.com/hackid02/nudge-spike/commit/1601d75) had Vercel **failure** and no TestSprite status.

The bot `testsprite[bot]` comments on the PR (marker `testsprite-v3-marker`) and edits that comment when the run finishes. The 15 names on the green PR #8 and PR #10 comments match the README list (wording differs slightly: “Client cannot open freelancer invoice pages”, “Signed-out visitor is sent to sign-in”). PR #3’s comment names the blocked case: “Maya can delete a draft invoice after confirming”, summary “10 passed · 1 blocked · 11”.

### Required check

`GET /repos/hackid02/nudge-spike/branches/main/protection` returned **403** (“Resource not accessible by integration”).

`GET /repos/hackid02/nudge-spike/rulesets/25539464` returned the ruleset (created 2026-10-21T10:23:00Z, enforcement `active`, target default branch):

- Name: **Require TestSprite**. HTML: https://github.com/hackid02/nudge-spike/rules/25539464
- Rule `required_status_checks` with context **`TestSprite V3`**, `integration_id` **2756476**
- `strict_required_status_checks_policy`: false (branch need not be up to date)
- Rule `non_fast_forward`
- `bypass_actors`: null
- `current_user_can_bypass`: `never` (this token, not a statement about the repo owner’s UI)

The ruleset exists from PR #6 onward (PR #6 merged 10:53Z, after 10:23Z). PRs #1–#5 merged before it.

The committed screenshot [docs/pr10-merge-blocked.png](https://github.com/hackid02/nudge-spike/blob/main/docs/pr10-merge-blocked.png) shows `TestSprite V3` failing, “14/15 passed · 1 failed”, with a **Required** badge, beside a successful Vercel deployment. The same image still shows a “Merge pull request” control and the sentence “You can also merge this with the command line.” That sentence is the copy GitHub uses when the button is offered. The picture proves the check was required and red. It does not, by itself, show a greyed-out button. What the timeline shows is that they did not merge that red head: they closed the PR at 13:35Z ([issue comment](https://github.com/hackid02/nudge-spike/pull/10#issuecomment-6317423737)), reopened it the next day, pushed the fix, and merged only after `1803938` was green (merged 2026-10-22T07:29:27Z, about 30 seconds after the success status).

### CLI, MCP, plans in git, triage, schedules

| Piece | Result |
|---|---|
| CLI | No `testsprite` workflow, no `npx @testsprite/testsprite-cli` in the repo. |
| MCP | No MCP config. |
| Plans / test code in git | **0 files.** Names exist in README and in bot comments. Video frame shows ids `ISO-001`, `ISO-002`, `ISO-004`, `ISO-007`, `ISO-009`, `ISO-010`, `ISO-013`, `ISO-015` inside the TestSprite UI. Those ids are not in the repo. |
| Triage | Bot PR comments only. No issues, no auto-fix bot, no ledger that classifies UI vs engine. The human (with Claude Code co-author trailers) edited the app and the suite. |
| TestSprite schedule | None. Nightly job is the demo reseed, not TestSprite. |
| Credits | No credit ledger in the repo. Unit tests are described as credit-free. Ten GitHub-visible TestSprite executions are listed above. Any extra portal runs are UNVERIFIED. |

### Red → green loops

1. **Delete confirmation, blocked → passed (before the ruleset).** PR #3 execution [b2c6e033](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/b2c6e033-7f79-456a-bd3f-0da44872fb3c): GitHub status **success** with description `10/11 passed · 1 blocked`. The comment says the blocked test is delete-after-confirm, because the harness closed `window.confirm()`. PR #4 replaced it with [components/ConfirmDelete.tsx](https://github.com/hackid02/nudge-spike/blob/main/components/ConfirmDelete.tsx) and the follow-up commit posted **11/11** ([f06dc6cd](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/f06dc6cd-35d5-4cf7-9249-66423e0ff206)). The blocked result did not fail the GitHub status.
2. **Planted tenant leak, success-with-failure → failure → 15/15.** Commit [`1601d75`](https://github.com/hackid02/nudge-spike/commit/1601d7556acf0028509c7a64ce6d39d5dcfbce1d) deletes one line, `and i.client_id = ${clientId}`, from `getClientInvoice`. First preview deploy failed (Vercel status failure, no TestSprite). After [`1fbe8d7`](https://github.com/hackid02/nudge-spike/commit/1fbe8d781574e0dd1d9031ac9c5ba94061022d18) (“Neon branch limit cleared”), TestSprite posted **state success, description `14/15 passed · 1 failed`** ([ae9fc160](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/ae9fc160-66e6-4238-85c1-ba16e5ac746d)). Empty commit [`fca884d`](https://github.com/hackid02/nudge-spike/commit/fca884d31b57abfac060abbda4af0accef6d4ae0) (“Re-run with TestSprite merge gate enabled”) posted **state failure, same 14/15** ([f3c33f3c](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/f3c33f3c-5c2d-4845-9ca3-0621ef615436)). Fix [`1803938`](https://github.com/hackid02/nudge-spike/commit/18039387ec62391676c81f1e005ffbce9db80c2e) restores the predicate and posts **All 15 tests passed** ([0fd0d84b](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/0fd0d84b-0482-4d87-8767-f3fecc08e577)). The PR diff against main is **0 lines** because the bug and the fix cancel. The failing test’s name is in the author’s PR comment and in the fix commit message (“Client A cannot access Client B invoice by URL”, INV-1002). The `$640.00` figure is in the [article](https://dev.to/hackid02/i-planted-a-security-bug-to-test-my-own-ci-my-merge-gate-let-it-through-5843) and the [README](https://github.com/hackid02/nudge-spike/blob/main/README.md), and it matches the seed (`unit_cents: 64000`, tax 0). It is not in the GitHub status string, and the execution page HTML did not include the report body.

Suite growth on the green path: 11 (PR #4) → 12 (PR #6, wrong-password) → 15 (PR #8, three boundary tests) → still 15 on #9, #11, and the fixed #10.

## Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
|---|---|---|---|---|
| TestSprite E2E (current suite) | 15 | 15 names in the PR #8 and PR #10 bot comments; GitHub description “All 15 tests passed” on #8, #9, #11, and fixed #10 | [PR #8 comment](https://github.com/hackid02/nudge-spike/pull/8), execution [17301e4c](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/17301e4c-3bc2-4849-b606-c3ff05cf3edd) | **VERIFIED** as a cloud run count. **0** test files in git. |
| TestSprite on every historical PR | 15 on every PR | 0 on #1, #2, #5; 10 pass + 1 blocked on #3; 11 on #4; 12 on #6 and #7; 15 from #8 | status table above | **FALSE** as “every PR / always 15” |
| Money unit checks | 21 | 21 `eq()` calls in [lib/money.test.mjs](https://github.com/hackid02/nudge-spike/blob/main/lib/money.test.mjs). Local run 2026-10-23: `21 passed, 0 failed` (Node v22.23.4, no install, no DB). CI: [run 39740842606](https://github.com/hackid02/nudge-spike/actions/runs/39740842606) logs `21 passed, 0 failed` | same | **VERIFIED** |
| HTTP isolation script | 13 | 13 `check()` calls. Live run 2026-10-23 against https://nudge-spike.vercel.app: `13 passed, 0 failed` | [scripts/check-isolation.mjs](https://github.com/hackid02/nudge-spike/blob/main/scripts/check-isolation.mjs) | **VERIFIED** (not in CI) |
| Lint / typecheck / axe / API fuzz / mutation | not claimed | no workflow runs `eslint` or `tsc`; no such tests in the repo | [unit-tests.yml](https://github.com/hackid02/nudge-spike/blob/main/.github/workflows/unit-tests.yml) | not claimed |

**Local runs.** `node --experimental-strip-types lib/money.test.mjs` passed 21/21 in under a second. `node scripts/check-isolation.mjs https://nudge-spike.vercel.app` passed 13/13. The full Next app was **not runnable locally: it needs `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, and `SESSION_SECRET`** ([.env.example](https://github.com/hackid02/nudge-spike/blob/main/.env.example)). No `node_modules` were installed.

## Claim verification

Claims are from the task statement, the README, the v1.0 release, and the DEV article.

| Claim | Verdict | Evidence |
|---|---|---|
| TestSprite caught a planted tenant leak; Client A could open INV-1002 at $640.00 | **VERIFIED** for the catch and the 14/15 failure. The dollar amount is the author’s quotation plus the seed, not a fetched TestSprite report body. | One-line deletion in [`1601d75`](https://github.com/hackid02/nudge-spike/commit/1601d7556acf0028509c7a64ce6d39d5dcfbce1d). Status on [`fca884d`](https://github.com/hackid02/nudge-spike/commit/fca884d31b57abfac060abbda4af0accef6d4ae0): failure, `14/15 passed · 1 failed`, execution [f3c33f3c](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/f3c33f3c-5c2d-4845-9ca3-0621ef615436). Seed row INV-1002 is 64000 cents and tax 0 ([seed.mjs](https://github.com/hackid02/nudge-spike/blob/main/scripts/seed.mjs)). Article quotes “INV-1002, billed to Lumen Labs… $640.00”. |
| Required check went red and blocked the merge | **VERIFIED** that the status went red and that commit was not merged. **The screenshot does not show a disabled button.** | Ruleset [25539464](https://github.com/hackid02/nudge-spike/rules/25539464). Red status above. PR closed 13:35Z, merged only after the later green status. Screenshot: [pr10-merge-blocked.png](https://github.com/hackid02/nudge-spike/blob/main/docs/pr10-merge-blocked.png). |
| Then green after the fix | **VERIFIED** | [`1803938`](https://github.com/hackid02/nudge-spike/commit/18039387ec62391676c81f1e005ffbce9db80c2e) “All 15 tests passed”, execution [0fd0d84b](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/0fd0d84b-0482-4d87-8767-f3fecc08e577). Merged 2026-10-22T07:29:27Z. PR files changed: 0. |
| First run of the same bug reported **success** while 1 test failed, because the Merge gate toggle was off | **VERIFIED** as a GitHub status fact. The toggle itself is a TestSprite UI setting, not in the repo. | [`1fbe8d7`](https://github.com/hackid02/nudge-spike/commit/1fbe8d781574e0dd1d9031ac9c5ba94061022d18): `state=success`, description `14/15 passed · 1 failed`, execution [ae9fc160](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/ae9fc160-66e6-4238-85c1-ba16e5ac746d). |
| PR #10 closed unmerged; main and production never touched | **FALSE** as of this review. True on Oct 21 when the article and README were written. | Timeline: closed 2026-10-21T13:35Z, reopened 2026-10-22T07:25Z, merged 07:29Z. README line still says “closed unmerged” ([README](https://github.com/hackid02/nudge-spike/blob/main/README.md)). The merged tree restores the predicate (PR diff 0), so production code did not keep the leak. The history on `main` does contain the bug commit and the fix. |
| PR #8 15/15 green, merged after the required check passed | **VERIFIED** | Status 11:58:04Z success “All 15 tests passed”; merged 11:58:28Z. Ruleset already active. [PR #8](https://github.com/hackid02/nudge-spike/pull/8), execution [17301e4c](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/17301e4c-3bc2-4849-b606-c3ff05cf3edd). |
| One-click demo accounts | **VERIFIED** | Live `/login` HTML contains “Sign in as Freelancer”, “Sign in as Client A”, “Sign in as Client B”, “Maya Okafor”, “Northwind”, “Lumen”. `POST /api/login` as Client A returned `{"ok":true,"role":"client","redirectTo":"/portal"}`. |
| Every PR gets its own Vercel preview | **Mostly true, with failed deploys.** | Vercel bot comments show per-branch previews, e.g. `nudge-spike-git-tests-15-hackid3.vercel.app` on PR #8 and `nudge-spike-git-planted-regression-hackid3.vercel.app` on PR #10. Commits [`f002143`](https://github.com/hackid02/nudge-spike/commit/f002143), [`9390b4c`](https://github.com/hackid02/nudge-spike/commit/9390b4c), and [`1601d75`](https://github.com/hackid02/nudge-spike/commit/1601d75) have Vercel **failure**. |
| Freshly seeded Neon branch per PR | **Mechanism in repo; live Neon not queried.** Demo shows three `preview/…` branches created by Vercel. First PR #10 deploy failed until a commit titled “Neon branch limit cleared”. | [preview-reset.mjs](https://github.com/hackid02/nudge-spike/blob/main/scripts/preview-reset.mjs). Video frame of the Neon console (below). |
| TestSprite runs 15 E2E tests (isolation, routing, exports, money, lifecycle) on every PR | **FALSE** for “every PR”. **VERIFIED** for the current 15-test cloud suite from PR #8 on. | Status table. PR #8 comment lists all 15 names across those areas. |
| Ruleset on main blocks merge on TestSprite failure | **VERIFIED now** (ruleset active, context `TestSprite V3`, `bypass_actors` null). **Was not true** for the first PR #10 run, when a failed test still posted `success`, and not true before the ruleset (PRs #1–#5). | Ruleset API; status on `1fbe8d7` vs `fca884d`. |
| Client A opening `/portal/invoices/INV-1002` sees “Invoice not found.” | **VERIFIED** on 2026-10-23 | Signed in as `ada@northwind.test`. HTTP **404**. RSC payload contains `Invoice not found.` and “This page doesn't exist, or it doesn't belong to your account.” No `640`, no `Lumen`. The two `INV-1002` strings are the router path (`k":"INV-1002"` and `["","portal","invoices","INV-1002"]`), which is the requested URL. Signed-out requests to that path are **307** to `/login`. |
| PRs #1–#3 and #5 have no TestSprite check | **FALSE** for #3. **VERIFIED** for #1, #2, #5. | #3 has a success status `10/11 passed · 1 blocked`, posted after merge. |
| PR #6 was 12/12; PR #4 was 11/11 | **VERIFIED** | Statuses above. |
| 21 money checks in GitHub Actions, credit-free | **VERIFIED** that `npm test` is 21 checks and does not call TestSprite. The workflow landed in PR #11, so earlier PRs did not run it. | [unit-tests.yml](https://github.com/hackid02/nudge-spike/blob/main/.github/workflows/unit-tests.yml), [run 39740842606](https://github.com/hackid02/nudge-spike/actions/runs/39740842606). |
| Nightly reseed of the live demo | **VERIFIED** | [run 39914297186](https://github.com/hackid02/nudge-spike/actions/runs/39914297186) (2026-10-23 06:53Z, schedule, success) logs `node scripts/seed.mjs`, `truncating...`, `inserting 5 users...`, `inserting 13 invoices...`, `row counts: users=5 invoices=13 items=15`, `sent fixtures (must be 0): 0`, `seed looks correct`. Secret value was masked. |
| 2-minute demo with voice-over and captions | **VERIFIED** for the file. | `ffprobe`: 128.83 s, 1920×1080, h264 + aac, 21 MB. Frames have burned-in captions. Audio was not transcribed. |
| Ownership in SQL, identical not-found page, money in cents | **VERIFIED** in current `main` | [queries.ts](https://github.com/hackid02/nudge-spike/blob/main/lib/queries.ts), [not-found.tsx](https://github.com/hackid02/nudge-spike/blob/main/app/not-found.tsx), [money.ts](https://github.com/hackid02/nudge-spike/blob/main/lib/money.ts). |
| Not built: create/edit invoices, invites, email, online payments | **VERIFIED** by absence. No create-invoice route in the tree. | README scope section. |

## Code quality

The tree is small and readable: about 3.8k lines of ts/tsx/mjs/sql/css in the clone (local count). `strict` is on. Queries take the owner id as a parameter and put it in `WHERE`. Mutations in [app/invoices/[id]/actions.ts](https://github.com/hackid02/nudge-spike/blob/main/app/invoices/%5Bid%5D/actions.ts) ignore a URL id unless it matches the session’s freelancer. CSV quoting is explicit. The preview seed refuses to run unless `VERCEL_ENV === 'preview'`. Seed dates are relative, and the reseed log confirms `sent fixtures (must be 0): 0`, which keeps “open a sent invoice” from racing the fixtures.

Smells:

- CI runs `npm test` only. It does not run `eslint` or `tsc`, even though [eslint.config.mjs](https://github.com/hackid02/nudge-spike/blob/main/eslint.config.mjs) exists.
- `check-isolation.mjs` is the fast authz loop and is not in CI. The README says it can be chained in later.
- TestSprite cases are not reproducible from a clone. A red cloud run cannot be replayed offline.
- [seed.mjs](https://github.com/hackid02/nudge-spike/blob/main/scripts/seed.mjs) cites `SPEC.md §5`. That file is not in the tree.
- `queries.ts` opens with “the whole 40-point suite”, which is hackathon scoring language inside the data layer.
- `share_token` is in the schema and unused.
- The demo password is compiled into the client buttons. Fine for a public demo, and it means the live database is world-writable by anyone who clicks “Record payment” or “Delete” as Maya. The nightly reseed is what puts it back. During the day, a visitor can destroy disposable rows and stamp read receipts.
- `getClientInvoice` writes on GET. The `status = 'sent'` predicate limits the write. It is still a side effect on a shared demo.
- The reseed job’s `npm install postgres@3` log line reported “5 high severity vulnerabilities”. Not investigated; the app’s own `npm audit` was not run.
- Several commits are co-authored by “Claude Opus 5.5” with a Claude session URL. The gate story is still visible in git, but a lot of the prose is generated.

## Live-site behavior

Checked 2026-10-23 with curl, no redirect following unless noted. Server header `Vercel`.

| Route | Signed out | Notes |
|---|---|---|
| `/` | **307** → `/login` | The dashboard is `requireRole('freelancer')`. The public page is the login hero. |
| `/login` | **200** in ~0.1–1.0s | Title `Nudge — invoicing for freelancers`. Three demo buttons present. `cache-control: private, no-cache, no-store`. |
| `/portal`, `/portal/export`, `/portal/invoices/INV-1002`, `/invoices/INV-1001`, `/account` | **307** → `/login` | No invoice HTML while signed out. |
| `/api/activity` | **401** | |
| `/api/logout` | **303** → `/login` | |
| `/api/login` wrong password | **401** `{"error":"Invalid email or password."}` | Matches `messages.auth.invalidCredentials`. |
| `/does-not-exist` | **404** | Same not-found copy: “Invoice not found.” |
| `/favicon.ico` | **200** | |

Signed in as Client A (Northwind): `GET /portal/invoices/INV-1002` is **404**, heading text `Invoice not found.`, no `$640` and no Lumen. The isolation script’s other 12 checks also passed (portal list shows INV-1001 and INV-1004, hides INV-1005 and draft INV-1003, export hides INV-1002 / INV-1003 / INV-2001, client is redirected off `/invoices/INV-1001`, the other freelancer does not see Maya’s `$1,417.61`).

Not exercised, on purpose: send, record payment, void, delete, and opening a `sent` invoice (that GET writes `viewed_at`).

## Demo

The file [docs/nudge-demo.mp4](https://github.com/hackid02/nudge-spike/blob/main/docs/nudge-demo.mp4) exists. `ffprobe`: **128.83 seconds**, 1920×1080, 30 fps, AAC audio, ~21 MB. README calls it 2 minutes with voice-over and captions. Frames every 15 seconds show:

- Title card “Did they open it?” over invoice INV-1105, status Sent, $310.00.
- Maya’s dashboard on `nudge-spike.vercel.app`: outstanding $5,207.60, overdue $92.50, paid this month $700.00, INV-1002 Lumen Labs Paid $640.00, a live activity feed.
- Split screen: Northwind opens `/portal/invoices/INV-1105` and Maya’s feed says “Northwind Co opened INV-1105 / just now”. Caption: “Viewed. The activity feed says: just now.”
- Signed in as Northwind on `/portal/invoices/INV-1002`, red box around “Invoice not found.”, callouts “No INV-1002 on the page”, “No $640.00 on the page”, “Same page as a typo'd ID”.
- INV-1001 detail: lines $950.00, $149.96, $250.14, subtotal $1,350.10, tax 5% $67.51, total **$1,417.61**.
- Diagram “Pull request → Vercel preview → Neon branch”, plus a Neon console listing `preview/landing-account-tax`, `preview/redesign`, `preview/test/preview-branch`, created by Vercel.
- TestSprite report dated Oct 20: “Frontend: 10 Passed / 0 Failed / 1 Blocked”, delete blocked because the browser closed the confirm dialog and INV-1106 was already absent.
- TestSprite test-case list with a green **15/15** and a Passed count of 15.
- End card: “Know who opened your invoice — and prove nobody else can.”

The X URL responds. The tweet text was not retrieved (X connector needs auth; `api.x.com` was not called). The repo video is the demo a judge can watch without the post.

## Weaknesses / risks for judges

- The README and the Oct 21 article still say PR #10 was closed unmerged. It was merged on Oct 22. A judge who trusts the README over the PR timeline will get the story backwards. The code on `main` is the fixed code; the narrative is stale.
- Until the merge-gate toggle was flipped, a failed test posted a **green** required check (`1fbe8d7`, and the same pattern for the blocked test on PR #3). The ruleset could not have stopped a bad merge before that toggle. They found it and wrote it down. It is still a hole in the early history, and PRs #6–#9 “passed the required check” only because the tests happened to pass, or because a failure would not have failed the status.
- The 15 tests are not in the repository. Depth is “the cloud ran and GitHub recorded a count”, not a suite another engineer can read or rerun.
- No TestSprite CLI, no MCP, no scheduled TestSprite run, no bot that files a failure.
- The product cannot create an invoice. A judge who wants to know whether isolation survives a new client or a new line item cannot try that. The interesting paths are pre-seeded.
- The live database is shared and the demo login is on the sign-in page. Mutating buttons are one click away. Nightly reseed repairs it at 02:00 UTC, not during a review session.
- Branch protection classic API is 403 here. The ruleset endpoint worked and is the evidence. `strict_required_status_checks_policy` is false, so a green check on an out-of-date branch is enough.
- Screenshot used as proof of a blocked button still shows the command-line merge sentence.

## Where it beats Ninety

Ninety baseline used here: https://github.com/mohamedwael201193/ninety , live https://ninety-coral.vercel.app . Ninety’s TestSprite V3 check and its larger in-repo suites are real. These are the places Nudge is ahead.

1. **A ruleset a reviewer can read, and a red TestSprite status that was not merged.** Nudge ruleset [25539464](https://github.com/hackid02/nudge-spike/rules/25539464) requires `TestSprite V3`, `bypass_actors` is null, and the red head [`fca884d`](https://github.com/hackid02/nudge-spike/commit/fca884d31b57abfac060abbda4af0accef6d4ae0) (failure, 14/15, execution [f3c33f3c](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/f3c33f3c-5c2d-4845-9ca3-0621ef615436)) was closed rather than merged. The merge commit is the later 15/15. Ninety’s branch-protection and ruleset reads were 403 and an empty ruleset list, and PR #63 merged while `TestSprite V3` was still failure. To match this, Ninety needs a default-branch ruleset whose required context is `TestSprite V3` with an empty bypass list, and a PR that stays unmerged until that context is green.
2. **Per-PR database, with a production guard.** [preview-reset.mjs](https://github.com/hackid02/nudge-spike/blob/main/scripts/preview-reset.mjs) reseeds only when `VERCEL_ENV === 'preview'`. The demo frame shows Neon branches `preview/landing-account-tax`, `preview/redesign`, and `preview/test/preview-branch` created by Vercel. Mutating TestSprite cases (send, pay, delete) then cannot clobber the live demo or another PR. Ninety’s cloud tests hit the shared preview or production URL. To match, Ninety needs a per-PR database (or an equivalent isolated fixture store) created with the preview and reset before the suite, and a guard that refuses to reset production.
3. **A planted one-line authz bug used as the gate’s acceptance test, including the “comment failed, status succeeded” hole.** The deletion, the success-with-`14/15 passed · 1 failed` status ([ae9fc160](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/ae9fc160-66e6-4238-85c1-ba16e5ac746d)), the failure after the toggle ([f3c33f3c](https://www.testsprite.com/dashboard-v3/o/38be704c-7290-5a79-a5db-3bc8900732f5/projects/57d0f061-775e-42b8-aab1-1c33b131fb91/execution/f3c33f3c-5c2d-4845-9ca3-0621ef615436)), and the restored predicate are all on the PR. Ninety records red runs and has a larger suite, and it also merged a red `TestSprite V3`. The technique Ninety does not have is a deliberate failing PR kept as evidence that the status GitHub enforces matches the failed test.
4. **A 129-second demo that shows the product, the attack, the Neon branches, and the TestSprite UI.** [docs/nudge-demo.mp4](https://github.com/hackid02/nudge-spike/blob/main/docs/nudge-demo.mp4). Ninety has no demo video. Matching it is a recorded walkthrough of a red check and the fix, not more tests.

Nudge does not beat Ninety on suite size, tests committed to git, backend API tests, CLI in Actions, MCP, parity against an external oracle, or local test volume. Both projects lack a TestSprite MCP config. Nudge’s nightly workflow reseeds the demo ([run 39914297186](https://github.com/hackid02/nudge-spike/actions/runs/39914297186)); it does not run TestSprite.

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 6 | Read receipts plus “the other client must not see this invoice” is a clear, demoable problem. The app cannot create an invoice, send email, or take payment, so it is a seeded portal, not a tool a freelancer would leave the hackathon using. |
| TestSprite depth | 7 | App check on real PRs, API-visible required ruleset, a planted bug that went red and then green, per-PR preview and a seed script. No plans in git, no CLI, no MCP, no TestSprite schedule, and the failure status was misconfigured until PR #10. |
| Verifiability | 8 | Statuses, ruleset, live 404, 21/21 unit tests, 13/13 live isolation checks, and the one-line diff are all re-readable. The README’s “closed unmerged” is stale, and the TestSprite report body for the $640 leak was not in the public HTML. |
| Polish | 7 | Typed, strict, consistent SQL ownership, exact copy, a considered not-found page, and a finished login hero. CI does not lint or typecheck. The shared demo can be mutated by any visitor. |
| Demo | 8 | 128.8s, 1080p, audio, captions, and it shows the attack and the TestSprite screen, not only the dashboard. |
| **Overall** | **7** | Best-in-class evidence that a required TestSprite check can go red on a real authz bug and that the merge waited for green. The suite is small, cloud-only, and the product is a fixture. |

## TestSprite techniques Ninety lacks

- Repository ruleset requiring `TestSprite V3` with `bypass_actors` null, plus a PR whose red status was not merged ([ruleset](https://github.com/hackid02/nudge-spike/rules/25539464), red commit [`fca884d`](https://github.com/hackid02/nudge-spike/commit/fca884d31b57abfac060abbda4af0accef6d4ae0)).
- Treating “GitHub state is success while the description says N failed” as a broken gate, and re-running until the state is failure ([`1fbe8d7`](https://github.com/hackid02/nudge-spike/commit/1fbe8d781574e0dd1d9031ac9c5ba94061022d18) vs [`fca884d`](https://github.com/hackid02/nudge-spike/commit/fca884d31b57abfac060abbda4af0accef6d4ae0)).
- Preview-only database reset guarded by `VERCEL_ENV` ([preview-reset.mjs](https://github.com/hackid02/nudge-spike/blob/main/scripts/preview-reset.mjs)), with Neon preview branches shown in the demo.
- A one-line planted authz regression kept on the PR as the proof, rather than only as a story in a markdown log.
