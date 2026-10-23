# Vetly

- **Name:** Vetly
- **Author:** chulopp (commit author name on GitHub: Fallahiqbal; YouTube demo channel: Deka)
- **Repo:** https://github.com/chulopp/Vetly (submitted as https://github.com/chulopp/vetly)
- **Live:** https://vetly-cut.vercel.app/ (GitHub homepage https://vetly-snowy.vercel.app 307-redirects there)
- **TestSprite PR:** https://github.com/chulopp/Vetly/pull/4 (ownership fix). App also ran on PRs https://github.com/chulopp/Vetly/pull/1, https://github.com/chulopp/Vetly/pull/2, https://github.com/chulopp/Vetly/pull/3, https://github.com/chulopp/Vetly/pull/5
- **Demo:** https://youtu.be/NROTFsDAVhs
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7
- **HEAD reviewed:** https://github.com/chulopp/Vetly/commit/64d9808

## What it is

Vetly is a no-account freelance offer calculator. A freelancer pastes a client message or fills a form (or picks a preset) and gets an effective hourly rate after platform fee, communication overhead, and revision load, a client risk score from 0 to 100, an Accept / Negotiate / Reject verdict, and counter-offer numbers plus contract conditions when the matrix calls for them. Saved offers can be compared and opened on a public read-only link. Smart Paste and the reply draft call DeepSeek; the score itself is a pure function. The user is a freelancer deciding whether a gig is worth it. The value is a transparent, testable number instead of a gut check. The weights are heuristics (deposit, payment terms, four flags), not outcome data.

## Architecture

Next.js 15 App Router, React 19, TypeScript (strict), Tailwind 4, Zod, Drizzle, Neon Postgres, DeepSeek, deployed on Vercel. `npm run build` is `next build` only (https://github.com/chulopp/Vetly/blob/main/package.json). No `vercel.json`. No `.github/` workflows (Actions API `total_count: 0`, https://github.com/chulopp/Vetly/actions).

| Piece | Role | Link |
|---|---|---|
| `analyzeOffer` | Pure entry: rate, risk, 3×3 matrix, counter-offer | https://github.com/chulopp/Vetly/blob/main/src/lib/engine/index.ts |
| Decision matrix | HIGH_SURPLUS / FAIR / DEFICIT × LOW / MEDIUM / HIGH → ACCEPT / NEGOTIATE / REJECT | https://github.com/chulopp/Vetly/blob/main/src/lib/engine/decision.ts#L46-L55 |
| Risk | Deposit, terms, flags; `min(100, sum)`; tiers 0–30 / 31–60 / 61–100 | https://github.com/chulopp/Vetly/blob/main/src/lib/engine/risk.ts |
| Constants | +10% overhead, +5%/revision after 2, +35% unlimited, fee math inputs | https://github.com/chulopp/Vetly/blob/main/src/lib/engine/constants.ts |
| Currency | Static ISO 4217 list, 155 codes (https://github.com/chulopp/Vetly/blob/main/src/lib/currency/iso4217.json) | https://github.com/chulopp/Vetly/blob/main/src/lib/currency/index.ts |
| POST `/api/offers` | Zod → `analyzeOffer` → Neon insert → `my_offers` cookie | https://github.com/chulopp/Vetly/blob/main/src/app/api/offers/route.ts |
| Extract / draft | DeepSeek only; extract does not touch the DB | https://github.com/chulopp/Vetly/blob/main/src/lib/llm/extract.ts , https://github.com/chulopp/Vetly/blob/main/src/app/api/draft/route.ts |
| Presets + fixture aliases | Three product presets plus sample rows and many id aliases (`shared`, `test`, `preset-2`, …) | https://github.com/chulopp/Vetly/blob/main/src/lib/presets.ts |
| Ownership | Cookie parsed server-side; share route forces visitor | https://github.com/chulopp/Vetly/blob/main/src/lib/ownershipCookie.ts , https://github.com/chulopp/Vetly/blob/main/src/app/share/%5Bid%5D/page.tsx |

`src/lib/engine/` imports only sibling modules and `@/lib/currency`. No LLM, Drizzle, or `fetch` in that folder. Persistence and drafts sit outside the function. Without `DATABASE_URL`, save returns 503 and the page can still render preset ids by running the engine in memory (https://github.com/chulopp/Vetly/blob/main/src/lib/offers/service.ts).

## TestSprite integration depth

**Score: 5 / 10.** The GitHub App ran a real red-to-green loop on every PR and the last product PR finished 53/53 with 0 blocked. That is the whole integration. There is no CLI, no MCP config, no plan file in git, no workflow, no schedule, and the check context stays `success` when tests fail, so it cannot block a merge.

### GitHub App

Context name `TestSprite V3` on all 5 merged PRs. Bot `testsprite[bot]` commented on each PR (suggested-fix prompts and screenshots). Latest comment per PR is the only one stored (the marker comment is edited in place). Dashboard project: https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b

Latest rollup (what GitHub shows on the PR now):

| PR | Merged | Latest TestSprite description | Execution | Also on the PR |
|---|---|---|---|---|
| [#1](https://github.com/chulopp/Vetly/pull/1) | 2026-10-17T05:47:18Z | 27/38 passed · 4 failed · 7 blocked | [0c3741c0](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/0c3741c0-5a77-4ddf-a2ca-63753bb1c1a3) | Vercel success |
| [#2](https://github.com/chulopp/Vetly/pull/2) | 2026-10-17T08:31:20Z | 30/38 passed · 2 failed · 6 blocked | [95f60000](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/95f60000-3d8c-48f4-952d-872a48b45b69) | Vercel success |
| [#3](https://github.com/chulopp/Vetly/pull/3) | 2026-10-18T01:32:14Z | 33/38 passed · 2 failed · 3 blocked | [cc8757ff](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/cc8757ff-7222-4330-8e83-57308f4919be) | Vercel success |
| [#4](https://github.com/chulopp/Vetly/pull/4) | 2026-10-18T07:31:07Z | 35/38 passed · 3 blocked | [631a2c24](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/631a2c24-0b88-4a3e-b9f3-f7067d26ee4f) | Vercel success |
| [#5](https://github.com/chulopp/Vetly/pull/5) | 2026-10-23T02:39:24Z | All 53 tests passed | [8ff95254](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/8ff95254-8950-4d60-abd9-994e7ec07bcd) | Vercel success. Bot comment: "53 of 53 tests green" |

The suite grew from 38 cases (PRs 1–4) to 53 cases (PR 5). Plans are not in the repository (no `testsprite` path in history).

### Required check?

- `GET /repos/chulopp/vetly/branches/main/protection` → **403** `Resource not accessible by integration` (reviewer call, 2026-10-23).
- `GET /repos/chulopp/vetly/rulesets` → **`[]`**.
- No evidence of a blocked merge. PRs 1, 2, and 3 merged while the TestSprite description still listed failures. PR 4 merged with 3 blocked.
- The status **state is `success` even when the description reports failures.** Example: commit [db717a9](https://github.com/chulopp/Vetly/commit/db717a9) status `success`, description `13/38 passed · 20 failed · 5 blocked`, execution [b4fb543e](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/b4fb543e-8ab8-416d-98e6-bec71f84a6b2). A required-check rule on this context would still be green.

### CLI, MCP, plans, schedules, triage

- **CLI:** none. No workflow, no `testsprite` command, no config file.
- **MCP:** none in the repo.
- **Plans committed:** 0 files.
- **Schedules / nightly / on-merge:** none. Direct pushes to `main` after the PR 5 merge ([95be7c8](https://github.com/chulopp/Vetly/commit/95be7c8), [f1ff090](https://github.com/chulopp/Vetly/commit/f1ff090), [64d9808](https://github.com/chulopp/Vetly/commit/64d9808)) have a Vercel status only.
- **Triage:** bot PR comments only. Issue list is empty (https://github.com/chulopp/Vetly/issues). No reviews. No auto-fix bot. The author committed the fixes.
- **Credits:** no usage figures in the repo or the check text. UNVERIFIED.

### Red → green loop (every App execution found on PR commits)

Status text is the commit combined-status description. All of these reported state `success`.

| PR | Commit | When (status) | Result | Execution |
|---|---|---|---|---|
| 1 | [a46c45f](https://github.com/chulopp/Vetly/commit/a46c45f) | 2026-10-17T05:10:11Z | 0/38 passed · 38 blocked | [48d60624](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/48d60624-5d41-4bde-91ab-2cd9ea91ac44) |
| 1 | [1413df2](https://github.com/chulopp/Vetly/commit/1413df2) | 2026-10-17T05:30:17Z | 27/38 · 4 failed · 7 blocked | [0c3741c0](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/0c3741c0-5a77-4ddf-a2ca-63753bb1c1a3) |
| 2 | [303698f](https://github.com/chulopp/Vetly/commit/303698f) | 2026-10-17T07:41:44Z | 30/38 · 2 failed · 6 blocked | [95f60000](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/95f60000-3d8c-48f4-952d-872a48b45b69) |
| 3 | [eb22654](https://github.com/chulopp/Vetly/commit/eb22654) | 2026-10-17T16:15:27Z | 26/38 · 3 failed · 9 blocked | [a2634f4e](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/a2634f4e-8572-428b-afba-a099699e13a7) |
| 3 | [c1d5445](https://github.com/chulopp/Vetly/commit/c1d5445) | 2026-10-17T17:38:46Z | 29/38 · 2 failed · 7 blocked | [629ab51a](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/629ab51a-b5ee-4a45-9cc9-7dcd4902fc78) |
| 3 | [0620a6f](https://github.com/chulopp/Vetly/commit/0620a6f) | 2026-10-18T00:42:36Z | 30/38 · 3 failed · 5 blocked | [b046cd85](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/b046cd85-8b26-43e4-bc1a-956979a37f8d) |
| 3 | [6996b01](https://github.com/chulopp/Vetly/commit/6996b01) | 2026-10-18T00:56:22Z | 33/38 · 2 failed · 3 blocked | [5d12f5c2](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/5d12f5c2-5380-4608-82d2-24a112425c87) |
| 3 | [6878ce2](https://github.com/chulopp/Vetly/commit/6878ce2) | 2026-10-18T01:12:16Z | 33/38 · 2 failed · 3 blocked | [cc8757ff](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/cc8757ff-7222-4330-8e83-57308f4919be) |
| 4 | [d3e9259](https://github.com/chulopp/Vetly/commit/d3e9259) | 2026-10-18T03:55:11Z | 31/38 · 2 failed · 5 blocked | [f2e9e1d8](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/f2e9e1d8-5930-4836-9d16-ef2f169ed17f) |
| 4 | [db717a9](https://github.com/chulopp/Vetly/commit/db717a9) | 2026-10-18T05:52:01Z | 13/38 · 20 failed · 5 blocked | [b4fb543e](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/b4fb543e-8ab8-416d-98e6-bec71f84a6b2) |
| 4 | [49a4340](https://github.com/chulopp/Vetly/commit/49a4340) | 2026-10-18T06:26:23Z | 27/38 · 3 failed · 8 blocked | [f9cd819c](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/f9cd819c-3a89-4f85-b9b8-7ca78be36752) |
| 4 | [a02aea3](https://github.com/chulopp/Vetly/commit/a02aea3) | 2026-10-18T06:37:59Z | 33/38 · 2 failed · 3 blocked | [4e7895a5](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/4e7895a5-93d0-4756-bb85-9a461dcc398b) |
| 4 | [af46579](https://github.com/chulopp/Vetly/commit/af46579) | 2026-10-18T06:56:41Z | 35/38 · 2 failed · 1 blocked | [553a2539](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/553a2539-e01c-4265-9a87-4d3789af6722) |
| 4 | [26929fc](https://github.com/chulopp/Vetly/commit/26929fc) | 2026-10-18T07:17:50Z | 35/38 · 3 blocked | [631a2c24](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/631a2c24-0b88-4a3e-b9f3-f7067d26ee4f) |
| 5 | [4ca0606](https://github.com/chulopp/Vetly/commit/4ca0606) | 2026-10-21T14:05:24Z | 45/53 · 8 failed | [1af1fa80](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/1af1fa80-1ac9-433c-b2be-14bd3634d8c3) |
| 5 | [91f364c](https://github.com/chulopp/Vetly/commit/91f364c) | 2026-10-21T23:09:12Z | 48/53 · 5 failed | [b2553b7e](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/b2553b7e-c3c9-40bd-a313-05e66fffdaf1) |
| 5 | [4f75008](https://github.com/chulopp/Vetly/commit/4f75008) | 2026-10-22T01:25:40Z | 48/53 · 5 failed | [d17d1d31](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/d17d1d31-3733-428f-962f-03a3dd5f160f) |
| 5 | [1ba2079](https://github.com/chulopp/Vetly/commit/1ba2079) | 2026-10-22T02:47:39Z | 51/53 · 2 failed | [179e3871](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/179e3871-9f0a-4f44-a639-28d1b7df9bee) |
| 5 | [e7f6ff7](https://github.com/chulopp/Vetly/commit/e7f6ff7) | 2026-10-22T03:33:44Z | 49/53 · 4 failed | [b6e27527](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/b6e27527-e2a7-417e-918e-557aefbf4075) |
| 5 | [847a726](https://github.com/chulopp/Vetly/commit/847a726) | 2026-10-22T22:24:54Z | 52/53 · 1 failed | [d47c809c](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/d47c809c-f48c-4504-aefb-ae6eacdeaf99) |
| 5 | [2b6c62a](https://github.com/chulopp/Vetly/commit/2b6c62a) | 2026-10-22T22:37:53Z | 50/53 · 3 failed | [9e303af4](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/9e303af4-2467-407a-8a33-1306ae65cfec) |
| 5 | [e11d204](https://github.com/chulopp/Vetly/commit/e11d204) | 2026-10-23T02:34:05Z | All 53 tests passed | [8ff95254](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/8ff95254-8950-4d60-abd9-994e7ec07bcd) |

22 executions. Coverage of commits is partial: 8 of 39 commits on PR 5 have a TestSprite status. The merge commit [26156aa](https://github.com/chulopp/Vetly/commit/26156aa) has Vercel only; the green run is on the PR head five minutes earlier.

The README row for PR 5 cites run `9e303af4` as "53 passed, 0 failed, 0 blocked" (https://github.com/chulopp/Vetly/blob/main/README.md#L141). That execution is the **50/53 · 3 failed** run above. The green run is `8ff95254`.

## Test inventory

| Layer | Claimed | Verified | Evidence | Status |
|---|---|---|---|---|
| Vitest unit | 110, including boundary matrix, 9-cell table, currency rounding, fee cap, risk tiers, Zod 400 shape | **110 passed / 0 failed** locally (`npm ci` + `npx vitest run`, 2026-10-23, 661 ms, 8 files). `tsc --noEmit` clean. Expanded count: 9 `it.each` matrix cells (https://github.com/chulopp/Vetly/blob/main/tests/engine/decision.test.ts#L66-L81) + 24 Zod rejection cases (https://github.com/chulopp/Vetly/blob/main/tests/validation/offer.test.ts#L58-L85) + the remaining `it()` blocks under https://github.com/chulopp/Vetly/tree/main/tests | Local run has no hosted URL. Files linked. | **VERIFIED** (110). Not run in CI. |
| TestSprite E2E | 53/53, 0 failed, 0 blocked | Latest PR 5 status and bot comment: 53 passed, 53 total, no failed/blocked line | [8ff95254](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/8ff95254-8950-4d60-abd9-994e7ec07bcd) and https://github.com/chulopp/Vetly/pull/5 | **VERIFIED** for that execution. Cases are not in git, so the 53 names were not re-counted from source. |
| Sum "163 across 2 layers" | 110+53 | Arithmetic matches the two counts above | README https://github.com/chulopp/Vetly/blob/main/README.md#L103-L106 | **VERIFIED as a sum.** "Distinct" vs overlap, and "on every code change", are not true (see claims). |
| HTTP / API tests in repo | (not claimed as a third layer) | 0 route tests | `tests/` has no Next handler tests | n/a |
| Playwright / other | none claimed in-repo | none | no config | n/a |

Local Vitest does not need secrets. `node_modules` was deleted after the run. TestSprite was not re-executed (no CLI, cloud suite only).

## Claim verification

| Claim | Verdict | Evidence |
|---|---|---|
| Scores client risk 0–100 with Accept / Negotiate / Reject | **VERIFIED** | Cap and tiers: https://github.com/chulopp/Vetly/blob/main/src/lib/engine/risk.ts and https://github.com/chulopp/Vetly/blob/main/src/lib/engine/constants.ts. Matrix: https://github.com/chulopp/Vetly/blob/main/src/lib/engine/decision.ts#L47-L51. Live GET presets: [scope-creep-trap](https://vetly-cut.vercel.app/api/offers/scope-creep-trap) REJECT, risk 100 HIGH, rate 11.64, margin -61.2; [ideal-saas-mvp](https://vetly-cut.vercel.app/api/offers/ideal-saas-mvp) ACCEPT, risk 0 LOW; [corporate-net90](https://vetly-cut.vercel.app/api/offers/corporate-net90) NEGOTIATE, risk 55 MEDIUM. |
| 100% deterministic engine, zero LLM/DB coupling | **VERIFIED for `src/lib/engine/`** | No llm/db/network imports under that directory. Purity test: https://github.com/chulopp/Vetly/blob/main/tests/engine/analyze.test.ts. The app around it uses Neon and DeepSeek (https://github.com/chulopp/Vetly/blob/main/README.md#L74-L77). "100%" is a no-I/O property plus a unit test, not a cross-CPU proof. |
| 163 automated checks across 2 layers, on every code change | **Split.** 110+53 is the right sum. "Every code change" is **FALSE** | No Actions. Vitest is local only. 31 of 39 PR 5 commits have no TestSprite status. Post-merge docs pushes have Vercel only. |
| Vitest 110: boundary matrix, 9-cell table, currency rounding, fee caps, risk tiers, Zod 400 | **VERIFIED** | Local 110/110. Boundaries 30/31 and 60/61: https://github.com/chulopp/Vetly/blob/main/tests/engine/risk.test.ts. Nine cells: decision test above. Fee exactly 100 rejected: validation cases. Currency 0-decimal JPY/IDR: https://github.com/chulopp/Vetly/blob/main/tests/currency.test.ts. Zod tests assert the issue list the route maps to 400; they do not boot HTTP. Live POST `{budget:0}` to https://vetly-cut.vercel.app/api/offers returned 400 `VALIDATION_ERROR`. |
| TestSprite E2E 53/53 green, 0 blocked | **VERIFIED for the final PR 5 run only** | [8ff95254](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/8ff95254-8950-4d60-abd9-994e7ec07bcd). Earlier runs on the same PR were red (8 failed down to 1, then 3 failed). PR 4's best run still had 3 blocked. |
| Every push and every PR triggers Vitest and TestSprite against the live preview | **FALSE** | Vitest is not in CI (`package.json` `build` is `next build`). TestSprite is a PR App status on some commits, not on every push. First run was 38/38 blocked until a commit titled "rerun TestSprite suite without deployment protection" ([1413df2](https://github.com/chulopp/Vetly/commit/1413df2)). Preview targeting is implied by that commit and by Vercel preview checks, not printed as a URL in the status payload. |
| Merges only when all checks are green | **FALSE** | PRs 1–3 merged with failures in the TestSprite description (table above). The context state does not go red, so "all checks green" is true only because the App reports `success` anyway. Protection API 403; rulesets empty. |
| Push 1 was blocked because TestSprite caught a Ghost Owner localStorage bug | **FALSE as a blocked merge. The bug story is only partly evidenced.** | First execution [48d60624](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/48d60624-5d41-4bde-91ab-2cd9ea91ac44) was 38/38 blocked, then PR 1 merged at 27/38 with 4 failed. No status text says "Ghost Owner". Initial toolbar really did use localStorage: https://github.com/chulopp/Vetly/blob/eea653b/src/components/result/OwnerActions.tsx. PR 4 moved the check to the cookie. The PR 1 bot failure that is still on the comment is a not-found shared page, not an owner toolbar on a visitor session. README narrative: https://github.com/chulopp/Vetly/blob/main/README.md#L114-L115. |
| Migrated to an HttpOnly `my_offers` cookie | **FALSE for the cookie that is set** | `response.cookies.set` uses `httpOnly: false`: https://github.com/chulopp/Vetly/blob/main/src/app/api/offers/route.ts#L57-L65. `buildMyCookie` appends `HttpOnly` (https://github.com/chulopp/Vetly/blob/main/src/lib/ownershipCookie.ts#L65-L77) and the unit test asserts that, but the route imports `buildMyCookie` and never calls it. Live setter was not probed (a valid POST would persist an offer). |
| Final push all green | **VERIFIED for the PR 5 head that was merged. FALSE for later main pushes.** | [e11d204](https://github.com/chulopp/Vetly/commit/e11d204) at 02:34Z: TestSprite 53/53 and the PR also had Vercel success; merged 02:39Z. HEAD [64d9808](https://github.com/chulopp/Vetly/commit/64d9808) and the two docs commits before it have Vercel only. |
| README demo: High-Risk preset shows **63 / 100** | **FALSE** | Same preset is risk **100** in the unit test (https://github.com/chulopp/Vetly/blob/main/tests/engine/analyze.test.ts) and on https://vetly-cut.vercel.app/api/offers/scope-creep-trap. The other demo figures in that paragraph match: REJECT, $11.64/hr, -61.2%, counter budget 3866.67, 31 hours, three contract lines. Page: https://vetly-cut.vercel.app/result/scope-creep-trap |
| README: TestSprite run `9e303af4` is 53/53 | **FALSE** | That id is 50/53 · 3 failed (table above). |
| README: 12 iterations | **PARTIAL** | The README table has 12 rows. The App log above is 22 executions, plus local Vitest fixes that have no CI run URL. |

## Code quality

The engine is small, strict TypeScript, and easy to audit (rate / risk / decision split, named constants, exact strings in tests). `tsc --noEmit` passed on this review. There is no ESLint config, no Prettier config, no CI job for typecheck or tests, and `noUnusedLocals` is off, which is why the unused `buildMyCookie` import typechecks.

Smells that matter for judges:

- The production cookie is script-readable (`httpOnly: false`) while comments and tests describe HttpOnly. A page script can set `my_offers` and the server will treat that browser as the owner. That is the same trust boundary as the old localStorage check, moved into a cookie the server believes.
- Compare still falls back to localStorage when the server list is empty: https://github.com/chulopp/Vetly/blob/main/src/app/compare/CompareTable.tsx#L54-L70. The result page comment still says localStorage toggles the toolbar: https://github.com/chulopp/Vetly/blob/main/src/app/result/%5Bid%5D/page.tsx#L46.
- Share detection is a long allow-list of query keys (`shared`, `visitor`, `guest`, `preview`, `view=only`, …) plus client pathname checks: https://github.com/chulopp/Vetly/blob/main/src/app/result/%5Bid%5D/page.tsx#L61-L93 and https://github.com/chulopp/Vetly/blob/main/src/components/result/OwnerActions.tsx#L54-L67. `findPreset` maps ids such as `shared`, `test`, `demo`, and `1` onto real presets: https://github.com/chulopp/Vetly/blob/main/src/lib/presets.ts#L196-L220. That is fixture surface added so cloud tests resolve, not product behavior.
- Copy confirmation is shown even when both clipboard APIs fail (`void success` then `setCopied(true)`): https://github.com/chulopp/Vetly/blob/main/src/components/result/OwnerActions.tsx#L47-L51.
- README says a PR 5 failure was fixed by changing the test expectation to match the engine (https://github.com/chulopp/Vetly/blob/main/README.md#L117-L118). The edited TestSprite plan is not in git, so that edit cannot be reviewed.
- Offers are world-readable by id (`GET /api/offers/:id` has no ownership check). Ownership only changes the toolbar. Ids are `nanoid(12)` for real saves; preset ids are guessable on purpose.
- `npm audit` on the lockfile (local, 2026-10-23, no public URL): 11 vulnerabilities (6 moderate, 3 high, 2 critical). Not triaged.

## Live-site behavior

Checked 2026-10-23 with curl. No valid offer was created (that would write Neon). No extract/draft call with real client text (that would call DeepSeek).

| URL | Result |
|---|---|
| https://vetly-cut.vercel.app/ | 200 in ~0.11s. Title "Vetly — know what a project offer is really worth before you say yes". HTML includes presets SaaS MVP Project, High-Risk Fixed Scope, Enterprise Net-90, and the paste box. |
| https://vetly-cut.vercel.app/compare | 200, empty-state page (~15 KB). |
| https://vetly-cut.vercel.app/compare?sample=true | 200, ~43 KB (sample table payload; not clicked through in a browser). |
| https://vetly-cut.vercel.app/result/scope-creep-trap | 200, title "REJECT - Vetly offer analysis". HTML contains `$11.64` and `3,866.67`. Visitor banner is shown because presets are never owned, so this does not prove the owner toolbar. |
| https://vetly-cut.vercel.app/share/scope-creep-trap and https://vetly-cut.vercel.app/shared/scope-creep-trap | 200, same visitor banner ("This analysis was shared with you"), no "Copy share link". `/shared/:id` is a rewrite (https://github.com/chulopp/Vetly/blob/main/next.config.ts). |
| https://vetly-cut.vercel.app/no-such-page | 404. Visible copy: "This page doesn't exist." |
| https://vetly-cut.vercel.app/api/offers/scope-creep-trap | 200 JSON. REJECT, risk 100 HIGH, effective rate 11.64, margin -61.2, suggested budget 3866.67, max hours 31, three contract conditions. ~0.3–1.6s. |
| https://vetly-cut.vercel.app/api/offers/does-not-exist-id | 404 `NOT_FOUND`. |
| https://vetly-cut.vercel.app/api/offers/!! | 400 invalid id. |
| GET https://vetly-cut.vercel.app/api/offers | 400 missing `ids`. |
| POST invalid body | 400 field issues (budget, currency, hours, target rate). Whitespace extract text → 400. Bad JSON → 400 `PARSE_ERROR`. Draft `{}` → 400 `offerId` required. |
| https://vetly-snowy.vercel.app/ | 307 to https://vetly-cut.vercel.app/ |

Not verified in a browser: form submit, Smart Paste, draft generation, owner toolbar after a real save, compare sorting/pagination, mobile layout. Those need a persisted offer or a DeepSeek call.

## Demo

The video exists. oEmbed title: "Vetly — Know Your Real Hourly Rate Before You Say Yes | TestSprite S4 Demo" by Deka (https://www.youtube.com/@Deka-k9r). URL: https://youtu.be/NROTFsDAVhs. Length: **UNVERIFIED** (no duration in oEmbed; the watch page did not expose `lengthSeconds` to this client). What it shows: **UNVERIFIED** (not played). The README "30-second demonstration" script (https://github.com/chulopp/Vetly/blob/main/README.md#L189-L195) says the High-Risk gauge reads 63/100; the live preset is 100/100, so that script does not match the app.

## Weaknesses / risks for judges

- The headline process claims (every push, merge gate, HttpOnly, 63/100, run id `9e303af4` as 53/53) do not match GitHub or the code. A judge who checks the PR list will see three merges with failing TestSprite descriptions and a check that never goes red.
- TestSprite depth is App-only. Plans are not in the repo, so 53 cannot be diffed, re-run, or audited. The README admits at least one red test was cleared by editing the expectation.
- Ownership fix is incomplete relative to its own tests: the setter is not HttpOnly, compare still trusts localStorage, and PR 4 merged with 3 blocked share/compare cases.
- Large alias and query-param surface exists to satisfy the cloud runner.
- No CI for the 110 unit tests. A regression in the engine is invisible until someone runs Vitest locally.
- Heuristic risk weights are presented as a decision aid. They are not calibrated. That is disclosed in the constants comment, and it caps the product claim.
- Bot comment prose sometimes disagrees with its own table (PR 4 narrative said "30 of 33" while the check description and the comment's passed table are 35/38 with 3 blocked). Trust the status description.

## Where it beats Ninety

Narrow, and not on TestSprite architecture. Ninety already has the same GitHub App, plus a CLI gate, in-repo plans, and a much larger unit suite. Vetly has none of those.

1. **A public demo video.** https://youtu.be/NROTFsDAVhs (oEmbed title above). Ninety has no demo video. To match, Ninety needs a public walkthrough of the calculator, EES reconcile, and letter. Length and content of the Vetly video were not verified here.
2. **The merging commit of the last product PR had a fully green frontend run: 53 passed, 0 failed, 0 blocked**, status recorded at 2026-10-23T02:34:05Z on [e11d204](https://github.com/chulopp/Vetly/commit/e11d204), execution [8ff95254](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/8ff95254-8950-4d60-abd9-994e7ec07bcd), merge five minutes later. Ninety's PR #63 merged while TestSprite V3 was red (42/43). To exceed this, Ninety needs the merging commit green **and** a check that fails when tests fail. Vetly does not have that second part: its context stays `success` at 20 failed ( [b4fb543e](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/b4fb543e-8ab8-416d-98e6-bec71f84a6b2) ), and PRs 1–3 merged dirty. Ninety's PR #62 at 43/43 already matches the "a green run exists" bar, with plans in git.
3. **Server-rendered visitor mode on `/share/:id`, with the before/after in git.** Before: toolbar decided in the client from localStorage (https://github.com/chulopp/Vetly/blob/eea653b/src/components/result/OwnerActions.tsx). After: https://github.com/chulopp/Vetly/blob/main/src/app/share/%5Bid%5D/page.tsx forces `forceShared`, and live https://vetly-cut.vercel.app/share/scope-creep-trap renders "This analysis was shared with you" with no owner buttons. Ninety has no account and no share-link permission boundary, so it has nothing for TestSprite to catch in this class. To match the *evidence pattern*, Ninety would need one App failure that names a permission or UI boundary, a fix commit, and a later green run that actually covers that case. Vetly's own record is softer than the write-up: the words "Ghost Owner" are only in the README, and the ownership PR still merged 35/38 with 3 blocked.

No TestSprite technique here that Ninety lacks. Same App. Vetly has no CLI, no MCP, no committed plans, no schedule, and no red required check. The useful operational note is smaller: the first execution was 38/38 blocked until they made the preview reachable ([48d60624](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/48d60624-5d41-4bde-91ab-2cd9ea91ac44) → [0c3741c0](https://www.testsprite.com/dashboard-v3/o/75a1d0ca-b22c-50ed-b923-e53310ee24f8/projects/fe9555ab-4840-420c-8e8a-e47933ab956b/execution/0c3741c0-5a77-4ddf-a2ca-63753bb1c1a3), commit [1413df2](https://github.com/chulopp/Vetly/commit/1413df2)).

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 7 | Real decision, clear output, no account. Weights are uncalibrated heuristics. |
| TestSprite depth | 5 | 22 App runs, bot comments, final 53/53 and 0 blocked. No CLI, MCP, plans in git, schedule, or failing check. |
| Verifiability | 6 | Engine, 110 tests, and live preset numbers match. Several headline process claims are false, and the 53 cases are not in the repo. |
| Polish | 7 | Live UI, custom 404, structured 400s, strict TS, typecheck clean. Cookie/test-fixture smells keep it from an 8. |
| Demo | 6 | Public video with a product title. Length and contents not verified. README demo script cites 63/100, which the app does not show. |
| **Overall** | **6** | A polished small product with a genuine App loop and a green final run, wrapped in process claims the PR history does not support. |
