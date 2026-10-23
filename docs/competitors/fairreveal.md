# FairReveal

| | |
|---|---|
| Name | FairReveal |
| Repo | https://github.com/unborn7g/fairreveal (`main` @ [`aa6d290`](https://github.com/unborn7g/fairreveal/commit/aa6d290f4b5da96110cc5b62219142225dfa8419), 2026-10-21) |
| Live | https://fairreveal.vercel.app/ |
| TestSprite PR | [#1](https://github.com/unborn7g/fairreveal/pull/1) (merged 2026-10-21T17:26:13Z) |
| Demo | none (no video, Loom, or YouTube link in the repo). In-app sandbox only — see §9 |
| Review date | 2026-10-23 |
| Reviewer model | Grok 4.7 |
| Author | [unborn7g](https://github.com/unborn7g) |

Inspected tree: merge commit `aa6d290` has an empty diff against [`dec1860`](https://github.com/unborn7g/fairreveal/commit/dec18605c285875da97dd19241e6994f17fe4ffa), so production code and the commit TestSprite marked green are the same tree. Repo created 2026-10-19. Six commits. One pull request. Zero issues. Zero GitHub Actions workflows (`gh api repos/unborn7g/fairreveal/actions/workflows` → `total_count: 0`). No license file.

## What it is

FairReveal is a small group-project peer-review board. A team of 3–6 people agrees on weighted tasks, attaches a note (and optional link) before a task can be marked done, then submits 1–5 ratings. The API withholds the contribution report, and the raw “who rated whom” rows, until every member has submitted. The pitch is the four usual failure modes of peer eval: early leaks and retaliation, a freerider’s 5/5 self-score, tasks checked off with no receipt, and a 1-star with no comment. The audience is a student team plus an instructor who approves or overrides a grade multiplier. Value is real if the seal and the math both hold. The seal holds in code and in a local API run. The math that runs is deterministic and matches the published indexes. The formula, peer percentages, and “bragging cap” written on the homepage and in the README are a different formula.

## Architecture

Stack from [`package.json`](https://github.com/unborn7g/fairreveal/blob/main/package.json): Next.js `16.4.2` (App Router), React `19.3.0`, TypeScript 5 (`strict: true`), Tailwind CSS 4, Drizzle ORM `0.45.4`, `@neondatabase/serverless` `1.2.0`, Vitest `5.0.5`. Deploy target is Vercel (`server: Vercel` on live responses; project [fairreveal](https://vercel.com/unborn/fairreveal)). No `vercel.json`. Neon Postgres in production, with an in-memory Drizzle lookalike when `DATABASE_URL` is unset ([`db/index.ts`](https://github.com/unborn7g/fairreveal/blob/main/db/index.ts)).

| Module | Role |
|---|---|
| [`lib/rules.ts`](https://github.com/unborn7g/fairreveal/blob/main/lib/rules.ts) | Pure R1–R18 validators and `computeReport` |
| [`lib/rules.test.ts`](https://github.com/unborn7g/fairreveal/blob/main/lib/rules.test.ts) | 13 Vitest tests |
| [`lib/server.ts`](https://github.com/unborn7g/fairreveal/blob/main/lib/server.ts) | Project read model, member sort, seal |
| [`lib/demo.ts`](https://github.com/unborn7g/fairreveal/blob/main/lib/demo.ts) | Fresh sandbox per mode: `scratch`, `evidence`, `reveal` |
| [`app/api/projects/route.ts`](https://github.com/unborn7g/fairreveal/blob/main/app/api/projects/route.ts) | Create a real project (3–6 names) |
| [`app/api/projects/[code]/route.ts`](https://github.com/unborn7g/fairreveal/blob/main/app/api/projects/%5Bcode%5D/route.ts) | All mutations: agree, evidence, fulfill, open reviews, submit, approve |
| [`app/api/demo/route.ts`](https://github.com/unborn7g/fairreveal/blob/main/app/api/demo/route.ts) | `POST` sandbox |
| [`app/s/[token]/route.ts`](https://github.com/unborn7g/fairreveal/blob/main/app/s/%5Btoken%5D/route.ts) | 128-bit seat link → 303 to `/p/{code}?seat=` + `fr_seat` cookie |
| [`app/p/[code]/page.tsx`](https://github.com/unborn7g/fairreveal/blob/main/app/p/%5Bcode%5D/page.tsx) | Board UI (~1096 lines, client component) |
| [`app/page.tsx`](https://github.com/unborn7g/fairreveal/blob/main/app/page.tsx) | Marketing dashboard, static “golden” cards, brag slider |
| [`db/schema.ts`](https://github.com/unborn7g/fairreveal/blob/main/db/schema.ts) | `projects`, `members`, `commitments`, `evidence`, `reviews`, `decisions` |
| [`drizzle/0000_rare_weapon_omega.sql`](https://github.com/unborn7g/fairreveal/blob/main/drizzle/0000_rare_weapon_omega.sql) | Checked-in migration. Runtime also `CREATE TABLE IF NOT EXISTS` inside `ensureSchema` |

Phases: `setup` → `active` → `reviewing` → `unlocked` → `approved`. Seat auth is an unguessable token (16 random bytes, hex), sent as httpOnly cookie `fr_seat` or header `x-fr-seat`. Header wins when it belongs to the project ([`route.ts` ctx](https://github.com/unborn7g/fairreveal/blob/main/app/api/projects/%5Bcode%5D/route.ts#L9-L19)). There is no account system and no server-side PIN.

### The formula that actually runs

[`computeReport`](https://github.com/unborn7g/fairreveal/blob/main/lib/rules.ts#L52-L78):

- Commitment % = fulfilled weight / owned weight × 100 (1 decimal).
- Peer mean = mean of **other people’s** ratings. The self-rating is not in the mean and is not capped.
- Peer % = peer mean / 5 × 100 (1 decimal).
- Index = `0.6 * commitmentPct + 0.4 * peerPct` (1 decimal).
- Multiplier = index / team-mean index, clamped to `[0.50, 1.10]`, 2 decimals.
- Flags: `overclaim` if self − peer mean ≥ 1.5; `disagreement` if max peer − min peer ≥ 2; `no-evidence` once per commitment with zero evidence rows.

The README and the reveal screen say the opposite weights and a cap that this function does not apply. See §6.

## TestSprite integration depth

**Depth score: 4 / 10.** One real GitHub App loop on one PR caught a row-order bug that changes the published team mean, and the follow-up commit is green. Everything else in a deep integration is absent: no plans in git, no CLI, no MCP, no workflow, no schedule, no issue triage, and the check’s GitHub state stayed `success` while the description said 7 failed.

### Present

| Piece | Evidence |
|---|---|
| GitHub App status `TestSprite V3` on PR #1 | Latest PR checks: `TestSprite V3` pass, “All 34 tests passed”, [execution `7e98af0d`](https://www.testsprite.com/dashboard-v3/o/71c29088-6368-56e9-901b-b1d20cbf8267/projects/b194ccf2-14f1-4c70-91f0-7b021f2777a6/execution/7e98af0d-741e-4749-88bf-f565b8b82ec3). Bot comment (created 17:06:41Z, **edited** 17:14:06Z): [issuecomment-6321843744](https://github.com/unborn7g/fairreveal/pull/1#issuecomment-6321843744). |
| Earlier run on the same PR | Commit [`a25b73c`](https://github.com/unborn7g/fairreveal/commit/a25b73c6770b24cc573ff97a6d51d485d60eb210) status, 2026-10-21T16:49:06Z: description **“27/34 passed · 7 failed”**, `state: success`, [execution `4ebe879f`](https://www.testsprite.com/dashboard-v3/o/71c29088-6368-56e9-901b-b1d20cbf8267/projects/b194ccf2-14f1-4c70-91f0-7b021f2777a6/execution/4ebe879f-54ae-4cd8-8dfe-55cfe13b99ab). |
| Vercel preview alongside the check | PR comment from `vercel[bot]`: preview `https://fairreveal-git-fix-sealed-review-flow-unborn.vercel.app`, deployment [4m8YBQeh](https://vercel.com/unborn/fairreveal/4m8YBQeh58BvutWRRwobnkDe6dFL). |

Project id in those dashboard URLs: `b194ccf2-14f1-4c70-91f0-7b021f2777a6`. Org id: `71c29088-6368-56e9-901b-b1d20cbf8267`. Both dashboard pages return the TestSprite login shell to an unauthenticated fetch (HTTP 200, title “TestSprite”, no execution body). Counts below come from the GitHub status and the bot comment, not from a re-run and not from the dashboard HTML.

The green comment lists **34** test titles (parsed 2026-10-23 from the comment body). They are not grouped into use cases in that comment. The prose names six journeys: project creation, private seat links, evidence logging, sealed review submission, reveal flow, instructor approval. TestSprite’s own “what could be better” paragraph says the run surfaced no defects and that negative paths (invalid seat links, partial commitment completion, approval rejection, malformed evidence) are untested. Two titles are duplicated (“Submit the final sealed review and unlock the report” appears twice). Rough shape of the 34 titles: about 10 reveal/unlock flows, 8 create-or-scratch flows, 7 evidence/fulfill flows, 5 seat-link flows, 3 approve/override flows, 1 report-detail read.

### Required check

| Source | Result |
|---|---|
| `GET /repos/unborn7g/fairreveal/branches/main/protection` | **403** `Resource not accessible by integration` |
| `GET /repos/unborn7g/fairreveal/rulesets` | **200** `[]` |
| Blocked merge | none visible. PR #1 has no reviews. Author merged at 17:26:13Z, about 12 minutes after the green status (17:14:09Z) |
| Does a red suite fail the commit? | **No, on the only red run we can see.** `a25b73c` records `TestSprite V3` with description “27/34 passed · 7 failed” and **`state: success`**. A required-status rule on this context would still be satisfied |

The merge commit [`aa6d290`](https://github.com/unborn7g/fairreveal/commit/aa6d290f4b5da96110cc5b62219142225dfa8419) has a Vercel success status only. TestSprite did not run on the merge SHA. The tree matches `dec1860`, so the deployed source is the source that was green.

### Absent

- **CLI.** No `.github/workflows`, no `testsprite` package, no `npx testsprite` script. `gh run list` is empty.
- **MCP.** No MCP config, no `.testsprite/` directory, no TestSprite files anywhere in the tree (`find` for `testsprite` and `mcp` is empty).
- **Plans or test code in git.** Count of committed TestSprite plans: **0**. The 34 cases exist as titles inside the bot comment.
- **Schedules.** No nightly, no on-merge workflow. Nothing re-runs after the PR merged.
- **Triage.** Zero GitHub issues. No failure classifier, no ledger, no auto-fix bot. The bot comment is the only report, and it was edited in place (`updated_at` 17:14:06Z), so the 27/34 failure text is gone from the PR thread.
- **Credits.** No credit balance, plan name, or spend note in the repo or the retained comment.

### Red → green

| Step | When | Result | Link |
|---|---|---|---|
| PR body “Run #1” | claimed before `a25b73c` | **28/34**, blamed on stale `fr_seat` cookie vs `x-fr-seat` | Only in the [PR body](https://github.com/unborn7g/fairreveal/pull/1). Not in the status API (a context keeps one status). **UNVERIFIED** |
| Status on `a25b73c` | 2026-10-21T16:49:06Z | **27/34 passed, 7 failed**, GitHub state `success` | [execution 4ebe879f](https://www.testsprite.com/dashboard-v3/o/71c29088-6368-56e9-901b-b1d20cbf8267/projects/b194ccf2-14f1-4c70-91f0-7b021f2777a6/execution/4ebe879f-54ae-4cd8-8dfe-55cfe13b99ab) |
| Status on `dec1860` | 2026-10-21T17:14:09Z | **“All 34 tests passed”** | [execution 7e98af0d](https://www.testsprite.com/dashboard-v3/o/71c29088-6368-56e9-901b-b1d20cbf8267/projects/b194ccf2-14f1-4c70-91f0-7b021f2777a6/execution/7e98af0d-741e-4749-88bf-f565b8b82ec3), [comment](https://github.com/unborn7g/fairreveal/pull/1#issuecomment-6321843744) |

`dec1860` is the commit that sorts members, keys Dana’s golden defaults by name, extends the copy toast from 2200 ms to 30 s, and shows evidence controls on already-fulfilled demo tasks. That is the whole red→green fix set. There is no second PR.

## Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
|---|---|---|---|---|
| Vitest | 13 tests, and that those 13 verify all 18 rules R1–R18 | **13 passed / 0 failed** locally (`npm test`, Vitest 5.0.5, 472 ms, 2026-10-23, no `DATABASE_URL`). `tsc --noEmit` exit 0 | [`lib/rules.test.ts`](https://github.com/unborn7g/fairreveal/blob/main/lib/rules.test.ts) has 13 `it()` calls | Count **VERIFIED**. “All 18 rules” is **FALSE** (coverage map below) |
| TestSprite V3 E2E | 34 tests, 8 use cases, 34/34 green, 0 failed, 0 blocked | 34 titles in the bot comment; GitHub status “All 34 tests passed”; comment text “no failures or blocked cases” | [comment](https://github.com/unborn7g/fairreveal/pull/1#issuecomment-6321843744), [execution 7e98af0d](https://www.testsprite.com/dashboard-v3/o/71c29088-6368-56e9-901b-b1d20cbf8267/projects/b194ccf2-14f1-4c70-91f0-7b021f2777a6/execution/7e98af0d-741e-4749-88bf-f565b8b82ec3) | 34 green **VERIFIED** as a GitHub record. **Not re-executed here.** 8 use cases **UNVERIFIED** (string “use case” does not appear in the comment or the repo) |
| “API contract” column in the README matrix | Presented as a third layer for R4, R6, R7, R9, R10, R16, R18 | No HTTP suite in the repo. Spot-checked on a local `next dev` with the in-memory DB (2026-10-23), not against production | [`route.ts`](https://github.com/unborn7g/fairreveal/blob/main/app/api/projects/%5Bcode%5D/route.ts) | The layer as a committed suite is **FALSE**. Several rules do exist in the handler and passed a local probe (below) |

Local API probe (in-memory, `http://127.0.0.1:3456`, 2026-10-23), after `POST /api/demo` mode `reveal`:

- Instructor and Dana at 3/4: `phase=reviewing`, `report=null`, `reviewDetail=null`, the JSON does not contain the substring `rating`.
- Dana submits `{Amara:4, Bayo:5, Chen:4, Dana:5}`: `phase=unlocked`, team mean **68.58**, rows Amara 100 / **80** / 92 / 1.1; Bayo 75 / **73.3** / 74.3 / 1.08 + `disagreement`; Chen 100 / **86.7** / 94.7 / 1.1; Dana 0 / **33.3** / 13.3 / 0.5 + `overclaim` + `no-evidence` ×2.
- Instructor `reviewDetail` length 16. Dana `reviewDetail` null.
- Amara resubmitting while Dana is still pending: HTTP 400 `You have already submitted. Reviews are immutable (R9).` Phase stays `reviewing`.
- After unlock, a second submit returns HTTP 400 `The review round is not open.` (the phase guard fires before the R9 string).
- Dana rating everyone `1` with no comment: HTTP 400 R8. Phase stays `reviewing`.
- Evidence sandbox: fulfill Dana’s “Visual design” (0 evidence) → HTTP 400 R6. Bayo adding evidence on Amara’s task → HTTP 403 R4. Bayo opening reviews → HTTP 403 R7.
- `x-fr-seat` of the instructor overrides a `fr_seat` cookie of Dana. Viewer is Amara.

`npm test` was run from a clean `npm install` (103 packages). `node_modules` was deleted afterwards.

### Which of R1–R18 the 13 unit tests actually lock

| Rule | In the 13 Vitest tests? |
|---|---|
| R1 team size 3–6 | Yes, `validateProject` only. “Every member owns a commitment” is the API `agree` path, untested |
| R2 title 3–80, weight 1–3 | Yes, `validateCommitment` only. Owner-must-be-a-member is untested |
| R3 all-agree flips `setup`→`active`, then freeze | No unit test |
| R4 owner-only evidence | No unit test. Local probe returned 403 |
| R5 note ≥ 10, http(s) link | Yes |
| R6 fulfill requires evidence | No unit test. Local probe returned 400 |
| R7 instructor-only, from `active` | No unit test. Local probe returned 403 for a member |
| R8 ratings 1–5, low rating needs a comment | Yes, plus a local API probe |
| R9 immutable review | No unit test. Local probe returned the R9 string |
| R10 report null before N/N | Yes, via `projectState` on a seeded reveal sandbox |
| R11 final submit flips to `unlocked` | **Weak.** The test inserts Dana’s rows and **sets `phase` to `unlocked` itself** ([lines 111–125](https://github.com/unborn7g/fairreveal/blob/main/lib/rules.test.ts#L111-L125)). It does not call the route. The route’s flip was checked in the local API probe |
| R12–R15 indexes, clamp, flags | Indexes 92 / 74.3 / 94.7 / 13.3, mean 68.58, multipliers 1.10 / 1.08 / 1.10 / 0.50, and the three flag types: yes. The **documented** 40/60 weights and the self-cap: no, and they contradict the function under test |
| R16 instructor-only `reviewDetail` | Yes (16 rows vs null) |
| R17 override bounds | `validateOverride` only. The `approve` action and the `approved` phase are untested |
| R18 bad token → 404 | No unit test. Live `GET /s/deadbeef` is 404 `Seat not found`. Live `GET /api/projects/doesnotexist` is 404 `Project not found` |

## Claim verification

| Claim | Status | Evidence |
|---|---|---|
| Unlocks sealed peer reviews only after 100% of ballots | **VERIFIED** | [`projectState`](https://github.com/unborn7g/fairreveal/blob/main/lib/server.ts#L38-L51) builds `report` only when `phase` is `unlocked` or `approved`. [`submitReview`](https://github.com/unborn7g/fairreveal/blob/main/app/api/projects/%5Bcode%5D/route.ts#L84-L97) sets that phase only when every member has `submittedAt`. Local probe: 3/4 → `report: null` and no `rating` field; 4th ballot → `unlocked` and mean 68.58. The README’s “same transaction” wording is a separate claim, below |
| “Nobody, not even the instructor, sees a rating until the last ballot” | **VERIFIED** for the API payload | Same read model. Instructor at 3/4 gets `reviewDetail: null`. Local sealed JSON has no `rating` key. The instructor **does** receive every seat URL in that payload ([`seatPath` when `isInstructor`](https://github.com/unborn7g/fairreveal/blob/main/lib/server.ts#L57)), so they can open a teammate’s link. That is link custody, not a leaked score |
| 34/34 TestSprite V3 tests green | **VERIFIED** as a GitHub record on `dec1860` | Status “All 34 tests passed” (2026-10-21T17:14:09Z) and [bot comment](https://github.com/unborn7g/fairreveal/pull/1#issuecomment-6321843744) “34 passed • 34 total”. Dashboard is login-walled. Not re-run in this review |
| 34 E2E tests across 8 use cases | **34 VERIFIED, 8 use cases UNVERIFIED** | 34 titles parsed from the comment. The comment and the repo never say “8 use cases” or “use case”. The comment’s own summary lists six journeys |
| 13 Vitest tests | **VERIFIED** | File has 13 `it()` calls; `npm test` → `Tests 13 passed` |
| Those 13 tests verify all 18 rules R1–R18 | **FALSE** | Map in §5. R3, R4, R6, R7, R9, R18 have no unit test. R11’s unit test writes the phase itself. README matrix [R12–R15](https://github.com/unborn7g/fairreveal/blob/main/README.md) claims a 40/60 self-cap formula the tests do not implement |
| Golden indexes 92.0 / 74.3 / 94.7 / 13.3 and team mean 68.58 | **VERIFIED** | Asserted in [`rules.test.ts`](https://github.com/unborn7g/fairreveal/blob/main/lib/rules.test.ts#L28-L46). Local `computeReport` and the local reveal API both return mean 68.58 and those indexes. Live homepage HTML contains `92.0`, `74.3`, `94.7`, `13.3` (static cards). `68.58` is not in the homepage HTML; it appears after a real reveal (`data-testid="team-mean"`) |
| README / homepage peer column 86.7 / 73.8 / 91.1 / 22.2 (“self-capped”) | **FALSE** as engine output | Local reveal API peer % is **80 / 73.3 / 86.7 / 33.3**. Those are `(peerMean/5)*100` with self excluded ([rules.ts L59–L61](https://github.com/unborn7g/fairreveal/blob/main/lib/rules.ts#L59-L61)). The static column is hardcoded in [`GOLDEN_TEAM`](https://github.com/unborn7g/fairreveal/blob/main/app/page.tsx#L5-L46) and is in the live JS bundle. Applying the README formula `((peerMean-1)/4)*100` and `0.4*commit+0.6*peer` to the real peer means yields indexes **85 / 70 / 90 / 10**, not 92 / 74.3 / 94.7 / 13.3 |
| Bragging cap: self-rating counted at most `peerMean + 0.5` | **FALSE** as a scoring rule | `computeReport` never reads a cap. Self is omitted from the mean. The homepage slider ([page.tsx L69–L71](https://github.com/unborn7g/fairreveal/blob/main/app/page.tsx#L69-L71)) displays “Counted: 2.17★” and does not feed that number into an index. The overclaim **flag** (self − peers ≥ 1.5) is real and fires for Dana. A cap of 2.17 under the README formula produces index 17.6, not Dana’s 13.3. The reveal screen still tells the user the score “combines 40% task proof + 60% peer ratings (with bragging automatically capped)” ([page.tsx L640–L642](https://github.com/unborn7g/fairreveal/blob/main/app/p/%5Bcode%5D/page.tsx#L640-L642)) next to engine peer percentages |
| Flags on the golden team (disagreement, overclaim, no-evidence ×2) | **VERIFIED** | Unit test and local API. Code labels these **R15**, not R11–R16 ([rules.ts L65–L70](https://github.com/unborn7g/fairreveal/blob/main/lib/rules.ts#L65-L70)) |
| “flags R11–R16” as the rule ids for those flags | **FALSE** | R11 in code and README is the phase flip to `unlocked`. R16 is instructor-only raw rows. Flags are R15 |
| Neon Postgres MVCC tuple order skewed the mean to 69.25 | **VERIFIED** for the number and the mechanism. The Neon heap dump itself is only the author’s account | Zipping Dana’s index preset `[4,5,4,5]` onto member order Dana, Amara, Bayo, Chen and running `computeReport` returns team mean **69.25** (local, 2026-10-23): Amara 94.7, Bayo 71.7, Chen 97.3, Dana 13.3. That matches the [PR body](https://github.com/unborn7g/fairreveal/pull/1). [`dec1860`](https://github.com/unborn7g/fairreveal/commit/dec18605c285875da97dd19241e6994f17fe4ffa) sorts instructor-first then `localeCompare`, and keys the preset by name. The 27/34 failure log that would show Neon’s row order was not retained (comment edited; dashboard login-walled) |
| 2.2 s bulk-copy confirmation timeout | **VERIFIED** as the pre-fix timer | `dec1860` changes `setTimeout` from **2200** to **30000** in [`app/new/page.tsx`](https://github.com/unborn7g/fairreveal/blob/main/app/new/page.tsx#L43-L48) and [`app/p/[code]/page.tsx`](https://github.com/unborn7g/fairreveal/blob/main/app/p/%5Bcode%5D/page.tsx#L47-L49), and adds `data-testid="bulk-copy-status"`. The banner still clears after 30 s. That this specific timer caused one of the 7 failures is the PR narrative; the failure name is not in the retained comment |
| All of that fixed in `dec1860` (34 passed, 0 failed, 0 blocked) | **VERIFIED** for the green run | Status on that SHA: “All 34 tests passed”. Comment: “no failures or blocked cases”, “34 passed • 34 total”. Exact digits “0 failed, 0 blocked” are the [PR body](https://github.com/unborn7g/fairreveal/pull/1) paraphrase of that sentence |
| “28/34 → 27/34 → 34/34” | **27 and 34 VERIFIED, 28 UNVERIFIED** | 27/34 is the `a25b73c` status. 34/34 is the `dec1860` status. 28/34 exists only in the PR body |
| Final ballot unlocks “in the same transaction” | **FALSE** | Two separate statements, no `transaction()` call: update `submittedAt`, select members, then update `phase` ([route.ts L93–L97](https://github.com/unborn7g/fairreveal/blob/main/app/api/projects/%5Bcode%5D/route.ts#L93-L97)). The driver is Neon HTTP, which does not hold a multi-statement transaction here |
| 4-digit PIN stops anyone else with the link from opening the seat | **FALSE** | PIN is `localStorage` key `fr_pin_{code}_{memberId}` ([page.tsx L374–L402](https://github.com/unborn7g/fairreveal/blob/main/app/p/%5Bcode%5D/page.tsx#L345-L418)). The API never reads it. `seatLocked` only adds a card; the board still renders. Another browser with the link has no PIN. Live homepage copy still says a teammate can lock the link with a 4-digit PIN ([page.tsx L118–L120](https://github.com/unborn7g/fairreveal/blob/main/app/page.tsx#L118-L120)) |

## Code quality

The rules file is short, pure, and `strict` TypeScript. `tsc --noEmit` is clean. There is no ESLint config, no Prettier config, no CI, no formatter check, and no test job. The board page is one 1096-line client component typed as `type State = any`.

Smells that matter:

- **Advertised protocol ≠ executed protocol.** Weights 60/40 in code, 40/60 in the README, the homepage, and the reveal banner. Self-cap is a slider and a sentence. Judges who recompute the README formula will not get 68.58.
- **Demo backdoor.** On `isDemo` projects, `openReviews` marks the commitment titled “Interview notes” fulfilled if it is not ([route.ts L76–L82](https://github.com/unborn7g/fairreveal/blob/main/app/api/projects/%5Bcode%5D/route.ts#L76-L82)). Local evidence sandbox: Interview notes `fulfilled: false` before, `true` after the instructor opens reviews, with no fulfill click. That skips the gate the evidence stage is there to demonstrate, and it protects Amara’s 100% commitment score. Non-demo projects do not take this branch.
- **R11 unit test does not exercise R11.** It writes `phase: "unlocked"` and then checks the read model.
- **No transaction and no unique key on a review row.** Reviews are inserted in a loop. Immutability is an application check on `submittedAt`. A double submit while the phase is still `reviewing` is rejected (local probe). There is no `(project, reviewer, reviewee)` unique constraint in [`schema.ts`](https://github.com/unborn7g/fairreveal/blob/main/db/schema.ts).
- **Evidence reads are unscoped.** `projectState` and `approve` do `select()` from `evidence` with no project filter, then filter in JavaScript ([server.ts L36](https://github.com/unborn7g/fairreveal/blob/main/lib/server.ts#L36), [route.ts L103](https://github.com/unborn7g/fairreveal/blob/main/app/api/projects/%5Bcode%5D/route.ts#L103)). Correct only as long as that filter stays. It loads every team’s notes on each read.
- **`approve` does not use the sorted member list.** Scores are id-keyed, so order does not change the multiplier. The sort fix applies to `projectState` only. The UI preset is now name-keyed, which is what actually stops the 69.25 mis-zip.
- **In-memory DB parses Drizzle expression chunks** to fake `where`. Fine for unit tests. Fragile if a query shape changes.
- **Schema drift.** `ensureSchema` raw SQL gives `commitments.weight` a default of 1 and later `ALTER`s nullability. The Drizzle snapshot does not match that path one-for-one. Runtime schema is “create if missing”, not “migrate”.
- **PIN and “GenLayer”.** The PIN is client theater (above). “GenLayer” appears in a CSS comment and a JSX comment ([`globals.css`](https://github.com/unborn7g/fairreveal/blob/main/app/globals.css), [`layout.tsx`](https://github.com/unborn7g/fairreveal/blob/main/app/layout.tsx)) and in the commit message `6547a35`. It is not a dependency and it is not in the live HTML. The commit overclaims a GenLayer dashboard.
- **Open create endpoints.** `POST /api/projects` and `POST /api/demo` have no auth. Production rejects invalid bodies before insert (probed). A valid body would write a Neon row. Spam-fill is available to anyone.
- **Seat tokens on demo boards** are returned to every viewer so the “switch to Dana” button works. That is convenient for TestSprite and means one demo browser can submit every ballot.

Positive: `data-testid`s for phase, seal banner, submitted count, team mean, and per-member commit/peer/index/multiplier/flag are real and wired to API fields ([page.tsx L160, L582, L591, L718, L732–L765](https://github.com/unborn7g/fairreveal/blob/main/app/p/%5Bcode%5D/page.tsx)). The header-over-cookie seat fix matches a real single-browser TestSprite failure mode. Member sort plus name-keyed defaults is the right fix for unordered Postgres rows.

## Live-site behavior

Probed with GET, plus POST bodies that fail validation **before** any insert. No project was created on production. Timings are from this curl on 2026-10-23.

| Request | Result |
|---|---|
| `GET https://fairreveal.vercel.app/` | **200** in 0.20s. Title `FairReveal — Sealed reviews. One fair reveal.` `server: Vercel`. HTML includes the product sentence, “4-digit PIN”, “Watch the reveal”, indexes 92.0 / 74.3 / 94.7 / 13.3. JS bundle contains the static peer figures 86.7 / 73.8 / 91.1 / 22.2 and the strings `40%`, `60%`, `peerMean + 0.5` |
| `GET /new` | **200** in 0.23s |
| `GET /p/doesnotexist` | **200** HTML shell in 0.91s (`x-matched-path: /p/[code]`, `cache-control: private, no-store`). Error text is not in the SSR HTML. The client then calls the API |
| `GET /api/projects/doesnotexist` | **404** in 1.56s, `{"error":"Project not found"}` |
| `POST /api/projects/doesnotexist` `{"action":"agree"}` | **404** `Project not found` (no write) |
| `GET /s/deadbeef` | **404** in 0.11s, body `Seat not found` |
| `GET /api/demo` and `GET /api/projects` | **405** |
| `POST /api/demo` `{"mode":"nope"}` | **400** `{"error":"Bad mode"}` |
| `POST /api/projects` `{}` | **400** `Give the project a title (3+ characters).` |
| `POST /api/projects` title `Valid Title`, two names | **400** `A project needs 3–6 members (R1).` |
| `GET /no-such-route-xyz` | **404** HTML, title still the app title, body contains “could not be found” |
| `GET /favicon.ico` | **200** |

What works from the outside: the marketing page, the new-project shell, R1 and title validation, unknown-project 404, bad seat 404, Vercel hosting. What this review did not click on production: “Watch the reveal”, because that `POST /api/demo` inserts a Neon project. The same flow was run locally (in-memory) and the seal, the 68.58 mean, the engine peer percentages, R4/R5/R6/R7/R8/R9, and the instructor/member `reviewDetail` split all behaved as the code reads. The production UI’s PIN, copy toast, and CSV export were not clicked.

## Demo

No recorded demo. The README’s “3-click golden demo” is the live button **Watch the reveal**, then switch to Dana, auto-fill, submit. That path exists in the client (`demo("reveal")` → `/p/{code}`) and the API half of it works locally: a reveal sandbox starts at 3/4 sealed, Dana’s golden ballot unlocks 68.58. Length of a video: none. Judges who do not click the sandbox have only the README script.

## Weaknesses / risks for judges

- The fairness claim a judge can check with a calculator (40% proof, 60% peers, self capped at +0.5) is not the function that produces the golden indexes. The reveal screen states that formula beside numbers from the other formula.
- TestSprite depth is a single app check on a single PR. The check did not go red when 7 tests failed. Plans are not in the repository. Nothing runs on `main` after merge. The dashboard is not publicly readable.
- The 34 cloud tests heavily repeat the same happy paths. TestSprite’s own note asks for negative cases. The “18 rules verified by 34 E2E + 13 unit tests” sentence overstates both layers.
- The 28/34 run and the per-failure Neon log are not in the GitHub record anymore.
- The evidence-stage demo silently fulfills “Interview notes” when reviews open.
- The 4-digit PIN is presented as access control and does not control access.
- The seal is two round-trips, not a transaction. There is no DB uniqueness on a ballot.
- No CI, no linter, one untyped page, open unauthenticated create.
- No demo video.

## Where it beats Ninety

Ninety is ahead on suite size, plans committed in git, a backend CLI gate, and an external oracle. The edges below are the ones FairReveal actually has.

1. **Per-run isolated boards for parallel cloud browsers.** `POST /api/demo` mints a new project in a known phase ([`lib/demo.ts`](https://github.com/unborn7g/fairreveal/blob/main/lib/demo.ts), described in the [README](https://github.com/unborn7g/fairreveal/blob/main/README.md) as the way repeated TestSprite runs avoid colliding and avoid a login wall). Ninety’s calculator is stateless, so it has not needed this. To match it on a stateful product, Ninety would need a fixture endpoint that returns a fresh id plus seat secrets, and `data-testid`s aimed at the protocol outputs (FairReveal’s map is in that same README).

2. **A cloud failure that moved a published aggregate, with the fix merged only after the next run was green.** [`a25b73c`](https://github.com/unborn7g/fairreveal/commit/a25b73c6770b24cc573ff97a6d51d485d60eb210) is “27/34 passed · 7 failed” ([execution 4ebe879f](https://www.testsprite.com/dashboard-v3/o/71c29088-6368-56e9-901b-b1d20cbf8267/projects/b194ccf2-14f1-4c70-91f0-7b021f2777a6/execution/4ebe879f-54ae-4cd8-8dfe-55cfe13b99ab)). [`dec1860`](https://github.com/unborn7g/fairreveal/commit/dec18605c285875da97dd19241e6994f17fe4ffa) is “All 34 tests passed” ([execution 7e98af0d](https://www.testsprite.com/dashboard-v3/o/71c29088-6368-56e9-901b-b1d20cbf8267/projects/b194ccf2-14f1-4c70-91f0-7b021f2777a6/execution/7e98af0d-741e-4749-88bf-f565b8b82ec3)). The mis-ordered ballot reproduces **69.25** instead of **68.58**. Ninety [PR #63](https://github.com/mohamedwael201193/ninety/pull/63) merged while TestSprite V3 was 42/43. Matching this edge is merge timing: land the PR after the check description is green. FairReveal’s enforcement is weaker than that story sounds, because the 27/34 status was stored as GitHub `state: success`, so branch protection on this context would not have blocked the author.

3. **Server-side quorum concealment.** Until every `submittedAt` is set, `GET /api/projects/{code}` returns `report: null` and `reviewDetail: null`, including for the instructor ([`server.ts`](https://github.com/unborn7g/fairreveal/blob/main/lib/server.ts#L38-L51), [`route.ts`](https://github.com/unborn7g/fairreveal/blob/main/app/api/projects/%5Bcode%5D/route.ts#L84-L97)). Local probe confirmed the sealed payload contains no ratings, and the unlocked payload shows 16 raw rows only to the instructor. Ninety has no shared ballot and no field that stays null until a quorum. Matching it means an API whose partial results are absent, plus a test that fails if they leak. The product problems are different; this is the capability FairReveal has.

**TestSprite technique Ninety lacks:** an unauthenticated sandbox factory whose only job is to give each cloud browser its own project, combined with a README `data-testid` contract (`phase`, `seal-banner`, `submitted-count`, `team-mean`, `commit-{name}`, `peer-{name}`, `index-{name}`, `mult-{name}`, `flag-{name}-{type}`) so a generated suite can lock onto protocol outputs. Ninety commits the plans themselves, which is a stronger artifact. Ninety does not have this fixture pattern.

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 7 | Sealed peer eval with an evidence gate is a real classroom problem, and the seal works. The advertised fairness math is not the math that runs, which caps the score |
| TestSprite depth | 4 | One App check, one PR, a real 27→34 loop on a numeric bug. No plans in git, no CLI, no MCP, no schedule, no required-check proof, and a failed run still posted `state: success` |
| Verifiability | 5 | 13/13 unit tests and the golden indexes reproduce. 34/34 is a GitHub status plus an edited comment, not a re-run, and the dashboard is login-walled. Several headline claims (8 use cases, all 18 rules, the cap, the 40/60 weights, the 28/34 run) do not hold |
| Polish | 6 | The live dashboard is intentionally designed and the happy path is coherent. The reveal copy contradicts the engine, the PIN is fake security, and there is no lint or CI |
| Demo | 3 | No video. The in-app reveal sandbox is real and the API path checks out locally. A judge who does not click it has a README recipe |
| **Overall** | **5** | A working seal and one honest TestSprite bug, wrapped in protocol claims the code does not implement and a thin cloud-test integration |
