# Pot (Baheet18)

- **Repo:** https://github.com/Baheet18/pot (HEAD `c851ba6d91c46b19b6a033811d7f2e7cd42ede72`, pushed 2026-10-21)
- **Live:** https://pot-navy.vercel.app/ · Telegram https://t.me/pantapotbot
- **TestSprite PRs:** [#1](https://github.com/Baheet18/pot/pull/1) (4/4), [#2](https://github.com/Baheet18/pot/pull/2) (10/14 → 12/13 → 13/13)
- **Demo:** https://youtu.be/M7CiXsdZGSQ
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7

Submission narrative used for claims: [`submission/testsprite/writeup.md`](https://github.com/Baheet18/pot/blob/main/submission/testsprite/writeup.md) (commit “TestSprite write-up: dev.to post and X thread”). Older [`README`](https://github.com/Baheet18/pot/blob/main/README.md) and [`submission/testsprite/SUBMISSION.md`](https://github.com/Baheet18/pot/blob/main/submission/testsprite/SUBMISSION.md) still describe the 4-test / 212-test story.

## What it is

Pot is a Telegram bot plus a Next.js site that turns a group-chat question into a YES/NO pot. An admin is meant to type `/new`, get a drafted market, and have members buy a side from the web page or a Solana Blink; the group gets a leaderboard and a settlement receipt. The public deployment is **practice mode**: the banner says the wallet signs a free message and no payment is sent, and group markets are Pot-hosted. The homepage also shows a **read-only** “Live on Panta” card (on 2026-10-23, a BTC all-time-high market with a link out to Panta). Live Panta writes are behind `PANTA_MODE=live` and `POT_ALLOW_LIVE_WRITES=1`. No on-chain or money action was taken in this review.

## Architecture

npm workspaces, TypeScript `strict` in all four `tsconfig.json` files. Deploy target is Vercel with root `apps/web` ([`apps/web/vercel.json`](https://github.com/Baheet18/pot/blob/main/apps/web/vercel.json): `cd ../.. && npm ci`, daily cron `0 9 * * *` → `/api/cron/settle`). About 8.6k lines under `apps/`, `packages/`, and `scripts/`.

| Piece | Role | Link |
|---|---|---|
| `apps/web` | Next.js 16.3.4, React 19.2.8, Tailwind 4. Pages: `/`, `/m/[id]`, `/blink/[id]`, `/claim/[id]`, `/create/[draftId]`, `/link`, `/leaderboard`. Wallet adapter is Phantom. | [`apps/web/package.json`](https://github.com/Baheet18/pot/blob/main/apps/web/package.json) |
| `apps/bot` | grammY bot (`/new`, `/settle`, receipts). Webhook at `/api/telegram/webhook` or local long-poll. | [`apps/bot/src/bot.ts`](https://github.com/Baheet18/pot/blob/main/apps/bot/src/bot.ts) |
| `packages/core` | Payout/royalty, drafts, receipts, share URLs, Solana Actions payloads. | [`packages/core/src/actions.ts`](https://github.com/Baheet18/pot/blob/main/packages/core/src/actions.ts) |
| `packages/server` | Panta client, practice store, buy/create/claim flows, live-write guard. Postgres (Neon) or SQLite. | [`packages/server/src/settings.ts`](https://github.com/Baheet18/pot/blob/main/packages/server/src/settings.ts) |
| Mode switch | `SANDBOX` unless `PANTA_MODE=live`. Live writes also need `POT_ALLOW_LIVE_WRITES=1`. Sandbox Action chain id is Solana devnet. | [`settings.ts` L4–L15](https://github.com/Baheet18/pot/blob/main/packages/server/src/settings.ts#L4-L15), [`route.ts` L5](https://github.com/Baheet18/pot/blob/main/apps/web/src/app/api/actions/m/%5Bid%5D/route.ts#L5) |

Panta HTTP calls are described in the [README endpoint table](https://github.com/Baheet18/pot/blob/main/README.md). `scripts/sandbox-e2e.ts` and `scripts/live-probe.mts` are manual; they are not in CI. This review did not run them.

## TestSprite integration depth

**Depth score: 5/10.** The GitHub App really ran, failed on a live UI bug, and went green on the same PR before merge, with a bot comment and screenshots. The suite is small, lives in the portal, and is **not** a required check. There is no CLI, no MCP, no schedule, and no failure-triage automation beyond the bot comment.

### GitHub App check

Context name `TestSprite V3` (commit **status**, not a GitHub Actions check run). App comment author `testsprite[bot]`.

| When | Result | Evidence |
|---|---|---|
| PR #1 head `c74d51be` (2026-10-20) | **4/4 passed** | [status on the commit](https://github.com/Baheet18/pot/commit/c74d51be766b1f3b52bd96d7ca0590ccf8070104), [execution `003980a8`](https://www.testsprite.com/dashboard-v3/o/415350c9-f7ec-5282-be9e-1aafce445cb7/projects/6f7b3451-bae0-4dd0-a8c3-10a05930615e/execution/003980a8-7c5e-47ad-9f1a-cef0996bb640), [bot comment](https://github.com/Baheet18/pot/pull/1#issuecomment-6282094885) |
| PR #2 `5dc3469c` (2026-10-21 09:03Z) | **10/14 passed · 4 failed** | [commit status](https://github.com/Baheet18/pot/commit/5dc3469c0ba3371a3fcad28d62dc63dcaec6473e), [execution `2b52161a`](https://www.testsprite.com/dashboard-v3/o/415350c9-f7ec-5282-be9e-1aafce445cb7/projects/6f7b3451-bae0-4dd0-a8c3-10a05930615e/execution/2b52161a-cde7-404d-b7ce-b38da00accb0), CI [run 39573662000](https://github.com/Baheet18/pot/actions/runs/39573662000) success |
| PR #2 `52dd5a0d` (09:22Z) | **12/13 passed · 1 failed** | [commit status](https://github.com/Baheet18/pot/commit/52dd5a0d415031101c671561051789b7ce410957), [execution `b81633f4`](https://www.testsprite.com/dashboard-v3/o/415350c9-f7ec-5282-be9e-1aafce445cb7/projects/6f7b3451-bae0-4dd0-a8c3-10a05930615e/execution/b81633f4-8e11-4b63-9231-80096eb91af7), CI [run 39576136982](https://github.com/Baheet18/pot/actions/runs/39576136982) success |
| PR #2 head `ea56c84f` (09:29Z) | **13/13 passed** | [commit status](https://github.com/Baheet18/pot/commit/ea56c84fb965d5a0d1e449a846d3a0f5e530dbd5), [execution `802b70df`](https://www.testsprite.com/dashboard-v3/o/415350c9-f7ec-5282-be9e-1aafce445cb7/projects/6f7b3451-bae0-4dd0-a8c3-10a05930615e/execution/802b70df-0e27-4205-bffb-0549b1223847), [bot comment](https://github.com/Baheet18/pot/pull/2#issuecomment-6312646389), CI [run 39577035340](https://github.com/Baheet18/pot/actions/runs/39577035340) |
| Merge `dbf62b13` (09:29:19Z) | No TestSprite status on the merge commit or on later `main` pushes | [merge commit](https://github.com/Baheet18/pot/commit/dbf62b1347ee91192b74666c1f41046f1710534e) |

The 13 green case titles, from the PR #2 comment:

1. Home page shows practice banner and primary links
2. Open a practice market from the home page
3. View market card details on the home page
4. Switch between markets and view live trading information
5. Open leaderboard from home page
6. Market page shows core betting details and quote form
7. Sample market share link opens X intent with market URL
8. Missing market shows not found card
9. Missing blink page shows not found card
10. Missing claim page shows not found state without claim controls
11. Unknown route shows home recovery not found page
12. Actions manifest maps market routes to market actions
13. Market actions endpoint returns YES and NO actions

Earlier PR #1 titles were only: open a practice market, switch markets, view market card, open leaderboard.

Dashboard execution pages returned HTTP 200 with title “TestSprite” and a login shell, so pass/fail counts above are from GitHub status descriptions and the bot comment, not from a readable dashboard body.

### Is the check required?

**No.** On PR #2, GraphQL `StatusContext.isRequired(pullRequestNumber: 2)` is `false` for `TestSprite V3` on the 10/14 commit, the 12/13 commit, and the 13/13 commit. The CI check run `test` is also `isRequired: false`.

- `GET /repos/Baheet18/pot/rules/branches/main` → **200 `[]`**
- `GET /repos/Baheet18/pot/rulesets` → **200 `[]`**
- `GET /repos/Baheet18/pot/branches/main/protection` → **403** Resource not accessible by integration

The empty rules list is the public “rules that apply to `main`” endpoint (classic protection and rulesets). The author merged `ea56c84f` at 09:29:19Z, 14 seconds after the success status at 09:29:05Z ([PR timeline](https://github.com/Baheet18/pot/pull/2)). They left the red SHAs unmerged. That is author discipline. GitHub was not holding the merge.

### CLI, MCP, plans, triage, schedules, credits

- **CLI:** none. The only workflow is [`.github/workflows/ci.yml`](https://github.com/Baheet18/pot/blob/main/.github/workflows/ci.yml) (`npm ci`, `npm run typecheck`, `npm test`) on `pull_request` and `push` to `main`. No `testsprite` command.
- **MCP:** no TestSprite MCP config in the repo.
- **Plans in git (prose, not executable):** [`test-plan.md`](https://github.com/Baheet18/pot/blob/main/submission/testsprite/test-plan.md) (pages, Actions, buy API, operator 401s), [`new-tests.md`](https://github.com/Baheet18/pot/blob/main/submission/testsprite/new-tests.md) (15 cases written to paste into the portal, plus reworded replacements). **0** TestSprite test files as code.
- **Triage:** bot comments on [#1](https://github.com/Baheet18/pot/pull/1#issuecomment-6282094885) and [#2](https://github.com/Baheet18/pot/pull/2#issuecomment-6312646389). The #2 comment was edited in place (created 09:27:51Z, updated 09:29:03Z); the stored body is the green 13/13 write-up, so the red comment text is gone. GitHub issues: **0**. No auto-fix bot.
- **Schedules:** no TestSprite nightly or on-merge workflow. Vercel cron is the app’s settle job, not TestSprite. Main pushes do not get a `TestSprite V3` status.
- **Credits:** no usage notes in the repo. UNVERIFIED.

### Red → green

One loop, all on [PR #2](https://github.com/Baheet18/pot/pull/2):

1. **10/14 failed** on [`5dc3469c`](https://github.com/Baheet18/pot/commit/5dc3469c0ba3371a3fcad28d62dc63dcaec6473e) — [execution `2b52161a`](https://www.testsprite.com/dashboard-v3/o/415350c9-f7ec-5282-be9e-1aafce445cb7/projects/6f7b3451-bae0-4dd0-a8c3-10a05930615e/execution/2b52161a-cde7-404d-b7ce-b38da00accb0). The write-up says one failure was the claim bug, two were bad wording, and one was a phone-width test the runner could not resize. That split is **not** in the status text. UNVERIFIED.
2. **12/13 failed** on [`52dd5a0d`](https://github.com/Baheet18/pot/commit/52dd5a0d415031101c671561051789b7ce410957) — [execution `b81633f4`](https://www.testsprite.com/dashboard-v3/o/415350c9-f7ec-5282-be9e-1aafce445cb7/projects/6f7b3451-bae0-4dd0-a8c3-10a05930615e/execution/b81633f4-8e11-4b63-9231-80096eb91af7). Status text does not name the failing case. The author says it was the unknown-claim test. The green suite does contain “Missing claim page shows not found state without claim controls.”
3. **13/13 passed** on [`ea56c84f`](https://github.com/Baheet18/pot/commit/ea56c84fb965d5a0d1e449a846d3a0f5e530dbd5) — [execution `802b70df`](https://www.testsprite.com/dashboard-v3/o/415350c9-f7ec-5282-be9e-1aafce445cb7/projects/6f7b3451-bae0-4dd0-a8c3-10a05930615e/execution/802b70df-0e27-4205-bffb-0549b1223847), then merge.

The code change that matches the claim bug is real: before [`0b0c81fe`](https://github.com/Baheet18/pot/commit/0b0c81fee0761988c633f51770d6b9cd70fc5776), the claim page rendered `ClaimPanel` with `v?.market.title ?? id` ([parent blob](https://github.com/Baheet18/pot/blob/b6c3dd59f06d6a1312637889f782604eaaa60267/apps/web/src/app/claim/%5Bid%5D/page.tsx#L11-L18)). After it, `if (!v) notFound()` ([current](https://github.com/Baheet18/pot/blob/main/apps/web/src/app/claim/%5Bid%5D/page.tsx#L12-L15)), with [`claim-page.test.ts`](https://github.com/Baheet18/pot/blob/main/apps/web/test/claim-page.test.ts) (3 tests).

On the three PR #2 runs, the TestSprite status was posted after the matching CI job had started (CI ~09:00/09:20/09:26Z, TestSprite ~09:03/09:22/09:29Z). A configured “wait for CI” dependency was not visible in git. UNVERIFIED as a setting; the timestamps line up.

## Test inventory

| Layer | Claimed | Verified | Evidence | Status |
|---|---|---|---|---|
| Vitest unit | 219 in the write-up; 212 / 19 files in README and SUBMISSION.md | **219 passed / 21 files** on merge CI and locally | [CI run 39577350820](https://github.com/Baheet18/pot/actions/runs/39577350820) log: `Test Files 21 passed`, `Tests 219 passed`. PR #1 CI [39360308983](https://github.com/Baheet18/pot/actions/runs/39360308983) was 212 / 19 files, which matches the stale README. | **VERIFIED** for 219 at HEAD. README/SUBMISSION **212 is stale** |
| TestSprite frontend | 13 browser tests on every PR | 13/13 on PR #2 head; 4/4 on PR #1; 10/14 and 12/13 on earlier PR #2 SHAs | Table in the section above | **VERIFIED** as those run counts. “13 on every PR” is **FALSE** (PR #1 was 4) |
| Portal plans | “full plan” in `test-plan.md` | 2 markdown plans, 0 executable TestSprite files | [test-plan.md](https://github.com/Baheet18/pot/blob/main/submission/testsprite/test-plan.md), [new-tests.md](https://github.com/Baheet18/pot/blob/main/submission/testsprite/new-tests.md) | Plans exist. They are not the executed suite |
| `scripts/sandbox-e2e.ts` | Manual practice e2e in the README | Not run | Would talk to Panta and sign practice messages. Skipped: no money/on-chain actions, and it needs local keys | Not runnable in this review |
| GitHub Actions | CI on every PR | 12/12 runs success (6 `pull_request`, 6 `push` to `main`). Only workflow: `CI` / job `test` | [workflow](https://github.com/Baheet18/pot/blob/main/.github/workflows/ci.yml), [run list](https://github.com/Baheet18/pot/actions) | **VERIFIED** |

**Local run (2026-10-23):** `npm ci` then `npx vitest run` in a depth-200 clone. Node v22.23.4, Vitest 3.2.7. **21 files, 219 passed, ~4s.** Expected stderr from tests that simulate Telegram and Gemini failures. `node_modules` removed afterward. `npm audit` reported 18 issues (3 critical, 1 high) in `next` (`next/og` ImageResponse RCE), `tinypool` / `@vitest/mocker`, and `vite` (Windows `launch-editor`). No exploit attempted.

## Claim verification

| Claim | Verdict | Evidence |
|---|---|---|
| Group-chat arguments become prediction markets on Panta/Solana | **PARTIAL** | Product shape is real: bot commands, market pages, Blinks, leaderboard ([README](https://github.com/Baheet18/pot/blob/main/README.md), [home](https://pot-navy.vercel.app/)). Live group markets are practice (banner on [home](https://pot-navy.vercel.app/), `SANDBOX` in [settings.ts](https://github.com/Baheet18/pot/blob/main/packages/server/src/settings.ts#L4-L7)). Action responses advertise devnet (`X-Blockchain-Ids: solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` on [this GET](https://pot-navy.vercel.app/api/actions/m/8Yawu1vKayKBAb8rfghLfKk5QVfDv3cDExrAmHxH9jUU)). Homepage also lists read-only live Panta markets ([page.tsx](https://github.com/Baheet18/pot/blob/main/apps/web/src/app/page.tsx#L42-L57)); on 2026-10-23 one BTC card was shown. |
| Unknown `/claim/<id>` showed a claim form (200, raw id, Select Wallet) | **VERIFIED** in git history | [Pre-fix page](https://github.com/Baheet18/pot/blob/b6c3dd59f06d6a1312637889f782604eaaa60267/apps/web/src/app/claim/%5Bid%5D/page.tsx#L11-L18) always rendered `ClaimPanel`. Author’s curl note is in [new-tests.md](https://github.com/Baheet18/pot/blob/main/submission/testsprite/new-tests.md). Live today is 404: [https://pot-navy.vercel.app/claim/does-not-exist](https://pot-navy.vercel.app/claim/does-not-exist) contains “Market not found” and does not contain “Claim winnings” or “Select Wallet”. |
| TestSprite went 12/13 with the claim test failing | **12/13 VERIFIED; failing name UNVERIFIED** | [Status](https://github.com/Baheet18/pot/commit/52dd5a0d415031101c671561051789b7ce410957): “12/13 passed · 1 failed” → [execution `b81633f4`](https://www.testsprite.com/dashboard-v3/o/415350c9-f7ec-5282-be9e-1aafce445cb7/projects/6f7b3451-bae0-4dd0-a8c3-10a05930615e/execution/b81633f4-8e11-4b63-9231-80096eb91af7). The status line does not name the case. |
| Merge was blocked until green; then 13/13 and the PR merged | **13/13 and the merge VERIFIED; “blocked” FALSE** | Green status then merge: [PR #2](https://github.com/Baheet18/pot/pull/2), [execution `802b70df`](https://www.testsprite.com/dashboard-v3/o/415350c9-f7ec-5282-be9e-1aafce445cb7/projects/6f7b3451-bae0-4dd0-a8c3-10a05930615e/execution/802b70df-0e27-4205-bffb-0549b1223847). `isRequired: false` and rules-for-branch `[]` (see depth section). |
| 13 TestSprite browser tests against the live site, covering home, leaderboard, market page, X sharing, not-found pages, Blinks, claims, `actions.json`, Blink endpoints | **VERIFIED for the final 13 titles** | Titles listed above match that list. They are a TestSprite “frontend” run with screenshots in the [PR comment](https://github.com/Baheet18/pot/pull/2#issuecomment-6312646389). Base URL in the plan is https://pot-navy.vercel.app ([test-plan.md](https://github.com/Baheet18/pot/blob/main/submission/testsprite/test-plan.md)). |
| Those 13 run on every PR and block merging | **FALSE** | PR #1 was 4 tests ([execution `003980a8`](https://www.testsprite.com/dashboard-v3/o/415350c9-f7ec-5282-be9e-1aafce445cb7/projects/6f7b3451-bae0-4dd0-a8c3-10a05930615e/execution/003980a8-7c5e-47ad-9f1a-cef0996bb640)). Main pushes have no TestSprite status. The check is not required. |
| The 13 include Blink buy-API amount cases (blank, zero, negative, over-limit) and mobile layout | **FALSE** | None of the 13 green titles are amount-rejection or viewport tests. The write-up later says the phone test was removed ([writeup.md](https://github.com/Baheet18/pot/blob/main/submission/testsprite/writeup.md)). Amount rules exist as unit tests ([amount.test.ts](https://github.com/Baheet18/pot/blob/main/packages/core/test/amount.test.ts)) and in the paste-in plan, not in the green TestSprite list. The X thread in the same file repeats the amount and mobile claims. |
| First expanded run was 10/14 | **VERIFIED** | [commit `5dc3469c`](https://github.com/Baheet18/pot/commit/5dc3469c0ba3371a3fcad28d62dc63dcaec6473e), [execution `2b52161a`](https://www.testsprite.com/dashboard-v3/o/415350c9-f7ec-5282-be9e-1aafce445cb7/projects/6f7b3451-bae0-4dd0-a8c3-10a05930615e/execution/2b52161a-cde7-404d-b7ce-b38da00accb0) |
| Phone layout was 635px at 390px and was fixed with `minmax(0,1fr)` | **Code VERIFIED; the 635px live measurement is the author’s note** | [layout.ts](https://github.com/Baheet18/pot/blob/main/apps/web/src/lib/layout.ts), [layout.test.ts](https://github.com/Baheet18/pot/blob/main/apps/web/test/layout.test.ts), [new-tests.md](https://github.com/Baheet18/pot/blob/main/submission/testsprite/new-tests.md). Not re-measured in a 390px browser here. |
| 219 unit tests, CI on every PR | **VERIFIED** | [CI 39577350820](https://github.com/Baheet18/pot/actions/runs/39577350820) and local 219. Every recorded PR and `main` push has a green `CI` / `test` run (12 runs). |
| Check waits for CI, then hits the live site; fix was deployed from the branch before re-run | **Timestamps match; deploy event UNVERIFIED** | CI-then-status order above. Commit message on `ea56c84f` is “Re-run checks after deploying the fix”. No Vercel deploy log was available. Live `/claim/does-not-exist` now 404s, which matches the fix being on production. |
| `@pantapotbot` is the bot | **Page exists; replies UNVERIFIED** | https://t.me/pantapotbot returned 200, og:title `pantapotbot`. This review did not send Telegram messages. |
| README: blocking check, 4/4, 212 tests | **FALSE against HEAD and against branch rules** | [README Testing section](https://github.com/Baheet18/pot/blob/main/README.md) was not updated in the write-up commit. Same text in [SUBMISSION.md](https://github.com/Baheet18/pot/blob/main/submission/testsprite/SUBMISSION.md). |

## Code quality

The split (core / server / bot / web) is clear, and `strict` is on. CI always typechecks and runs Vitest; all 12 runs succeeded. There is no ESLint/Biome config, no coverage gate, no license file, and `scripts/secret-scan.py` is not in CI.

Smells that matter for judging:

- Docs disagree with the tree a judge will clone: README and `SUBMISSION.md` still say 4 TestSprite tests, 212 unit tests, and a blocking check.
- TestSprite cases are not in git, so the green 13 cannot be re-run from the repo. The bot comment’s red body was overwritten.
- The suite targets production, so a PR stays red until that branch is deployed (the author says this in the write-up). Preview URLs are not wired.
- `as any` is common in bot and server tests (Telegram and fetch mocks). Application `src` is cleaner.
- Unknown routes reuse the “Market not found” card ([not-found.tsx](https://github.com/Baheet18/pot/blob/main/apps/web/src/app/not-found.tsx)), which is what their TestSprite case expects and is a slightly wrong message for a random path.
- `npm audit` criticals sit in Next 16.3.4 (`next/og`) and in Vitest’s `tinypool` chain. CI does not fail on audit.

## Live-site behavior

Checked 2026-10-23 with GET/OPTIONS only. No buy, claim, create, or webhook POST.

| URL | Result |
|---|---|
| https://pot-navy.vercel.app/ | 200, title `Pot · group predictions on Panta`. Practice banner. Stats shown: 2 groups, 6 markets, 16 buys, 14 wallets, $133 “Money in (practice)”. Open practice markets include `/m/8Yawu1vKayKBAb8rfghLfKk5QVfDv3cDExrAmHxH9jUU` (Tinubu 2027) and `/m/2L6W6EQUqw2527XHCBj8iGQP6BV44jhHzKP378B2Pi3N`. “Live on Panta” showed a read-only BTC market. First hit ~2.3s, repeat ~0.9s. |
| https://pot-navy.vercel.app/leaderboard | 200. “Testing pantabot” and @Baheet0x listed, practice totals. ~100ms. |
| https://pot-navy.vercel.app/m/8Yawu1vKayKBAb8rfghLfKk5QVfDv3cDExrAmHxH9jUU | 200. YES 79% / NO 21%, pot $24, “Select Wallet”, Post on X href starts with `https://x.com/intent/post` and includes the market URL. “Get quote” is absent until a wallet is connected (matches the reworded plan). |
| https://pot-navy.vercel.app/blink/8Yawu1vKayKBAb8rfghLfKk5QVfDv3cDExrAmHxH9jUU | 200 Blink preview, practice copy. |
| https://pot-navy.vercel.app/claim/does-not-exist and `/claim/abc`, `/m/abc`, `/blink/abc`, `/m/does-not-exist`, `/blink/does-not-exist`, `/this-page-does-not-exist` | **404**, “Market not found”, “See open markets”. Claim URLs do not show a claim form. |
| https://pot-navy.vercel.app/create/does-not-exist | 200, “This create link has expired”. |
| https://pot-navy.vercel.app/link | 200, “This link expired. Send /link to @pantapotbot again.” |
| https://pot-navy.vercel.app/actions.json | 200 JSON rules for `/m/*`, `/blink/*`, and `/api/actions/**`. CORS `*`. ~1.1s. |
| https://pot-navy.vercel.app/api/actions/m/8Yawu1vKayKBAb8rfghLfKk5QVfDv3cDExrAmHxH9jUU | 200 `type:"action"`, YES/NO $2/$5/$10 links, `X-Action-Version: 2.4`, devnet `X-Blockchain-Ids`. OPTIONS from `Origin: https://dial.to` returned 200 with the same CORS headers. |
| https://pot-navy.vercel.app/api/actions/m/does-not-exist | 404 `{"code":"NOT_FOUND",...}`. |
| https://pot-navy.vercel.app/api/pot/ready | 401 `{"code":"UNAUTHORIZED"}`. |
| https://pot-navy.vercel.app/api/cron/settle | 401 `unauthorized`. |
| https://pot-navy.vercel.app/api/pot/test-data | GET 405. |
| https://pot-navy.vercel.app/api/og/does-not-exist | 200 `image/png`. |

Nothing fetched crashed. The site matches the post-fix claim behavior.

## Demo

A public YouTube video exists: oembed title “Pot: Turn any group chat argument into a prediction market, built on Panta”, author Baheet, channel https://www.youtube.com/@Baheet18, id `M7CiXsdZGSQ` (https://youtu.be/M7CiXsdZGSQ).

Length and frames are **UNVERIFIED**. YouTube’s player API and yt-dlp both returned a bot-check, so this review did not watch it. The repo script ([`submission/demo-script.md`](https://github.com/Baheet18/pot/blob/main/submission/demo-script.md)) targets about 2:30–2:55 and describes `/new`, a refusal, Phantom signing, a Blink preview, a receipt, and an explicit practice-mode caveat. `description.md` still has a `[LOOM LINK HERE]` placeholder; the YouTube URL is the one in the hackathon brief.

## Weaknesses / risks for judges

- The headline testing claim (“a PR can’t merge until TestSprite passes”) is false. Rules on `main` are empty and `isRequired` is false. Same gap as a project that merges through a red TestSprite check; Pot simply chose not to on this one PR.
- “On Panta/Solana” is the pitch. Users on the live site get practice pots and a read-only Panta card. Devnet is what Blinks advertise.
- TestSprite depth is a 13-case portal suite. Amount-rejection and mobile cases are in the blog post and not in the green run. Tests are not in the repo. Reports sit behind a login wall.
- README / `SUBMISSION.md` contradict the write-up a judge will also open.
- CI is only typecheck + unit tests. No lint, coverage, secret scan, or the sandbox e2e. Two PRs total. Zero issues.
- Bot replies, wallet signing, and the video contents were not independently exercised.

## Where it beats Ninety

Ninety baseline: https://github.com/mohamedwael201193/ninety, live https://ninety-coral.vercel.app. Ninety’s TestSprite story is larger (43 frontend plans in git, PR checks, a Python CLI gate, a red→green log) and its weaknesses include a disabled/broken CLI smoke workflow, no MCP config, and PR #63 merged while TestSprite V3 was red.

1. **A public demo video.** https://youtu.be/M7CiXsdZGSQ exists under the author’s channel (oembed). Ninety has no demo video. To match, Ninety needs a walkthrough of the calculator, the EES reconcile path, and the letter. Pot’s length and frames were not verified here.
2. **A same-PR production bug, fixed before merge.** Unknown claim links rendered a wallet form ([pre-fix source](https://github.com/Baheet18/pot/blob/b6c3dd59f06d6a1312637889f782604eaaa60267/apps/web/src/app/claim/%5Bid%5D/page.tsx)); TestSprite was red at 12/13 ([`b81633f4`](https://www.testsprite.com/dashboard-v3/o/415350c9-f7ec-5282-be9e-1aafce445cb7/projects/6f7b3451-bae0-4dd0-a8c3-10a05930615e/execution/b81633f4-8e11-4b63-9231-80096eb91af7)) and the PR merged only after 13/13 ([`802b70df`](https://www.testsprite.com/dashboard-v3/o/415350c9-f7ec-5282-be9e-1aafce445cb7/projects/6f7b3451-bae0-4dd0-a8c3-10a05930615e/execution/802b70df-0e27-4205-bffb-0549b1223847), [PR #2](https://github.com/Baheet18/pot/pull/2)). Ninety merged PR #63 while TestSprite V3 was red. To exceed Pot, Ninety keeps that don’t-merge-red habit **and** makes the check required. Pot’s own check is optional, so this is hygiene, not a stronger gate.
3. **A second surface in the same frontend run: Solana Actions.** The green 13 include `actions.json` and the market action GET ([comment](https://github.com/Baheet18/pot/pull/2#issuecomment-6312646389)); live [`/actions.json`](https://pot-navy.vercel.app/actions.json) and the [Tinubu action](https://pot-navy.vercel.app/api/actions/m/8Yawu1vKayKBAb8rfghLfKk5QVfDv3cDExrAmHxH9jUU) match. Ninety would need machine-readable endpoints (or its MCP/REST surface) asserted inside the TestSprite frontend run, not only page plans plus a separate Python suite.

Pot does not beat Ninety on test volume, plans committed as code, CLI gating, differential fuzz, or an engine oracle.

**TestSprite technique Ninety lacks:** portal frontend cases that assert non-HTML contracts (`actions.json` rules and Blink action JSON) against the **production** URL, on a PR that also recorded 10/14 and 12/13 before the green run. Ninety’s comparable gap is the opposite shape: plans and a CLI suite in git, with a red App check that still merged.

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 6 | Clear group-chat wedge, and the bot/web/Blink/receipt design is a real product. Live value is a practice pot plus a read-only Panta card. |
| TestSprite depth | 5 | App check, bot comment, a real red→green bug. Optional check, 13 portal tests, no CLI/MCP/schedule, tests not in git. |
| Verifiability | 6 | 219, 13/13, 12/13, 10/14, and 4/4 all have GitHub status links and matched a local Vitest run. The blocking claim is false, and the README contradicts the write-up. Dashboard bodies were login-walled. |
| Polish | 7 | Strict TypeScript, consistent practice banner, sensible 404s after the fix, green CI. Stale docs, no linter, audit findings. |
| Demo | 6 | Video is public and titled for the product. Length and what is actually on screen were not verifiable from here. The script in git is specific and includes the practice-mode line. |
| **Overall** | **6** | A credible hackathon product with one honest TestSprite bug story, oversold as a merge gate and as live Panta/Solana markets. |
