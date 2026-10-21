# The loop, iteration by iteration

Generated 2026-10-21T00:36:54.302Z by `scripts/loop-iterations.mjs`. One iteration = one merged pull request, in merge order. Links come from the GitHub API: the PR, its commits, and each commit's "TestSprite V3" status, which links the TestSprite execution. Test results come from TestSprite's run history (`src/data/loop.json`, see [LOOP.md](LOOP.md)). Do not edit by hand.

Screenshots of the runs and the merge gate: [docs/evidence/testsprite](docs/evidence/testsprite/README.md).

58 iterations, 12 of them red, then green (a PR check reported failed tests, and a later commit on the same PR passed): 6 app defects (#8, #14, #39, #41, #55, #57), 1 UX loading state that never showed a wrong number (#60) and 5 where the test plan or CI was wrong (#18, #22, #36, #32, #43). 2 more had a run that could not start or was blocked before a green run; those are not counted as catches.

## Iteration 1: [#1](https://github.com/mohamedwael201193/ninety/pull/1) Add the Ninety 90/180 foundation

Merged 2026-10-18 23:08 UTC as [`255ea33`](https://github.com/mohamedwael201193/ninety/commit/255ea335d47b9a32fa8b003bb9c75b902d9b1ce1).

No TestSprite V3 status on this PR's commits.

## Iteration 2: [#3](https://github.com/mohamedwael201193/ninety/pull/3) Landing page + dashboard redesign

Merged 2026-10-18 23:09 UTC as [`42e205e`](https://github.com/mohamedwael201193/ninety/commit/42e205e649d676361d6fcc045f09ae00a7725195).

No TestSprite V3 status on this PR's commits.

## Iteration 3: [#4](https://github.com/mohamedwael201193/ninety/pull/4) Add the TestSprite end-to-end suite

Merged 2026-10-18 23:09 UTC as [`2c617c8`](https://github.com/mohamedwael201193/ninety/commit/2c617c89ca129acd1dc79bbafc4b149d47b360bb).

No TestSprite V3 status on this PR's commits.

## Iteration 4: [#5](https://github.com/mohamedwael201193/ninety/pull/5) Keep the pinned story off the dashboard

Merged 2026-10-18 23:23 UTC as [`200a356`](https://github.com/mohamedwael201193/ninety/commit/200a356bd15d775c22192ca8cfdb97d4eb933d70).

No TestSprite V3 status on this PR's commits.

## Iteration 5: [#6](https://github.com/mohamedwael201193/ninety/pull/6) Write the project README

Merged 2026-10-18 23:47 UTC as [`3c7cb97`](https://github.com/mohamedwael201193/ninety/commit/3c7cb97d42704c615c887489d46df23077a51b71).

No TestSprite V3 status on this PR's commits.

## Iteration 6: [#7](https://github.com/mohamedwael201193/ninety/pull/7) TestSprite suite: date-format test and test index

Merged 2026-10-19 00:10 UTC as [`ec283f5`](https://github.com/mohamedwael201193/ninety/commit/ec283f54f55e58246d60df4c7a8ae72a8160304c).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`a352071`](https://github.com/mohamedwael201193/ninety/commit/a3520717b34720b2efd68973519fac468c327411) TestSprite suite: date-format test plan and a documented test index | success: All 10 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/9b1c34fc-0ce7-48ae-a356-c9438256cc83) |
| [`f1cd450`](https://github.com/mohamedwael201193/ninety/commit/f1cd4509f4b81f40f5b12792bf074fb0956ff10a) TestSprite README: note the PR merge gate and test count | success: All 11 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/b3f93550-866a-49be-88ae-76d5f3c8ad09) |

## Iteration 7: [#8](https://github.com/mohamedwael201193/ninety/pull/8) Refactor parity table rendering (red, then green: app defect)

Merged 2026-10-19 00:22 UTC as [`91b193a`](https://github.com/mohamedwael201193/ninety/commit/91b193ae21ebcdb4c01dc5a3f4d11cc42c3131e2).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`46336bf`](https://github.com/mohamedwael201193/ninety/commit/46336bfb0d7e6a4ea622f0125f66391be9783a93) Refactor parity table rendering into a row component | failure: 9/11 passed · 2 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/462ee782-ffde-45b7-a89d-fc1edf82f45a) |
| [`04527b4`](https://github.com/mohamedwael201193/ninety/commit/04527b42bd6b955c7be02a336d9c975f437c646e) Vitest: automatic JSX runtime so component helpers can be unit-tested | success: All 11 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/fcfeb4fe-ec50-4821-b04c-f28dd9427ab4) |

Run history: 2026-10-19T00:11Z 8/10 (failed TS02, TC010) → 2026-10-19T00:18Z 10/10.

## Iteration 8: [#10](https://github.com/mohamedwael201193/ninety/pull/10) Leave pre-10 April 2026 stays out of the EES comparison

Merged 2026-10-19 01:07 UTC as [`b5990ee`](https://github.com/mohamedwael201193/ninety/commit/b5990ee2bb0b95ff5127a1567fe4fbd31243f259).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`97f6556`](https://github.com/mohamedwael201193/ninety/commit/97f6556990561b1111b204d9d01e4ad04f180773) Leave stays that began before 10 April 2026 out of the EES comparison | success: All 11 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/0dc2803b-8a5f-4ff1-a303-ba3f65b4e06b) |
| [`a12bec1`](https://github.com/mohamedwael201193/ninety/commit/a12bec10c237784689039ee76b7db190430ff12e) Name the EES cutoff as its own finding and keep it out of the correcti | success: All 11 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/f94a993b-fe4e-437a-814f-bcfc78240263) |

## Iteration 9: [#12](https://github.com/mohamedwael201193/ninety/pull/12) Readable names on the parity table

Merged 2026-10-19 01:07 UTC as [`a5ca25f`](https://github.com/mohamedwael201193/ninety/commit/a5ca25fdb42b1fc0895bc9f0ae60c847fedbaa06).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`6cafd76`](https://github.com/mohamedwael201193/ninety/commit/6cafd76fa89d8e9ebd8444ce78f873eaa8b9ea8f) Give parity scenarios readable names and capitalise months | success: All 11 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/deb4ea87-2bc4-4250-ae8b-b5fa8689a8ab) |

## Iteration 10: [#11](https://github.com/mohamedwael201193/ninety/pull/11) Property tests over random travel histories

Merged 2026-10-19 01:26 UTC as [`f5ec018`](https://github.com/mohamedwael201193/ninety/commit/f5ec018bf97a0938ae6f036da51c693a937aac17).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`22171cc`](https://github.com/mohamedwael201193/ninety/commit/22171ccf4b4bd68dc51b5904a81d1210e6c08c22) Add property tests over random travel histories; fix false exit mismat | success: All 11 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/e2792501-b434-490d-8f6b-2cbc6af91e71) |
| [`8a2c1bd`](https://github.com/mohamedwael201193/ninety/commit/8a2c1bd07ee4a16760899341762d56c691201b6b) Merge main into property-tests | success: All 11 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/68464ab2-6d2a-4e09-9a5f-47e6ebf15c47) |

## Iteration 11: [#9](https://github.com/mohamedwael201193/ninety/pull/9) test: pin ?today, clear storage, fix README counts (run could not complete, then green)

Merged 2026-10-19 01:51 UTC as [`bc496b5`](https://github.com/mohamedwael201193/ninety/commit/bc496b5f62b86d981c179206f3e65bf7d7fe4017).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`81be862`](https://github.com/mohamedwael201193/ninety/commit/81be8628001530dfd970bbcf27d784ac966a3fd3) README: show the TestSprite check gating pull requests | success: All 11 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/7749bb4b-820d-4b87-8e44-65286f0bc39d) |
| [`2db7bc3`](https://github.com/mohamedwael201193/ninety/commit/2db7bc3824f3f49823c718a8ca8b11e37c6d3927) Pin the date and clear storage in every TestSprite plan; make README t | failure: TestSprite could not start this run. See the project activity for details. | no execution (the run did not start) |
| [`5870acb`](https://github.com/mohamedwael201193/ninety/commit/5870acbf3f756b84fe369395914f512ae69e1932) README: document ?fresh=1 | failure: TestSprite could not start this run. See the project activity for details. | no execution (the run did not start) |
| [`68fe8bc`](https://github.com/mohamedwael201193/ninety/commit/68fe8bc9605f2dca4ed068d4527ccd139576182a) Merge main into readme-ci-in-action | success: All 11 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/0dda45d5-9c38-4d57-999e-0722f2ad3463) |

## Iteration 12: [#13](https://github.com/mohamedwael201193/ninety/pull/13) CI: lint, types and Vitest on every PR

Merged 2026-10-19 01:51 UTC as [`610850e`](https://github.com/mohamedwael201193/ninety/commit/610850e22cde69c453ed628db4426b64a61bb8e5).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`2f8579f`](https://github.com/mohamedwael201193/ninety/commit/2f8579f60fb7e5e53018dc539d9137d7d3b8d44d) CI: run lint, types and the full Vitest suite on every PR, plus a nigh | success: All 11 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/5a8de5be-0e69-4456-8d76-ce5c97de5821) |

## Iteration 13: [#15](https://github.com/mohamedwael201193/ninety/pull/15) Trip form: open stays always save; submit no longer shares the 'Add trip' label

Merged 2026-10-19 02:14 UTC as [`4461c02`](https://github.com/mohamedwael201193/ninety/commit/4461c02d3a708db7b24a9ae905f151ec8efe885b).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`64f1341`](https://github.com/mohamedwael201193/ninety/commit/64f1341204c72f891dd9c0aa13731d289d3c7c99) Trip form: an open stay always saves, and the submit button no longer  | success: All 12 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/a9e16249-bb78-4da2-83d2-225062f88008) |

## Iteration 14: [#16](https://github.com/mohamedwael201193/ninety/pull/16) Trip form: save values set without a change event

Merged 2026-10-19 02:29 UTC as [`4948900`](https://github.com/mohamedwael201193/ninety/commit/49489000657c8258d593c7501bf907c0d216f081).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`fb917ea`](https://github.com/mohamedwael201193/ninety/commit/fb917ea346537e1e3d2bbd55ff51935fb74bc902) Trip form: read the fields on submit so autofilled or scripted values  | success: All 12 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/52e123c0-2de1-4b44-a60d-beac4d94d9f6) |

## Iteration 15: [#17](https://github.com/mohamedwael201193/ninety/pull/17) Scenario links: load a named demo history from the URL

Merged 2026-10-19 02:29 UTC as [`8afa6fe`](https://github.com/mohamedwael201193/ninety/commit/8afa6fef623bb17574d97cc95daf1d01dd903445).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`9e5c136`](https://github.com/mohamedwael201193/ninety/commit/9e5c136803dcddba398bba3cd2d54511b8c0bb54) Scenario links: /?scenario=open-stay and friends load a named demo his | success: All 12 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/58efd029-c516-4ff9-8fdc-4572a2c6dff1) |

## Iteration 16: [#14](https://github.com/mohamedwael201193/ninety/pull/14) Planner: a plan made during an open stay must count the days until the trip (red, then green: app defect)

Merged 2026-10-19 02:46 UTC as [`7a70dde`](https://github.com/mohamedwael201193/ninety/commit/7a70dde15218ae29b8cdc5b45b31e203e3e27ee3).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`3768b1c`](https://github.com/mohamedwael201193/ninety/commit/3768b1cce87b29fc0d62aa6e239038ebc029e19a) Test planned trips during an open stay (currently fails: the planner t | failure: 12/14 passed · 2 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/8e2076fc-03b4-4ede-8db0-42304455f7c4) |
| [`8c94da5`](https://github.com/mohamedwael201193/ninety/commit/8c94da57a71deef35642522823721b67953a180a) TestSprite TS09/TS10: create the open stay in atomic steps and assert  | failure: 12/14 passed · 2 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/18e30467-1d03-479e-bf9e-2cfbd6ec5ee6) |
| [`ad2270b`](https://github.com/mohamedwael201193/ninety/commit/ad2270b08158b81f28dbc597a212cf356f4ae93f) TestSprite TS09/TS10: start from /?scenario=open-stay and check only t | failure: 12/14 passed · 2 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/9f0a7f9b-ea9f-4b3d-92a3-03ad3a33993c) |
| [`aa70cc1`](https://github.com/mohamedwael201193/ninety/commit/aa70cc16a89681c914c0d4d2f4214f8475ee8891) Property test: a plan during an open stay agrees with the same dates a | failure: 13/14 passed · 1 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/705563ad-0e71-41c5-bd8a-272239f8e92a) |
| [`cba2989`](https://github.com/mohamedwael201193/ninety/commit/cba298907cca6860745b0833b29be7ebb1dc440f) Planner form: read the date fields on submit and update the verdict in | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/9729a19e-dbab-4c24-9811-ec7d7236f060) |

Run history: 2026-10-19T01:54Z 11/11 → 2026-10-19T02:15Z 11/11 → 2026-10-19T02:31Z 11/13 (failed TS09, TS10) → 2026-10-19T02:38Z 12/13 (failed TS10) → 2026-10-19T02:42Z 13/13.

## Iteration 17: [#20](https://github.com/mohamedwael201193/ninety/pull/20) Section links keep ?scenario= and ?today= on the home page

Merged 2026-10-19 03:33 UTC as [`e8237b6`](https://github.com/mohamedwael201193/ninety/commit/e8237b6073f29b1ddf91c6f25653018a910b0f65).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`0e37f80`](https://github.com/mohamedwael201193/ninety/commit/0e37f8025ce97d1ef6a41ac602f9baa5f5e1b663) Self-host the fonts so the build never depends on Google Fonts (the Ve | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/8944ffe2-ca23-45d9-a13b-e61f50d56c68) |

## Iteration 18: [#18](https://github.com/mohamedwael201193/ninety/pull/18) CI: run on Node 22 (pdfjs-dist needs >=22.13; Node 20 is deprecated on Actions) (red, then green: test plan or CI)

Merged 2026-10-19 03:47 UTC as [`5f6fddc`](https://github.com/mohamedwael201193/ninety/commit/5f6fddc0ad679df93d8c6740f542f3acc152b8ae).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`110a5eb`](https://github.com/mohamedwael201193/ninety/commit/110a5eb00b33d347685cded6218e10834a36d4e1) CI: run on Node 22 (pdfjs-dist needs >=22.13; Node 20 is deprecated on | failure: 13/14 passed · 1 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/8346ca6e-a03f-4db0-8297-b75cf01770b3) |
| [`5a4d509`](https://github.com/mohamedwael201193/ninety/commit/5a4d5098cb8af4536bbeda8bfaef512d69777f66) Merge main into b-ci-node22 | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/471d71d4-e84e-43e1-9758-1c1eb0fe82bd) |

Run history: 2026-10-19T02:47Z 12/13 (failed TS10) → 2026-10-19T03:35Z 13/13.

## Iteration 19: [#21](https://github.com/mohamedwael201193/ninety/pull/21) Deps: Vitest 4.1.12 (fixes critical tinypool RCE and @vitest/mocker path traversal)

Merged 2026-10-19 03:52 UTC as [`e08facb`](https://github.com/mohamedwael201193/ninety/commit/e08facbb928d7714c735951ce133db14e5266e9c).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`f36c0db`](https://github.com/mohamedwael201193/ninety/commit/f36c0db91499f90fae461203c5037a0def19e7c7) Deps: Vitest 4.1.12 (fixes critical tinypool RCE and @vitest/mocker pa | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/80f82b0f-de12-4f74-8eed-af9b81962ec1) |

## Iteration 20: [#23](https://github.com/mohamedwael201193/ninety/pull/23) TestSprite TS07: assert the visible verdict, and record current cloud test ids

Merged 2026-10-19 04:06 UTC as [`98e99c5`](https://github.com/mohamedwael201193/ninety/commit/98e99c5b8db92763f12e9540f793d30679614bbd).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`de85611`](https://github.com/mohamedwael201193/ninety/commit/de85611b2f73b9ebc59e0706d65f1fbe7f32bc20) TestSprite TS07: assert the visible verdict, not a data attribute; rec | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/d438dac4-7edb-4e69-8d15-e51c79c20849) |

## Iteration 21: [#22](https://github.com/mohamedwael201193/ninety/pull/22) Deps: pin Next's bundled PostCSS to ^8.5.31 (fixes 4 high PostCSS advisories and the Next moderate) (red, then green: test plan or CI)

Merged 2026-10-19 04:10 UTC as [`f294442`](https://github.com/mohamedwael201193/ninety/commit/f2944428d4e5c8f4dff93d896d5b7fa0e6d54de8).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`af6e1fa`](https://github.com/mohamedwael201193/ninety/commit/af6e1fabf00ba8907cc3790899d53470c755145c) Deps: pin Next's bundled PostCSS to ^8.5.31 (fixes 4 high PostCSS advi | failure: 13/14 passed · 1 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/ad3495e3-9953-489d-b69e-7c0084df7ae5) |
| [`78665f7`](https://github.com/mohamedwael201193/ninety/commit/78665f70e2080dbe2f13b0a40d2c914e20b4ced5) Merge main into b-audit-postcss | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/333c44d6-9f07-423f-a09f-d4a891ce5078) |

## Iteration 22: [#24](https://github.com/mohamedwael201193/ninety/pull/24) Property tests for the EES cutoff; fix a day dropped from the comparison when trips overlap the cutoff

Merged 2026-10-19 04:15 UTC as [`a0b552f`](https://github.com/mohamedwael201193/ninety/commit/a0b552fa08cbc58bf1a4de8c2029252d8cc4ef03).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`71ed57a`](https://github.com/mohamedwael201193/ninety/commit/71ed57aa329155a7aa219e77f9291cf4d0598c77) Property tests for the EES cutoff; fix a day dropped from the comparis | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/caecc9b5-2ea0-4691-84ff-54947a2d9139) |

## Iteration 23: [#25](https://github.com/mohamedwael201193/ninety/pull/25) EES cutoff: a same-day re-entry on or after 10 April 2026 is a new, comparable visit

Merged 2026-10-19 04:19 UTC as [`7c89e67`](https://github.com/mohamedwael201193/ninety/commit/7c89e67fcb374c1865fb4d1aac700857c0c1ce35).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`bed3e76`](https://github.com/mohamedwael201193/ninety/commit/bed3e7669eea8471f35fec1772090739f3f8a21d) EES cutoff: a same-day re-entry on or after 10 April 2026 is a new, co | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/662fc7e4-3a6e-4086-8b63-325092a502b7) |

## Iteration 24: [#26](https://github.com/mohamedwael201193/ninety/pull/26) Letter: state Article 52(1) to 52(5) one clause at a time

Merged 2026-10-19 04:28 UTC as [`e70d98f`](https://github.com/mohamedwael201193/ninety/commit/e70d98f1772d5ff23a90199546cc74c04e97cd99).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`0fab9e8`](https://github.com/mohamedwael201193/ninety/commit/0fab9e88c2b80a3fec1ed2506d3a661b940c54f7) Letter: state Article 52(1) to 52(5) one clause at a time | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/700e4492-1726-411a-ae71-2407d24e1406) |

## Iteration 25: [#27](https://github.com/mohamedwael201193/ninety/pull/27) Letter: require a full reply email address

Merged 2026-10-19 04:41 UTC as [`a954794`](https://github.com/mohamedwael201193/ninety/commit/a954794a06868046c4fc7838bcbcb9a788a254a4).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`87c5351`](https://github.com/mohamedwael201193/ninety/commit/87c5351c2c6f87d6e6a561645a60074c878fc131) Letter: require a full reply email address | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/380eb6e6-83d5-4225-a8f2-3537aa78e724) |

## Iteration 26: [#34](https://github.com/mohamedwael201193/ninety/pull/34) EES: an earlier exit is an exit disagreement, not a missing entry

Merged 2026-10-19 04:51 UTC as [`bb5f8da`](https://github.com/mohamedwael201193/ninety/commit/bb5f8da468c9042e129f90c0bd26aa64d78c09dd).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`9b3db83`](https://github.com/mohamedwael201193/ninety/commit/9b3db83a7a896b62d1551313c07d70990a701845) EES: an earlier exit is an exit disagreement, not a missing entry | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/3df89963-1f2a-4a2f-9fc1-c3c4986a1f11) |

## Iteration 27: [#29](https://github.com/mohamedwael201193/ninety/pull/29) Days ring: keep the label inside the ring

Merged 2026-10-19 04:52 UTC as [`347c8d9`](https://github.com/mohamedwael201193/ninety/commit/347c8d971afa608981bfa69774a7ffbef18d0f6a).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`01d7f09`](https://github.com/mohamedwael201193/ninety/commit/01d7f091619b51e3d7a6b57eb02f779a9cf9e232) Days ring: keep the label inside the ring on two lines, so 107/90 neve | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/defd0c9b-03ed-4f1e-8624-48228cf5ef2c) |

## Iteration 28: [#31](https://github.com/mohamedwael201193/ninety/pull/31) Timeline: mark and label today

Merged 2026-10-19 04:52 UTC as [`e591f87`](https://github.com/mohamedwael201193/ninety/commit/e591f87da69ee2f150bcea95baa4b069ea467beb).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`fd5fda7`](https://github.com/mohamedwael201193/ninety/commit/fd5fda7127b8629b182c6d78cb2a972117ac2282) Timeline: outline and label today's cell, so a counted day at the end  | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/ffe6b75c-ef73-4bcd-aa21-e58b461f3506) |

## Iteration 29: [#30](https://github.com/mohamedwael201193/ninety/pull/30) Status: no 'Over limit' next to 'No overstay'

Merged 2026-10-19 05:01 UTC as [`23b47c0`](https://github.com/mohamedwael201193/ninety/commit/23b47c004769add4774842513952bd2d2d63c0a5).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`3a77429`](https://github.com/mohamedwael201193/ninety/commit/3a774295e55b510cee3125825cd961c7c3f68171) Status: say 'No days left' and 'Not today' after an earlier overstay,  | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/809fb363-be7e-4315-b874-cc289b7d26cc) |

## Iteration 30: [#35](https://github.com/mohamedwael201193/ninety/pull/35) Docs: match the record (14 tests, PR trigger, #8/#14 history), LICENSE, PR template

Merged 2026-10-19 05:01 UTC as [`4e83bde`](https://github.com/mohamedwael201193/ninety/commit/4e83bdef398c57a89ad135dc82b8ee382f0f9591).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`a93a01e`](https://github.com/mohamedwael201193/ninety/commit/a93a01e593c6410ce673ee45b735d5f1db526eb1) Docs: 14-test suite, PR-only trigger, honest #8 and #14 history; LICEN | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/a24d0209-8edc-49ee-958d-241b6a74971c) |

## Iteration 31: [#36](https://github.com/mohamedwael201193/ninety/pull/36) TestSprite: every plan asserts exact values (TS02 checks all 14 counts) (red, then green: test plan or CI)

Merged 2026-10-19 05:10 UTC as [`ecc9163`](https://github.com/mohamedwael201193/ninety/commit/ecc91634901ea4a83934239f9232c8a1c75e008b).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`b839ae4`](https://github.com/mohamedwael201193/ninety/commit/b839ae4100c0502c85e1564cd07f80d1ef078581) TestSprite: deepen all 14 plans to exact values (TS02 checks every row | failure: 13/14 passed · 1 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/61fd31b1-2a5f-4699-88d2-8a8fc407b70f) |
| [`c20fb86`](https://github.com/mohamedwael201193/ninety/commit/c20fb8669a5059e4af956bae14ecf623bdfc7c7b) TS26: days left is 90, not 78 (the May days leave the window before da | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/a1692a81-cb01-473f-835a-9fbdc409979e) |

Run history: 2026-10-19T05:03Z 13/14 (failed TS26) → 2026-10-19T05:07Z 14/14.

## Iteration 32: [#37](https://github.com/mohamedwael201193/ninety/pull/37) Parity: offline unit tests on a stored, hashed Commission page + nightly drift job

Merged 2026-10-19 05:15 UTC as [`2e8ea54`](https://github.com/mohamedwael201193/ninety/commit/2e8ea54e21dd67bd511b40476d380121f11720f4).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`53e3ad8`](https://github.com/mohamedwael201193/ninety/commit/53e3ad8a22aa58a3d7764c2d4adae73e501d552a) Parity tests run offline against a stored, hashed Commission page; nig | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/3262d65a-0c31-48c4-b20d-39e132c083b9) |

## Iteration 33: [#38](https://github.com/mohamedwael201193/ninety/pull/38) LOOP.md: the red-then-green record, generated from TestSprite history

Merged 2026-10-19 05:15 UTC as [`b482e1f`](https://github.com/mohamedwael201193/ninety/commit/b482e1f2490f176151c1cd5eb55fe56c84701973).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`9d1dc6e`](https://github.com/mohamedwael201193/ninety/commit/9d1dc6ef2a7ffb0320160291787eb4079ee35e4e) LOOP.md and loop.json generated from TestSprite run history (npm run l | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/a27d2510-9553-4389-967b-42d3edbe5f66) |

## Iteration 34: [#39](https://github.com/mohamedwael201193/ninety/pull/39) A demo scenario carries to /ees and /letter (TS16, test first) (red, then green: app defect)

Merged 2026-10-20 05:43 UTC as [`76db832`](https://github.com/mohamedwael201193/ninety/commit/76db832fa9accd036ac8f415704d4a3124605b6e).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`35ac180`](https://github.com/mohamedwael201193/ninety/commit/35ac180012a0479c895272fa7a5d3b87dd1aa6bb) TS16 (test first): a demo scenario opened on / must carry to /ees with | failure: 14/15 passed · 1 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/7fb48865-5e1e-4149-a4dd-afb4050f1462) |
| [`24ba105`](https://github.com/mohamedwael201193/ninety/commit/24ba10546bd35b67842f8e0bb9fa19f0580127f2) Redeploy preview after the Vercel daily cap reset | success: All 15 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/2a259b3e-9f21-4481-a76e-80c2b70ea1c1) |

Run history: 2026-10-19T05:17Z 14/15 (failed TS16) → 2026-10-20T05:41Z 15/15.

## Iteration 35: [#40](https://github.com/mohamedwael201193/ninety/pull/40) Engine safety nets: differential fuzzer against the Commission calculator, and a corrupt EES row no longer hides a match

Merged 2026-10-20 05:48 UTC as [`1f24bc3`](https://github.com/mohamedwael201193/ninety/commit/1f24bc3d9241869055251dd9ab6f50c2401915ef).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`05536cc`](https://github.com/mohamedwael201193/ninety/commit/05536cc5001137c63391c230d031bc478f5c1725) EES: a corrupt trip row no longer hides a match from the valid trips | success: All 15 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/8d1a8adc-57ac-4d78-8ba9-8a2df3f19ea1) |

## Iteration 36: [#42](https://github.com/mohamedwael201193/ninety/pull/42) Letter: each missing field is named, and an evidence table shows your dates against EES (TS17, TS18)

Merged 2026-10-20 06:19 UTC as [`0a511fe`](https://github.com/mohamedwael201193/ninety/commit/0a511fe58dd90e00c52504f9e91a6d44729cab7c).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`825a026`](https://github.com/mohamedwael201193/ninety/commit/825a0265a9c05dd265311d99c8ce13806a5911a5) Evidence: run records for #39, #40, #41 and the letter PR, with an ind | success: All 17 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/e7a4159c-fc42-4924-ae8b-bf4b02c2fca6) |
| [`743e93d`](https://github.com/mohamedwael201193/ninety/commit/743e93d32dc968634ea82a1443b5a90c836f3eb5) Letter: evidence is a real accessible table (date, your dates, EES fig | success: All 17 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/6d734ee2-5e0d-4e8b-9156-e8d6fccc3643) |

## Iteration 37: [#41](https://github.com/mohamedwael201193/ninety/pull/41) Landing: the 180-day band follows the scenario, illustrations are labelled, and a not-covered notice (red, then green: app defect)

Merged 2026-10-20 06:43 UTC as [`68ff6a5`](https://github.com/mohamedwael201193/ninety/commit/68ff6a56df29261fbf00515ac8f2823400179d74).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`90d4f2c`](https://github.com/mohamedwael201193/ninety/commit/90d4f2c448b3d5f8b399cc47f2602b93e4f5591c) Not-covered notice on /, /ees and /letter: long-stay visas, residence  | failure: 14/15 passed · 1 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/d3b95b00-ab77-4d40-9a71-cf53c211b0be) |
| [`a545274`](https://github.com/mohamedwael201193/ninety/commit/a545274ba764cbc032b795469b9da74b02078174) Merge remote-tracking branch 'origin/main' into b-landing | failure: 16/17 passed · 1 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/33ed3b0a-7019-4f8f-893a-30034a41cb1a) |
| [`bcbb7de`](https://github.com/mohamedwael201193/ninety/commit/bcbb7de973ab7403e34c9229986f7431c455ee1b) ?fresh=1 is consumed: clear trips once and drop the flag from the addr | failure: 16/17 passed · 1 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/029f8467-6cf1-4223-a498-dce441ca201f) |
| [`e7f9627`](https://github.com/mohamedwael201193/ninety/commit/e7f96272ab9cb9801781c8746c2e62958c057d51) TS18: wait for the letter panel and read each evidence cell by test id | failure: 16/17 passed · 1 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/a154dad3-ef13-4eeb-b0c8-430f61dafca3) |
| [`bdb0527`](https://github.com/mohamedwael201193/ninety/commit/bdb0527b78825cc56d18cbfed3a51198b3ba1ee0) Letter evidence table: four column headers over four plain cells, so e | success: All 17 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/62700579-5b62-45f6-a582-4601def93836) |

Run history: 2026-10-20T05:49Z 14/15 (failed TC011) → 2026-10-20T06:21Z 16/17 (failed TC011) → 2026-10-20T06:28Z 16/17 (failed TS18) → 2026-10-20T06:34Z 16/17 (failed TS18) → 2026-10-20T06:38Z 17/17.

## Iteration 38: [#28](https://github.com/mohamedwael201193/ninety/pull/28) EES findings: show each finding's code next to its label

Merged 2026-10-20 06:55 UTC as [`ce35154`](https://github.com/mohamedwael201193/ninety/commit/ce351540a5c41ea04e94f163ad8fe77a47f5fc87).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`1787170`](https://github.com/mohamedwael201193/ninety/commit/1787170dcfd623f646f24e653701fd166fe10001) EES findings: show each finding's code next to its label | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/4a41007c-d3ba-4284-aaac-90bb60f73df2) |
| [`6675a0f`](https://github.com/mohamedwael201193/ninety/commit/6675a0fdd7c2c63db2bda029553010dd7a502b1e) EES code tags: 11px full-ink text for contrast (QA nit); QA evidence | success: All 17 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/c84e6cda-2c3c-4a9e-adc6-48e85eca0a4e) |

## Iteration 39: [#32](https://github.com/mohamedwael201193/ninety/pull/32) Smooth scroll on the landing page only; the letter box scrolls with the wheel (red, then green: test plan or CI)

Merged 2026-10-20 07:06 UTC as [`261e5bb`](https://github.com/mohamedwael201193/ninety/commit/261e5bb919b933b8a7b4593cc8ed54ee476f7f70).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`751093c`](https://github.com/mohamedwael201193/ninety/commit/751093c0e32b289d299ff543b70b3f6f8c86a33f) Letter box: always scroll with the mouse wheel (data-lenis-prevent) | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/821ff5d3-9403-4da1-a2c5-f4b55deeff70) |
| [`9dd3a70`](https://github.com/mohamedwael201193/ninety/commit/9dd3a702fcbea30eb44d3809334a9a852756f203) Merge main into b-smooth-scroll-landing (keep the evidence table and d | failure: 15/17 passed · 2 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/f4cdf5a3-e8d5-48a6-a7d0-b98a7ea054e1) |
| [`bf29e75`](https://github.com/mohamedwael201193/ninety/commit/bf29e755e14b99064abf8c7b26c07b476955fd85) TestSprite plans: TC011 reloads with a real browser refresh; TS18 read | success: All 17 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/e5e073b9-bc93-4e43-b96c-61f7269a13bf) |

Run history: 2026-10-19T04:45Z 14/14 → 2026-10-20T06:57Z 15/17 (failed TC011, TS18) → 2026-10-20T07:03Z 17/17.

## Iteration 40: [#33](https://github.com/mohamedwael201193/ninety/pull/33) Hero phone: dock the EES card so it doesn't cover the phone UI

Merged 2026-10-20 07:07 UTC as [`141adda`](https://github.com/mohamedwael201193/ninety/commit/141adda3ece8ab58a7c1bcf9b9fc202c98dfc99e).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`2b8f485`](https://github.com/mohamedwael201193/ninety/commit/2b8f485f0e34736a5bf76b786d85bcc8cf294b33) Hero phone: the EES card is in the first paint and the loop only runs  | success: All 14 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/7fbc606b-3508-4539-8a45-4b650170afc5) |
| [`2c2f6be`](https://github.com/mohamedwael201193/ninety/commit/2c2f6be7e273301d35bc0c6da6d6747df7ea5ede) Watchdog fixes: demo letter prefills the EES side; hero note separates | success: All 17 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/1d157115-88fc-4f3c-a94f-a913f56a7a7b) |

## Iteration 41: [#43](https://github.com/mohamedwael201193/ninety/pull/43) Band counters show the real figure from the first paint (0/0 on /?scenario=demo) (red, then green: test plan or CI)

Merged 2026-10-20 07:25 UTC as [`db73594`](https://github.com/mohamedwael201193/ninety/commit/db73594f74076e4bb35166d4c753702752c2106b).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`a4a0362`](https://github.com/mohamedwael201193/ninety/commit/a4a036270b628498aefe4aa63cce8f0ffe26250c) Band counters show the real figure from the first paint, not 0 until s | success: All 17 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/d66e71a5-5887-43da-9384-2ed40f4742bd) |
| [`d4f019c`](https://github.com/mohamedwael201193/ninety/commit/d4f019c6cb1fbd1c3e6e73de326c0b5b3b1db7c3) Band counters: drop the count-up, the real figures never dip to 0 on s | failure: 16/17 passed · 1 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/7cf3f5d1-d950-4b7b-884e-95b8a72ea9f6) |
| [`7fdf4fc`](https://github.com/mohamedwael201193/ninety/commit/7fdf4fc7694f2e807931e6755dc75527e8cc7c05) Letter evidence cells name the unit: 88 days, 90 days, 2 days (TS18 st | success: All 17 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/6a8fed14-7b03-4289-87ba-9602de08a038) |

Run history: 2026-10-20T07:09Z 17/17 → 2026-10-20T07:15Z 16/17 (failed TS18) → 2026-10-20T07:21Z 17/17.

## Iteration 42: [#44](https://github.com/mohamedwael201193/ninety/pull/44) Engine rewrite (interval presence) + TestSprite official action, JUnit, run ledger and receipts (run could not complete, then green)

Merged 2026-10-20 07:34 UTC as [`4aa0092`](https://github.com/mohamedwael201193/ninety/commit/4aa009251db142be74768eba08861d1350f60587).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`d701a46`](https://github.com/mohamedwael201193/ninety/commit/d701a467079fd9fe28137f4a89d6551409afadbd) Nightly TestSprite run is opt-in (TESTSPRITE_NIGHTLY=true); README rec | failure: 0/17 passed · 17 blocked | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/ce75b9ab-19e5-41b9-b00e-df47b8518ce7) |
| [`fbfc7cd`](https://github.com/mohamedwael201193/ninety/commit/fbfc7cdc7456b4ea476f3358c5827a714ccfef65) vercel.json: skip only production builds of CI/docs-only commits; prev | success: All 17 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/5ed4e7c0-7c20-451e-9b81-776a18c207f4) |

Run history: 2026-10-20T07:27Z 0/17 (failed TS01, TS02, TS03, TS04, TS05, TS06, TS07, TS08, TC009, TC010, TC011, TS09, TS10, TS26, TS16, TS17, TS18) → 2026-10-20T07:31Z 17/17.

## Iteration 43: [#45](https://github.com/mohamedwael201193/ninety/pull/45) Skip stored trips whose exit is before the entry

Merged 2026-10-20 07:39 UTC as [`45af78a`](https://github.com/mohamedwael201193/ninety/commit/45af78ad7f1d5fdb932541244c0b08d288245a3a).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`9913986`](https://github.com/mohamedwael201193/ninety/commit/9913986f68c5263ba6833c6f7b232bf9684a3d98) Skip stored trips whose exit is before the entry | success: All 17 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/4abc5d0a-f343-436c-849b-b26d88a485b9) |

## Iteration 44: [#46](https://github.com/mohamedwael201193/ninety/pull/46) Security headers on every route

Merged 2026-10-20 07:45 UTC as [`efd6e50`](https://github.com/mohamedwael201193/ninety/commit/efd6e505947e712636174407c6a31e06a673455b).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`7031145`](https://github.com/mohamedwael201193/ninety/commit/7031145361561a0d310a8a35d4798684299d4616) Security headers on every route: no framing by other sites, no referre | success: All 17 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/851501fb-73ff-42e7-a22f-44398ce2e5d0) |

## Iteration 45: [#47](https://github.com/mohamedwael201193/ninety/pull/47) EES and letter pages: the reference date appears only after mount

Merged 2026-10-20 07:52 UTC as [`2473ecf`](https://github.com/mohamedwael201193/ninety/commit/2473ecfcd97cfaf71ad76fed352bea844adf4987).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`95a3fe3`](https://github.com/mohamedwael201193/ninety/commit/95a3fe311b8c4e534222a632d354985fcd18a7c8) EES and letter pages: the reference date appears only after mount, so  | success: All 17 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/c7b0a7e0-be0c-4248-b727-9a0959a7c14c) |

## Iteration 46: [#48](https://github.com/mohamedwael201193/ninety/pull/48) TestSprite: EES and calculator suites, 10 new cloud tests (17 → 27)

Merged 2026-10-20 07:57 UTC as [`1bb11e5`](https://github.com/mohamedwael201193/ninety/commit/1bb11e52a5e6a58969d742917223d466072c9f6f).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`54e6465`](https://github.com/mohamedwael201193/ninety/commit/54e64655708cda11965b7ea238c3c4648419bc0a) TestSprite: create the 10 EES and calculator cloud tests; ids recorded | success: All 27 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/15eb85a6-f6d3-4826-87f2-5b2dbba84eb4) |

## Iteration 47: [#49](https://github.com/mohamedwael201193/ninety/pull/49) Accessibility: AA contrast tokens, valid status <dl>, describedby only for messages that exist

Merged 2026-10-20 08:05 UTC as [`0a47271`](https://github.com/mohamedwael201193/ninety/commit/0a472715c59ba0eb5ce7b87caa24408ce4b401c8).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`8e26370`](https://github.com/mohamedwael201193/ninety/commit/8e26370bbe9563919f8a83ca05586387da906e20) DateField: aria-describedby only names messages that exist | success: All 27 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/40e653f7-fa09-411f-9c35-7a5b5446ddce) |

## Iteration 48: [#50](https://github.com/mohamedwael201193/ninety/pull/50) /proof rule-to-test matrix, scenario gallery, focusable wide tables; planned verdict clears the phone bar

Merged 2026-10-20 08:19 UTC as [`c4dd8fe`](https://github.com/mohamedwael201193/ninety/commit/c4dd8fe730bfd340533bdde2d8f4cf65aff04d1d).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`eac2a51`](https://github.com/mohamedwael201193/ninety/commit/eac2a51f9abf76766d36265d75c9ad03c0ee1866) Planned-trip verdict scrolls into view above the phone's bottom bar; T | success: All 29 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/bb3418b8-3d88-4ae1-a3be-1a9ac55ae010) |
| [`cead0be`](https://github.com/mohamedwael201193/ninety/commit/cead0be7822fc127338f2430eadfaad662572dc8) Gallery: a card whose used and left exceed 90 says why (old days drop  | success: All 29 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/414b65f0-b089-469b-a793-5d581bfc4b65) |

## Iteration 49: [#51](https://github.com/mohamedwael201193/ninety/pull/51) EES: 10 April 2026 cutoff card on /ees with two worked examples (TS38)

Merged 2026-10-20 08:26 UTC as [`a8efa54`](https://github.com/mohamedwael201193/ninety/commit/a8efa54a3f9bbcdda215714cb5e00ed758b02d82).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`1caef69`](https://github.com/mohamedwael201193/ninety/commit/1caef69e93f25e592d5179fefeccf91af7d555cd) TestSprite: create TS38 cutoff card cloud test (suite 30) | success: All 30 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/3c67752f-345a-4800-a6ee-562d47538166) |

## Iteration 50: [#52](https://github.com/mohamedwael201193/ninety/pull/52) axe-core accessibility check in CI; 404 page that leads back to every page (TS40)

Merged 2026-10-20 08:33 UTC as [`96a91af`](https://github.com/mohamedwael201193/ninety/commit/96a91afeecbf2794061f271133982ee8e2257f26).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`a3e893d`](https://github.com/mohamedwael201193/ninety/commit/a3e893dc48cfe131eb3fa8aeca8d7cccceff30fd) TestSprite: create TS40 404 cloud test (suite 31); #51 QA evidence | success: All 31 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/fd325f19-da88-439a-9243-160837ede547) |

## Iteration 51: [#53](https://github.com/mohamedwael201193/ninety/pull/53) Nav: page links stay visible on phones, current page marked (TS39)

Merged 2026-10-20 08:40 UTC as [`a46c109`](https://github.com/mohamedwael201193/ninety/commit/a46c10941b25e766806d972b611c2bc82dc452f9).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`edd707a`](https://github.com/mohamedwael201193/ninety/commit/edd707a32de448dbcaae708714992e9014478d80) TestSprite: create TS39 phone-nav cloud test (suite 32); #52 QA eviden | success: All 32 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/8c9f2d28-dbdc-46a5-917d-a0677d26d1fb) |

## Iteration 52: [#54](https://github.com/mohamedwael201193/ninety/pull/54) Page metadata, sitemap and robots, footer links; truthful /proof summary; Check/Plan keep the scenario

Merged 2026-10-20 08:49 UTC as [`ec5d2ba`](https://github.com/mohamedwael201193/ninety/commit/ec5d2ba26e6f87e56dc3ffc25b3dbac374db3f7d).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`bbbff63`](https://github.com/mohamedwael201193/ninety/commit/bbbff6321360810b85732e72b5f97762a9e35897) /proof summary counts only tests that ran (matrix regenerated: 25/25 p | success: All 32 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/18bb1fb1-05f1-42c6-bb4d-a9d4755ba0ba) |

## Iteration 53: [#55](https://github.com/mohamedwael201193/ninety/pull/55) Trip sheet keeps focus and makes the page inert; impossible calendar dates are named (TS21, TS41, TS42) (red, then green: app defect)

Merged 2026-10-20 12:03 UTC as [`fbf4b64`](https://github.com/mohamedwael201193/ninety/commit/fbf4b6495a89dbd5d0c2055db8936da9525f524e).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`5864646`](https://github.com/mohamedwael201193/ninety/commit/58646461bb6ef508e7da89b8224d0ea408cb1219) TestSprite: create TS21, TS41, TS42 (suite 35); proof generator treats | failure: 34/35 passed · 1 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/0c017d10-c7fd-453d-9928-04c02c373516) |
| [`515379b`](https://github.com/mohamedwael201193/ninety/commit/515379ba6b2ff4a7d21bb4d0a89bdb42366e7e6a) Fix: sheet captures the opener once per open, keeps onClose in a ref,  | failure: 32/35 passed · 2 failed · 1 blocked | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/06e10b14-0d90-4f37-9ef5-294abd39e5b3) |
| [`ff0a76d`](https://github.com/mohamedwael201193/ninety/commit/ff0a76d99c20fcead71712bd2b617e17996e287c) Fix: the sheet tracks its opener with focusin, so an autofocused field | failure: 32/35 passed · 3 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/6e03fb2b-035e-4213-b818-e80d186d7e93) |
| [`815cc79`](https://github.com/mohamedwael201193/ninety/commit/815cc796e31757c7c39e0519290d79115ed1dc05) TestSprite plans: TS34/TS42 read the calculator's days-used tile (not  | success: All 35 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/2ad24d06-aac8-4aba-914c-a335b121894c) |

Run history: 2026-10-20T08:51Z 34/35 (failed TS41) → 2026-10-20T08:58Z 32/35 (failed TS39, TS41, TS42) → 2026-10-20T09:10Z 32/35 (failed TS34, TS41, TS42) → 2026-10-20T11:56Z 35/35.

## Iteration 54: [#56](https://github.com/mohamedwael201193/ninety/pull/56) README receipts at 35/35, portal evidence, and the phone nav fade follows resizes

Merged 2026-10-20 15:33 UTC as [`c23e7c0`](https://github.com/mohamedwael201193/ninety/commit/c23e7c059b1f2f6f69aeaf6f8f2a00703fcfab8b).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`43d4ad0`](https://github.com/mohamedwael201193/ninety/commit/43d4ad0c11f034aee7aae6cfcffc849f4d7c049b) README: 35 TestSprite tests, 35/35 on the latest run, bugs fixed in #3 | success: All 35 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/7159e613-a019-4680-9f36-a934cf3c8aa5) |

## Iteration 55: [#57](https://github.com/mohamedwael201193/ninety/pull/57) TestSprite: 8 plans for review bugs, red first (TS45–TS52), then the fixes (red, then green: app defect)

Merged 2026-10-20 22:24 UTC as [`396d6d9`](https://github.com/mohamedwael201193/ninety/commit/396d6d9690b6d6cbddc21a4ceba854a6d633fbff).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`78ee487`](https://github.com/mohamedwael201193/ninety/commit/78ee487ff8e33740cbec59465e7ca97237787757) test(testsprite): TS45-TS52 plans for review bugs (bugs present, red o | failure: 34/43 passed · 8 failed · 1 blocked | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/c454e890-8648-4e1b-a723-dadde8f7a5c2) |
| [`dae0081`](https://github.com/mohamedwael201193/ninety/commit/dae00815749666ebcdce147abd640bb47e260eac) parity: 412 scenarios against the vendored Commission script, 399/400  | failure: 42/43 passed · 1 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/b7193abb-d3f1-4e7c-ad94-18f2f642a791) |
| [`1963cc1`](https://github.com/mohamedwael201193/ninety/commit/1963cc1923403756491778893cea9e960dd2c32b) parity: when the server cannot load the live Commission page as the ca | success: All 43 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/0036443d-b4c7-413f-99ee-88a00a001036) |

Run history: 2026-10-20T21:56Z 34/43 (failed TS02, TS45, TS46, TS47, TS48, TS49, TS50, TS51, TS52) → 2026-10-20T22:02Z 42/43 (failed TS02) → 2026-10-20T22:09Z 43/43.

## Iteration 56: [#60](https://github.com/mohamedwael201193/ninety/pull/60) Judge review: consistent SHAs/UTC, honest parity wording, backend portal evidence, loop counts split by cause (red, then green: UX loading state)

Merged 2026-10-20 23:18 UTC as [`9f781f6`](https://github.com/mohamedwael201193/ninety/commit/9f781f69e9f9d33c64e869185bfa8905b5df6fb7).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`1abce4c`](https://github.com/mohamedwael201193/ninety/commit/1abce4ca1840a9a1843e24bff575f6e77338ed15) Judge review fixes: main SHAs and UTC in README, honest /parity and he | failure: 42/43 passed · 1 failed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/1f423c16-9271-4530-bbd6-11c6ec403bef) |
| [`9a0c897`](https://github.com/mohamedwael201193/ninety/commit/9a0c89725e6404dd115c51080b8139553f6d6896) Days used is never blank before trips load (caught by TestSprite TS42  | success: All 43 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/eba1bf9c-2c9c-4a6a-8711-79b4955b870a) |

Run history: 2026-10-20T22:59Z 42/43 (failed TS42) → 2026-10-20T23:16Z 43/43.

## Iteration 57: [#61](https://github.com/mohamedwael201193/ninety/pull/61) Judge review 2: exact loop wording, TS42 as UX, noscript, backend TestSprite gate on previews

Merged 2026-10-20 23:57 UTC as [`392a265`](https://github.com/mohamedwael201193/ninety/commit/392a265bc5059f5c22a6436adc236029c6c456e8).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`f888bb6`](https://github.com/mohamedwael201193/ninety/commit/f888bb6dca7ffd15369a4b7e8438e9b77326546f) Judge review 2: exact 11+1=12 wording, TS42 as a UX loading state (7 a | success: All 43 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/d5ce97c4-05b4-4d90-b30f-7b62d893514a) |

## Iteration 58: [#62](https://github.com/mohamedwael201193/ninety/pull/62) Backend TestSprite gate on Vercel status; ?fresh=1 clears the landing band

Merged 2026-10-21 00:16 UTC as [`a777c3b`](https://github.com/mohamedwael201193/ninety/commit/a777c3bb27fda82b02d5bdfd8412939244869312).

| Commit | TestSprite V3 | Execution |
|---|---|---|
| [`a5f6bde`](https://github.com/mohamedwael201193/ninety/commit/a5f6bde0b0cdfa3a833d18d0f0f6d6099ce7a66e) Backend TestSprite gate waits on Vercel's commit status (deployment_st | success: All 43 tests passed | [run](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/b43fc678-1b47-4f4f-9c4c-cd08eb76daac) |
