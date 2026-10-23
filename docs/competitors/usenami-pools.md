# Usenami Pools (colosseum-pools)

- **Name:** Usenami Pools
- **Author:** namixai
- **Repo:** https://github.com/namixai/colosseum-pools
- **Live:** https://pools.usenami.io/
- **TestSprite PR:** https://github.com/namixai/colosseum-pools/pull/157 (merged 2026-10-19; title still says DRAFT). Related open PR https://github.com/namixai/colosseum-pools/pull/154 never received a TestSprite status.
- **Cited green run:** https://github.com/namixai/colosseum-pools/actions/runs/39253494120 (workflow `testsprite`, commit https://github.com/namixai/colosseum-pools/commit/80268f22a055bf9244709eddc42fc8048d9be23d)
- **Demo:** none (no video linked from the README or `docs/`)
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7

## What it is

An investor opens a pool on Hyperliquid testnet. The pool is a contract that holds capital and rules (daily loss, drawdown, leverage, allowed perps). A trader or AI agent pays for a challenge, signs order fields with their own wallet, and never holds the key that talks to Hyperliquid. In this demo that key sits in the operator's pool gateway, which checks platform caps before it signs. The live site is a static app for listing pools, buying nothing on the archived deployment, reading economics, and checking on-chain evidence. It is a Colosseum Crypto World's Fair hackathon demo, mock USDC, no real funds. The problem is real (prop-style trader funding with keys the trader does not hold). The TestSprite suite only walks the public pages.

## Architecture

Static multi-page-feeling SPA with hash routes, no bundler and no `package.json`. Contracts are Solidity on Foundry, offline against `hyper-evm-lib`. The gateway, keeper, and trader client are Python. Deploy target is the operator's host, not Vercel or Render: the app is the `app/` tree on Cloudflare at `pools.usenami.io`; the gateway listens on localhost and nginx publishes `pools-api.usenami.io` ([docs/HOSTING.md](https://github.com/namixai/colosseum-pools/blob/main/docs/HOSTING.md)).

| Piece | Role | Link |
| --- | --- | --- |
| Chain config | `chainId: 998`, HyperEVM testnet RPC, mock USDC, gateway URL | [app/config.js](https://github.com/namixai/colosseum-pools/blob/main/app/config.js) |
| Router, demo gate, "Not found" | hash routes; unknown hash renders "Not found" in the page | [app/app.js](https://github.com/namixai/colosseum-pools/blob/main/app/app.js) |
| Shell | header links and footer Terms; gate dialog | [app/index.html](https://github.com/namixai/colosseum-pools/blob/main/app/index.html) |
| Contracts | `PoolFactory`, `Pool`, `ChallengeAccount`, `KeyRegistry`, `RuledAccount` | [src/](https://github.com/namixai/colosseum-pools/tree/main/src) |
| Gateway | checks then signs | [gateway/server.py](https://github.com/namixai/colosseum-pools/blob/main/gateway/server.py) |
| Own CI | scrub, identity, gateway/agents/ops unit tests, node tests, `forge test` | [.github/workflows/ci.yml](https://github.com/namixai/colosseum-pools/blob/main/.github/workflows/ci.yml) |

`config.js` on the live host matches the repo: chain 998, name "HyperEVM Testnet". Gateway health `{"ok": true, "chain_id": 998, "signer": "demo", ...}` at https://pools-api.usenami.io/v1/health.

## TestSprite integration depth

**Score: 4 / 10.** A real GitHub integration posts a `TestSprite V3` commit status and a `testsprite[bot]` comment, the suite is eight named frontend flows, and there is a public red-to-green trail with CLI logs. The check stays `success` when a test fails, nothing in git is the test source, the suite hits production rather than the PR, there is no MCP config, no schedule, and the CLI workflow was deleted.

### GitHub App / commit status

The signal is a commit status, context `TestSprite V3`, creator `testsprite[bot]`, plus a PR comment. It is not a GitHub Actions check run. Statuses below are from `GET /repos/namixai/colosseum-pools/commits/{sha}/statuses`.

| When (UTC) | Where | Result | Execution |
| --- | --- | --- | --- |
| 2026-10-19 11:29 | PR 157 commit [`40571cbe`](https://github.com/namixai/colosseum-pools/commit/40571cbebcc3d40c26c6e208d7d823b5aaca7cbc) | description **7/8 passed · 1 failed**, state **success** | [6d211ac1](https://www.testsprite.com/dashboard-v3/o/687ab7c4-424e-5edc-943a-d11cc261c0de/projects/e22437c5-ce0a-474d-946a-86274de95076/execution/6d211ac1-5434-4317-aa83-4fc5e7588900) |
| 2026-10-19 12:37 → 12:39 | PR 157 commit [`80268f22`](https://github.com/namixai/colosseum-pools/commit/80268f22a055bf9244709eddc42fc8048d9be23d) | pending "8 tests queued", then **All 8 tests passed** | [bdad5c24](https://www.testsprite.com/dashboard-v3/o/687ab7c4-424e-5edc-943a-d11cc261c0de/projects/e22437c5-ce0a-474d-946a-86274de95076/execution/bdad5c24-047f-4502-9363-4846f93b9ced) |
| 2026-10-19 13:26 | PR 157 commit [`ffa9aa40`](https://github.com/namixai/colosseum-pools/commit/ffa9aa408d95fdff995fcbfc17c4287579ba6b8d) | **All 8 tests passed**; comment on PR 157 | [f7718295](https://www.testsprite.com/dashboard-v3/o/687ab7c4-424e-5edc-943a-d11cc261c0de/projects/e22437c5-ce0a-474d-946a-86274de95076/execution/f7718295-1e2e-4c0d-8198-21ba1abb06fe) |
| 2026-10-19 15:56 | PR [158](https://github.com/namixai/colosseum-pools/pull/158) head, later merged | description **7/8 passed · 1 failed**, state **success**. Comment names the failure: "Open a non-existent route" (browser HTTP 404, not the in-app "Not found") | [34ba3331](https://www.testsprite.com/dashboard-v3/o/687ab7c4-424e-5edc-943a-d11cc261c0de/projects/e22437c5-ce0a-474d-946a-86274de95076/execution/34ba3331-fd2a-49b3-b8a2-fa7729f933e0) |
| 2026-10-20 to 2026-10-23 | Heads of merged PRs [155](https://github.com/namixai/colosseum-pools/pull/155), [156](https://github.com/namixai/colosseum-pools/pull/156), [159](https://github.com/namixai/colosseum-pools/pull/159), [160](https://github.com/namixai/colosseum-pools/pull/160), [161](https://github.com/namixai/colosseum-pools/pull/161), [162](https://github.com/namixai/colosseum-pools/pull/162), [164](https://github.com/namixai/colosseum-pools/pull/164), [165](https://github.com/namixai/colosseum-pools/pull/165), [166](https://github.com/namixai/colosseum-pools/pull/166), [168](https://github.com/namixai/colosseum-pools/pull/168), [169](https://github.com/namixai/colosseum-pools/pull/169) | each **All 8 tests passed**, state success | one execution URL per status (example, PR 169: [2d9235d3](https://www.testsprite.com/dashboard-v3/o/687ab7c4-424e-5edc-943a-d11cc261c0de/projects/e22437c5-ce0a-474d-946a-86274de95076/execution/2d9235d3-a3c8-494f-84f8-3ab6a9a1ef86)) |

Dashboard HTML is a login shell (title "TestSprite", HTTP 200, no test names). Counts above come from the commit-status description and the bot comment, which do list the eight titles on the green PR 157 comment.

The eight tests, from the [README table](https://github.com/namixai/colosseum-pools/blob/main/README.md) and from the CLI env on [run 39253494120](https://github.com/namixai/colosseum-pools/actions/runs/39253494120):

1. Accept demo gate and load pools home
2. Open Terms page (footer link to `#/terms`)
3. Open Economics page from header navigation
4. Use the economics calculator
5. Load the evidence page from header navigation
6. Open a pool verification page
7. Open a non-existent route
8. Verify header navigation remains available after entry

Project id `e22437c5-ce0a-474d-946a-86274de95076`, org `687ab7c4-424e-5edc-943a-d11cc261c0de`. Test UUIDs are in the workflow at [`80268f22` `.github/workflows/testsprite.yml`](https://github.com/namixai/colosseum-pools/blob/80268f22a055bf9244709eddc42fc8048d9be23d/.github/workflows/testsprite.yml). No file in git uses the labels `NAV-002` or `NAV-005`.

### Required check?

Branch-protection API: **403** (`GET /repos/namixai/colosseum-pools/branches/main/protection`). Rulesets API succeeds. Active ruleset [`main-only-admin-moves-it`](https://github.com/namixai/colosseum-pools/rules/25235849) (id 25235849) targets `refs/heads/main` with rule types `deletion`, `non_fast_forward`, and `update`. There is no `required_status_checks` rule. PR 158 merged at 2026-10-19 19:20Z while its `TestSprite V3` description was still "7/8 passed · 1 failed". That description's state was `success`, so a required-check rule would not have blocked it anyway.

### CLI

Present only on the `testsprite/*` branch history, removed before merge. File at [`80268f22`](https://github.com/namixai/colosseum-pools/blob/80268f22a055bf9244709eddc42fc8048d9be23d/.github/workflows/testsprite.yml): `npm install -g @testsprite/testsprite-cli@0.15.0`, `testsprite doctor`, then for each id `testsprite test result <id> --include-analysis` and `testsprite test artifact get <run> --failed-only`, then `testsprite test run <id> --target-url https://pools.usenami.io --wait`. Trigger: `pull_request` to `main`, job `if: startsWith(github.head_ref, 'testsprite/')`. An earlier commit added `testsprite-preview.yml` to write a deployment record at the live URL; the next commit removed it because TestSprite reported the URL never became ready. Current `main` and the branch tip contain only `ci.yml`. GitHub still lists the old workflow names as historical workflow records. No schedule. `ci.yml` never calls TestSprite.

### MCP

No TestSprite MCP config, server, or client in the repo.

### Plans committed

**0 executable plans in git.** The README table is documentation. Generated Playwright (`code.py`) exists only inside the Actions artifact of the deleted workflow (downloaded from runs 39237263022 and 39244780567). Those files are not on `main`.

### Triage

`testsprite[bot]` comments on the PR with pass/fail counts, per-test dashboard links, and on the failure a suggested-fix prompt (PR 158: SPA fallback / custom 404). No TestSprite issues. No auto-fix bot. CodeRabbit comments and skipped the draft. The CLI job archived failure JSON and video for 14 days.

### Red → green

1. **CLI run 1, red.** [39235348330](https://github.com/namixai/colosseum-pools/actions/runs/39235348330) on `6368fe82`: `test run --all`, **4/8 passed, 4 failed/blocked**. Failed: evidence, Terms. Blocked: unknown route, demo gate. Execution [73b0267d](https://www.testsprite.com/dashboard-v3/o/687ab7c4-424e-5edc-943a-d11cc261c0de/projects/e22437c5-ce0a-474d-946a-86274de95076/execution/73b0267d-fd93-473b-8399-37d8dc9a11e8). No `TestSprite V3` status on this commit.
2. **CLI run 2, red.** [39237263022](https://github.com/namixai/colosseum-pools/actions/runs/39237263022) on `da902ab9`: evidence **failed** (checkbox timeout), Terms **failed** (Terms is in the footer, header has Pools / New pool / Shared pool / Economics / Check it yourself / On chain), unknown route passed, calculator passed, economics passed, demo gate **blocked**, header-after-entry **blocked**, verify **blocked**. Block text names Cloudflare Bot Fight / WAF. **3 passed, 2 failed, 3 blocked.**
3. **CLI run 3, red, and the first native status.** Empty commit [`40571cbe`](https://github.com/namixai/colosseum-pools/commit/40571cbebcc3d40c26c6e208d7d823b5aaca7cbc) ("Bot Fight Mode off"). CLI [39244780567](https://github.com/namixai/colosseum-pools/actions/runs/39244780567): evidence **failed**, Terms **failed**, other six **passed** (6/8). Same commit's native status: **7/8 passed · 1 failed**, state success ([6d211ac1](https://www.testsprite.com/dashboard-v3/o/687ab7c4-424e-5edc-943a-d11cc261c0de/projects/e22437c5-ce0a-474d-946a-86274de95076/execution/6d211ac1-5434-4317-aa83-4fc5e7588900)). The bot comment for that execution was replaced by the later green comment, so the single native failure is not named in git.
4. **Green, two native runs in a row, plus the cited CLI run.** Empty commit [`80268f22`](https://github.com/namixai/colosseum-pools/commit/80268f22a055bf9244709eddc42fc8048d9be23d): native **8/8** ([bdad5c24](https://www.testsprite.com/dashboard-v3/o/687ab7c4-424e-5edc-943a-d11cc261c0de/projects/e22437c5-ce0a-474d-946a-86274de95076/execution/bdad5c24-047f-4502-9363-4846f93b9ced)) and CLI [39253494120](https://github.com/namixai/colosseum-pools/actions/runs/39253494120) **8/8**, each `status=passed`, target `https://pools.usenami.io`. Next commit [`ffa9aa40`](https://github.com/namixai/colosseum-pools/commit/ffa9aa408d95fdff995fcbfc17c4287579ba6b8d) deletes the workflow because the native check collided with the CLI (`CONFLICT` / `run_in_flight`). Native again **8/8** ([f7718295](https://www.testsprite.com/dashboard-v3/o/687ab7c4-424e-5edc-943a-d11cc261c0de/projects/e22437c5-ce0a-474d-946a-86274de95076/execution/f7718295-1e2e-4c0d-8198-21ba1abb06fe)).
5. **Later regression, still a green GitHub state.** PR 158 native **7/8**, failed test "Open a non-existent route". Subsequent sampled PR heads through 2026-10-23 are 8/8 again. No app commit in PR 157 sits between the red and the green; `80268f22` has an empty file list.

### Credits

No credit balance, plan, or spend figure in the repo, the PR body, or the public status text.

### Target URL

Every CLI result JSON in the green log and the failure artifacts has `"targetUrl": "https://pools.usenami.io"`. Environment names include `github-pr-152`, `github-pr-157`, and `default`, and the URL on those rows is still the live site. There is no preview hostname in the workflow or the README.

## Test inventory

| Layer | Claimed | Verified | Evidence | Status |
| --- | --- | --- | --- | --- |
| TestSprite frontend | 8 | 8 titles; green runs report 8 passed | [README](https://github.com/namixai/colosseum-pools/blob/main/README.md), [status on 80268f22](https://github.com/namixai/colosseum-pools/commit/80268f22a055bf9244709eddc42fc8048d9be23d), [run 39253494120](https://github.com/namixai/colosseum-pools/actions/runs/39253494120) | VERIFIED as a count of cloud tests. Source not in git |
| TestSprite `NAV-002` / `NAV-005` | those ids failed | labels absent from repo, comments, logs, and failure `meta.json` | same artifacts | UNVERIFIED as names |
| Node app tests | (not in the hackathon claim) | **214 passed, 0 failed** locally with `node --test app/tests/*.test.mjs`; CI the same day **# pass 214** | [run 39960055638](https://github.com/namixai/colosseum-pools/actions/runs/39960055638) job `app` | VERIFIED |
| Foundry | (not in the claim) | CI **155 passed, 0 failed, 5 suites** | same run, job `contracts` | VERIFIED via CI. Local: not runnable (`forge` missing, `lib/hyper-evm-lib` submodule not checked out) |
| Python gateway | | CI **Ran 302 tests … OK** | same run, job `gateway` | VERIFIED via CI |
| Python agents | | CI **Ran 97 tests … OK** | same run | VERIFIED via CI |
| Python ops/keeper | | CI **Ran 220 tests … OK** | same run | VERIFIED via CI |
| Mutation catalog | | CI `mutations --check: 1176 mutations, each matching once` (pointer check, not a full mutant execution) | same run | VERIFIED as a catalog gate |
| Audit-finding pins | | `22 findings, 16 pinned by tests, 6 with a stated reason` | same run | VERIFIED |
| Stress / book tests | README points at `stress/` | not in `ci.yml`; not run here | [stress/](https://github.com/namixai/colosseum-pools/tree/main/stress) | UNVERIFIED count |

Python unit tests were not run locally: they need `hyperliquid-python-sdk==0.24.0` and `anthropic`, and today's CI log already records the three suites. No `node_modules` was installed.

## Claim verification

| Claim | Verdict | Evidence |
| --- | --- | --- |
| Trader-funding pools demo on HyperEVM testnet, chain 998, testnet only | VERIFIED for the demo that is deployed | [README](https://github.com/namixai/colosseum-pools/blob/main/README.md) ("Testnet only: HyperEVM testnet (chain 998) and mock USDC"); live [config.js](https://pools.usenami.io/config.js) `chainId: 998`; health https://pools-api.usenami.io/v1/health `chain_id: 998`. [docs/MAINNET-INACTIVITY.md](https://github.com/namixai/colosseum-pools/blob/main/docs/MAINNET-INACTIVITY.md) is a spec and says nothing on chain implements it |
| 8 tests: demo gate, Terms, Economics, calculator, evidence, verify, unknown route, header after entry | VERIFIED | README table and the eight `testTitle`s in [run 39253494120](https://github.com/namixai/colosseum-pools/actions/runs/39253494120), all `passed` |
| Latest red run 7/8, NAV-002 failed; earlier also failed NAV-005 | UNVERIFIED on the ids; the 7/8 counts are real and the "latest" one is easy to mis-time | Native status on `40571cbe` is "7/8 passed · 1 failed" and does not name the test. The CLI job on that same commit failed **two** tests (evidence and Terms), so it is 6/8. The later native 7/8 is PR 158, failed test **"Open a non-existent route"**, and its GitHub state is still success. Strings `NAV-002` and `NAV-005` do not appear in the repo, the bot comments, the CLI logs, or the failure artifacts |
| Native PR check, then green 8/8 two runs in a row | VERIFIED | `80268f22` status "All 8 tests passed" ([bdad5c24](https://www.testsprite.com/dashboard-v3/o/687ab7c4-424e-5edc-943a-d11cc261c0de/projects/e22437c5-ce0a-474d-946a-86274de95076/execution/bdad5c24-047f-4502-9363-4846f93b9ced)) then `ffa9aa40` "All 8 tests passed" ([f7718295](https://www.testsprite.com/dashboard-v3/o/687ab7c4-424e-5edc-943a-d11cc261c0de/projects/e22437c5-ce0a-474d-946a-86274de95076/execution/f7718295-1e2e-4c0d-8198-21ba1abb06fe)). The cited Actions run is a third green, the CLI, on the first of those commits. PR 158 later went back to 7/8 |
| Whole suite on every push to a PR, without their own CI | FALSE as written | After `ffa9aa40`, `ci.yml` does not run TestSprite and the status is `testsprite[bot]`. The green run the submission cites **is** their workflow [39253494120](https://github.com/namixai/colosseum-pools/actions/runs/39253494120). Not every commit on a PR has a status: on PR 157 the first four commits have none; on PR 166 commit `8d8cecd` (2026-10-22 15:04Z) has none while the commits before and after do. Statuses that do exist report all 8 tests |
| Suite runs against the live site, not a preview | VERIFIED | Workflow `TARGET_URL`, result JSON `targetUrl`, and the README sentence. PR 157 body: "The suite runs against the deployed site, not against this branch." |
| Fixes were to tests, not app code | VERIFIED for the PR 157 red-to-green, with one infra change beside the test edits | PR 157's merged diff is `README.md` only (+25). `80268f22` is empty and says Terms and Evidence were corrected in the TestSprite project. `40571cbe` is empty and says Bot Fight Mode was turned off on the zone. No `app/` or `src/` change is in that PR. The Terms failure text matches the live header: Terms is only in the footer ([app/index.html](https://github.com/namixai/colosseum-pools/blob/main/app/index.html)) |
| Demo: none | VERIFIED | No video URL in the README or `docs/` |
| README: "all passing on 16 October 2026" | UNVERIFIED | The first public runs are 19 October and several failed. PR 154's commits say TestSprite was not running checks when that PR opened. No 16 October execution is linked from git |

## Code quality

The tree is split the way the README says (`src`, `gateway`, `app`, `agents`, `ops`, `stress`, `docs`). Prose in the README and design docs states what the demo does not prove (gateway custody, leverage not enforced on the host until a newer build is deployed). CI pins Actions by commit SHA, runs a secret scrub that includes its own falsification script, requires a GitHub noreply identity, and checks that each mutation id and each audit finding still points at a test. The app is plain JavaScript modules, no TypeScript and no linter in CI. Ethers is loaded from cdnjs. The mutation catalog is a large hand-maintained table; CI checks that each entry matches once, and a full mutant run is separate. PR 157 was merged while its title said it was not for `main`. Turning Bot Fight Mode off so the runner could see the site is an availability change on the public hostname. The TestSprite status reporting success with a failed test is the sharpest process smell: a red suite does not look red on the PR.

## Live-site behavior

Checked 2026-10-23 with HTTP GET. Times are one sample.

| URL | Result |
| --- | --- |
| https://pools.usenami.io/ | **200** in 0.15s, `server: cloudflare`, title "Pools on Hyperliquid · testnet". Body includes the header links, the testnet/mock notice, and the gate checkbox "I understand this is a testnet demo." |
| https://pools.usenami.io/index.html | **200**, same document |
| https://pools.usenami.io/config.js | **200** in 0.11s, `chainId: 998`, `chainName: "HyperEVM Testnet"`, testnet RPC and mock USDC address |
| https://pools.usenami.io/app.js | **200**, module that contains the "Not found" render |
| https://pools.usenami.io/does-not-exist | **404** in 0.10s, empty error body. This is the edge/origin 404, not the in-app hash "Not found" page. It matches the PR 158 failure text ("HTTP ERROR 404") |
| https://pools-api.usenami.io/ | **404** nginx |
| https://pools-api.usenami.io/v1/health | **200** in 0.13s, `ok: true`, `chain_id: 998`, `signer: "demo"`, `keys: 92`, `max_order_notional_usdc: 400` |

Hash routes (`#/terms`, `#/economics`, `#/evidence`, `#/verify`) are the same HTML document, so curl cannot show them. No forms were submitted. A second fetch of `config.js` without a browser user-agent returned 403; the first fetch had already recorded chain 998.

## Demo

No demo video. The live site is the walkthrough: a gate, a pool list, economics, evidence, and a verify page, all on testnet. Length: n/a.

## Weaknesses / risks for judges

- The suite is eight read-only navigation tests. It never buys a challenge, signs an order, or touches the contracts or the gateway. Those layers have their own tests; TestSprite does not cover them.
- The suite targets production. A PR that breaks the app does not fail TestSprite until that break is deployed. A PR that only changes contracts can stay 8/8 forever.
- `TestSprite V3` state was `success` on both 7/8 results. PR 158 merged in that state. The ruleset does not require the status.
- Test source and the `NAV-*` ids are not in git. A judge cannot re-run the suite without the project and an API key. The README's "all passing on 16 October 2026" has no public run behind it.
- The green transition edited tests (and a Cloudflare setting) after the tests disagreed with the page. The Terms test wanted a header link the product puts in the footer.
- Their own CLI job, which is the run the submission links as green, was removed. What remains is the native status.
- One later push (PR 158) failed the unknown-route test against the live 404, then later PRs passed again with no test file in git to show what changed.
- Host notes in HOSTING.md: a single `t3.small`, gateway and keeper sharing one rate-limited RPC again after 18 October, instance tagged to terminate on 2026-12-06. That is operational risk for the demo, not a TestSprite finding.
- Bot Fight Mode was disabled so automation could reach the site.

## Where it beats Ninety

Ninety is the Schengen 90/180 calculator at https://github.com/mohamedwael201193/ninety (live https://ninety-coral.vercel.app): plans in git, a TestSprite V3 check, a backend CLI workflow, and a broken/disabled smoke schedule. Usenami is ahead on three narrow points.

1. **Mutation pointers are a CI gate.** Every push runs `python scripts/mutations.py --check` and the job on [2026-10-23](https://github.com/namixai/colosseum-pools/actions/runs/39960055638) printed `1176 mutations, each matching once`, after a script that proves the check can go red ([scripts/mutations.py](https://github.com/namixai/colosseum-pools/blob/main/scripts/mutations.py)). Ninety has no mutation testing. To match, Ninety would need a catalog or a mutation tool whose result fails CI when a behavior has no killing test. Usenami's CI step checks that each id still names a test; it does not re-execute all 1176 mutants on the PR.
2. **A working, pinned CLI diagnostic loop, with the artifacts still public.** On the branch, CLI `0.15.0` fetched `testsprite test result <id> --include-analysis` and `testsprite test artifact get --failed-only`, then ran one test at a time with `--target-url`, and uploaded the bundles ([workflow at 80268f22](https://github.com/namixai/colosseum-pools/blob/80268f22a055bf9244709eddc42fc8048d9be23d/.github/workflows/testsprite.yml), log [39253494120](https://github.com/namixai/colosseum-pools/actions/runs/39253494120)). Ninety's smoke workflow is broken (several test ids, no `--local`) and the full CLI nightly is disabled. To exceed this, Ninety would keep a pinned CLI job that stores the analysis JSON, and would not delete it once the GitHub status exists. Usenami did delete it (`ffa9aa40`), so the technique is demonstrated, not a standing gate.
3. **The ruleset is readable and blocks a force-push and a branch delete.** [`main-only-admin-moves-it`](https://github.com/namixai/colosseum-pools/rules/25235849) is public. Ninety's branch-protection API returns 403, and Ninety PR 63 merged while TestSprite V3 was red. Matching the readable ruleset is an API-visible ruleset. Matching a real gate is a `required_status_checks` rule on a status that turns `failure` when a test fails. Usenami does not have that second half: the 7/8 status stayed `success`, and PR 158 merged.

They do not beat Ninety on tests committed to git, on a backend TestSprite suite, on preview deploys of the PR, or on a check that can go red.

## Estimated judging scores

| Criterion | Score | Why |
| --- | --- | --- |
| Problem value | 7 | Prop-style funding with keys the trader never holds, contracts plus a gateway plus an evidence page, on a public testnet. The judged TestSprite slice ignores almost all of that. Mainnet is a one-page spec. |
| TestSprite depth | 4 | Status and bot comments on many real PRs, a logged red-to-green, pinned CLI for a few hours. Eight nav tests, not in git, production URL, check stays green on failure, not required, no MCP, no schedule, CLI job removed. |
| Verifiability | 6 | Statuses, Actions logs, and the live site confirm the eight tests, the 8/8 pair, chain 998, and the empty-commit fixes. `NAV-*` ids, the 16 October "all passing" line, and the dashboard executions are not publicly inspectable. |
| Polish | 7 | Unusual care in docs, CI hygiene, and the live page. The green-on-failure status, the merged "DRAFT, not for main" PR, and disabling Bot Fight Mode keep it short of an 8. |
| Demo | 2 | No video. The site itself is open and coherent. |
| **Overall** | **5** | A strong testnet product with a thin, honestly documented TestSprite layer that does not gate the code it claims to test. |
