# PatiLingo (patilingo)

- **Name:** PatiLingo
- **Author:** SenanurCodes (Senanur Bildirici)
- **Repo:** https://github.com/SenanurCodes/a1-english
- **Live:** https://senanurcodes.github.io/a1-english/
- **TestSprite PRs:** [#1](https://github.com/SenanurCodes/a1-english/pull/1) (merged 2026-10-20), [#2](https://github.com/SenanurCodes/a1-english/pull/2) (merged 2026-10-22, docs/CI only)
- **Demo:** none
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7
- **HEAD reviewed:** [`75db00f`](https://github.com/SenanurCodes/a1-english/commit/75db00f) (2026-10-23, 114 commits on `main`)

## What it is

PatiLingo is a client-only progressive web app for Turkish speakers learning English. The stated problem is the clash between Turkish SOV word order and English SVO order ("I am agree", "She has 20 years old"). The app is a hash-routed course map plus three practice games (sentence locomotive, Trap Hunter, Gemini survival quests), a 5-box Leitner review, and an optional bring-your-own-key Gemini tutor. Core use needs no account. Progress sits in `localStorage`, with an optional Firebase league/sync path.

## Architecture

Vanilla JS, not a framework and not ES modules. [`index.html`](https://github.com/SenanurCodes/a1-english/blob/75db00f/index.html) loads Firebase 10.13.2 compat from `gstatic`, then ten global scripts. Deploy target is GitHub Pages (`pages-build-deployment` on `main`). There is no server.

| Module | Role |
| --- | --- |
| [`js/data.js`](https://github.com/SenanurCodes/a1-english/blob/75db00f/js/data.js) (4650 lines) | `RAW_UNITS` → `UNITS`, `LEVELS` A1–B2, three mascots |
| [`js/exercises.js`](https://github.com/SenanurCodes/a1-english/blob/75db00f/js/exercises.js) | `buildUnitLesson`, placement, A1/A2/B1/B2 boss tests |
| [`js/app.js`](https://github.com/SenanurCodes/a1-english/blob/75db00f/js/app.js) (4556 lines) | Hash `router`, screens, onboarding, AI key UI |
| [`js/games.js`](https://github.com/SenanurCodes/a1-english/blob/75db00f/js/games.js) | Locomotive, Trap Hunter tiers, survival quests |
| [`js/ai.js`](https://github.com/SenanurCodes/a1-english/blob/75db00f/js/ai.js) | Gemini REST, 404 model fallback |
| [`js/storage.js`](https://github.com/SenanurCodes/a1-english/blob/75db00f/js/storage.js) | `AppStore`, schema, corrupt-JSON fallback |
| [`js/firebase.js`](https://github.com/SenanurCodes/a1-english/blob/75db00f/js/firebase.js) | Optional Firebase plus local email accounts |
| [`sw.js`](https://github.com/SenanurCodes/a1-english/blob/75db00f/sw.js) | Network-first cache, `APP_VERSION` 2.9.30 |
| [`tests/run-tests.js`](https://github.com/SenanurCodes/a1-english/blob/75db00f/tests/run-tests.js) | Single jsdom file, 11 `test()` cases |
| [`.github/workflows/ci.yml`](https://github.com/SenanurCodes/a1-english/blob/75db00f/.github/workflows/ci.yml) | `node --check` + `node tests/run-tests.js` on push and PR to `main` |

`package.json` version is still `2.9.26` while the service worker and cache-bust query are `2.9.30` ([`package.json`](https://github.com/SenanurCodes/a1-english/blob/75db00f/package.json), [`sw.js` L7](https://github.com/SenanurCodes/a1-english/blob/75db00f/sw.js#L7)).

## TestSprite integration depth

**Score: 4/10.** The GitHub App posts a `TestSprite V3` commit status and one detailed PR comment. That is real. It does not gate merges, it never reports a failed status even when cases fail, test plans are not in the repo, and there is no CLI, MCP, schedule, or triage issue.

### GitHub App check

Context name is `TestSprite V3`. One bot comment, on PR #1, from `testsprite[bot]`: [issuecomment-6285737016](https://github.com/SenanurCodes/a1-english/pull/1#issuecomment-6285737016) (2026-10-20). No other issue or PR comments from the bot. No PR reviews. Dashboard HTML is a client shell (`<title>TestSprite</title>` only), so failure titles below come from that comment and from status `description` strings, not from scraped dashboards.

| Commit | When the status was recorded | Status state | Description | Execution |
| --- | --- | --- | --- | --- |
| [`a30b6c4`](https://github.com/SenanurCodes/a1-english/commit/a30b6c4) (PR #1, before the fix commit) | 2026-10-20T07:37:13Z | SUCCESS | 129/132 passed · 3 failed | [1c8b5e4d](https://www.testsprite.com/dashboard-v3/o/2a658758-dd37-5438-8e5b-5a859558ebdd/projects/fe2f6059-2566-43ca-9272-f409bc9a7661/execution/1c8b5e4d-1814-419a-ad30-43d9a78b3e98) |
| [`47daba4`](https://github.com/SenanurCodes/a1-english/commit/47daba4) (PR #1 merge) | 2026-10-20T07:59:54Z | SUCCESS | 131/132 passed · 1 failed | [715edbc6](https://www.testsprite.com/dashboard-v3/o/2a658758-dd37-5438-8e5b-5a859558ebdd/projects/fe2f6059-2566-43ca-9272-f409bc9a7661/execution/715edbc6-d20b-427d-a769-4db77fa2bf6b) |
| [`14e09f1`](https://github.com/SenanurCodes/a1-english/commit/14e09f1) | 2026-10-21T16:10:58Z | SUCCESS | 169/171 passed · 2 failed | [8bf4270e](https://www.testsprite.com/dashboard-v3/o/2a658758-dd37-5438-8e5b-5a859558ebdd/projects/fe2f6059-2566-43ca-9272-f409bc9a7661/execution/8bf4270e-914b-4e5a-8e49-095d39c6f367) |
| [`70ef04e`](https://github.com/SenanurCodes/a1-english/commit/70ef04e) | (status on that SHA) | SUCCESS | 169/171 passed · 1 failed · 1 blocked | [a2c57b74](https://www.testsprite.com/dashboard-v3/o/2a658758-dd37-5438-8e5b-5a859558ebdd/projects/fe2f6059-2566-43ca-9272-f409bc9a7661/execution/a2c57b74-f8f9-43da-b35d-0fda4f226195) |
| [`79126a6`](https://github.com/SenanurCodes/a1-english/commit/79126a6) | 2026-10-21T16:37:18Z | SUCCESS | 169/171 passed · 1 failed · 1 blocked | [67b1464b](https://www.testsprite.com/dashboard-v3/o/2a658758-dd37-5438-8e5b-5a859558ebdd/projects/fe2f6059-2566-43ca-9272-f409bc9a7661/execution/67b1464b-1793-4976-b969-78c01fbb462b) |
| [`df1f6b4`](https://github.com/SenanurCodes/a1-english/commit/df1f6b4) | 2026-10-21T16:34:03Z | SUCCESS | 169/171 passed · 1 failed · 1 blocked | [5f645d1f](https://www.testsprite.com/dashboard-v3/o/2a658758-dd37-5438-8e5b-5a859558ebdd/projects/fe2f6059-2566-43ca-9272-f409bc9a7661/execution/5f645d1f-adfc-4a11-8d21-5d2628b9cb36) |
| [`7c0414c`](https://github.com/SenanurCodes/a1-english/commit/7c0414c) (PR #2 merge) | 2026-10-22T07:42:04Z | SUCCESS | 170/171 passed · 1 blocked | [f867e764](https://www.testsprite.com/dashboard-v3/o/2a658758-dd37-5438-8e5b-5a859558ebdd/projects/fe2f6059-2566-43ca-9272-f409bc9a7661/execution/f867e764-fae7-4c56-ad87-635a7d6c4010) |

The only named TestSprite failures in a public comment are the three on execution `1c8b5e4d`: companion card shows Fındık while the sidebar shows Pamuk (two tests), and the course map has no "Seviye Testi" entry. That same comment lists "Enter setup from the landing page hero action" as **Passed**. Later status texts do not name the remaining failed or blocked case. HEAD [`75db00f`](https://github.com/SenanurCodes/a1-english/commit/75db00f) and the Trap Hunter commit [`110d4e9`](https://github.com/SenanurCodes/a1-english/commit/110d4e9) have an empty status list (`state: pending`). The newest TestSprite result in git is 170/171 with 1 blocked, still marked SUCCESS.

### Required check

- `GET /repos/SenanurCodes/a1-english/branches/main/protection` → **403** `Resource not accessible by integration`.
- `GET /repos/SenanurCodes/a1-english/rulesets` → `[]`.
- `GET /repos/SenanurCodes/a1-english/rules/branches/main` → `[]`.

No blocked-merge event is visible. PR #2 merged at 2026-10-22T07:31:32Z while the green CI job on that SHA completed at 2026-10-22T07:32:01Z ([run 39741090691](https://github.com/SenanurCodes/a1-english/actions/runs/39741090691)). The same PR had two earlier red CI runs ([39739823923](https://github.com/SenanurCodes/a1-english/actions/runs/39739823923), [39740559389](https://github.com/SenanurCodes/a1-english/actions/runs/39740559389)). From 2026-10-20 through 2026-10-21, red CI runs on direct `main` pushes still shipped: example, CI [39628656272](https://github.com/SenanurCodes/a1-english/actions/runs/39628656272) failed and Pages [39628656339](https://github.com/SenanurCodes/a1-english/actions/runs/39628656339) succeeded on the same push. Of the last 59 CI workflow runs, 16 failed and 43 succeeded, and every failure is a commit that is already on `main`. Those 16 failures are `Cannot find module 'jsdom'` (npm install was added in [`0233cf7`](https://github.com/SenanurCodes/a1-english/commit/0233cf7)), so they are not 11-suite assertion failures. They still show that a red check does not stop the branch.

`TestSprite V3` itself cannot block anything observed here: every recorded conclusion is SUCCESS, including "2 failed" and "1 blocked".

### CLI, MCP, plans, schedules, triage

- **CLI:** no `testsprite` command in [`.github/workflows/ci.yml`](https://github.com/SenanurCodes/a1-english/blob/75db00f/.github/workflows/ci.yml). Only workflow file in the repo.
- **MCP:** no MCP config, no `.testsprite` directory.
- **Plans committed:** 0. The 132 and 171 figures exist only as status descriptions and one PR comment.
- **Schedules:** CI is `push` to `main`, `pull_request` to `main`, and `workflow_dispatch`. No `cron`.
- **Triage:** the bot comment includes suggested fix prompts. No follow-up issues (issue list empty). No auto-fix bot commits. Credits / quota: **UNVERIFIED** (nothing in the repo).

### Red → green loops

1. **PR #1 companion / level-test (partial).** Comment on [`a30b6c4`](https://github.com/SenanurCodes/a1-english/commit/a30b6c4): 129 passed, 3 failed ([execution 1c8b5e4d](https://www.testsprite.com/dashboard-v3/o/2a658758-dd37-5438-8e5b-5a859558ebdd/projects/fe2f6059-2566-43ca-9272-f409bc9a7661/execution/1c8b5e4d-1814-419a-ad30-43d9a78b3e98)). Next commit [`47daba4`](https://github.com/SenanurCodes/a1-english/commit/47daba4) ("companion hydration, daily goal, level-test entry, landing hero") → [131/132, 1 failed](https://www.testsprite.com/dashboard-v3/o/2a658758-dd37-5438-8e5b-5a859558ebdd/projects/fe2f6059-2566-43ca-9272-f409bc9a7661/execution/715edbc6-d20b-427d-a769-4db77fa2bf6b). Not zero failures. GitHub state stayed SUCCESS the whole time.
2. **Two failures before the simulator fix (partial).** [`14e09f1`](https://github.com/SenanurCodes/a1-english/commit/14e09f1): [169/171, 2 failed](https://www.testsprite.com/dashboard-v3/o/2a658758-dd37-5438-8e5b-5a859558ebdd/projects/fe2f6059-2566-43ca-9272-f409bc9a7661/execution/8bf4270e-914b-4e5a-8e49-095d39c6f367). Next commit [`70ef04e`](https://github.com/SenanurCodes/a1-english/commit/70ef04e) adds the hero/simulator assertions and → [169/171, 1 failed, 1 blocked](https://www.testsprite.com/dashboard-v3/o/2a658758-dd37-5438-8e5b-5a859558ebdd/projects/fe2f6059-2566-43ca-9272-f409bc9a7661/execution/a2c57b74-f8f9-43da-b35d-0fda4f226195). Later [`7c0414c`](https://github.com/SenanurCodes/a1-english/commit/7c0414c): [170/171, 1 blocked](https://www.testsprite.com/dashboard-v3/o/2a658758-dd37-5438-8e5b-5a859558ebdd/projects/fe2f6059-2566-43ca-9272-f409bc9a7661/execution/f867e764-fae7-4c56-ad87-635a7d6c4010). Never 171/171 in a public status.
3. **Local suite bootstrap.** CI red on missing `jsdom` through [39633743560](https://github.com/SenanurCodes/a1-english/actions/runs/39633743560), then install step plus a TextEncoder fallback, then [11/11 on main](https://github.com/SenanurCodes/a1-english/actions/runs/39930893456). That green run is the node file, not TestSprite.

## Test inventory

Local run on 2026-10-23: `npm install` and `npm test` in the clone, exit 0, printed `11/11 test geçti` (about 16s). `node_modules` deleted afterward. Same 11 lines in CI [39930893456](https://github.com/SenanurCodes/a1-english/actions/runs/39930893456).

| Layer | Claimed | Verified | Evidence | Status |
| --- | --- | --- | --- | --- |
| jsdom cases in `tests/run-tests.js` | 11 suites | 11 `test()` calls, all passed locally and on latest main CI | [run-tests.js](https://github.com/SenanurCodes/a1-english/blob/75db00f/tests/run-tests.js), [CI log](https://github.com/SenanurCodes/a1-english/actions/runs/39930893456) | VERIFIED as 11 cases in one file, not 11 workflows |
| 2. Curriculum integrity | part of the 11 | asserts `UNITS.length === 97`, unique ids, no empty vocab en/tr | [L158–L174](https://github.com/SenanurCodes/a1-english/blob/75db00f/tests/run-tests.js#L158-L174) | VERIFIED |
| 3. Lesson and boss generators | part of the 11 | every unit lesson ≥ 5 questions; bosses length 15 including B1/B2 | [L179–L221](https://github.com/SenanurCodes/a1-english/blob/75db00f/tests/run-tests.js#L179-L221) | VERIFIED |
| 4. Hash router | part of the 11 | renders a fixed route list plus lesson/cards/grammar for every unit | [L227–L255](https://github.com/SenanurCodes/a1-english/blob/75db00f/tests/run-tests.js#L227-L255) | VERIFIED (jsdom, not a browser) |
| 5. Gemini 200/403/429/404 | part of the 11 | mocked `fetch`: NO_KEY, 200, 429 RATE_LIMIT, 403 BAD_KEY, 404 fallback model, JSON fence filter, chat rollback, key replace | [L294–L456](https://github.com/SenanurCodes/a1-english/blob/75db00f/tests/run-tests.js#L294-L456) | VERIFIED as mocks |
| 6. Auth and storage | two cases | local auth validation, unknown-email refusal, SHA-256 migration; corrupt `{bozuk json` resets xp to 0 | [L462](https://github.com/SenanurCodes/a1-english/blob/75db00f/tests/run-tests.js#L462), [L568](https://github.com/SenanurCodes/a1-english/blob/75db00f/tests/run-tests.js#L568) | VERIFIED |
| 7 and 9. XSS and TDZ | two cases | `esc`/`md` plus `normalizeLeagueMember` avatar strip, gainXP recursion, `migrateCompletedUnitsWords` | [L543](https://github.com/SenanurCodes/a1-english/blob/75db00f/tests/run-tests.js#L543), [L583](https://github.com/SenanurCodes/a1-english/blob/75db00f/tests/run-tests.js#L583) | VERIFIED as string/unit checks |
| 10. Locomotive, Trap Hunter, Survival | part of the 11 | puzzles ≥ 5, traps ≥ 8, quests ≥ 4, three screens contain expected words | [L650–L691](https://github.com/SenanurCodes/a1-english/blob/75db00f/tests/run-tests.js#L650-L691) | VERIFIED. Does not assert the 3 score tiers |
| 11. E2E hero + simulator | part of the 11 | clicks `#landingHeroStartBtn`; example 3 "Sarah yarın Londra" must clear when example 1 is clicked | [L698–L756](https://github.com/SenanurCodes/a1-english/blob/75db00f/tests/run-tests.js#L698-L756) | VERIFIED in jsdom |
| TestSprite browser plans | "TestSprite E2E" in an older README commit; current README says 11/11 | 0 plan files. Public counts 132, then 171, last seen 170 passed / 1 blocked | executions above | UNVERIFIED as a committed suite. Counts VERIFIED only as status text |
| PRD "35/35" | 35 tests | current runner has 11 | [PRD.md L94](https://github.com/SenanurCodes/a1-english/blob/75db00f/PRD.md#L94) | FALSE for current tree |

## Claim verification

| Claim | Verdict | Evidence |
| --- | --- | --- |
| 52 CEFR units (A1–A2) | VERIFIED as the A1+A2 slice | [`LEVELS`](https://github.com/SenanurCodes/a1-english/blob/75db00f/js/data.js#L4297-L4302) declares A1 27 and A2 25. Live `data.js` SHA-256 matches `75db00f` and contains those counts. Unlabeled units default with `i < 27 ? 'A1'`. 27+25=52. The same arrays also declare B1 22 and B2 23. |
| The course is 52 units in total (current README / PRD) | FALSE | README: "toplam 52 unitelik" ([README L40](https://github.com/SenanurCodes/a1-english/blob/75db00f/README.md#L40)). Test requires 97 ([L161](https://github.com/SenanurCodes/a1-english/blob/75db00f/tests/run-tests.js#L161)). 27+25+22+23=97. Live page title is still "A1 İngilizce". |
| 3-tier Trap Hunter (Isınma → Dedektif → Kırmızı Alarm) | VERIFIED in source | [`TRAP_TIERS`](https://github.com/SenanurCodes/a1-english/blob/75db00f/js/games.js#L848-L872): score &lt; 30, ≥ 30, ≥ 75. Database tags `difficulty` 1, 2, and 3 (20 sentences). Suite test 10 does not step the tiers. Live play of the arcade was not clicked. |
| 11 automated suites covering the named areas | VERIFIED with a wording caveat | Eleven cases, one node process, topics match the claim list (curriculum, generators, router, Gemini status matrix, auth, corrupt storage, XSS/TDZ, three games, hero/simulator). They are not 11 separate suites or TestSprite plans. |
| Regressions block PR merges until all 11 pass | FALSE | Rulesets empty; protection API 403. PR #2 merged before the green job finished. 16 red CI runs are already on `main`, and Pages deployed beside them. TestSprite statuses stay SUCCESS with failures. |
| TestSprite caught 2 critical regressions: simulator stuck on "Sarah yarın Londra"; hero skipped `#landingHeroStartBtn` | UNVERIFIED | A status on [`14e09f1`](https://github.com/SenanurCodes/a1-english/commit/14e09f1) does say **2 failed** ([8bf4270e](https://www.testsprite.com/dashboard-v3/o/2a658758-dd37-5438-8e5b-5a859558ebdd/projects/fe2f6059-2566-43ca-9272-f409bc9a7661/execution/8bf4270e-914b-4e5a-8e49-095d39c6f367)), and the next commit message plus [test 11](https://github.com/SenanurCodes/a1-english/blob/75db00f/tests/run-tests.js#L698-L744) name those two symptoms. The only public TestSprite write-up names different bugs (Pamuk vs Fındık, missing Seviye Testi) and marks the landing-hero flow Passed. Dashboard pages do not include the failure titles in HTML. After the fix, TestSprite was still 1 failed + 1 blocked, then 1 blocked. |
| Final push 11/11 green | VERIFIED for the node suite only | [Actions run 39930893456](https://github.com/SenanurCodes/a1-english/actions/runs/39930893456) on [`75db00f`](https://github.com/SenanurCodes/a1-english/commit/75db00f) logs `11/11 test geçti`. That commit has no TestSprite status. Last TestSprite text is 170/171 with 1 blocked. |
| README: 5 mascots (Pamuk, Fındık, Dost, Bilge, Bambu) | FALSE | [`MASCOTS`](https://github.com/SenanurCodes/a1-english/blob/75db00f/js/data.js#L4319) is Fındık, Pamuk, Bambu. Test expects 3 modal rows ([L287](https://github.com/SenanurCodes/a1-english/blob/75db00f/tests/run-tests.js#L287)). Bilge was added and reverted ([`9a8aa08`](https://github.com/SenanurCodes/a1-english/commit/9a8aa08)). |
| README screenshot set | FALSE as shipped assets | Four `screenshots/` paths are placeholders in [README L8–L21](https://github.com/SenanurCodes/a1-english/blob/75db00f/README.md#L8-L21). Live `.../screenshots/01-dil-mantigi-simulasyonu.png` returns **404**. |

## Code quality

The product is one global script graph with a real router, a versioned store, and a service-worker cache bump (`scripts/bump-version.js`). That is coherent for a Pages PWA. The cost is concentration: `app.js` and `data.js` are each about 4,600 lines, with no TypeScript, no ESLint, and no formatter config. CI is one job: syntax check plus the jsdom file. It does not lint, does not run a browser, and does not talk to TestSprite.

Notable smells:

- The AI screen writes a fixed sample key into `localStorage` when the hash contains `seed`, `update`, or `edit`, and a visible "Örnek Anahtar Yükle" button does the same ([`app.js` L2986–L3024](https://github.com/SenanurCodes/a1-english/blob/75db00f/js/app.js#L2986-L3024)). An older README claimed a purity guard against hardcoded fake keys; that text was removed in the README overhaul.
- Email/password fallback stores SHA-256 password hashes in `localStorage` (`patilingo_local_accounts`) when `window.firebase` is absent ([`firebase.js`](https://github.com/SenanurCodes/a1-english/blob/75db00f/js/firebase.js)). The tests lock that behavior. It is not a server auth system.
- Default Firebase web config for project `a1-english-91fff` is committed in `js/firebase.js`. Gemini keys are meant to stay in the browser.
- `manifest.json` references `icon-192-maskable.png` and `icon-512-maskable.png`. Those files are not in [`icons/`](https://github.com/SenanurCodes/a1-english/tree/75db00f/icons). Live URLs return 404.
- Static HTML links `#/lesson/u1` and `#/cards/u1` ([`index.html`](https://github.com/SenanurCodes/a1-english/blob/75db00f/index.html)); unit ids in `data.js` look like `greetings`. The router replaces `#view` after boot.
- PRD still says 35/35 tests, 52 units total, and service worker `v2.9.14`.

## Live-site behavior

Checked with curl on 2026-10-23. `index.html`, `sw.js`, `js/app.js`, and `js/data.js` SHA-256 match git `75db00f`. `sw.js` on the origin says `APP_VERSION = '2.9.30'`.

| URL | HTTP | Time | What it is |
| --- | --- | --- | --- |
| https://senanurcodes.github.io/a1-english/ | 200 | 0.06s | 7223-byte shell, title `PatiLingo 🐾 A1 İngilizce` |
| https://senanurcodes.github.io/a1-english/sw.js | 200 | 0.07s | 2855 bytes, version 2.9.30 |
| https://senanurcodes.github.io/a1-english/js/app.js | 200 | 0.11s | 223271 bytes, matches git |
| https://senanurcodes.github.io/a1-english/js/data.js | 200 | 0.08s | 185940 bytes, matches git, LEVELS 27/25/22/23 |
| https://senanurcodes.github.io/a1-english/manifest.json | 200 | 0.06s | includes two missing maskable icons |
| https://senanurcodes.github.io/a1-english/icons/icon-192.png | 200 | 0.05s | PNG |
| https://senanurcodes.github.io/a1-english/icons/icon-192-maskable.png | 404 | 0.06s | body is `404.html` (626 bytes) |
| https://senanurcodes.github.io/a1-english/no-such-page | 404 | 0.04s | same 404 document |
| https://senanurcodes.github.io/a1-english/lesson/greetings | 404 | 0.07s | path routes are not real; the app uses `#/lesson/...` |
| screenshot path in the README | 404 | 0.04s | file was never added |

`404.html` is a script that rewrites the path into `/a1-english/#/<path>`. Curl does not run that script, so the in-browser recovery was not executed. Hash screens (`#/logic`, `#/trap-hunter`, `#/survival`) were not driven in a browser. There is no JSON API on this host.

## Demo

No demo video and no demo link. The README asks the author to record four screenshots and then prints placeholder boxes. Those files 404 on the live site.

## Weaknesses / risks for judges

- TestSprite is decorative as a gate. The check stays green with failures, plans are not in git, HEAD has no TestSprite run, and the best public result is 170/171 with one case blocked.
- The merge-blocking claim is contradicted by red commits on `main` and by PR #2 merging before CI finished.
- The two "TestSprite caught this string / this id" regressions are reproducible as local assertions the author added in the fix commit. They are not named in the TestSprite comment.
- Public docs disagree with the app: 52 vs 97 units, 5 vs 3 mascots, 35 vs 11 tests, A1-only title on a tree that includes B1 and B2.
- "11/11" is one jsdom process with mocked `fetch` and no Firebase. It does not exercise the score-based Trap Hunter tiers, offline cache, or the live Pages UI.
- Security tests pass while the product still stores local password hashes and offers a one-click sample API key.
- PWA manifest points at missing icons. No demo.

## Where it beats Ninety

Ninety is https://github.com/mohamedwael201193/ninety (live https://ninety-coral.vercel.app): a Schengen 90/180 calculator with a Commission oracle, Vitest, and TestSprite plans committed in git. These are the specific PatiLingo edges.

1. **Larger public TestSprite browser sweep against the deployed site, with a bot comment that names UI bugs and paste-ready fix prompts.** PR #1 comment records 129 passed / 3 failed out of 132, including the Pamuk/Fındık mismatch and the missing level-test entry ([comment](https://github.com/SenanurCodes/a1-english/pull/1#issuecomment-6285737016), [execution](https://www.testsprite.com/dashboard-v3/o/2a658758-dd37-5438-8e5b-5a859558ebdd/projects/fe2f6059-2566-43ca-9272-f409bc9a7661/execution/1c8b5e4d-1814-419a-ad30-43d9a78b3e98)). A later status reaches 170/171 ([f867e764](https://www.testsprite.com/dashboard-v3/o/2a658758-dd37-5438-8e5b-5a859558ebdd/projects/fe2f6059-2566-43ca-9272-f409bc9a7661/execution/f867e764-fae7-4c56-ad87-635a7d6c4010)). Ninety's committed frontend set is 43 plans. To match the volume, Ninety would need a live-site execution in that range and a comment that cites the failing screen. To exceed it, Ninety keeps plans in git and a status that actually fails when a case fails. PatiLingo does neither, and it never shows 171/171.
2. **A secret-free DOM regression that pins the exact stuck copy and the exact skipped control.** [Test 11](https://github.com/SenanurCodes/a1-english/blob/75db00f/tests/run-tests.js#L698-L744) fails if example 3 stays on "Sarah yarın Londra" or if `#landingHeroStartBtn` is missing, and [CI 39930893456](https://github.com/SenanurCodes/a1-english/actions/runs/39930893456) is 11/11 including the Gemini 200/403/429/404 matrix. Ninety would match by adding a local assertion for each TestSprite miss (selector plus visible string) that runs on every PR without a TestSprite credit. Ninety already has a much larger Vitest suite; this edge is the tight coupling of one UI bug string to CI, not overall test mass.
3. **Offline Pages PWA whose live bytes match git.** [`sw.js`](https://github.com/SenanurCodes/a1-english/blob/75db00f/sw.js) is network-first with a versioned precache, and [`404.html`](https://github.com/SenanurCodes/a1-english/blob/75db00f/404.html) rewrites unknown paths into the hash router. Live `app.js` / `data.js` / `sw.js` / `index.html` hashes equal `75db00f`. Ninety would need a static offline shell and a host 404 that recovers into the app. Ninety's server engine, Commission oracle, and API/MCP surface are outside this comparison and are not weaker for lacking a service worker.

**TestSprite technique Ninety lacks:** a same-commit local DOM lock of the failing control id and the stuck on-screen sentence, next to the product fix ([`70ef04e`](https://github.com/SenanurCodes/a1-english/commit/70ef04e)). Ninety's gap is the broken `testsprite-smoke.yml` and disabled CLI nightly, not the absence of a browser App. PatiLingo has no MCP config, no CLI workflow, and no committed plans, which Ninety either has or has attempted.

## Estimated judging scores

| Criterion | Score | Why |
| --- | --- | --- |
| Problem value | 7 | Concrete learner problem, large curriculum, three games, no account required for the core loop. Docs still describe a smaller A1–A2 app than the one that ships. |
| TestSprite depth | 4 | App status plus one rich PR comment and several reruns. Non-blocking, never a failed check, plans not in git, no CLI/MCP/schedule, HEAD unchecked, last result 170/171 with 1 blocked. |
| Verifiability | 5 | 11/11 rerun, live bytes match git, unit and tier counts are in source. The merge gate is false, and the two named TestSprite catches are not in the public report. |
| Polish | 6 | Fast Pages shell and a consistent cache version. Missing maskable icons, placeholder screenshots, stale PRD/README, sample API key on the AI screen, 4.6k-line files. |
| Demo | 1 | No video. Screenshot paths 404. |
| **Overall** | **5** | A substantial learning PWA with a green local suite and a real but shallow TestSprite App trail. The headline process claims (required 11/11 gate, TestSprite named those two bugs, final TestSprite green) do not hold. |
