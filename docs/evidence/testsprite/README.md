# TestSprite evidence: PR #57 and the merge gate

Screenshots taken on 2026-10-20 between about 22:00 and 22:45 UTC, from the TestSprite portal and GitHub. They show PR [#57](https://github.com/mohamedwael201193/ninety/pull/57):
- 8 new plans (TS45–TS52) were pushed with the bugs they target still in the code, and TestSprite failed them.
- The fixes followed in the same PR, and the same tests passed.
- TS02 also caught a production problem: the live Commission page could not be loaded from the server.

The run-by-run record is in [`LOOP-ITERATIONS.md`](../../../LOOP-ITERATIONS.md).

## The gate

| Screenshot | What it shows |
|---|---|
| ![](gh-branch-protection-testsprite-v3-required.png) | GitHub branch protection on `main`: "Require status checks to pass before merging", with `TestSprite V3` (TestSprite app) as the required check. |
| ![](ts-github-action-merge-gate-blocking-ON.png) | TestSprite's GitHub trigger for `mohamedwael201193/ninety`. It fires on pull requests, on Vercel's commit status, and targets each PR's preview URL. The merge gate is on: "Report results as a status check, blocking merge on failure". The push trigger is disabled. |

## Red: TS45–TS52 on the commit that still had the bugs (78ee487)

| Screenshot | What it shows |
|---|---|
| ![](ts-test-runs-list-pr57-three-runs.png) | The project's run list. PR #57 has three runs: 34/43 (8 failed, 1 blocked), then 42/43 (1 failed), then 43/43. Earlier PRs are listed below them. |
| ![](ts-red-run-detail-8-failed.png) | The first PR #57 run: 79% pass rate, 34 passed, 8 failed, 1 blocked, 43 total. |
| ![](ts-red-run-page1-failed-rows.png) | Failed rows in that run: "/proof names only the 14 parity scenarios" (TS51) and "No Article 52 letter when the EES figure matches" (TS49). "Parity page shows 14/14" (TS02) is blocked. |
| ![](ts-red-run-page2-failed-rows.png) | Page 2 of the same run: TS52 (later overstay), TS50 (PDF font) and TS45 (planned trip) failed. |
| ![](ts-failed-test-ts45-cause.png) | TS45 opened. The plan steps on the left are the ones in `testsprite_tests/plans/TS45-plan-before-booked-stay.json`. TestSprite's cause names the bug's exact values: latest legal exit 2026-04-14 instead of 2026-04-01, and the planned trip marked "Fits". |

## The production bug TS02 caught (dae0081)

| Screenshot | What it shows |
|---|---|
| ![](ts-ts02-parity-failed.png) | The second run, after the fixes. TS02 "Parity page shows 14/14 match with 14 rows" failed: "The parity page could not verify agreement with the Commission calculator." The live Commission page did not come back as the calculator when fetched from Vercel, and production had the same problem. It was fixed in 1963cc1 by falling back to the stored, hash-checked copy, with a notice on the page. The replay pane was still loading when this was taken; the error text at the bottom is the run's verdict. |

## Green (1963cc1)

| Screenshot | What it shows |
|---|---|
| ![](ts-final-run-43of43.png) | The third run: 100%, 43 passed, 0 failed, 0 blocked, including TS45–TS52 and TS02. |
| ![](gh-pr57-testsprite-bot-final-43of43.png) | The TestSprite bot comment on PR #57: "All checks passed — 43 of 43 tests green". Its AI-written summary says "44 passed"; the run and the status both say 43. |
| ![](gh-pr57-mergebox-testsprite-v3.png) | The PR merge box: `TestSprite V3 — All 43 tests passed`, marked **Required**, next to CI, Schemathesis, axe and Vercel. The address bar shows the next page loading; the content is the GitHub PR. |
| ![](gh-pr57-commits.png) | PR #57's six commits, in order. The plans with the bugs present show ✗ 5/7. The fix commits follow. The last commit is the /parity fallback, ✓ 7/7. **5/7 and 7/7 are GitHub's check rollups** (how many of the commit's 7 GitHub checks passed: CI, Schemathesis, axe, Vercel, `TestSprite V3` and the rest), not TestSprite test counts. The TestSprite counts are 34/43, 42/43 and 43/43 above. |
| ![](gh-pr57-top.png) | The PR description: the table of the 8 bugs present in the first commit, and the paragraph on what TS02 caught. |

## Insights (stale)

| Screenshot | What it shows |
|---|---|
| ![](ts-insights.png) | The project's Insights page. **The banner at the top is stale:** "2 tests failed in the latest run" (two open-stay tests from earlier history) and "Install GitHub Action", although the GitHub trigger is installed and the latest run is 43/43. The trend tiles (100% pass rate, 43 of 43 that ran) and "41 tests" in the coverage donut are what the portal showed at the time; the cloud suite has 43 tests. |

One screenshot was left out: the GitHub Checks tab, which showed only Vercel's details pane and nothing about TestSprite.

## Backend tests ("Ninety API")

The second TestSprite project has 28 Python backend tests run against production from the CLI. They are not a merge gate: the GitHub App runs only the frontend project. Times are UTC, 2026-10-20. The portal shows them in Cairo time (UTC+3).

| Screenshot | What it shows |
|---|---|
| ![](be-runs-list.png) | The project's run list: 5/5 (the first 5 tests, 22:30 UTC), 27/28 (22:35 UTC) and 1/1 (BE28 re-run, 22:38 UTC). |
| ![](be-run-28-red-be28.png) | Run `5071eab5`: 96%, 27 passed, 1 failed, 28 total. The failed row is BE28, "MCP: an error for an invalid request id still carries "id": null (JSON-RPC 2.0 section 5)". The verdict quotes production's answer: `{"jsonrpc":"2.0","error":{"code":-32600,...}}` with no `id`. |
| ![](be-be28-failure-detail.png) | BE28 opened in that run: the test code (`True`, `{"a": 1}` and `[1]` as ids, asserting `"id"` is present and null) and the error "error response has no id member". |
| ![](be-be28-green-rerun.png) | Run `ef7bc14a`, after the fix reached production in `8c86d02`: BE28 alone, 1 passed, 100%. |

The raw files are in [`backend/`](backend/):
- the CLI summaries and JUnit for both suite runs (`run-5-first-*`, `run-28-red-*`);
- the BE28 red result (`BE28-red-result.json`, CLI run id 8c45fada) and green result (`BE28-green-result.json`, CLI run id 2d5c9ab6). The CLI gives each test run its own id; the portal ids above are for the whole run;
- the unit test `mcp-id.test.ts` without the fix, 5 failed (`BE28-vitest-red.txt`), and with it, 5 passed (`BE28-vitest-green.txt`);
- the Commission script's outputs that the expected values came from (`oracle-commission.txt`).
