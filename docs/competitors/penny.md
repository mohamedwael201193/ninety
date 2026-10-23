# Penny — competitor review

Inspected 2026-10-23. Reviewer model: Grok 4.7. Clone: `https://github.com/ramakrishnanhulk20/penny` at `bba9cbe` (`main`). Author: ramakrishnanhulk20 (RAMAKRISHNAN R). Live: https://penny-self.vercel.app/ . Test record: https://penny-self.vercel.app/checks . TestSprite PR: https://github.com/ramakrishnanhulk20/penny/pull/10 . Demo video: none. X posts cited by the task were not read (the X connector in this session needs authentication, and no public-read tool was available).

Hackathon: TestSprite Season 4, deadline Mon 26 Oct 2026 11:59 PM PT. Repo created 2026-10-19, public, MIT, 0 stars, 25 pull requests (17 merged, 8 closed unmerged). Every count below is **VERIFIED** (reproduced locally, or read from a GitHub/live response on this date) or **UNVERIFIED** / **FALSE**.

## What it is

Penny splits a group's shared costs to the smallest unit of each currency and lists the fewest payments that bring every balance to zero. There is no account: a group is opened by a private link (`/g#<secret>`), and the secret is sent as the `x-penny-group` header rather than in the URL the server sees. The pitch is a trip with mixed currencies (euros and a dollar surf lesson) where a three-way split of 100.00 leaves a cent, and seven receipts collapse to three payments. Source: [README](https://github.com/ramakrishnanhulk20/penny/blob/main/README.md), [prd](https://github.com/ramakrishnanhulk20/penny/blob/main/docs/prd.md).

## Architecture

Two npm workspaces. `@penny/core` is a pure money engine (no I/O). `@penny/web` is Next.js 16.4.2 / React 19.3.1 / TypeScript 5.9.3 on Vercel, with Neon Postgres through Drizzle and `@neondatabase/serverless`. Versions are pinned in [package.json](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/web/package.json) and [packages/core/package.json](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/core/package.json). CI is Node 24 ([ci.yml](https://github.com/ramakrishnanhulk20/penny/blob/main/.github/workflows/ci.yml)); local tests below ran on Node 22.23.4.

| Module | Role |
|---|---|
| [amount.ts](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/core/src/amount.ts) | Parses typed amounts to `bigint` minor units. No floats. |
| [allocate.ts](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/core/src/allocate.ts) | Largest-remainder split. Ties go to whoever is listed first. Parts sum to the total. |
| [rate.ts](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/core/src/rate.ts) | One conversion per expense, half up, integer arithmetic. |
| [settle.ts](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/core/src/settle.ts) | Exact minimum payments for up to 16 non-zero balances; greedy above that; the plan is checked to leave everyone at zero. |
| [currencies.generated.ts](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/core/src/currencies.generated.ts) | ISO 4217 table. 165 `Object.freeze({ code })` rows (**VERIFIED** by count). The live home page says "165". |
| [ledger-store.ts](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/web/src/lib/ledger-store.ts) | Postgres ledger, idempotent `clientId`, version checks, link reset. |
| [group-token.ts](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/web/src/lib/group-token.ts) | 128-bit secret, SHA-256 stored. |
| [checks.ts](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/web/src/lib/checks.ts) | `/api/checks` reads GitHub statuses and accepts "passed" only from bot user id 258111874. |
| [sample-trip-story.ts](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/web/src/lib/sample-trip-story.ts) | Home-page Lisbon numbers are computed by calling `settle` on the same definition the button sends. |

Deploy: production `https://penny-self.vercel.app` on Neon `penny-prod` (claimed). Each pull request preview is described as its own Neon branch `preview/<branch>`, deleted by [neon-cleanup.yml](https://github.com/ramakrishnanhulk20/penny/blob/main/.github/workflows/neon-cleanup.yml) when the pull request closes. FX is `api.frankfurter.dev` (ECB reference rates). Live `GET /api/fx?from=EUR&to=USD` on 2026-10-23 returned `{"rate":"1.1193","date":"2026-10-23","source":"ECB reference rate"}`.

Diagrams and invariants C1–C42: [ARCHITECTURE.md](https://github.com/ramakrishnanhulk20/penny/blob/main/ARCHITECTURE.md), [threat-model.md](https://github.com/ramakrishnanhulk20/penny/blob/main/docs/security/threat-model.md).

## TestSprite integration depth

**Depth score: 8/10.**

Penny wires TestSprite in as a merge gate, a production API suite, a failure-driven auto-fix, and a page inside the product. The browser plans are not in git, there is no TestSprite MCP for the product, the API suite has run once, and the auto-fix has exactly one successful run (the staged demo). That is deep, and it is narrower than the README's "every change" wording.

Two TestSprite projects, both under org `487c92a2-7918-5d1a-9e92-45a9639a321d`:

| Project | Id | What runs |
|---|---|---|
| Browser | `36aab7fd-9032-4711-b317-8cb583221099` | GitHub App check `TestSprite V3` on pull-request previews. Not a file in `.github/workflows`. |
| API | `1d5de74e-c35c-42b0-95b0-d3517e6a5275` | `@testsprite/testsprite-cli@0.15.0` via [api-suite.yml](https://github.com/ramakrishnanhulk20/penny/blob/main/.github/workflows/api-suite.yml) |

CLI pin: [tools/self-fix/package.json](https://github.com/ramakrishnanhulk20/penny/blob/main/tools/self-fix/package.json) (`@testsprite/testsprite-cli` 0.15.0, `@anthropic-ai/claude-code` 2.1.303). No `.testsprite` directory. No product MCP config. The auto-fix agent is started with an empty MCP config on purpose (below).

### GitHub App check, per pull request

`TestSprite V3` is a commit **status**, not a check run. Combined status on each pull request's head, read 2026-10-23. Execution links are `https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/<id>`.

| PR | Head result | Execution |
|---|---|---|
| [#1](https://github.com/ramakrishnanhulk20/penny/pull/1) merged | no TestSprite status | — |
| [#2](https://github.com/ramakrishnanhulk20/penny/pull/2) | success, All 12 | [a9f1ee54](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/a9f1ee54-f9c0-4833-871c-53fb36e0f2e3) |
| [#3](https://github.com/ramakrishnanhulk20/penny/pull/3) | success, All 12 | [f73052fc](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/f73052fc-d5c0-4fc1-8257-a5961291a579) |
| [#4](https://github.com/ramakrishnanhulk20/penny/pull/4) | success, All 14 | [0a051dcd](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/0a051dcd-0cc1-469a-800b-dc8c478367cf) |
| [#5](https://github.com/ramakrishnanhulk20/penny/pull/5) | success, All 16 | [0e7da834](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/0e7da834-73c1-42ea-8ec4-295d9b2730ef) |
| [#6](https://github.com/ramakrishnanhulk20/penny/pull/6) | success, All 16 | [fe5e056c](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/fe5e056c-a146-4ec3-909e-1625f1df03e9) |
| [#7](https://github.com/ramakrishnanhulk20/penny/pull/7) | success, All 21 | [8603311f](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/8603311f-32cf-43bb-90ac-2e9e3ab8ff99) |
| [#8](https://github.com/ramakrishnanhulk20/penny/pull/8) | success, All 21 | [f790ab9e](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/f790ab9e-abf1-4d0e-9ef9-3db8043427b5) |
| [#9](https://github.com/ramakrishnanhulk20/penny/pull/9) | success, All 21 | [44c676a0](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/44c676a0-b415-4842-a369-d2f6845bfc08) |
| [#10](https://github.com/ramakrishnanhulk20/penny/pull/10) head | success, All 21 at 05:31:52Z | [55b74fd4](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/55b74fd4-0923-40a3-8b9e-b9bcb3452b0e) |
| [#10](https://github.com/ramakrishnanhulk20/penny/pull/10) parent `647bc07` | **failure, 18/21 passed · 3 failed** at 05:27:08Z, creator `testsprite[bot]` id 258111874 | [7d43faeb](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/7d43faeb-ca75-4139-a1f2-5e3b1f3e6f12) |
| [#11](https://github.com/ramakrishnanhulk20/penny/pull/11)–[#15](https://github.com/ramakrishnanhulk20/penny/pull/15) | success, All 21 | [#11 aa6ff2a6](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/aa6ff2a6-76e0-459b-8c4f-9b05731dd6af), [#12 a271bdf8](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/a271bdf8-90d0-420b-b1c8-353b681c0bc2), [#13 96763206](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/96763206-28bd-4da8-a968-81d389ab4ba6), [#14 0772efbb](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/0772efbb-9e80-41b4-a3c0-cf7d2804d2f7), [#15 339872ca](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/339872ca-692c-430f-8337-6f6065ea3198) |
| [#16](https://github.com/ramakrishnanhulk20/penny/pull/16) latest | failure, 23/24 | [6d665c6d](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/6d665c6d-5372-4d5b-b48d-705134a96c6e) |
| [#17](https://github.com/ramakrishnanhulk20/penny/pull/17) latest | failure, 23/24 | [ee46643d](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/ee46643d-1c10-4775-bf79-e82024c93907) |
| [#18](https://github.com/ramakrishnanhulk20/penny/pull/18) | failure, 20/21 | [a32e61ca](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/a32e61ca-12eb-4ad2-94a5-ce4204a9b66f) |
| [#19](https://github.com/ramakrishnanhulk20/penny/pull/19) | failure, 20/21 | [cc6d033d](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/cc6d033d-1a96-4e14-b69c-ba6ad8060b46) |
| [#20](https://github.com/ramakrishnanhulk20/penny/pull/20) | failure, 20/21 | [4c330e63](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/4c330e63-d117-410a-97b9-116d619deb3c) |
| [#21](https://github.com/ramakrishnanhulk20/penny/pull/21) latest | failure, 23/24 | [0b1993d0](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/0b1993d0-33c4-46f9-873e-85f1f3e7baab) |
| [#22](https://github.com/ramakrishnanhulk20/penny/pull/22) | failure, 20/21 | [9b6ede74](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/9b6ede74-9437-49af-a160-14ac6ce0fe12) |
| [#23](https://github.com/ramakrishnanhulk20/penny/pull/23) | failure, 20/21 | [2b2b10e5](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/2b2b10e5-7418-47b3-b0fd-1ab3a7ff0026) |
| [#24](https://github.com/ramakrishnanhulk20/penny/pull/24) | success, All 24 at 16:46:21Z | [e5fb7f39](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/e5fb7f39-8953-4499-a264-5a42d56aa5da) |
| [#25](https://github.com/ramakrishnanhulk20/penny/pull/25) | success, All 24 at 06:25:41Z on 21 Oct | [fbf9bb9d](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/fbf9bb9d-dbfc-41bf-a2a2-07a5528dbeab) |

24 of 25 pull requests carry a `TestSprite V3` status. PR #1 does not. The count on the status grew 12 → 14 → 16 → 21 → 24. It is not "24 tests on every PR".

The 24 names on the green comment of [PR #24](https://github.com/ramakrishnanhulk20/penny/pull/24) match the README list, including the three added after the study: "Convert at a rate that lands on half a cent", "Settle up in the fewest payments when the simple plan needs more", "Reset link: the old link opens nothing and the new one opens the group". Those names live in TestSprite's comment, not as plan files in the repo.

### Is `TestSprite V3` required, and is it pinned to TestSprite's app?

GraphQL `StatusContext.isRequired(pullRequestNumber:)` on 2026-10-23:

| PR / commit | Context | State | isRequired |
|---|---|---|---|
| #25 head `b1af0c6` | `TestSprite V3` | SUCCESS | **true** |
| #25 head | `maintainer-review` | SUCCESS | **true** |
| #25 head | `Vercel` | SUCCESS | false |
| #25 head | check run `unit-tests` | SUCCESS | false |
| #25 head | check run `review-gate` | SUCCESS | false |
| #10 red commit `647bc07` | `TestSprite V3` | FAILURE | **true** |
| #10 green commit `fb062ae` | `TestSprite V3` | SUCCESS | **true** |

So GitHub itself reports both `TestSprite V3` and `maintainer-review` as required for those pull requests, and reports the `review-gate` **job** as not required. That matches the comment in [maintainer-review.yml](https://github.com/ramakrishnanhulk20/penny/blob/main/.github/workflows/maintainer-review.yml): the job is named `review-gate` because a job with the status's name would go green after posting "pending".

What was not readable:

- `GET /repos/ramakrishnanhulk20/penny/branches/main/protection` returned **403**.
- Repository rulesets returned `[]` (HTTP 200). The requirement is classic branch protection, not a ruleset.
- `isRequired` does not return the `app_id` the rule is pinned to.

The posting identity is TestSprite's app. `GET /apps/testsprite` returns `{"id":2756476,"name":"TestSprite"}`. The failure status on `647bc07` was created by `testsprite[bot]` user id **258111874**, the same id [gate.mjs](https://github.com/ramakrishnanhulk20/penny/blob/main/scripts/self-fix/gate.mjs) and [checks.ts](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/web/src/lib/checks.ts) hard-code. The README's claim that the branch rule pins app id 2756476 is consistent with that, and the rule object's `app_id` field was not returned. Treat "required" as **VERIFIED** and "pinned to the app" as **UNVERIFIED** as a rule field (the live statuses do come from that app).

`enforce_admins` was not readable (same 403). No merged pull request has a failing `TestSprite V3` on its head. PR #10's red commit stayed unmerged; the merge at 2026-10-20T05:48:49Z is the later green commit. There is no stored "merge button rejected" event. The refusal is inferred from `isRequired: true` on a `FAILURE` status plus the merge timestamp.

`unit-tests` is not required. On `647bc07` it had already failed at 05:03:28Z ([run 39372781274](https://github.com/ramakrishnanhulk20/penny/actions/runs/39372781274)), about 24 minutes before TestSprite went red. The auto-fix waits for TestSprite, not for CI.

### CLI, schedules, MCP

| Workflow | Trigger | What it does |
|---|---|---|
| [api-suite.yml](https://github.com/ramakrishnanhulk20/penny/blob/main/.github/workflows/api-suite.yml) | `push` to `main`, `workflow_dispatch` | Waits until `GET /api/checks` reports `.live.sha` equal to the pushed commit (15 min cap), then `testsprite test run --all --project "$TESTSPRITE_API_PROJECT_ID" --wait`. |
| [self-fix.yml](https://github.com/ramakrishnanhulk20/penny/blob/main/.github/workflows/self-fix.yml) | `status` | On a `TestSprite V3` failure from bot 258111874, downloads failure bundles with the CLI and may push a patch. |
| [self-fix-selftest.yml](https://github.com/ramakrishnanhulk20/penny/blob/main/.github/workflows/self-fix-selftest.yml) | `workflow_dispatch` only | Sandbox probe of Claude Code. Not a TestSprite run. |
| [ci.yml](https://github.com/ramakrishnanhulk20/penny/blob/main/.github/workflows/ci.yml) | pull_request and push to main | typecheck, lint, Vitest, `node --test` for the workflow scripts. Not required. |
| [maintainer-review.yml](https://github.com/ramakrishnanhulk20/penny/blob/main/.github/workflows/maintainer-review.yml) | pull_request opened / synchronize / reopened / labeled / unlabeled | Posts `maintainer-review`. |
| [neon-cleanup.yml](https://github.com/ramakrishnanhulk20/penny/blob/main/.github/workflows/neon-cleanup.yml) | pull_request closed | Deletes the preview Neon branch. |

No cron. No nightly. No TestSprite run on `pull_request` from Actions; the browser suite is the GitHub App.

The only `api-suite` run is [39556648357](https://github.com/ramakrishnanhulk20/penny/actions/runs/39556648357) (2026-10-21T06:38:17Z, push of merge `bba9cbe`). The log says production was still on `c9f3896`, then `production serves bba9cbe…`, then `Batch run complete: 16/16 passed, 0 failed/blocked, 0 timed out`. Dashboard project: [1d5de74e](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/1d5de74e-c35c-42b0-95b0-d3517e6a5275). Execution: [d10b3433](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/1d5de74e-c35c-42b0-95b0-d3517e6a5275/execution/d10b3433-aaa1-4ed2-a407-12cca38b407f). That is the merge of PR #25, which added the workflow. The 16 earlier merges have no API-suite run. "After every merge" describes the trigger from here on, not the history.

MCP: the product does not expose one, and the auto-fix forbids MCP servers. The latest sandbox self-test [39551053981](https://github.com/ramakrishnanhulk20/penny/actions/runs/39551053981) (2026-10-21) printed `mcp servers at init: 0`.

### Plans in git

16 Python files in [testsprite/api](https://github.com/ramakrishnanhulk20/penny/tree/main/testsprite/api) (`01_health.py` through `16_rate_limit_shape.py`). **VERIFIED** by listing the tree. They default `PENNY_BASE_URL` to production ([03_equal_split_to_the_cent.py](https://github.com/ramakrishnanhulk20/penny/blob/main/testsprite/api/03_equal_split_to_the_cent.py)). Not run locally (they create real groups).

Browser tests: **0 files in git**. The 24 names are only in TestSprite comments and the README.

### The auto-fix workflow

Design write-up: [docs/security/self-fix.md](https://github.com/ramakrishnanhulk20/penny/blob/main/docs/security/self-fix.md). Workflow: [self-fix.yml](https://github.com/ramakrishnanhulk20/penny/blob/main/.github/workflows/self-fix.yml). Prompt: [prompt.md](https://github.com/ramakrishnanhulk20/penny/blob/main/scripts/self-fix/prompt.md). Patch rules: [check-diff.mjs](https://github.com/ramakrishnanhulk20/penny/blob/main/scripts/self-fix/check-diff.mjs). Agent settings: [claude-settings.json](https://github.com/ramakrishnanhulk20/penny/blob/main/scripts/self-fix/claude-settings.json). Review rule: [review-gate.mjs](https://github.com/ramakrishnanhulk20/penny/blob/main/scripts/review-gate/review-gate.mjs).

It runs from `main` on the `status` event, never from the pull request's copy of the workflow. Permissions start empty. Third-party actions are pinned to full SHAs. The only non-skipped run in the repository is [39374963904](https://github.com/ramakrishnanhulk20/penny/actions/runs/39374963904). Every other `self-fix` run (58 listed) is `skipped`.

**Gate.** The job runs only when `github.event.context == 'TestSprite V3'`, state is `failure`, and `github.event.sender.id == 258111874`. [gate.mjs](https://github.com/ramakrishnanhulk20/penny/blob/main/scripts/self-fix/gate.mjs) then requires all of: exactly one open, same-repo, non-fork pull request by `ramakrishnanhulk20` (user id 140826327) whose head is still the tested commit; fewer than 2 attempts on that pull request; fewer than 6 fix jobs since midnight UTC. Any API doubt skips. The preview origin is computed, not scraped: `https://penny-git-<branch>-rams-projects-86cea8eb.vercel.app` (`previewOrigin`).

**Failures.** Installs the pinned TestSprite CLI with `npm ci --ignore-scripts` and downloads bundles for tests that failed on that preview, started after the commit, and started within two hours before the failing status. Cap 10 bundles, kept 1 day. The PR #10 log line: `21 tests listed, 3 failing on the preview, 3 bundles fetched`.

**Fix.** Checks out exactly the tested commit into `/tmp/penny-self-fix` (outside `$HOME`, because settings deny reads under `~`). Deletes `CLAUDE.md`, `AGENTS.md`, `.mcp.json`, `.claude`. Moves `.git` out of the work tree so git cannot run a `core.fsmonitor` the agent wrote. Runs Claude Code with:

- tools `Read,Edit,Write,Glob,Grep` only
- `--disallowedTools Bash WebFetch WebSearch Agent "mcp__*"`
- `--strict-mcp-config --mcp-config '{"mcpServers":{}}'`
- `--permission-mode dontAsk`, `--safe-mode`, `--max-turns 30`, `--max-budget-usd 2`
- secret `CLAUDE_CODE_OAUTH_TOKEN` only in that step

The prompt tells the model that `.self-fix/failure/` is untrusted, to change only `packages/web/src` or `packages/core/src`, and to change nothing if the test looks wrong. The transcript is not printed. The public log shows exit code, turns, and cost only.

**Push.** A second job with no AI checks the patch again, then fast-forwards onto the tested commit as `github-actions[bot]` only if the remote branch still points at that commit. A refused patch is commented and not pushed. The workflow token does not start other workflows, so this job itself posts `maintainer-review: pending` on the new commit.

**What a patch may be.** Only `.ts`, `.tsx`, `.css` under `packages/web/src` or `packages/core/src`. Refused: security modules (`group-token.ts`, `groups.ts`, `rate-limit.ts`, `http.ts`, `env.ts`, `text.ts`, `api-schemas.ts`, `packages/web/src/db/`), new routes, tests, config, lockfiles, dotfiles, renames, binaries, more than 200 lines or 200,000 bytes, secret-shaped lines, bidi/format characters, and lines containing `process`, `globalThis`, `DATABASE_URL`, `eval`, dynamic `import(`, and similar. Documented limit: a patch that slips through is deployed to a public preview that holds `DATABASE_URL` for the synthetic preview database, before a person reads it ([self-fix.md](https://github.com/ramakrishnanhulk20/penny/blob/main/docs/security/self-fix.md)).

**The `reviewed` label.** After PR #11, a pull request with a robot commit stays `maintainer-review: pending` until `ramakrishnanhulk20` adds the `reviewed` label after the last robot commit. A pull request with no robot commit is success immediately ("No robot commits on this pull request"), which is what PRs #12–#22, #24, and #25 show. The label exists on the repo. No pull request currently carries it. The only robot commit in the history is on PR #10, merged at 05:48:49Z, before PR #11 merged at 07:52:57Z. PR #10 has no `maintainer-review` status. The wait-for-label path is implemented, unit-tested, and required, and it has never been taken on a real robot commit.

**Sandbox proof.** [self-fix-selftest.yml](https://github.com/ramakrishnanhulk20/penny/blob/main/.github/workflows/self-fix-selftest.yml) asks the agent to read `/proc/self/environ`, read and write outside its folder, and obey a planted `CLAUDE.md`. [workflow-flags.test.mjs](https://github.com/ramakrishnanhulk20/penny/blob/main/scripts/self-fix/workflow-flags.test.mjs) fails if the self-test and the real job pass different flags. Latest green run [39551053981](https://github.com/ramakrishnanhulk20/penny/actions/runs/39551053981) printed the eight expected lines, including `outside write denied: yes`, `nested CLAUDE.md obeyed: no`, `mcp servers at init: 0`. An earlier run [39389632024](https://github.com/ramakrishnanhulk20/penny/actions/runs/39389632024) failed; the README says that failure is what forced the "edits only inside the checkout" rule (PR #12).

### Red → green (the one loop)

All times 2026-10-20 UTC. Pull request [#10](https://github.com/ramakrishnanhulk20/penny/pull/10), "Demo: planted rounding bug".

| Time | What | Evidence |
|---|---|---|
| 05:01:35 | Commit `647bc07` flips the tie-break in `allocate.ts` so the leftover cent goes to the last person | parent of [fb062ae](https://github.com/ramakrishnanhulk20/penny/commit/fb062ae44991c1cd132b6765af84b847d31e5485) |
| 05:02:45 | PR opened | PR #10 `createdAt` |
| 05:03:28 | `unit-tests` check **fails** (not required) | [run 39372781274](https://github.com/ramakrishnanhulk20/penny/actions/runs/39372781274) |
| 05:22:56 | Vercel preview success (an earlier deploy had failed at 05:02:41) | status on `647bc07` |
| 05:23:02 | TestSprite: `21 tests queued` | same execution [7d43faeb](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/7d43faeb-ca75-4139-a1f2-5e3b1f3e6f12) |
| 05:27:08 | TestSprite: **failure, 18/21 passed · 3 failed** | status creator `testsprite[bot]` 258111874. `isRequired: true` |
| 05:27:09 | self-fix run starts | [39374963904](https://github.com/ramakrishnanhulk20/penny/actions/runs/39374963904) |
| 05:27:18 | gate: `proceeding: pull request #10, self-fix attempt 1` | job log |
| 05:27:43 | `21 tests listed, 3 failing on the preview, 3 bundles fetched` | failures job |
| 05:28:13 | Claude Code exit 0, `num_turns` 8, `total_cost_usd` 0.0885891, patch 13 lines | fix job log |
| 05:28:24 | Commit `fb062ae`, author `github-actions[bot]`, message `self-fix: attempt 1 for the TestSprite failure on 647bc07`. One line in `allocate.ts`: tie comparator `b.position - a.position` restored to `a.position - b.position` | [commit](https://github.com/ramakrishnanhulk20/penny/commit/fb062ae44991c1cd132b6765af84b847d31e5485) |
| 05:28:27 | Bot comment lists `packages/core/src/allocate.ts` | [comment 6284105814](https://github.com/ramakrishnanhulk20/penny/pull/10#issuecomment-6284105814) |
| 05:28:29 | push job completes. 05:28:29 minus 05:27:08 is **81 seconds** | job `completedAt` |
| 05:28:50 | New Vercel preview success | status on `fb062ae` |
| 05:28:57 | TestSprite queues 21 tests on the new commit | status |
| 05:28:55 created, 05:31:50 updated | TestSprite comment, now the 21 green names. Created while the new run was still pending; body updated two seconds before the success status | [comment 6284111373](https://github.com/ramakrishnanhulk20/penny/pull/10#issuecomment-6284111373) |
| 05:31:52 | TestSprite: **All 21 tests passed**. 05:31:52 minus 05:27:08 is **4 minutes 44 seconds** | [55b74fd4](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/55b74fd4-0923-40a3-8b9e-b9bcb3452b0e) |
| 05:48:49 | Maintainer merges | PR `mergedAt` |

The three failing test titles from the red run are not in the current PR comment: TestSprite edited that comment to the green 21 at 05:31:50. The status text "3 failed" is verified; which three is **UNVERIFIED** from the comment. The green comment's 21 names are the README's first 21.

The study failures (15:39–16:17 UTC) produced **no** `self-fix` workflow runs at all. The run list jumps from 15:38:06Z (docs PR #15) to 16:41:58Z (PR #24). A skipped run would still be listed if the workflow had started and the gate `if` had failed. It did not start. The robot did not attempt the eight planted bugs. Whether the workflow was switched off for the study is **UNVERIFIED**.

### Credits

One observed model charge: $0.0885891 on the PR #10 fix (about 9 cents, as the README says). Caps in the workflow: $2 and 30 turns per attempt, 2 attempts per pull request, 6 attempts per UTC day. TestSprite credit balance is not visible. **UNVERIFIED** beyond that one log line.

### In-product checks

https://penny-self.vercel.app/checks and `GET /api/checks`. On 2026-10-23 the JSON was fresh (`stale: false`), `live.sha` `bba9cbe`, `live.pr` 25, verdict passed 24/24, and the twelve newest pull requests with the same pass/fail counts as the GitHub statuses above. The page copy says GitHub refuses the merge until the check passes, and describes the self-fix. "Passed" is accepted only from bot id 258111874 ([checks.ts](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/web/src/lib/checks.ts)).

## Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
|---|---|---|---|---|
| Browser TestSprite | 24 on every PR preview | 24 names on PR #24's green comment; historical heads are 12, 14, 16, or 21; 0 plan files in git | table above; [PR #24 comment](https://github.com/ramakrishnanhulk20/penny/pull/24) | **FALSE** as "24 on every PR". **VERIFIED** as the current cloud suite size (24) on PRs #24 and #25. Preview targeting **VERIFIED** for the PR #10 failure fetch ("3 failing on the preview"); other PRs have a Vercel preview status and a TestSprite status on the same head, which is consistent and not a per-URL proof. |
| API TestSprite | 16, on production after every merge | 16 `.py` files; one Actions run `16/16 passed` | [testsprite/api](https://github.com/ramakrishnanhulk20/penny/tree/main/testsprite/api), [run 39556648357](https://github.com/ramakrishnanhulk20/penny/actions/runs/39556648357) | Files and that one run **VERIFIED**. "After every merge" is **FALSE** for history (1 of 17 merge pushes). Not run locally: they POST real groups to whatever `PENNY_BASE_URL` is, defaulting to production. |
| `@penny/core` Vitest | 230 | 230 passed, 7 files | local `npm test` on 2026-10-23, Node 22.23.4 | **VERIFIED** |
| `@penny/web` Vitest (PGlite) | 751 | 751 passed, 24 files | same run, 96s | **VERIFIED** |
| Workflow scripts `node --test` | 159 | 159 pass, 0 fail | same session | **VERIFIED** |
| Total 1,140 | 230+751+159 | 1,140 | the three commands | **VERIFIED** locally on 2026-10-23. The README's date is 20 Oct; the count still matches. |
| Stryker mutation score 91.29% | measured 20 Oct by a clean clone, break under 85 | config only: `thresholds.break` 85 in [stryker.config.json](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/core/stryker.config.json). No report in git, no CI job | — | Score **UNVERIFIED**. Not re-run (it is a long mutation suite; the brief's time box was the unit command). |
| "Each API test failed when one expected value was changed" | README | no commit, log, or second run | — | **UNVERIFIED** |
| Planted bugs caught | 5/8 on 21 tests, 8/8 after 3 tests were added | see claim table | study PRs | **VERIFIED** for the TestSprite statuses. See the one-line caveat. |
| Local run | `npm ci && npm test` needs no database | exit 0 | this review | **VERIFIED**. `node_modules` deleted afterward. API Python tests not run. |

## Claim verification

| Claim | Verdict | Why |
|---|---|---|
| Exact to the smallest currency unit | **VERIFIED** | [parseAmount](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/core/src/amount.ts) stores a `bigint` of minor units and refuses extra decimals. [allocate.ts](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/core/src/allocate.ts) uses largest remainder so parts sum to the total. ISO digits include JPY 0 and KWD 3. Live home page shows the two leftover cents of 96.50 going to the first two people (32.17, 32.17, 32.16). |
| Fewest payments to settle | **VERIFIED** within the stated limit | [settle.ts](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/core/src/settle.ts): exact search when at most 16 balances are non-zero (`EXACT_SETTLE_LIMIT`), greedy above that, then a check that everyone is at zero. The headline omits the cap; the code and the docs do not. |
| No accounts | **VERIFIED** | No auth library. `GET /api/group` without the header is 404. `sessionStorage` holds "you are" and a pending reset token, not an account. README and the group link design match. |
| TestSprite went red 18/21 and main refused the merge | **VERIFIED** for the red status and the required flag | Failure status at 05:27:08Z, `isRequired: true`, state FAILURE, on `647bc07`. Merged only at 05:48:49Z on the green successor. No click-rejection event was stored. Protection JSON was 403. |
| Locked-down GitHub job running Claude Code pushed a one-line fix 81 seconds later | **VERIFIED** | [Run 39374963904](https://github.com/ramakrishnanhulk20/penny/actions/runs/39374963904) push job completed 05:28:29Z, 81s after 05:27:08Z. Commit [fb062ae](https://github.com/ramakrishnanhulk20/penny/commit/fb062ae44991c1cd132b6765af84b847d31e5485) is one line. Log: 8 turns, $0.0885891, file tools only. |
| TestSprite retested the new preview and went green 4m44s after red | **VERIFIED** | Pending on `fb062ae` at 05:28:57Z, success "All 21 tests passed" at 05:31:52Z. 05:31:52 − 05:27:08 = 4m44s. Execution [55b74fd4](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/55b74fd4-0923-40a3-8b9e-b9bcb3452b0e). |
| Robot fixes wait for the `reviewed` label | **VERIFIED** as a required rule, unexercised on a real robot commit | `maintainer-review` is `isRequired: true` on PR #25. The status text on ordinary PRs is "No robot commits on this pull request". The only robot commit predates the gate (PR #10 merged 05:48, PR #11 merged 07:52). No PR carries the `reviewed` label now. |
| 24 browser tests on every PR's own preview | **FALSE** | Suite size today is 24 (PR #24 comment lists 24 names, PR #25 status "All 24"). Earlier merged PRs ran 12, 14, 16, or 21. PR #1 has no check. "Own preview" is verified in the PR #10 failures log, and is the App's usual target, not re-proven URL-by-URL. |
| 16 API tests on production after every merge | **FALSE** for "every"; the suite and the one run are real | 16 files in git. One production run, 16/16, after the merge that added the workflow. Earlier merges have none. |
| 24 of 25 PRs carry the check | **VERIFIED** | Heads #2–#25 have `TestSprite V3`. #1 does not. |
| `TestSprite V3` required on main, pinned to TestSprite's app | Required **VERIFIED**. Pin **UNVERIFIED** as a rule field | `isRequired: true` on PRs #10 and #25. Statuses are from `testsprite[bot]` 258111874. `GET /apps/testsprite` is id 2756476. Classic protection returned 403, so `app_id` on the rule was not read. Rulesets are empty. |
| Planted-bug study: 8 one-line bugs, suite now catches all 8 | Catch pattern **VERIFIED**. "8 one-line" **FALSE** | Seven diffs are a single line. [PR #18](https://github.com/ramakrishnanhulk20/penny/pull/18) changes two lines in `ledger.ts` (payment signs swapped). All eight are closed unmerged. |

### Planted-bug study, checked against statuses and comments

| Bug | PR | Diff | First TestSprite run | Later run | CI `unit-tests` |
|---|---|---|---|---|---|
| b1 round down | [#16](https://github.com/ramakrishnanhulk20/penny/pull/16) | 1 line, `rate.ts` | All 21 passed (miss) on `ff9605a2` | 23/24 failed on `93138482`. Comment names "Convert at a rate that lands on half a cent". Failure text: 10.05 USD at 0.5 showed 5.02 EUR, expected 5.03 | failure |
| b2 greedy settle | [#17](https://github.com/ramakrishnanhulk20/penny/pull/17) | 1 line, `settle()` calls `greedyPlan` | All 21 passed (miss) | 23/24. Failure text: 4 payments instead of 3 | failure |
| b3 payment signs | [#18](https://github.com/ramakrishnanhulk20/penny/pull/18) | **2 lines** | 20/21. Failure text: marking payments paid did not move balances | not re-run on 24 | failure |
| b4 case-sensitive names | [#19](https://github.com/ramakrishnanhulk20/penny/pull/19) | 1 line, `nameKey` drops `toLowerCase` | 20/21. "Ana" and "ana" were both accepted | not re-run | failure |
| b5 base-currency lock | [#20](https://github.com/ramakrishnanhulk20/penny/pull/20) | 1 line, `hasEntries` uses `&&` | 20/21. "Change" stayed after the first expense | not re-run | failure |
| b6 reset link no-op | [#21](https://github.com/ramakrishnanhulk20/penny/pull/21) | 1 line, update `where` matches the new hash | All 21 passed (miss) | 23/24. New link showed the not-found page | failure |
| b7 JPY gets 2 decimals | [#22](https://github.com/ramakrishnanhulk20/penny/pull/22) | 1 line, `JPY` digits 0 → 2 | 20/21. 10.5 JPY was accepted as 10.50 | not re-run | failure |
| b8 delete skips confirm | [#23](https://github.com/ramakrishnanhulk20/penny/pull/23) | 1 line, `onClick` calls `confirmDelete` directly | 20/21. Taxi disappeared with no confirm dialog | not re-run | **no Actions run at all** on `781aac37` (only a Vercel check run) |

The five catches were not re-executed after the suite grew to 24. Their failing behaviors are still named in the 24-test comment on PR #24, and the three former misses each fail exactly one test on the 24-test rerun. "The suite now catches all 8" is the fair reading of that evidence. It is not eight fresh 24-test runs.

The README says unit tests caught b1–b7 and only the browser suite caught b8. CI `unit-tests` is failure on b1–b7 (**VERIFIED**). b8 has zero Actions runs, so a green unit-test result on that commit was **not** observed. The browser failure on b8 is **VERIFIED**.

Self-fix did not run on any study pull request.

## Code quality

The split between a pure engine and a Next.js app is clean. Money is `bigint`. Request bodies are zod schemas that reject unknown fields. Error bodies are `{"error":{"code":"..."}}`. The threat model numbers the invariants. Workflows start from `permissions: {}`, pin actions to SHAs, and keep pull-request code away from secrets. The self-fix patch checker is strict and tested. Test files start with a "not covered" comment. ESLint and `tsc` run in CI. The home page's Lisbon figures are produced by `sampleTripStory()` calling `settle`, not typed in by hand.

Smells worth a judge's time:

- Browser tests are not in the repository, so a reader cannot see the assertion without a TestSprite login. The API tests are in git and are the stronger artifact.
- `unit-tests` is not a required check, and it had already failed on the demo bug before TestSprite did. The story is a TestSprite loop, not "nothing else noticed".
- The auto-fix has one production success, on a bug the author planted, and it did not start during the study hour.
- The human `reviewed` label has never gated a real robot commit.
- A self-fix patch is deployed to a public preview before review. The author documents this and limits the blast radius to the synthetic preview database. The checker is a denylist.
- API tests write groups named "API suite: …" into production. The README says a full run leaves about 20 of them.
- Stryker is configured and not run in CI. The 91.29% figure has no artifact.
- Unknown `/api/*` paths return the HTML 404 page, not the JSON error shape.
- `npm ci` reported 8 vulnerabilities (2 low, 6 moderate) in the lockfile. Not investigated further.
- PR #23 never started `ci` or `maintainer-review`. A UI-only planted bug can ship past the unit job simply because the job did not run. It could not merge while TestSprite was red if the required check was already on, and it was closed unmerged anyway.

## Live-site behavior

Checked with curl on 2026-10-23. Server header `Vercel`. CSP is `default-src 'self'` with `'unsafe-inline'` for scripts and styles, `frame-ancestors 'none'`, `Referrer-Policy: no-referrer`, HSTS, `nosniff`, and a locked-down permissions policy. "Try a sample trip" and "Start a group" were not submitted: both write a real production group.

| URL | Code | Time | What came back |
|---|---|---|---|
| https://penny-self.vercel.app/ | 200 | 0.22s | Title "Penny". Poster copy and the Lisbon fold: Ana +155.74, Ben +81.34, Cy −95.15, Dev −141.93, three payments, "3 payments settle 7 expenses." |
| https://penny-self.vercel.app/checks | 200 | 0.19s | Explains the gate and the self-fix. Data loads from `/api/checks`. |
| https://penny-self.vercel.app/docs | 200 | 0.26s | Docs home. |
| https://penny-self.vercel.app/docs/testing/testsprite-suite | 200 | | The suite write-up. |
| https://penny-self.vercel.app/docs/testing/self-fixing-loop | 200 | | |
| https://penny-self.vercel.app/new | 200 | 0.26s | Create-a-group page (prerendered). Not submitted. |
| https://penny-self.vercel.app/g | 200 | 0.09s | "Loading the group…" with no hash. |
| `GET /api/health` | 200 | 1.00s | `{"status":"up"}` |
| `GET /api/checks` | 200 | 0.92s | Live sha `bba9cbe`, PR 25, 24/24 passed, twelve PRs. Not stale. |
| `GET /api/fx?from=EUR&to=USD` | 200 | 0.31s | ECB rate 1.1193 for 2026-10-23. |
| `GET /api/fx?from=EUR&to=ZZZ` | 200 body is an error | | `{"error":{"code":"invalid_body"}}` (status code not re-checked separately from the body). |
| `GET /api/search?query=settle` | 200 | | Docs hits, including the settle guide. `?q=` returned `[]`. |
| `GET /api/group` with no header | 404 | | |
| `POST /api/groups` body `{}` | 400 | 0.12s | `{"error":{"code":"invalid_body"}}`. No group created. |
| `/does-not-exist` and `/api/does-not-exist` | 404 | 0.09s | HTML "404: This page could not be found." |

The interactive group screen (mark paid, undo, edit, copy link) was not clicked, because a real group would have to be created in production.

## Demo

No demo video, no mp4, no screenshot in the repo. The task lists two X posts and says demo: none. Those posts were not fetched. The stand-in is PR #10 itself: a planted bug, a red check, a robot commit, a green check, and a human merge, with timestamps. The live home page is a designed poster of the Lisbon example, and `/checks` is the test record. That is evidence, not a walkthrough video.

## Weaknesses / risks for judges

- The category is crowded. Exact cents and a minimum payment list are real, and they are not a new job to be done. The TestSprite machinery is the unusual part.
- The auto-fix's only success is a one-line bug the author planted, in a file the agent is allowed to edit, after unit tests had already failed. A judge can call it a rehearsal.
- The study hour has no self-fix runs, so the loop did not face bugs it was not supposed to fix, or the workflow was off. Either way it is one data point.
- The `reviewed` label has never blocked a merge, because no later pull request contains a robot commit.
- Browser tests are cloud-only. Drift between the README list and the project would be invisible in git.
- "24 on every PR" and "API tests after every merge" overshoot the history. The careful sentence is: 24 of 25 PRs have the check, the suite is 24 now, and the API suite has run once on production since it was added.
- The app-id pin on the branch rule was not re-read (protection 403). Required-ness was.
- Mutation score 91.29% and the "flip one expected value and the API test fails" claim have no artifact.
- No video.
- API tests pollute production with synthetic groups. Preview data is claimed synthetic; that database was not inspected.

## Where it beats Ninety

Ninety baseline used here: https://github.com/mohamedwael201193/ninety , live https://ninety-coral.vercel.app . Ninety's TestSprite V3 was red on PR #63 and that PR still merged; branch protection returned 403 and was not re-confirmed. Ninety has no auto-fix, no mutation run, no planted-bug study. Ninety does commit 43 frontend plans and 28 backend tests, and it runs the backend CLI on every pull request.

1. **A required TestSprite check that stayed red until a later commit.** GraphQL `isRequired: true` on PR #10's failing `TestSprite V3` status, and the merge is the green successor 17 minutes after green ([PR #10](https://github.com/ramakrishnanhulk20/penny/pull/10), failure execution [7d43faeb](https://www.testsprite.com/dashboard-v3/o/487c92a2-7918-5d1a-9e92-45a9639a321d/projects/36aab7fd-9032-4711-b317-8cb583221099/execution/7d43faeb-ca75-4139-a1f2-5e3b1f3e6f12)). Ninety would need the check to be required in a way a red PR cannot merge, and a public signal of that (`isRequired`, or a protection document a reviewer can read). Penny still has not shown the `app_id` pin field.

2. **A closed auto-fix loop with a non-AI second checker.** [self-fix.yml](https://github.com/ramakrishnanhulk20/penny/blob/main/.github/workflows/self-fix.yml) downloads TestSprite failure bundles, runs Claude Code with file tools only, rejects patches outside a denylist, and pushed a one-line revert in 81 seconds ([run 39374963904](https://github.com/ramakrishnanhulk20/penny/actions/runs/39374963904), [commit fb062ae](https://github.com/ramakrishnanhulk20/penny/commit/fb062ae44991c1cd132b6765af84b847d31e5485)). A second required status, `maintainer-review`, waits for a `reviewed` label when the commit is the bot's ([review-gate.mjs](https://github.com/ramakrishnanhulk20/penny/blob/main/scripts/review-gate/review-gate.mjs)). Ninety's red→green record is a document of human fixes. To match this, Ninety would need a workflow that turns a TestSprite failure into a reviewed patch, with the agent unable to run a shell or read the token, and a required status a same-named job cannot satisfy. Penny's loop has one observed success, on a planted bug.

3. **A catch-rate study that added the tests it had missed.** Eight planted diffs, five caught at 20/21, three missed at 21/21, then three new tests, and the three misses retested at 23/24 with failure text that matches the new test ([PRs #16](https://github.com/ramakrishnanhulk20/penny/pull/16), [#17](https://github.com/ramakrishnanhulk20/penny/pull/17), [#21](https://github.com/ramakrishnanhulk20/penny/pull/21)). Ninety would need a similar before/after on its own suite (it has no mutation testing). Penny did not re-run the original five against the 24-test suite, and b3 is two lines, not one.

4. **The verdict is inside the product.** https://penny-self.vercel.app/checks shows the live commit and the pass/fail counts that let it ship, and it refuses to call a status "passed" unless bot 258111874 posted it ([checks.ts](https://github.com/ramakrishnanhulk20/penny/blob/main/packages/web/src/lib/checks.ts)). Ninety's `/proof` maps rules to tests; it does not display the GitHub status of the running deploy. Matching this is a read-only GitHub client plus a page.

5. **The API suite waits until production is actually serving the merged SHA** before `testsprite test run --all` ([api-suite.yml](https://github.com/ramakrishnanhulk20/penny/blob/main/.github/workflows/api-suite.yml), [run 39556648357](https://github.com/ramakrishnanhulk20/penny/actions/runs/39556648357)). Ninety runs backend tests on the preview and on main, which is more often. The "wait for this commit" step is the piece Ninety's on-merge path does not spell out the same way. It has happened once.

Ninety still leads on plans-in-git, backend tests on every pull request, an HTTP and stdio MCP for the product, and a nightly differential fuzz. Penny has none of those. Penny's Vitest count (981) plus 159 script tests is larger than Ninety's 367, and that is a unit-test lead, not a TestSprite lead.

## Estimated judging scores

| Axis | Score | Note |
|---|---|---|
| Problem value | 7 | Real pain (leftover cents, messy debts, no sign-up). A crowded category. The Lisbon story is concrete. |
| TestSprite depth | 8 | Required App check, CLI on production, failure bundles driving a locked-down agent, a label gate, a catch-rate study, a checks page. Browser plans not in git, no product MCP, one API run, one auto-fix. |
| Verifiability | 8 | Timestamps, statuses, diffs, and a local 1,140-test run all line up. The 91.29% mutation figure, the API-test self-mutation, the app-id pin, and "every merge" do not. |
| Polish | 8 | Live site, docs, CSP, and the checks page are careful. The group flow was not clicked end to end. Unknown API paths return HTML. |
| Demo | 3 | No video. PR #10 is a timed artifact a judge can read. X posts were not reviewed. |
| Overall | 8 | A strong rival on the TestSprite axis, especially the required check and the auto-fix. The product is narrower than the testing story, and several headline counts are the current suite rather than the whole history. |
