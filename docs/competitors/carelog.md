# CareLog

- **Name:** CareLog
- **Author:** IamHarrie-Labs (README byline Stanley Nnaka)
- **Repo:** https://github.com/IamHarrie-Labs/carelog
- **Live:** https://trycarelog.xyz/ (same build as https://carelog-sigma.vercel.app/; GitHub homepage is the Vercel alias)
- **TestSprite PR:** https://github.com/IamHarrie-Labs/carelog/pull/5 (the gated PR; the app also commented on PRs #1–#4 and #6–#12)
- **Demo:** https://youtu.be/bMXk8A4guh0
- **Article:** https://dev.to/iamharrie/building-a-shared-care-record-3ka4
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7
- **HEAD reviewed:** `24e9682b34d17613249a0ce55c374c1e21225eb6` (merge of PR #12)

Repo created 2026-10-19. 12 pull requests, 11 merged, #3 closed unmerged. 0 stars. No license. No GitHub issues. Primary language JavaScript.

## What it is

CareLog is a shared care record for families and other people who take turns looking after someone. Each entry is stored under the person who wrote it. A handoff lists what was recorded, what has no record, and every unfinished job; the next person confirms they have seen it, and that confirmation does not close the jobs. The product refuses a second normal completion of a scheduled item, and it says “no administration recorded” rather than “missed.” It does not recommend doses or diagnose. The author says it has not been tried by real caregivers, and public demos should use made-up details ([README](https://github.com/IamHarrie-Labs/carelog/blob/main/README.md), [PRD](https://github.com/IamHarrie-Labs/carelog/blob/main/docs/PRD.md)).

## Architecture

Plain JavaScript on Node 22. HTTP API is [Hono](https://github.com/IamHarrie-Labs/carelog/blob/main/package.json) (`hono` 4.x, `@hono/node-server`). Data is libSQL via `@libsql/client`, Turso in production and a file or `:memory:` database in tests ([src/db.js](https://github.com/IamHarrie-Labs/carelog/blob/main/src/db.js)). The browser is a no-framework SPA in `public/` (hash routes were replaced by path routes in PR #8). Deploy target is Vercel: static `public/` plus a serverless fetch handler, rewrites in [vercel.json](https://github.com/IamHarrie-Labs/carelog/blob/main/vercel.json). Optional `ANTHROPIC_API_KEY` drafts handoff summaries; without it the app uses a template ([.env.example](https://github.com/IamHarrie-Labs/carelog/blob/main/.env.example)).

| Piece | Role | Link |
|---|---|---|
| `api/index.js` | Vercel entry. One Turso URL for every warm instance | [api/index.js](https://github.com/IamHarrie-Labs/carelog/blob/main/api/index.js) |
| `src/server.js` | Local server, port `PORT` or 3000, file DB if Turso is unset | [src/server.js](https://github.com/IamHarrie-Labs/carelog/blob/main/src/server.js) |
| `src/app.js` | Sign-in, circles, records, invites, settings | [src/app.js](https://github.com/IamHarrie-Labs/carelog/blob/main/src/app.js) |
| `src/core.js` | Membership check on every protected request; batched record serialization | [src/core.js](https://github.com/IamHarrie-Labs/carelog/blob/main/src/core.js) |
| `src/handoffs.js` | Handoff snapshot, acknowledgement, narrative | [src/handoffs.js](https://github.com/IamHarrie-Labs/carelog/blob/main/src/handoffs.js) |
| `src/extras.js` | Emergency links, money, supplies, care load, digest | [src/extras.js](https://github.com/IamHarrie-Labs/carelog/blob/main/src/extras.js) |
| `src/lib.js` | Roles, scrypt passwords, circle-timezone clock, readable invite tokens | [src/lib.js](https://github.com/IamHarrie-Labs/carelog/blob/main/src/lib.js) |
| `public/app.js`, `public/more.js`, `public/ui.js` | Workspace UI. User text goes through `textContent` | [ui.js](https://github.com/IamHarrie-Labs/carelog/blob/main/public/ui.js) |
| `public/reference-page.js` | Landing page | [reference-page.js](https://github.com/IamHarrie-Labs/carelog/blob/main/public/reference-page.js) |
| `docs/PRD.md` | Behaviour the author says the browser suite is generated from | [PRD.md](https://github.com/IamHarrie-Labs/carelog/blob/main/docs/PRD.md) |

About 3,500 lines in `src/`, `public/*.js`, `test/`, and `api/` at this HEAD. `docs/reference-audit/` is a large set of screenshots and measurements of a reference marketing site (the README at the gate commit names Wispr Flow). Repo disk usage reported by GitHub is about 60 MB, mostly those images.

## TestSprite integration depth

**Depth score: 6 / 10.** The GitHub App ran a 32-test browser suite against a Vercel preview on every pull request, and from PR #5’s second commit onward a failed run is a red GitHub status. PR #5 stayed open across three red statuses and merged only after 32/32. That is a real loop. Missing: no test plans or TestSprite config in git, no CLI, no MCP, no GitHub Actions, no nightly or on-merge run, no failure issues or auto-fix bot, and branch protection could not be read (HTTP 403). Before the gate, the same check posted `success` while tests were failing, and those PRs merged.

### GitHub App check

Context name is `TestSprite V3` (a commit **status**, not a Check Run). The only Check Run on these SHAs is Vercel Preview Comments. There is no `.github/` directory. `GET /repos/IamHarrie-Labs/carelog/actions/workflows` returned `total_count: 0`.

Dashboard project used throughout: `7e47ba56-497a-4e60-8986-22bc6e6bb88c` under org `86671820-5628-5512-8697-f024001165bf`. The pages return HTTP 200; counts below are the GitHub status text and the `testsprite[bot]` comment, not a parsed dashboard.

| PR | Head result (final SHA) | GitHub status state | Execution |
|---|---|---|---|
| [#1](https://github.com/IamHarrie-Labs/carelog/pull/1) | 23/32 passed, 6 failed, 3 blocked | **success** (merged anyway) | [cd019aeb](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/cd019aeb-c003-4b54-81b6-362d35819d91) |
| [#2](https://github.com/IamHarrie-Labs/carelog/pull/2) | 29/32 passed, 2 failed, 1 blocked | **success** (merged anyway) | [f2c61722](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/f2c61722-a4ca-4e9e-8f87-da84822654f4) |
| [#3](https://github.com/IamHarrie-Labs/carelog/pull/3) | 26/32 passed, 3 failed, 3 blocked | **success** (closed, not merged; author said the long branch name made Vercel shorten the preview URL) | [7305143a](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/7305143a-cf51-4310-83fb-f9938cd4bc2c) |
| [#4](https://github.com/IamHarrie-Labs/carelog/pull/4) | 31/32 passed, 1 blocked | **success** (merged with one blocked test) | [8d544cbb](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/8d544cbb-9256-48fc-8e94-f0bbe6437beb) |
| [#5](https://github.com/IamHarrie-Labs/carelog/pull/5) | All 32 passed | **success** | [222a56f6](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/222a56f6-f5d4-48e5-86a4-c254503529c2) |
| [#6](https://github.com/IamHarrie-Labs/carelog/pull/6) | All 32 passed | **success** | [1956a75d](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/1956a75d-02c3-4086-b561-c21404908fe4) |
| [#7](https://github.com/IamHarrie-Labs/carelog/pull/7) | All 32 passed | **success** | [b4e889a8](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/b4e889a8-d354-49ac-ba22-9360a9ae24b9) |
| [#8](https://github.com/IamHarrie-Labs/carelog/pull/8) | All 32 passed | **success** | [0a0f6c0a](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/0a0f6c0a-2695-42b5-8933-29cc641575ec) |
| [#9](https://github.com/IamHarrie-Labs/carelog/pull/9) | All 32 passed | **success** | [b3ed1966](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/b3ed1966-5b53-4767-8278-c7127ad18dc2) |
| [#10](https://github.com/IamHarrie-Labs/carelog/pull/10) | All 32 passed | **success** | [80bb2e03](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/80bb2e03-13e4-4a34-9fd6-320b8c903438) |
| [#11](https://github.com/IamHarrie-Labs/carelog/pull/11) | All 32 passed | **success** | [e23759e8](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/e23759e8-f746-44ef-9e0e-a222f7cb3126) |
| [#12](https://github.com/IamHarrie-Labs/carelog/pull/12) | All 32 passed | **success** | [e95503b0](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/e95503b0-ed32-4b2a-b15d-d880dc9a87e1) |

`main` at review time shows only the Vercel status ([commit status API on `main`](https://github.com/IamHarrie-Labs/carelog/commits/main)). TestSprite does not run on the merge commit.

### Is TestSprite a required check?

- `GET /repos/IamHarrie-Labs/carelog/branches/main/protection` → **HTTP 403** (`Resource not accessible by integration`).
- `GET /repos/IamHarrie-Labs/carelog/rulesets` → **200 `[]`**. `GET /rules/branches/main` → **200 `[]`**.
- The README says main accepts a change only when TestSprite V3 passes, including for administrators ([README](https://github.com/IamHarrie-Labs/carelog/blob/main/README.md)). The [DEV article](https://dev.to/iamharrie/building-a-shared-care-record-3ka4) says the author turned that on late, and that at first a failed test did not stop a merge because the check still reported success.
- That matches the statuses: PRs #1, #2, and #4 merged while the description listed failures or a blocked test and the state was still `success`. The first status with state `failure` is PR #5 commit `bfb3c73` (“28/32 passed · 2 failed · 2 blocked”). Later red commits on #5, #6, #9, #10, and #11 also use state `failure`. Each of those PRs merged only after a later commit on the same branch was `All 32 tests passed`.

Required-check configuration itself is **UNVERIFIED** (403 / empty rulesets). The behaviour of the status, and the merge timing after it turned red, are verified.

### CLI, MCP, plans in git, schedules, triage

- **CLI:** no workflow, no `testsprite` config, no CLI command in the repo.
- **MCP:** no MCP config. A search of the tree finds no TestSprite project file.
- **Plans committed:** **0**. The 32 cases exist as cloud runs and as names in the bot comment. [docs/PRD.md](https://github.com/IamHarrie-Labs/carelog/blob/main/docs/PRD.md) is the human spec (stable `data-testid`s), not the generated plan.
- **Schedules:** none. No nightly, no on-merge run. Workflow count is 0.
- **Triage:** `testsprite[bot]` comments on the PR with pass/fail tables and a “what could be better” note. The comment on #5 was edited in place to the final green run, so the earlier failure write-up is not in that comment. No TestSprite issues, no review threads on PR #5, no auto-fix bot. The author fixes by hand and pushes again. Re-run commit messages name the flake: preview still building, a parallel test revoking a shared emergency link ([349980d](https://github.com/IamHarrie-Labs/carelog/commit/349980d8da57288d3be4f9ded8cf19de6d6bf883)), and tests pinned to the circle id in the URL (`HAND-002`, `PEOP-002`).
- **Credits:** no note in the repo. UNVERIFIED.

### Red → green loops

PR #5 is the gated loop. Statuses are on each commit, not only the final head.

| Commit | Message | TestSprite | State |
|---|---|---|---|
| [82ddbac](https://github.com/IamHarrie-Labs/carelog/commit/82ddbac1593c538bfac982b5371d2aa21c380f94) | Landing: Create a care circle | 31/32, 1 failed ([ab310da9](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/ab310da9-22cd-4f89-a417-01f1d60c2abf)) | success |
| [bfb3c73](https://github.com/IamHarrie-Labs/carelog/commit/bfb3c730396609adb2c7105d8939f7d30a0ad20b) | Document the suite | **28/32, 2 failed, 2 blocked** ([c14c53ee](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/c14c53ee-1eb4-43df-8b45-90d56df63f56)) | **failure** |
| [4785edf](https://github.com/IamHarrie-Labs/carelog/commit/4785edfe344e01c1d2240784de765c9accff2a9e) | Remove “null” on sign-in; show today’s notes | 27/32, 5 failed ([e4bb246a](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/e4bb246a-1a78-4771-ba17-e13bce9bfaaa)) | failure |
| [4a7f579](https://github.com/IamHarrie-Labs/carelog/commit/4a7f579298c628560fd6287f367236029897366a) | Readable invite links; say who can acknowledge | 30/32, 2 failed ([63b4d378](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/63b4d378-6318-41ed-914a-940bf27a1c84)) | failure |
| [c21e09a](https://github.com/IamHarrie-Labs/carelog/commit/c21e09a7d8d7cf35adf47f0e3c550196aea0bcfd) | Hand an invite to someone on the same device | All 32 ([222a56f6](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/222a56f6-f5d4-48e5-86a4-c254503529c2)) | success |

Merged 2026-10-23T02:55:32Z, after the green status at 02:54:34Z. The bot comment on the PR is the green run: [32 of 32](https://github.com/IamHarrie-Labs/carelog/pull/5#issuecomment-6356181914).

Later PRs that went red, then green, before merge:

| PR | Red status | Then |
|---|---|---|
| [#6](https://github.com/IamHarrie-Labs/carelog/pull/6) | [ad60d44](https://github.com/IamHarrie-Labs/carelog/commit/ad60d44629d9549f20638e2bb5814c68f0ba22b3) 31/32, 1 failed, state failure ([a4f9cc48](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/a4f9cc48-b611-4baa-8eeb-b64c643b0a6c)) | 32/32 |
| [#9](https://github.com/IamHarrie-Labs/carelog/pull/9) | [5bcdf02](https://github.com/IamHarrie-Labs/carelog/commit/5bcdf02d0f14240309ca7e20f961c74908fe40a3) 30/32, 2 failed ([1b242910](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/1b242910-c83f-42ee-bac4-a9d7b09dcebb)); two later commits 31/32, 1 failed | 32/32 on [7873b47](https://github.com/IamHarrie-Labs/carelog/commit/7873b478a37969cb15ac832023c3c7468a52b49f) |
| [#10](https://github.com/IamHarrie-Labs/carelog/pull/10) | [74df280](https://github.com/IamHarrie-Labs/carelog/commit/74df280d07f3af23d6ba1fb71512ac2fa3e1c2ca) 31/32, 1 failed ([cfa69268](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/cfa69268-c7e6-42b9-a1f8-913758d8540a)) | 32/32 |
| [#11](https://github.com/IamHarrie-Labs/carelog/pull/11) | [bc9c9f9](https://github.com/IamHarrie-Labs/carelog/commit/bc9c9f98e1787167e80dbca30c778f089a747174) 30/32, 1 failed, 1 blocked ([85d959fb](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/85d959fb-9ce0-4d69-8625-ee8a384c6076)) | 32/32 |

PR #7 was 32/32 on its only commit. PR #8’s first two commits have an empty status list (combined state `pending`); the head is 32/32. PR #12 (docs) was 32/32 on its only commit.

The “next five updates” after #5 are #6–#10. All five merged with a final 32/32. Three of them (#6, #9, #10) were red on an earlier commit of the same PR. #11 and #12 also ended at 32/32; #11 was red first.

## Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
|---|---|---|---|---|
| TestSprite browser flows | 32 on every PR | 32 titles in the green PR #5 comment (listed below) | [comment](https://github.com/IamHarrie-Labs/carelog/pull/5#issuecomment-6356181914) | **VERIFIED** as a cloud suite. **0 plan files in git** |
| Repository tests `npm test` | 41 in the current README; the DEV article says 40 | 41 `test()` calls; local run **41 passed, 0 failed** (Node v22.23.4, in-memory libSQL, no secrets, ~4s) | [README](https://github.com/IamHarrie-Labs/carelog/blob/main/README.md), [test/](https://github.com/IamHarrie-Labs/carelog/tree/main/test) | **VERIFIED** for 41. The article’s 40 is **FALSE** against this HEAD (the 30-day session test arrived in [PR #11](https://github.com/IamHarrie-Labs/carelog/pull/11)) |
| Playwright `npm run test:browser` | 7 journeys | 7 `test()` calls in [frontend.spec.js](https://github.com/IamHarrie-Labs/carelog/blob/main/test/browser/frontend.spec.js) | same | **VERIFIED** count |
| Playwright executed here | README implies they pass | **6 passed, 1 failed** with `PW_CHANNEL=chrome` (system Chrome). Default channel is Edge, which is not installed here, so the first attempt failed at browser launch | local, 2026-10-23 | The reduced-motion journey expected 0 running animations on `.cl-story` and got 8 ([frontend.spec.js line 117](https://github.com/IamHarrie-Labs/carelog/blob/main/test/browser/frontend.spec.js)) |

Local `npm test` is runnable. It does not need Turso. Playwright needs a browser channel; Edge was absent.

The 32 cloud tests, grouped into the 14 areas named in the README at [bfb3c73](https://github.com/IamHarrie-Labs/carelog/blob/bfb3c730396609adb2c7105d8939f7d30a0ad20b/README.md):

| Area | Tests in the PR #5 green comment |
|---|---|
| Accounts | Create a new account; Sign in with valid credentials; Create a care circle and land on Today |
| Care circle setup | Create care circle with example schedule |
| Today | Record a scheduled dose as given; Log a medication outcome from quick log; Add a freeform care note from Today |
| Handoff | Prepare a handoff with notes; See recorded care included in the handoff; Review and acknowledge a handoff |
| Open items | Add a new open item; Assign an open item to yourself; Close an open item with an outcome |
| Timeline | View timeline entries in reverse chronological order; Correct a timeline entry |
| People | Invite a family caregiver to a care circle; Remove a caregiver from a care circle |
| Emergency | Create an emergency access link; Open a created emergency link; Revoke an active emergency link |
| Documents | Add a document to the documents list; Include a document in the emergency packet |
| Appointments | Add an owned appointment without creating an open item; Add an unowned appointment as an open item |
| Supplies | Track a low-stock supply item; Restock a supply item and close the refill work |
| Care load | Log a care shift; Log a private check-in |
| Money | Add a new expense; Review the expense list after adding an expense |
| Notes | Save a private observation note; Save an incident note |

3+1+3+3+3+2+2+3+2+2+2+2+2+2 = 32.

## Claim verification

| Claim | Status | Evidence |
|---|---|---|
| TestSprite found sign-out ending every session | **VERIFIED** | PR #1 failures “Log a private check-in” and “Add an owned appointment…” showed “Please sign in” while the header showed Test Sam ([execution cd019aeb](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/cd019aeb-c003-4b54-81b6-362d35819d91), [PR #4](https://github.com/IamHarrie-Labs/carelog/pull/4)). Parent of the fix deleted `sessions` by `user_id`. The fix deletes only the current token ([04733ca](https://github.com/IamHarrie-Labs/carelog/commit/04733caadef071d7bbde78acb12093cce65d6c33)). Regression: [access.test.js](https://github.com/IamHarrie-Labs/carelog/blob/main/test/access.test.js) “signing out ends only that session”. |
| Time mismatch (a 14:00 shift shown as 15:00) | **VERIFIED** as a real defect and fix. The surviving TestSprite comment does not name this failure | [bac59e8](https://github.com/IamHarrie-Labs/carelog/commit/bac59e88f4b029b20e624321b2df597d8860606f) and [time.test.js](https://github.com/IamHarrie-Labs/carelog/blob/main/test/time.test.js) (Lagos, New York, London DST). The [DEV article](https://dev.to/iamharrie/building-a-shared-care-record-3ka4) describes a test that entered 14:00–15:00 and saw 15:00–16:00. The PR #2 comment that remains is a later run; “Log a care shift” is in its passed table. The commit before the fix was 31/32 (1 failed, state success); the fix commit was 29/32 (3 failed, state success). |
| Restock marked the refill complete while stock was still low | **VERIFIED** as a code fix with a unit test. Direct TestSprite failure text was not retained | [dab9d8a](https://github.com/IamHarrie-Labs/carelog/commit/dab9d8a8e7725bd5ed00047d4ef90a20a041f1f6) changes [extras.js](https://github.com/IamHarrie-Labs/carelog/blob/main/src/extras.js) so a partial restock leaves the same open item. The new unit test landed in that same commit. On the PR #1 run, “Restock a supply item and close the refill work” is in the passed list, so that case does not by itself prove the partial-restock bug. Author account: DEV article and [README](https://github.com/IamHarrie-Labs/carelog/blob/main/README.md). |
| A note saved from Today was missing on Today | **VERIFIED** | [4785edf](https://github.com/IamHarrie-Labs/carelog/commit/4785edfe344e01c1d2240784de765c9accff2a9e) says a TestSprite run on PR #5 found the note gone after save, and Today now lists the day’s notes. The previous commit was the 28/32 failure. UI: `today-notes` in [public/app.js](https://github.com/IamHarrie-Labs/carelog/blob/main/public/app.js). The green comment does not repeat the old failure (it was overwritten). |
| One update passed 28 of 32 and was blocked until fixed; all 32 then passed | **VERIFIED** for the counts and the merge timing. The branch-protection setting is **UNVERIFIED** (API 403) | [bfb3c73](https://github.com/IamHarrie-Labs/carelog/commit/bfb3c730396609adb2c7105d8939f7d30a0ad20b) status `failure`, “28/32 passed · 2 failed · 2 blocked”. Two later commits stayed `failure` (27/32, 30/32). Merge followed “All 32 tests passed” on [c21e09a](https://github.com/IamHarrie-Labs/carelog/commit/c21e09a7d8d7cf35adf47f0e3c550196aea0bcfd). The first commit on the same PR was still state `success` with 31/32 and 1 failed. |
| The next five updates also passed all 32 | **VERIFIED** | PRs [#6](https://github.com/IamHarrie-Labs/carelog/pull/6) through [#10](https://github.com/IamHarrie-Labs/carelog/pull/10) each merged with head status “All 32 tests passed”. #6, #9, and #10 were red on an earlier commit first (table above). #11 and #12 also ended at 32/32. |
| Database requests for one handoff fell from 127 to 10 | **VERIFIED** for a 40-note handoff read with no schedule rows | Commit [5bcdf02](https://github.com/IamHarrie-Labs/carelog/commit/5bcdf02d0f14240309ca7e20f961c74908fe40a3) states: 40 notes = 84 queries, handoff 127 → 10, digest 89 → 11. Reproduced 2026-10-23 by counting `execute` calls, parent commit [6aa635f](https://github.com/IamHarrie-Labs/carelog/commit/6aa635f79562f423800043a1593032ba6c515aed) vs this HEAD: records list **84 → 6**, handoff GET with no schedule items **127 → 10**, digest **89 → 11**. A handoff on a circle with the 3-item example schedule is higher after the change as well (local: create 25, read 13), because per-item schedule lookups were not batched. The DEV article’s “41 notes took 84” does not match this count (41 notes was **86** before the change). |
| Checks cover 14 parts of CareLog | **VERIFIED** | The 32 titles above map onto the 14-row table in the README at [bfb3c73](https://github.com/IamHarrie-Labs/carelog/blob/bfb3c730396609adb2c7105d8939f7d30a0ad20b/README.md). The current README folds several of those rows together. This is one 32-test cloud suite, not 14 GitHub checks. |
| Preview deployments share the live database | **VERIFIED** as the design the author describes and the code implements. The Vercel env values were not read | [README known limits](https://github.com/IamHarrie-Labs/carelog/blob/main/README.md), [DEV article](https://dev.to/iamharrie/building-a-shared-care-record-3ka4), and [api/index.js](https://github.com/IamHarrie-Labs/carelog/blob/main/api/index.js) use a single `TURSO_DATABASE_URL`. No per-preview database is created in code. PR #11’s re-run commit says a parallel test revoked a shared emergency link ([349980d](https://github.com/IamHarrie-Labs/carelog/commit/349980d8da57288d3be4f9ded8cf19de6d6bf883)). |
| Earlier updates merged before the all-checks rule | **VERIFIED** | PRs #1 (merged 2026-10-22, 6 failed), #2 (2 failed, 1 blocked), and #4 (1 blocked) merged while TestSprite’s GitHub state was `success`. The author says the fail-the-check setting was changed later ([DEV](https://dev.to/iamharrie/building-a-shared-care-record-3ka4)). |
| Not tested with real caregivers | **VERIFIED** as the project’s own disclosure | [README](https://github.com/IamHarrie-Labs/carelog/blob/main/README.md) “Not yet tried by real caregivers.” No study, interview notes, or caregiver feedback in the repo. The article says the author could walk through the app alone. |

Other defects the author attributes to the PR #5 runs, with commits but without a retained failure title: the word “null” on the sign-in form, invite characters that are easy to mis-copy, no explanation when the acknowledge button is hidden, and handing an invite to someone on the same device ([4785edf](https://github.com/IamHarrie-Labs/carelog/commit/4785edfe344e01c1d2240784de765c9accff2a9e), [4a7f579](https://github.com/IamHarrie-Labs/carelog/commit/4a7f579298c628560fd6287f367236029897366a), [c21e09a](https://github.com/IamHarrie-Labs/carelog/commit/c21e09a7d8d7cf35adf47f0e3c550196aea0bcfd)).

## Code quality

The server is small and split by feature. Passwords use scrypt and a timing-safe compare. Records are append-only; corrections are a separate table. Membership is re-read on every protected request, so removal is immediate. User-facing strings go through `textContent` in `h()`. Roles are an explicit capability map. The interesting rules (one completion, private notes, cent-perfect splits, invite races, clinician expiry) have direct tests, and those tests passed locally.

Smells that matter for a judge:

- No formatter, typechecker, linter, or GitHub Actions. The only automated gate on a PR is Vercel plus TestSprite. `npm test` is not run in CI.
- TestSprite plans are not in the repository, so a third party cannot see what the agent was told to do, only the title and the pass bit.
- Until the setting change, a run with failed tests still posted GitHub state `success`, which is why early red runs did not block merges.
- Preview tests write into the production Turso database. The author documents this. PR #11 records a parallel run revoking an emergency link the other test still needed.
- `dayView` still does per-schedule-item queries, and a handoff still queries once per “no record” row ([core.js](https://github.com/IamHarrie-Labs/carelog/blob/main/src/core.js), [handoffs.js](https://github.com/IamHarrie-Labs/carelog/blob/main/src/handoffs.js)). The 127 → 10 figure is the batched record read, not every page.
- `scryptSync` runs on the request thread. No login rate limit is visible.
- The SPA rewrite returns the HTML shell with HTTP 200 for unknown paths (`/missing-page`). API unknown routes do 404.
- PRD section numbering repeats “5” after “6. Non-goals”.
- PRs are self-merged. No review bodies on the gated PR.
- The local Chrome Playwright run fails the reduced-motion assertion (8 animations still running). The project’s default browser is Edge, which was not installed here.
- `docs/reference-audit/` stores a large measured copy of another product’s marketing page. Fonts in `public/assets/` include license files.

## Live-site behavior

Checked with curl on 2026-10-23. No account was created, because a sign-up would write the shared production database.

| URL | Result |
|---|---|
| https://trycarelog.xyz/ | **200** in ~0.13s, 1296 bytes, `server: Vercel`, `x-vercel-cache: HIT`, etag `5d1b3830c4ba6fb6508652c07405ab20`, `last-modified` Fri 23 Oct 2026 06:54:12 GMT. Title: “CareLog — Care changes hands. The details stay together.” |
| https://carelog-sigma.vercel.app/ | **200**, same etag and title. Same deployment as the custom domain. |
| `/login`, `/signup` | **200** HTML shell (the app boots in the browser) |
| `/api/health` | **200** `{"ok":true}` (~1.13s on this call) |
| `/api/templates` | **200** JSON, adult schedule includes “Morning medication” |
| `/api/me` | **401** `{"error":"not_signed_in"}` |
| `/api/does-not-exist` | **404** `{"error":"not_found"}` |
| `/api/emergency/not-a-real-token` | **404** `{"error":"link_not_found"}` |
| `/missing-page`, `/e/not-a-real-token` | **200** HTML shell, not an HTTP 404 |

HSTS is set. The HTML response includes `access-control-allow-origin: *`. The signed-in product (Today, handoff, invite) was not exercised against production.

## Demo

A public video exists: [Carelog demo](https://youtu.be/bMXk8A4guh0). oEmbed title “Carelog demo”, channel [DotResearch](https://www.youtube.com/@DotResearch-b1k). The watch page shows publish date Oct 22, 2026 and 4 views. YouTube’s player endpoint returned `LOGIN_REQUIRED`, and there is no caption track, so **length and what the video shows are UNVERIFIED**. The repo has screenshots of landing, Today, handoff, and settings ([docs/screenshots](https://github.com/IamHarrie-Labs/carelog/tree/main/docs/screenshots)).

## Weaknesses / risks for judges

- The cloud suite is real and repeated, but it is not reproducible from git. There is no plan file, no CLI log, and no CI job. The bot comment on the gated PR was edited to the final green result.
- Branch protection could not be confirmed. The author says administrators are included. What is visible is a status that, after a settings change, goes red, plus merge commits that waited for green. Before that change, failed tests were a green status, and three PRs merged in that state.
- Preview and production share one database. Tests create their own circles, and they still accumulate rows and can revoke links in the live database. That is a serious gap for anything that might hold health information, and it makes runs order-dependent (the author documents both).
- Several “TestSprite found this” stories (hour shift, partial restock) are backed by the fix and the author’s write-up, not by a failure title that is still on the pull request.
- No caregiver has used it, by the author’s account. The copy is careful about “missed” versus “no record,” which is the right product stance, and it is untested with the people who would be tired at 2am.
- One local Playwright journey fails on Chrome under reduced motion. There is no CI to show Edge is green on main.
- The demo’s contents and length could not be checked.

## Where it beats Ninety

Ninety is the Schengen 90/180 calculator at https://github.com/mohamedwael201193/ninety (live https://ninety-coral.vercel.app). It is ahead of CareLog on committed TestSprite plans, a backend CLI gate, CI, and an oracle. These are the places CareLog is actually ahead.

1. **A public demo video.** [https://youtu.be/bMXk8A4guh0](https://youtu.be/bMXk8A4guh0) exists (title and channel verified; length and contents not). Ninety has no demo video. Matching it means publishing a walkthrough of the real flows. CareLog’s video is thin evidence until someone can watch it.
2. **A failed cloud run becomes a red GitHub status, and the gated PR waited.** On [bfb3c73](https://github.com/IamHarrie-Labs/carelog/commit/bfb3c730396609adb2c7105d8939f7d30a0ad20b) TestSprite V3 is state `failure` (28/32). The next two commits stayed `failure` (27/32, 30/32). The PR merged only after [32/32](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/222a56f6-f5d4-48e5-86a4-c254503529c2). Ninety’s PR #63 merged while TestSprite V3 was red. To match, Ninety needs failed TestSprite runs to be a failing status and needs to merge only after that status is green. CareLog’s own PRs #1, #2, and #4 merged while the check was green despite failures, and neither repo’s branch protection was readable (403).
3. **Cloud failures changed caregiver-facing behaviour inside the blocked PR, with regression tests in git.** Sign-out-all-sessions is tied to a still-visible failure text ([PR #1 execution](https://www.testsprite.com/dashboard-v3/o/86671820-5628-5512-8697-f024001165bf/projects/7e47ba56-497a-4e60-8986-22bc6e6bb88c/execution/cd019aeb-c003-4b54-81b6-362d35819d91), [PR #4](https://github.com/IamHarrie-Labs/carelog/pull/4)). On PR #5 the author changed Today so a saved note stays on the page, shortened the invite alphabet, and added a same-device invite handoff, citing the cloud runs ([4785edf](https://github.com/IamHarrie-Labs/carelog/commit/4785edfe344e01c1d2240784de765c9accff2a9e), [c21e09a](https://github.com/IamHarrie-Labs/carelog/commit/c21e09a7d8d7cf35adf47f0e3c550196aea0bcfd)). `npm test` here: 41 passed. Ninety would need its red cloud runs to leave the same kind of product commit plus a test that fails on the old behaviour. Ninety’s LOOP-ITERATIONS history is about its own suite, which is deeper; it does not have this “the agent could not copy the invite” product loop.

The 127 → 10 handoff figure is also something a judge can re-run from git (see the claim table). That is verifiability of a performance claim, not a TestSprite technique.

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 8 | Shared care, double recording, and handoffs that do not silently close work are a real problem. The “no record” wording is careful. No real caregivers, and the live database is shared with tests. |
| TestSprite depth | 6 | App on every PR, 32 flows, a true red-then-green gate on PR #5 and again on #6, #9, #10, and #11. No plans in git, no CLI, no MCP, no CI, no schedule, protection unread. |
| Verifiability | 8 | Pass counts are on commit statuses with dashboard links. 41 unit tests passed here. 84 → 6 and 127 → 10 reproduced. A few bug attributions survive only in the author’s article. Protection is 403. |
| Polish | 7 | Custom domain, coherent landing and workspace, settings, readable empty states in the PRD. SPA 200s for unknown URLs, no CI, one local Playwright failure, shared production data. |
| Demo | 5 | A public video exists and is titled for the product. Length and contents could not be checked. Four views on the day after publish. |
| **Overall** | **7** | A working care log with an honest gate story and a reproducible performance fix. The TestSprite integration is a GitHub App plus previews, not a suite you can read or re-run from the repository, and the early PRs merged while failures were still a green check. |
