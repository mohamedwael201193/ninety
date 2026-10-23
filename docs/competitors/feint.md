# Feint

- **Name:** Feint
- **Author:** nftkingiii
- **Repo:** https://github.com/nftkingiii/feint
- **Live:** https://feint.vercel.app/
- **TestSprite PR:** https://github.com/nftkingiii/feint/pull/5 (merged 2026-10-22T09:30:59Z by nftkingiii)
- **Demo:** https://youtu.be/b4JNJU2lWkU
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7

## What it is

Feint is a no-account browser game that deals eight simulated scam and genuine messages for the country you pick (Nigeria, the United States, the United Kingdom, or a global deck). You tap phrases that look wrong, flip the card to a trusted channel, then act or ignore. A wrong call on a scam shows an illustrative loss and a rewind; the round ends in a shareable case file. The user is anyone who gets alarming texts and does not yet have a habit of checking them outside the message. The value is short, country-specific practice with cited sources, not a filter on a real inbox.

## Architecture

Static Vite + React 18 SPA. No backend, no account, no API. Deployed on Vercel (`feint.vercel.app`); `vercel.json` rewrites every path to `index.html`.

| Piece | Role | Link |
|---|---|---|
| `src/lib/engine.js` | Mulberry32 deck builder, `DECK_SIZE = 8`, judge/rewind scoring, share-link parse, daily UTC seed | https://github.com/nftkingiii/feint/blob/main/src/lib/engine.js |
| `src/data/countries.js` | Four decks (NG 11 cards, US 10, GB 10, global 8) | https://github.com/nftkingiii/feint/blob/main/src/data/countries.js |
| `src/data/patterns.js` | 10 named scam patterns | https://github.com/nftkingiii/feint/blob/main/src/data/patterns.js |
| `src/data/sources.js` | 11 cited sources (FTC, GOV.UK, Action Fraud, Dubawa, and others) | https://github.com/nftkingiii/feint/blob/main/src/data/sources.js |
| `src/data/clues.js` | Tappable clue strings | https://github.com/nftkingiii/feint/blob/main/src/data/clues.js |
| `src/App.jsx` | Round state, tabs, wordmark “leave the round”, address-bar sync | https://github.com/nftkingiii/feint/blob/main/src/App.jsx |
| `src/components/Card.jsx` | Swipe, phrase buttons, flip | https://github.com/nftkingiii/feint/blob/main/src/components/Card.jsx |
| `src/lib/history.js` | `localStorage` of finished rounds | https://github.com/nftkingiii/feint/blob/main/src/lib/history.js |
| `docs/PRD.md` | Requirements TestSprite is said to generate from, including fixed seeds | https://github.com/nftkingiii/feint/blob/main/docs/PRD.md |
| `e2e/*.spec.js` | Playwright (desktop Chrome 1366×860 and Pixel 7) | https://github.com/nftkingiii/feint/blob/main/playwright.config.js |

Stack from `package.json`: React 18.3.1, Vite 6.4.3, Vitest 4.1.11, Playwright 1.48.2. https://github.com/nftkingiii/feint/blob/main/package.json

## TestSprite integration depth

**Score: 5 / 10.** The GitHub App really ran on PR #5, failed the check on many pushes, and the author wrote a failure-by-failure log. That is a real loop, not a badge. It is still a single-surface integration: no CLI, no MCP, no workflow file, no schedule, no generated plan committed, and the check is not a required status. The passing report is 168 tests (a doubled plan), and TestSprite has marked a status success while tests were failing.

### GitHub App

Check name **TestSprite V3**, posted as a commit status (and, when credits ran out, as a check run). One bot comment on PR #5, created 2026-10-22T08:58:26Z and showing only the final green summary: https://github.com/nftkingiii/feint/pull/5. Older failure comments are not preserved. No review threads. No issues.

There is no `.github/` directory. The only GitHub Actions runs are Dependabot. https://github.com/nftkingiii/feint

Pre-PR commits on `main` (the LOOP.md “runs 1–4” against production) have a Vercel status only. Example: https://github.com/nftkingiii/feint/commit/aa5529b. Run 1’s execution id is only in LOOP.md (`81f9306b-1cf0-4cae-a3be-14b72bcb502d`). Runs 2–4 have no execution id. The dashboard URL returns the TestSprite app shell, not a public report.

PR #5 commit statuses (combined status API), in order:

| Commit | When (UTC) | TestSprite V3 | State | Execution |
|---|---|---|---|---|
| [`50e63a6`](https://github.com/nftkingiii/feint/commit/50e63a6afb9028e9b3bac7b4aa1719d1b2273ce1) | 2026-10-18 16:23 | 39/44 passed · 4 failed · 1 blocked | **success** | [08dcab15](https://www.testsprite.com/dashboard-v3/o/6ee2ba3c-e72a-5d4e-9651-5aff8827551e/projects/b3c3d776-34a9-456e-b605-3ddbcc09466b/execution/08dcab15-de09-4061-81e9-d9a86cce7b36) |
| [`b5f82c6`](https://github.com/nftkingiii/feint/commit/b5f82c668ce3109df6145f641ec17c7bd6ee8ea4) | 2026-10-18 16:40 | 38/44 · 5 failed · 1 blocked | failure | [96d2343d](https://www.testsprite.com/dashboard-v3/o/6ee2ba3c-e72a-5d4e-9651-5aff8827551e/projects/b3c3d776-34a9-456e-b605-3ddbcc09466b/execution/96d2343d-af63-4877-bb76-7683f6447415) |
| [`3adceeb`](https://github.com/nftkingiii/feint/commit/3adceebad69470d9afa5924d6a25a0597dadfe2a) | 2026-10-18 16:54 | 39/44 · 5 failed | failure | [c1d332ea](https://www.testsprite.com/dashboard-v3/o/6ee2ba3c-e72a-5d4e-9651-5aff8827551e/projects/b3c3d776-34a9-456e-b605-3ddbcc09466b/execution/c1d332ea-944b-4c04-994a-0546997f9572) |
| [`72a455f`](https://github.com/nftkingiii/feint/commit/72a455fc8aec22870e8c58556c9ea80609f1b246) | 2026-10-18 16:58 | 36/44 · 6 failed · 2 blocked | failure | [e6146619](https://www.testsprite.com/dashboard-v3/o/6ee2ba3c-e72a-5d4e-9651-5aff8827551e/projects/b3c3d776-34a9-456e-b605-3ddbcc09466b/execution/e6146619-266d-4c64-b188-3fa5750e0714) |
| [`3f3d71f`](https://github.com/nftkingiii/feint/commit/3f3d71f97c491e93e01b9fe4c001325c3b62c936) | 2026-10-18 18:22 | 38/44 · 5 failed · 1 blocked | failure | [c6010203](https://www.testsprite.com/dashboard-v3/o/6ee2ba3c-e72a-5d4e-9651-5aff8827551e/projects/b3c3d776-34a9-456e-b605-3ddbcc09466b/execution/c6010203-d6e1-40a1-af9c-2f7b97d95624) |
| [`033db1e`](https://github.com/nftkingiii/feint/commit/033db1eb9d5dc5a0d72a9f064c2ad13b7e2d4d8a) | 2026-10-18 18:42 | 77/84 · 5 failed · 2 blocked | failure | [7096f2f5](https://www.testsprite.com/dashboard-v3/o/6ee2ba3c-e72a-5d4e-9651-5aff8827551e/projects/b3c3d776-34a9-456e-b605-3ddbcc09466b/execution/7096f2f5-8f57-4536-8f1b-2c34fa49b322) |
| [`6573d21`](https://github.com/nftkingiii/feint/commit/6573d21b19453e00daa5693116e9bb6a830c376d) | 2026-10-18 18:56 | 82/84 · 2 failed | failure | [27f05d52](https://www.testsprite.com/dashboard-v3/o/6ee2ba3c-e72a-5d4e-9651-5aff8827551e/projects/b3c3d776-34a9-456e-b605-3ddbcc09466b/execution/27f05d52-4185-49a6-b83d-13f684786ad5) |
| [`f88c54d`](https://github.com/nftkingiii/feint/commit/f88c54defca9dc2256fc28acafda207b260f1db7) | 2026-10-18 19:08 | 83/84 · 1 failed | failure | [b5f890a3](https://www.testsprite.com/dashboard-v3/o/6ee2ba3c-e72a-5d4e-9651-5aff8827551e/projects/b3c3d776-34a9-456e-b605-3ddbcc09466b/execution/b5f890a3-c95c-4f56-a8ff-ca5103d99972) |
| [`9483980`](https://github.com/nftkingiii/feint/commit/948398041495ae9fea2a644a6fc62837d8fe218d) | 2026-10-18 19:20 | 82/84 · 2 failed | failure | [16425123](https://www.testsprite.com/dashboard-v3/o/6ee2ba3c-e72a-5d4e-9651-5aff8827551e/projects/b3c3d776-34a9-456e-b605-3ddbcc09466b/execution/16425123-f6cc-419b-92a4-08be5872ae46) |
| [`50eb56c`](https://github.com/nftkingiii/feint/commit/50eb56c27805d92e6d998c3ec8b434cf9fe2772a) | 2026-10-18 19:31 | 82/84 · 2 failed | failure | [7a2fe2dd](https://www.testsprite.com/dashboard-v3/o/6ee2ba3c-e72a-5d4e-9651-5aff8827551e/projects/b3c3d776-34a9-456e-b605-3ddbcc09466b/execution/7a2fe2dd-fb32-4230-8bd5-19fd20bca4cb) |
| [`94f0319`](https://github.com/nftkingiii/feint/commit/94f0319bf8eb84c7af76ba823492ca42963ca360) | 2026-10-18 19:43 | 83/84 · 1 failed | failure | [87319bcf](https://www.testsprite.com/dashboard-v3/o/6ee2ba3c-e72a-5d4e-9651-5aff8827551e/projects/b3c3d776-34a9-456e-b605-3ddbcc09466b/execution/87319bcf-6a7f-4ff5-af3f-adb6b6ada368) |
| [`b77a2f0`](https://github.com/nftkingiii/feint/commit/b77a2f07f875ed7c731a53241ef8f4df2a9b676f) | 2026-10-19 | check run **failure**: “Not enough credits: 168 tests need 84, 15 available.” | failure | [billing/delivery](https://www.testsprite.com/dashboard-v3/o/6ee2ba3c-e72a-5d4e-9651-5aff8827551e/projects/b3c3d776-34a9-456e-b605-3ddbcc09466b/settings/github-action?delivery=8fef1fd4-cbaa-11f1-84a8-5b7449129d5e) |
| [`0d4c840`](https://github.com/nftkingiii/feint/commit/0d4c8404f3b41fd729d4e25e9e78e027ae314728) | 2026-10-20 | same credit failure, 15 available | failure | [delivery](https://www.testsprite.com/dashboard-v3/o/6ee2ba3c-e72a-5d4e-9651-5aff8827551e/projects/b3c3d776-34a9-456e-b605-3ddbcc09466b/settings/github-action?delivery=140408ba-ccbf-11f1-9a85-77a6dce96ef1) |
| [`7e1e9c3`](https://github.com/nftkingiii/feint/commit/7e1e9c33f7b6edceda69b4636452ed70bacc5824) | 2026-10-22 09:07 | “All 168 tests passed” | success | [cee5eb34](https://www.testsprite.com/dashboard-v3/o/6ee2ba3c-e72a-5d4e-9651-5aff8827551e/projects/b3c3d776-34a9-456e-b605-3ddbcc09466b/execution/cee5eb34-9463-4291-812e-23e207055dc8) |

After the merge:

| Commit | TestSprite V3 | State | Execution |
|---|---|---|---|
| Merge [`4f56856`](https://github.com/nftkingiii/feint/commit/4f56856589c20a6833f885f6ad4bc6be917cee42) | 167/168 passed · 1 failed | **success** | [d1206384](https://www.testsprite.com/dashboard-v3/o/6ee2ba3c-e72a-5d4e-9651-5aff8827551e/projects/b3c3d776-34a9-456e-b605-3ddbcc09466b/execution/d1206384-1657-4685-ae25-f62f1cf5491b) |
| [`d33719c`](https://github.com/nftkingiii/feint/commit/d33719cc3a87c6715f586982cb965ea920802c75) (current `main`) | “All 168 tests passed” | success | [5495ae8e](https://www.testsprite.com/dashboard-v3/o/6ee2ba3c-e72a-5d4e-9651-5aff8827551e/projects/b3c3d776-34a9-456e-b605-3ddbcc09466b/execution/5495ae8e-b054-4c57-bcae-86a1b7b4e3c0) |

The green PR comment header says 168/168. The table in that same comment lists **50 rows and 41 unique titles** (9 titles repeated). https://github.com/nftkingiii/feint/pull/5

Vercel preview on the PR head: https://feint-git-daily-case-and-share-grid-kingsols-projects.vercel.app (Vercel bot comment on PR #5). Every PR #5 commit above also has a successful Vercel status.

Open Dependabot PRs have Vercel and **no** TestSprite check: [#6](https://github.com/nftkingiii/feint/pull/6), [#7](https://github.com/nftkingiii/feint/pull/7), [#8](https://github.com/nftkingiii/feint/pull/8). Closed Dependabot PRs #1–#4 report no checks.

### Required check

**Not required.** `GET /repos/nftkingiii/feint/branches/main` returned `protected: false` and `required_status_checks.enforcement_level: "off"` with an empty checks list (2026-10-23). `GET /repos/nftkingiii/feint/rulesets` returned `[]`. `GET /repos/nftkingiii/feint/branches/main/protection` returned **403**. Nothing in the API can block a merge on a red TestSprite status. The first PR run also reported 4 failures with state **success**, and the merge commit later reported 1 failure with state **success**.

### CLI, MCP, plans, schedules, triage

- **CLI:** none. No `testsprite` script, no workflow.
- **MCP:** none.
- **Plans in git:** the PRD is committed (`docs/PRD.md`). The generated TestSprite plan is not. Count of committed plan files: **0**.
- **Schedules:** none. No nightly, no on-merge workflow. TestSprite did run once on the merge commit and once on the following doc commit because those are pushes, not because of a schedule.
- **Triage:** manual, in [LOOP.md](https://github.com/nftkingiii/feint/blob/main/LOOP.md). No failure issues, no auto-fix bot. The PR comment is a single overwritten summary.

### Red to green

On PR #5 the status went from 39/44 (recorded success despite failures) through a string of failures (38/44, 39/44, 36/44, then 77/84 up to 83/84), two credit failures, then “All 168 tests passed” on `7e1e9c3`. Many red rows were test-plan edits (random rounds, an old “Trust” label, swipe the agent cannot drag). The product fixes that match the claimed bugs are in the commits below.

### Credits

Two pushes did not execute tests: “Not enough credits: 168 tests need 84, 15 available.” That line is also the best evidence that TestSprite itself counted **168 tests costing 84 credits** before the green run, which matches LOOP.md’s note that saving the plan duplicated each case.

## Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
|---|---|---|---|---|
| Vitest unit | 41 (`README.md`) | **41 passed / 41** locally, Vitest 4.1.11, 274ms | https://github.com/nftkingiii/feint/blob/main/src/lib/engine.test.js (includes `it.each` over 4 countries and 5 link variants), https://github.com/nftkingiii/feint/blob/main/src/lib/history.test.js, https://github.com/nftkingiii/feint/blob/main/src/components/segment.test.js | VERIFIED |
| Playwright | No current total in the README. PR #5’s opening body said 6 (3 tests × 2 projects). LOOP.md later cites 16/16, 20/22, 22/24, 28/30 | **16 test definitions × 2 projects = 32.** This review ran **32/32 passed** against https://feint.vercel.app (Pixel 7 and desktop Chrome, ~7s each) | https://github.com/nftkingiii/feint/blob/main/e2e/clues.spec.js, https://github.com/nftkingiii/feint/blob/main/e2e/round.spec.js, https://github.com/nftkingiii/feint/blob/main/e2e/swipe.spec.js | VERIFIED for the current suite. Historical LOOP totals were not re-run at those SHAs |
| TestSprite plan | “84-test” plan; green check “168” | Status text is 44, then 84, then 168. Comment table shows 50 rows / 41 unique titles. Dashboard bodies are not public | PR #5 status links above | 84 is true only for the middle runs. The green run is reported as 168. The unique names in the PR comment are 41 |
| Generated plans committed | Implied by “TestSprite on every pull request” | **0** plan files. One PRD | https://github.com/nftkingiii/feint/blob/main/docs/PRD.md | The PRD is real. The plan is not in git |
| Content pools | 4 decks, 10 patterns, 8 messages a round | NG 11 cards (8 scam / 3 genuine), US 10 (7/3), GB 10 (7/3), global 8 (6/2). `buildDeck` keeps 8 with at least 2 genuine | https://github.com/nftkingiii/feint/blob/main/src/data/countries.js, https://github.com/nftkingiii/feint/blob/main/src/lib/engine.js#L3 | VERIFIED |

Local run: `npm install` then `npm test` in a clone. Playwright used system Chrome and `BASE_URL=https://feint.vercel.app` (phone project, then desktop). `node_modules` deleted afterward. No secrets required.

## Claim verification

| Claim | Verdict | Evidence |
|---|---|---|
| Eight messages land on your phone | VERIFIED as a game, not as real SMS | `DECK_SIZE = 8` and the unit test “8 cards, at least 2 genuine and 4 scams”. Phone Playwright (Pixel 7) walked messages 1–8 on the live site for NG, US, and GB seeds and passed. Messages are simulated cards in the browser. https://github.com/nftkingiii/feint/blob/main/src/lib/engine.js#L3 https://feint.vercel.app/?c=ng&s=42 |
| Decks for Nigeria, US, UK, and global | VERIFIED | Codes `ng`, `us`, `gb`, `global` in https://github.com/nftkingiii/feint/blob/main/src/data/countries.js. Live routes `/?c=ng&s=42`, `/?c=us&s=7`, `/?c=gb&s=4242`, `/?c=global&s=3` return the SPA (200) and the phone suite played the first three |
| Every PR gets a Vercel preview and an 84-test TestSprite run through the GitHub App | FALSE | PR #5 got both, but its early runs were 44 tests and the green run says 168, not 84. Dependabot PRs #6–#8 have Vercel only. PRs #1–#4 have no checks. Direct pushes before PR #5 have Vercel and no TestSprite status. https://github.com/nftkingiii/feint/pull/8 |
| A failing check holds the merge | FALSE | `main` is unprotected (`protected: false`, enforcement off, rulesets `[]`; protection endpoint 403). The author merged by hand. A 4-failure run was status success, and the merge commit’s 167/168 was also status success. Waiting until `7e1e9c3` was green was author discipline, plus a credit outage, not a GitHub gate |
| PR #5 checks caught real bugs: clue taps hit the wrong phrase | VERIFIED as a code fix on a red streak | `3adceeb` sets `.seg { display: inline-block }` and says centre-of-box clicks missed “send $400” / “this is my new number”. Preceding status on `b5f82c6` was 38/44 failed. Live clue-centre tests passed. GitHub status text does not name the bug; the name is the commit and LOOP.md. https://github.com/nftkingiii/feint/commit/3adceebad69470d9afa5924d6a25a0597dadfe2a |
| Card back covered the message | VERIFIED the same way | `033db1e` hides the turned-away face. Status on that commit was 77/84 failed (the fix was already in the commit that was tested; the prior red run is `3f3d71f`, 38/44). Live test “only the face of the card that is showing can be used” passed. https://github.com/nftkingiii/feint/commit/033db1eb9d5dc5a0d72a9f064c2ad13b7e2d4d8a |
| Savings dropped again after rewind | VERIFIED the same way | `3f3d71f` stops charging a rewound card in `lossTaken` and in the meter. https://github.com/nftkingiii/feint/commit/3f3d71f97c491e93e01b9fe4c001325c3b62c936. Live rewind test passed |
| Unknown paths 404’d | VERIFIED | `3adceeb` adds the rewrite. Live `GET /zz` and `GET /does-not-exist` are **200** HTML with the app title, not a Vercel 404. Playwright “an unknown path still loads the game” passed on the live site. https://github.com/nftkingiii/feint/blob/main/vercel.json https://feint.vercel.app/zz |
| No way to leave a round | VERIFIED the same way | `9483980` turns the wordmark into “Leave the round”. Status on that commit was 82/84 failed. Live test passed. https://github.com/nftkingiii/feint/commit/948398041495ae9fea2a644a6fc62837d8fe218d |
| Final run passed every test and PR #5 merged on green | VERIFIED for the PR head, with a caveat | `7e1e9c3` status “All 168 tests passed” at 09:07 UTC; merge at 09:30 UTC. https://github.com/nftkingiii/feint/pull/5. “Every test” is 168 reported cases, which LOOP.md says is the 84-plan saved twice. Nine minutes after the merge, `4f56856` reported **167/168 · 1 failed** and TestSprite still set state success |
| Every run is logged in LOOP.md | FALSE | Most PR fractions match a LOOP.md row. These do not: `3adceeb` (39/44 · 5 failed) has no row; the post-merge 167/168 failure is absent; `d33719c` (168 passed) is after the log commit. Runs 2–4 have no execution id, so those rows are author narrative only. https://github.com/nftkingiii/feint/blob/main/LOOP.md |

## Code quality

Small, readable JavaScript. The engine is pure and documented; country content is data, not JSX. Phrase segmentation has its own unit tests. The card exposes a real button per phrase, a named group for the swipe, and arrow-key handling.

Smells:

- No TypeScript, no ESLint, no Prettier config, no unit or Playwright job in CI. The only automated PR signal is Vercel plus TestSprite.
- `package.json` says `"private": true` on a public repo.
- The catch-all rewrite returns **200 HTML** for missing assets (`GET /assets/does-not-exist.js` was `text/html`). That fixed the SPA 404 and also hides missing files.
- Savings and accuracy use different rules (`judge(decision)` vs `rewound ? 'fooled'`). The current tests cover the intended case.
- Several “fixes” in LOOP.md are edits to the test plan or the PRD (random message order, leftover “Trust” meter, drag the agent cannot perform). One content change exists because a test tapped the lost-phone excuse (`f88c54d`).
- Google Fonts loaded from a third party in `index.html`.
- TestSprite’s pass/fail state does not match the fraction on at least two commits.

## Live-site behavior

Checked 2026-10-23 with curl and Playwright against https://feint.vercel.app.

| URL | HTTP | What loaded |
|---|---|---|
| `/` | 200 in ~45ms, `x-vercel-cache: HIT` | SPA shell, title “Feint · Spot the scam before it spots you” |
| `/?c=ng&s=42`, `/?c=us&s=7`, `/?c=gb&s=4242`, `/?c=global&s=3` | 200 | Same shell. Phone and desktop Playwright then played the NG, US, and GB rounds |
| `/?c=ng&s=42&r=IIAIIIAI` | 200 | Same shell (case file is client-rendered) |
| `/?c=zz` | 200 | Same shell; unknown country is handled in the client |
| `/zz`, `/does-not-exist` | 200 HTML, not 404 | Rewrite works |
| `/favicon.svg` | 200 `image/svg+xml` | |
| `/assets/does-not-exist.js` | 200 `text/html` | Missing static files are the app shell |

HSTS is set (`max-age=63072000; includeSubDomains; preload`). No CSP header on the document response.

Playwright on the live origin, system Chrome: **16/16 phone and 16/16 desktop**, including drag-right/drag-left, rewind savings, pip/accuracy after a rewind, phrase-centre hits for three full rounds, the unknown path, and leaving via the wordmark.

## Demo

A public video exists. oEmbed and the watch page: title **Feint**, author **nftking** (https://www.youtube.com/@NFTKINGIII), description “Feint: Spot the scam before it spots you”, published **Oct 22, 2026**, 2 views. https://youtu.be/b4JNJU2lWkU

Length: UNVERIFIED. The player endpoint returned `LOGIN_REQUIRED`, and the watch HTML had no `lengthSeconds` for this id. What the video actually shows was not watched in this review.

## Weaknesses / risks for judges

- The merge-gate sentence is not true. `main` is unprotected, and TestSprite has reported success with failures still in the description.
- “Every PR” and “84 tests” oversell one human PR whose green run is labeled 168, with 41 unique titles visible in the comment.
- LOOP.md is good, and it is also the author’s interpretation. Dashboard pages are login-walled, so the bug names are not independently readable from TestSprite. The code diffs and the live Playwright suite support the five named fixes.
- A large share of the red-to-green path is pinning the agent to fixed seeds and rewriting steps. That is honest in the log, and it means the final 168 is a tamer suite than the early failures.
- No CLI, no MCP, no committed plan, no schedule, no CI for the 41 unit tests or the Playwright suite. Those tests are not what holds a merge.
- Credits ran out at 15 remaining, so two pushes produced no tests.
- The product is a short practice game. Amounts are illustrative. It does not see a real SMS inbox.
- After merge, a run with 1 failed test was still marked success, and that run is not in LOOP.md.

## Where it beats Ninety

Ninety is the Schengen 90/180 calculator with an EU Commission oracle, REST, and MCP (https://github.com/mohamedwael201193/ninety, live https://ninety-coral.vercel.app). Feint does not beat Ninety on suite size, backend tests, MCP, schedules, or committed TestSprite plans. These are the places it is ahead:

1. **A written verdict for each red TestSprite journey, and they did not merge the feature PR while the head check was red.** LOOP.md labels each failure as a real gap, a test assumption, or a tool limit, and names the commit. https://github.com/nftkingiii/feint/blob/main/LOOP.md. PR #5’s head `7e1e9c3` was “All 168 tests passed” before the merge. https://github.com/nftkingiii/feint/commit/7e1e9c33f7b6edceda69b4636452ed70bacc5824. Ninety’s stated weakness is merging PR #63 while TestSprite V3 was red, and having no triage that splits UI failures from engine failures. To match, Ninety needs that split on each red run (a ledger is enough) and a habit of not merging the PR whose TestSprite check is red. Feint’s branch is still not protected, so the bar to exceed is a required check that actually fails the status when any test fails.
2. **A committed browser suite for the gesture TestSprite cannot do.** Playwright drags the card with the mouse on desktop and phone, because the log says the TestSprite browser has no drag. https://github.com/nftkingiii/feint/blob/main/e2e/swipe.spec.js. This review ran that suite on production: 32/32. The PRD also tells the agent to press arrow keys instead. https://github.com/nftkingiii/feint/blob/main/docs/PRD.md. Ninety would need a committed browser test for any interaction its TestSprite agent cannot perform, and to keep it green on the deployed URL.
3. **A public demo video.** https://youtu.be/b4JNJU2lWkU (title and author confirmed; length not confirmed). Ninety has no demo video. Matching it is a short recording of the real product, not a title card.
4. **Fixed seeds with known answers as the way to stop an agent guessing a random round.** The PRD publishes `/?c=ng&s=42` (perfect run `IIAIIIAI`), `/?c=us&s=7`, and `/?c=gb&s=4242`. https://github.com/nftkingiii/feint/blob/main/docs/PRD.md. Ninety’s plans are stronger because they are in git; the technique Ninety does not show is rewriting the agent steps onto a fixture instead of treating a wrong agent decision as an app bug.

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 6 | Real scam-literacy problem, sourced country decks, no account. It is a short practice game with fake money, not a defense on a live phone |
| TestSprite depth | 5 | Many real GitHub App runs on one PR, with failures and a log. No CLI, MCP, schedule, committed plan, or required check. Pass/fail state is inconsistent |
| Verifiability | 6 | Status fractions, unit tests, and live Playwright are checkable and mostly match the log. The gate, “every PR”, “84”, and “every run logged” do not hold. Dashboard detail is not public |
| Polish | 7 | Coherent UI, keyboard and phone paths, fast SPA, tests green on production. No types, lint, or CI for those tests |
| Demo | 5 | Video exists (Oct 22, 2026, title Feint). Length and contents not verified |
| **Overall** | **6** | A polished, honest-looking loop on a small game, with the headline process claim (the check holds the merge on every PR) overstated |
