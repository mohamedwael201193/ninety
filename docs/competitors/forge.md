# Forge

| | |
|---|---|
| Name | Forge |
| Author | ForgeAILab |
| Repo | https://github.com/ForgeAILab/forge |
| Live | https://forge.oc.mai1015.com/ |
| TestSprite PR | https://github.com/ForgeAILab/forge/pull/88 (merged 2026-10-18; also the wiring PR https://github.com/ForgeAILab/forge/pull/82) |
| Demo | none (no video in the README or in the [v0.14.1 release assets](https://github.com/ForgeAILab/forge/releases/tag/v0.14.1)) |
| Review date | 2026-10-23 |
| Reviewer model | Grok 4.7 |
| Inspected commit | [`847a35f3`](https://github.com/ForgeAILab/forge/commit/847a35f35d5dad58b41aa767579e946e4d244617) (`main`, release v0.14.1) |

Public repo, MIT, created 2026-05-16, primary language Rust, 28 stars, 4 forks, 53 merged PRs ([search](https://github.com/search?q=repo%3AForgeAILab%2Fforge+is%3Apr+is%3Amerged&type=issues)). Current release [v0.14.1](https://github.com/ForgeAILab/forge/releases/tag/v0.14.1) (2026-10-22).

## What it is

Forge is a local-first control plane for running several coding agents against one repository without shared-tree collisions. A developer (or a small team piloting agents) gets a durable Main Agent, one Project Agent per project, and standalone tasks that each run in an isolated git worktree, pass a CI gate, and wait for review before anything lands on `main`. The product is already a public beta with a long release history; the hackathon addition is a public throwaway demo plus a pull-request check that deploys that demo and runs TestSprite against it. The demo itself is manager-only: it will not run user-configured commands or an agent inside the server process.

## Architecture

Rust workspace plus a React/TypeScript SPA. Server is Axum, SQLite, an in-process event bus, and adapters for Claude Code, Codex, Cursor, Gemini, opencode, Smith, and a generic shell. Deploy target for the hackathon demo is a single Docker Compose app on [Dokploy](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/docs/demo-instance.md), image `ghcr.io/forgeailab/forge-demo`, fronted by Cloudflare (`server: cloudflare` on https://forge.oc.mai1015.com/). Release installs are GitHub release tarballs, Homebrew, and an npm bootstrapper.

| Module | Role |
|---|---|
| [`crates/forge-cli`](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/crates/forge-cli/src/main.rs) | `forge` server binary: REST, optional MCP, static web UI |
| [`crates/forge-client`](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/crates/forge-client/src/main.rs) | separate `forge-ctl` CLI binary |
| [`crates/forge-solo`](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/docs/architecture.md) | separate TUI binary |
| [`crates/forge-daemon`](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/crates/forge-daemon/src/main.rs) | host daemon that runs CLI agents |
| [`crates/api`](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/crates/api/src/lib.rs) | Axum routes, SPA fallback, cookie session |
| [`crates/mcp-server`](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/crates/mcp-server/src/protocol.rs) | MCP JSON-RPC at `POST /mcp` |
| [`crates/services`](https://github.com/ForgeAILab/forge/tree/847a35f35d5dad58b41aa767579e946e4d244617/crates/services) | task/workflow engine |
| [`crates/db`](https://github.com/ForgeAILab/forge/tree/847a35f35d5dad58b41aa767579e946e4d244617/crates/db) | SQLite |
| [`web/`](https://github.com/ForgeAILab/forge/tree/847a35f35d5dad58b41aa767579e946e4d244617/web) | Vite/React 18 SPA, served from `web/dist` on disk, not embedded in the binary |
| [`deploy/demo/`](https://github.com/ForgeAILab/forge/tree/847a35f35d5dad58b41aa767579e946e4d244617/deploy/demo) | demo image, entrypoint, Dokploy compose |

The demo entrypoint starts `forge --demo --no-embedded-daemon --no-mcp` ([entrypoint](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/deploy/demo/forge-demo-entrypoint.sh#L78)). Release layout installs three binaries plus a `web/dist` directory ([install.sh](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/install.sh#L72-L98), [Dockerfile](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/Dockerfile#L68-L78)).

## TestSprite integration depth

**Depth score: 6/10.** The gate is a real deploy-then-test pipeline (image build id baked in, Dokploy stop/deploy, poll until that id is on the public URL, then `TestSprite/testsprite-action@v1` on the whole project, with a result job that is red if the suite job is skipped). That is deeper than a badge. It is not a closed loop: plans are not in git, there is no TestSprite MCP config and no GitHub App check, the workflow has never finished green, it is not a required check, and later commits got worse (52/53 then 47/53).

### GitHub App check

No TestSprite GitHub App. Check runs on PR #88 head [`8e84deb`](https://github.com/ForgeAILab/forge/commit/8e84deb29a8d9a4ac4ee46324d6c34e2ba59a15a) are only `github-actions` and `github-advanced-security` (CodeQL). The TestSprite signal is three Actions jobs in [`.github/workflows/demo-testsprite.yml`](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/.github/workflows/demo-testsprite.yml): Build demo image, Demo TestSprite suite, Demo TestSprite result.

Workflow history (all 59 runs of `Demo TestSprite`, listed 2026-10-23): **0 success, 13 failure, 1 cancelled, 45 skipped.** Triggers are `pull_request` to `main` and `next/v0.14`, plus `workflow_dispatch`. No `push`, no `schedule`. Docs-only diffs are `paths-ignore`. Drafts, forks, and Dependabot skip the jobs.

Runs that actually dispatched the 53-test project (`646f7b50-64a4-4cf2-bfd2-c502266d739d`):

| When | Run | Score | Notes |
|---|---|---|---|
| 2026-10-18 00:35Z | [39083306026](https://github.com/ForgeAILab/forge/actions/runs/39083306026) | **51/53** | Failed [Edit task title](https://www.testsprite.com/dashboard-v3/o/28aec1e3-64fd-5dce-903d-42a5472a9b70/projects/646f7b50-64a4-4cf2-bfd2-c502266d739d/execution/8441ba5c-7e27-49ad-b3be-0531c0f0127f) and Clear task description. JUnit: [artifact](https://github.com/ForgeAILab/forge/actions/runs/39083306026/artifacts) `testsprite-junit` (51 pass, 2 fail). |
| 2026-10-18 04:34Z | [39097589821](https://github.com/ForgeAILab/forge/actions/runs/39097589821) | **52/53** | PR #88 last push. Only failure: [Update task counts after creating a task](https://www.testsprite.com/dashboard-v3/o/28aec1e3-64fd-5dce-903d-42a5472a9b70/projects/646f7b50-64a4-4cf2-bfd2-c502266d739d/execution/9450929b-1a10-4e4c-9010-490a8d110b5e). Title edit and description clear passed. |
| 2026-10-22 00:52Z | [39702317556](https://github.com/ForgeAILab/forge/actions/runs/39702317556) | **49/53** | PR #93. 3 failed + 1 blocked. [Execution](https://www.testsprite.com/dashboard-v3/o/28aec1e3-64fd-5dce-903d-42a5472a9b70/projects/646f7b50-64a4-4cf2-bfd2-c502266d739d/execution/d7f9f0f4-c65b-4ee3-af8c-70a384f4cddc). |
| 2026-10-22 01:13Z | [39704473553](https://github.com/ForgeAILab/forge/actions/runs/39704473553) | **47/53** | Same PR, next commit. 5 failed + 1 blocked. [Execution](https://www.testsprite.com/dashboard-v3/o/28aec1e3-64fd-5dce-903d-42a5472a9b70/projects/646f7b50-64a4-4cf2-bfd2-c502266d739d/execution/379bf1be-ede7-4093-973b-1c90b15bfc4b). This build is what the live URL serves now. |

Earlier failures never reached a 53-test verdict: missing secrets ([38483267661](https://github.com/ForgeAILab/forge/actions/runs/38483267661) and two siblings on PR #82; [38574861251](https://github.com/ForgeAILab/forge/actions/runs/38574861251)), public URL never served the amd64 build ([38657100976](https://github.com/ForgeAILab/forge/actions/runs/38657100976)), then ARM64 deploys whose TestSprite project `e0d0a940-1f8a-43ec-86d4-cdfc20acf912` had **no runnable tests** ([38660304394](https://github.com/ForgeAILab/forge/actions/runs/38660304394), [38673718750](https://github.com/ForgeAILab/forge/actions/runs/38673718750), exit code 5). [39081616648](https://github.com/ForgeAILab/forge/actions/runs/39081616648) deployed, then the action exited 4 because that same empty project id was still configured. [39081366053](https://github.com/ForgeAILab/forge/actions/runs/39081366053) failed in `cargo build`. [38994896611](https://github.com/ForgeAILab/forge/actions/runs/38994896611) was cancelled.

### Required check?

Not shown to be required, and merges prove it is not blocking.

- `GET /repos/ForgeAILab/forge/branches/main/protection` → **403** `Resource not accessible by integration`.
- `GET /repos/ForgeAILab/forge/rulesets` → **200 `[]`**. `GET /repos/ForgeAILab/forge/rules/branches/main` → **200 `[]`**.
- The workflow file says it does not make anything required; an owner must add **Demo TestSprite result** by hand ([docs](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/docs/demo-instance.md#L411-L424)).
- PR [#88](https://github.com/ForgeAILab/forge/pull/88) merged 2026-10-18T05:00:44Z, about two minutes after [Demo TestSprite result](https://github.com/ForgeAILab/forge/actions/runs/39097589821) failed (52/53) at 04:58:19Z.
- PR [#93](https://github.com/ForgeAILab/forge/pull/93) merged 2026-10-22T01:36:30Z, about 90 seconds after [result](https://github.com/ForgeAILab/forge/actions/runs/39704473553) failed (47/53) at 01:34:57Z.
- PR [#86](https://github.com/ForgeAILab/forge/pull/86) and [#85](https://github.com/ForgeAILab/forge/pull/85) also merged with this workflow red.

The result job's own predicate is strict: green only when build and suite are both `success` ([workflow lines 326–351](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/.github/workflows/demo-testsprite.yml#L326-L351)). A failed suite does not roll the URL back. The live host is serving the failed build `39704473553-1-7b5014eb93e8bd0c5216abf061e45fddb5e12d64` (see Live site).

### CLI usage

`TestSprite/testsprite-action@v1` (pinned in the log of [39704473553](https://github.com/ForgeAILab/forge/actions/runs/39704473553) to SHA `9f3ac52a42baae6c7099d1f89fa603b31d636d63`) installs `@testsprite/testsprite-cli` and runs the whole project. Inputs: `api-key`, `project: vars.TESTSPRITE_PROJECT_ID`, `timeout: 1800`. No `--local`, no test-id list, no schedule. There is no TestSprite CLI workflow besides this one. Latest run log: dispatched 50, 3 rate-deferred, retry accepted them, then `Batch run complete: 47/53 passed, 6 failed/blocked, 0 timed out`.

### MCP usage

No TestSprite MCP config, no `.testsprite` directory, no MCP server entry for TestSprite. Forge's own product MCP is a different thing (`POST /mcp` in `crates/mcp-server`) and the demo turns it off.

### Plans / code in repo

**0** TestSprite plans or generated test files committed. The only in-repo artifact is the workflow. Case names exist only as JUnit uploaded by the action. `docs/demo-instance.md` still says the suite-coverage section is “Not written yet” ([line 473](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/docs/demo-instance.md#L473-L477)) while the README table was filled in on PR #88.

### Triage / automation

PR #88 has **0** issue comments, **0** review comments, **0** reviews (`gh api` on 2026-10-23). No TestSprite issue, no auto-fix bot, no failure classifier. The only triage is human commits on the same PR (cookie session, description/title conflict retry, task-type badge, brand link) plus the JUnit artifact and dashboard URLs printed as `::error::` annotations.

### Schedules

TestSprite does not run nightly or on merge. CodeQL cron `24 9 * * 1` and Scorecard `41 10 * * 1` are unrelated. After a PR is tested, the public URL keeps that PR's image until the next deploy; putting `main` back is a manual `workflow_dispatch` ([docs](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/docs/demo-instance.md#L294-L295)).

### Red → green loops

No loop reached 53/53.

1. **Description clear + title edit, partial.** [39083306026](https://github.com/ForgeAILab/forge/actions/runs/39083306026) 51/53, both failed. Commit [`8e84deb`](https://github.com/ForgeAILab/forge/commit/8e84deb29a8d9a4ac4ee46324d6c34e2ba59a15a) (`fix(web): task-detail saves survive concurrent Task writes`). [39097589821](https://github.com/ForgeAILab/forge/actions/runs/39097589821) 52/53: those two passed; “Update task counts after creating a task” failed. PR body calls that last failure a bad assertion, not a product bug, and merges anyway.
2. **Regression after merge.** [39702317556](https://github.com/ForgeAILab/forge/actions/runs/39702317556) 49/53, then [39704473553](https://github.com/ForgeAILab/forge/actions/runs/39704473553) 47/53 on the v0.14.1 PR. New failures include “Discard task edits with Escape”, “Update task priority from detail view”, “Create a task from the board dialog”, “Combine task table filters and clear them”, and blocked “Delete an existing task comment”. “Update task counts” failed again.

### Credits

UNVERIFIED. The repo stores `TESTSPRITE_API_KEY` as an Actions secret and does not record a balance or a per-run cost. The latest run hit a rate limit (`Rate-deferred testIds`, 3 ids) and the action retried once inside the same job, so the suite is large enough to bump the dispatcher.

## Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
|---|---|---|---|---|
| TestSprite browser suite | 53, with the README area split | **53** cases in JUnit. Latest run **47 passed, 5 failed, 1 blocked**. Best retained run **52/53**. Area split matches an exclusive partition of those 53 names (below). | [JUnit on 39704473553](https://github.com/ForgeAILab/forge/actions/runs/39704473553) and the four batch lines above. README table: [README.md](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/README.md#L100-L110) | **VERIFIED** (53 and the split). The suite has **never** been all-green in Actions. |
| TestSprite plans in git | (implied by “the suite covers”) | **0 files** | repo search for `testsprite` hits only the workflow, README, changelog, and docs | **VERIFIED** as absent |
| Rust `cargo test` on `main` | PR #88 body: db 468+210, services 2466+351, agents 44, api 455+lib 99, model 85, daemon 58, demo 13, normal-mode 10, forge-cli 11, executors 142, client 198 | **6,866 passed, 0 failed, 17 ignored** on CI run [39706670982](https://github.com/ForgeAILab/forge/actions/runs/39706670982) (sum of `test result:` lines; shards are defined to be disjoint in [`ci_rust_shards.py`](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/scripts/ci_rust_shards.py)): db 733 (7 ignored), rest 2,835 (7 ignored), services-unit-a 899 (2 ignored), services-unit-b 1,491, services-integration 123, api-a 85, api-b 700 (1 ignored) | job logs fetched 2026-10-23 | **VERIFIED** for current `main`. The PR #88 per-crate numbers are **UNVERIFIED** against today's tree (they predate v0.14.1 and do not match these shard totals). |
| Web unit (Vitest) | PR #88 body: web 780 | **842 passed / 110 files** | CI [Web job](https://github.com/ForgeAILab/forge/actions/runs/39706670982) log `Tests 842 passed`. Local `pnpm test` in `web/` on this review: same 842/110, ~125s. | **VERIFIED** |
| Playwright in CI | not claimed as a count | **8 passed** (`pnpm e2e` = `smoke.spec.ts` + `task-actions-contract.spec.ts`) | same Web job, `8 passed (14.4s)` | **VERIFIED** |
| Playwright specs on disk | — | about 60 `test()` calls across 21 files under `web/e2e/` | source count, not executed here | Most are **not** the CI `e2e` script. Execution of the extra specs: **UNVERIFIED**. |
| Python `scripts/` unit tests | — | 56 `def test_` in source. The Rust lint job runs `python3 -m unittest discover -s scripts` and that job succeeded on the same CI run. | [ci.yml](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/.github/workflows/ci.yml#L77-L79), [Rust lint success](https://github.com/ForgeAILab/forge/actions/runs/39706670982) | Exact pass count **UNVERIFIED**; the job that runs them is green. |
| First TestSprite run 48/53 | 48 passed, 4 failed, 1 blocked | not present in any retained Actions log | closest logs are 51, 52, 49, 47 | **UNVERIFIED** |

Local Rust tests: **not runnable in the review time box.** Host `rustc` is 1.83.0; the image pins `rust:1.99` ([Dockerfile](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/Dockerfile#L13)) and CI uses stable. The workspace is tens of millions of bytes of Rust. Counts above are from the green `main` CI logs instead. `web/node_modules` from the Vitest run was deleted afterwards.

### Area split (53 names from the latest JUnit)

Exclusive assignment of the 53 case names. Settings, tasks table, overview, task creation, and comments/status match the README parentheticals directly. Shell / Kanban / task detail are the remainder and also land on 8 / 7 / 10.

| Area | Claimed | Names |
|---|---|---|
| Task detail | 10 | Open task detail from board card; Open a task in a final status; Close task detail modal with Escape; Open seeded task detail and view description; Clear task description and restore empty state; Open full-page task detail from modal; Edit task description from detail view; Edit task title from detail view; Discard task edits with Escape; Update task priority from detail view |
| App shell | 8 | Open workspace pages from the sidebar; Open notifications from the header; Use the brand link to open Forge home; Open account profile from the user menu; Toggle theme without leaving the current page; Switch between current project and create project entry; Open each main navigation destination; Open project chat from the project navigation |
| Kanban | 7 | Open task details from a board card; Show and clear board filters; Create a new task from the board; Open a task actions menu from the board; Filter board tasks by minimum priority; Search tasks on the board; Open task detail from search results |
| Settings | 6 | View general / repositories / members / workflow / analytics / MCP project settings |
| Account | 4 | View account profile details; Open account settings from the user menu; View personal access tokens page; View usage analytics page |
| Tasks table | 4 | Open a task from the tasks table; Sort tasks by priority ascending and descending; Filter tasks by minimum priority; Combine task table filters and clear them |
| Overview | 4 | View project overview summary; Confirm charter setup state on overview; Open project chats from overview; Update task counts after creating a task |
| Task creation | 4 | Create a task from the board dialog; Create a task from the board dialog with task type selection; Create a task from the Tasks page quick create entry point; Quick create a task in the Todo column |
| Comments / status | 6 | Post a comment on a task; Delete an existing task comment; Post and delete a task comment; Move a task from Todo to Backlog; Move a task from Backlog to Todo; Move a task from Todo to Backlog and back |

The README's “Kanban (create, move, …)” puts the word “move” on the board row, while the three move cases fit the comments/status row of 6. Swapping a move case into Kanban would break both claimed integers, so the published integers match the titles only with moves counted under comments/status.

## Claim verification

| Claim | Verdict | Evidence |
|---|---|---|
| REST, MCP, CLI, and web UI ship in one binary | **FALSE** | Release installs three binaries (`forge`, `forge-ctl`, `forge-solo`) plus a separate `web/dist` tree ([install.sh L72–L98](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/install.sh#L72-L98), [Dockerfile L68–L78](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/Dockerfile#L68-L78)). REST and MCP are both inside the `forge` process when MCP is enabled ([route](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/crates/mcp-server/src/protocol.rs#L144-L147)). The public demo passes `--no-mcp` ([entrypoint L78](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/deploy/demo/forge-demo-entrypoint.sh#L78)). Live `POST /mcp` returned **405** `Allow: GET,HEAD` (SPA fallback). |
| Every PR builds a fresh demo image, deploys it through Dokploy, waits until that build is serving, runs a 53-test suite, and the check is green only when the build is live and the suite passes | **FALSE** as stated | The result job implements the green predicate ([yml L326–L351](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/.github/workflows/demo-testsprite.yml#L326-L351)), and successful deploys do log `Dokploy accepted the deploy` plus `The demo serves build <run>-<attempt>-<sha>` before the action (for example [39704473553](https://github.com/ForgeAILab/forge/actions/runs/39704473553)). It is not every PR: 45/59 runs skipped (docs paths, drafts, forks, Dependabot); no `push` to `main`. The check has **never** been green (0/59). It did not block [#88](https://github.com/ForgeAILab/forge/pull/88) or [#93](https://github.com/ForgeAILab/forge/pull/93). A red suite still leaves that image on the public URL. |
| Coverage: task detail 10, app shell 8, Kanban 7, settings 6, account 4, tasks table 4, overview 4, task creation 4, comments/status 6 | **VERIFIED** | Sum is 53. The latest JUnit has 53 names and the partition above hits each integer. Plans are not in git; this is from the uploaded JUnit, not from a committed plan file. |
| First run scored 48/53 | **UNVERIFIED** | Stated in the [PR #88 body](https://github.com/ForgeAILab/forge/pull/88) (“53 tests: 48 passed, 4 failed, 1 blocked”). No Actions log in the 59-run history prints `48/53`. The project had zero tests on 2026-10-15; the first logged 53-case run is 51/53 on 2026-10-18. |
| First-run bug: clearing a description did not save | **VERIFIED** as a real defect the suite caught, **UNVERIFIED** as specifically the 48/53 run | [39083306026](https://github.com/ForgeAILab/forge/actions/runs/39083306026) failed “Clear task description and restore empty state”. Later runs pass it. Server treats a missing description as unchanged (`description.map(Some)` in [update.rs](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/crates/services/src/task_service/update.rs#L97)); the UI now PATCHes `description: ''` ([task-description.test.tsx](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/web/src/components/task-description.test.tsx#L209-L224)). |
| First-run bug: non-default task types were invisible | **UNVERIFIED** as a TestSprite failure (no retained failing case with that name). The fix is in the tree and a related case passes now. | Badge renders only for non-`task` types ([task-type-badge.tsx](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/web/src/components/task-type-badge.tsx#L10-L18), [card](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/web/src/components/kanban-task-card.tsx#L123), [unit test](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/web/src/components/kanban-task-card.test.tsx#L108-L162)). Latest JUnit passed “Create a task from the board dialog with task type selection”. |
| First-run bug: header logo linked to the wrong place | **UNVERIFIED** as a TestSprite failure. Current code and the latest suite pass. | Brand `Link` `to="/"` with `aria-label="Forge home"` ([app-shell.tsx](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/web/src/components/app-shell.tsx#L455-L461), [unit test](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/web/src/components/app-shell.test.tsx#L61-L77)). “Use the brand link to open Forge home” passed on the 47/53 run, and it was not among the failures of the 51/53 or 52/53 runs. |

## Code quality

Large, deliberate Rust workspace: shard checker so a new crate cannot silently drop out of CI, fmt/clippy, `cargo audit`, CodeQL, OpenSSF Scorecard, generated TypeScript bindings with a drift gate, `forbid(unsafe_code)` on the API crate. Web CI runs lint, `tsc`, Vitest, production build, and a Playwright smoke in one job so one failure does not hide the next. Demo mode is a real lockdown (command spawn, agent turns, local paths, Git redirects, cookie session with CSRF), reviewed in the PR #88 commits, not a flag that only hides a button.

Smells that matter for judging:

- README still says the product is public beta `0.1.x` ([README status](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/README.md#L160-L167)) while `workspace.package.version` is `0.14.1`.
- `docs/demo-instance.md` suite section is still the HTML comment “fill in after the TestSprite suite exists”.
- Dockerfile dependency layer runs `cargo build … || true`, so the layer does not cache compiled deps ([documented](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/docs/demo-instance.md#L391-L398)).
- One shared public URL. Concurrent PRs queue, and a third waiter is cancelled. The URL is offline between stop and reseed, and it keeps showing the last PR, including a red one.
- The project documents that anyone who can push a branch can edit the workflow and read `DOKPLOY_API_KEY` and `TESTSPRITE_API_KEY` ([docs](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/docs/demo-instance.md#L319-L327)).
- OAuth metadata advertises `https://forge.oc.mai1015.com/mcp` while the process is started with `--no-mcp`.

## Live-site behavior

Probed 2026-10-23 with curl. Times are roughly 0.07–0.21s. Cloudflare in front. No account was created.

| URL | Result |
|---|---|
| https://forge.oc.mai1015.com/ | **200** `text/html`, title `Forge`, SPA shell (~4.9 KB HTML) |
| https://forge.oc.mai1015.com/healthz | **200** `ok` |
| https://forge.oc.mai1015.com/demo-build.txt | **200** `39704473553-1-7b5014eb93e8bd0c5216abf061e45fddb5e12d64` — the failed PR #93 run, not a green build |
| https://forge.oc.mai1015.com/login , `/register`, `/projects`, `/tasks` | **200** SPA shell (client routes) |
| https://forge.oc.mai1015.com/does-not-exist-xyz and `/favicon.ico` | **200** SPA HTML. Unknown pages do not 404. `favicon.ico` is the HTML shell; `/logo.png` is a real PNG. |
| https://forge.oc.mai1015.com/api/v1/does-not-exist | **404** JSON `route not found` |
| `POST /api/v1/auth/login` `{}` | **422** missing `email` (handler is live; no account created) |
| `GET /api/v1/projects`, `GET /api/v1/auth/me` | **401** `missing_token` |
| `GET /.well-known/oauth-protected-resource` | **200** JSON, resource `https://forge.oc.mai1015.com/mcp` |
| `POST /mcp` JSON-RPC `initialize` | **405** `Allow: GET,HEAD` |
| `GET /assets/index-Ypng4pFX.js` | **200** javascript |

What works: the SPA boots, the API process is up, auth is enforced, health and the build id are public. What does not: MCP is off, agents and user commands are refused by demo mode (by design, [PR #88](https://github.com/ForgeAILab/forge/pull/88)), and the serving build failed 6 of 53 browser tests. README's “14 seeded tasks” was not checked; that needs a logged-in session. **UNVERIFIED.**

## Demo

No demo video. The live URL is an interactive seeded board with open registration and in-memory data wiped on every redeploy ([README](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/README.md#L87-L93)). A judge can click through tasks. They cannot watch the thing the README sells — agents collaborating in worktrees — because `--demo` disables server-side agents and command execution.

## Weaknesses / risks for judges

- The headline check has never passed, and `main` was updated anyway. A judge who opens the latest Actions run sees 47/53 and a red required-looking job that is not required.
- Test plans are not in the repository, so the 53 cases cannot be diffed, re-run offline, or reviewed like Ninety's committed plans. `docs/demo-instance.md` still says the coverage write-up is missing.
- The public demo disables MCP, agents, and shell commands. The live site is a task UI, not the multi-agent product.
- One mutable URL means the demo a judge hits is whichever PR deployed last, including a failing one, and it is offline during the next deploy.
- “Every PR” is not true: documentation PRs, Dependabot, drafts, and forks never run the suite, and merge to `main` does not re-run it.
- The 48/53 “first run” number is only in the PR text. The recorded history starts at “no tests”, then 51, 52, then a regression to 47.
- Best score left a product-adjacent failure (“Update task counts”) red, and the authors merged with that explanation unproven in a later green run.
- Release story overclaims a single binary.

## Where it beats Ninety

Ninety baseline: Schengen 90/180 calculator, plans committed, GitHub App “TestSprite V3” with green PR runs, backend CLI gate. Forge is a different product. These are the specific capabilities Ninety does not have.

1. **The suite runs only after the public URL is serving that workflow's image.** The demo image bakes `FORGE_DEMO_BUILD_ID`, the job polls `https://forge.oc.mai1015.com/demo-build.txt` until it equals that id and `/healthz` is 200, and only then starts TestSprite ([workflow](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/.github/workflows/demo-testsprite.yml#L292-L324), log line on [39704473553](https://github.com/ForgeAILab/forge/actions/runs/39704473553)). Ninety's TestSprite runs target a standing Vercel deployment; they do not prove the preview is the PR's build id before the suite. To match, Ninety would need a per-PR artifact with a public build id and a wait that fails the job if a different deployment is still answering.

2. **A result job that treats a skipped suite as a failure.** If the image build fails, the suite job is skipped and “Demo TestSprite result” still runs and exits 1 ([yml L326–L351](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/.github/workflows/demo-testsprite.yml#L326-L351)). That is aimed at the false-green skipped-job problem. Ninety's `testsprite-smoke.yml` is the opposite shape (broken invocation, and disabled). Matching this means a final job with `if: always()` whose success requires the suite job's `result == success`, and then actually marking that check required. Forge itself never took the second step, and docs-only PRs skip the whole workflow, so the pattern is only half-used.

3. **TestSprite failures on the deployed build were turned into product patches, with the same cases re-run on the next image.** Description-clear and title-edit failed on [39083306026](https://github.com/ForgeAILab/forge/actions/runs/39083306026) (51/53) and passed on [39097589821](https://github.com/ForgeAILab/forge/actions/runs/39097589821) (52/53) after [`8e84deb`](https://github.com/ForgeAILab/forge/commit/8e84deb29a8d9a4ac4ee46324d6c34e2ba59a15a), with Vitest coverage of the empty-string PATCH ([task-description.test.tsx](https://github.com/ForgeAILab/forge/blob/847a35f35d5dad58b41aa767579e946e4d244617/web/src/components/task-description.test.tsx#L209-L224)). Ninety already has red→green notes in `LOOP-ITERATIONS.md` and a higher peak pass rate. What Ninety does not have is that loop tied to “deploy this SHA, wait until it is the live host, then re-run.” The Forge loop never reached green, so this is a technique lead, not a scoreboard lead.

4. **Native test mass behind the UI.** Current `main` CI is 6,866 Rust tests passed plus 842 Vitest ([run 39706670982](https://github.com/ForgeAILab/forge/actions/runs/39706670982)), against Ninety's Vitest 367 passed / 3 skipped. That is product-test depth, not TestSprite depth. Matching it is not a TestSprite task; it is a larger engine.

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 8 | Real pain (agents colliding in one checkout), a shipped beta, not a weekend CRUD app. The hackathon layer is a demo gate on a product that already existed (repo created 2026-05-16, 53 merged PRs). |
| TestSprite depth | 6 | Deploy-pinned full-project action, JUnit, dashboard links, one partial fix loop. No plans in git, no MCP, no App check, no schedule, no required status, zero green runs, later regression to 47/53. |
| Verifiability | 5 | Workflow, live build id, and JUnit make the mechanism easy to audit, and that audit falsifies “every PR” and “one binary.” 48/53 has no execution URL. |
| Polish | 8 | Typed Rust, shard CI, CodeQL, audit, demo lockdown, fast live SPA. Points off for the stale beta banner, the unwritten suite section, and a live demo that disables the core product. |
| Demo | 3 | No video. Live URL loads and is a real app. It cannot show agent collaboration, and the build it is serving failed the suite. |
| **Overall** | **6** | Ambitious TestSprite wiring on a strong product, with a gate that has never gone green and does not block merges. |

Technique Ninety lacks: bake a build id into the deployed artifact, poll the public URL until that exact id is serving, then run the TestSprite project, and fail a follow-up job when the suite job is skipped. Forge lacks Ninety's committed plans, GitHub App check with green history, backend CLI gate, and nightly differential runs.
