# Syncly

- **Name:** Syncly
- **Repo:** https://github.com/neromtoobad/syncly (author `neromtoobad`, MIT, default branch `main`, 6 stars, 158 commits on `main` at `4517e220c6d782ce2de6dc041d921cc3c80a5a9c`)
- **Live:** https://hiresyncly.site/ (production API is live-mode USDC; this review sent no orders, invoices, or payments)
- **Staging / suite target:** https://syncly-staging.vercel.app/
- **TestSprite PR:** https://github.com/neromtoobad/syncly/pull/1 (open, not merged; head `ebf5ddc37581b0b30ffec9fece7b17fd29349fdd`)
- **Demo:** https://youtu.be/HwdC5sPIDZU
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7

Only one pull request exists. TestSprite files are on that branch and are absent from `main`. `main` is 1 commit ahead of the PR (`4517e22`, message "README: read as a product, not a hackathon entry").

## What it is

Syncly sells a small team of AI agents to businesses at a listed price of 1 USDC per job (websites, promo videos, ads, flyers, market reports, supplier checks, customer lists, a money report). The customer is a small business. An AI CFO prices the job, escrow holds the payment on Arc, and each agent pays its own tools with x402 USDC. The live catalogue returns ten services, each `priceUsd` 1: https://hiresyncly.site/api/services. The homepage title is "Syncly · Your business’s AI team, every job $1": https://hiresyncly.site/. Public traction on 2026-10-23 records 26 jobs started (15 customers), 14 paid through JobEscrow, 270 agent tool payments (256 marked settled), and 164 CFO decisions carried out on-chain: https://hiresyncly.site/api/traction.md.

## Architecture

Production is one Railway container (`server: railway-hikari` on https://hiresyncly.site/). `start.sh` runs the Hono API on internal port 8790 and Next.js on `$PORT`. The staging site is a separate Vercel project, `syncly-staging`, which proxies `/api` to `OUTLAY_API_URL` (`web/next.config.ts`). Demo mode is `OUTLAY_DRY=1` (`server/src/config.ts`): tools return fixtures and `/api/health` reports `mode: "demo"`.

| Piece | Role | Link |
|---|---|---|
| HTTP API (quotes, orders, pay, health) | Hono, Node, TypeScript executed directly | https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/server/src/api.ts |
| Demo flag | `OUTLAY_DRY === '1'` | https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/server/src/config.ts#L14-L15 |
| Health (demo vs live) | `GET /api/health` | https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/server/src/api.ts#L104 |
| Agent tool payments | x402 / Circle Gateway | https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/server/src/x402.ts |
| CFO quote, treasury, signed log | `server/src/cfo/` | https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/server/src/cfo/treasury.ts |
| Catalogue, all live SKUs at 1 USDC | `services/index.ts` | https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/server/src/services/index.ts#L47-L111 |
| Site | Next.js 16, React 19, `strict: true` | https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/web/package.json |
| API proxy | `OUTLAY_API_URL` | https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/web/next.config.ts#L4-L34 |
| Contracts | SynclyVault, JobEscrow, InvoiceBook, PayVault, NairaDesk (Solidity 0.8.26, Foundry) | https://github.com/neromtoobad/syncly/tree/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/contracts/src |
| Deploy | Dockerfile + Railway health `/api/health` | https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/Dockerfile |
| PRD the suite is generated from | on the PR branch only | https://github.com/neromtoobad/syncly/blob/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd/testsprite/PRD.md |
| Suite write-up | on the PR branch only | https://github.com/neromtoobad/syncly/blob/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd/testsprite/SUITE.md |

`web/` and `server/` TypeScript on this clone is about 24,802 lines (reviewer `wc` of `*.ts`/`*.tsx`/`*.sol` tracked files). There is no root workspace. The server has no `tsconfig.json`.

## TestSprite integration depth

**Score: 5 / 10.** One open PR has a real GitHub App loop: ten red `TestSprite V3` statuses, then a green 19/19, with product commits between them and a committed PRD. The check does not hold the merge, the PR is unmerged, `main` has no TestSprite files, generated test code is not in git, and there is no CLI, MCP, workflow, schedule, or failure-triage issue.

### GitHub App

Context name `TestSprite V3` (commit status, not a GitHub Actions check run). The only bot comment that remains is the green one, from `testsprite[bot]`, edited (`includesCreatedEdit: true`): https://github.com/neromtoobad/syncly/pull/1#issuecomment-6348102098. It says 19 of 19 frontend tests passed and "no backend checks in this run." Project `b7d337c4-457d-43e6-9e8b-18003d4f41df`.

The first PR commit (`0b2ae888`, Vercel preview only) has no TestSprite status. The next 11 commits each have one `TestSprite V3` status. Counts below are the status `description` on that commit (`GET /repos/neromtoobad/syncly/commits/{sha}/status`, 2026-10-23).

| # | Commit | Status time (UTC) | `TestSprite V3` | Execution |
|---|---|---|---|---|
| 1 | [`2fc558ec`](https://github.com/neromtoobad/syncly/commit/2fc558ec4e53cd6f4b5f323710e014590c3e81fb) PRD added | 2026-10-22 16:46 | failure, "could not start this run", target URL null | none |
| 2 | [`28a1b686`](https://github.com/neromtoobad/syncly/commit/28a1b68679758f26ac4ac096d70763c5b2a447bc) | 17:10 | failure, 16/19 passed, 1 failed, 2 blocked | [2805f60a](https://www.testsprite.com/dashboard-v3/o/f9117e69-71f8-5887-a631-6376ef25cd9f/projects/b7d337c4-457d-43e6-9e8b-18003d4f41df/execution/2805f60a-d7a8-4465-a160-1de6e44bea1d) |
| 3 | [`b4ba9e20`](https://github.com/neromtoobad/syncly/commit/b4ba9e20ec26d2075924ca787436157c779218e5) quote + demo confirm | 17:22 | failure, 17/19 passed, 2 failed | [beafd8b3](https://www.testsprite.com/dashboard-v3/o/f9117e69-71f8-5887-a631-6376ef25cd9f/projects/b7d337c4-457d-43e6-9e8b-18003d4f41df/execution/beafd8b3-17a5-44af-b6b6-62c8311efa18) |
| 4 | [`186fd531`](https://github.com/neromtoobad/syncly/commit/186fd53132fa0ad49530555659c3eb026812d2ec) job-route race | 17:32 | failure, 18/19 passed, 1 failed | [2005bf03](https://www.testsprite.com/dashboard-v3/o/f9117e69-71f8-5887-a631-6376ef25cd9f/projects/b7d337c4-457d-43e6-9e8b-18003d4f41df/execution/2005bf03-e00e-4187-846f-a1ec8b3d2537) |
| 5 | [`1eea3b37`](https://github.com/neromtoobad/syncly/commit/1eea3b379bb312f50f077e9fd8e5e816568b19df) README only | 17:41 | failure, 18/19, 1 failed | [10ded647](https://www.testsprite.com/dashboard-v3/o/f9117e69-71f8-5887-a631-6376ef25cd9f/projects/b7d337c4-457d-43e6-9e8b-18003d4f41df/execution/10ded647-35c0-481c-93b0-1373be758389) |
| 6 | [`07f8376c`](https://github.com/neromtoobad/syncly/commit/07f8376c845e20ea8a382d2399af3607c886fc79) PRD wording | 17:51 | failure, 18/19, 1 failed | [152dfa7b](https://www.testsprite.com/dashboard-v3/o/f9117e69-71f8-5887-a631-6376ef25cd9f/projects/b7d337c4-457d-43e6-9e8b-18003d4f41df/execution/152dfa7b-40e4-4e4d-adf7-bb6e05fd13d0) |
| 7 | [`a06b099d`](https://github.com/neromtoobad/syncly/commit/a06b099d69ac03ae60dffccdde5ac786e78abb94) show the decision log | 17:56 | failure, 18/19, 1 failed | [88f48c74](https://www.testsprite.com/dashboard-v3/o/f9117e69-71f8-5887-a631-6376ef25cd9f/projects/b7d337c4-457d-43e6-9e8b-18003d4f41df/execution/88f48c74-995f-474d-b133-3b1a44dfdf6b) |
| 8 | [`32385e32`](https://github.com/neromtoobad/syncly/commit/32385e32c08e6df0d5968f749fbdf4dc5ac3db47) "1 entry" | 18:04 | failure, 18/19, 1 failed | [9b34950c](https://www.testsprite.com/dashboard-v3/o/f9117e69-71f8-5887-a631-6376ef25cd9f/projects/b7d337c4-457d-43e6-9e8b-18003d4f41df/execution/9b34950c-c2c7-46ac-a685-8166a9d248ff) |
| 9 | [`e1b2b6c7`](https://github.com/neromtoobad/syncly/commit/e1b2b6c761ff2cb49fc660c9c194c21348fc210e) unfinished-step hint | 18:15 | failure, 18/19, 1 failed | [4814fdc9](https://www.testsprite.com/dashboard-v3/o/f9117e69-71f8-5887-a631-6376ef25cd9f/projects/b7d337c4-457d-43e6-9e8b-18003d4f41df/execution/4814fdc9-9c4a-4eb7-adc6-9f68220d2078) |
| 10 | [`a3d3d273`](https://github.com/neromtoobad/syncly/commit/a3d3d2734091dce3ce329cc4cc1aeb515e2056d0) demo invoice text | 18:21 | failure, 18/19, 1 failed | [0868dd7b](https://www.testsprite.com/dashboard-v3/o/f9117e69-71f8-5887-a631-6376ef25cd9f/projects/b7d337c4-457d-43e6-9e8b-18003d4f41df/execution/0868dd7b-bf3a-4d59-b788-e08974f44963) |
| 11 | [`ebf5ddc3`](https://github.com/neromtoobad/syncly/commit/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd) missing-job copy | 18:27 | success, "All 19 tests passed" | [fa2b521a](https://www.testsprite.com/dashboard-v3/o/f9117e69-71f8-5887-a631-6376ef25cd9f/projects/b7d337c4-457d-43e6-9e8b-18003d4f41df/execution/fa2b521a-65e2-48a0-8b9a-aad08b8f9943) |

The green comment names the same 19 cases as [SUITE.md](https://github.com/neromtoobad/syncly/blob/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd/testsprite/SUITE.md): hire best-price to delivered, hire find-customers to delivered, brief/email validation, change-brief, website quote, website demo pay, website delivery, follow-the-money, CFO `verify.ok`, private books, API health in demo mode, open Pay, create a demo invoice, `/live`, `/office`, docs, footer, missing service, missing job. "Check API health in demo mode" has no screenshot in that comment (the cell is an em dash). The other rows include screenshots. Dashboard HTML at the execution URL is a login shell (title "TestSprite"); per-test failure names for the red runs are not in the surviving comment.

### Required check?

GraphQL `StatusContext.isRequired(pullRequestNumber: 1)` is **false** for `TestSprite V3`, `Vercel`, and `Vercel Preview Comments` on the current head. `mergeStateStatus` is `CLEAN`. The PR is open and mergeable. `GET /repos/neromtoobad/syncly/rulesets` is `[]`. `GET /repos/neromtoobad/syncly/rules/branches/main` is `[]`. Classic branch protection returns **403** (`Resource not accessible by integration`), so an admin-only protection rule is not readable that way. The PR-level `isRequired: false` result is the one that answers whether this check blocks the merge: it does not. The PR body and the PR-branch README say the check is required.

### CLI, MCP, schedules, triage

- No `.github/workflows`. `gh run list` is empty. No `testsprite` dependency, no `mcp.json`, no `.testsprite` directory on `main` or on the PR branch.
- No nightly, on-merge, or cron schedule.
- No issues (the issues API count of 1 is the PR itself). No review comments. Red runs did not leave separate surviving PR comments.
- Credits: not stated in the repo, the PR, or the green comment. **UNVERIFIED.**

### What is committed

`testsprite/PRD.md` (65 lines) and `testsprite/SUITE.md` (58 lines) exist only on `testsprite/pr-checks`. SUITE says agents explored staging (7 agents, 123 pages), planned 51 tests, and kept 19. Those three numbers appear only in that file. Generated plans and test code are not in git. SUITE says the suite lives in the TestSprite portal.

### Red to green

One loop, all on PR #1, 2026-10-22, from the table above. The first scored failure is [2805f60a](https://www.testsprite.com/dashboard-v3/o/f9117e69-71f8-5887-a631-6376ef25cd9f/projects/b7d337c4-457d-43e6-9e8b-18003d4f41df/execution/2805f60a-d7a8-4465-a160-1de6e44bea1d) (16/19, 1 failed, 2 blocked). The green end is [fa2b521a](https://www.testsprite.com/dashboard-v3/o/f9117e69-71f8-5887-a631-6376ef25cd9f/projects/b7d337c4-457d-43e6-9e8b-18003d4f41df/execution/fa2b521a-65e2-48a0-8b9a-aad08b8f9943) (19/19). Product commits in between, each cited in its message as caught by TestSprite:

1. A shopping list of "Buy it" and a brief shorter than a sentence still got a quote. API and form now require a product name and at least 20 characters and 4 words. [`b4ba9e20`](https://github.com/neromtoobad/syncly/commit/b4ba9e20ec26d2075924ca787436157c779218e5), [`details.ts`](https://github.com/neromtoobad/syncly/blob/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd/server/src/details.ts), [`api.ts`](https://github.com/neromtoobad/syncly/blob/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd/server/src/api.ts).
2. Demo Syncly Pay told the owner to check an inbox that never receives mail. Demo mode now returns the confirm link on the page. Same commit, [`pay.ts`](https://github.com/neromtoobad/syncly/blob/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd/server/src/pay.ts) and [`Pay.tsx`](https://github.com/neromtoobad/syncly/blob/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd/web/src/views/Pay.tsx).
3. A paid website order stayed on the form because the job page rewrote the URL during client navigation. [`186fd531`](https://github.com/neromtoobad/syncly/commit/186fd53132fa0ad49530555659c3eb026812d2ec), [`Job.tsx`](https://github.com/neromtoobad/syncly/blob/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd/web/src/views/Job.tsx).
4. The money-trail audit stop hid the signed log while the CFO was only observing. [`a06b099d`](https://github.com/neromtoobad/syncly/commit/a06b099d69ac03ae60dffccdde5ac786e78abb94), [`Home.tsx`](https://github.com/neromtoobad/syncly/blob/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd/web/src/views/Home.tsx).
5. "Get my quote" stayed disabled with no reason after a step-chip jump. [`e1b2b6c7`](https://github.com/neromtoobad/syncly/commit/e1b2b6c761ff2cb49fc660c9c194c21348fc210e), [`BusinessForm.tsx`](https://github.com/neromtoobad/syncly/blob/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd/web/src/views/BusinessForm.tsx).
6. A demo invoice always rendered the sample "Party tray (20 guests)". [`a3d3d273`](https://github.com/neromtoobad/syncly/commit/a3d3d2734091dce3ce329cc4cc1aeb515e2056d0).

Two further commits are in the red streak and are smaller than those six: plural "1 entry" ([`32385e32`](https://github.com/neromtoobad/syncly/commit/32385e32c08e6df0d5968f749fbdf4dc5ac3db47)) and the missing-job sentence on the green commit ([`ebf5ddc3`](https://github.com/neromtoobad/syncly/commit/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd)). SUITE also says the books-page block was a PRD error (the books are private) and that two generated tests were pinned after they read the PRD loosely. Which named test failed on which red execution is not in the public comment, so that mapping stays **UNVERIFIED** beyond the aggregate counts and the commit messages.

## Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
|---|---|---|---|---|
| TestSprite frontend suite | 19, generated from the PRD | 19 names in the green comment match SUITE; last status "All 19 tests passed" | [comment](https://github.com/neromtoobad/syncly/pull/1#issuecomment-6348102098), [fa2b521a](https://www.testsprite.com/dashboard-v3/o/f9117e69-71f8-5887-a631-6376ef25cd9f/projects/b7d337c4-457d-43e6-9e8b-18003d4f41df/execution/fa2b521a-65e2-48a0-8b9a-aad08b8f9943), [SUITE.md](https://github.com/neromtoobad/syncly/blob/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd/testsprite/SUITE.md) | VERIFIED |
| Tests planned before the cut, pages explored | 51 planned, 7 agents, 123 pages | not in git or in the PR comment | SUITE.md only | UNVERIFIED |
| Foundry contract tests | 52 (README); InvoiceBook 14; PayVault 12 | 52 passed, 0 failed, 0 skipped locally on 2026-10-23 (forge 1.8.6): Syncly 16, InvoiceBook 14, PayVault 12, NairaDesk 10 | [Syncly.t.sol](https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/contracts/test/Syncly.t.sol), [InvoiceBook.t.sol](https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/contracts/test/InvoiceBook.t.sol), [PayVault.t.sol](https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/contracts/test/PayVault.t.sol), [NairaDesk.t.sol](https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/contracts/test/NairaDesk.t.sol) | VERIFIED |
| `server` `npm test` | script exists | exits 1, prints "Error: no test specified" | [package.json](https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/server/package.json) | VERIFIED as a stub |
| `scripts/pay-safety.ts` (7 cases in the file header) | README lists it | not executed | `npm ci` fails: lockfile missing `utf-8-validate@5.0.10` | not runnable locally: lockfile out of sync |
| `scripts/escrow-e2e.ts` | README lists accept/reject/expire/auto/fail | not executed | needs a local anvil chain and a running API | not runnable locally: needs chain + API |
| Web unit / Playwright / Vitest | none claimed | no test script, no test files | [web/package.json](https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/web/package.json) | VERIFIED absence |
| GitHub Actions | none | 0 workflows, 0 runs | `gh api repos/neromtoobad/syncly/actions/workflows` | VERIFIED absence |

Local run note: `forge test` in `contracts/` on 2026-10-23 reported `52 tests passed, 0 failed, 0 skipped`. Server `npm test` was run and failed as the stub above. `npm ci` was not repaired.

## Claim verification

| Claim | Verdict | Evidence |
|---|---|---|
| Hire a small team of AI agents for $1 a job | VERIFIED as the listed price | Homepage title at https://hiresyncly.site/ ; ten live services at `priceUsd` 1 from https://hiresyncly.site/api/services ; catalogue source https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/server/src/services/index.ts#L47-L111. Traction also shows free-first and promo jobs (price 0), so $1 is the menu price, not the price of every historical job: https://hiresyncly.site/api/traction.md. Two `live: false` SKUs in source are 15 USDC. |
| Pays agents in USDC | VERIFIED as recorded on the public job and traction ledgers | Traction: "Tool payments by agents (x402 via Circle Gateway) \| 270 · 256 settled" at https://hiresyncly.site/api/traction.md. Job `ord_mulrvp33_0603` returns five receipts with `dry: false` and vendors BlockRun and Exa: https://hiresyncly.site/api/orders/ord_mulrvp33_0603. A later traction hash, the naira-float payment `0xc833e3c9…`, is a real Arc transaction (`eth_getTransactionByHash` on https://rpc.mainnet.arc.io, chain id `0x13b2` = 5042, block `0x19fab11`). The README's example settlement `0xb76f1819…` returned null on that RPC, so that one hash is **UNVERIFIED** on-chain. Vault bytecode is present at `0x589e8ec9134777acecb83a9abdf018942ddc9f2b`. |
| TestSprite GitHub App runs a 19-test suite generated from the PRD | VERIFIED for the 19-test App run and the committed PRD; the generator output is not in git | Green status and [comment](https://github.com/neromtoobad/syncly/pull/1#issuecomment-6348102098); [PRD.md](https://github.com/neromtoobad/syncly/blob/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd/testsprite/PRD.md); [SUITE.md](https://github.com/neromtoobad/syncly/blob/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd/testsprite/SUITE.md). "Generated" is the author's account of the portal. 51 planned / 123 pages / 7 agents are **UNVERIFIED**. |
| A failing check holds the merge | FALSE | `isRequired: false` for `TestSprite V3` on PR #1. Rulesets empty. PR is `MERGEABLE` / `CLEAN` and still open: https://github.com/neromtoobad/syncly/pull/1. The sentence is in the PR body and in the PR-branch README. Classic protection GET returned 403. |
| Live site is never a test target; the preview uses a demo-mode API | VERIFIED for the 2026-10-22 green run | PRD requires `GET /api/health` to be `mode: "demo"` and says a `live` mode must fail the test: https://github.com/neromtoobad/syncly/blob/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd/testsprite/PRD.md. The case "Check API health in demo mode" passed in [fa2b521a](https://www.testsprite.com/dashboard-v3/o/f9117e69-71f8-5887-a631-6376ef25cd9f/projects/b7d337c4-457d-43e6-9e8b-18003d4f41df/execution/fa2b521a-65e2-48a0-8b9a-aad08b8f9943). Live health today is `{"ok":true,"mode":"live",...}`: https://hiresyncly.site/api/health. The public comment does not print the hostname the runner used. |
| On PR #1 the check failed 10 runs in a row; the 11th passed all 19 | VERIFIED as commit statuses | Ten failure statuses then "All 19 tests passed" on [ebf5ddc3](https://github.com/neromtoobad/syncly/commit/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd). The first of the ten is "could not start" with no execution URL, so scored dashboard runs are 9 red and 1 green. |
| Every run is listed in `testsprite/SUITE.md` | FALSE | SUITE quotes the first scored result (16 passed, 1 failed, 2 blocked) and narrates bugs. It has no table of the 11 statuses, SHAs, or execution IDs: https://github.com/neromtoobad/syncly/blob/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd/testsprite/SUITE.md. The ten red execution URLs are only on the commit statuses above. |
| Six named bugs on that loop | VERIFIED as six bugs named in SUITE, with matching fix commits | The six are listed in the red-to-green section and in SUITE.md. Per-run test titles for the failures are **UNVERIFIED**. |

README on `main` still says "25 jobs … 232 tool payments … 157 CFO decisions" (https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/README.md). Live traction the same day says 26 jobs, 270 tool payments, 164 on-chain decisions, and `/api/cfo` reports `verify.ok: true` with `verify.entries` 204 (https://hiresyncly.site/api/cfo). Those README figures are stale. They were not in the supplied claim list.

## Code quality

The product code is a real system: five Foundry contracts with tests that pass, a CFO that signs a hash-chained log, and a Next UI with `strict: true`. Hygiene around that core is thin.

- No ESLint, Prettier, Biome, or GitHub Actions. The only CI on the PR is Vercel plus the TestSprite status.
- Server `npm test` is the npm stub. `npm ci` fails because `server/package-lock.json` is missing `utf-8-validate@5.0.10`.
- The server runs TypeScript on Node with no `tsconfig` and no typecheck script. A reviewer ripgrep of `server/` and `web/` for `: any` and `as any` returned 376 hits.
- `api.ts` is 707 lines and `pay.ts` is 616. The same shopping-list filler regex is copied into `details.ts` and `BusinessForm.tsx` on the PR branch.
- Validation and demo-invoice parsing added for TestSprite are hand-rolled and easy to drift from the API (the form and the API each reimplement the brief rule).
- Customer email on the public order endpoint is masked (`d•••@gmail.com` on the sample job). This review does not repeat it.

## Live-site behavior

GETs only, 2026-10-23. No quote, hire, invoice, wallet, or payment request was sent.

| URL | Code | What came back |
|---|---|---|
| https://hiresyncly.site/ | 200 | Title "Syncly · Your business’s AI team, every job $1". `server: railway-hikari`. |
| https://hiresyncly.site/pay | 200 | "Syncly Pay · Syncly" |
| https://hiresyncly.site/hire/website | 200 | "Hire: Business Website · Syncly" |
| https://hiresyncly.site/hire/nope | 200 | Shell title "Hire: the team · Syncly". The unknown-service copy "We don't do that one." is client-rendered in [Hire.tsx](https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/web/src/views/Hire.tsx#L179) and was not visible in the raw HTML. |
| https://hiresyncly.site/job/ord_missing | 200 | Shell "Your job · Syncly" (the not-found state is client-rendered). |
| https://hiresyncly.site/job/ord_mulrvp33_0603 | 200 | Public job page. |
| https://hiresyncly.site/api/orders/ord_mulrvp33_0603 | 200 | `status: accepted`, `demo: false`, `quote.priceUsd: 0`, `payment.mode: promo`, five non-dry tool receipts. |
| https://hiresyncly.site/live | 200 | "Live · Syncly" |
| https://hiresyncly.site/office | 200 | "The office · Syncly" |
| https://hiresyncly.site/books | 200 | "Your books · Syncly" |
| https://hiresyncly.site/docs | 200 | "What Syncly is · Docs · Syncly" |
| https://hiresyncly.site/docs/the-cfo | 200 | Docs section |
| https://hiresyncly.site/arc | 200 | "Get USDC on Arc · Syncly" |
| https://hiresyncly.site/api/health | 200 | `mode: "live"`, `ok: true`, `keys: true`, `mail: "resend"` |
| https://hiresyncly.site/api/cfo | 200 | `enabled: true`, `mode: "live"`, `verify.ok: true`, `verify.entries: 204` |
| https://hiresyncly.site/api/traction.md | 200 | Generated 2026-10-23 21:41 UTC |
| https://hiresyncly.site/does-not-exist | 404 | Body contains "Nothing here." Title is still the homepage title (root layout). |
| https://hiresyncly.site/s/shot-by-dre | 404 | `text/plain`. The homepage art caption and README present this customer site as live. |
| https://syncly-staging.vercel.app/ | 200 | Same homepage title. `server: Vercel`. |
| https://syncly-staging.vercel.app/api/health | 502 | `x-vercel-error: DNS_HOSTNAME_NOT_FOUND`. The demo API host does not resolve. |
| https://syncly-staging-git-testsprite-pr-checks-moren808s-projects.vercel.app/ | 200 | PR preview HTML is up. |
| https://syncly-staging-git-testsprite-pr-checks-moren808s-projects.vercel.app/api/health | 502 | Same `DNS_HOSTNAME_NOT_FOUND`. |
| https://syncly-staging.vercel.app/does-not-exist | 404 | Custom not-found title |

Pages answered in well under a second except staging `/hire/nope` at about 1.1s. The suite target's API is down the day after the green run, so demo mode cannot be re-checked on staging today.

## Demo

A video exists: https://youtu.be/HwdC5sPIDZU. oEmbed title "Syncly (Test Sprite)", author "Moren Nerom" (https://www.youtube.com/@MorenNerom). Length is **UNVERIFIED** (the watch and embed pages served to this client had no `lengthSeconds`). What it shows past the title is **UNVERIFIED**; this review did not play it.

## Weaknesses / risks for judges

- The merge-gate claim is false. `TestSprite V3` is optional, and the only TestSprite PR is still open. `main` (158 commits, including the day after the green run) has never carried the PRD or SUITE.
- SUITE.md is a narrative, not the run ledger the claim describes. Red-run test names were not kept in PR comments.
- The suite is a frontend pass over a demo API. The bot itself says there is no backend signal. Contract tests are real and separate; they are not part of TestSprite. Server unit tests do not exist, and the lockfile does not `npm ci`.
- Staging and the PR preview returned 502 for `/api/health` on review day. A rerun today would not be able to prove demo mode.
- Several listed costs in source sit above the $1 price (`content-pack` 1.1, `product-photos` 1.1, `get-found` 1.5 USDC in [services/index.ts](https://github.com/neromtoobad/syncly/blob/4517e220c6d782ce2de6dc041d921cc3c80a5a9c/server/src/services/index.ts)). The README calls $1 a launch price. Judges should treat margin as unproven.
- README production counts are behind the live traction page. One README settlement hash did not resolve on the public Arc RPC.
- The showcase URL `/s/shot-by-dre` is 404.
- No lint, no Actions, no typecheck on the API, hundreds of `any`.

## Where it beats Ninety

Ninety baseline: https://github.com/mohamedwael201193/ninety, live https://ninety-coral.vercel.app. Ninety's TestSprite surface is larger (43 frontend plans in git, 28 backend CLI tests, a red-to-green write-up, a run-ledger workflow). Syncly is ahead on three narrower points.

1. **Fail-closed target mode.** The generated suite includes "Check API health in demo mode", and the PRD says the test fails if `mode` is `live`, because the live agents spend USDC. Evidence: [PRD.md](https://github.com/neromtoobad/syncly/blob/ebf5ddc37581b0b30ffec9fece7b17fd29349fdd/testsprite/PRD.md) and the passing case in [fa2b521a](https://www.testsprite.com/dashboard-v3/o/f9117e69-71f8-5887-a631-6376ef25cd9f/projects/b7d337c4-457d-43e6-9e8b-18003d4f41df/execution/fa2b521a-65e2-48a0-8b9a-aad08b8f9943). Live health is `mode: "live"` (https://hiresyncly.site/api/health), so that case would fail if the runner were pointed at production. Ninety would need an assertion that fails the suite when the preview is pointed at the wrong environment. Ninety has no money path, so the analogue is a wrong-host or production-data tripwire inside the plan.
2. **A product bug loop that is still on the commits.** Ten red statuses and six product fixes are on PR #1, each fix in a commit that names TestSprite (table above, starting at [b4ba9e20](https://github.com/neromtoobad/syncly/commit/b4ba9e20ec26d2075924ca787436157c779218e5)). Ninety's PR #63 merged while TestSprite V3 was red, and `testsprite-smoke.yml` is broken. To match this loop, Ninety would keep the red execution URL on the commit and land the product change before treating the loop as done. Syncly does not beat Ninety on enforcement: Syncly's check is optional too, and the PR never merged.
3. **A public, signed money log on a live treasury.** `GET /api/cfo` returns `verify.ok: true` and 204 entries (https://hiresyncly.site/api/cfo). Traction links Arc transactions (https://hiresyncly.site/api/traction.md). Vault code is on-chain at the published address. Ninety's Commission oracle is a strong external check of a calculator; it is not a signed log of a live treasury. To match, Ninety would publish a replayable signature over engine decisions. This is product verifiability, separate from TestSprite.

A fourth, smaller edge: a demo video exists (https://youtu.be/HwdC5sPIDZU). Ninety has none. Length and contents were not verified here. Publishing any walkthrough would close that gap.

**TestSprite technique Ninety lacks:** the demo-vs-live health tripwire inside the App suite. Syncly does not have Ninety's CLI gate, in-repo plans, backend TestSprite tests, run-ledger issues, or nightly workflow (even Ninety's disabled ones).

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 8 | A live agent shop with escrow and x402 on Arc, priced at 1 USDC, with a public traction ledger. Launch pricing and free-first jobs keep it under 9. |
| TestSprite depth | 5 | Real App loop and a PRD, on one unmerged PR. Optional check, no CLI, no MCP, no schedules, no test code in git, suite target 502 the next day. |
| Verifiability | 6 | The 11 statuses, the 19 names, the 52 Foundry tests, and live health/CFO/traction all check out. The required-check claim and the "every run is in SUITE.md" claim are false. README counts are stale. |
| Polish | 7 | Coherent site, office, docs, and contracts. No lint or Actions, broken server lockfile, staging API down, showcase URL 404. |
| Demo | 5 | Video exists and is titled as a TestSprite demo. Length and content not verified. |
| **Overall** | **6** | Strong product, honest red-to-green on a single PR, over-claimed gate and ledger. |

Reviewer: Grok 4.7, 2026-10-23. Read-only. No payments, form posts, stars, or comments.
