# Saboteur — competitor review

| | |
|---|---|
| Name | Saboteur |
| Repo | https://github.com/zkasuran/saboteur |
| Live | https://saboteur-cyan.vercel.app/ |
| TestSprite PRs | [#1](https://github.com/zkasuran/saboteur/pull/1) (merged), [#2](https://github.com/zkasuran/saboteur/pull/2) (closed, unmerged), also [#3](https://github.com/zkasuran/saboteur/pull/3) and [#4](https://github.com/zkasuran/saboteur/pull/4) (merged, not in the prompt list) |
| Demo | none (no video, no GitHub release) |
| Review date | 2026-10-23 |
| Reviewer model | Grok 4.7 |
| Inspected git | `main` @ [`3466217`](https://github.com/zkasuran/saboteur/commit/3466217) (clone `--depth 200`) |
| TestSprite project | `4fa4606f-0595-4ceb-9cd2-c6731b13e1c9` (org `517fb9d2-693e-50dc-bc21-ed604b032c75`), named in [`public/report.json`](https://github.com/zkasuran/saboteur/blob/main/public/report.json) |

Saboteur is a mutation study of a TestSprite suite: a Vite store (“Kiln”) with 14 flagged bugs, a local CLI runner that replays the suite with auto-heal off, and a public kill matrix. It is a strong rival on TestSprite meta-depth. It is a thin product, and several headline sentences are stronger than the artifacts.

## What it is

Saboteur asks whether a green TestSprite run would fail if the app broke. The user is someone who already has a generated UI suite and wants a kill score, not a shopper. The live site is a ceramics store plus a report. Nothing is sold. Fourteen one-line faults sit behind `/x/m01/` … `/x/m14/`. A runner points the TestSprite environment at each build and replays the saved suite. A fault is caught only when a test that passed on the clean build fails on the sabotaged one. The published result is 5 of 14 for the generated suite and 14 of 14 after tests were added for the survivors. Source: [README](https://github.com/zkasuran/saboteur/blob/main/README.md), [`src/saboteur/catalog.ts`](https://github.com/zkasuran/saboteur/blob/main/src/saboteur/catalog.ts).

## Architecture

Stack from [`package.json`](https://github.com/zkasuran/saboteur/blob/main/package.json): Vite `8.3.4`, TypeScript `6.0.3` (`strict`, `noUnusedLocals`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` in [`tsconfig.json`](https://github.com/zkasuran/saboteur/blob/main/tsconfig.json)), Vitest `5.0.5`, Playwright `1.63.0` as a devDependency for [`scripts/e2e.mjs`](https://github.com/zkasuran/saboteur/blob/main/scripts/e2e.mjs). No React, no server, no database. Node `>=22`. Deployed on Vercel (`Server: Vercel` on the live response; [`vercel.json`](https://github.com/zkasuran/saboteur/blob/main/vercel.json) SPA rewrite to `index.html`, security headers). Production HTML injects a hash-locked CSP (`default-src 'none'`) from [`vite.config.ts`](https://github.com/zkasuran/saboteur/blob/main/vite.config.ts).

| Module | Role |
|---|---|
| [`src/saboteur/catalog.ts`](https://github.com/zkasuran/saboteur/blob/main/src/saboteur/catalog.ts) | 14 faults, `locate()` (`^m\d{2}$` only), `Saboteur.isOn()` |
| [`src/shop/shop.ts`](https://github.com/zkasuran/saboteur/blob/main/src/shop/shop.ts) | Pricing, cart, checkout in integer cents; one `isOn()` per fault |
| [`src/shop/storage.ts`](https://github.com/zkasuran/saboteur/blob/main/src/shop/storage.ts) | `localStorage` cart, size cap, hostile-input checks; `cart-forgets` |
| [`src/views/store.ts`](https://github.com/zkasuran/saboteur/blob/main/src/views/store.ts) | Store UI; `place-order-dead` returns before submit; plus button calls `setQty(..., true)` |
| [`src/views/site.ts`](https://github.com/zkasuran/saboteur/blob/main/src/views/site.ts) | Home, how, faults, report, docs, method |
| [`src/report/matrix.ts`](https://github.com/zkasuran/saboteur/blob/main/src/report/matrix.ts) | Score + schema. Rejects `autoHeal !== false` |
| [`scripts/saboteur.ts`](https://github.com/zkasuran/saboteur/blob/main/scripts/saboteur.ts) | CLI wrapper: `envs`, `run` (`--no-auto-heal`), `report` |
| [`testsprite/code/`](https://github.com/zkasuran/saboteur/tree/main/testsprite/code) | 28 Playwright files TestSprite is meant to replay |
| [`public/report.json`](https://github.com/zkasuran/saboteur/blob/main/public/report.json) | Both matrices. Live copy is byte-identical (SHA-256 `0ebf635051ebf80b…`, 114659 bytes, 2026-10-23) |

Routes registered in source: `/`, `/how`, `/faults`, `/report`, `/docs`, `/method`, `/shop`, `/shop/:slug`, `/cart`, `/checkout`, `/order/:id`.

## TestSprite integration depth

**Depth score: 8 / 10.** The GitHub App is on every PR, one regression stayed unmerged with `mergeStateStatus=BLOCKED`, the suite and the replay code are in git, and a local runner replays 15 environments with auto-heal off and publishes a cell-level matrix (658 unique run ids). Missing against a 9–10: no Actions workflow, no schedule, no MCP, no re-run on `main`, and TestSprite posted GitHub `success` on three commits whose descriptions say tests failed. The 14/14 figure is a second local replay after the code was pinned, not a CI job.

### GitHub App check `TestSprite V3`

Not a file under `.github/workflows`. `gh api repos/zkasuran/saboteur/actions/workflows` returned `total_count: 0` (2026-10-23). The check is a commit status from the TestSprite app. Bot comments use `<!-- testsprite-v3-marker -->`.

There is no TestSprite status on the merge commits to `main` ([`eb0b335`](https://github.com/zkasuran/saboteur/commit/eb0b3359c52e2f791141d2685faca2d25b0a492c) Vercel only; [`3466217`](https://github.com/zkasuran/saboteur/commit/3466217) Vercel only). The app runs on PR heads, not on the default branch after merge.

| Commit | PR | Description on the status | GitHub state | Execution |
|---|---|---|---|---|
| [`50cf9c0`](https://github.com/zkasuran/saboteur/commit/50cf9c0ea18f7dda55009ba253f540a113b7009b) | [#1](https://github.com/zkasuran/saboteur/pull/1) | `27/28 passed · 1 failed` | **success** | [70cbf75f](https://www.testsprite.com/dashboard-v3/o/517fb9d2-693e-50dc-bc21-ed604b032c75/projects/4fa4606f-0595-4ceb-9cd2-c6731b13e1c9/execution/70cbf75f-cf03-4825-aabc-8314b39b3595) |
| [`fc8da26`](https://github.com/zkasuran/saboteur/commit/fc8da2605aeacfa0a3f0ddaca30e3a82369738d9) | #1 | `27/28 passed · 1 failed` | **success** | [907f5a62](https://www.testsprite.com/dashboard-v3/o/517fb9d2-693e-50dc-bc21-ed604b032c75/projects/4fa4606f-0595-4ceb-9cd2-c6731b13e1c9/execution/907f5a62-2c2b-4b91-b3a7-2c3dfd320b4c) |
| [`4b545e0`](https://github.com/zkasuran/saboteur/commit/4b545e07a3a82d62f0425b592b5a3b787e89d67b) | #1 | `22/28 passed · 2 failed · 4 blocked` | **success** | [bc73ef7b](https://www.testsprite.com/dashboard-v3/o/517fb9d2-693e-50dc-bc21-ed604b032c75/projects/4fa4606f-0595-4ceb-9cd2-c6731b13e1c9/execution/bc73ef7b-110e-4fd0-93a5-bd3f00c36fa3) |
| [`caed1f3`](https://github.com/zkasuran/saboteur/commit/caed1f3996b7890cca92c31aae99fcb46883f732) | #1 head, merged | `All 28 tests passed` | success | [b503b55d](https://www.testsprite.com/dashboard-v3/o/517fb9d2-693e-50dc-bc21-ed604b032c75/projects/4fa4606f-0595-4ceb-9cd2-c6731b13e1c9/execution/b503b55d-782b-4aa5-b433-7ae4cf8264cf) |
| [`c12d416`](https://github.com/zkasuran/saboteur/commit/c12d416508db2dab937d1bcb6649077ef16bfa1f) | [#2](https://github.com/zkasuran/saboteur/pull/2) | `23/28 passed · 5 failed` | **failure** | [d4429ce0](https://www.testsprite.com/dashboard-v3/o/517fb9d2-693e-50dc-bc21-ed604b032c75/projects/4fa4606f-0595-4ceb-9cd2-c6731b13e1c9/execution/d4429ce0-4f09-4856-b6bd-654b053362a0) |
| [`50c4d9a`](https://github.com/zkasuran/saboteur/commit/50c4d9a8440fba6fb037543bf6c1376413860816) | [#3](https://github.com/zkasuran/saboteur/pull/3) head | `All 28 tests passed` | success | [5a0dd1c7](https://www.testsprite.com/dashboard-v3/o/517fb9d2-693e-50dc-bc21-ed604b032c75/projects/4fa4606f-0595-4ceb-9cd2-c6731b13e1c9/execution/5a0dd1c7-0e97-4075-8fdb-8cbe2a4517e3) |
| [`1d90083`](https://github.com/zkasuran/saboteur/commit/1d900839f43d43f1f5ab29f9b0653a5c2bf75506) | [#4](https://github.com/zkasuran/saboteur/pull/4) head | `All 28 tests passed` | success | [efe6851d](https://www.testsprite.com/dashboard-v3/o/517fb9d2-693e-50dc-bc21-ed604b032c75/projects/4fa4606f-0595-4ceb-9cd2-c6731b13e1c9/execution/efe6851d-d7ec-4507-bccf-b3fd5a73e267) |

`eabbca4` and `a617821` (earlier commits on PR #3) and `95241f8` (earlier commit on PR #4) had an empty status list when read on 2026-10-23. The surviving PR comments are the final edits: [#1 comment](https://github.com/zkasuran/saboteur/pull/1#issuecomment-6257737630) “28 of 28” (created 01:30:43Z, updated 01:32:27Z), [#2 comment](https://github.com/zkasuran/saboteur/pull/2#issuecomment-6257822619) “23 passed, 5 failed, 28 total”.

The five failures on PR #2, from that comment: **Cart subtotal keeps the cents**, **The cart survives a page reload**, **Confirmation charges the cart total**, **Place an order from a cart with an updated quantity**, **Removing one cart line keeps the other**. The first, second, third, and fifth match plans added on PR #1 (`m01`, `m13`, `m10`, `m05`). The fourth is the generated test whose plan was rewritten on PR #1 ([`generated-place-order-updated-qty.json`](https://github.com/zkasuran/saboteur/blob/main/testsprite/plans/generated-place-order-updated-qty.json) asserts exactly `$43.00`). The comment’s error text is the whole-dollar regression: subtotal `$54.00` instead of `$55.50`, receipt `$22.20` instead of `$22.65`, quantity-updated order `$42.00` instead of `$43.00`. The diff is one line in [`shop.ts`](https://github.com/zkasuran/saboteur/pull/2): `const unit = Math.floor(p.priceCents / 100) * 100`.

### Is the check required?

`GET /repos/zkasuran/saboteur/branches/main/protection` → **403**. GraphQL `branchProtectionRules` → **403**. `GET /repos/zkasuran/saboteur/rulesets` → `[]`. The rule text, including “admins included”, is **UNVERIFIED**.

What is visible: PR #2 `mergeStateStatus` is **BLOCKED** (`gh pr view 2`, 2026-10-23), `mergeable` is `MERGEABLE` (no conflict), state `CLOSED`, `mergedAt` null. The only failing status on `c12d416` is `TestSprite V3`. Vercel is success. There are no reviews. The author closed it at 01:42:55Z, about 44 seconds after the failure status (01:42:11Z), and [wrote](https://github.com/zkasuran/saboteur/pull/2#issuecomment-6257861323) that GitHub blocked the merge. BLOCKED on a conflict-free PR whose only red status is TestSprite is the evidence the merge was refused. It does not prove the rule covers admins, and it does not prove every failing execution blocks: the three #1 commits above carried failing descriptions and GitHub state `success`.

### CLI

[`scripts/saboteur.ts`](https://github.com/zkasuran/saboteur/blob/main/scripts/saboteur.ts) shells out to `testsprite` with an argument array. `run` always passes `test rerun --all --project … --no-auto-heal --wait --timeout 1800 --summary-file`. `--single-env` (Starter: one environment) retargets `default` with `project env update` to `/x/mNN/shop`, then restores the clean URL in a `finally`. Without that flag it replays `saboteur-mNN` environments two at a time. `report` refuses to write a document `parseReport` rejects, including any run with auto-heal on.

No workflow runs this script. The matrices in `runs/generated-suite/` and `runs/after-pr-1/` are committed CLI summaries, produced locally. CLI version is not pinned in the repo. A deleted ledger on [`4b545e0`](https://github.com/zkasuran/saboteur/blob/4b545e07a3a82d62f0425b592b5a3b787e89d67b/.hq/LEDGER.md) says CLI `0.14.0` as of 2026-10-19 morning.

### MCP

No TestSprite MCP config, no `.cursor`, no `mcp.json`. Grep of the repo for `mcp` in ts/json/md/yml: no matches.

### Plans and code in git

| Path | Count | What |
|---|---|---|
| [`testsprite/plans/`](https://github.com/zkasuran/saboteur/tree/main/testsprite/plans) | **10** JSON | 9 survivor plans (`m01` `m02` `m05` `m07` `m08` `m10` `m11` `m13` `m14`) plus `generated-place-order-updated-qty.json`. The other 18 generated plans are not in git. |
| [`testsprite/code/m*.py`](https://github.com/zkasuran/saboteur/tree/main/testsprite/code) | **9** | Hand-written, `page.goto("VAR_{url}")`, exact `data-testid` amounts. [`m10-confirmation-total.py`](https://github.com/zkasuran/saboteur/blob/main/testsprite/code/m10-confirmation-total.py) asserts `$18.50`, `-$1.85`, `$6.00`, `$22.65`. |
| [`testsprite/code/generated/`](https://github.com/zkasuran/saboteur/tree/main/testsprite/code/generated) | **19** | Repaired generated code. Every executable `goto` is `VAR_{url}` (28/28 files). |
| [`runs/generated-suite/`](https://github.com/zkasuran/saboteur/tree/main/runs/generated-suite) | 1 suite list + clean + `m01`–`m14` | Matrix 1 summaries |
| [`runs/after-pr-1/`](https://github.com/zkasuran/saboteur/tree/main/runs/after-pr-1) | same shape | Matrix 2 summaries |
| [`runs/fresh/summary.json`](https://github.com/zkasuran/saboteur/blob/main/runs/fresh/summary.json) | 19 runs, one execution | Fresh generated suite, 19 passed / 0 failed |

`suite.json` `createdFrom` is `cli` for all 19 and, after the additions, all 28. List `status` is `passed` for all 28 in the after file.

### Triage, schedules, red→green

- Triage is the TestSprite PR comment (failed-test names, screenshots, a “Suggested Fix Prompt”). No issues (`gh issue list` empty). No auto-fix bot of theirs. No run-ledger workflow.
- Schedules: none. No cron, no `workflow_dispatch`.
- Red→green on PR #1 is real as descriptions, and messy as a gate:
  1. `50cf9c0` 27/28, state success.
  2. `fc8da26` 27/28, state success. Commit message says this tightened the receipt test and fixed a generated test that wanted a shipping picker. The surviving bot comment was overwritten, so the failing test name is the commit message, not a status field.
  3. `4b545e0` (the receipt itemisation) **22/28, 2 failed, 4 blocked, state success**. The README table skips this status.
  4. `caed1f3` (ledger removal, not a product change) **28/28**, state success. That is the merged head. Bot comment: [28 of 28](https://github.com/zkasuran/saboteur/pull/1#issuecomment-6257737630).
- PR #2 is the red that stayed red: 23/28, state failure, PR closed unmerged, `mergeStateStatus=BLOCKED`.
- PR #3 and #4 heads: 28/28 success.

### Credits

From the deleted ledger at [`4b545e0:.hq/LEDGER.md`](https://github.com/zkasuran/saboteur/blob/4b545e07a3a82d62f0425b592b5a3b787e89d67b/.hq/LEDGER.md) (removed in the next commit, [`caed1f3`](https://github.com/zkasuran/saboteur/commit/caed1f3996b7890cca92c31aae99fcb46883f732)): Starter plan, 800 credits at start, “400/mo”, frontend rerun 0.5 credits, backend rerun 0.2. README arithmetic: a 28-test matrix (clean + 14 faults) ≈ 15 × 28 × 0.5 = 210 credits ([README](https://github.com/zkasuran/saboteur/blob/main/README.md)). No `testsprite usage` receipt is in the repo. Actual spend is **UNVERIFIED**. The same ledger says the repo was still private and `./verify.sh` had already reported 41 vitest tests that morning, before the matrices.

### Matrix scores recomputed 2026-10-23 from `public/report.json`

Scoring matches [`scoreRun`](https://github.com/zkasuran/saboteur/blob/main/src/report/matrix.ts): a kill is a test `passed` on the baseline and `failed` or `blocked` on the fault. Both runs have `autoHeal: false` and `origin: https://saboteur-cyan.vercel.app`.

**Generated suite** (`generatedAt` 2026-10-19T00:43:58.684Z): 19 tests. Baseline **17 passed, 2 failed** (`Add a product to the cart from the product page`, `Sort the catalog by price`). Caught **5/14**: m03, m04, m06, m09, m12. Survived: m01, m02, m05, m07, m08, m10, m11, m13, m14. Same totals in [`runs/generated-suite/clean.json`](https://github.com/zkasuran/saboteur/blob/main/runs/generated-suite/clean.json) (`passed: 17, failed: 2, total: 19`). 14 × 19 = 266 run ids, all present, all unique inside this run.

**After PR #1** (`generatedAt` 2026-10-19T02:13:15.087Z): 28 tests, baseline **28/28 passed**. Caught **14/14**. [`runs/after-pr-1/clean.json`](https://github.com/zkasuran/saboteur/blob/main/runs/after-pr-1/clean.json) is `passed: 28, failed: 0, total: 28`. 14 × 28 = 392 run ids. Across both runs, 658 fault-cell run ids, 658 unique.

The fresh all-green run is a different execution from the matrix baseline: [`runs/fresh/summary.json`](https://github.com/zkasuran/saboteur/blob/main/runs/fresh/summary.json) is 19/19 on [execution ed761fef](https://www.testsprite.com/dashboard-v3/o/517fb9d2-693e-50dc-bc21-ed604b032c75/projects/4fa4606f-0595-4ceb-9cd2-c6731b13e1c9/execution/ed761fef-ce6f-4a60-9cc0-5fa1b9db5dd7). The 5/14 score uses the strict replay, where 2 of 19 were already red, so they cannot count as kills. The README findings table says this. The opening sentence still says the generated suite “was all green and caught 5 of 14”.

## Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
|---|---|---|---|---|
| Planted faults | 14 | 14 ids in `FAULTS`, one `isOn()` each | [catalog.ts](https://github.com/zkasuran/saboteur/blob/main/src/saboteur/catalog.ts), [shop.ts](https://github.com/zkasuran/saboteur/blob/main/src/shop/shop.ts) | VERIFIED (source). Live DOM not re-driven |
| Fresh generated suite | 19, all green | 19/19 passed, 1 execution id | [runs/fresh/summary.json](https://github.com/zkasuran/saboteur/blob/main/runs/fresh/summary.json) | VERIFIED as a stored summary, not re-run |
| Strict replay of that suite | (README: 2 of 19 cannot pass a correct build) | clean 17 passed / 2 failed | [runs/generated-suite/clean.json](https://github.com/zkasuran/saboteur/blob/main/runs/generated-suite/clean.json) | VERIFIED as a stored summary |
| Kill matrix 1 | 5 of 14 | 5 caught, 9 survived | [public/report.json](https://github.com/zkasuran/saboteur/blob/main/public/report.json) recomputed | VERIFIED arithmetic |
| Suite after PR #1 | 28 | 28 ids in the second run; 9 hand-written py + 19 generated py | [testsprite/code](https://github.com/zkasuran/saboteur/tree/main/testsprite/code) | VERIFIED file count |
| Kill matrix 2 | 14 of 14 | 14 caught, baseline 28/28 | same report, label “After PR #1” | VERIFIED arithmetic |
| PR App runs | 28 on every PR; #2 is 23/28 | see the status table | commit statuses | VERIFIED |
| Unit + adversarial | 41 passing | **41 passed / 2 files**, Vitest 5.0.5, 316 ms, 2026-10-23, Node 22.23.4 | local `npx vitest run` after `npm ci` | VERIFIED |
| `tsc -p .` | strict, in `verify.sh` | exit 0, no output | local, same install | VERIFIED |
| `npm audit --audit-level=low` | 0 findings | `found 0 vulnerabilities` | local | VERIFIED |
| Headless e2e | 13 routes × 2 themes × 390 and 1360, clean flow + 11 bugs | 13 routes and 11 fault expectations are in the script (m04, m05, m08 are not in the browser list) | [e2e.mjs](https://github.com/zkasuran/saboteur/blob/main/scripts/e2e.mjs) lines 36 and 138–154 | UNVERIFIED (not executed; Playwright browsers not installed) |
| Runner self-check | `node scripts/saboteur.ts help` exits 0 | not run | [verify.sh](https://github.com/zkasuran/saboteur/blob/main/verify.sh) | UNVERIFIED |

Local run did not use a TestSprite key. `node_modules` was deleted afterwards. Backend tests: none (no Python API suite, no server).

## Claim verification

Claims are the ones in the prompt plus the README sentences they rest on.

| Claim | Verdict | Evidence |
|---|---|---|
| Plants 14 realistic bugs in a live store behind a URL flag | VERIFIED in source and unit tests. Live behaviour not re-clicked | 14 `isOn` sites. `locate()` accepts only `m` + two digits. Vitest “each fault flips exactly its own behaviour” passed. Live `/x/m02/shop` returns the SPA shell (HTTP 200); the bug is client-side |
| Replays the suite against each bug with auto-heal off | VERIFIED as stored artifacts and runner source. CLI not re-executed | `saboteur.ts` always passes `--no-auto-heal`. Both report runs set `autoHeal: false`. Summaries exist for clean and m01–m14 in both `runs/` directories |
| Generated suite, 19 tests, all green, caught 5 of 14 | VERIFIED with a split | Fresh summary 19/19 on [ed761fef](https://www.testsprite.com/dashboard-v3/o/517fb9d2-693e-50dc-bc21-ed604b032c75/projects/4fa4606f-0595-4ceb-9cd2-c6731b13e1c9/execution/ed761fef-ce6f-4a60-9cc0-5fa1b9db5dd7). The matrix that produces 5/14 has baseline 17/19, not 19/19. Score 5/14 recomputed |
| One PR later the suite catches 14 of 14 | PARTLY TRUE | 14/14 is the published second matrix (baseline 28/28). Tests were added in PR #1. The replay that scores 14/14 is dated 2026-10-19T02:13:15Z, on the PR #3 branch, after code was pinned. The note in the report says both. “One PR later” skips that pin |
| TestSprite blocks any PR that ships one of those bugs | FALSE as stated | Shown once: PR #2, whole-dollar prices (the m01 bug class), 5 tests failed, status `failure`, merge BLOCKED. Not shown for the other 13 faults. On PR #1, descriptions `27/28` and `22/28 · 2 failed · 4 blocked` were posted as GitHub **success**, so those executions would not block a merge |
| PR #2 blocked regression, TestSprite 23/28, merge refused | VERIFIED | Status `23/28 passed · 5 failed`, state `failure`, [d4429ce0](https://www.testsprite.com/dashboard-v3/o/517fb9d2-693e-50dc-bc21-ed604b032c75/projects/4fa4606f-0595-4ceb-9cd2-c6731b13e1c9/execution/d4429ce0-4f09-4856-b6bd-654b053362a0). Bot comment lists the five names. `mergeStateStatus=BLOCKED`. Author closed it. Protection-rule text 403 |
| All 5 catching tests came from PR #1; the generated suite alone would have let it through | VERIFIED as names | The five titles are the four new plans plus the rewritten “Place an order…” plan. The committed repaired Python for that generated test no longer asserts `$43.00` (it asserts “Order placed”, “Speckled Mug × 2”, “Total charged”), but the plan does, and the bot saw `$42.00` vs `$43.00`, so the cloud copy at PR time asserted the amount |
| PR runs with auto-heal pinned the preview URL into stored test code | VERIFIED for the 19 generated files’ step metadata. “28 of 28” and “identical 21/28” are stronger than the artifact | 19/19 generated files still contain an absolute preview URL in the `@@ts-step` navigate comment: 18 × `https://saboteur-git-demo-ship-a-bug-zkasuran1.vercel.app/shop` (PR #2), 1 × `https://saboteur-git-tests-kill-survivors-zkasuran1.vercel.app/shop` (PR #1). Executable `goto` is `VAR_{url}` in all 28 files ([`repair_code.py`](https://github.com/zkasuran/saboteur/blob/main/scripts/repair_code.py)). The 9 hand-written files have no preview URL. No committed summary shows 14 builds all scoring 21/28. That matrix was not published |
| Healing weakened a receipt test to the words “Order placed” and “Receipt” | UNVERIFIED | No file in git is that weakened test. Current [`m10-confirmation-total.py`](https://github.com/zkasuran/saboteur/blob/main/testsprite/code/m10-confirmation-total.py) asserts four exact amounts plus “Order placed”. A different generated test, [6d7b5dd6](https://github.com/zkasuran/saboteur/blob/main/testsprite/code/generated/6d7b5dd6-2df0-4c55-861b-97eb9397e343.py), asserts the URL and the word “Receipt” only. That is a weak generated assertion, not a captured heal of “Confirmation charges the cart total” |
| `main` is protected and the check must pass, admins included | UNVERIFIED | 403 on branch protection, empty rulesets. PR #2 BLOCKED is consistent with some required check. “Admins included” has no API evidence |
| README trail `50cf9c0` 27/28, `fc8da26` 27/28, `caed1f3` 28/28 | VERIFIED counts. Incomplete | Those three descriptions match. The README omits `4b545e0` at 22/28 with 2 failed and 4 blocked, and it does not say the 27/28 statuses were GitHub state success |
| 2 of 19 generated tests could not pass a strict replay; causes `select_option("")` and the text `"− 1 +"` | Counts VERIFIED. Causes are the repair script, not the original files | clean.json names the two failures (sort, add-from-product-page). [`repair_code.py`](https://github.com/zkasuran/saboteur/blob/main/scripts/repair_code.py) rewrites those patterns. The pre-repair Python is not in git. Current sort test calls `select_option("price-asc")` |
| A generated test invented a shipping picker | PARTLY VERIFIED | Plan file and [`testsprite/README.md`](https://github.com/zkasuran/saboteur/blob/main/testsprite/README.md) say so. Original plan body is not stored. Commit [`fc8da26`](https://github.com/zkasuran/saboteur/commit/fc8da2605aeacfa0a3f0ddaca30e3a82369738d9) message says the same |
| Unit tests 41, npm audit 0 | VERIFIED | local, 2026-10-23 |
| ~210 credits per 28-test matrix; 0.5 per strict frontend replay | Arithmetic matches the README. Spend UNVERIFIED | 0.5 is in the deleted ledger. No usage log |
| Each hand-written test was run locally, pass on clean and fail on its fault, before upload | UNVERIFIED | stated in [`testsprite/README.md`](https://github.com/zkasuran/saboteur/blob/main/testsprite/README.md). No log |
| e2e: 13 routes, both themes, 390 and 1360, 11 bugs, zero CSP errors | UNVERIFIED as a run. Script matches the counts | [e2e.mjs](https://github.com/zkasuran/saboteur/blob/main/scripts/e2e.mjs). Checkpoint at `4b545e0` claims a live e2e was green that morning; that was before several later commits |

Dashboard pages for the execution ids return HTTP 200 and the TestSprite app shell. The static HTML contains the execution id and does not contain pass/fail counts (client-rendered, and not readable here without a session). Public verification of the PR numbers is the GitHub status description and the bot comment. Public verification of the matrix is the committed JSON.

## Code quality

The store logic is small, typed, and tested at the fault boundary. `verify.sh` is a real gate: `npm ci`, `tsc`, vitest, runner help, `parseReport` on `public/report.json`, production build, CSP grep, e2e, `npm audit`. It is local only. Nothing in GitHub Actions runs it, so a broken unit test does not block a PR. The only PR checks observed are Vercel and TestSprite V3.

Notable points:

- Faults ship in the client bundle. That is the demo. [SECURITY.md](https://github.com/zkasuran/saboteur/blob/main/SECURITY.md) says so, and says `report.json` is unsigned.
- `removeLine` with `remove-wrong-item` drops `lines.slice(1)` whenever there is more than one line, so it ignores which control was clicked. Removing the first line still looks correct. The catalog’s symptom (remove the second, lose the first) is the case that shows the bug.
- Generated replay code is brittle on purpose and still carries absolute preview URLs in comments after the goto repair. A later `code put` of those files would navigate via `VAR_{url}`, which is what they fixed.
- The generated “order confirmation” test asserts the word “Receipt”. That is why m10 survived the first matrix: the dedicated exact-total test did not exist yet.
- No ESLint config, no formatter check, no CI cache, no lockfile diff in CI.
- Licence is [SAND-1.0](https://github.com/zkasuran/saboteur/blob/main/LICENSE) (source-available, no derivatives). Fine for a hackathon entry, awkward if judges want to reuse the runner.
- The 14/14 result is not a blind mutation score. The README says the catalog was known to the tests added in PR #1. The 5/14 result is the blind measurement. The 14/14 result is “a test was written for each survivor, then the replay went green on clean and red on each fault.”

## Live-site behavior

Checked 2026-10-23 with HTTP GET/HEAD. `Server: Vercel`. Cache `public, max-age=0, must-revalidate`, `X-Vercel-Cache: HIT`.

Headers on `/`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` camera/microphone/geolocation/payment/usb disabled, `Strict-Transport-Security: max-age=63072000; includeSubDomains`, CSP `frame-ancestors 'none'`. The HTML also has the build CSP meta (`default-src 'none'`, `script-src 'self'` plus one sha256). Title: `Saboteur · Plant a bug, see if your tests notice`. Assets: `/assets/index-Dj5ME8ZN.js`, `/assets/index-DeRH49Yr.css`.

| URL | Status | Time | Body |
|---|---|---|---|
| `/` `/how` `/faults` `/report` `/docs` `/method` | 200 | 0.03–0.08s | SPA shell, 1501 bytes |
| `/shop` `/shop/speckled-mug` `/cart` `/checkout` | 200 | ~0.04s | same shell |
| `/x/m01/shop` `/x/m02/shop` `/x/m99/shop` `/x/not-a-fault/shop` | 200 | ~0.04s | same shell. Unknown codes are a client 404 view, not an HTTP 404 |
| `/nope` `/api/health` `/does-not-exist-file.js` | 200 | ~0.04s | SPA shell. The rewrite excludes only `assets/`, `report.json`, `favicon.svg`, `robots.txt` |
| `/report.json` | 200 | 0.17s | 114659 bytes, byte-identical to git |
| `/favicon.svg` | 200 | 0.08s | SVG |
| `/robots.txt` | **404** | 0.09s | Vercel `NOT_FOUND`. The rewrite ignores this path and no file is shipped |

No forms were submitted. The promo bug, the kill-matrix UI, and theme switching are client-rendered and were not exercised in a browser. `noscript` says the demo needs JavaScript.

## Demo

No demo video. No GitHub release. The README does not link one. The live site is the walkthrough: kill-matrix page, fault catalog, and `/x/mNN/shop`. Screenshots in [`docs/assets/`](https://github.com/zkasuran/saboteur/tree/main/docs/assets) show the matrix before and after, the m02 store, and the catalog. Length of a video: none.

## Weaknesses / risks for judges

- The gate is inconsistent. Failing descriptions on `50cf9c0`, `fc8da26`, and `4b545e0` were GitHub `success`. Only the 5-failure run was `failure`. “Blocks any PR that ships one of them” is one data point.
- Branch protection is not readable (403). The BLOCKED state is on a closed PR the author intended to close.
- The 14/14 matrix was run by hand after a code pin. It is not a CI artifact. `main` does not re-run TestSprite.
- The immediate post-PR-#1 replay that supposedly scored an identical 21/28 on every fault is not in the repo. The two-word healed receipt test is not in the repo.
- Survivors were killed with tests written against a known catalog. Judges who want a blind second mutation pass will not find one. m04, m05, and m08 are not in the browser e2e.
- Dashboard executions are not publicly readable as data from a logged-out fetch.
- No Actions, no nightly, no MCP, no backend suite, no issue triage. Unit tests do not gate merges.
- The product is a demo store. Faults are URL-reachable in production, by design.
- HTTP 200 for unknown paths, including a fake API and a missing `.js` file. `robots.txt` 404s.
- SAND-1.0 no-derivatives licence.

## Where it beats Ninety

Ninety baseline used here: https://github.com/mohamedwael201193/ninety , live https://ninety-coral.vercel.app , inspected 2026-10-23. Ninety’s own notes: no mutation testing; PR #63 merged while TestSprite V3 was red; branch protection 403; no TestSprite MCP; nightly CLI skipped.

1. **A kill matrix of the TestSprite suite, with auto-heal off, scored per fault.** 19 generated tests, strict baseline 17/19, **5/14** caught; after the added tests, baseline 28/28, **14/14** caught. 658 unique run ids in [`public/report.json`](https://github.com/zkasuran/saboteur/blob/main/public/report.json). Runner: [`scripts/saboteur.ts`](https://github.com/zkasuran/saboteur/blob/main/scripts/saboteur.ts). Ninety has no mutation run and says so. To match, Ninety would plant or generate faults against the Schengen engine and the UI, replay the 43 frontend and 28 backend tests with `--no-auto-heal`, and publish a score that ignores tests already red on the clean build.

2. **A regression PR that stayed unmerged while TestSprite was red.** PR [#2](https://github.com/zkasuran/saboteur/pull/2): status `23/28 passed · 5 failed`, state `failure`, [execution d4429ce0](https://www.testsprite.com/dashboard-v3/o/517fb9d2-693e-50dc-bc21-ed604b032c75/projects/4fa4606f-0595-4ceb-9cd2-c6731b13e1c9/execution/d4429ce0-4f09-4856-b6bd-654b053362a0), `mergeStateStatus=BLOCKED` on 2026-10-23. Ninety PR #63 merged while TestSprite V3 was failure (`42/43`). To match, Ninety needs a red TestSprite check that is still unmerged, with `mergeStateStatus=BLOCKED`, and a merge commit that does not land on top of a red required check.

3. **Recorded auto-heal damage, and a runner that refuses healed replays.** 19 generated files still contain the PR preview URL in the navigate step comment (18 on the PR #2 host, 1 on the PR #1 host). [`repair_code.py`](https://github.com/zkasuran/saboteur/blob/main/scripts/repair_code.py) rewrites those gotos back to `VAR_{url}`. [`matrix.ts`](https://github.com/zkasuran/saboteur/blob/main/src/report/matrix.ts) rejects `autoHeal !== false`. The runner always passes `--no-auto-heal` and retargets one Starter environment per fault. Ninety’s CLI workflow does not study healing, does not pin replay code, and does not retarget an environment across sabotaged builds. To match, Ninety would commit the replay code, freeze it (`testsprite test code put` is what Saboteur claims, **UNVERIFIED** as a command log), and fail the report if a run was healed.

Extra, smaller: the PR comment on the red run names the five tests and the wrong dollar amounts ([comment](https://github.com/zkasuran/saboteur/pull/2#issuecomment-6257822619)). That is a clearer public failure artifact than a status line alone. Ninety already has richer CI (backend workflow on every PR and on `main`, plans in git, a red/green ledger). Saboteur does not beat Ninety on CI surface area, product depth, or test volume (41 unit tests vs Ninety’s 367; 28 frontend TestSprite tests vs 43 + 28).

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 8 | “A green suite missed 9 of 14 realistic bugs” is the hackathon question. The store is a prop. The reusable piece is the runner and the score definition. |
| TestSprite depth | 8 | App on every PR, one blocked merge, CLI matrix, plans and replay code in git, auto-heal pinned off. No Actions, no schedule, no MCP, and three failing descriptions posted as success. |
| Verifiability | 7 | 5/14, 14/14, 23/28, 41 unit tests, and the live report hash were re-checked. The 21/28 matrix, the two-word heal, admin enforcement, and the e2e run were not. Dashboard HTML does not show the results logged out. |
| Polish | 8 | Strict TypeScript, CSP, security notes, adversarial storage tests, a coherent README. No CI, SPA 200s, `robots.txt` 404, no-derivatives licence. |
| Demo | 4 | No video. The live matrix and `/x/mNN/shop` are the demo, and they need JavaScript. |
| Overall | 7 | Best rival in this set on mutation-of-the-suite. Weaker than Ninety as a product and as a CI system. The blocking story is one PR, and the README is cleaner than the status history. |
