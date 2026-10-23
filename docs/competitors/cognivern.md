# Cognivern

| | |
|---|---|
| **Name** | Cognivern |
| **Author** | thisyearnofear |
| **Repo** | https://github.com/thisyearnofear/cognivern |
| **Live** | https://cognivern.vercel.app/ (same Vercel etag as https://cognivern.persidian.com/) |
| **API** | https://api.cognivern.persidian.com/ (`GET /health`) |
| **TestSprite PR** | https://github.com/thisyearnofear/cognivern/pull/42 (merged 2026-10-22) |
| **Demo** | none for Season 4 |
| **Review date** | 2026-10-23 |
| **Reviewer model** | Grok 4.7 |

HEAD at review: `fdafd171793822ddd0cbca8479f81cafff56bc59`.

## What it is

Cognivern is an economic control plane for agentic work: a business defines a mandate, an agent proposes a spend, policy evaluates it, a wallet executes, and an audit trail records the evidence. The agent is not supposed to hold the key. On that substrate the repo also ships confidential policy evaluation (Fhenix / CoFHE), Canton sealed-bid vendor selection, x402/Telegraph, 0G and Filecoin anchors, Dynamic MPC, KeeperHub, Cleanverse, and Flare. The user is an operator who wants bounded agent spend, plus a set of hackathon-rail demos. The product is live. The story is wide: several prior hackathon submissions sit in `docs/history/` beside the Season 4 testing write-up.

Sources: [README.md](https://github.com/thisyearnofear/cognivern/blob/main/README.md), [docs/TESTING.md](https://github.com/thisyearnofear/cognivern/blob/main/docs/TESTING.md), [docs/history/TESTSPRITE_S4_SUBMISSION.md](https://github.com/thisyearnofear/cognivern/blob/main/docs/history/TESTSPRITE_S4_SUBMISSION.md).

## Architecture

TypeScript monorepo (pnpm 9.15.0). Frontend is Next.js `^16.4.3` / React `19.2.4` in [src/frontend/package.json](https://github.com/thisyearnofear/cognivern/blob/main/src/frontend/package.json), deployed on Vercel ([vercel.json](https://github.com/thisyearnofear/cognivern/blob/main/vercel.json)). `cognivern.persidian.com` and `cognivern.vercel.app` returned the same etag `a681d7c3a6fe37ab317158f3c61664d4` with `server: Vercel` on 2026-10-23. Backend is Express on a Ubuntu VPS (`nginx/1.24.0`, PM2) at `api.cognivern.persidian.com`. Persistence is better-sqlite3 plus optional Mongo. Drizzle checks the schema in CI. Contracts are Solidity/CoFHE under `contracts/fhenix/` and Daml under `daml/`.

| Piece | Path |
|---|---|
| Public-path contract the suite polices | [src/backend/middleware/publicEndpoints.ts](https://github.com/thisyearnofear/cognivern/blob/main/src/backend/middleware/publicEndpoints.ts) |
| API module and controllers | [src/backend/modules/api/](https://github.com/thisyearnofear/cognivern/tree/main/src/backend/modules/api) |
| PM2 cap (1536M after iter 33) | [config/ecosystem.config.cjs](https://github.com/thisyearnofear/cognivern/blob/main/config/ecosystem.config.cjs) |
| CoFHE client | [src/backend/services/blockchain/FhenixPolicyService.ts](https://github.com/thisyearnofear/cognivern/blob/main/src/backend/services/blockchain/FhenixPolicyService.ts) |
| App routes | `src/frontend/src/app/` — landing, `/procure`, `/dashboard`, `/sealed-bid`, `/governance/check`, `/audit`, `/os`, `/verify`, `/sponsor` |
| Rail map | [docs/ARCHITECTURE_RAILS.md](https://github.com/thisyearnofear/cognivern/blob/main/docs/ARCHITECTURE_RAILS.md) |

Cloudflare Workers Builds also runs on the repo and is failing on HEAD ([Workers Builds failure](https://github.com/thisyearnofear/cognivern/runs/120516228454)). The public API answered from nginx, so the live API is the VPS, not that Worker.

## TestSprite integration depth

**Depth score: 6 / 10.** The suite is real, committed, aimed at production, and wired into GitHub Actions on every PR and every push to `main`. A multi-agent loop log records defects the suite found. What is missing for a higher score: no TestSprite GitHub App check, the Actions check is not a required merge gate, the workflow has **zero** successful runs in the recent history, there is no cron, and there is no failure-triage bot.

### GitHub App

No TestSprite App check. On HEAD `fdafd17`, check-runs for the TestSprite job use app slug `github-actions` ([run 39983108941](https://github.com/thisyearnofear/cognivern/actions/runs/39983108941)). PR #42 comments are Vercel, Qodo (billing paused), and CodeRabbit (skipped, fewer than 10 stars). No TestSprite bot comment. The repo’s own checklist still has “GitHub App installed” unchecked: [TESTSPRITE_S4_SUBMISSION.md](https://github.com/thisyearnofear/cognivern/blob/main/docs/history/TESTSPRITE_S4_SUBMISSION.md). Repo `.mcp.json` is KeeperHub, not TestSprite.

### Is it a required check?

**No.** `GET /repos/thisyearnofear/cognivern/rulesets` returned `[]`. `GET /repos/thisyearnofear/cognivern/branches/main/protection` returned **403**. Positive evidence it does not block: [PR #42](https://github.com/thisyearnofear/cognivern/pull/42) merged at `2026-10-22T15:55:44Z` while [TestSprite run 39808897365](https://github.com/thisyearnofear/cognivern/actions/runs/39808897365) was still running (started 15:52:32Z, failed 16:01:17Z). The same PR’s CI jobs `Backend tests` and `Integration tests` were already `FAILURE` at merge time ([CI run 39808896371](https://github.com/thisyearnofear/cognivern/actions/runs/39808896371)). The submission checklist item “Blocking PRs enabled” is still unchecked.

### CLI

[`.github/workflows/testsprite.yml`](https://github.com/thisyearnofear/cognivern/blob/main/.github/workflows/testsprite.yml): `pull_request` to `main`, `push` to `main`, `workflow_dispatch`. Installs `@testsprite/testsprite-cli` unpinned. Hard-fails if `TESTSPRITE_API_KEY` is empty. Lists tests for project `8be1ec9e-a2c5-484a-8a2e-422b87832028` and runs them **one id at a time** (`testsprite test run <id> --wait --timeout 300`) because a parallel `--all` was 502/429ing the single VPS. On failure it uploads `.testsprite/runs/` for 7 days with `include-hidden-files: true`.

Recent conclusions (all `failure`):

| When | Event | Result | Link |
|---|---|---|---|
| 2026-10-23 HEAD | push | 17 `status passed`, 3 `status failed` (HTTP 429), plus test `c7c74656-…` did not pass because a run was already in progress. Job failed. | [run 39983108941](https://github.com/thisyearnofear/cognivern/actions/runs/39983108941) |
| 2026-10-22 PR #42 | pull_request | **14 passed / 7 failed**, every failure HTTP 429, including sealed-bid id `e47da192-…` | [run 39808897365](https://github.com/thisyearnofear/cognivern/actions/runs/39808897365) |
| 2026-10-22 cofhe fix push | push | job failed (suite executed ~7 min) | [run 39808287225](https://github.com/thisyearnofear/cognivern/actions/runs/39808287225) |
| 2026-10-21 and earlier (sample) | push | ~13–18s, CLI `AUTH_REQUIRED`, suite did not execute | [run 39599417666](https://github.com/thisyearnofear/cognivern/actions/runs/39599417666) |

`gh run list --workflow testsprite.yml --status success` returned no runs. The last 30 listed runs, back to 2026-09-21, are all failures. Execution URLs inside the Oct 22–23 logs point at dashboard project **`a80eb463-21a1-47fa-92c2-b1074aa165f2`**, while the workflow env and [`.testsprite/config.json`](https://github.com/thisyearnofear/cognivern/blob/main/.testsprite/config.json) still say **`8be1ec9e-a2c5-484a-8a2e-422b87832028`**. Example failed sealed-bid execution from the PR #42 job: [execution 116760d8 / test fe7b1cca](https://www.testsprite.com/dashboard-v3/o/460a22bb-09d9-59b2-b2ec-2e49ab4773c6/projects/a80eb463-21a1-47fa-92c2-b1074aa165f2/execution/116760d8-9b76-47bf-8c5d-f42875f89ff6/test/fe7b1cca-389b-4e19-8a8e-7725e32ed769) (`expected 200/201, got 429`).

### MCP

Iter 22 says Devin used the TestSprite MCP server to generate the frontend suite. The committed report is dated **2026-07-01** and names MCP project `e82a0a8d-a5c5-4f3a-9ead-f3b9f6a37214`: [testsprite-mcp-test-report.md](https://github.com/thisyearnofear/cognivern/blob/main/src/frontend/testsprite_tests/testsprite-mcp-test-report.md), dashboard https://www.testsprite.com/dashboard/mcp/tests/e82a0a8d-a5c5-4f3a-9ead-f3b9f6a37214. Config now lists a different frontend project id, `ea66de39-f1f5-4a40-98ad-fdf4e6c31fcd`. There is no TestSprite server in the repo MCP config.

### Plans and code in git

- Backend: **21** Python modules in [`.testsprite/tests/`](https://github.com/thisyearnofear/cognivern/tree/main/.testsprite/tests). They call the live API and use TestSprite-injected globals (`__AUTH_CREDENTIAL__`), so they are not standalone pytest.
- Frontend: **30** `TC0xx_*.py` Playwright scripts in [src/frontend/testsprite_tests/](https://github.com/thisyearnofear/cognivern/tree/main/src/frontend/testsprite_tests). The plan JSON in that folder has **41** cases (`TC001`–`TC041`); scripts exist only through `TC030`.
- Run bundles: `.testsprite/runs/` is gitignored. The docs say eleven failed bundles exist only on the machine that ran them and in 7-day CI artifacts.

### Triage, schedules, credits

Failure handling is the artifact upload step. No TestSprite PR comment, no auto-fix bot, no issue ledger. No `cron` in `.github/workflows/`. No TestSprite credit-usage notes in the docs read for this review.

### Red → green loops

[LOOP.md](https://github.com/thisyearnofear/cognivern/blob/main/docs/history/LOOP.md) is a hand-written log. Early iterations cite an 8-character test id and no run URL. The only iteration tied to a PR and an Actions run is iter 33, and that Actions run is red (14/21, 429s), including the sealed-bid id the log calls green. Iter 29–30 claim a portal batch of 12/21 then 17/21 on dashboard https://www.testsprite.com/dashboard/tests/8be1ec9e-a2c5-484a-8a2e-422b87832028 with no Actions run id. Those portal pages were not re-authenticated for this review.

## Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
|---|---|---|---|---|
| TestSprite backend modules | 21 across 13 domains | 21 `.py` files. 13 is the grouping in TESTING.md (health, governance, auth, authenticated surface, workspace/audit, spend, metrics, sealed bid, MCP/agents, intent/projects, FHE, OWS, speech) | [`.testsprite/tests/`](https://github.com/thisyearnofear/cognivern/tree/main/.testsprite/tests), [TESTING.md](https://github.com/thisyearnofear/cognivern/blob/main/docs/TESTING.md) | **VERIFIED** (file count and the doc’s grouping) |
| TestSprite backend, latest CI | not in the post; LOOP iter 30 says 17/21 | 2026-10-23 job: 17 passed, 4 did not pass (3×429, 1 already-running). PR #42 job: 14 passed, 7 failed, all 429 | [39983108941](https://github.com/thisyearnofear/cognivern/actions/runs/39983108941), [39808897365](https://github.com/thisyearnofear/cognivern/actions/runs/39808897365) | **VERIFIED** for these runs. Iter 30’s 17/21 is **UNVERIFIED** (no run id) |
| TestSprite frontend Playwright | 30 tests, 11 pass / 8 fail / 11 blocked | 30 scripts. Same report’s per-test rows sum to **13 passed, 7 failed, 10 blocked**. Summary line still says 11/8/11. Plan JSON has 41 cases | [report](https://github.com/thisyearnofear/cognivern/blob/main/src/frontend/testsprite_tests/testsprite-mcp-test-report.md) (dated 2026-07-01) | Count of scripts **VERIFIED**. The 11/8/11 split is **FALSE** against that report’s own rows |
| Vitest backend (unit + integration via `pnpm vitest run`) | LOOP cites 246/246 (iter 28), 96/96 (iter 32), 31/31 (iter 24) | Last green CI, 2026-10-22 `f2e34a7`: **841 passed, 5 skipped** (112 files passed, 1 skipped) | [CI run 39812098823](https://github.com/thisyearnofear/cognivern/actions/runs/39812098823) job Backend tests | **VERIFIED** for that commit. Older LOOP totals are stale |
| Vitest frontend | not in the post | **166 passed** (22 files) on the same green CI | same run, job Frontend tests | **VERIFIED** |
| Vitest integration job | Canton file “4 invariants” in LOOP | Separate job: **66 passed, 5 skipped**. Those tests are included in the 841 above (`vitest.config.ts` includes `tests/**/*.test.ts`) | same run, job Integration tests | **VERIFIED**; do not add to 841 |
| Playwright e2e in `tests/e2e/` | not claimed | 11 spec files, 28 `test()` calls. Not a CI job | [playwright.config.ts](https://github.com/thisyearnofear/cognivern/blob/main/playwright.config.ts) | Count **VERIFIED** in git. Not executed here |
| Hardhat | LOOP says compile clean | 2 `*.test.ts` files under `contracts/`. Not in CI | repo tree | **UNVERIFIED** execution |

**Local run:** not runnable on current HEAD. `pnpm install --frozen-lockfile` failed with `ERR_PNPM_OUTDATED_LOCKFILE` because root `package.json` has `next: ^16.4.3` and `pnpm-lock.yaml` still pins `next: 16.3.0`. That is the same error that fails every job in [CI run 39983108968](https://github.com/thisyearnofear/cognivern/actions/runs/39983108968) (2026-10-23). No `node_modules` left behind. The Python TestSprite modules need the TestSprite runner and injected auth globals, so they were not executed as pytest.

## Claim verification

| Claim | Verdict | Evidence |
|---|---|---|
| 33 recorded test-and-fix iterations | **VERIFIED** as 33 numbered entries (iter 1–33) in [LOOP.md](https://github.com/thisyearnofear/cognivern/blob/main/docs/history/LOOP.md). The file also has sub-iterations 2b, 2c, 2d (36 `^- iter` lines) | same file |
| …against real defects | **FALSE** as a description of all 33. The log’s own summary says 16 bugs. Many lines are first-pass greens (1, 3, 4, 6, 12, 13), contract refactors (24–27), docs, or a UX pass (32) | [LOOP.md summary](https://github.com/thisyearnofear/cognivern/blob/main/docs/history/LOOP.md) |
| Seven of the first 11 exposed public API contract drift (401s, 404s) | **VERIFIED** as a reading of numbered iters 2, 5, 7, 8, 9, 10, 11 (policies 401, `/auth/*` blocked, ux-events, `/fhenix/encrypt`, parameterized `/projects/:id`, sealed-bid subpaths, `/mcp/governance-check`). Sub-iteration 2c is an extra 404 (`/api/spendos/status`). Original failure bundles are gitignored. Code still has the list and parameterized `isPublicApiPath()`. Live on 2026-10-23: `GET /api/governance/policies` is **200**; `GET /api/spendos/status` is still **404** while `/spendos/status` remains in `PUBLIC_API_PATHS`. TESTING.md’s aside that calls iter 5 “unrelated” contradicts its own table (iter 5 is also the auth-list fix) | [LOOP.md](https://github.com/thisyearnofear/cognivern/blob/main/docs/history/LOOP.md), [publicEndpoints.ts](https://github.com/thisyearnofear/cognivern/blob/main/src/backend/middleware/publicEndpoints.ts), [commit 76ba599](https://github.com/thisyearnofear/cognivern/commit/76ba599), live curls below |
| Iter 33 caught stale `@cofhe/sdk` on a removed verifier protocol, and PM2 killed the backend mid-WASM proof | **VERIFIED** in git. [commit 6437306](https://github.com/thisyearnofear/cognivern/commit/64373062f09cba172d09289cb0956f8d83289f88) moves `@cofhe/sdk` `0.5.2` → `1.0.1`, adds `.setConsumingContract`, and changes `max_memory_restart` `512M` → `1536M`. Live `GET /api/fhenix/status` returned `fhenixEnabled: true` (Arbitrum Sepolia) on 2026-10-23 | commit + live status |
| …deployed fixes and reran green | Fix is in git and the status endpoint is enabled. **“Reran green” is FALSE** on the only public rerun: PR #42’s TestSprite job failed test id `e47da192` (the id LOOP cites) with HTTP 429, 14 passed / 7 failed. The fix commit’s own Actions run also failed. No green execution URL is in the PR or LOOP.md | [run 39808897365](https://github.com/thisyearnofear/cognivern/actions/runs/39808897365), [run 39808287225](https://github.com/thisyearnofear/cognivern/actions/runs/39808287225) |
| 21 backend modules across 13 API domains, exported into the repo and run on every PR | **VERIFIED** for the 21 files, the 13-row grouping, and the workflow trigger (`pull_request` to `main` did run on PR #42 and on Dependabot PRs). Many pre-Oct-22 runs died in ~15s with `AUTH_REQUIRED` and did not execute assertions. Since 2026-10-22 the suite executes and the job fails | [testsprite.yml](https://github.com/thisyearnofear/cognivern/blob/main/.github/workflows/testsprite.yml), run list above |
| TestSprite configured as a required blocking check on `main` | **FALSE** | rulesets `[]`, branch protection 403, PR #42 merged during a still-running red check. Checklist item still open |
| 30 generated Playwright frontend tests at 11 pass, 8 fail, 11 blocked | Scripts: **VERIFIED** (30). Scoreline: **FALSE** against the same report’s rows (13 / 7 / 10). Report date 2026-07-01, before the Season 4 window. Failures the report describes are “local backend not running” | [report](https://github.com/thisyearnofear/cognivern/blob/main/src/frontend/testsprite_tests/testsprite-mcp-test-report.md) |

## Code quality

The public-path module is the best-documented piece in the repo: it explains why two middlewares drifted and which paths must stay authenticated because they move money. CI on a good commit (2026-10-22) typechecks, lints, checks Drizzle, builds the frontend, and runs a large Vitest suite ([run 39812098823](https://github.com/thisyearnofear/cognivern/actions/runs/39812098823)).

Smells a judge will hit:

- HEAD cannot install. `next` was bumped to `^16.4.3` without regenerating `pnpm-lock.yaml` (lockfile still `16.3.0`). Lint, typecheck, Vitest, frontend build, and Vercel on HEAD are red ([CI 39983108968](https://github.com/thisyearnofear/cognivern/actions/runs/39983108968), Vercel status failure on `fdafd17`).
- A credential-shaped `API_KEY` is committed under `executionArgs.envs` in `src/frontend/testsprite_tests/tmp/config.json`. Not reproduced here. Backend TestSprite modules also fall back to the literal `sapience-hackathon-key`.
- `@reineira-os/sdk` is delisted; the cofhe commit says the backend lockfile was patched by hand so a fresh resolve would fail.
- `/spendos/status` is still declared public and still 404 in production. Unknown API paths return **401** (“Authentication required”) rather than 404, so a missing route that is not on the public list looks like an auth failure.
- Eleven open Dependabot PRs (around #31–#41). CodeRabbit does not auto-review (under 10 stars). Qodo reviews are billing-blocked.
- The testing story spans many hackathons. `docs/history/` holds Canton, KeeperHub, Cleanverse, Telegraph, and Flare submissions next to the Season 4 note, which still says status “preparing” and leaves the GitHub App, blocking PRs, and Discord/X boxes unchecked.
- TestSprite project ids in config, the July MCP report, and the Oct 22–23 execution URLs are three different values.

## Live-site behavior

Checked 2026-10-23 with curl. Times are seconds.

| URL | Code | Notes |
|---|---|---|
| https://cognivern.vercel.app/ | 200 in 0.22s | Title `Cognivern — AI Agent Governance`. `x-vercel-cache` age ~29h, etag shared with persidian.com |
| https://cognivern.persidian.com/ | 200 in 0.17s | `server: Vercel`, same etag |
| https://cognivern.vercel.app/dashboard | 200 | |
| https://cognivern.vercel.app/procure | 200 | |
| https://cognivern.vercel.app/sealed-bid | 200 | |
| https://cognivern.vercel.app/governance/check | 200 | |
| https://cognivern.vercel.app/governance | 404 | Page lives at `/governance/check` |
| https://cognivern.vercel.app/audit | 200 | |
| https://cognivern.vercel.app/agents | 200 | |
| https://cognivern.vercel.app/policies | 200 | |
| https://cognivern.vercel.app/os | 200 | PromptOS |
| https://cognivern.vercel.app/runs | 307 | `location: /spend?view=runs` |
| https://cognivern.vercel.app/settings | 200 | |
| https://cognivern.vercel.app/onboarding | 200 | |
| https://cognivern.vercel.app/verify | 200 in 1.65s | Slowest page probed |
| https://cognivern.vercel.app/demo/spend | 200 | |
| https://cognivern.vercel.app/credits | 200 | |
| https://cognivern.vercel.app/sponsor | 200 | |
| https://cognivern.vercel.app/this-route-should-404 | 404 | Same HTML title as the app |
| https://api.cognivern.persidian.com/health | 200 in 0.35s | `{"status":"ok",...}`; uptime ~56348s at 21:41Z (~15.6h) |
| `/health/ready`, `/health/live` | 200 | |
| `/api/governance/policies` | 200 | `{"success":true,"data":[]}` — the iter-2 401 is gone |
| `/api/spendos/status` | 404 | `Resource not found` — still the documented gap, still listed public |
| `/api/mcp/governance-check` | 200 | Governance-check tool manifest |
| `/api/fhenix/status` | 200 in 0.58s | `fhenixEnabled: true`, chain `421614` |
| `GET /api/fhenix/encrypt` | 404 | Likely POST-only; not POSTed |
| `/api/does-not-exist` | 401 | Auth middleware answers before routing |

No forms were submitted. The cached frontend is the last good Vercel prerender, not HEAD (HEAD’s Vercel status is failure).

## Demo

No Season 4 demo. The submission file does not link a video. Older hackathon videos exist and are not this entry: Canton S3 https://youtu.be/taG9NPRzAmE (described in-repo as 1:40) and KeeperHub https://youtu.be/G3Iaku3MjR0 (described as 60s). Recorder scripts under `tooling/scripts/demo/` write gitignored mp4s.

## Weaknesses / risks for judges

- The Season 4 mechanics this repo wrote down — GitHub App on the generating account, blocking PRs, a PR whose TestSprite check is the evidence — are the items still unchecked, and the one in-window PR merged while its TestSprite job was failing.
- “Reran green” is not what the linked check shows. Judges who open PR #42 see a red TestSprite job whose sealed-bid failure is a 429 from the app’s own rate limiter.
- Frontend result is from July 2026, and the 11/8/11 headline does not match the table under it. Eleven plan cases have no script.
- Run evidence is gitignored. The durable record is a prose log that over-claims “every iteration was a real defect.”
- HEAD CI cannot install. A security bump of Next landed without a lockfile update.
- A live secret-shaped API key is in git.
- Product scope is many rails. A judge looking for one user and one proof has to pick sealed-bid or governed spend out of a large surface.
- Production rate limiting makes the CI suite flaky even after they serialized it. A red required check would block every merge; an unrequired red check is what they have.

## Where it beats Ninety

Ninety baseline: Schengen 90/180 calculator, GitHub App `TestSprite V3` (PR #62 43/43, PR #63 42/43), backend CLI gate that has gone green, 43 frontend plans and 28 Python API tests in git, no TestSprite MCP config, nightly CLI skipped, branch protection also unverified and PR #63 merged while V3 was red. https://github.com/mohamedwael201193/ninety

1. **Production contract tests against the service’s own public-path declaration.** Cognivern’s suite asserts that paths listed in `PUBLIC_API_PATHS` actually respond, and that protected paths still 401. That class produced the 401/404 loop and is still visible live (`/api/governance/policies` 200, `/api/spendos/status` 404). [publicEndpoints.ts](https://github.com/thisyearnofear/cognivern/blob/main/src/backend/middleware/publicEndpoints.ts), [TESTING.md](https://github.com/thisyearnofear/cognivern/blob/main/docs/TESTING.md). Ninety’s API tests gate preview/production behavior of a calculator. To match this, Ninety would add a declared-route manifest and fail CI when a deployed path’s status disagrees with that manifest.

2. **TestSprite MCP actually generated a committed browser suite.** 30 Playwright scripts, a 41-case plan, and an MCP report are in [src/frontend/testsprite_tests/](https://github.com/thisyearnofear/cognivern/tree/main/src/frontend/testsprite_tests). Ninety has no TestSprite MCP config. To match, Ninety would run MCP (or the portal generator) against the Vercel app, commit the scripts, and keep the pass/fail table consistent with the rows.

3. **The loop caught a live third-party protocol break plus a process killer.** `@cofhe/sdk` 0.5.2 spoke a removed `/verify` endpoint; PM2’s 512M cap SIGKILLed the Node process mid-WASM prove. Both are fixed in [6437306](https://github.com/thisyearnofear/cognivern/commit/64373062f09cba172d09289cb0956f8d83289f88), and live `/api/fhenix/status` reports FHE enabled. Ninety’s oracle watches the Commission calculator script. To match this class of find, Ninety would need a canary against a dependency whose wire protocol can change under a running deploy, and a record of the red run and the fix. Cognivern’s public rerun of that canary is still red on 429s, so the technique is ahead of the green result.

Technique Ninety does not have: a CLI workflow that refuses to pass when the API key is missing, runs tests one id at a time against production, and uploads the hidden `.testsprite/runs/` tree. Ninety’s full CLI nightly is skipped and `testsprite-smoke.yml` is disabled. Matching it means a fail-closed CLI job with failure artifacts. It does not mean copying the current red result: Cognivern has no green Actions run of that job, and Ninety’s backend CLI gate has.

Cognivern does not beat Ninety on the GitHub App check, on a green cloud browser run, on nightly differential fuzz, or on a single verifiable demo path.

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 6 | Governed agent spend is a real problem and the app is live. The repo is also a stack of hackathon rails, so the user and the proof are diffuse. |
| TestSprite depth | 6 | CLI on every PR and push, 21 modules in git, MCP-generated frontend tests, failure artifacts, a long loop. No App check, not required, no schedule, no green Actions run. |
| Verifiability | 4 | Docs name targets, ids, and gaps. The blocking-check claim and the green rerun do not survive the PR. Frontend 11/8/11 disagrees with its table. Run bundles are gitignored. Project ids drift. |
| Polish | 5 | Substantial typed app, many routes return 200, last good CI is large and green. HEAD cannot install, Vercel and Workers are red, a key is committed, one declared public route is still 404. |
| Demo | 2 | No Season 4 demo. Older hackathon videos exist and are not this submission. |
| **Overall** | **5** | Strongest testing *idea* in the set (the service must match its own public contract, on the live host). The enforcement claims a judge is asked to trust are the ones that fail. |
