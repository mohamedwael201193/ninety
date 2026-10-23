# HexKit (Timidan)

- **Name:** HexKit
- **Repo:** https://github.com/Timidan/hexkit (default branch `master`, HEAD `289a698` on 2026-10-22)
- **Live:** https://hexkit.app/ (apex redirects to https://www.hexkit.app/)
- **TestSprite PRs:** https://github.com/Timidan/hexkit/pull/41 (merged; the red→green browser loop), plus the follow-ups https://github.com/Timidan/hexkit/pull/43, https://github.com/Timidan/hexkit/pull/45, the nightly CLI https://github.com/Timidan/hexkit/pull/44, the loop write-up https://github.com/Timidan/hexkit/pull/42, and the 27-test README https://github.com/Timidan/hexkit/pull/46. There are no GitHub issues #43 or #45; those numbers are pull requests. The issue list is empty.
- **Demo:** https://youtu.be/YNzsIt0ea48 (oEmbed title “hexkit X testsprite”, author Timileyin Daniel). README calls it 82 seconds: https://github.com/Timidan/hexkit/blob/289a6986c325d91dcdac641174ea78f4d0e4408e/README.md
- **Blog:** https://www.timidan.xyz/blog/testsprite-hexkit-nobody-pressed-run
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7

Two TestSprite projects, same org `773ca03b-2f5a-5721-b256-828ee45aec66`:

- Browser / GitHub App: `c6ff7a85-e921-4d46-930a-0795e21aa9b4`
- API / CLI: `64b68673-1206-4461-9afb-b6a7f9e28f79` (“HexKit API” in the CLI summary)

## What it is

HexKit is a browser EVM developer toolkit: paste calldata and decode it, paste a mainnet transaction hash and replay it, browse verified source, compare bytecode, reconstruct storage layout, look up 4-byte selectors, and browse LI.FI Earn vaults. The user is a Solidity or protocol engineer who wants that surface without a desktop debugger install. The app is a year old (repo created 2025-09-12, 36 merged PRs) and already deployed; the hackathon delta is the TestSprite loop in PRs #41–#46, which caught real UI and public-RPC bugs on that existing surface. Wallet writes, the Gemini yield concierge, and the step-through debugger are explicitly out of the generated suites.

## Architecture

React 19, TypeScript, Vite 5, Tailwind 4, ethers v5, viem, wagmi, RainbowKit. Deployed as the Vercel project `web3-toolkit` (preview comments and production deploys post a `Vercel` status). Serverless proxies live in `api/` and are routed by [`vercel.json`](https://github.com/Timidan/hexkit/blob/289a6986c325d91dcdac641174ea78f4d0e4408e/vercel.json): EDB bridge proxy, LI.FI Earn / Composer / Intents, and rewrites to Sourcify and Blockscout. SPA fallback sends every non-API path to `index.html`.

| Piece | Role | Link |
|---|---|---|
| App shell and routes | `/`, `/simulation/:id`, everything else through `PersistentTools` | [`src/App.tsx`](https://github.com/Timidan/hexkit/blob/289a6986c325d91dcdac641174ea78f4d0e4408e/src/App.tsx) |
| Search → decoder | Home search opens `?tool=decoder&q=` | [`src/components/smart-decoder/SmartDecoder.tsx`](https://github.com/Timidan/hexkit/blob/289a6986c325d91dcdac641174ea78f4d0e4408e/src/components/smart-decoder/SmartDecoder.tsx) |
| Public RPC fallback | Default-mode provider walks archive RPCs on 429 / timeout | [`src/config/networkAccess.ts`](https://github.com/Timidan/hexkit/blob/289a6986c325d91dcdac641174ea78f4d0e4408e/src/config/networkAccess.ts), list in [`src/chains/registry.ts`](https://github.com/Timidan/hexkit/blob/289a6986c325d91dcdac641174ea78f4d0e4408e/src/chains/registry.ts) |
| OpenAPI description | Spec the API suite was generated from (7 paths) | [`api/openapi.yaml`](https://github.com/Timidan/hexkit/blob/289a6986c325d91dcdac641174ea78f4d0e4408e/api/openapi.yaml) |
| Nightly API workflow | `testsprite ci run` | [`.github/workflows/api-nightly.yml`](https://github.com/Timidan/hexkit/blob/289a6986c325d91dcdac641174ea78f4d0e4408e/.github/workflows/api-nightly.yml) |

About 105k lines of `.ts`/`.tsx` under `src/` and `api/` (426 files under `src/`). The README’s Rust REVM engine is not in the tree: `edb/` is an empty directory, there is no `.gitmodules`, and `./start-dev.sh` is not in the repo. Production `GET /api/edb/health` returns `"edbServerRunning": false` while `"status": "ok"` (see Live-site).

## TestSprite integration depth

**Score: 8 / 10.** The loop that is actually wired is deep and mostly checkable from GitHub: a GitHub App status on PR previews, a repo ruleset that names `TestSprite V3` as the only required check, a second cloud project so API runs do not clobber that check, a CLI cron that really executes, JUnit and summary artifacts, bot comments on PRs, and a red→green history with product fixes. It is not a 9 or 10 because the test plans are not in git, there is no MCP config, the “8 core flows” night schedule has no public run, the API-on-merge half never posts a completed GitHub status, and the latest production browser status is `success` while its description says one test failed.

### GitHub App check

Context name `TestSprite V3`, posted as a commit **status** (not a Check Run) by the TestSprite app. It tracks the **browser** project only. Counts below are the status description text.

| When | SHA | Result | Execution |
|---|---|---|---|
| PR #40 / #41 first push | `734ef17` | **failure** 14/20 passed · 1 failed · 5 blocked | [1ebcf3e1](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/1ebcf3e1-9de8-4d37-8527-9264f5344c67) |
| PR #41 docs commit | `02bc9df` | **failure** 14/20 passed · 2 failed · 4 blocked | [8b9abfc6](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/8b9abfc6-f277-438a-91b1-59a14d2d2298) |
| PR #41 tip (merged) | `85e70f1` | **success** All 20 tests passed | [679e510d](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/679e510d-a63b-4012-8f7a-f14db2d8002e) |
| PR #41 merge commit | `64f5bed` | no TestSprite status, Vercel only | [commit](https://github.com/Timidan/hexkit/commit/64f5bed2bfcd641ecf024d23d6126fde75405413) |
| PR #42 `707430f` | same | **failure** 19/20 passed · 1 blocked. A **pending** status for the API project `64b68673` was also posted (`837d4025`) and then overwritten by the browser status. | [a1b38992](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/a1b38992-dd2c-4ba4-bb5b-cc272be8f206) |
| PR #42 `e6b5028` | same | **failure** 19/20 passed · 1 blocked | [4771fbda](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/4771fbda-ec84-45c6-8a45-e304e5e20be4) |
| PR #42 `6a3b8f0` | same | **failure** 18/20 passed · 2 blocked | [f0cb9cd5](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/f0cb9cd5-6916-4390-8a31-e70d08ff8db5) |
| PR #42 head, merged while this was still pending | `0dc51e1` | pending 19:27:19Z, **success** All 20 at 19:31:23Z. Merged 19:28:28Z. | [35b76bb7](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/35b76bb7-4308-4855-b2df-1abb79fb4338) |
| PR #43 head / merge | `951bb13` / `cd718e7` | **success** All 20 / All 20 | [ecba59c8](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/ecba59c8-e576-4bbd-b8a2-832ac6cac23a), [e3e3f7a3](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/e3e3f7a3-cba9-43f9-b98b-312b3639cd91) |
| PR #45 head / merge | `d9fd411` / `365c1e5` | **success** All 20 / All 20 | [42f3b29a](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/42f3b29a-e85b-4e55-9b45-453c4789636d), [50d25c4f](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/50d25c4f-d023-46e1-84a6-64ce61ce1553) |
| PR #44 head / merge | `f5e1bdf` / `922aa2f` | **success** All 20 / All 20 | [05955801](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/05955801-0fcd-4e82-a66c-0848db6bac7d), [228c1e21](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/228c1e21-4c9d-4297-9d71-9ba9bd46b40d) |
| PR #42 merge commit | `79da41c` | **success** All 20 | [ff32e642](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/ff32e642-0d35-404f-b158-ad75781e7941) |
| PR #46 head | `f6fa42e` | **success** All 27 tests passed | [b4ede388](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/b4ede388-cfda-4671-8bcb-7ea5cba8dfbf) |
| PR #46 merge to master (current HEAD) | `289a698` | **state success**, description **“26/27 passed · 1 failed”** | [b61664f2](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/b61664f2-5b73-4cee-a2e6-5076f20fa1ea) |

`testsprite[bot]` comments on the PR with a per-test table and dashboard links. The comment is a single marker (`testsprite-v3-marker`) and is **replaced** by the latest run, so the red runs’ test names and screenshots are not preserved on the PR thread. The surviving green comment on #41 names these 20 browser tests: Persist simulation history after refresh, View vault position results for an address, View local storage inventory, Open Contract Explorer from the command palette, Replay a valid Ethereum transaction, Open a replay from simulation history, Generate a selector from a Solidity function signature, Open Integrations from the home page, Browse vaults by chain and asset, Load verified contract source by address, Resolve a function selector to its signature, Clear simulation history from local storage, Decode calldata from home search, View compiler and proxy details for a loaded contract, Open a vault details view, Decode calldata after entering raw input directly in the decoder, Resolve an event topic to its signature, Open Source Tools from the home page, Show validation for malformed transaction hash, Inspect replay result details and tabs. Comment: https://github.com/Timidan/hexkit/pull/41#issuecomment-6288767927 (2026-10-20T10:23:06Z, report [679e510d](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/679e510d-a63b-4012-8f7a-f14db2d8002e)).

PR #46’s bot comment adds 7 and lists 27 passed: the 20 above plus Compute keccak256, Compute sha256, Encode function calldata, Forecast a deposit on a vault, Show a caution notice on flagged vaults, Compare runtime bytecode of two verified contracts, Reconstruct a verified contract's storage layout. Report: [b4ede388](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/b4ede388-cfda-4671-8bcb-7ea5cba8dfbf).

Dashboard HTML is a login shell (`<title>TestSprite</title>`, 200, no execution payload), so pass/fail counts are taken from GitHub status descriptions and bot comments, not from the dashboard body.

### Required check (merge gate)

`GET /repos/Timidan/hexkit/branches/master/protection` returns **403** (integration cannot read classic branch protection).

`GET /repos/Timidan/hexkit/rulesets/13392431` returns the ruleset. It is **active**, targets `~DEFAULT_BRANCH`, `current_user_can_bypass: never`, `bypass_actors` null. Rules: deletion, copilot code review, update (restrict direct pushes), and `required_status_checks` whose only context is **`TestSprite V3`**. `strict_required_status_checks_policy` is **false**. Created 2026-03-02, **updated 2026-10-20T10:32:39Z**, three minutes after the first green 20/20 (10:29:09Z). Ruleset history is **403**. HTML: https://github.com/Timidan/hexkit/rules/13392431

So the required check is real in the API today. What was not observed: a merge API rejection while the check was red. PR #40 stayed closed on the 14/20 failure. PR #41 merged at 13:11Z only after the 20/20 success, and after the ruleset update. **PR #42 was merged by Timidan at 19:28:28Z while the head check was still `pending`** (queued 19:27:19Z, green only at 19:31:23Z). The previous commit on that PR was a failure (18/20). The gate did not hold that merge until the check finished. Later PRs #43, #45, #44, and #46 merged only after a success status on the head.

The current master status is the sharper hole: on `289a698` the required context is **`state: success`** with description **“26/27 passed · 1 failed”** ([b61664f2](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/b61664f2-5b73-4cee-a2e6-5076f20fa1ea)). A failed production browser test did not fail the required check. The PR head itself was a real 27/27 before merge.

### CLI

[`.github/workflows/api-nightly.yml`](https://github.com/Timidan/hexkit/blob/289a6986c325d91dcdac641174ea78f4d0e4408e/.github/workflows/api-nightly.yml) installs `@testsprite/testsprite-cli@latest` and runs:

```
testsprite ci run --project 64b68673-1206-4461-9afb-b6a7f9e28f79 --fail-on-skipped --summary-file testsprite-summary.json --report junit --report-file testsprite-junit.xml
```

Cron is `30 7 * * *` (07:30 UTC) plus `workflow_dispatch`. The API suite is **not** a required check. The published CLI appends a Markdown table to `$GITHUB_STEP_SUMMARY` when that Actions env var is set (`emitGithubOutputs` in `@testsprite/testsprite-cli` `dist/lib/gh-output.js`). The run log does not print an append failure. The Actions check-run `output.summary` field for the 2026-10-23 job was null, so the in-UI job summary was not confirmed through the API; the summary **file** and JUnit file were uploaded.

| Run | Event | Created (UTC) | Result |
|---|---|---|---|
| [39490376991](https://github.com/Timidan/hexkit/actions/runs/39490376991) | workflow_dispatch | 2026-10-20 20:15 | **failure.** CLI: API key must start with `sk-user-`, `sk-member-`, or `tsp_`. No artifact. |
| [39490996061](https://github.com/Timidan/hexkit/actions/runs/39490996061) | workflow_dispatch | 2026-10-20 20:19 | **failure.** “API key is invalid or revoked.” No artifact. |
| [39491919882](https://github.com/Timidan/hexkit/actions/runs/39491919882) | workflow_dispatch | 2026-10-20 20:26 | **20/20 passed.** Artifact `testsprite-api-results`. |
| [39604522042](https://github.com/Timidan/hexkit/actions/runs/39604522042) | schedule | 2026-10-21 13:02 | **20/20 passed.** About 5.5h after 07:30 UTC. |
| [39783598627](https://github.com/Timidan/hexkit/actions/runs/39783598627) | schedule | 2026-10-22 13:03 | **20/20 passed.** Same delay. |
| [39955429296](https://github.com/Timidan/hexkit/actions/runs/39955429296) | schedule | 2026-10-23 12:43 | **20/20 passed**, 0 skipped, 0 timed out. JUnit `tests="20" failures="0" time="79.585"`. Execution [04886999](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/64b68673-1206-4461-9afb-b6a7f9e28f79/execution/04886999-2f6a-48cc-9ee2-f776ea4a1c54). Artifact [12502785092](https://github.com/Timidan/hexkit/actions/runs/39955429296/artifacts/12502785092). |

The 20 API titles in that JUnit file: Reject bridge path with illegal characters; Reject lookup for an unknown chain and contract; Reject disallowed method on simulator bridge health; Get verified contract lookup for USDC on Ethereum; Reject lookup with too-short contract address; POST vaults is rejected by the method guard; Allow same-origin contract lookup without Origin; Reject double-encoded traversal; Reject encoded-slash traversal; GET portfolio positions rejects an invalid address; Get simulator bridge health; Reject foreign Origin on simulator bridge health; Reject a non-existent safe-looking segment; Get simulator bridge health without Origin; GET supported chains; GET portfolio positions for a real address; LI.FI Earn endpoints reject a foreign Origin; GET protocols; GET vaults with chainId filter and limit; GET vaults paginated. Slugs in the summary JSON are `SIMG-001`–`004`, `PATH-001`–`004`, `LIFI-001`–`008`, `SOUR-001`–`004`.

### MCP

No MCP config, no `mcp` string in the repo, no TestSprite MCP server entry. CLI only.

### Plans committed in git

**0 executable test plans.** No `*.test.ts`, `*.spec.ts`, `.testsprite*`, or generated Playwright/YAML plans. What is committed is the prose inventory in the README (27 browser + 20 API, with expected values) and [`api/openapi.yaml`](https://github.com/Timidan/hexkit/blob/289a6986c325d91dcdac641174ea78f4d0e4408e/api/openapi.yaml) (7 paths: bridge health, path guard, LI.FI chains/vaults/protocols/positions, Sourcify lookup). The tests themselves live only in the two TestSprite projects. PR #45’s body describes a local 429-fallback test; that test is not in the tree.

### Triage

`testsprite[bot]` PR comment with per-test links, replaced each run. No TestSprite-filed issues (zero issues in the repo). No auto-fix bot. Codex reviews some PRs; Copilot review on #41 hit a quota error. Failures are triaged by the author in PR bodies, not by an in-repo classifier.

### Schedules

- **Verified:** API CLI cron, three nights green, firing around 13:00 UTC rather than 07:30 UTC (GitHub schedule delay).
- **UNVERIFIED:** “Test List of 8 core flows” at 12:00 AM PT with email on failure. Stated in the [README](https://github.com/Timidan/hexkit/blob/289a6986c325d91dcdac641174ea78f4d0e4408e/README.md) and the [blog](https://www.timidan.xyz/blog/testsprite-hexkit-nobody-pressed-run). No workflow, no run, no email artifact.

### Red → green loops

1. **PR #41 browser, 14 → 20.** `734ef17` 14/20 (1 failed, 5 blocked) and `02bc9df` 14/20 (2 failed, 4 blocked), then three fix commits (malformed-hash message, queue the search decode, default archive RPC `eth.drpc.org`) land on `85e70f1` **All 20 tests passed** ([679e510d](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/679e510d-a63b-4012-8f7a-f14db2d8002e)). Merged after that green check. https://github.com/Timidan/hexkit/pull/41
2. **PR #42 browser, 19 and 18 → 20.** `707430f` and `e6b5028` are 19/20 with 1 blocked; `6a3b8f0` is 18/20 with 2 blocked ([f0cb9cd5](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/f0cb9cd5-6916-4390-8a31-e70d08ff8db5)); head `0dc51e1` is All 20 ([35b76bb7](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/35b76bb7-4308-4855-b2df-1abb79fb4338)). Author maps the blocked replay tests to public-RPC 429s and fixes them in #43 (bridge retry) and #45 (browser lookup must not honor `Retry-After`). Those PRs’ own checks are 20/20 with no red run of their own. Which of the 20 tests were blocked is only in the PR text; the bot comment on #42 was overwritten by the green run.
3. **CLI API, red → green on the key, not on product bugs.** Two `workflow_dispatch` failures (bad key shape, then revoked key), then 20/20, then three scheduled 20/20s. No product bug was fixed between the CLI failures and the greens.

### Credits

No credit balance, spend, or plan limit is stated in the repo or the blog. UNVERIFIED.

## Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
|---|---|---|---|---|
| Explore crawl | 8 feature areas, 111 captured pages | not countable from public artifacts | [blog](https://www.timidan.xyz/blog/testsprite-hexkit-nobody-pressed-run) only. The same post then names **7** use-case groups (Signature Database, Transaction Replay, Contract Explorer, LI.FI Earn, Calldata Decode, Local Storage, Home & Navigation). | UNVERIFIED |
| Browser suite, first pass | 20 frontend tests | 20 (queued and “All 20” on every check through 2026-10-20) | PR #41 status [679e510d](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/679e510d-a63b-4012-8f7a-f14db2d8002e) and the bot comment listing 20 names | VERIFIED as the Oct 20 suite |
| Browser suite, now | README says 27 | 27 names on the PR #46 bot comment; head status “All 27 tests passed”; master status “26/27 passed · 1 failed” | [b4ede388](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/b4ede388-cfda-4671-8bcb-7ea5cba8dfbf), [b61664f2](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/b61664f2-5b73-4cee-a2e6-5076f20fa1ea) | VERIFIED that 27 exist. The quoted “20 frontend” claim is stale. |
| API endpoint tests from OpenAPI | 20 | 20, all passed on 2026-10-23 | [JUnit artifact on run 39955429296](https://github.com/Timidan/hexkit/actions/runs/39955429296); spec [api/openapi.yaml](https://github.com/Timidan/hexkit/blob/289a6986c325d91dcdac641174ea78f4d0e4408e/api/openapi.yaml) | VERIFIED count and that the titles match the spec. The generation event itself is author-reported. |
| Nightly 8 core browser flows | 8 | 0 public runs | README + blog only | UNVERIFIED |
| Vitest / Testing Library | README tech-stack row says both | **0 files.** `npx vitest run` (vitest 1.6.1) after `npm ci` (1027 packages): “No test files found, exiting with code 1”. `node_modules` deleted. | local run 2026-10-23; `package.json` script `test:run` | FALSE as a suite that exists in the repo |
| Plans in git | (not claimed as files) | 0 | clone of `master` | VERIFIED absence |

Local unit tests: ran. Result is “no tests,” exit 1. Not a secrets/DB skip.

## Claim verification

| Claim | Verdict | Evidence |
|---|---|---|
| Explore your site mapped hexkit.app (8 feature areas, 111 captured pages) | UNVERIFIED | Only the [blog](https://www.timidan.xyz/blog/testsprite-hexkit-nobody-pressed-run). No export, screenshot, or dashboard payload. The same post’s use-case list has 7 names, not 8. |
| 20 frontend test cases plus 20 API endpoint tests generated from the OpenAPI spec | mixed | **20 API: VERIFIED** ([run 39955429296](https://github.com/Timidan/hexkit/actions/runs/39955429296), spec in git). **20 frontend: FALSE as the current suite** — README, blog, and PR #46 say 27, and the 2026-10-22 status says “All 27” / “26/27”. **20 frontend: VERIFIED as the first pass** (statuses through 2026-10-20). OpenAPI generation of the API tests is consistent with the spec and the 20 titles; the generator run is not in git. |
| Merge gate makes TestSprite V3 a required check on master | VERIFIED as configuration | [Ruleset 13392431](https://github.com/Timidan/hexkit/rules/13392431) required context is only `TestSprite V3`. Classic branch protection API is 403. “The merge button stays locked” is not fully shown: PR #42 merged while the check was pending, and the current master status is green while describing 1 failure. |
| Every merge reruns both suites against the production Environment | FALSE as stated | Browser statuses appear on merge commits #43, #45, #42, #44, #46 (20 or 27 tests, the browser project). **#41’s merge commit has no TestSprite status.** No merge commit has a completed status from API project `64b68673`. Descriptions never say 40 tests. API-on-merge is UNVERIFIED portal config. The one API status observed was a pending status on a **PR** commit (`707430f`), which the README says they stopped doing because it overwrites the browser check. |
| 8 core flows run every night | UNVERIFIED | README and blog only. The only nightly workflow is the 20-test API CLI, and it has been starting near 13:00 UTC, not at midnight PT. |
| `testsprite ci run` runs the API suite from GitHub Actions with a job summary and a JUnit report | VERIFIED | Workflow file, logs (“CI run: 20/20”), JUnit and `testsprite-summary.json` artifacts on the four green runs. CLI source writes `$GITHUB_STEP_SUMMARY`. The check-run API `output.summary` was null on the latest job, so the Actions UI pane was not re-read. |
| Caught five real bugs; PR #41 14/20, three fixes later 20/20 through the merge gate; later runs caught two more, fixed in #43 and #45 | VERIFIED on the counts and the diffs; test-level names of the red runs are author-written | 14 passed / 20 on [1ebcf3e1](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/1ebcf3e1-9de8-4d37-8527-9264f5344c67) and [8b9abfc6](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/8b9abfc6-f277-438a-91b1-59a14d2d2298); then [679e510d](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/679e510d-a63b-4012-8f7a-f14db2d8002e) All 20. The three fixes are the last three commits on #41. Later, #42 went 19/20 then 18/20 ([f0cb9cd5](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/f0cb9cd5-6916-4390-8a31-e70d08ff8db5)). #43 and #45 are the code fixes and their own checks are 20/20. The five bugs (search opened the selector lookup, silent bad hash, non-archive default RPC, bridge 429 retry, browser lookup honoring `Retry-After`) match those PR diffs. PR #45 says the author could not reproduce the 429 locally. “Five” counts three from the first red run plus these two. |

## Code quality

The TestSprite section of the README is careful and matches the workflow and the status history, including the reason API tests must not run on PR previews (hardcoded production URL, same status context). The product tree is a large, typed React app with security headers in `vercel.json` (nosniff, frame deny, HSTS, permissions policy) and real origin/method/path guards that the live API honors.

Smells that matter for judging:

- README tech stack lists Vitest and Testing Library, and the scripts table lists `npm run qa:live:matrix`, `npm run perf:debug-matrix`, and `./start-dev.sh`. None of those tests or that script exist. `npm test` is watch-mode `vitest`. The run above exits 1.
- `index.html` calls the app “free open-source” and sets the canonical URL to `https://hexkit.dev/`. The README ends with “Private. All rights reserved.” There is no LICENSE file. `https://hexkit.dev/` is a different Next.js site (“Generate hashes online using HexKit”), not this toolkit.
- `edb/` is empty. The local Rust engine the README describes is not in this repository. Production health reports the bridge process with the engine stopped.
- About 625 `: any` annotations under `src/` and `api/`. Nine `ts-ignore` / `eslint-disable` hits. ESLint is configured (`eslint.config.js`) and `npm run lint` exists. No workflow runs lint, `tsc`, or unit tests. The only CI workflow is the TestSprite API cron (plus Copilot).
- Seven open PRs (Starknet, Mezo, BTL, cleanup) sit beside the hackathon work. Zero issues, so the bug loop never became a tracker.
- Branch names must stay at or under 19 characters or Vercel’s preview URL is hashed and the check cannot find it (README; PR #40 was closed and renamed for this). That is a real operational footgun.
- The health test accepts `"status": "ok"` with the engine not running, so the API suite stays green while replay-via-bridge is down.

## Live-site behavior

Checked 2026-10-23 with GET/PUT/POST only. No forms submitted.

| URL | Result |
|---|---|
| https://hexkit.app/ and https://www.hexkit.app/ | 200 HTML, title “HexKit — Ethereum Developer Toolkit \| Decode, Build, Simulate”, ~0.1–0.3s. Canonical in the HTML is `https://hexkit.dev/`. |
| https://hexkit.app/database , `/explorer`, `/builder`, `/integrations`, `/integrations/lifi-earn` | 200, same SPA title. |
| https://hexkit.app/does-not-exist-route | **200** the same SPA. Unknown routes do not 404. |
| https://www.hexkit.app/api/nope | **404** |
| `GET /api/edb/health` on apex and www | **200** JSON `status: ok`, `edbServerRunning: false`, `maxConcurrent: 6`, `maxQueue: 40`. ~0.2–0.6s. |
| `GET /api/edb/health` with `Origin: https://evil.example` | **403** `{"error":"origin_required"}`, no `Access-Control-Allow-Origin`. |
| `PUT /api/edb/health` | **405** `method_not_allowed` |
| `GET /api/edb/..%2Fsecret` | **400** `invalid_path` |
| `GET /api/lifi-earn/v1/chains` and `/protocols` | **200**, chains include Ethereum, protocols include `aave`. |
| `GET /api/lifi-earn/v1/vaults?chainId=42161&limit=2` | **200**, `data` array, first vault `chainId` 42161. |
| `GET` chains with a foreign Origin | **403** `Origin not allowed` |
| `POST /api/lifi-earn/v1/vaults` | **405** |
| `GET .../portfolio/notanaddress/positions` | **400** validation error |
| Sourcify USDC on Ethereum via `/api/sourcify/server/v2/contract/1/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | **200** `runtimeMatch: match` |
| `GET /api/llm-recommend` | **405** (paid route left out of the suite, and it refuses GET) |
| https://hexkit.dev/ | **200**, different product: hash generator, title “HexKit”. |

The API negative tests in the JUnit file match this live behavior. The SPA itself was not clicked through in a browser (no browser session in this review); route checks are HTTP only, so client-side decode and replay were not re-executed here. Those flows are what the GitHub App statuses cover.

## Demo

The video exists: https://youtu.be/YNzsIt0ea48, oEmbed title “hexkit X testsprite”, channel Timileyin Daniel. The README and PR #46 say it is an 82-second walkthrough of each TestSprite feature used on HexKit. YouTube returned `LOGIN_REQUIRED` (“Sign in to confirm you’re not a bot”) for the watch-page player payload, so the 82-second length was **not** re-measured. Duration is UNVERIFIED; existence and title are VERIFIED.

## Weaknesses / risks for judges

- The latest production browser run is green in GitHub and red in its own description (26/27). A required check that stays green on a failure does not lock the merge button.
- PR #42 merged while `TestSprite V3` was still pending, one commit after an 18/20 failure. Ruleset history is 403, so an admin bypass cannot be confirmed or ruled out.
- “Every merge runs both suites” over-claims. One merge has no TestSprite status. The API project never posts a finished status on master.
- The 8-flow nightly list and the 111-page explore are portal anecdotes. Judges cannot open them.
- Test code is not in the repository. A reviewer cannot read an assertion, rerun it, or see the red-run screenshots after the bot comment is replaced.
- The suite skips the hard product: wallet signing, AI concierge, step debugger. The README says so. Production currently reports the EDB engine as not running, and the health test still passes.
- README drift (missing scripts, empty `edb/`, “open-source” vs private, canonical host pointing at a different site) undercuts polish even though the TestSprite write-up itself is accurate.
- Public-RPC tests are load-sensitive. The author could not reproduce the #45 bug. A judge re-running the suite may see flakes that are the RPC, not the app.
- No MCP, no in-repo triage, no unit-test CI, cron delayed ~5 hours, first two CLI dispatches failed on the API key.

## Where it beats Ninety

Ninety is the Schengen 90/180 calculator at https://github.com/mohamedwael201193/ninety (live https://ninety-coral.vercel.app): TestSprite V3 on PRs with 43 frontend plans in git, a backend CLI workflow with 28 Python API tests in git, and nightly CLI schedules that are disabled. Its branch protection is API 403, and PR #63 merged while TestSprite V3 was red. It has no demo video and no TestSprite MCP config. HexKit also has no MCP config and no committed plans, so those are not wins.

1. **A ruleset a reviewer can read, whose only required context is `TestSprite V3`.** Evidence: https://github.com/Timidan/hexkit/rules/13392431 (`required_status_checks: [{context: "TestSprite V3"}]`, enforcement active). Ninety’s protection endpoint is 403 and a PR merged while the check was red. To match, Ninety needs an active ruleset whose API body lists the TestSprite context, and merges that wait for a success state. HexKit’s own holes (PR #42 merged while pending; master `289a698` is `success` with “1 failed”) mean matching the ruleset text is not enough: Ninety should also show a red state that actually blocked a merge, which HexKit has not published.

2. **A CLI nightly that runs and stays green, with JUnit and a summary file.** Evidence: [`.github/workflows/api-nightly.yml`](https://github.com/Timidan/hexkit/blob/289a6986c325d91dcdac641174ea78f4d0e4408e/.github/workflows/api-nightly.yml) and [run 39955429296](https://github.com/Timidan/hexkit/actions/runs/39955429296) (`CI run: 20/20 passed`, artifact with `testsprite-junit.xml` and `testsprite-summary.json`). Ninety’s full CLI nightly is skipped and `testsprite-smoke.yml` is disabled because it passes multiple test ids to one `testsprite test run` without `--local`. To match, Ninety needs a scheduled `testsprite ci run` (or equivalent) that exits non-zero on failure, uploads JUnit, and has at least one green scheduled log. HexKit’s cron drifting to ~13:00 UTC is the remaining gap.

3. **Two TestSprite projects so the API suite cannot overwrite the browser check, plus a real red→green on product bugs and a demo.** Browser project `c6ff7a85-…` is the GitHub status; API project `64b68673-…` is CLI-only after they watched a pending API status land on the same context ([`707430f` statuses](https://github.com/Timidan/hexkit/commit/707430f4369246cbf54b61ca2ba7ff82bf192629)). The loop is 14/20 → 20/20 on [PR #41](https://github.com/Timidan/hexkit/pull/41) and 18/20 → 20/20 across [#42](https://github.com/Timidan/hexkit/pull/42), [#43](https://github.com/Timidan/hexkit/pull/43), and [#45](https://github.com/Timidan/hexkit/pull/45). Demo: https://youtu.be/YNzsIt0ea48. Ninety has the red→green notes in `LOOP-ITERATIONS.md` and no demo. To match the technique, Ninety would keep frontend GitHub App runs and backend CLI runs on **different** TestSprite projects (or different status contexts), commit the reason in the README, and ship a short video of the portal loop. Ninety is ahead on plans-in-git (43 + 28 versus HexKit’s 0); beating HexKit there means keeping that, not dropping it.

Extra technique Ninety does not show: post-merge browser reruns on the production Vercel deploy (visible on five of the six hackathon merge commits, for example [50d25c4f](https://www.testsprite.com/dashboard-v3/o/773ca03b-2f5a-5721-b256-828ee45aec66/projects/c6ff7a85-e921-4d46-930a-0795e21aa9b4/execution/50d25c4f-d023-46e1-84a6-64ce61ce1553) on the #45 merge). The #46 production rerun is also the one that reported a failure inside a green status, so copying it needs a status state that follows the failure count.

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 8 | A real EVM toolkit with a live user surface, not a hackathon toy. Niche audience. The engine the README sells is not what production health reports. |
| TestSprite depth | 8 | App check, required ruleset, second project, CLI cron, JUnit, bot comments, two red→green loops. No MCP, no plans in git, nightly core-flow list unseen, required check can stay green on a failed test. |
| Verifiability | 7 | Statuses, ruleset, workflow logs, artifacts, and live API checks line up. Explore counts, the 8-flow night run, API-on-merge, demo length, and the per-test names inside the red runs do not. |
| Polish | 6 | The testing README is tight and the live API guards work. README drift, empty `edb/`, wrong canonical host, no unit tests, no lint CI. |
| Demo | 7 | A real short video aimed at the TestSprite loop. Length and the frames were not re-watched (YouTube blocked the player payload). |
| **Overall** | **8** | Strongest on the operational loop a judge can click in GitHub. The unverified portal schedules and the green-with-a-failure status are the deductions. |
