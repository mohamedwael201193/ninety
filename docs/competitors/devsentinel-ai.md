# DevSentinel AI

- **Name:** DevSentinel AI
- **Repo:** https://github.com/festac-dev/devsentinel-ai (owner `festac-dev`, default branch `main` at `e73fa656cd46308d6a25398de1f48cf5b47be5a9`, Apache-2.0)
- **Live:** https://devsentinel-ai-festac.vercel.app/
- **TestSprite PR(s):** none. `gh pr list` is empty ([pulls](https://github.com/festac-dev/devsentinel-ai/pulls), [repo metadata](https://github.com/festac-dev/devsentinel-ai) reports `pullRequests.totalCount: 0`). The TestSprite GitHub App has created a check suite on every push, each stuck `queued` with **0 check runs** (HEAD suite id `107766541991`, created 2026-10-22T10:36:07Z: [check-suites API](https://api.github.com/repos/festac-dev/devsentinel-ai/commits/e73fa656cd46308d6a25398de1f48cf5b47be5a9/check-suites)).
- **Demo:** none. No release, no video file in the tree, and `devsentinel-ai-deployment-guide.pdf` is absent ([contents API 404](https://api.github.com/repos/festac-dev/devsentinel-ai/contents/devsentinel-ai-deployment-guide.pdf)). A written script exists at [docs/demo-guide.md](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/docs/demo-guide.md).
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7
- **History reviewed:** 3 commits on `main` ([commits](https://github.com/festac-dev/devsentinel-ai/commits/main)): `8eba991` (2026-10-16), `6d20696` (2026-10-22, delivery tracker), `e73fa65` (2026-10-22, BUG-FIXES.md one-line edit). 0 issues ([issues](https://github.com/festac-dev/devsentinel-ai/issues)).

## 1. What it is

DevSentinel AI is a multi-tenant developer-operations app for the TestSprite Hackathon. A signed GitHub `pull_request` webhook is supposed to enqueue a job; a separate worker runs the official `@testsprite/testsprite-cli` against a project’s deployed URL; the result is stored against that commit SHA and later marked stale if the PR head moves; failed runs can open incidents; a monitor polls public URLs. The intended user is a developer who wants PR test results that cannot be mistaken for a newer commit, plus uptime checks and an evidence log. The value is real as a control-plane around TestSprite, and it overlaps the TestSprite GitHub App the README itself says DevSentinel does not trigger ([README](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/README.md), [docs/github-app-setup.md](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/docs/github-app-setup.md)).

## 2. Architecture

One Next.js 16 / React 19 / TypeScript-strict codebase, role selected by `APP_ROLE` (`web` on Vercel, `worker` with no port, `all` for local/single container). Prisma over PostgreSQL. Pinned dependency `@testsprite/testsprite-cli` **0.14.0** ([package.json](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/package.json)). CI also builds a Docker image and asserts that pin ([ci.yml](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/.github/workflows/ci.yml)).

| Module | Role | Blob |
| --- | --- | --- |
| Webhook route | Raw body cap, HMAC, then delivery-id dedup | [route.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/app/api/webhooks/github/route.ts) |
| Signature | HMAC-SHA256 over the raw string, `timingSafeEqual` | [webhook.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/modules/github/webhook.ts) |
| Pipeline | Queue a run bound to `pull_request.head.sha` | [pipeline.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/modules/github/pipeline.ts) |
| TestSprite adapter | Spawns the CLI (`test create` / `test run` / `test result`) | [provider.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/modules/testsprite/provider.ts) |
| Status publish | GitHub commit status context `devsentinel/testsprite` | [publish.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/modules/github/publish.ts) |
| SSRF + checker | URL policy plus DNS-pinned `http(s)` lookup and redirect revalidation | [ssrf.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/modules/monitoring/ssrf.ts), [checker.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/modules/monitoring/checker.ts) |
| Auth / crypto | scrypt, session cookie, AES-256-GCM | [auth.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/lib/auth.ts), [crypto.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/lib/crypto.ts) |
| Ownership | Cross-user reads return 404 | [ownership.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/lib/ownership.ts) |
| Worker | Polls `Job`, heartbeat, monitoring, retention | [loop.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/worker/loop.ts) |
| Schema | Users, sessions, encrypted integrations, runs, deliveries | [schema.prisma](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/prisma/schema.prisma) |

Deploy target documented as Vercel (`APP_ROLE=web`) plus a worker on Railway/VPS ([README](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/README.md), [render.yaml](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/render.yaml) also present). The only GitHub deployment record is Railway on `8eba991`, last status `success` at 2026-10-20T13:14:18Z ([deployments API](https://api.github.com/repos/festac-dev/devsentinel-ai/deployments)). Live responses carry `server: Vercel`.

## 3. TestSprite integration depth

**Score: 3/10.** The product calls the official CLI and documents its JSON shapes. This repository has never shown a finished TestSprite check, a PR comment, a committed portal plan, an MCP config, or a red-to-green loop.

### GitHub App check

The TestSprite app (`app.slug: testsprite`, name `TestSprite`) opened a check suite on all three pushes. Every suite is `status: queued`, `conclusion: null`, `latest_check_runs_count: 0`:

| Commit | Suite id | Created | Runs |
| --- | --- | --- | --- |
| `8eba991` | 105560724539 | 2026-10-16T18:48:31Z | 0 |
| `6d20696` | 107708773337 | 2026-10-22T07:50:40Z | 0 |
| `e73fa65` | 107766541991 | 2026-10-22T10:36:07Z | 0 |

Source: [HEAD check-suites](https://api.github.com/repos/festac-dev/devsentinel-ai/commits/e73fa656cd46308d6a25398de1f48cf5b47be5a9/check-suites), [first commit](https://api.github.com/repos/festac-dev/devsentinel-ai/commits/8eba991077c571edbd0a547dcdabaa701279a71a/check-suites), [middle commit](https://api.github.com/repos/festac-dev/devsentinel-ai/commits/6d206964a0a1582e5620295c3947269b801626c9/check-suites). Commit [status API](https://api.github.com/repos/festac-dev/devsentinel-ai/commits/e73fa656cd46308d6a25398de1f48cf5b47be5a9/status) reports `total_count: 0` (no commit statuses). There is no dashboard execution URL to cite. An empty queued suite shows the app is installed with checks permission. It does not show a test execution.

### Required check

- [Branches API](https://api.github.com/repos/festac-dev/devsentinel-ai/branches): `main.protected` is `false`.
- `GET /repos/festac-dev/devsentinel-ai/branches/main/protection` returned **403** (`Resource not accessible by integration`).
- [Rulesets API](https://api.github.com/repos/festac-dev/devsentinel-ai/rulesets) returned `[]`.
- No PR exists, so there is no blocked-merge evidence. TestSprite is not shown as a required check.

### CLI

- Runtime: the worker resolves `node_modules/.bin/testsprite` or `TESTSPRITE_CLI_PATH` and runs documented commands ([provider.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/modules/testsprite/provider.ts), research notes in [docs/testsprite-integration.md](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/docs/testsprite-integration.md)).
- CI does **not** run `testsprite test run` / `test create` against the live app. The only CLI invocation in [ci.yml](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/.github/workflows/ci.yml) is a version assertion inside the Docker image (`=== 0.14.0`), which passed on [docker job 119775889240](https://github.com/festac-dev/devsentinel-ai/actions/runs/39764323363/job/119775889240).
- Integration test [testsprite-cli.test.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/integration/testsprite-cli.test.ts) (6 cases) drives that real binary against a **local stub** of the CLI HTTP API. It is included in the 167 passing Vitest tests on [checks job 119775889549](https://github.com/festac-dev/devsentinel-ai/actions/runs/39764323363/job/119775889549).
- Playwright sets `TESTSPRITE_CLI_PATH` to [fake-testsprite.cjs](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/e2e/fixtures/fake-testsprite.cjs) ([playwright.config.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/playwright.config.ts)). The E2E file header states no real TestSprite execution happens there.

### MCP

No MCP config, no `@modelcontextprotocol` dependency, no `/api/mcp` route. Live `GET /api/mcp` is **404** (`x-matched-path: /_not-found`) at https://devsentinel-ai-festac.vercel.app/api/mcp (observed 2026-10-23).

### Plans committed

**0** TestSprite plan files in git. The adapter writes a temporary plan at run time from `testPlanSteps` stored on the project ([provider.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/modules/testsprite/provider.ts), [projects.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/app/actions/projects.ts)). The README checklist box “TestSprite suite generated in the 3.0 portal” is checked ([README lines 321–327](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/README.md)) and is not backed by a plan file, a PR, or a check run.

### Triage, schedules, red→green, credits

- No PR comments, no issues, no auto-fix bot, no failure classifier.
- No nightly or on-merge TestSprite workflow. The only workflow is push/PR CI ([ci.yml](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/.github/workflows/ci.yml)). [Actions](https://github.com/festac-dev/devsentinel-ai/actions): 3 runs, all `push` to `main`.
- No red→green TestSprite loop (no PRs, no check runs with counts).
- Credits: nothing in the repo records a TestSprite credit balance or a live credit error. UNVERIFIED.

## 4. Test inventory

Local `npm test` was **not run**. The review environment has no PostgreSQL and no Docker; Vitest’s integration files require `TEST_DATABASE_URL` ([vitest.config.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/vitest.config.ts), [testdb.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/integration/helpers/testdb.ts)). Counts below are `it`/`test` calls in the tree at `e73fa65`, matched to CI on that SHA.

| Layer | Claimed | Verified count | Evidence | Status |
| --- | --- | --- | --- | --- |
| Vitest unit | part of “73” | **118** across 13 files under [tests/unit](https://github.com/festac-dev/devsentinel-ai/tree/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/unit) | Same SHA CI: **167 passed (21 files)** on [job 119775889549](https://github.com/festac-dev/devsentinel-ai/actions/runs/39764323363/job/119775889549) | Claimed total FALSE; execution VERIFIED |
| Vitest integration (Postgres in CI) | part of “73” | **49** across 8 files under [tests/integration](https://github.com/festac-dev/devsentinel-ai/tree/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/integration) | Included in the same 167. First commit CI was already **138 passed / 19 files** ([job 117139259833](https://github.com/festac-dev/devsentinel-ai/actions/runs/38950169708/job/117139259833)). The number 73 does not appear in the repo | FALSE as a count |
| Playwright `pr-flow.spec.ts` | 4 scenarios, all pass, tampered webhook 401 | **4**, all passed on HEAD | [pr-flow.spec.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/e2e/pr-flow.spec.ts) cases at lines 72, 154, 197, 210. Log: 4 passes including “bad webhook signatures are rejected” on [e2e job 119775889161](https://github.com/festac-dev/devsentinel-ai/actions/runs/39764323363/job/119775889161). Stack script runs `npx next build` then `next start` ([start-stack.sh](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/e2e/start-stack.sh)) | VERIFIED for these 4 |
| Playwright rest of suite | (submission says 4 total) | **10** more: 6 in [delivery.spec.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/e2e/delivery.spec.ts), 4 in [seeded-flows.spec.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/e2e/seeded-flows.spec.ts) | HEAD e2e: **13 passed, 1 failed**. Failure: `seeded-flows.spec.ts:67` `page.waitForURL` timeout 180000ms, same failure on the previous run ([job 119705759527](https://github.com/festac-dev/devsentinel-ai/actions/runs/39743364124/job/119705759527)). That case passed in 1.1s on the 2026-10-16 run ([job 117139260091](https://github.com/festac-dev/devsentinel-ai/actions/runs/38950169708/job/117139260091), **8 passed**) | “All pass” is FALSE on HEAD |
| TestSprite portal plans | README checklist checked | **0** files, **0** check runs | See section 3 | FALSE |
| Live TestSprite PR check | README checklist checked; submission says none | **0** PRs, **0** runs | [pulls](https://github.com/festac-dev/devsentinel-ai/pulls), check-suites above | “None yet” VERIFIED; checklist FALSE |

HEAD CI overall is **failure** because of that one Playwright test: [run 39764323363](https://github.com/festac-dev/devsentinel-ai/actions/runs/39764323363) (`checks` success, `docker` success, `e2e` failure). Lint, typecheck, migrate, migration-drift, and `next build` completed inside the successful checks job.

## 5. Claim verification

Submission claims supplied for this review, plus the README checklist that contradicts them.

| Claim | Verdict | Evidence |
| --- | --- | --- |
| HMAC-SHA256 webhook verification on the raw body | VERIFIED | [webhook.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/modules/github/webhook.ts) `createHmac("sha256", secret).update(rawBody, "utf8")` before JSON parse in [route.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/app/api/webhooks/github/route.ts). Unit cases in [webhook.test.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/unit/webhook.test.ts). Live unsigned POST and bad `sha256=` POST both returned **401** `invalid_signature` (secret is set; a missing secret would be 503). Wrong content-type returned **415**. https://devsentinel-ai-festac.vercel.app/api/webhooks/github observed 2026-10-23. |
| Delivery-ID dedup | VERIFIED | Unique `deliveryId` and reprocess-only-when-status-is-`error` in [route.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/app/api/webhooks/github/route.ts); schema unique in [schema.prisma](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/prisma/schema.prisma); integration cases in [webhook-route.test.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/integration/webhook-route.test.ts), included in the 167 CI passes. Not exercised live (a valid signature would be required). |
| SSRF: loopback, private, link-local, metadata, including DNS and redirects | VERIFIED (implementation + unit predicates) | [ssrf.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/modules/monitoring/ssrf.ts) blocks those ranges, `169.254.169.254`, `metadata.google.internal`, decimal/octal/hex spellings, and revalidates redirects (max 4). [checker.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/modules/monitoring/checker.ts) `lookupGuarded` refuses the connect if any resolved address is forbidden. [ssrf.test.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/unit/ssrf.test.ts) (11 cases) covers the predicates and redirect targets. No test performs a live DNS lookup. |
| scrypt password hashing | VERIFIED | [crypto.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/lib/crypto.ts): async `scrypt`, N=16384, r=8, p=1, per-user salt. [crypto.test.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/unit/crypto.test.ts). |
| HTTP-only session cookies with idle and absolute timeouts | VERIFIED | [auth.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/lib/auth.ts): `httpOnly: true`, `sameSite: "lax"`, `secure` in production, idle **12 h** (`SESSION_IDLE_SECONDS = 60 * 60 * 12`), absolute **7 d**. Cookie value is a random token; the row id is its SHA-256. Anonymous `GET /app` is **307** to `/login` (https://devsentinel-ai-festac.vercel.app/app). |
| Cross-user isolation | VERIFIED in tests and query helpers | [ownership.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/lib/ownership.ts) filters `ownerId` and calls `notFound()`. [database.test.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/integration/database.test.ts) “never returns another user's project, run, incident, or notification”. Not reproduced against the live site (no second account was created). |
| AES-256-GCM encrypted write-only credentials | VERIFIED | `aes-256-gcm`, 12-byte IV, auth tag, versioned key in [crypto.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/lib/crypto.ts). Writes store `cipher` + `last4` only ([projects.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/app/actions/projects.ts)). Decrypt is used in the worker/provider and status publisher, not rendered. UI copy: [project page](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/app/app/projects/%5Bid%5D/page.tsx). |
| “73 Vitest unit and integration tests and 4 Playwright E2E scenarios on a production build all pass, including tampered-webhook 401” | FALSE as a whole | Vitest on this SHA is **167 passed**, not 73 ([job 119775889549](https://github.com/festac-dev/devsentinel-ai/actions/runs/39764323363/job/119775889549)). The 4 `pr-flow` scenarios, including expect 401, did pass on a `next build` server. The Playwright job as a whole is **13 passed / 1 failed**, and the workflow conclusion is failure ([run 39764323363](https://github.com/festac-dev/devsentinel-ai/actions/runs/39764323363)). |
| Playwright mocks the TestSprite CLI | VERIFIED | [playwright.config.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/playwright.config.ts) `TESTSPRITE_CLI_PATH` → [fake-testsprite.cjs](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/e2e/fixtures/fake-testsprite.cjs). |
| No PRs opened yet | VERIFIED | [pulls](https://github.com/festac-dev/devsentinel-ai/pulls) empty; repo `pullRequests.totalCount` 0. |
| README: live `/api/health/ready` is green | FALSE at review time | https://devsentinel-ai-festac.vercel.app/api/health/ready returned HTTP 200 with `"status":"degraded"`, `"worker":"stale"`, `workerHeartbeatAgeMs` **131167116** (~36.4 h; last beat ~2026-10-22T09:14Z), `role: web`, database ok. Body timestamp `2026-10-23T21:40:13.503Z`. `/api/health` was `{"status":"ok"}` (https://devsentinel-ai-festac.vercel.app/api/health). The ready handler treats a stale worker as HTTP 200 degraded ([ready/route.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/app/api/health/ready/route.ts)). |
| README checklist: TestSprite suite generated, GitHub App PR trigger active, PR links opened with a TestSprite comment/check | FALSE | Checked boxes in [README](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/README.md) under “owner tasks are listed, not claimed”. Zero PRs, zero check runs, zero committed plans. The parenthetical disclaimer does not match the `[x]` marks. |
| README: public repo, live URL reachable | VERIFIED | Public repo; homepage HTTP 200, title `DevSentinel AI` (https://devsentinel-ai-festac.vercel.app/). |
| README: graphical PDF walkthrough `devsentinel-ai-deployment-guide.pdf` | FALSE | File not in the tree; [contents API 404](https://api.github.com/repos/festac-dev/devsentinel-ai/contents/devsentinel-ai-deployment-guide.pdf). |
| “Genuine TestSprite runs” in production | UNVERIFIED | Adapter code is real. Live worker heartbeat is stale, so the queue is not being consumed. No check run, status, or dashboard execution was found. E2E uses the mock CLI. |

## 6. Code quality

Strong for a hackathon tree (~14.2k lines of TS/TSX under `src` and `tests` at HEAD). `strict: true` ([tsconfig.json](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tsconfig.json)). ESLint is `eslint-config-next` plus core-web-vitals ([eslint.config.mjs](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/eslint.config.mjs)); CI runs lint and `tsc --noEmit` and both passed on HEAD inside [job 119775889549](https://github.com/festac-dev/devsentinel-ai/actions/runs/39764323363/job/119775889549). CI also runs Postgres 17, `prisma migrate deploy`, and `prisma migrate diff --exit-code`. CSP is nonce-based in [proxy.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/proxy.ts) (Next 16’s middleware rename) and was present on live responses, with HSTS, `X-Frame-Options: DENY`, `nosniff`, and a locked-down Permissions-Policy ([next.config.mjs](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/next.config.mjs)). CSRF is an Origin/host check, not a double-submit token ([csrf.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/lib/csrf.ts)).

Smells:

- `main` is red. The seeded-incident Playwright test passed on 2026-10-16 and timed out on both 2026-10-22 runs after the delivery-tracker commit.
- E2E sets `DEVSENTINEL_E2E_SKIP_REPO_PROOF` to a string that disables repository-access proof ([playwright.config.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/playwright.config.ts)). The suite never proves the GitHub installation check.
- [BUG-FIXES.md](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/BUG-FIXES.md) cites commits `071a416` and `526ff68` and branch `buildful/review-these-two-repos-27fb70`. Public history has only the three SHAs above, so that narrative is not traceable.
- Readiness “migrations: applied” is `user.findFirst()` succeeding, so it does not prove the 2026-10-22 delivery migration is on the live database ([ready/route.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/app/api/health/ready/route.ts)).
- scrypt N=16384 is the code’s own parameter; OWASP’s interactive guidance is higher. The claim “uses scrypt” still holds.
- Submission checklist boxes are checked for events the GitHub API does not show.
- Three squashed commits. No PR review record.

No committed production secrets turned up. `.env.example` has empty `ENCRYPTION_KEY`. Test keys are fixtures (`sk-user-e2e-mock-key-…`, local `whsec_e2e_local`).

## 7. Live-site behavior

Observed 2026-10-23 against https://devsentinel-ai-festac.vercel.app/. First homepage fetch was HTTP 200 in ~2.3s (cold); later HTML routes were ~0.07–0.33s. `x-vercel-cache: MISS` on these probes. Security headers listed in section 6 were on the responses.

| Route | Result |
| --- | --- |
| `/` | 200, title `DevSentinel AI`, landing copy about SHA-bound TestSprite runs |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | 200 |
| `/app`, `/app/runs`, `/app/projects`, `/app/monitoring`, `/app/integrations`, `/app/settings`, `/app/notifications`, `/app/incidents`, `/app/deployments`, `/app/pull-requests` | **307** `location: /login` (routes exist; session required) |
| `/app/delivery`, `/app/delivery/report`, `/api/delivery/report` | **404** `x-matched-path: /_not-found` |
| `/api/health` | 200 `{"status":"ok","service":"devsentinel-ai"}` |
| `/api/health/ready` | 200 degraded, worker stale (section 5) |
| `POST /api/webhooks/github` unsigned or bad signature | 401 `invalid_signature` |
| `POST` with `text/plain` | 415 |
| `GET /api/webhooks/github` | 405 |
| `/does-not-exist-xyz`, `/api/does-not-exist`, `/api/mcp` | 404 |

The delivery routes exist in HEAD ([page](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/app/app/delivery/(overview)/page.tsx), [report route](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/app/api/delivery/report/route.ts)) and were added in `6d20696` (`git diff --stat 8eba991 e73fa65` is +5119 lines, almost all delivery tracker). They are not in the live build. Older `/app/*` routes are. GitHub’s only deployment object is Railway for `8eba991`. Vercel check suites on all three commits are also `queued` with 0 runs, so the serving SHA is not recorded on the commit. Forms were not submitted; registration would write a user and can send mail.

What works: marketing site, auth wall, health, webhook rejection when the secret is configured. What is down or missing: worker (no live TestSprite/monitoring loop), delivery tracker UI, any visible TestSprite result.

## 8. Demo

No video and no PDF in the repo. [docs/demo-guide.md](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/docs/demo-guide.md) is a ~3 minute script (register, connect a repo, open a PR, show staleness, show monitoring) and tells the presenter to label seed data as “Simulated demonstration”. Length of an actual recording: unknown, because none was found.

## 9. Weaknesses / risks for judges

- The hackathon artifact they need (a PR during the window with a TestSprite check) is absent. The app install only left empty queued suites.
- README checklist is checked for that missing PR, for a portal suite, and for a green ready check. Judges who trust the README will be looking at claims the API and the live ready endpoint contradict.
- The headline “73 tests all pass” does not match CI (167 Vitest passes; Playwright 13/14; workflow red).
- Production cannot finish the advertised loop today: worker heartbeat is ~36.4 h stale, and Vercel is `APP_ROLE=web`, which never runs the worker.
- E2E “TestSprite” is a mock. The real CLI is tested only against a stub.
- Delivery-tracker work from 2026-10-22 is not what the live URL is serving, and it is the change that lines up with the Playwright regression.
- `BUG-FIXES.md` points at commits that are not in this repo.
- No demo recording.

## 10. Where it beats Ninety

Ninety: https://github.com/mohamedwael201193/ninety , live https://ninety-coral.vercel.app . Ninety is ahead on TestSprite-as-a-gate (PR checks with counts, committed plans, CLI workflow, red→green notes). DevSentinel is ahead on these product controls:

1. **SSRF-hardened outbound monitoring.** DNS lookup refuses forbidden answers before connect, redirects are revalidated, and metadata/link-local/private/loopback plus odd IP spellings are blocked ([ssrf.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/modules/monitoring/ssrf.ts), [checker.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/modules/monitoring/checker.ts), [ssrf.test.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/unit/ssrf.test.ts)). Ninety has no outbound URL monitor. Matching it means a fetch path that resolves, classifies, and re-checks redirects before any socket.
2. **Raw-body HMAC webhook plus delivery-id dedup that reprocesses a failed delivery instead of swallowing GitHub’s retry.** Live 401s and CI coverage, including the Playwright case on a production build ([route.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/app/api/webhooks/github/route.ts), [e2e job](https://github.com/festac-dev/devsentinel-ai/actions/runs/39764323363/job/119775889161)). Ninety has no GitHub webhook receiver. Matching it means a signature check on the raw bytes, a unique delivery id, and a test that a bad signature is 401.
3. **Commit binding and staleness, plus encrypted write-only credentials and session timeouts.** Runs keep the SHA they tested; a moved PR head marks older runs stale ([run-status.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/modules/runs/status.ts), Playwright case in [pr-flow.spec.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/e2e/pr-flow.spec.ts)). Credentials are AES-256-GCM and the UI stores last-4 only ([crypto.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/lib/crypto.ts)). Sessions are httpOnly with a 12 h idle and 7 d absolute limit ([auth.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/lib/auth.ts)). Ninety is accountless on purpose. Matching these means an account system, a secret box, and a rule that a result for commit A cannot be displayed as the result for commit B.

TestSprite technique Ninety does not have: an in-process call to the pinned Node CLI `@testsprite/testsprite-cli@0.14.0`, plus an integration test that executes that binary against a local stub and asserts the merged create envelope, the flat run payload, the string `summary` on `test result`, and exit codes ([provider.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/modules/testsprite/provider.ts), [testsprite-cli.test.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/tests/integration/testsprite-cli.test.ts)). Statuses DevSentinel publishes use context `devsentinel/testsprite` and are documented as DevSentinel’s own check ([publish.ts](https://github.com/festac-dev/devsentinel-ai/blob/e73fa656cd46308d6a25398de1f48cf5b47be5a9/src/modules/github/publish.ts)). Ninety already has the piece DevSentinel lacks: real TestSprite check runs on PRs with pass/fail counts.

## 11. Estimated judging scores

| Criterion | Score | Why |
| --- | --- | --- |
| Problem value | 6 | SHA-bound PR testing, incidents, and monitored deploys are a coherent ops product. Much of the TestSprite half duplicates the portal’s own GitHub App, which this repo never shows firing. |
| TestSprite depth | 3 | Pinned official CLI, a real-binary stub test, and an installed app that has produced 0 runs. No PR check, no MCP, no committed plans, no schedule, no triage, E2E mock. |
| Verifiability | 5 | Security behavior is in code and in CI, and the live webhook returns 401. The test-count claim, the checklist, the green-ready claim, and the PDF claim do not match the evidence. `main` is red. |
| Polish | 6 | Typed, linted, CSP, honest 401/415/503 boundaries, Postgres drift check. Live worker is stale, delivery UI 404s, and CI fails. |
| Demo | 1 | Script only. |
| **Overall** | **4** | Serious security and adapter code, and a weak hackathon submission: no TestSprite result on a PR, a contradictory checklist, a wrong test total, and a production worker that is not running. |
