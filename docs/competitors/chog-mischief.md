# Chog Mischief

- **Name:** Chog Mischief
- **Author:** cipoklean
- **Repo:** https://github.com/cipoklean/chog-mischief (default branch `main`, HEAD `100a8aec84fc31941f23fdac4c1c699826614fd9`, pushed 2026-10-23)
- **Live:** https://chog-mischief.vercel.app/ · guest https://chog-mischief.vercel.app/guest
- **TestSprite PRs:** [#1](https://github.com/cipoklean/chog-mischief/pull/1) (merged 2026-10-17, final status “All 44 tests passed”), [#2](https://github.com/cipoklean/chog-mischief/pull/2) (merged 2026-10-17, final status “All 43 tests passed”). Only two PRs exist.
- **Demo:** none (no video in the repo, PR bodies, or README). `/guest` is the in-app judge path.
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7

## What it is

Chog Mischief is a daily prank game for holders of Chog Genesis, a 1,969-token NFT collection on Monad. The player connects a wallet, picks a Chog, and spends one gasless EIP-712 signature a day to prank another token; the server re-reads ownership, rolls the hit or dodge, and stores points, streaks, badges, and grudges on the token id so the record moves with the NFT. Someone with no wallet can play the same loop as a Guest Chog against practice rivals, with no database write and a reset on reload. The audience is that collection plus hackathon judges. The product is a complete small game (fairness commit, refusal rules, leaderboards), not a generic landing page. Repo: https://github.com/cipoklean/chog-mischief. Live headline: https://chog-mischief.vercel.app/.

## Architecture

Next.js 16.4.0 App Router, React 19.3.0, TypeScript 5 (`strict`), Tailwind 4 for layout, Vitest 5.0.3, Playwright 1.64, ESLint 9 (`eslint-config-next`). Wallet stack is Reown AppKit, Wagmi, and viem. Game state is Supabase. Chain reads use public Monad RPCs. Host is Vercel Hobby (`vercel.json` cron plus the Vercel GitHub deployment status). `package.json`: https://github.com/cipoklean/chog-mischief/blob/main/package.json.

| Piece | Role | Blob |
|---|---|---|
| `src/app/` | Routes: `/`, `/guest`, `/pick`, `/prank`, `/hq`, `/inbox`, `/ranks`, `/profile/[id]`, `/chog/[id]`, `/refusal-demo`, API | https://github.com/cipoklean/chog-mischief/tree/main/src/app |
| `src/game/` | Pure rules, powers, prank catalogue | https://github.com/cipoklean/chog-mischief/blob/main/src/game/rules.ts |
| `src/lib/` | SIWE session, EIP-712 intent, nonce store, fairness, chain reads | https://github.com/cipoklean/chog-mischief/blob/main/src/lib/action-signing.ts |
| `src/middleware.ts` | `/profile` → active Chog, or `/pick` when signed out. Exists because `cacheComponents` commits the status line before a streamed `redirect()` | https://github.com/cipoklean/chog-mischief/blob/main/src/middleware.ts |
| `supabase/` | Schema and migrations | https://github.com/cipoklean/chog-mischief/blob/main/supabase/schema.sql |
| `data/snapshot/chogs.json` | Committed public metadata fallback for all tokens | https://github.com/cipoklean/chog-mischief/blob/main/data/snapshot/chogs.json |
| `.github/workflows/keep-awake.yml` | Only workflow. Cron ping of `/api/cron/keep-awake`. No lint, typecheck, or test job | https://github.com/cipoklean/chog-mischief/blob/main/.github/workflows/keep-awake.yml |

55 commits. Two merged PRs, both by the author, no reviews. `SPEC.md` and `AGENTS.md` are gitignored on purpose (`.gitignore`).

## TestSprite integration depth

**Depth score: 5 / 10.** The TestSprite V3 GitHub App really ran on both PRs, posted pass counts, left a case table, and on PR #2 the status went `failure` and later `success` with “All 43 tests passed”. The suite is not in git, there is no CLI, MCP, schedule, or triage issue, the required-check claim is not API-verifiable, PR #1 posted failures as `success`, and the current production commit has no TestSprite status.

### GitHub App check

Context name `TestSprite V3`, a commit **status** from `testsprite[bot]`, not a GitHub Actions check-run. Each run posts `pending` (“N tests queued”) only after that SHA’s Vercel status is “Deployment has completed”, then a final description. The bot comment uses `<!-- testsprite-v3-marker -->` and is edited in place, so only the last result remains in the thread. Dashboard URLs return HTTP 200 with a login shell (title “TestSprite”); counts below are from the GitHub status text and the comment table, not from the dashboard body.

| When (UTC) | PR / SHA | GitHub status | Execution |
|---|---|---|---|
| 2026-10-17 01:46:09 | [#1](https://github.com/cipoklean/chog-mischief/pull/1) [`ac27bc8`](https://github.com/cipoklean/chog-mischief/commit/ac27bc8b506dd3c36abdda0c9501d23874d4c726) | **success**, `38/44 passed · 4 failed · 2 blocked` (queued “44 tests”) | [26893e43-561d-4e33-83d0-216bde19d497](https://www.testsprite.com/dashboard-v3/o/46787881-6f4a-5869-bedd-78aa295447df/projects/ff336292-1a65-419c-971f-949138290cc7/execution/26893e43-561d-4e33-83d0-216bde19d497) |
| 2026-10-17 02:33:31 | #1 [`959dc6c`](https://github.com/cipoklean/chog-mischief/commit/959dc6c07fdb0619d28ad4374f7cc34f3cc6a65e) | **success**, `40/44 passed · 1 failed · 3 blocked` | [f0ab3747-fca7-4cd7-9231-fb2b9860fcab](https://www.testsprite.com/dashboard-v3/o/46787881-6f4a-5869-bedd-78aa295447df/projects/ff336292-1a65-419c-971f-949138290cc7/execution/f0ab3747-fca7-4cd7-9231-fb2b9860fcab) |
| 2026-10-17 03:02:26 | #1 head [`0914998`](https://github.com/cipoklean/chog-mischief/commit/0914998e0dcbd2798bbd006e15f1fae0004f15f1) | **success**, `All 44 tests passed` | [0a3b8620-2f6e-4566-bd45-6c2ff40d333e](https://www.testsprite.com/dashboard-v3/o/46787881-6f4a-5869-bedd-78aa295447df/projects/ff336292-1a65-419c-971f-949138290cc7/execution/0a3b8620-2f6e-4566-bd45-6c2ff40d333e) · [comment](https://github.com/cipoklean/chog-mischief/pull/1#issuecomment-6228743090) |
| 2026-10-17 03:18:06 | [#2](https://github.com/cipoklean/chog-mischief/pull/2) [`29d0283`](https://github.com/cipoklean/chog-mischief/commit/29d02830f55a10523abd7d9551af52972a36c210) | **failure**, `43/44 passed · 1 blocked` (queued “44 tests”) | [33c77f5c-7809-45f4-922f-c8c355f74b0c](https://www.testsprite.com/dashboard-v3/o/46787881-6f4a-5869-bedd-78aa295447df/projects/ff336292-1a65-419c-971f-949138290cc7/execution/33c77f5c-7809-45f4-922f-c8c355f74b0c) |
| 2026-10-17 07:14:04 | #2 [`5712941`](https://github.com/cipoklean/chog-mischief/commit/571294115fa88459a6acd658dd6e7a3a0c314165) | **failure**, `41/43 passed · 1 failed · 1 blocked` (queued “43 tests”) | [4f2dc8eb-c41f-4599-89cb-997bb6fff9a7](https://www.testsprite.com/dashboard-v3/o/46787881-6f4a-5869-bedd-78aa295447df/projects/ff336292-1a65-419c-971f-949138290cc7/execution/4f2dc8eb-c41f-4599-89cb-997bb6fff9a7) |
| 2026-10-17 07:22:46 | #2 head [`360f2b6`](https://github.com/cipoklean/chog-mischief/commit/360f2b6520bab39cb8d076d4c149ac7d7aa6bf05) | **success**, `All 43 tests passed` (queued “43 tests” at 07:17:50) | [850f94f4-4c5c-42fe-98bb-d708051aff70](https://www.testsprite.com/dashboard-v3/o/46787881-6f4a-5869-bedd-78aa295447df/projects/ff336292-1a65-419c-971f-949138290cc7/execution/850f94f4-4c5c-42fe-98bb-d708051aff70) · [comment](https://github.com/cipoklean/chog-mischief/pull/2#issuecomment-6231117839) |

The green comment’s results line is **43 passed, 43 total**, and the details table has **43** case titles. The same comment’s prose also says “every one of the 44 executed user-flow tests passed”. The status description and the table agree on 43; the prose does not. The comment was created 07:17:48Z and updated 07:22:44Z, two seconds before the success status, so the red narratives are not kept in the thread.

Neither merge commit ([`2647cd5`](https://github.com/cipoklean/chog-mischief/commit/2647cd5029a65da4902eb8aca75e7fb4d9bf28df), [`6d2f7f8`](https://github.com/cipoklean/chog-mischief/commit/6d2f7f8757476aa6312b27667a7504c0cb8fc800)) nor current HEAD [`100a8ae`](https://github.com/cipoklean/chog-mischief/commit/100a8aec84fc31941f23fdac4c1c699826614fd9) (wallet-connector fix, 2026-10-23, pushed straight to `main`) has a TestSprite status. They have Vercel only. The App ran on PR heads, not on production pushes.

The 43 titles on the green comment cover the areas named in the claim: landing and guest entry, guest revenge / take-it / reload reset, weekly / all-time / rivalry boards, signed-out HQ and prank, inbox and `/profile` → `/pick`, public `/chog` pages, and styled 404s. Examples: “Verify landing page hero and entry links”, “Receive retaliation and respond with revenge”, “View weekly ranks with empty-state boards”, “Protected HQ prompts for wallet or guest access”, “Signed-out inbox shows wallet and guest entry options”, “View a public Chog profile”, “Show 404 page for an unknown route”. Several titles are near-duplicates (two reload resets, two unknown-route 404s, several rank-tab switches). The README says the suite cannot hold a Chog or sign, so it never drives the real signed prank. https://github.com/cipoklean/chog-mischief/blob/main/README.md#L237-L276

### Required check?

`GET repos/cipoklean/chog-mischief/branches/main/protection` returns **403** (“Resource not accessible by integration”). `GET repos/cipoklean/chog-mischief/rulesets` returns **`[]`**. No reviews. The author merged both PRs. There is no timeline event that GitHub refused a merge.

On PR #2 the status was `failure` from 03:18:06Z through the 07:14:04Z run, and the merge is 07:23:18Z, **32 seconds** after the 07:22:46Z success. That is consistent with waiting. It does not prove a required check. On PR #1, runs that failed tests were still GitHub state **`success`** (`38/44` and `40/44`), so those results could not have blocked a merge even if the context were required. The README says results “land on the PR as a comment and a status check”. It does not say the check is required. The “must pass before merge” sentence is in the PR #2 body, written by the author.

### CLI, MCP, plans, triage, schedules, credits

- **CLI:** no `testsprite` script, workflow step, or config file.
- **MCP:** no MCP config.
- **Plans / test code in git:** **0** TestSprite plans or generated tests. The case list exists only in the portal and in the PR comment. README says the suite is “guided by a PRD written for testers”; no PRD file is tracked (`SPEC.md` is gitignored). `DESIGN.md` is the public rules doc.
- **Triage:** no issues, no review comments, no auto-fix bot. The bot overwrites its own comment, so failure names from the red runs are not in the thread (they are also absent from the status text, which only has counts).
- **Schedules:** TestSprite has no cron. The only Actions workflow is `keep-awake` (`17 */12 * * *` and `workflow_dispatch`). One listed run failed: [39462326086](https://github.com/cipoklean/chog-mischief/actions/runs/39462326086) on 2026-10-20, HTTP 502, `TimeoutError` from the keep-awake route. Vercel cron is `0 6 * * *` in https://github.com/cipoklean/chog-mischief/blob/main/vercel.json.
- **Credits:** no credit figure in the repo or the bot comments.

### Red → green

1. **PR #1, not a red check.** [`ac27bc8`](https://github.com/cipoklean/chog-mischief/commit/ac27bc8b506dd3c36abdda0c9501d23874d4c726): status success, `38/44 passed · 4 failed · 2 blocked`. The PR body says TestSprite case HQP-005 failed because signed-out `/profile` landed on `/pick` with no guest link. The product fix is [`9e3279b`](https://github.com/cipoklean/chog-mischief/commit/9e3279b2f27557d6704fdc4aba982a8910f72d93) plus Playwright [`a534c2c`](https://github.com/cipoklean/chog-mischief/commit/a534c2c9b03db21b22d9b4de87b8d2793c8cdc37). A later SHA still reported failures as success (`40/44`, 1 failed, 3 blocked). The head then reported `All 44 tests passed`. Individual failure titles for the 38/44 and 40/44 runs are not in the surviving comment.
2. **PR #2, red then green, and the green commit is docs.** [`29d0283`](https://github.com/cipoklean/chog-mischief/commit/29d02830f55a10523abd7d9551af52972a36c210) changes one sentence in `GuestClient.tsx` (“They pranked back” → “They prank back”) and is **failure**, `43/44 passed · 1 blocked`. [`5712941`](https://github.com/cipoklean/chog-mischief/commit/571294115fa88459a6acd658dd6e7a3a0c314165) edits only `README.md` (44 → 43, and a note that one guest prank test was removed because the step runner clicked every Prank button) and is **failure**, `41/43 passed · 1 failed · 1 blocked`. [`360f2b6`](https://github.com/cipoklean/chog-mischief/commit/360f2b6520bab39cb8d076d4c149ac7d7aa6bf05) adds three README lines about when the upgrade card appears and is **success**, `All 43 tests passed`. The copy fix did not turn the check green. The passing run is on a smaller suite, after a portal-side removal that is described in the README and is not a diff in git.

## Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
|---|---|---|---|---|
| TestSprite 3.0 frontend on PRs | 43 tests, every PR’s Vercel preview, areas listed in the claim | **43** titles in the green comment; status “All 43 tests passed”; queued line “43 tests”. Earlier same-day runs were a **44**-test suite (`44 tests queued`, then `All 44 tests passed` on PR #1). Both PRs (2/2) got the check after Vercel reported the deployment complete. Not re-executed here (dashboard is a login shell). | [PR #2 comment](https://github.com/cipoklean/chog-mischief/pull/2#issuecomment-6231117839), status on [`360f2b6`](https://github.com/cipoklean/chog-mischief/commit/360f2b6520bab39cb8d076d4c149ac7d7aa6bf05) | **43 VERIFIED** for the latest execution. Plans are **not in git**. “Every PR” matches the only two PRs. Current `main` (`100a8ae`) was not checked. |
| Vitest | README: `npm run test` (no count in the submission) | **417** `it(` / `test(` across 29 files, 0 skip. Local: `npm ci` then `npx vitest run` → **29 files, 417 passed, 1.73s**, exit 0. `node_modules` removed. | https://github.com/cipoklean/chog-mischief/blob/main/vitest.config.ts · this review, 2026-10-23, clone of `100a8ae` | **VERIFIED** locally. **Not run in CI** (no test workflow). |
| Playwright | no count in the submission | **57** `test(` in 9 `tests/ui/*.spec.ts` files | https://github.com/cipoklean/chog-mischief/blob/main/playwright.config.ts | Count **VERIFIED** in source. **Not run** here (needs a built server and browsers). `verify:ui` ends with `exit 0`, so a Playwright failure would not fail that script: https://github.com/cipoklean/chog-mischief/blob/main/package.json#L22 |
| Live `verify:prank` / `verify:prank:forgery` | README: 24 and 6 checks | **24** and **6** `ok(` calls in the scripts | https://github.com/cipoklean/chog-mischief/blob/main/scripts/verify-prank-flow.mjs · https://github.com/cipoklean/chog-mischief/blob/main/scripts/verify-prank-forgery.mjs | Count **VERIFIED** in source. **Not runnable locally:** needs Supabase service role, session secret, and a live server. |
| GitHub Actions tests | — | keep-awake only | https://github.com/cipoklean/chog-mischief/blob/main/.github/workflows/keep-awake.yml | No unit or E2E CI |

## Claim verification

| Claim | Verdict | Evidence |
|---|---|---|
| TestSprite runs a 43-test 3.0 suite | **VERIFIED** for the latest run. The suite was 44 earlier the same day. | Status “All 43 tests passed” and 43-row table on [PR #2](https://github.com/cipoklean/chog-mischief/pull/2#issuecomment-6231117839). Context is `TestSprite V3`; execution URLs are `dashboard-v3`. Prose in that comment still says 44. README still says “passes 44 of 44” and then says one test was removed: https://github.com/cipoklean/chog-mischief/blob/main/README.md#L267-L270 |
| on every PR’s Vercel preview | **VERIFIED** that both PRs got a `TestSprite V3` status only after that SHA’s Vercel deployment succeeded. **UNVERIFIED** that the runner’s browser opened the preview hostname (the status target is the dashboard, and the surviving comment does not name the host). It does not run on direct `main` pushes. | Timing on [`360f2b6`](https://github.com/cipoklean/chog-mischief/commit/360f2b6520bab39cb8d076d4c149ac7d7aa6bf05): Vercel success 07:17:40Z, “43 tests queued” 07:17:50Z. HEAD [`100a8ae`](https://github.com/cipoklean/chog-mischief/commit/100a8aec84fc31941f23fdac4c1c699826614fd9) has Vercel only. |
| as a blocking check | **UNVERIFIED** | Branch protection **403**. Rulesets **`[]`**. PR #1 failure counts were GitHub state `success`. README does not call the check required. |
| Coverage: landing/entry, guest gameplay and revenge, rankings, protected routes, inbox/profile, public Chog pages, 404s | **VERIFIED** as titles on the green run. Not re-executed. Signed wallet play is out of scope by the project’s own README. | 43 titles in the [PR #2 comment](https://github.com/cipoklean/chog-mischief/pull/2#issuecomment-6231117839) |
| On PR #2 the check first went red | **VERIFIED** | [`29d0283`](https://github.com/cipoklean/chog-mischief/commit/29d02830f55a10523abd7d9551af52972a36c210) state `failure`, `43/44 passed · 1 blocked`. A second red followed: `41/43 passed · 1 failed · 1 blocked` on [`5712941`](https://github.com/cipoklean/chog-mischief/commit/571294115fa88459a6acd658dd6e7a3a0c314165). |
| and held merge | **UNVERIFIED** | Merge at 07:23:18Z is 32s after the green status, and the PR was not merged during the red window. No blocked-merge event. Protection API cannot confirm a required context. |
| then passed after fix | **FALSE** | The product diff (one guest sentence) is the commit that stayed red at 43/44 with 1 blocked. The green “All 43 tests passed” is a README-only commit, after the suite had already shrunk to 43 and that 43-test run had itself failed (41/43, 1 failed, 1 blocked). README says the missing test was removed because the runner clicked every Prank button. |
| latest 43/43 green | **VERIFIED** for the latest TestSprite execution (2026-10-17). It is not the latest commit: production HEAD `100a8ae` (2026-10-23) has no TestSprite run. | [execution 850f94f4](https://www.testsprite.com/dashboard-v3/o/46787881-6f4a-5869-bedd-78aa295447df/projects/ff336292-1a65-419c-971f-949138290cc7/execution/850f94f4-4c5c-42fe-98bb-d708051aff70) |

## Code quality

The game rules, signing shape, and failure modes are written as small modules with strict TypeScript and long comments that record why a redirect lives in middleware and why a streamed `notFound()` cannot change a status code. Unit tests sit next to the code and passed locally (417). ESLint is `eslint-config-next` core-web-vitals plus TypeScript. `.env.example` lists keys and `.env*` is gitignored.

Hygiene gaps: nothing in Actions runs lint, typecheck, Vitest, or Playwright. `npm run verify:ui` forces exit 0. The TestSprite suite is portal-only, and the README’s “44 of 44” sentence was left in place when the suite became 43. Public `/chog/[id]` renders a truncated owner (`owner.slice(0, 6)…slice(-4)`) at https://github.com/cipoklean/chog-mischief/blob/main/src/app/chog/[id]/page.tsx#L207-L211, while the README says public surfaces never project a wallet address (the next sentence narrows that to the feed and leaderboards). `ProfileClient` treats `meta === null` as “No such Chog” before the loading branch, so the first render of a valid id is the not-found card (https://github.com/cipoklean/chog-mischief/blob/main/src/app/profile/[id]/ProfileClient.tsx#L150-L169).

## Live-site behavior

Checked with HTTP GET on 2026-10-23. No forms submitted.

| URL | Result |
|---|---|
| https://chog-mischief.vercel.app/ | 200 in 0.17s. Title “Chog Mischief - a daily prank war for Chog Genesis holders”. Visible chaos line included “Mister Mucus” (padded feed). |
| https://chog-mischief.vercel.app/guest | 200 in 0.36s. Guest shell: 0 points, 5 ammo, “Guest mode · progress resets”, “They prank back a few seconds later.”, practice rivals. |
| https://chog-mischief.vercel.app/pick and https://chog-mischief.vercel.app/profile | 200. `/profile` is served as `/pick` (`x-matched-path: /pick`, 1.13s). Both show “Connect wallet” and “Play as a guest instead”. |
| https://chog-mischief.vercel.app/hq , `/inbox`, `/ranks` | 200 in ~0.22–0.27s. Initial HTML is the document title only (client components). Signed-out prompts were not visible without JavaScript. |
| https://chog-mischief.vercel.app/prank | 200. Visible text is “Loading the prank flow…”. |
| https://chog-mischief.vercel.app/chog/1 | 200 in 0.20s. Traits, “11 base pts”, “20 % dodge”, truncated “Held by 0x3d38 … e7e0”, prank CTA. |
| https://chog-mischief.vercel.app/chog/0 , `/chog/1970`, `/chog/99999`, `/chog/abc` | 404. |
| https://chog-mischief.vercel.app/no-such-route | 404 in 0.08s. Styled copy: “No Chog lives at this address.” plus “Browse all Chogs” and “Meet Chog #1”. |
| https://chog-mischief.vercel.app/profile/1 | 200 in 0.33s. Title is “CHOG #1's profile”. Visible body is “No such Chog” (matches the `meta === null` branch). Not rechecked after hydration. |
| https://chog-mischief.vercel.app/api/health | 200 in 2.73s. JSON `ok: true` with supabase, view, and rpc flags true. |
| https://chog-mischief.vercel.app/api/chaos | 200. `rows: []`, `realCount: 0`, `needsBotFill: true`. |
| https://chog-mischief.vercel.app/api/ranks | 200 in 1.43s. Empty weekly, all-time, and rivalry arrays. |
| https://chog-mischief.vercel.app/api/fairness | 200. Today’s commit hash is present, `seed: null`, `revealed: false`. |
| https://chog-mischief.vercel.app/api/hq and `/api/auth/session` | 200. `authenticated: false`. |
| https://chog-mischief.vercel.app/api/prank/prepare | 405 on GET. |
| https://chog-mischief.vercel.app/api/cron/keep-awake | 401 `{"error":"unauthorized"}` without a bearer token. |
| https://chog-mischief.vercel.app/refusal-demo | 200. Design harness, not linked as the demo. |

## Demo

No video. The submission’s demo field is none. `/guest` is the playable stand-in and the corrected rivals sentence is in the server HTML. This review did not click through a prank (guest play is client-side; curl only).

## Weaknesses / risks for judges

- The “blocking check” and “held merge” lines are not proven. Protection is 403, rulesets are empty, and PR #1’s failing runs were green statuses.
- “Passed after fix” does not match the diffs. Green arrived on a README commit after a test was removed and an intermediate 43-test run was still red. Which case was blocked or failed is not in the GitHub record.
- The 43 cases are not in the repo, so a judge cannot re-run them. The dashboard is login-gated. The bot’s own summary disagrees with its table (44 vs 43).
- Production HEAD (`100a8ae`, wallet signing) shipped with no TestSprite run. The 43/43 result is six days older than the live commit.
- No CLI, MCP, committed plans, nightly TestSprite, or failure ledger. No CI for the 417 unit tests or 57 Playwright tests.
- Signed play, the part the README calls the real game, is explicitly untested by this suite.
- `/profile/1` first paint says “No such Chog” for a token that `/chog/1` renders. `/hq`, `/inbox`, and `/ranks` ship an empty HTML shell.

## Where it beats Ninety

Ninety baseline: https://github.com/mohamedwael201193/ninety, live https://ninety-coral.vercel.app. Ninety’s TestSprite surface is a V3 check (PR #62 43/43, PR #63 42/43 merged while red), 43 frontend plans in git, and a CLI backend gate (28 Python tests) on PRs and main. Chog is thinner on every one of those.

1. **The PR #2 status actually failed, and the merge timestamp is after the green result.** [`29d0283`](https://github.com/cipoklean/chog-mischief/commit/29d02830f55a10523abd7d9551af52972a36c210) is `failure` (`43/44 passed · 1 blocked`); [`360f2b6`](https://github.com/cipoklean/chog-mischief/commit/360f2b6520bab39cb8d076d4c149ac7d7aa6bf05) is `success` (“All 43 tests passed”) at 07:22:46Z; the merge is 07:23:18Z. Ninety merged PR #63 while TestSprite V3 was red. To match, Ninety needs a non-passing run to be GitHub state `failure`, and to stay unmerged until it is green. Caveat: Chog’s requirement is not API-proven, and Chog’s own PR #1 posted failures as `success`.
2. **A named suite failure is visible as a live fix plus a committed regression.** PR #1 describes HQP-005 (signed-out `/profile` → `/pick` with no guest path). Production HTML for https://chog-mischief.vercel.app/profile and https://chog-mischief.vercel.app/pick includes “Play as a guest instead”, and the regression is https://github.com/cipoklean/chog-mischief/blob/main/tests/ui/production-fixes.spec.ts. Ninety would need a TestSprite case name, the fixing commit, and the live page showing that fix. Ninety’s red→green ledger is broader; this one is checkable without the dashboard.
3. **The frontend suite drives a multi-step revenge loop with no wallet.** Green-run titles include “Receive retaliation and respond with revenge”, “Accept retaliation and continue the loop”, and “Verify guest mode resets on reload”, and https://chog-mischief.vercel.app/guest server-renders that loop’s copy. Ninety’s 43 plans exercise a calculator, not a timed opponent. To exceed it, Ninety would add a scripted multi-step interaction of that kind to the committed plans and show it on a preview. Chog’s plans are still portal-only, so Ninety already wins on re-running the suite from git.

TestSprite technique Ninety lacks: a zero-write guest seam so a portal browser can play the core loop of a wallet app. Chog has no CLI gate, no MCP config, no committed plans, and no nightly TestSprite job. Those are Ninety’s, not Chog’s.

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 6 | A real daily loop for a 1,969-holder collection, with a no-wallet path and a public fairness commit. The audience is that collection and a hackathon, not a general problem. |
| TestSprite depth | 5 | Real V3 App on both PR previews, a 43-case comment, and one failure→success. No plans in git, no CLI, no MCP, no schedule, no triage, required check unverified, current `main` unchecked. |
| Verifiability | 6 | 43/43 and the two red counts are on public commit statuses, and 417 unit tests passed locally. Blocking, “after fix”, and the preview hostname are not. The dashboard does not show results without login. |
| Polish | 6 | Strict TypeScript, careful security comments, guest and `/chog/1` render. No test CI, profile first paint is wrong, several routes are empty shells, README still says 44/44. |
| Demo | 2 | No video. `/guest` loads and is the intended stand-in. |
| **Overall** | **5** | A finished small game and a real App check, with a green 43/43 that does not survive contact with the “blocking” and “passed after the fix” sentences, and that does not cover the commit currently in production. |
