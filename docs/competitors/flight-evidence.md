# Flight Evidence

- **Name:** Flight Evidence
- **Repo:** https://github.com/airdropcucoinci/flight-evidence
- **Live (submission):** https://flight-evidence-pr-1.onrender.com/
- **Live (main, separate deploy):** https://flight-evidence.onrender.com/
- **TestSprite PR:** https://github.com/airdropcucoinci/flight-evidence/pull/1 (open, unmerged; head `e40195f4126ae7219cbf3905bd7245812cfa09ea`; merge state `UNSTABLE`)
- **CI run cited:** https://github.com/airdropcucoinci/flight-evidence/actions/runs/39663108049 (success, 1m9s, 2026-10-21)
- **Demo:** none (no video in the repo or submission). Written script only: [DEMO_FOR_JUDGES.md](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/DEMO_FOR_JUDGES.md)
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7

## What it is

Flight Evidence is a no-account browser and JSON API that runs seven deterministic consistency checks on **synthetic** drone telemetry (GPS speed, GPS-vs-baro altitude, frozen IMU, timestamps, battery/motor, an invented geofence, an example altitude ceiling). Each finding is tied to a source row, timestamp, and an observation-coverage flag so a gap is not reported as a clean flight. The audience is a hackathon judge or a trainee auditor. The author states it is not flight-safety certification, attack detection, or a legal record ([README](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/README.md)). Value is the explainable audit trail and the honest test split, not a validated detector.

## Architecture

- **Stack:** Node 22, TypeScript (strict) compiled to `dist/*.js`, vanilla HTML/CSS, Node `http` server, Vitest, `node:test`, Playwright. No database, no auth.
- **Deploy:** Render free web service via [render.yaml](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/render.yaml) (`npm ci && npm run build`, `npm start`, health `/health`, `NODE_VERSION=22.16.0`). `server.mjs` listens on `process.env.PORT` (default 3000). PR preview is a separate Render service from main.
- **Key modules (PR head):**
  - Rules: [src/engine.ts](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/src/engine.ts) (9 lines; the analyzer is one statement)
  - Samples: [src/samples.ts](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/src/samples.ts)
  - Report/timeline/CSV: [src/report.ts](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/src/report.ts), [src/timeline.ts](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/src/timeline.ts), [src/format.ts](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/src/format.ts)
  - UI: [src/browser.ts](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/src/browser.ts), [index.html](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/index.html) (`lang="tr"`)
  - HTTP: [server.mjs](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/server.mjs) — `GET /health`, `GET /api/samples`, `POST /api/analyze`, `POST /api/report`, static `/` and `/dist/*.js` only
- **PR vs main:** 48 commits, +4225/−20. Last commit `e40195f` adds only acceptance tests, Playwright config, and CI steps ([commit](https://github.com/airdropcucoinci/flight-evidence/commit/e40195f4126ae7219cbf3905bd7245812cfa09ea)). Main has not absorbed this PR.

## TestSprite integration depth

**Score: 6/10.** A real TestSprite V3 GitHub App posts on the open PR and the 44-case portal plan is committed. The check has never gone green, it is not a required merge check, and there is no CLI, MCP, schedule, or auto-fix loop.

### GitHub App

- App context name: **TestSprite V3**. Comment author: `testsprite[bot]`. One PR comment, created 2026-10-21T19:37:42Z and edited 2026-10-21T19:48:44Z: https://github.com/airdropcucoinci/flight-evidence/pull/1#issuecomment-6324854381
- Check-runs API on head `e40195f` shows only GitHub Actions `validate` (success). The App result is a **commit status**, not a check-run: https://github.com/airdropcucoinci/flight-evidence/commit/e40195f4126ae7219cbf3905bd7245812cfa09ea (status API).

| Head | When (status `updated_at`) | Status | Description | Execution |
|---|---|---|---|---|
| `c84c494` | 2026-10-21T18:58:17Z | failure | 32/44 passed · 12 blocked | [705a4149](https://www.testsprite.com/dashboard-v3/o/39625253-9b9d-5533-ac49-7d8fddc2cb0c/projects/09d4374a-03fb-4b6c-8ead-97f09ba95e98/execution/705a4149-87de-4723-8b05-efd92165da86) |
| `d470c96` | 2026-10-21T19:21:19Z | failure | 31/44 passed · 13 blocked | [f8acdebb](https://www.testsprite.com/dashboard-v3/o/39625253-9b9d-5533-ac49-7d8fddc2cb0c/projects/09d4374a-03fb-4b6c-8ead-97f09ba95e98/execution/f8acdebb-9e8a-4607-b005-e3968b8090eb) |
| `e40195f` (current) | 2026-10-21T19:48:46Z | failure | 31/44 passed · 13 blocked | [2ff39a29](https://www.testsprite.com/dashboard-v3/o/39625253-9b9d-5533-ac49-7d8fddc2cb0c/projects/09d4374a-03fb-4b6c-8ead-97f09ba95e98/execution/2ff39a29-d44e-4558-b9a5-5320928f92a3) |

The latest bot table has **44 linked tests: 31 Passed, 13 Blocked, 0 Failed**. The warning prose in the same comment says “10 Blocked” and “10 tests were Blocked because no valid file was provided,” while the counter and the row list say 13. The 13 blocked titles are upload, invalid-file, CSV/JSON export, and four “without JavaScript errors” journeys. The evaluation also says export clicks timed out.

Dashboard URLs returned HTTP 200 to a HEAD request from this reviewer; the execution body was not read (login wall possible). Counts above come from the GitHub status string and the bot comment, not from a scraped dashboard.

### Required check?

- Branch protection: `GET repos/airdropcucoinci/flight-evidence/branches/main/protection` → **403** (`Resource not accessible by integration`).
- Rulesets: `GET .../rulesets` → **[]**.
- PR `mergeStateStatus` is **`UNSTABLE`** (mergeable with a non-required failing status), `mergeable: MERGEABLE`, still **OPEN**. A required failing check would be `BLOCKED`.
- So the App is active and red, and GitHub is **not** holding the merge. The submission line “reports a merge-blocking status” is **FALSE** as a GitHub required check.

### CLI, MCP, schedules, triage

- Workflows on the PR branch: only [.github/workflows/ci.yml](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/.github/workflows/ci.yml). Triggers: push to `main`, pull_request to `main`, `workflow_dispatch`. No cron.
- No `testsprite` CLI invocation, no MCP config, no `.testsprite` project file.
- No auto-fix bot, no issue triage, no review comments. The single bot comment is the portal report.
- `npm run test:contract` checks **14** IDs in [TESTSPRITE_SCENARIOS.md](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/TESTSPRITE_SCENARIOS.md) (that file still says “not yet executed on TestSprite”). It does not execute the portal.

### Plans committed

| Path | Count | Role |
|---|---|---|
| [acceptance/testsprite-plan-20261021.yaml](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/acceptance/testsprite-plan-20261021.yaml) | 44 case records | Author says verbatim portal export |
| [acceptance/portal44-cases.json](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/acceptance/portal44-cases.json) | 44 objects | Lossless manifest consumed by Playwright |
| [acceptance/portal44.spec.mjs](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/acceptance/portal44.spec.mjs) | 44 `test()` via one loop | Independent Playwright, `retries: 0` |
| [TESTSPRITE_SCENARIOS.md](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/TESTSPRITE_SCENARIOS.md) | 14 (TS-01–TS-14) | Older hand-written plan, still worded as not executed |
| [e2e/testsprite-preflight.spec.mjs](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/e2e/testsprite-preflight.spec.mjs) | part of the 41 Chromium tests | Author-labeled preflight, not portal results |

The 44 IDs are five use-case prefixes (FLG, BUL, OBS, UPL, UX) repeating the same ~9 workflows. The acceptance README says 44 is case identity count, not 44 features.

### Red → green

No TestSprite execution on this PR is green. The portal moved **32 passed / 12 blocked → 31 passed / 13 blocked** and stayed `failure`. That is a red-to-redder step, not a recovery.

Own CI on the same PR did go red then green (examples):

- Node tests red: [run 39490911356](https://github.com/airdropcucoinci/flight-evidence/actions/runs/39490911356) (`f27a872`), [run 39491152953](https://github.com/airdropcucoinci/flight-evidence/actions/runs/39491152953) (`f90088b`), then green [run 39491238129](https://github.com/airdropcucoinci/flight-evidence/actions/runs/39491238129).
- Browser journeys red: [run 39330502493](https://github.com/airdropcucoinci/flight-evidence/actions/runs/39330502493), later green on the cited run.

### Credits

Author says they stayed on the Free plan and did not start the advertised Starter trial. That billing fact is **UNVERIFIED** from GitHub. The blocked upload/export behavior is verified from the bot comment.

## Test inventory

| Layer | Claimed | Verified | Evidence | Status |
|---|---|---|---|---|
| TestSprite portal (latest, head `e40195f`) | 31 passed, 0 failed, 13 blocked, 44 total | 31 / 0 / 13 in the bot table; status text `31/44 passed · 13 blocked` | [comment](https://github.com/airdropcucoinci/flight-evidence/pull/1#issuecomment-6324854381), [execution 2ff39a29](https://www.testsprite.com/dashboard-v3/o/39625253-9b9d-5533-ac49-7d8fddc2cb0c/projects/09d4374a-03fb-4b6c-8ead-97f09ba95e98/execution/2ff39a29-d44e-4558-b9a5-5320928f92a3) | VERIFIED |
| Earlier portal on `c84c494` | 32 / 0 / 12 (README and demo script) | Status text matches 32/12 | [status on c84c494](https://github.com/airdropcucoinci/flight-evidence/commit/c84c494b1bcf508f01c567440e8bb06f704d6060), [705a4149](https://www.testsprite.com/dashboard-v3/o/39625253-9b9d-5533-ac49-7d8fddc2cb0c/projects/09d4374a-03fb-4b6c-8ead-97f09ba95e98/execution/705a4149-87de-4723-8b05-efd92165da86) | VERIFIED as history; **stale** if read as the current result |
| Independent Playwright portal equivalents | 44/44 first attempt, retries 0, uploads + CSV/JSON downloads | CI log: `44 passed (23.0s)` then `Independent portal scenario equivalents: 44/44 passed` and “not TestSprite execution results.” Spec saves downloads, compares uploaded numeric CSV cells, parses JSON | [run 39663108049](https://github.com/airdropcucoinci/flight-evidence/actions/runs/39663108049), [spec](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/acceptance/portal44.spec.mjs), artifact `independent-portal44-evidence` id `12376855362` (135255157 bytes) | VERIFIED (CI log + source). Reviewer did not re-run Playwright |
| Node `node:test` (`npm run test:node`) | 163 passed, 0 skipped | CI `# tests 163` `# pass 163` `# skipped 0`. Reviewer reran on `e40195f`: 163 pass / 0 fail | [same run](https://github.com/airdropcucoinci/flight-evidence/actions/runs/39663108049) | VERIFIED |
| Vitest (`npm test`, `tests/engine.test.ts`) | 17 | CI `Tests 17 passed`. Reviewer: 17 passed | [same run](https://github.com/airdropcucoinci/flight-evidence/actions/runs/39663108049) | VERIFIED |
| Chromium journeys (`npm run test:e2e`) | 41 | CI `41 passed (8.6s)`. Source expands to 6 + 35 = 41 | [e2e/](https://github.com/airdropcucoinci/flight-evidence/tree/e40195f4126ae7219cbf3905bd7245812cfa09ea/e2e), [same run](https://github.com/airdropcucoinci/flight-evidence/actions/runs/39663108049) | VERIFIED in CI. Not rerun locally |
| Smoke step | separate CI step; 13 tests | CI `# tests 13` `# pass 13`. Those files are also inside the 163 glob | [ci.yml](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/.github/workflows/ci.yml) | VERIFIED; do not add 13 on top of 163 |
| Scenario contract | 14 documented IDs | Script asserts 14 unique `TS-` rows | [check-test-contract.mjs](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/scripts/check-test-contract.mjs) | VERIFIED as a static contract, not a portal run |
| Local reviewer run | — | `npm ci`, `npm test` 17/17, `npm run test:node` 163/163 on `e40195f`. `node_modules` removed. Playwright not installed here | public twin: the CI run above | VERIFIED locally; public evidence is the Actions log |

## Claim verification

Submission claims from the task brief, plus the submission paragraph quoted on the PR.

| Claim | Verdict | Evidence | Reason |
|---|---|---|---|
| TestSprite result: 31 passed, 0 failed, 13 blocked out of 44 | VERIFIED | [bot comment](https://github.com/airdropcucoinci/flight-evidence/pull/1#issuecomment-6324854381); status `31/44 passed · 13 blocked` on [e40195f](https://github.com/airdropcucoinci/flight-evidence/commit/e40195f4126ae7219cbf3905bd7245812cfa09ea) | Table rows are 31 Passed + 13 Blocked + 0 Failed. Prose in that comment still says “10 Blocked.” |
| GitHub App integration active | VERIFIED | same comment (`testsprite[bot]`) and TestSprite V3 status updated 2026-10-21T19:48:46Z | App posted after the head commit and linked the preview execution. |
| Upload fixtures unavailable on the Free plan | UNVERIFIED | Bot text: blocked “because no valid file was provided”; author explanation is only in the [PR body](https://github.com/airdropcucoinci/flight-evidence/pull/1) | The blocked uploads are real. The Free-plan product restriction is not stated by the bot or by any billing record reviewed here. |
| Some export actions unverified by the TestSprite runner | VERIFIED | Blocked titles include CSV/JSON download/export; evaluation says export clicks timed out | The runner did not complete those paths. Independent CI later did, and the author does not call those TestSprite passes. |
| Independent Playwright of all 44 scenarios passed 44/44 in GitHub CI, including uploads and CSV/JSON downloads, and these are not TestSprite passes | VERIFIED | [run 39663108049](https://github.com/airdropcucoinci/flight-evidence/actions/runs/39663108049) log lines `44 passed (23.0s)` and `not TestSprite execution results`; [portal44.spec.mjs](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/acceptance/portal44.spec.mjs) `setInputFiles` + `waitForEvent('download')` + numeric CSV equality + `JSON.parse` | Target in config is `http://127.0.0.1:3301`, not the Render URL. |
| “reports a merge-blocking status” / “merge gate remain active” (submission + PR body) | FALSE | PR `mergeStateStatus: UNSTABLE`; rulesets `[]`; protection API 403 | A failing non-required status. The PR is still mergeable. |
| Discord submission posted 21 Oct 2026 22:58 Türkiye | UNVERIFIED | Asserted in the [PR body](https://github.com/airdropcucoinci/flight-evidence/pull/1) as an owner screenshot | No Discord record was available to this review. |
| Same CI run also passed 163 Node, 41 Chromium, 17 Vitest | VERIFIED | [run 39663108049](https://github.com/airdropcucoinci/flight-evidence/actions/runs/39663108049) | Matches the log. README’s older link [run 39491238129](https://github.com/airdropcucoinci/flight-evidence/actions/runs/39491238129) is an earlier green run, not this head. |
| README/demo “32 passed, 0 failed, 12 blocked” as the current App result | FALSE as current | [README](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/README.md) and [DEMO_FOR_JUDGES.md](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/DEMO_FOR_JUDGES.md) vs latest status 31/13 | Those files were not updated after `d470c96` / `e40195f`. README also links [issuecomment-6323885567](https://github.com/airdropcucoinci/flight-evidence/pull/1#issuecomment-6323885567), which returns **404**. |

## Code quality

- Small typed core (`strict: true`) and a hardened HTTP surface: JSON-only POSTs, exactly one of `sampleId|csv|json|rows`, 1 MB cap, 5,000-row cap, 422 on bad input, CSP `default-src 'none'`, `X-Frame-Options: DENY`, `nosniff`, no-store. Live responses match that.
- CI is one required-for-the-workflow job: typecheck, smoke, node tests, Vitest, Chromium, portal44, contract, release scan, source zip. `npm ci` with a lockfile. Timeouts and `retries: 0` on the 44-case project. Smoke tests are also inside `tests/*.test.mjs`, so the smoke step repeats 13 of the 163.
- Smells: `engine.ts` and `samples.ts` are compressed into a handful of lines, which hides the rules a judge would want to read. No ESLint, no license, no mutation tests. Dozens of `V4_*_VALIDATION.md` files still say TestSprite, Vitest, and CI were never run; they contradict the PR. `TESTSPRITE_SCENARIOS.md` still says the plan was not executed. UI copy is Turkish while rule IDs and API statuses are English (`CLEAN` vs `TEMİZ`).

## Live-site behavior

Checked 2026-10-23 with curl. First HTML hit on each host took about 12s (free-tier cold start); later calls were ~0.15–0.3s.

**PR preview** https://flight-evidence-pr-1.onrender.com/

| Request | Result |
|---|---|
| `GET /` | 200, title `Flight Evidence \| Flight Data Consistency Lab`, ~10.5 KB, `lang=tr`, CSP + DENY + nosniff + `no-referrer`, `x-robots-tag: noindex` |
| `GET /health` | 200 `{"status":"ok","service":"flight-evidence"}` |
| `GET /api/samples` | 200, L1–L10, L1 rows 301 |
| `POST /api/analyze {"sampleId":1}` | 200 `{"status":"CLEAN","findings":[]}` |
| `POST /api/report {"sampleId":9}` | 200, `status CRITICAL`, findings R1, R3, R6, `schemaVersion 1.0`, `rowCount 301` |
| `POST /api/analyze {"sampleId":10}` | 422 `Minimum 10 rows required` |
| `POST` bad JSON | 422 |
| `POST` without `Content-Type` | 415 |
| `GET /api/analyze` | 404 |
| `GET /no-such-route`, `GET /favicon.ico` | 404 JSON |
| `GET /dist/browser.js` | 200 JavaScript module |
| `POST /` | 405 |

**Main** https://flight-evidence.onrender.com/ is a different, smaller page (title `Flight Evidence v4.28`, ~3.1 KB, light theme, no route/altitude dashboard). Health is 200. The competition UI is only the PR preview. `HEAD /` is 405 because the server allows GET for pages and rejects other methods before the static handler.

Browser clicks, file upload, and downloads were not exercised on the live host (CI already drives those against localhost; this review did not submit uploads to Render).

## Demo

No video, GIF, or linked recording. [DEMO_FOR_JUDGES.md](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/DEMO_FOR_JUDGES.md) is a 90-second click script (L1, L2, L9, filters, L8, L10, then the PR checks). It still tells the judge to disclose **12** blocked cases. CI uploads `flight-evidence-demo-screenshots` on the green run; those PNGs were not downloaded for this review.

## Weaknesses / risks for judges

- The TestSprite check the rules ask for is **red** (13/44 blocked) and got slightly worse after an earlier 12-blocked run. There is no green portal result to show.
- “Merge-blocking” is not enforced. A maintainer can merge over the red status.
- Docs on the same commit disagree: README and the judge script say 32/12 and link a deleted comment; the PR body and the bot say 31/13.
- The 44 portal cases repeat a small set of flows. Passing 31 is mostly repeated sample/filter checks.
- Main production URL still serves the old UI. Judges who open the repo homepage path, or who miss the PR preview, do not see the dashboard under test.
- Free-plan fixture story and the Discord post are not independently proven.
- Core rules are written as a single dense expression. No license.
- Preview is `noindex` and sleeps on the free plan (~12s cold start).

## Where it beats Ninety

Ninety: https://github.com/mohamedwael201193/ninety , live https://ninety-coral.vercel.app. Ninety is ahead on a green TestSprite App result (PR #62 43/43, PR #63 42/43) and on a backend CLI gate. The items below are the places Flight Evidence is specifically stronger.

1. **Portal plan checked in, then re-run outside TestSprite without relabeling the passes.** Verbatim YAML (44 cases), JSON manifest, Playwright with `retries: 0`, and a summarizer that exits non-zero unless exactly 44 unique cases passed once: [summarize-portal44.mjs](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/scripts/summarize-portal44.mjs), [CI run](https://github.com/airdropcucoinci/flight-evidence/actions/runs/39663108049). Report metadata says `Independent Playwright; NOT TestSprite`. Ninety would need the exported plan hashed into the CI report, a 1:1 runner, and a written rule that those passes do not overwrite a red App check.
2. **The cases the portal blocked (uploads and CSV/JSON downloads) are executed for real in CI.** The spec attaches the downloaded files, checks CSV numeric cells against `test-fixtures/valid-flight.csv`, and checks JSON rules, timestamps, and evidence indices: [portal44.spec.mjs](https://github.com/airdropcucoinci/flight-evidence/blob/e40195f4126ae7219cbf3905bd7245812cfa09ea/acceptance/portal44.spec.mjs). Artifact `independent-portal44-evidence` (id `12376855362`, ~129 MB) is on [the same run](https://github.com/airdropcucoinci/flight-evidence/actions/runs/39663108049). Ninety would need download-content assertions and retained traces for whatever the App leaves blocked.
3. **The red App result stayed visible on an open PR.** Latest status is still failure after three executions, and the PR was not merged: https://github.com/airdropcucoinci/flight-evidence/pull/1. Ninety merged PR #63 while TestSprite V3 was red. To match this part, Ninety would leave red App runs unmerged. Flight Evidence still has not made the check required (`UNSTABLE`), so this is disclosure discipline, not a hard gate.

## Estimated judging scores (1–10)

| Criterion | Score | Why |
|---|---|---|
| Problem value | 5 | Clear training/audit story with source-row evidence and coverage. Synthetic thresholds and an invented geofence limit real-world stakes. |
| TestSprite depth | 6 | App is on the PR, three executions, 44-case plan in git, bot comment with per-test links. No CLI, MCP, schedule, required check, or green run. |
| Verifiability | 8 | Portal 31/0/13 and CI 44/44, 163, 41, 17 match primary sources. Stale 32/12 docs, the false merge-gate line, and the unverified Free-plan/Discord lines keep it under 9. |
| Polish | 7 | PR preview is a responsive dark dashboard with CSP and a careful API. Main deploy is the old page; the rule engine is unreadable; docs drift. |
| Demo | 2 | No recording. A 90-second script and CI screenshots exist. |
| **Overall** | **6** | Strong, honest test evidence around a small synthetic tool. The official TestSprite result is still a failing check, and there is no demo video. |
