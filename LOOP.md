# The TestSprite loop

Generated 2026-10-24T01:34:38.337Z by `scripts/loop-proof.mjs` from `testsprite test result --history` (2197 runs). Do not edit by hand.

Counts cover the tests listed in `testsprite_tests/test-ids.json`. Runs of tests that were later replaced (the first TS09/TS10) are not included, so an execution can show fewer tests than the suite had at the time.

## Red, then green

Red, green not yet: #63. 15 PRs have a red execution, then a green one, in the run history: 6 app defects (#8, #14, #39, #41, #55, #57), 1 UX loading state, not a wrong number (#60), 7 test plan or CI (#18, #32, #36, #37, #38, #43, #68), 1 blocked (#44). 12 of these 15 history rows also failed on the GitHub check; #37, #38, #44 did not. Adding #22, red on the GitHub check but missing from this history because its failing test was later replaced, and #69 (test plan, 52/54 on the GitHub check, then 54/54), which ran after this history was last read, gives 14: the red-then-green count in LOOP-ITERATIONS.md and the README.

The two counts differ for a reason: the "Red run" fraction is from the run history and counts only the tests still in `test-ids.json`; the "GitHub check" column quotes the PR's `TestSprite V3` status word for word, which counted every test the run had. The README quotes the GitHub check.

| PR | Kind | Red run (history, UTC) | Failing tests | GitHub check said | Green run (history, UTC) |
|---|---|---|---|---|---|
| [#8](https://github.com/mohamedwael201193/ninety/pull/8) | App defect | 2026-10-19T00:11Z, 8/10 | TS02, TC010 | 9/11 passed · 2 failed | 2026-10-19T00:18Z, 10/10 |
| [#14](https://github.com/mohamedwael201193/ninety/pull/14) | App defect | 2026-10-19T02:31Z, 11/13 | TS09, TS10 | 12/14 passed · 2 failed; 12/14 passed · 2 failed; 12/14 passed · 2 failed; 13/14 passed · 1 failed | 2026-10-19T02:42Z, 13/13 |
| [#18](https://github.com/mohamedwael201193/ninety/pull/18) | Test plan or CI | 2026-10-19T02:47Z, 12/13 | TS10 | 13/14 passed · 1 failed | 2026-10-19T03:35Z, 13/13 |
| [#32](https://github.com/mohamedwael201193/ninety/pull/32) | Test plan or CI | 2026-10-20T06:57Z, 15/17 | TC011, TS18 | 15/17 passed · 2 failed | 2026-10-20T07:03Z, 17/17 |
| [#36](https://github.com/mohamedwael201193/ninety/pull/36) | Test plan or CI | 2026-10-19T05:03Z, 13/14 | TS26 | 13/14 passed · 1 failed | 2026-10-19T05:07Z, 14/14 |
| [#37](https://github.com/mohamedwael201193/ninety/pull/37) | Test plan or CI | 2026-10-19T05:04Z, 13/14 | TS26 | no red check (history only) | 2026-10-19T05:11Z, 14/14 |
| [#38](https://github.com/mohamedwael201193/ninety/pull/38) | Test plan or CI | 2026-10-19T05:05Z, 13/14 | TS26 | no red check (history only) | 2026-10-19T05:12Z, 14/14 |
| [#39](https://github.com/mohamedwael201193/ninety/pull/39) | App defect | 2026-10-19T05:17Z, 14/15 | TS16 | 14/15 passed · 1 failed | 2026-10-20T05:41Z, 15/15 |
| [#41](https://github.com/mohamedwael201193/ninety/pull/41) | App defect | 2026-10-20T05:49Z, 14/15 | TC011 | 14/15 passed · 1 failed; 16/17 passed · 1 failed; 16/17 passed · 1 failed; 16/17 passed · 1 failed | 2026-10-20T06:38Z, 17/17 |
| [#43](https://github.com/mohamedwael201193/ninety/pull/43) | Test plan or CI | 2026-10-20T07:15Z, 16/17 | TS18 | 16/17 passed · 1 failed | 2026-10-20T07:21Z, 17/17 |
| [#44](https://github.com/mohamedwael201193/ninety/pull/44) | Blocked, not a catch | 2026-10-20T07:27Z, 0/17 | TS01, TS02, TS03, TS04, TS05, TS06, TS07, TS08, TC009, TC010, TC011, TS09, TS10, TS26, TS16, TS17, TS18 | 0/17 passed · 17 blocked | 2026-10-20T07:31Z, 17/17 |
| [#55](https://github.com/mohamedwael201193/ninety/pull/55) | App defect | 2026-10-20T08:51Z, 34/35 | TS41 | 34/35 passed · 1 failed; 32/35 passed · 2 failed · 1 blocked; 32/35 passed · 3 failed | 2026-10-20T11:56Z, 35/35 |
| [#57](https://github.com/mohamedwael201193/ninety/pull/57) | App defect | 2026-10-20T21:56Z, 34/43 | TS02, TS45, TS46, TS47, TS48, TS49, TS50, TS51, TS52 | 34/43 passed · 8 failed · 1 blocked; 42/43 passed · 1 failed | 2026-10-20T22:09Z, 43/43 |
| [#60](https://github.com/mohamedwael201193/ninety/pull/60) | UX loading state (not a wrong number) | 2026-10-20T22:59Z, 42/43 | TS42 | 42/43 passed · 1 failed | 2026-10-20T23:16Z, 43/43 |
| [#63](https://github.com/mohamedwael201193/ninety/pull/63) | Test plan or CI | 2026-10-21T00:47Z, 41/43 | TS13, TS42 | 41/43 passed · 2 failed; 42/43 passed · 1 failed | not yet |
| [#68](https://github.com/mohamedwael201193/ninety/pull/68) | Test plan or CI | 2026-10-24T00:57Z, 52/53 | TS18 | 52/54 passed · 1 failed · 1 blocked; 52/54 passed · 1 failed · 1 blocked | 2026-10-24T01:18Z, 54/54 |

## Notes

- Classified as a blank loading state (UX), not a wrong number. TS42 (leap-day stay leaves the window on day 181) failed once on PR #60 at commit 1abce4c (42/43, [execution](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/1f423c16-9271-4530-bbd6-11c6ec403bef)): the agent read the Days used cell as empty. A CLI rerun of TS42 alone against production passed (run 3f1d1a94-9544-4e94-9688-5ace96c0d741). Playwright never saw a wrong number, but with the CPU slowed 20x the status area was an empty skeleton for about 3 s, and the server HTML said only "Loading…" ([timeline](docs/evidence/testsprite/ts42-pr60/production-throttled-timeline.txt)). Fixed on #60: until the trips load, the Days used and Days left tiles say "Counting your saved trips…" ([red](docs/evidence/testsprite/ts42-pr60/vitest-red.txt), [green](docs/evidence/testsprite/ts42-pr60/vitest-green.txt)). The next full run, on 9a0c897 with the fix, was "All 43 tests passed" ([execution](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/eba1bf9c-2c9c-4a6a-8711-79b4955b870a)), and #60 merged as 9f781f6.
- Test-contract catch, not an app bug. On PR #63 at 5a7cc22 (41/43, [execution](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/e26baa18-c6da-452f-ae44-7f2a9d0a10ff)) TS13 failed because our manual-QA change replaced the raw finding codes on /ees with human wording, and the plan relies on the codes (data-codes 'figure-differs exit-dates-disagree'). The app's answer was right (Playwright on the preview: the same data-codes, no 'Likely missing entry'). TestSprite caught that the wording change broke the contract the test reads; the chips now show the wording followed by the code in small monospace. In the same run TS42 failed because the agent opened /?today=2024-08-27&fresh=1, which the plan forbids; its own DOM snapshot shows Days used = 0 with no trips (not blank), so this was an agent step error. The TS42 plan now states the exact URL first (plan put, free). The final push, a744ca9, ran 42/43 on the TestSprite V3 check: TS13 passed, and TS42 failed again (run 2047bee7-46ab-41f6-b989-f7ee7663c8ea). This time the agent opened the right URL, and its own DOM snapshot shows Days used = 0 with one trip listed, yet it reported the cell as empty: an agent-read flake, not an app defect. TS42 alone on the same a744ca9 preview then passed 9/9 (run 0c8f535f-664e-4a89-891a-7676ce7dde92, [snapshot](docs/evidence/ts42-isolated-rerun/step08-snapshot.png), [result](docs/evidence/ts42-isolated-rerun/result.json)). With the backend gate green and Vitest 367/367, #63 was admin-merged over this one flake as 7bdf5b1; we did not pay for a third full run.

## Every execution

| When (UTC) | Where | Result | Failed |
|---|---|---|---|
| 2026-10-18T22:44 | default | 1/2 | TS02 |
| 2026-10-18T22:47 | default | 2/2 | none |
| 2026-10-18T22:50 | default | 8/9 | TS05 |
| 2026-10-18T23:00 | default | 8/9 | TS05 |
| 2026-10-18T23:05 | default | 9/9 | none |
| 2026-10-18T23:14 | default | 7/8 | TS06 |
| 2026-10-18T23:29 | default | 9/9 | none |
| 2026-10-18T23:47 | default | 9/9 | none |
| 2026-10-19T00:04 | [#7](https://github.com/mohamedwael201193/ninety/pull/7) | 9/9 | none |
| 2026-10-19T00:07 | [#7](https://github.com/mohamedwael201193/ninety/pull/7) | 10/10 | none |
| 2026-10-19T00:10 | default | 10/10 | none |
| 2026-10-19T00:11 | [#8](https://github.com/mohamedwael201193/ninety/pull/8) | 8/10 | TS02, TC010 |
| 2026-10-19T00:18 | [#8](https://github.com/mohamedwael201193/ninety/pull/8) | 10/10 | none |
| 2026-10-19T00:22 | default | 10/10 | none |
| 2026-10-19T00:41 | [#9](https://github.com/mohamedwael201193/ninety/pull/9) | 10/10 | none |
| 2026-10-19T00:42 | [#10](https://github.com/mohamedwael201193/ninety/pull/10) | 10/10 | none |
| 2026-10-19T00:42 | [#11](https://github.com/mohamedwael201193/ninety/pull/11) | 10/10 | none |
| 2026-10-19T00:43 | [#12](https://github.com/mohamedwael201193/ninety/pull/12) | 10/10 | none |
| 2026-10-19T00:56 | [#10](https://github.com/mohamedwael201193/ninety/pull/10) | 10/10 | none |
| 2026-10-19T01:04 | ninety-git-readme-ci-in-action-mohamedwael201193s-projects | 1/1 | none |
| 2026-10-19T01:07 | default | 10/10 | none |
| 2026-10-19T01:07 | default | 10/10 | none |
| 2026-10-19T01:09 | [#11](https://github.com/mohamedwael201193/ninety/pull/11) | 10/10 | none |
| 2026-10-19T01:26 | default | 10/10 | none |
| 2026-10-19T01:43 | [#9](https://github.com/mohamedwael201193/ninety/pull/9) | 10/10 | none |
| 2026-10-19T01:44 | [#13](https://github.com/mohamedwael201193/ninety/pull/13) | 10/10 | none |
| 2026-10-19T01:51 | default | 10/10 | none |
| 2026-10-19T01:51 | default | 10/10 | none |
| 2026-10-19T01:54 | [#14](https://github.com/mohamedwael201193/ninety/pull/14) | 11/11 | none |
| 2026-10-19T02:11 | [#15](https://github.com/mohamedwael201193/ninety/pull/15) | 11/11 | none |
| 2026-10-19T02:14 | default | 11/11 | none |
| 2026-10-19T02:15 | [#14](https://github.com/mohamedwael201193/ninety/pull/14) | 11/11 | none |
| 2026-10-19T02:25 | [#16](https://github.com/mohamedwael201193/ninety/pull/16) | 11/11 | none |
| 2026-10-19T02:26 | [#17](https://github.com/mohamedwael201193/ninety/pull/17) | 11/11 | none |
| 2026-10-19T02:29 | default | 11/11 | none |
| 2026-10-19T02:29 | default | 11/11 | none |
| 2026-10-19T02:31 | [#14](https://github.com/mohamedwael201193/ninety/pull/14) | 11/13 | TS09, TS10 |
| 2026-10-19T02:38 | [#14](https://github.com/mohamedwael201193/ninety/pull/14) | 12/13 | TS10 |
| 2026-10-19T02:42 | [#14](https://github.com/mohamedwael201193/ninety/pull/14) | 13/13 | none |
| 2026-10-19T02:46 | default | 11/13 | TS09, TS10 |
| 2026-10-19T02:47 | [#18](https://github.com/mohamedwael201193/ninety/pull/18) | 12/13 | TS10 |
| 2026-10-19T03:29 | [#20](https://github.com/mohamedwael201193/ninety/pull/20) | 13/13 | none |
| 2026-10-19T03:35 | [#18](https://github.com/mohamedwael201193/ninety/pull/18) | 13/13 | none |
| 2026-10-19T03:49 | [#21](https://github.com/mohamedwael201193/ninety/pull/21) | 13/13 | none |
| 2026-10-19T03:54 | [#22](https://github.com/mohamedwael201193/ninety/pull/22) | 13/13 | none |
| 2026-10-19T04:04 | [#23](https://github.com/mohamedwael201193/ninety/pull/23) | 14/14 | none |
| 2026-10-19T04:08 | [#22](https://github.com/mohamedwael201193/ninety/pull/22) | 14/14 | none |
| 2026-10-19T04:12 | [#24](https://github.com/mohamedwael201193/ninety/pull/24) | 14/14 | none |
| 2026-10-19T04:16 | [#25](https://github.com/mohamedwael201193/ninety/pull/25) | 14/14 | none |
| 2026-10-19T04:26 | [#26](https://github.com/mohamedwael201193/ninety/pull/26) | 14/14 | none |
| 2026-10-19T04:39 | [#27](https://github.com/mohamedwael201193/ninety/pull/27) | 14/14 | none |
| 2026-10-19T04:41 | [#28](https://github.com/mohamedwael201193/ninety/pull/28) | 14/14 | none |
| 2026-10-19T04:42 | [#29](https://github.com/mohamedwael201193/ninety/pull/29) | 14/14 | none |
| 2026-10-19T04:43 | [#30](https://github.com/mohamedwael201193/ninety/pull/30) | 14/14 | none |
| 2026-10-19T04:44 | [#31](https://github.com/mohamedwael201193/ninety/pull/31) | 14/14 | none |
| 2026-10-19T04:45 | [#32](https://github.com/mohamedwael201193/ninety/pull/32) | 14/14 | none |
| 2026-10-19T04:46 | [#33](https://github.com/mohamedwael201193/ninety/pull/33) | 14/14 | none |
| 2026-10-19T04:49 | [#34](https://github.com/mohamedwael201193/ninety/pull/34) | 14/14 | none |
| 2026-10-19T04:54 | [#30](https://github.com/mohamedwael201193/ninety/pull/30) | 14/14 | none |
| 2026-10-19T04:55 | [#33](https://github.com/mohamedwael201193/ninety/pull/33) | 14/14 | none |
| 2026-10-19T04:56 | [#35](https://github.com/mohamedwael201193/ninety/pull/35) | 14/14 | none |
| 2026-10-19T05:03 | [#36](https://github.com/mohamedwael201193/ninety/pull/36) | 13/14 | TS26 |
| 2026-10-19T05:04 | [#37](https://github.com/mohamedwael201193/ninety/pull/37) | 13/14 | TS26 |
| 2026-10-19T05:05 | [#38](https://github.com/mohamedwael201193/ninety/pull/38) | 13/14 | TS26 |
| 2026-10-19T05:07 | [#36](https://github.com/mohamedwael201193/ninety/pull/36) | 14/14 | none |
| 2026-10-19T05:11 | [#37](https://github.com/mohamedwael201193/ninety/pull/37) | 14/14 | none |
| 2026-10-19T05:12 | [#38](https://github.com/mohamedwael201193/ninety/pull/38) | 14/14 | none |
| 2026-10-19T05:17 | [#39](https://github.com/mohamedwael201193/ninety/pull/39) | 14/15 | TS16 |
| 2026-10-20T05:41 | [#39](https://github.com/mohamedwael201193/ninety/pull/39) | 15/15 | none |
| 2026-10-20T05:45 | [#40](https://github.com/mohamedwael201193/ninety/pull/40) | 15/15 | none |
| 2026-10-20T05:49 | [#41](https://github.com/mohamedwael201193/ninety/pull/41) | 14/15 | TC011 |
| 2026-10-20T05:54 | ninety-git-b-landing-mohamedwael201193s-projects | 1/1 | none |
| 2026-10-20T05:58 | [#42](https://github.com/mohamedwael201193/ninety/pull/42) | 17/17 | none |
| 2026-10-20T06:12 | [#42](https://github.com/mohamedwael201193/ninety/pull/42) | 17/17 | none |
| 2026-10-20T06:21 | [#41](https://github.com/mohamedwael201193/ninety/pull/41) | 16/17 | TC011 |
| 2026-10-20T06:28 | [#41](https://github.com/mohamedwael201193/ninety/pull/41) | 16/17 | TS18 |
| 2026-10-20T06:34 | [#41](https://github.com/mohamedwael201193/ninety/pull/41) | 16/17 | TS18 |
| 2026-10-20T06:38 | [#41](https://github.com/mohamedwael201193/ninety/pull/41) | 17/17 | none |
| 2026-10-20T06:46 | [#33](https://github.com/mohamedwael201193/ninety/pull/33) | 17/17 | none |
| 2026-10-20T06:52 | [#28](https://github.com/mohamedwael201193/ninety/pull/28) | 17/17 | none |
| 2026-10-20T06:57 | [#32](https://github.com/mohamedwael201193/ninety/pull/32) | 15/17 | TC011, TS18 |
| 2026-10-20T07:03 | [#32](https://github.com/mohamedwael201193/ninety/pull/32) | 17/17 | none |
| 2026-10-20T07:09 | [#43](https://github.com/mohamedwael201193/ninety/pull/43) | 17/17 | none |
| 2026-10-20T07:15 | [#43](https://github.com/mohamedwael201193/ninety/pull/43) | 16/17 | TS18 |
| 2026-10-20T07:21 | [#43](https://github.com/mohamedwael201193/ninety/pull/43) | 17/17 | none |
| 2026-10-20T07:27 | [#44](https://github.com/mohamedwael201193/ninety/pull/44) | 0/17 | TS01, TS02, TS03, TS04, TS05, TS06, TS07, TS08, TC009, TC010, TC011, TS09, TS10, TS26, TS16, TS17, TS18 |
| 2026-10-20T07:31 | [#44](https://github.com/mohamedwael201193/ninety/pull/44) | 17/17 | none |
| 2026-10-20T07:36 | [#45](https://github.com/mohamedwael201193/ninety/pull/45) | 17/17 | none |
| 2026-10-20T07:41 | [#46](https://github.com/mohamedwael201193/ninety/pull/46) | 17/17 | none |
| 2026-10-20T07:47 | [#47](https://github.com/mohamedwael201193/ninety/pull/47) | 17/17 | none |
| 2026-10-20T07:54 | [#48](https://github.com/mohamedwael201193/ninety/pull/48) | 27/27 | none |
| 2026-10-20T07:59 | [#49](https://github.com/mohamedwael201193/ninety/pull/49) | 27/27 | none |
| 2026-10-20T08:09 | [#50](https://github.com/mohamedwael201193/ninety/pull/50) | 29/29 | none |
| 2026-10-20T08:16 | [#50](https://github.com/mohamedwael201193/ninety/pull/50) | 29/29 | none |
| 2026-10-20T08:21 | [#51](https://github.com/mohamedwael201193/ninety/pull/51) | 30/30 | none |
| 2026-10-20T08:28 | [#52](https://github.com/mohamedwael201193/ninety/pull/52) | 31/31 | none |
| 2026-10-20T08:35 | [#53](https://github.com/mohamedwael201193/ninety/pull/53) | 32/32 | none |
| 2026-10-20T08:44 | [#54](https://github.com/mohamedwael201193/ninety/pull/54) | 32/32 | none |
| 2026-10-20T08:51 | [#55](https://github.com/mohamedwael201193/ninety/pull/55) | 34/35 | TS41 |
| 2026-10-20T08:58 | [#55](https://github.com/mohamedwael201193/ninety/pull/55) | 32/35 | TS39, TS41, TS42 |
| 2026-10-20T09:10 | [#55](https://github.com/mohamedwael201193/ninety/pull/55) | 32/35 | TS34, TS41, TS42 |
| 2026-10-20T11:56 | [#55](https://github.com/mohamedwael201193/ninety/pull/55) | 35/35 | none |
| 2026-10-20T15:29 | [#56](https://github.com/mohamedwael201193/ninety/pull/56) | 35/35 | none |
| 2026-10-20T21:56 | [#57](https://github.com/mohamedwael201193/ninety/pull/57) | 34/43 | TS02, TS45, TS46, TS47, TS48, TS49, TS50, TS51, TS52 |
| 2026-10-20T22:02 | [#57](https://github.com/mohamedwael201193/ninety/pull/57) | 42/43 | TS02 |
| 2026-10-20T22:09 | [#57](https://github.com/mohamedwael201193/ninety/pull/57) | 43/43 | none |
| 2026-10-20T22:59 | [#60](https://github.com/mohamedwael201193/ninety/pull/60) | 42/43 | TS42 |
| 2026-10-20T23:06 | default | 1/1 | none |
| 2026-10-20T23:16 | [#60](https://github.com/mohamedwael201193/ninety/pull/60) | 43/43 | none |
| 2026-10-20T23:44 | [#61](https://github.com/mohamedwael201193/ninety/pull/61) | 43/43 | none |
| 2026-10-21T00:12 | [#62](https://github.com/mohamedwael201193/ninety/pull/62) | 43/43 | none |
| 2026-10-21T00:47 | [#63](https://github.com/mohamedwael201193/ninety/pull/63) | 41/43 | TS13, TS42 |
| 2026-10-21T01:07 | [#63](https://github.com/mohamedwael201193/ninety/pull/63) | 42/43 | TS42 |
| 2026-10-21T01:21 | ninety-git-l-final-mohamedwael201193s-projects | 1/1 | none |
| 2026-10-22T04:49 | default | 2/3 | TS03 |
| 2026-10-23T22:43 | [#65](https://github.com/mohamedwael201193/ninety/pull/65) | 43/43 | none |
| 2026-10-23T22:46 | default | 2/3 | TS03 |
| 2026-10-23T22:53 | default | 1/1 | none |
| 2026-10-23T22:55 | [#67](https://github.com/mohamedwael201193/ninety/pull/67) | 43/43 | none |
| 2026-10-23T23:10 | default | 10/10 | none |
| 2026-10-24T00:57 | [#68](https://github.com/mohamedwael201193/ninety/pull/68) | 52/53 | TS18 |
| 2026-10-24T01:04 | ninety-git-pr2-depth-mohamedwael201193s-projects | 2/4 | TS42, TS64 |
| 2026-10-24T01:07 | [#68](https://github.com/mohamedwael201193/ninety/pull/68) | 52/53 | TS42 |
| 2026-10-24T01:15 | ninety-git-pr2-depth-mohamedwael201193s-projects | 2/2 | none |
| 2026-10-24T01:18 | [#68](https://github.com/mohamedwael201193/ninety/pull/68) | 54/54 | none |
