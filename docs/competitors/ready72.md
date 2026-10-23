# Ready72

- **Name:** Ready72
- **Author:** MuhammadNabiyev
- **Repo:** https://github.com/MuhammadNabiyev/ready72 (default branch `main`, HEAD `15da84b46d4298cecf245a839af8dbdfcd180b4a`, pushed 2026-10-20)
- **Live:** https://ready72-weld.vercel.app/
- **TestSprite PRs:** [#1](https://github.com/MuhammadNabiyev/ready72/pull/1) (merged, App check posted), [#2](https://github.com/MuhammadNabiyev/ready72/pull/2) (merged, no TestSprite status), [#3](https://github.com/MuhammadNabiyev/ready72/pull/3) (merged, App check posted)
- **Demo:** none (no video in the repo, PR bodies, or README)
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7

## What it is

Ready72 is a no-account household preparedness planner. The user enters who lives at home and which hazards apply; the app computes water, food, medicine, and gear targets for a 3/7/14-day window, a 0–100 readiness score, a shopping list of gaps, stress tests, and a high-contrast crisis screen. The pitch is the civil-defense “first 72 hours are on you” problem, aimed at a household that will not maintain a spreadsheet. Value is real and immediately usable: personalized quantities instead of a generic poster, plus a crisis view meant to be opened when the network is down. A short disclaimer says the guidance is general and defers to local authorities. Repo description: https://github.com/MuhammadNabiyev/ready72. Live headline: https://ready72-weld.vercel.app/.

## Architecture

Single Next.js App Router app, no backend and no auth. `package.json` pins Next.js 16.4.2, React 19.3.0, Tailwind CSS 4, Radix UI dialog/select/radio/popover/slider, react-day-picker, date-fns, Vitest 5.0.5, TypeScript 5, ESLint 9 (`eslint-config-next`). Deploy target is Vercel (project `ready72`, production alias `ready72-weld.vercel.app`; preview comments from `vercel[bot]` on each PR).

State is one JSON blob in `localStorage` (`ready72.state.v1`) via `useSyncExternalStore`: https://github.com/MuhammadNabiyev/ready72/blob/main/src/lib/store.ts. The scoring engine is pure functions in https://github.com/MuhammadNabiyev/ready72/blob/main/src/lib/engine.ts. Requirement formulas live in https://github.com/MuhammadNabiyev/ready72/blob/main/src/lib/requirements.ts (`req(` appears 41 times). Later modules: `drill.ts`, `maintenance.ts`, `cards.ts`, `water.ts`, `features.ts` (time machine, custom scenarios, share card), `share.ts`, `ics.ts`, `migrate.ts`. UI is route files under `src/app/(app)/` plus client views in `src/components/`. Offline: https://github.com/MuhammadNabiyev/ready72/blob/main/public/sw.js and https://github.com/MuhammadNabiyev/ready72/blob/main/src/app/manifest.ts, registered only in production by https://github.com/MuhammadNabiyev/ready72/blob/main/src/components/sw-register.tsx. CI is one workflow: https://github.com/MuhammadNabiyev/ready72/blob/main/.github/workflows/ci.yml. The generation spec is https://github.com/MuhammadNabiyev/ready72/blob/main/docs/PRD.md.

`suppliesDays` sets the headline to `min(water, food)` rounded to one decimal (https://github.com/MuhammadNabiyev/ready72/blob/main/src/lib/engine.ts#L71-L81). `runway()` also lists medication, pet food, and infant days and sorts shortest first (same file, `runway`). The dashboard caption says the shortest bar ends the runway (https://github.com/MuhammadNabiyev/ready72/blob/main/src/components/dashboard-view.tsx).

## TestSprite integration depth

**Depth score: 4 / 10.** A GitHub App check and two long PR comments exist, and the suite size is stable at 50. The check is green while tests fail, one of three PRs never got a run, plans and test code are not in git, there is no CLI, MCP, schedule, or failure triage, and the recorded runs never show the three cited bugs going green.

### GitHub App check

Context name `TestSprite V3`, posted as a commit **status** (not a GitHub Actions check-run). The bot `testsprite` comments with `<!-- testsprite-v3-marker -->`. The in-progress edit on PR #1 says it queued **50 tests** against **this PR’s deployment: https://ready72-weld.vercel.app** (the production alias, not the Vercel preview `ready72-git-feat-not-found-a-…vercel.app`). That comment was created 2026-10-20T11:30:57Z and replaced at 11:35:34Z. Production `main` was not updated again until the merges at 14:08–14:10Z, and the merge commit `15da84b` has a Vercel status only (no TestSprite status). Every execution below finished before that production deploy.

| When (UTC) | PR / SHA | GitHub status | Execution |
|---|---|---|---|
| 2026-10-20 11:35:36 | [#1](https://github.com/MuhammadNabiyev/ready72/pull/1) `e699e62` | success, `44/50 passed · 3 failed · 3 blocked` | [d5cd5092-4388-4753-80a8-42de618184d4](https://www.testsprite.com/dashboard-v3/o/dc1fa787-0453-5bff-b1c9-3510b1e9434c/projects/f36f547a-77f8-4dd7-ad47-ce2f73d5919f/execution/d5cd5092-4388-4753-80a8-42de618184d4) · [comment](https://github.com/MuhammadNabiyev/ready72/pull/1#issuecomment-6289864478) |
| 2026-10-20 12:39:09 | [#3](https://github.com/MuhammadNabiyev/ready72/pull/3) `86ef672` | success, `44/50 passed · 5 failed · 1 blocked` | [42e76389-3d95-4d17-8f45-384be161f606](https://www.testsprite.com/dashboard-v3/o/dc1fa787-0453-5bff-b1c9-3510b1e9434c/projects/f36f547a-77f8-4dd7-ad47-ce2f73d5919f/execution/42e76389-3d95-4d17-8f45-384be161f606) |
| 2026-10-20 12:42:52 | #3 `96dfe60` | success, `43/50 passed · 6 failed · 1 blocked` | [afe2326f-e1ea-45ee-8b35-67621e3abe72](https://www.testsprite.com/dashboard-v3/o/dc1fa787-0453-5bff-b1c9-3510b1e9434c/projects/f36f547a-77f8-4dd7-ad47-ce2f73d5919f/execution/afe2326f-e1ea-45ee-8b35-67621e3abe72) |
| 2026-10-20 12:44:24 | #3 `cc55c60` | success, `43/50 passed · 5 failed · 2 blocked` | [c12aeb1c-fecb-478e-9f3c-30fc2fc802e8](https://www.testsprite.com/dashboard-v3/o/dc1fa787-0453-5bff-b1c9-3510b1e9434c/projects/f36f547a-77f8-4dd7-ad47-ce2f73d5919f/execution/c12aeb1c-fecb-478e-9f3c-30fc2fc802e8) |
| 2026-10-20 14:09:21 | #3 head `ce3c609` | success, `44/50 passed · 5 failed · 1 blocked` | [e7cd74c8-fb80-4f24-bf5d-7abbb727a238](https://www.testsprite.com/dashboard-v3/o/dc1fa787-0453-5bff-b1c9-3510b1e9434c/projects/f36f547a-77f8-4dd7-ad47-ce2f73d5919f/execution/e7cd74c8-fb80-4f24-bf5d-7abbb727a238) · [comment](https://github.com/MuhammadNabiyev/ready72/pull/3#issuecomment-6292728854) |

[#2](https://github.com/MuhammadNabiyev/ready72/pull/2) head `c077b7b` has Vercel success only. No TestSprite status on any `main` push, including the three merge commits. Dashboard HTML is a login shell (HTTP 200, title “TestSprite”, no result payload), so per-test steps were taken from the GitHub comments, not the dashboard.

PR #1 failures (comment lists 3 `<ins>` titles + 47 table rows = 50): Print the shopping list; Mark go-bag items as packed; Review supply runway details on the dashboard. Blocked: Open the emergency contact from crisis mode; Restore household data from a backup file; Download a backup of stored household data.

PR #3 final failures (5 `<ins>` + 45 table rows = 50): the same three, plus Open the emergency contact from crisis mode, plus Download a backup of stored household data. Blocked: Restore household data from a backup file. Pass count stayed 44. Fail count went from 3 to 5.

The PR #3 prose says “35 tests passed, 4 failed” and “89.7%” (35/39 = 89.7%). The same comment’s results line and the GitHub status say 44 / 5 / 1. The PR #1 prose says “40 tests passed, 2 failed, and 3 were blocked” while the results line and status say 44 / 3 / 3. The status description is the count used below.

### Required check?

`GET repos/MuhammadNabiyev/ready72/branches/main/protection` returns **403** (“Resource not accessible by integration”). `GET repos/MuhammadNabiyev/ready72/rulesets` returns **`[]`**. No review was left on any PR. The author merged all three. `TestSprite V3` concluded **success** on every posted run, including runs whose description lists 3–6 failures, so a required-check rule would not have blocked these merges. No blocked-merge evidence.

### CLI, MCP, plans, triage, schedules, credits

- **CLI:** no `testsprite` script, no workflow step, no config file in the repo.
- **MCP:** no MCP config.
- **Plans / test code in git:** **0** TestSprite plan or generated test files. The only generation artifact in git is `docs/PRD.md` (acceptance rules and example `data-testid`s). `data-testid` appears on 182 attributes under `src/`.
- **Triage:** no issues (`gh issue list` empty), no review comments, no auto-fix bot. One manual commit, [`d4d7a5a`](https://github.com/MuhammadNabiyev/ready72/commit/d4d7a5a8e004120b27e28d2546ab33acc0b65585) “Fix issues found by TestSprite run”, edits settings reachability, crisis badge copy, and runway row labels. It does not change `suppliesDays` or the go-bag count, and `window.print()` was already the shopping print handler (https://github.com/MuhammadNabiyev/ready72/blob/main/src/components/shopping-view.tsx).
- **Schedules:** `ci.yml` is `pull_request` plus `push` to `main`. No `cron`. TestSprite did not run on the merge to `main`.
- **Credits:** no credit figure in the repo or in the bot comments.

### Red → green

There is no green re-run of the three failing cases.

1. Execution [d5cd5092](https://www.testsprite.com/dashboard-v3/o/dc1fa787-0453-5bff-b1c9-3510b1e9434c/projects/f36f547a-77f8-4dd7-ad47-ce2f73d5919f/execution/d5cd5092-4388-4753-80a8-42de618184d4) on PR #1: 44 passed, 3 failed, 3 blocked. The three failures are print, go-bag packed state, and dashboard runway.
2. Commit [d4d7a5a](https://github.com/MuhammadNabiyev/ready72/commit/d4d7a5a8e004120b27e28d2546ab33acc0b65585) (2026-10-20T11:30:07Z, before the result comment) is the only fix commit.
3. Later executions, through [e7cd74c8](https://www.testsprite.com/dashboard-v3/o/dc1fa787-0453-5bff-b1c9-3510b1e9434c/projects/f36f547a-77f8-4dd7-ad47-ce2f73d5919f/execution/e7cd74c8-fb80-4f24-bf5d-7abbb727a238) on PR #3: still 44 passed, and those three names are still in the failed list, with two more failures. Current `main` still computes the headline from water and food only, while the go-bag summary counts stocked go-bag items (`haveFor(..., goBagOnly)`), and the tap handler only toggles a local “Grabbed” flag (https://github.com/MuhammadNabiyev/ready72/blob/main/src/components/crisis-view.tsx).

The suite named in the comments covers setup, kit, shopping, plan, stress tests, guides, crisis, dashboard, and settings. Names present do not include the time machine, command palette, night mode, `/drill` countdown, `/maintenance`, `/cards`, or the water-treatment helper. Those shipped in PR #2 and PR #3 and are covered by Vitest, not by this 50.

## Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
|---|---|---|---|---|
| TestSprite end-to-end | 50 tests, 9 use cases, PR trigger | 50 cases on the two posted reports (PR #1: 3 failed titles + 47 table rows; PR #3: 5 + 45). Five `TestSprite V3` statuses, all `x/50`. | [PR #1 comment](https://github.com/MuhammadNabiyev/ready72/pull/1#issuecomment-6289864478), [PR #3 comment](https://github.com/MuhammadNabiyev/ready72/pull/3#issuecomment-6292728854), status on [`e699e62`](https://github.com/MuhammadNabiyev/ready72/commit/e699e621ef51ce008658347627095c0121de7dad) and [`ce3c609`](https://github.com/MuhammadNabiyev/ready72/commit/ce3c60948c786797945b35d7378bdf257707cbaa) | **50 VERIFIED. “9 use cases” UNVERIFIED** (string appears nowhere in the repo or the bot comments; dashboard body is a login shell). **PR trigger partial:** App ran on #1 and on four #3 SHAs; **no status on #2**. |
| Vitest unit tests | 131 | 131 `it(` in `src/lib/*.test.ts` (engine 46, maintenance 22, drill 18, cards 15, features 11, water 10, extras 9). CI on current `main`: `7 passed`, `131 passed`. | [engine.test.ts](https://github.com/MuhammadNabiyev/ready72/blob/main/src/lib/engine.test.ts) and siblings; [CI run 39436783123](https://github.com/MuhammadNabiyev/ready72/actions/runs/39436783123) | **VERIFIED** for current `main` and PR #3. PR #1 CI logged **55** ([run 39415415885](https://github.com/MuhammadNabiyev/ready72/actions/runs/39415415885)); PR #2 logged **66** ([run 39417813577](https://github.com/MuhammadNabiyev/ready72/actions/runs/39417813577)). |
| Lint + typecheck + build | on every PR | `ci.yml` runs `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` on `pull_request` and `push` to `main`. All 14 listed Actions runs completed success. Latest build log: “Compiled successfully”, “Generating static pages … (21/21)”. | [ci.yml](https://github.com/MuhammadNabiyev/ready72/blob/main/.github/workflows/ci.yml), [run 39436783123](https://github.com/MuhammadNabiyev/ready72/actions/runs/39436783123), [PR #3 run 39435897347](https://github.com/MuhammadNabiyev/ready72/actions/runs/39435897347) | **VERIFIED** |
| Local re-run | — | `npm ci` then `npm test` (Vitest 5.0.5): **7 files, 131 passed, 2.09s**, exit 0. Then `node_modules` removed. | this review, 2026-10-23, clone of `15da84b` | **VERIFIED** |
| Component / browser tests in repo | — | none | repo file list | no in-repo E2E |

## Claim verification

| Claim | Verdict | Evidence |
|---|---|---|
| “know if your household can last 72 hours” | **VERIFIED** | Live `<title>` and H1 at https://ready72-weld.vercel.app/ (HTTP 200). Repo description and [README](https://github.com/MuhammadNabiyev/ready72/blob/main/README.md). |
| No sign-in; everything in the browser | **VERIFIED** | No auth dependency or sign-in copy. Persistence is `localStorage` in [store.ts](https://github.com/MuhammadNabiyev/ready72/blob/main/src/lib/store.ts). Homepage text: “No account. Your data stays in this browser.” No `/api` route: `GET /api` and `GET /api/health` are HTTP 404. |
| Offline PWA | **VERIFIED** at the artifact level | `GET /manifest.webmanifest` 200, `display: standalone`, icons 192 and 512 HTTP 200. `GET /sw.js` 200, precaches `/`, `/dashboard`, `/kit`, `/shopping`, `/plan`, `/stress-test`, `/guides`, `/tools`, `/drill`, `/maintenance`, `/cards`, `/crisis`, `/setup`, `/settings`, `/share`. Register call is production-only. This review did not drive a browser with the network disabled. |
| “50 end-to-end tests … with a PR trigger” | **VERIFIED** for the count and for an App trigger on #1 and #3 | See the execution table. The trigger is the GitHub App, not a workflow file. It did not fire on PR #2 or on `main`. |
| “in 9 use cases” | **UNVERIFIED** | Not stated in README, PRD, PR bodies, or TestSprite comments. Plans are not in git. |
| “first run 82%, 90% after fixing three real bugs” | **FALSE** | First completed status is **44/50** (88% of 50; 44/47 = 93.6% if the 3 blocked are dropped): [status on `e699e62`](https://github.com/MuhammadNabiyev/ready72/commit/e699e621ef51ce008658347627095c0121de7dad). No comment or status contains “82%” or “90%”. The only nearby percentage is the PR #3 prose “89.7%”, which uses a 35/4 tally that contradicts that comment’s own **44 passed / 5 failed / 1 blocked** line ([comment](https://github.com/MuhammadNabiyev/ready72/pull/3#issuecomment-6292728854)). The same three failures are still failed on the last run. Pass count did not rise. |
| “GitHub Actions also runs 131 unit tests + lint + typecheck + build on every PR” | **VERIFIED** for the workflow and for current `main` / PR #3 | [ci.yml](https://github.com/MuhammadNabiyev/ready72/blob/main/.github/workflows/ci.yml) and [run 39435897347](https://github.com/MuhammadNabiyev/ready72/actions/runs/39435897347) (`131 passed`). Earlier PRs ran the suite as it existed then (55, then 66). |

## Code quality

The engine is a readable pure module with a Vitest file beside each domain module, strict-looking input clamps, and a migrate path for older saves. CI is one job, Node 22, `npm ci`, and it finished in about a minute on every run. ESLint config is `eslint-config-next` core-web-vitals plus TypeScript; `public/sw.js` is ignored. Two `eslint-disable-line react-hooks/exhaustive-deps` (kit view, share card). `suppliesDays` casts partial objects with `as Requirement`. Vitest prints an ESM-config warning (`vitest.config.ts` loaded as CommonJS). No `any`, no `@ts-ignore`. No license file. UI components are large and hand-styled (about 7,000 lines under `src/`) and have no component tests. The service worker’s install step precaches document URLs and uses network-first for navigations, cache-first for `/_next/static/` and `/pwa-icon/`.

The product bug TestSprite kept failing is still in `main`: the headline number and the “shortest bar” sentence describe different quantities, and the crisis checklist’s count does not follow the tap state. Shopping print does call `window.print()`, so that failure is consistent with a cloud runner that cannot see the browser print dialog.

## Live-site behavior

Checked with curl on 2026-10-23. Cache headers showed `x-vercel-cache: HIT`, `server: Vercel`, HSTS. First homepage fetch: HTTP 200 in 0.16s, 35,736 bytes.

| Path | HTTP | Time (s) | What came back |
|---|---|---|---|
| `/` | 200 | 0.10 | Title “Ready72 — know if your household can last 72 hours”. Copy includes “No account”, “Works offline once loaded”, “Build my plan”. |
| `/setup` | 200 | 0.10 | “Build your plan — Ready72” |
| `/dashboard` | 200 | 0.16 | “Dashboard — Ready72” |
| `/kit` | 200 | 0.09 | “My kit — Ready72” |
| `/shopping` | 200 | 0.11 | “Shopping list — Ready72” |
| `/plan` | 200 | 0.10 | “Family plan — Ready72” |
| `/stress-test` | 200 | 0.12 | “Stress test — Ready72” |
| `/crisis` | 200 | 0.16 | “Crisis mode — Ready72” |
| `/guides` | 200 | 0.10 | “Hazard guides — Ready72” |
| `/tools` | 200 | 0.12 | “Tools — Ready72” |
| `/drill` | 200 | 0.09 | “Evacuation drill — Ready72” |
| `/maintenance` | 200 | 0.10 | “Home maintenance — Ready72” |
| `/cards` | 200 | 0.10 | “Emergency cards — Ready72” |
| `/settings` | 200 | 0.09 | “Settings — Ready72” |
| `/share` | 200 | 0.13 | “Shared plan — Ready72” |
| `/manifest.webmanifest` | 200 | 0.28 | JSON manifest above |
| `/sw.js` | 200 | 0.04 | 1,931-byte service worker |
| `/pwa-icon/192`, `/pwa-icon/512` | 200 | 0.07, 0.12 | PNG |
| `/favicon.ico` | 200 | 0.04 | icon |
| `/not-a-real-page`, `/api`, `/api/health` | 404 | 0.06, 0.13, 0.03 | Branded 404: “That page is not in your kit.”, `data-testid="not-found"` |

App routes are static shells; household data appears only after client JS reads `localStorage`, so curl cannot confirm the score, shopping, or crisis interactions. `error.tsx` is a runtime boundary and was not triggered. No forms were submitted.

## Demo

None. README, PR bodies, and the repo tree contain no video, Loom, or YouTube link. Length: n/a. Nothing to show beyond the live site.

## Weaknesses / risks for judges

- The TestSprite check is decorative: state `success` with 3–6 failures, merged by the author, branch protection not visible (403) and rulesets empty.
- PR #2, which added the time machine, command palette, night mode, and share card, never received a TestSprite status. The 50-case list also omits drill, maintenance, cards, and the water helper.
- The 82% → 90% story does not match any status. The three named failures are still failing, and one of them (headline vs shortest runway) is still in the source on `main`.
- The bot named the production URL as “this PR’s deployment”, and no TestSprite status exists on the merge to `main`, so these runs do not demonstrate that the PR diff was the build under test.
- Bot prose contradicts its own pass/fail badges (40/2/3 vs 44/3/3, and 35/4/89.7% vs 44/5/1).
- Plans and generated tests are not in the repo, and the dashboard is authenticated, so a judge cannot re-run or read the 50 cases from git.
- Preparedness numbers (bleach drops, calories, medication days) are product claims with a disclaimer and unit tests, and a wrong formula would be user-facing. This review checked that the tests match the code, not that the code matches a specific agency table.
- No license, no component tests, no demo.

## Where it beats Ninety

1. **Offline crisis surface.** A production service worker and standalone manifest are live (`/sw.js`, `/manifest.webmanifest`), and `/crisis` is a high-contrast page whose contacts are `tel:` links (https://github.com/MuhammadNabiyev/ready72/blob/main/src/components/crisis-view.tsx). Ninety would need a service worker, a manifest, and a no-network screen that still answers its core question from data already on the device.
2. **A secret-free CI job that stayed green.** One workflow runs lint, `tsc --noEmit`, Vitest, and `next build` on every PR and `main` push; the current run passed 131/131 in the same job that compiled 21 static pages ([run 39436783123](https://github.com/MuhammadNabiyev/ready72/actions/runs/39436783123)). Ninety’s TestSprite smoke workflow is broken and disabled, and the full CLI nightly is skipped. Matching this bar is a single green, secret-free job; it does not require matching Ninety’s 367 Vitest cases.
3. **A public no-auth URL plus an in-repo generation spec.** `docs/PRD.md` lists pages, numeric acceptance rules, and `data-testid`s, and the App queued 50 tests against https://ready72-weld.vercel.app with no login bypass ([in-progress comment text](https://github.com/MuhammadNabiyev/ready72/pull/1#issuecomment-6289864478)). Ninety already commits frontend plans and a backend CLI gate, which is deeper. What Ninety’s brief does not list is this pattern: one public URL, zero secrets, and a product PRD used as the generation contract.

**TestSprite technique Ninety lacks:** the checked-in PRD as the generation contract for a frontend-only GitHub App run against a public URL. Ninety already has the V3 check, committed plans, and a CLI gate. Ready72 does not have MCP config, a CLI workflow, committed TestSprite test code, a required check, a schedule, or a red-to-green loop that ended green.

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 8 | Personalized 72-hour household plan, usable with no account, including a crisis screen. Guidance risk is disclosed. |
| TestSprite depth | 4 | App statuses and two screenshot comments for a stable 50. Green-on-failure, missed PR #2, no plans in git, no CLI/MCP/schedule, bugs still red. |
| Verifiability | 6 | 131 unit tests re-ran locally; CI logs and the five statuses are public. The 82/90 claim and “9 use cases” are not supported. Dashboard steps sit behind login. |
| Polish | 7 | Fifteen live routes return distinct titles, the 404 is designed, and the visual system is consistent. Curl cannot prove the client flows, and the runway copy disagrees with the headline math. |
| Demo | 1 | No demo. |
| **Overall** | **5** | A polished, honest-looking local app with a thin and partly misreported TestSprite integration. Equal-weight mean of the five scores is 5.2. |
