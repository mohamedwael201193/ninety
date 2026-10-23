# Lectern

- **Name:** Lectern
- **Repo:** https://github.com/freddy-tama/lectern (default branch `main`, HEAD `fb577108ac471af467478c353f39df06d84e91ff`)
- **Live:** https://lectern-sooty.vercel.app/
- **TestSprite PRs:** https://github.com/freddy-tama/lectern/pull/8 and https://github.com/freddy-tama/lectern/pull/9, plus the check on #10, #11, #12, #13, #14, #16, and #17 (see §4). #15 has no TestSprite status.
- **Demo:** https://lectern-sooty.vercel.app/welcome#tour — file https://lectern-sooty.vercel.app/media/lectern-tour.mp4
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7

## 1. What it is

Lectern is a browser app for building a talk, pitch, report, or lesson and rehearsing from the same deck. Each slide carries a script, cues, a likely question, and planned minutes, and those notes feed presenter view, a teleprompter, study mode, a handout, and PowerPoint speaker notes. Decks stay in IndexedDB. Optional server functions call Claude for drafting and OpenAI for pictures. The user is a teacher or presenter who wants one artifact for slides and rehearsal, with a phone quiz and no account required to start. Live HTML describes that job: “Present from your laptop, read the script on your phone, quiz the room, export to PowerPoint.”

## 2. Architecture

Vite 8 + React 19 + React Router 7 SPA, Dexie/IndexedDB, pptxgenjs, PeerJS, Transformers.js (Whisper), Vercel serverless functions, optional Supabase for accounts. App root is `lectern/` (`vercel.json` build is `npm run build` → `tsc --noEmit && vite build`, output `dist/`). Deploy target is Vercel project `lectern` under `freddy-tamas-projects` (preview host pattern documented as `lectern-git-{branch}-freddy-tamas-projects.vercel.app`).

| Module | Role | Blob |
|---|---|---|
| Slide-type registry | 37 built-in kinds registered at startup | https://github.com/freddy-tama/lectern/blob/main/lectern/src/core/kinds/core-kinds.ts#L776-L783 |
| Layout engine | 1920×1080 boxes shared by canvas and PPTX | https://github.com/freddy-tama/lectern/blob/main/lectern/src/core/engine/layout.ts |
| `/make` | File or topic → deck; AI-off guard | https://github.com/freddy-tama/lectern/blob/main/lectern/src/features/autodeck/MakePage.tsx#L330-L339 |
| Phone quiz in a link | Questions packed into the URL hash | https://github.com/freddy-tama/lectern/blob/main/lectern/src/features/landing/PhoneQuiz.tsx#L25-L29 |
| Service worker | Precache app shell; skip `/api/*` | https://github.com/freddy-tama/lectern/blob/main/lectern/src/pwa/sw.js |
| PWA registration | Production only, not on `/join` | https://github.com/freddy-tama/lectern/blob/main/lectern/src/app/pwa.ts#L204-L207 |
| API | `api/draft-deck.ts`, `revise-slide.ts`, `deck-assistant.ts`, `make-code.ts`, `lecture-notes.ts`, `picture-search.ts`, `picture-fetch.ts`, `picture-generate.ts`, `account.ts` | https://github.com/freddy-tama/lectern/tree/main/lectern/api |
| Accounts schema | Credits + study progress, RLS | https://github.com/freddy-tama/lectern/blob/main/lectern/supabase/schema.sql |
| Routes | `/welcome`, `/start`, `/make`, `/studio/:id`, `/present/:id`, `/pack`, `/join`, `/try/:sample/:view` | https://github.com/freddy-tama/lectern/blob/main/lectern/src/app/App.tsx#L69-L98 |

TypeScript under `src/`, `api/`, `tests/`, and `plugins/` is about 54,120 lines. Public build excludes mods. Three extra kinds live in `plugins/chinese/` (`chinese.characters`, `chinese.word`, `chinese.sentence`).

## 3. TestSprite integration depth

**Score: 6/10.** The GitHub App really runs a 27-test frontend suite on Vercel previews and writes a commit status whose description is the pass fraction. That loop is auditable from GitHub for nine pulls. The suite is not in git, GitHub does not require the check, there is no CLI, no MCP, no schedule, and the tests skip AI, sign-in, file upload, and live WebRTC. Blocked or failed runs were merged.

### GitHub App check

Context name is `TestSprite V3` (commit status, not a Check Run). The only Check Run on these SHAs is `Vercel Preview Comments`. Actions workflows: `total_count` 0 (`GET /repos/freddy-tama/lectern/actions/workflows`). PRs #1–#7 have no TestSprite status. `main` HEAD `fb57710` has only the Vercel status (the log says pushes to `main` are skipped).

| PR | Head | Status | Description | Posted (UTC) | Vercel success → status | Execution |
|---|---|---|---|---|---|---|
| [#8](https://github.com/freddy-tama/lectern/pull/8) | `c4e2017` | failure | `26/27 passed · 1 failed` | 2026-10-21 15:10:42 | ~12 min (run window on the comment ~15:07:46–15:10:40, ~3 min) | [5376a8a2](https://www.testsprite.com/dashboard-v3/o/dfe734b3-7442-5019-aa71-fa10706b4f14/projects/4a558259-6d77-449a-bede-151ba58b667a/execution/5376a8a2-29a2-410f-b891-729e47ef7aaa) |
| [#9](https://github.com/freddy-tama/lectern/pull/9) | `481a6d2` | success | `All 27 tests passed` | 2026-10-21 16:16:39 | ~6 min | [3ae71737](https://www.testsprite.com/dashboard-v3/o/dfe734b3-7442-5019-aa71-fa10706b4f14/projects/4a558259-6d77-449a-bede-151ba58b667a/execution/3ae71737-de1e-4bc7-ae2c-a1b48bddd0d8) |
| [#10](https://github.com/freddy-tama/lectern/pull/10) | `2ef0638` | success | `All 27 tests passed` | 2026-10-21 16:44:53 | ~13.5 min | [1cc5186e](https://www.testsprite.com/dashboard-v3/o/dfe734b3-7442-5019-aa71-fa10706b4f14/projects/4a558259-6d77-449a-bede-151ba58b667a/execution/1cc5186e-11c9-481a-a141-30ab7b112350) |
| [#11](https://github.com/freddy-tama/lectern/pull/11) | `5e2744f` | success | `All 27 tests passed` | 2026-10-21 18:03:53 | ~4.4 min | [f242796d](https://www.testsprite.com/dashboard-v3/o/dfe734b3-7442-5019-aa71-fa10706b4f14/projects/4a558259-6d77-449a-bede-151ba58b667a/execution/f242796d-a0c5-4584-a29b-d3dc539db17c) |
| [#12](https://github.com/freddy-tama/lectern/pull/12) | `728487b` | success | `All 27 tests passed` | 2026-10-21 18:11:46 | ~3.8 min | [6b3e289a](https://www.testsprite.com/dashboard-v3/o/dfe734b3-7442-5019-aa71-fa10706b4f14/projects/4a558259-6d77-449a-bede-151ba58b667a/execution/6b3e289a-5664-46f1-be89-4359bafff4fc) |
| [#13](https://github.com/freddy-tama/lectern/pull/13) | `d23392e` | success | `All 27 tests passed` | 2026-10-21 18:47:52 | ~3.6 min | [b5ad2377](https://www.testsprite.com/dashboard-v3/o/dfe734b3-7442-5019-aa71-fa10706b4f14/projects/4a558259-6d77-449a-bede-151ba58b667a/execution/b5ad2377-f93f-426c-8334-eba11deb5634) |
| [#14](https://github.com/freddy-tama/lectern/pull/14) | `4f6c7aa` | failure | `26/27 passed · 1 blocked` | 2026-10-21 19:08:11 | ~5.1 min | [6fb0f65c](https://www.testsprite.com/dashboard-v3/o/dfe734b3-7442-5019-aa71-fa10706b4f14/projects/4a558259-6d77-449a-bede-151ba58b667a/execution/6fb0f65c-2c73-416d-904d-c7b511519db0) |
| [#15](https://github.com/freddy-tama/lectern/pull/15) | `a1dd274` | none | Vercel success only. Closed, not merged. | — | — | — |
| [#16](https://github.com/freddy-tama/lectern/pull/16) | `22423a3` | failure | `26/27 passed · 1 blocked` | 2026-10-22 08:07:12 | ~3.4 min | [bdd1b265](https://www.testsprite.com/dashboard-v3/o/dfe734b3-7442-5019-aa71-fa10706b4f14/projects/4a558259-6d77-449a-bede-151ba58b667a/execution/bdd1b265-26e8-4d13-90b7-e1bbafbd0392) |
| [#17](https://github.com/freddy-tama/lectern/pull/17) | `cc88d10` | success | `All 27 tests passed` | 2026-10-22 23:54:34 | ~4.9 min | [324c3933](https://www.testsprite.com/dashboard-v3/o/dfe734b3-7442-5019-aa71-fa10706b4f14/projects/4a558259-6d77-449a-bede-151ba58b667a/execution/324c3933-c2d7-4f4f-acdd-0b2568c7bd1f) |

Statuses were read with `GET /repos/freddy-tama/lectern/commits/{sha}/status`. `testsprite[bot]` also comments on each of those nine PRs. The structured results line matches the status. The prose above that line does not: #8’s prose says “27 of 28” while the results line says 26 passed, 1 failed, 27 total ([comment](https://github.com/freddy-tama/lectern/pull/8#issuecomment-6319326465)); #14’s prose says “24 tests passed” while the results line says 26 passed and 1 blocked ([comment](https://github.com/freddy-tama/lectern/pull/14#issuecomment-6324165534)); #16’s prose says “27 tests passed and only 1 test was blocked” while the results line says 26 passed and 1 blocked ([comment](https://github.com/freddy-tama/lectern/pull/16#issuecomment-6335865467)).

Named exceptions from those comments:

- #8 failed test: “Continue using the home page after starting from the sample talk” (exited to `/welcome` and saw “Slides that know what to say”). “Make a deck from a topic alone with no AI” is in the passed table. [Failed-test link](https://www.testsprite.com/dashboard-v3/o/dfe734b3-7442-5019-aa71-fa10706b4f14/projects/4a558259-6d77-449a-bede-151ba58b667a/execution/5376a8a2-29a2-410f-b891-729e47ef7aaa/test/947c1b94-8044-43df-bdf8-86bb51c01412).
- #14 and #16 blocked test: “Build a deck from notes with the talk audience” (agent could not activate “Open as a deck”). Zero failed rows.
- #9 and #17 list that same notes test and the home-page test as passed. [#9 comment](https://github.com/freddy-tama/lectern/pull/9#issuecomment-6320714168), [#17 comment](https://github.com/freddy-tama/lectern/pull/17#issuecomment-6353882406).

Dashboard execution pages return HTTP 200 with title “TestSprite” and a Next.js shell. The pass counts above come from GitHub, which does not require a dashboard login.

### Required check

`GET /repos/freddy-tama/lectern/rulesets` returned `[]`. `GET /repos/freddy-tama/lectern/branches/main/protection` returned **403** `Resource not accessible by integration` (the README’s claim that this call answers “Branch not protected” was not reproduced with this token). Merges while `TestSprite V3` was `failure`:

- #8 merged 2026-10-21T16:19:06Z with its own check still `26/27 passed · 1 failed`. #9, which contains #8’s commits, merged two seconds earlier with `All 27 tests passed`.
- #14 merged 2026-10-22T01:53:27Z while the status was `26/27 passed · 1 blocked`.
- #16 merged 2026-10-22T08:16:14Z while the status was `26/27 passed · 1 blocked`.

The app reports a failing status. GitHub did not block those merges. The README says the same thing: https://github.com/freddy-tama/lectern/blob/main/README.md#L75

### CLI, MCP, schedules

No `testsprite` CLI invocation, no workflow file, no MCP config, no cron. No issues in the repo (`gh issue list` empty). No nightly or on-merge job. HEAD of `main` has no TestSprite status.

### Plans committed

Executable TestSprite tests in git: **0**. What is committed:

- Product spec with exact copy, URLs, and `data-testid`s: https://github.com/freddy-tama/lectern/blob/main/lectern/docs/testsprite-prd.md
- Run log: https://github.com/freddy-tama/lectern/blob/main/lectern/docs/testsprite-log.md
- Sample notes the log says the free plan could not upload: https://github.com/freddy-tama/lectern/blob/main/lectern/docs/testsprite-sample-notes.md
- 27 test ids named in the README table (WLC-006 through DRF-001): https://github.com/freddy-tama/lectern/blob/main/README.md#L83-L95

The PRD’s later flows (sign-in ACC-001–003, new slide types, on-slide editing) have no tests. The log says the planner proposed 83 and they kept 27. That 83 and the credit ledger are only in the log.

### Triage

`testsprite[bot]` posts one comment per run with a results table, a screenshot for the failed or blocked case, and a suggested fix prompt. There is no auto-fix bot and no issue tracker. The human log in `testsprite-log.md` matches the GitHub counts for #8–#12, #14, #16, and #17. #13’s execution id `b5ad2377` is on the commit status and is absent from the log (the log says the result was left on the PR).

### Red → green

1. **`/make` without AI.** On #8, “Make a deck from a topic alone with no AI” passed and the suite was 26/27. The guard is in `MakePage.tsx` (return before `offlineDraft` when there is no file material and AI cannot run). #9 then reported `All 27 tests passed`, including that test. Production run 1 (claimed 21 passed, 4 failed, 2 blocked) has **no execution URL**.
2. **Home-page test (PRS-006).** #8 failed it. #9 passed the same title. The diff from `c4e2017` to `481a6d2` in landing/routing is copy about accounts (“No account” → “No sign-up to start”) plus a `/signin` route. It does not change present-exit routing. A portal rewrite is consistent with that diff and with the author’s log; the rewritten steps are not in git.
3. **Notes-to-deck blocked, then passed.** #14 and #16 blocked “Build a deck from notes with the talk audience” with 0 failed. Both were merged on a failing status. #17 passed that test. The log says the button was unchanged, so this is a flaky agent run, not a product fix.

### Credits

Only in `testsprite-log.md`: free plan 150 credits/month, about 13.5 per 27-test run, about 5.5 left after #17, renews 15 Nov. **UNVERIFIED** (no usage API).

### Why 6

Present: App check on nine preview SHAs, status text with counts, bot comments that name the bad test, a committed PRD, one product fix whose new test is green on #8 and whose suite is green on #9. Absent: tests as code, a required check, CLI, MCP, schedules, coverage of AI and live sharing, and a merge policy that waits for green. #15 shows the trigger depends on a predictable preview hostname (long branch slug, no TestSprite status).

## 4. Test inventory

| Layer | Claimed | Verified | Evidence | Status |
|---|---|---|---|---|
| TestSprite frontend, per PR preview | 27 tests, ~4 min | 27 total on the status for #8–#14, #16, #17. Full pass on #9, #10, #11, #12, #13, #17. 26/27 on #8 (1 failed), #14 (1 blocked), #16 (1 blocked). #15 not run. #1–#7 no check. | Status table in §4 and the PR links | VERIFIED for those PRs. “Every PR” is FALSE. |
| TestSprite plans in git | 27 planned from the PRD in the 3.0 portal | 27 ids written in the README; PRD file present; 0 executable test files | https://github.com/freddy-tama/lectern/blob/main/README.md#L83-L95 and https://github.com/freddy-tama/lectern/blob/main/lectern/docs/testsprite-prd.md | Names VERIFIED as docs. Portal plan and the “83 proposed” figure UNVERIFIED. |
| Vitest | “600+”; README says “625 tests in 45 files” | **726 passed, 50 files, 0 failed**, vitest 5.0.5, Node 22.23.4, 14.21s, run 2026-10-23 in `/tmp/competitors/lectern/repo/lectern` after `npm ci`. Canvas `getContext` warnings only. `node_modules` removed afterward. | Log also says 726 on the tour branch: https://github.com/freddy-tama/lectern/blob/main/lectern/docs/testsprite-log.md (tour section). Tests: https://github.com/freddy-tama/lectern/tree/main/lectern/tests | **600+ VERIFIED (726).** README “625 / 45 files” is stale: https://github.com/freddy-tama/lectern/blob/main/README.md#L119 |
| Postgres RLS via PGlite | Covered inside `npm test` | Included in the 726 (`tests/credits-schema.test.ts` ran with the suite). Not counted separately. | https://github.com/freddy-tama/lectern/blob/main/lectern/tests/credits-schema.test.ts | VERIFIED as part of the vitest run |
| GitHub Actions / CI unit tests | — | 0 workflows | https://github.com/freddy-tama/lectern/actions | No CI running vitest |

Static `it`/`test` calls are 627 across 50 files, plus `it.each`, which expands to the 726 vitest reported.

## 5. Claim verification

| Claim | Verdict | Evidence |
|---|---|---|
| 30+ slide types | **VERIFIED (37 built-in)** | 15+2+6+7+3+1+3 `kind:` definitions in `core-kinds.ts`, `data-kinds.ts`, `visual-kinds.ts`, `media-kinds.ts`, `pitch-kinds.ts`, `live-kinds.ts`, `report-kinds.ts`. `coreKinds()` is `allKinds()` minus plugins: https://github.com/freddy-tama/lectern/blob/main/lectern/src/features/landing/samples.ts#L148-L151. Deployed landing chunk contains “37” and the tour/quiz strings (`/assets/Landing-QvDlcs-F.js`). Three Chinese kinds are build-time mods, not in the public count. |
| Live phone quizzes | **VERIFIED for the in-link quiz; two-device WebRTC not executed** | `PhoneQuiz` packs the sample talk into `/pack#…`: https://github.com/freddy-tama/lectern/blob/main/lectern/src/features/landing/PhoneQuiz.tsx. Landing chunk contains `quiz-open-here` and “Take the quiz”. TestSprite “Complete the phone quiz” is in #8’s passed table and in the all-green runs. Live PeerJS room (`LiveScreen-*.js` is deployed) is out of the TestSprite scope per the PRD and was not run here with two browsers. |
| Offline after one visit | **VERIFIED that the worker ships; offline reload not performed in a browser** | https://lectern-sooty.vercel.app/sw.js is HTTP 200, `Cache-Control: no-cache`, `VERSION = "8c491f26830f"`, precache list of **106** URLs including `/index.html`. Registration is production-only: https://github.com/freddy-tama/lectern/blob/main/lectern/src/app/pwa.ts#L204-L207. Manifest 200, `display: standalone`. |
| 27 TestSprite tests planned in the 3.0 portal from the product spec | **VERIFIED that 27 tests run and the spec is in git; the portal session is UNVERIFIED** | Status descriptions say 27. Spec: https://github.com/freddy-tama/lectern/blob/main/lectern/docs/testsprite-prd.md. “83 proposed, cut to 27” and “10 agents” are only in the log. |
| Run on every PR’s Vercel preview in ~4 minutes | **FALSE for “every PR”; ~4 minutes is roughly true for the runs that happened** | #1–#7 have no check. #15 has Vercel only. Of the nine runs, several finished about 3–5 minutes after the Vercel status (#11 ~4.4, #12 ~3.8, #13 ~3.6, #16 ~3.4, #17 ~4.9). #8’s status was ~12 minutes after Vercel (comment shows ~3 minutes of execution). #10’s status was ~13.5 minutes after Vercel. |
| 8 PRs carry the check (#8–#14, #16) | **VERIFIED, and #17 is a ninth** | Table in §4. #15 does not. |
| First production run caught `/make` building an empty deck that said it was ready | **UNVERIFIED** | Narrative only: https://github.com/freddy-tama/lectern/blob/main/lectern/docs/testsprite-log.md (Run 1). No execution URL. |
| Fixed in PR #8 | **VERIFIED** | https://github.com/freddy-tama/lectern/pull/8. Guard: https://github.com/freddy-tama/lectern/blob/main/lectern/src/features/autodeck/MakePage.tsx#L330-L339. #8’s passed table includes “Make a deck from a topic alone with no AI”. |
| All 27 passed on PR #9 | **VERIFIED** | Status `All 27 tests passed` on `481a6d2`, [execution 3ae71737](https://www.testsprite.com/dashboard-v3/o/dfe734b3-7442-5019-aa71-fa10706b4f14/projects/4a558259-6d77-449a-bede-151ba58b667a/execution/3ae71737-de1e-4bc7-ae2c-a1b48bddd0d8). |
| #9–#13 all 27 passed | **VERIFIED** | Each status description is `All 27 tests passed` (links in §4). |
| #8 was 26/27; the failure was a loose test, since rewritten | **26/27 VERIFIED. “Rewritten” UNVERIFIED as a portal edit, and consistent with the diff** | Status and [comment](https://github.com/freddy-tama/lectern/pull/8#issuecomment-6319326465). The bot called it an app bug (exit landed on `/welcome`). The PRD says a first visit should stay on the intro: https://github.com/freddy-tama/lectern/blob/main/lectern/docs/testsprite-prd.md. #9 passed that test title with no present-exit code change. Rewrite steps exist only in the log. |
| #14 and #16: 26/27, 1 blocked each, 0 failed | **VERIFIED** | Status text `26/27 passed · 1 blocked`. Comments name one blocked test and no failed tests. GitHub still marked the check `failure`, and both PRs merged. |
| 600+ vitest unit tests | **VERIFIED (726 passed locally)** | See inventory. README’s 625 is out of date. |
| Demo is a 75-second video | **FALSE** | `ffprobe` on https://lectern-sooty.vercel.app/media/lectern-tour.mp4: **duration 124.166667 s**, size 7,841,014 bytes (~7.8 MB), `video/mp4`, byte ranges. README says 124 seconds: https://github.com/freddy-tama/lectern/blob/main/README.md#L9 |
| Merge gate is on, and GitHub does not enforce it | **VERIFIED that failing statuses were merged. “Branch not protected” string not reproduced (API 403). Rulesets empty.** | §4 |
| Accounts are built and not switched on in production | **VERIFIED** | `GET https://lectern-sooty.vercel.app/api/account` → `{"accounts":false}` |
| AI is on in production | **VERIFIED, and it is open** | `GET /api/draft-deck` → `{"available":true,"model":"claude-opus-5-5","needsCode":false}`. `GET /api/picture-generate` → `available:true`, provider `openai`, model `gpt-image-2.5-sunburst`, `needsCode:false`. `GET /api/lecture-notes` → `available:true`. This contradicts the PRD line that the public site has no AI key. Empty `POST` bodies returned 400 and were not real generations. |

## 6. Code quality

Strict TypeScript (`strict`, `noUnusedLocals`, `noUnusedParameters`) in https://github.com/freddy-tama/lectern/blob/main/lectern/tsconfig.json. Domain code is split into `core/` (no React), `features/`, `api/`, and `data/`. The build typechecks. Vitest covers outlines, layout, PPTX, import, the service worker, sharing, AI request shapes with a mock Claude, and the SQL schema under PGlite.

Smells:

- Nothing runs `npm test` in CI. Vercel’s build is typecheck plus Vite only: https://github.com/freddy-tama/lectern/blob/main/lectern/package.json
- `eslint-disable` comments exist; `package.json` has no ESLint dependency or script, so those comments are inert.
- `npm ci` reported 5 high advisories. Not triaged.
- Root README still says 625 tests / 45 files after the tree grew to 726 / 50.
- PRD still says the public site has no AI key. Production AI is available with `needsCode: false` and accounts off, so a topic on `/make` can spend the project keys. The author’s log already says DRF-001 and NTS-002 assume AI is off and would fail on current production.
- Unknown non-API paths return the SPA shell with HTTP 200 (`/does-not-exist-asset.js` was 200, 3041 bytes). `/api/nope` is 404.
- TestSprite’s written summary on the PR disagrees with its own results table. The status description is the reliable line.
- License is all-rights-reserved: https://github.com/freddy-tama/lectern/blob/main/LICENSE

## 7. Live-site behavior

Checked with curl on 2026-10-23. No forms were submitted with real prompts, emails, or payments. The SPA was not driven in a browser, so IndexedDB, the tour player, and an offline reload were not clicked through.

| URL | Code | Time | What came back |
|---|---|---|---|
| https://lectern-sooty.vercel.app/ | 200 | 0.11s | HTML shell, title “Lectern”, 3041 bytes. Meta description mentions script, phone, quiz, PowerPoint, no account. |
| `/welcome`, `/welcome#tour`, `/make`, `/start`, `/decks`, `/try/talk/present`, `/try/talk/study`, `/try/talk/prompter`, `/try/nope`, `/signin`, `/join`, `/pack` | 200 | 0.03–0.09s | Same shell. Routing is client-side. |
| `/does-not-exist-asset.js` | 200 | 0.03s | Same HTML, not a 404. |
| `/favicon.svg` | 200 | 0.07s | SVG |
| `/manifest.webmanifest` | 200 | 0.03s | name Lectern, `start_url` `/`, `display` standalone |
| `/sw.js` | 200 | 0.04s | Real worker, 106 precache URLs, version `8c491f26830f`, last-modified 2026-10-23T05:36:48Z |
| `/media/lectern-tour.mp4` | 200 | — | 7,841,014 bytes, `video/mp4`, `accept-ranges: bytes` |
| `/api/account` GET | 200 | ~0.07–0.70s | `{"accounts":false}` |
| `/api/account` POST | 405 | 0.07s | |
| `/api/draft-deck` GET | 200 | ~0.08–0.92s | AI available, `claude-opus-5-5`, no access code |
| `/api/draft-deck` POST `{}` | 400 | 0.09s | `Describe what the deck is about.` |
| `/api/picture-generate` GET | 200 | 0.84s | OpenAI `gpt-image-2.5-sunburst`, no access code |
| `/api/picture-search` GET | 200 | 0.66s | `{"providers":["openverse","commons"]}` |
| `/api/lecture-notes` GET | 200 | 0.89s | AI available, no access code |
| `/api/nope` | 404 | 0.04s | plain text |

Deployed JS chunks include `Landing`, `MakePage`, `Studio`, `Present`, `QuizPhone`, `PackPage`, `LiveScreen`, `Study`, `Teleprompter`, and `core-kinds`, so those routes are in the production build. The landing chunk references `/media/lectern-tour.mp4`, “Play with sound”, and `quiz-open-here`.

## 8. Demo

The file exists on the live site and is referenced by the landing bundle at `#tour`. Measured length is **124.2 seconds**, 7.8 MB, with a poster at `/media/lectern-tour.jpg`. A 75-second claim does not match the file. README says the recording is narrated, keeps a sample talk, then shows a live Opus run on `/make`, the deck assistant, and three screens, with AI waits cut and labelled: https://github.com/freddy-tama/lectern/blob/main/README.md#L7-L9 and the tour script notes in https://github.com/freddy-tama/lectern/blob/main/lectern/README.md#L72-L82. The frames were not watched in this review. `ffprobe` confirms a playable MP4 with duration metadata.

## 9. Weaknesses / risks for judges

- The 27 cloud tests are not in the repository. A judge cannot rerun them from git. Flows for sign-in, the newest slide types, on-slide editing, AI drafting, and live WebRTC are explicitly untested.
- The check is not a GitHub requirement. #8, #14, and #16 merged while `TestSprite V3` was red. Blocked counts as failure on the status, and the project treated “blocked, zero failed” as mergeable.
- #14 and #16 blocked the same notes-to-deck test; #17 passed it with no claimed product change. That test is flaky.
- Current production has AI on, with no access code and accounts off. The suite’s AI-off assertions are aimed at previews. The log says they would fail on production. Open keys are a cost risk.
- The production bug-finding run (21/4/2) and the credit totals are self-reported, with no execution link for run 1.
- Unit tests never run in CI. The README’s 625-test figure is wrong for `main`.
- The preview trigger missed #15 because the branch slug made Vercel shorten the hostname. That is a real operational footgun.
- Bot comment prose misstates the counts. Use the status description and the results line.
- This review did not click the SPA, so offline-after-reload and a two-phone live quiz are code-and-asset verified only.

## 10. Where it beats Ninety

Ninety: https://github.com/mohamedwael201193/ninety , live https://ninety-coral.vercel.app. Ninety already has a TestSprite V3 check, frontend plans committed (43), a backend CLI workflow, and a written red→green log. Lectern does not beat that on plans-in-git, CLI, or a required gate (Lectern’s gate did not block merges either).

1. **Narrated demo on the live intro page.** The MP4 is 124.2 seconds at https://lectern-sooty.vercel.app/media/lectern-tour.mp4 and is wired to https://lectern-sooty.vercel.app/welcome#tour. Ninety has no demo video. To match, Ninety needs a narrated walkthrough of the calculator, EES reconcile, and letter, embedded on the live site.
2. **Larger unit suite that actually ran.** 726 vitest tests passed here in 14.2s from https://github.com/freddy-tama/lectern/tree/main/lectern/tests. Ninety’s figure is 367 passed / 3 skipped. To exceed it, Ninety needs a larger passing suite, or to keep the lead on oracle parity and fuzz, which Lectern does not have.
3. **Offline shell on the production origin.** https://lectern-sooty.vercel.app/sw.js precaches 106 URLs including `/index.html`. To match, Ninety needs a service worker that serves the calculator after one visit.
4. **Status text that states the fraction, plus a named failing test, on a Vercel preview.** Example: #9 `All 27 tests passed` on https://github.com/freddy-tama/lectern/commit/481a6d2f9c452f4beb5b7b0a366809e5bb9085e4 and the bot table on https://github.com/freddy-tama/lectern/pull/9#issuecomment-6320714168. The `/make` test is in #8’s passed list after the guard in https://github.com/freddy-tama/lectern/blob/main/lectern/src/features/autodeck/MakePage.tsx#L330-L339. To match the readable fraction, Ninety’s check description needs to keep saying `N/N` on the commit, and a production-found UI bug needs the same red-then-green pair of status URLs. Ninety already leads on committing the plans and on a backend CLI gate.

## 11. Estimated judging scores (1–10)

| Axis | Score | Why |
|---|---|---|
| Problem value | 7 | Real rehearsal-and-teaching job, local-first, broad. Slide tools are a crowded category, and the live AI path is open spend rather than a finished accounts story. |
| TestSprite depth | 6 | Nine real preview runs, status fractions, bot comments, a committed PRD, one fixed `/make` path. No tests in git, no required check, no CLI/MCP/schedule, suite skips the AI and live-room features, red checks were merged. |
| Verifiability | 7 | Pass counts, the 37 kinds, the 726 tests, the 124.2s video, and the live API flags are checkable. Production run 1, the 83-test plan, credits, and the portal rewrite are not. README 625 is stale. |
| Polish | 7 | Strict TS, fast live shell, real worker, large passing unit suite. No CI, doc drift, SPA 200s for missing files, AI open on production. |
| Demo | 8 | 124-second narrated MP4 is on the live page with a poster and a sound control. Frames were not watched. The 75-second figure is wrong. |
| **Overall** | **7** | A large, live, well-tested product with a real TestSprite App loop that a judge can audit from GitHub. The loop does not lock the features the README sells hardest, and it does not block a merge. |

## 12. Notes for the decider

See the short summary returned with this file. Primary sources for counts are the commit statuses on PRs #8–#17 and a local `npm test` of 726 passed. Production run 1 and credit totals stay unverified.
