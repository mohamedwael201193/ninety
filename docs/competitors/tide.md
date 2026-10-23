# Tide

- **Name:** Tide
- **Author:** PhiBao
- **Repo:** https://github.com/PhiBao/tide (default branch `main` at `ed9480f`, pushed 2026-10-16)
- **Live:** https://tide.kiter0211.workers.dev/
- **TestSprite PR:** https://github.com/PhiBao/tide/pull/4 (also App checks on PRs #5–#7)
- **Demo:** https://youtu.be/owjKC2r3UjI (repo copy [`docs/tide-demo.mp4`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/docs/tide-demo.mp4))
- **Article:** https://medium.com/@kiter2509/building-a-scheduler-that-proves-its-own-answer-35823c498820 (fetch returned Cloudflare 403 on 2026-10-23; the same essay is in git at [`docs/building-a-self-proving-scheduler.md`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/docs/building-a-self-proving-scheduler.md))
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7

## What it is

Tide is a household electricity scheduler for people on time-of-use or dynamic tariffs. It draws a 15-minute price ribbon for the next 24 hours in the tariff’s own timezone, places loads (EV, dishwasher, water heater) into the cheapest windows that respect power and deadlines, and shows a proved-optimal certificate plus two itemized bills (scheduled vs “run it when you usually would”). The default overnight scenario on the live API is a proved schedule at 765_000 micro-dollars against a 3_600_000 baseline, which the UI multiplies by 30 into the advertised $85.05/month figure. There is no account and no device control; imported usage is partitioned by a cookie.

## Architecture

Single Cloudflare Worker (`wasm32-unknown-unknown`) serves an Axum API and a Next.js 15 / React 19 static export from one origin ([`wrangler.toml`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/wrangler.toml), [`web/package.json`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/web/package.json)). Production D1 database id `cfed1aac-7a4c-42ef-8491-338fabfb0c75` is in that wrangler file. Deploy target is `https://tide.kiter0211.workers.dev` via the `Deploy` job on push to `main` ([`.github/workflows/ci.yml`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/.github/workflows/ci.yml)).

| Module | Role | Link |
|---|---|---|
| `crates/core` | Pure domain. Dependencies are `serde` and `serde_json` only | [`crates/core/Cargo.toml`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/crates/core/Cargo.toml) |
| `money.rs` | `MicroUsd` = 1e-6 USD, integer; one rounding to cents at display | [`money.rs`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/crates/core/src/money.rs) |
| `model.rs` | Domain loads/scenarios (this is the “model”; it is not an ML model) | [`model.rs`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/crates/core/src/model.rs) |
| `solver.rs` | Greedy placement + local search, certified when cost equals the relaxation bound | [`solver.rs`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/crates/core/src/solver.rs) |
| `oracle.rs` | Exhaustive reference; `BudgetExceeded` returns no optimum | [`oracle.rs`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/crates/core/src/oracle.rs) |
| `crates/api` | Axum router shared by native tests and the Worker | [`lib.rs`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/crates/api/src/lib.rs) |
| `crates/worker` | Worker entry; D1 writes go through `f64` `JsValue`s | [`lib.rs`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/crates/worker/src/lib.rs) |
| `web/src/app/page.tsx` | The whole UI (832 lines), `SLOT_MINUTES = 15`, `monthly = saving * 30` | [`page.tsx`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/web/src/app/page.tsx) |

README still mentions `AGENTS.md`; that file is not in the repo.

## TestSprite integration depth

**Score: 7 / 10.** Three bound projects, a GitHub App comment on every PR after the App was wired, a CLI sync check, authored API tests run strict on `main`, and an upstream CLI bug report. The status that is supposed to hold the merge stays `success` when tests fail, and the exact API suite never runs against the PR under test.

### GitHub App (`TestSprite V3` commit status, bot `testsprite[bot]`)

Present on PRs #4–#7 only. PRs #1–#3 have no `TestSprite V3` status (the App was wired on 2026-10-16). Dashboard pages are login-walled (fetched 2026-10-23: “Sign in to TestSprite”). Counts below are the commit-status description plus the PR comment.

| PR | Head | Status state | Description | Execution |
|---|---|---|---|---|
| [#4](https://github.com/PhiBao/tide/pull/4) first App run | [`a19123ab`](https://github.com/PhiBao/tide/commit/a19123ab006932726ae77bbf64c9743099199158) | **success** | 30/31 passed · 1 failed | [execution 85d1c847](https://www.testsprite.com/dashboard-v3/o/762adefd-0fd2-5579-a391-8b69d9a3bb6a/projects/949b0571-9a72-473c-945e-7168e929f6a6/execution/85d1c847-1781-4ef9-a5d9-46e9ab2e6984) |
| [#4](https://github.com/PhiBao/tide/pull/4) after plan rewrite | [`ea05b4de`](https://github.com/PhiBao/tide/commit/ea05b4deb07eac198a1ff53f3858e1a662e6bd8b) | success | All 31 tests passed | [execution b3d91607](https://www.testsprite.com/dashboard-v3/o/762adefd-0fd2-5579-a391-8b69d9a3bb6a/projects/949b0571-9a72-473c-945e-7168e929f6a6/execution/b3d91607-462d-49d2-9327-73eb7e6e8299) · [bot comment](https://github.com/PhiBao/tide/pull/4#issuecomment) |
| [#5](https://github.com/PhiBao/tide/pull/5) | [`280c1c75`](https://github.com/PhiBao/tide/commit/280c1c75920dbd04c0e5df2da9c3d19a3e1291c3) | success | All 31 tests passed | [execution 8c7dea1f](https://www.testsprite.com/dashboard-v3/o/762adefd-0fd2-5579-a391-8b69d9a3bb6a/projects/949b0571-9a72-473c-945e-7168e929f6a6/execution/8c7dea1f-489c-4970-a208-1671daf8598e) |
| [#6](https://github.com/PhiBao/tide/pull/6) | [`5409c893`](https://github.com/PhiBao/tide/commit/5409c893c169f5ddb5d914a0f8a670d1a08e19bc) | success | All 31 tests passed | [execution b1f67e5d](https://www.testsprite.com/dashboard-v3/o/762adefd-0fd2-5579-a391-8b69d9a3bb6a/projects/949b0571-9a72-473c-945e-7168e929f6a6/execution/b1f67e5d-22d2-47cb-82ac-3ef37ed4e2e7) |
| [#7](https://github.com/PhiBao/tide/pull/7) | [`ffeccfc9`](https://github.com/PhiBao/tide/commit/ffeccfc9075a2ea6ed2fe147d8ee432c145c5b83) | **success** | 28/31 passed · 2 failed · 1 blocked | [execution 193bcf9a](https://www.testsprite.com/dashboard-v3/o/762adefd-0fd2-5579-a391-8b69d9a3bb6a/projects/949b0571-9a72-473c-945e-7168e929f6a6/execution/193bcf9a-7cfa-4daf-92d6-2925543c30c4) |

PR #7 failures named in the bot comment: `A long load label does not break the row`, `Expanding a bill line reveals the rule that produced it`. Blocked: `Verify outcome summary after optimization`. Merged by PhiBao at 2026-10-16T22:40:41Z, one minute after that status (22:39:41Z).

The App comment does not print the target URL. The runbook says the App resolves `https://pr-{pr}-tide.kiter0211.workers.dev` after the `Preview` check ([`docs/how-the-suite-is-scoped.md`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/docs/how-the-suite-is-scoped.md)). On 2026-10-23, `https://pr-4-tide.kiter0211.workers.dev/api/health` and `https://pr-7-tide.kiter0211.workers.dev/api/health` both returned 200.

### Is the check required?

- `GET repos/PhiBao/tide/branches/main/protection` → **403** `Resource not accessible by integration`.
- `GET repos/PhiBao/tide/rulesets` → **200** and `[]` (no rulesets).
- No merge was observed in a blocked state. PR #3 merged while the Actions job named `TestSprite` was **failure** ([run 38163109861](https://github.com/PhiBao/tide/actions/runs/38163109861), merged 2026-10-11T18:31:19Z). PR #7 merged while `TestSprite V3` described 2 failures and 1 blocked, with GitHub state `success`.
- The workflow comment says the job name `TestSprite` is kept because branch protection requires it ([`ci.yml` L210–212](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/.github/workflows/ci.yml)). That is the author’s statement. The API cannot confirm it, and the App status does not go red when tests fail, so a required context named `TestSprite V3` would still be green.

### CLI

Workflow: [`.github/workflows/ci.yml`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/.github/workflows/ci.yml). Triggers: `pull_request` to `main`, and `push` to `main`. No `schedule` / cron.

| Job | When | What it runs |
|---|---|---|
| `checks` | PR and main | `cargo fmt`, `clippy -D warnings`, `cargo test --workspace` |
| `preview` | PR only | Builds web + worker, `wrangler deploy --name pr-<n>-tide`, smoke `GET /api/health` |
| `testsprite` | PR only | `python3 scripts/suite-sync.py` only. It used to `testsprite test run` the browser suite; that was removed after double-dispatch ([`ci.yml` L195–231](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/.github/workflows/ci.yml)) |
| `deploy` | push to main | `wrangler deploy` to production, then health probe |
| `api-contract` | push to main, after deploy | credit preflight, then `testsprite test run --all --project $API_PROJECT_ID --no-auto-heal --wait --max-concurrency 4`, then the storage browser project `a54cd337-26cc-49ad-b0bf-cc7df4380665` |

Latest main run [38977167129](https://github.com/PhiBao/tide/actions/runs/38977167129) (2026-10-16, SHA `ed9480f`): `in sync: 18 api, 31 ui, 3 storage`; credits remaining **100.8** (suite budget ~6); API **18/18 passed**; storage browser **3/3 passed**. Rust totals in the same run: api 18, core 78, solver integration 15, worker 0 → **111 passed**.

Earlier CLI browser runs (before the App took over dispatch), from Actions logs:

- [PR #1 run 37984191039](https://github.com/PhiBao/tide/actions/runs/37984191039): `Dispatched 18 tests` against `https://pr-1-tide.kiter0211.workers.dev`, **18/18 passed**.
- [PR #2 run 37988182853](https://github.com/PhiBao/tide/actions/runs/37988182853): `Dispatched 19 tests` against `https://pr-2-tide.kiter0211.workers.dev`, **19/19 passed**. The log of that single PR run is green; a prior red browser run for the `+`/`−` bug is described in the README and is not a separate failed Actions run on this PR (one commit, one successful run).
- [PR #4 run 38936735449](https://github.com/PhiBao/tide/actions/runs/38936735449): CLI **31/31 passed** on the same commit whose App status said **30/31**.
- [PR #6 run 38958595460](https://github.com/PhiBao/tide/actions/runs/38958595460): `Dispatched 0 tests (18 conflicts) (13 rate-deferred)` then **30/31 passed**, job failure. Next commit stopped CI from dispatching.

### MCP

No TestSprite MCP config, no `mcp` references in the repo.

### Plans and code in git

[`tests/suite.json`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/tests/suite.json) binds three projects:

- API `235f314b-a3e7-4361-8127-c05a1330c241`: **18** authored Python files in [`tests/backend/`](https://github.com/PhiBao/tide/tree/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/tests/backend).
- UI `949b0571-9a72-473c-945e-7168e929f6a6`: **31** plans.
- Storage `a54cd337-26cc-49ad-b0bf-cc7df4380665`: **3** plans.

`tests/ui/plans/` contains **34** JSON plans (31+3). Browser test *code* is intentionally not committed ([`tests/ui/README.md`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/tests/ui/README.md)).

### Triage, schedules, red→green, credits

- Triage is human: the author comments on PR #3, the bot comments pass/fail tables, and [`scripts/suite-sync.py`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/scripts/suite-sync.py) (353 lines) fails CI if git and the portal disagree. No auto-fix bot. Zero GitHub issues on the repo.
- Schedules: on PR and on push to `main` only. API + storage suites run after production deploy, not on the PR and not nightly.
- Red→green:
  1. **PR #4 App:** 30/31 on `a19123ab` ([execution 85d1c847](https://www.testsprite.com/dashboard-v3/o/762adefd-0fd2-5579-a391-8b69d9a3bb6a/projects/949b0571-9a72-473c-945e-7168e929f6a6/execution/85d1c847-1781-4ef9-a5d9-46e9ab2e6984)) → 31/31 on `ea05b4de` ([execution b3d91607](https://www.testsprite.com/dashboard-v3/o/762adefd-0fd2-5579-a391-8b69d9a3bb6a/projects/949b0571-9a72-473c-945e-7168e929f6a6/execution/b3d91607-462d-49d2-9327-73eb7e6e8299)) after commit `fix(test): a plan was asserting against the app's own guarantee`. GitHub state was `success` on both.
  2. **PR #2 CLI:** final [run 37988182853](https://github.com/PhiBao/tide/actions/runs/37988182853) is 19/19 against the PR preview. The “went red, then 19/19” story is in the [README](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/README.md); this PR has a single green Actions run.
  3. **PR #6:** CLI [run 38958595460](https://github.com/PhiBao/tide/actions/runs/38958595460) failed (conflict + 30/31) → [run 38960161999](https://github.com/PhiBao/tide/actions/runs/38960161999) success after CI stopped dispatching, while the App reported 31/31.
  4. **PR #7** is the opposite loop: 28/31 with state `success`, then merged.
- Credits: preflight in `api-contract` fails the job if the balance cannot be read or is under ~6. Last observed balance **100.8** on [run 38977167129](https://github.com/PhiBao/tide/actions/runs/38977167129).
- Upstream: [TestSprite/testsprite-cli#443](https://github.com/TestSprite/testsprite-cli/issues/443) filed by PhiBao on 2026-10-16 (`test code put` silently disables healing). State: closed.

## Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
|---|---|---|---|---|
| Browser plans (UI + storage) | 34 | 34 JSON plans; 31 + 3 ids in `suite.json` | [`tests/suite.json`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/tests/suite.json), `tests/ui/plans/` | **VERIFIED** as committed plans |
| Authored API tests | 18 | 18 Python files; CI **18/18 passed** on production 2026-10-16 | [`tests/backend/`](https://github.com/PhiBao/tide/tree/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/tests/backend), [run 38977167129](https://github.com/PhiBao/tide/actions/runs/38977167129) | **VERIFIED** |
| PR browser gate | 31 | App ran 31 on PRs #4–#7; latest main-adjacent result is 28 pass / 2 fail / 1 blocked | PR #7 status on [`ffeccfc9`](https://github.com/PhiBao/tide/commit/ffeccfc9075a2ea6ed2fe147d8ee432c145c5b83) | **VERIFIED** that 31 are dispatched; **FALSE** that 31 pass before merge |
| Storage browser | 3 | CI **3/3 passed** on production | [run 38977167129](https://github.com/PhiBao/tide/actions/runs/38977167129) | **VERIFIED** |
| Rust workspace | 111 (also “85” in the install snippet) | CI: 18 HTTP + 78 core + 15 solver = 111; worker crate 0 | [run 38977167129](https://github.com/PhiBao/tide/actions/runs/38977167129); stale “85” at [README L205](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/README.md#L205) | **111 VERIFIED**, **85 FALSE** |
| Strict browser replay | 22 of 34 pass without the agent | Not in any Actions log reviewed | [`tests/ui/README.md`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/tests/ui/README.md) | **UNVERIFIED** |
| “Property-test corpus, millions of instances” | millions | `proptest` is a dev-dependency; no `proptest!` in the repo | [`crates/core/Cargo.toml`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/crates/core/Cargo.toml), [`lib.rs`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/crates/core/src/lib.rs) | **FALSE** |

**Local run:** `cargo test --workspace` on this machine failed before compile. Host Cargo is 1.83.0; the tree requires Rust 1.85 and a dependency (`wasm-streams` 0.7.0) needs Cargo edition 2024. No secrets were required. Result recorded from CI instead. No `node_modules` was installed.

## Claim verification

| Claim | Verdict | Evidence |
|---|---|---|
| Electricity price per 15 min scheduler | **VERIFIED** | UI `SLOT_MINUTES = 15` ([`page.tsx`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/web/src/app/page.tsx)); live `POST /api/horizon` returned `slot_minutes: 15` and 96 slots, slot 0 at 45_000 and slot 40 at 240_000 micro-USD/kWh ([horizon](https://tide.kiter0211.workers.dev/api/horizon)) |
| No model in the core | **VERIFIED** as no ML/LLM. `tide-core` deps are serde only. `model.rs` is the domain type module. The README line “no heuristics” is **FALSE**: the scheduler is greedy + local search and can return `Optimality::Heuristic` ([`solver.rs`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/crates/core/src/solver.rs)) |
| Integer micro-dollars asserted to the cent | **VERIFIED**, and stricter than a cent | [`MicroUsd`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/crates/core/src/money.rs); [`t-tou-exact.py`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/tests/backend/t-tou-exact.py) asserts 225_000 and 1_200_000; [`t-flat-bill.py`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/tests/backend/t-flat-bill.py) asserts line cents sum to the total. Live `POST /api/bills`: 5 kWh overnight = 225000, midday = 1200000 ([bills](https://tide.kiter0211.workers.dev/api/bills)) |
| Too-big oracle returns `optimal_cost_micro_usd` null and `nodes_explored` 502 | **Null VERIFIED. 502 FALSE** as the current response | [`t-verify-refuse.py`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/tests/backend/t-verify-refuse.py) asserts null and does not assert 502. 502 appears only as a sample in the [essay](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/docs/building-a-self-proving-scheduler.md) next to `solver_cost_micro_usd: 9000000`. Live six-load verify on 2026-10-23 ([`/api/solve/verify`](https://tide.kiter0211.workers.dev/api/solve/verify)): budget 500 → `optimal_cost_micro_usd: null`, `nodes_explored: 505`, solver cost 5_400_000; budget 200 → `nodes_explored: 205` |
| 34 browser tests and 18 authored API tests | **VERIFIED** as files and ids | Counts above |
| Every PR tested by the TestSprite GitHub App against that PR’s deployment | **FALSE** for “every PR”. **VERIFIED** for PRs #4–#7 having an App status. Target URL is documented, and PR #1/#2 CLI logs name `pr-N-tide…workers.dev`; the App comment itself does not include the URL | Status table above; [PR #2 log](https://github.com/PhiBao/tide/actions/runs/37988182853) |
| Check holds the merge; 31 browser tests before anything lands | **FALSE** | PR #7 merged at 28/31 with status state `success`. PR #3 merged on a failed Actions `TestSprite` job. Rulesets empty; branch protection 403 |
| Browser suite flakes about 3% of results, measured and documented | **Documented, measurement UNVERIFIED, docs disagree** | [README](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/README.md) says 6/217 ≈ 3%. [Runbook](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/docs/how-the-suite-is-scoped.md) and [`tests/ui/README.md`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/tests/ui/README.md) still say ~5% (5/93). The essay says 3% in the table and ~5% in “What’s missing”. No committed ledger of 217 results. Visible App runs are 30/31, 31/31, 31/31, 31/31, 28/31 |
| Default scenario saves $85.05/month vs $3.60 | **VERIFIED** as 30× one modelled day | Live `POST /api/solve` for the three default loads: `optimality: Proved`, cost 765_000, baseline 3_600_000 ($0.765 → $0.77 displayed, baseline $3.60). Saving 2_835_000 × 30 = $85.05. UI: `monthly = saving * 30` ([`page.tsx`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/web/src/app/page.tsx)) |
| 61 µs, best of 2000 runs, asserted | **UNVERIFIED / overstated** | The test is best of **200** runs and asserts **&lt; 2 ms**, not 61 µs ([`solver.rs` test](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/crates/core/tests/solver.rs)) |
| Bundled tariffs are real published rate structures with source URLs | **FALSE** as sourced | Live `GET /api/tariffs`: `flat`, `overnight-ev`, and `summer-afternoon` use `source_url: https://www.testsprite.com`; `weekday-evening` uses `https://developers.cloudflare.com` ([`tariffs.rs`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/crates/core/src/tariffs.rs)). The shapes are explicit TOU windows; the URLs are sponsor homepages. [`t-tariff-source.py`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/tests/backend/t-tariff-source.py) only asserts the fields are non-empty |
| 52 TestSprite tests, all green | **Count VERIFIED (18+31+3). “All green” FALSE** on the latest App run (28/31) | [run 38977167129](https://github.com/PhiBao/tide/actions/runs/38977167129) is 18/18 and 3/3; PR #7 App is 28/31 |
| No user data / no accounts | **Mostly true, cookie store exists** | README limitations; `GET /api/health` sets `tide_session` (SameSite=Lax, 1 year). History is per cookie, which the README calls demo-grade |
| Demo is 97 seconds, narrated | **Length VERIFIED for the file. Narration UNVERIFIED** (not watched) | `ffprobe` on `docs/tide-demo.mp4`: video 97.200 s, AAC audio 97.228 s. YouTube oEmbed title: “Tide \| TestSprite Hackathon Season 4 demo” by 0xHaruki ([video](https://youtu.be/owjKC2r3UjI)) |
| Medium article | **UNVERIFIED** (HTTP 403 from this environment). Git copy of the essay exists | Medium URL above; git essay linked above |

## Code quality

The Rust core is the strong part: newtypes, exhaustive `DomainError`, clippy `-D warnings` and rustfmt in CI, and tests that pin exact integers. The Worker/API boundary is one Axum router compiled to wasm, which matches the “one origin for UI tests” story.

Smells that matter to a judge:

- The solver is a heuristic with a certificate, while the README innovation cell says “no heuristics”.
- `proptest` is unused while the crate docs claim a property-test corpus.
- Three of four tariff `source_url`s point at TestSprite or Cloudflare, and the test only checks that a string is present.
- D1 bindings in the Worker pass integers through `f64` ([`crates/worker/src/lib.rs`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/crates/worker/src/lib.rs)), which sits next to a “no floats” claim about the domain.
- UI is one 832-line client component. No TypeScript test runner, no ESLint config in the tree.
- README install snippet still says 85 tests. Runbook, UI readme, and the essay’s closing still say ~5% flake after the README was edited to 3%.
- SPA fallback: unknown HTML paths return 200 and the app shell (`not_found_handling = "single-page-application"`). API misses are a real JSON 404.
- Session id is an unauthenticated cookie. “Forget my data” deletes that partition only.

## Live-site behavior

Checked 2026-10-23 with curl (no browser UI session, no form that stores usage).

| Route | Result |
|---|---|
| `GET /` | 200 in ~0.11 s, title `Tide — run your house at low tide` |
| `GET /does-not-exist` | 200 HTML shell (SPA fallback) |
| `GET /favicon.svg` | 200 SVG |
| `GET /api/health` | 200 `{"status":"ok","api_version":1,"service":"tide"}` ~0.17 s; sets `tide_session` |
| `GET /api/tariffs` | 200, four tariffs |
| `GET /api/tariffs/overnight-ev` | 200, America/New_York, three periods |
| `GET /api/tariffs/no-such` | 404 `not_found` |
| `GET /api/nope` and `POST /api/not-a-route` | 404 `{"error":{"code":"not_found","message":"no such route"}}` |
| `GET /api/solve` | 405 empty body |
| `POST /api/horizon` | 200, 96×15 min |
| `POST /api/bills` | 200, 225_000 and 1_200_000 as above |
| `POST /api/solve` | 200, `Proved`, bound 765_000 equals cost |
| `POST /api/solve/verify` small | 200, `enumerated: true`, `is_optimal: true`, `nodes_explored: 30` |
| `POST /api/solve/verify` six loads | 200, `enumerated: false`, optimum null, badge `proof: not attempted (instance too large)` |
| `POST /api/bills` body `not-json` | 400 `invalid_json` |
| `POST /api/solve/verify` without `scenario` | 422 `schema_mismatch` |
| `https://pr-4-tide…/api/health`, `pr-7-tide` | 200 |

CORS: `access-control-allow-origin: *`. A bare Python `urllib` POST without a browser User-Agent received Cloudflare 403; the same POST with a browser UA returned 200. That is a bot check in front of POST, not an application 403.

The visual ribbon, bill expand/collapse, and the long-label layout were not driven in a browser. PR #7’s App run says the overnight bill row did not collapse and a long label was not shown as truncated.

## Demo

Exists. YouTube: https://youtu.be/owjKC2r3UjI , oEmbed title “Tide | TestSprite Hackathon Season 4 demo”, channel 0xHaruki. Committed file `docs/tide-demo.mp4` is 6.8 MB, H.264 97.200 s plus AAC 97.228 s, matching the README’s “97 seconds”. Narration and on-screen numbers were not watched in this review. README says every number in the video is taken from the app; that content claim is **UNVERIFIED** here. The live API numbers the README quotes ($0.77 vs $3.60, $85.05/month) do match a solve of the default loads.

## Weaknesses / risks for judges

- The merge gate is green when the suite is not. PR #7 landed on 28/31 because `TestSprite V3` reports `state: success` alongside failures. “Block PR until tests pass” is not what GitHub recorded.
- The precise half (18 API tests, `--no-auto-heal`) runs only after merge, against production. `--target-url` is documented as ignored for backend projects, so a PR can merge with an API regression the gate never saw.
- Browser greens are agent-repaired by the author’s own account (22/34 strict is their number, not a CI artifact). A pass can mean the agent rewrote the test.
- Flake documentation is three different percentages (3%, 5%, and PR #7’s 28/31) with no raw run ledger.
- Tariff “sources” are sponsor URLs. A judge who clicks `source_url` does not land on a utility schedule.
- Headline performance (61 µs, 2000 runs) and “millions of property tests” are not what the tests do.
- History is a cookie, scenarios live in the URL, and the product does not actuate anything. The monthly dollar figure is one synthetic day times 30, which the README now says, and which is still the number in the first screen of the pitch.
- Medium URL was unreachable from this environment (403).
- Seven merged PRs, zero issues, last push 2026-10-16. The App era is four PRs on one day.

## Where it beats Ninety

Ninety: https://github.com/mohamedwael201193/ninety , live https://ninety-coral.vercel.app. Schengen 90/180 calculator, Commission-script oracle, Vitest 367, TestSprite V3 on PRs plus a CLI API gate; PR #63 merged while V3 was red; no demo video; no MCP config; nightly CLI schedules disabled.

1. **Per-PR deployment is the thing the browser suite is aimed at.** Tide mints `pr-<n>-tide.kiter0211.workers.dev` and the CLI log names that URL: [PR #2 run](https://github.com/PhiBao/tide/actions/runs/37988182853) dispatched 19 tests at `https://pr-2-tide.kiter0211.workers.dev` and got 19/19. The App runbook uses the same pattern. Ninety would need a preview URL minted in CI and handed to the App as the target, then a log or status that shows that URL, before it can claim the same loop. Tide’s App status still does not fail the check, so this is ahead on targeting, not on enforcement.
2. **A drift check between git and the portal, run before any credits are spent.** [`scripts/suite-sync.py`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/scripts/suite-sync.py) is a required-named job on every PR and on main; [run 38977167129](https://github.com/PhiBao/tide/actions/runs/38977167129) logged `in sync: 18 api, 31 ui, 3 storage tests, all bound, no drift`. Ninety would need an id map plus a CI step that fails when the portal copy is not the git copy. Tide also splits the suite into three projects so storage tests are not pretended to run on a preview ([`tests/suite.json`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/tests/suite.json)).
3. **A public demo, and a live oracle that returns null.** Video: https://youtu.be/owjKC2r3UjI and a 97.2 s file in git. Live `POST /api/solve/verify` returns `optimal_cost_micro_usd: null` and `enumerated: false` on a large instance ([endpoint](https://tide.kiter0211.workers.dev/api/solve/verify), behavior also pinned by [`t-verify-refuse.py`](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/tests/backend/t-verify-refuse.py)). Ninety has no demo video. Matching the oracle means an endpoint a judge can POST, with a test that asserts null rather than a guessed optimum. Ninety’s Commission oracle is a different and stronger parity story; this item is the demo plus the refusal behavior, not a claim that Tide’s proof is deeper than the Commission script.

Extra technique, not a product win: the credit preflight that fails closed ([`ci.yml` credit step](https://github.com/PhiBao/tide/blob/ed9480f4d46b9f0239b4fb030d794317cd05fbfc/.github/workflows/ci.yml), observed 100.8 credits on the last main run) and the filed CLI footgun [testsprite-cli#443](https://github.com/TestSprite/testsprite-cli/issues/443).

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 7 | Real TOU scheduling problem and a checkable certificate. Tariffs are unsourced shapes, there is no actuation, and the headline saving is one synthetic day × 30. |
| TestSprite depth | 7 | App + CLI + three bound projects + suite-sync + strict API runs + an upstream issue. The App status stays success on failure, and the exact tests are post-merge only. No MCP, no nightly. |
| Verifiability | 8 | Live API, Actions logs, and commit statuses make the true and false claims easy to separate. Dashboard executions are login-walled; the 3% and 22/34 figures have no primary log. |
| Polish | 7 | Careful Rust, typed errors, honest limitations section. Stale counts, disagreeing flake docs, sponsor URLs as “sources”, and a single 832-line page. |
| Demo | 7 | YouTube exists and the committed file is 97.2 s with audio. Content was not watched here. |
| **Overall** | **7** | A real scheduler with an unusually explicit test story, and several claims (holds merge, 502, 61 µs, property tests, published tariff sources, all-green 31) that a judge can falsify in one sitting. |
