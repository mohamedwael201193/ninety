# Alibi

- **Name:** Alibi
- **Author:** N-45div (N DIVIJ)
- **Repo:** https://github.com/N-45div/alibi
- **Live:** https://alibi-one.vercel.app/
- **TestSprite PRs:** [#1](https://github.com/N-45div/alibi/pull/1) (merged 2026-10-21T07:55:44Z), [#2](https://github.com/N-45div/alibi/pull/2) (merged 2026-10-21T09:03:57Z), [#3](https://github.com/N-45div/alibi/pull/3) (merged 2026-10-21T09:39:52Z)
- **Demo:** submission card says none. The README embeds a 178-second mp4: https://github.com/user-attachments/assets/b9421466-4517-417c-9fa3-6a0a504b5f9a (linked from [README.md](https://github.com/N-45div/alibi/blob/main/README.md))
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7

## What it is

Alibi checks claims made by AI agents against a record those agents do not control. On the AI Village charity goal (2–27 Apr 2026) it treats each chat message as a claim and only the claiming agent’s own executed commands, outputs, and tool results as evidence, then follows unbacked claims into other agents’ repeats, memories, and the official daily summaries. On Grove Research’s Delvetown it checks citations against signed AT Protocol records with no model in the loop. The user is someone auditing an agent swarm (a safety reviewer, a town moderator, a reader of an official summary) who needs the receipt next to the sentence. The published result is that 1,801 of 6,260 checkable claims (UI: 29%) have no supporting receipt, while 997 of 1,051 Delvetown citations match the signed record.

## Architecture

Static React 19 / Vite 7 site on Vercel, fed by a Python analysis pipeline that is not deployed. Vercel config: [`vercel.json`](https://github.com/N-45div/alibi/blob/main/vercel.json) (`npm ci` in `site/`, `npm run data && npm run build`, output `site/dist`).

| Piece | Role | Link |
|---|---|---|
| Slice | Stream one goal out of the gated Hugging Face dataset `aidigestorg/ai-village` | [`alibi/fetch.py`](https://github.com/N-45div/alibi/blob/main/alibi/fetch.py), [`alibi/config.py`](https://github.com/N-45div/alibi/blob/main/alibi/config.py) |
| Extract | LLM pulls checkable claims; a quote that is not verbatim is set aside | [`alibi/claims.py`](https://github.com/N-45div/alibi/blob/main/alibi/claims.py) |
| Receipts | Blind judge sees only prior executed log lines; citations that are not real become `no_record` | [`alibi/receipts.py`](https://github.com/N-45div/alibi/blob/main/alibi/receipts.py), [`alibi/llm.py`](https://github.com/N-45div/alibi/blob/main/alibi/llm.py) |
| Spread | Repeats, memories, official-summary sentences, amplification within agent and kind | [`alibi/spread.py`](https://github.com/N-45div/alibi/blob/main/alibi/spread.py) |
| Validate | Re-run, second model family, perspective-capture, human labels | [`alibi/validate.py`](https://github.com/N-45div/alibi/blob/main/alibi/validate.py), [`alibi/labels.py`](https://github.com/N-45div/alibi/blob/main/alibi/labels.py) |
| Publish | Static JSON the site reads | [`alibi/export.py`](https://github.com/N-45div/alibi/blob/main/alibi/export.py) |
| Delvetown | Same checker in the browser and in a (now off) mention bot | [`site/src/delve/check.ts`](https://github.com/N-45div/alibi/blob/main/site/src/delve/check.ts), [`site/scripts/delve-bot.ts`](https://github.com/N-45div/alibi/blob/main/site/scripts/delve-bot.ts) |
| UI | Hash-routed pages: overview, ledger, claim, summaries, town, method | [`site/src/App.tsx`](https://github.com/N-45div/alibi/blob/main/site/src/App.tsx) |
| Preview data | Build copies published JSON so the gated tables stay out of git | [`site/scripts/fetch-data.ts`](https://github.com/N-45div/alibi/blob/main/site/scripts/fetch-data.ts) |

Deploy target is Vercel (project `alibi`, previews on `*.vercel.app`). There is no server API. The Python job is a local batch (`requirements.txt`: `huggingface_hub`, `requests`, `python-dotenv`, `openai`) writing SQLite then JSON. Findings write-up: [`FINDINGS.md`](https://github.com/N-45div/alibi/blob/main/FINDINGS.md).

## TestSprite integration depth

**Depth score: 7 / 10.** The GitHub App is real, the plans are in git, the assertions name dataset values, and one PR has a documented red-to-green with the failing counts still on the commit statuses. The required check is visible in the ruleset API and was green on the only PR merged after it existed. Missing: no TestSprite CLI workflow, no MCP config, no schedule, no backend tests, no failure-triage issues, and the App does not execute the committed file by itself (the `projectId` in git is a placeholder). The suite guards the static UI, not the Python judge.

### GitHub App check

App status context `TestSprite V3` (ruleset `integration_id` 2756476). No GitHub Actions workflows (`GET /repos/N-45div/alibi/actions/workflows` → `total_count: 0`). Each run also leaves a `testsprite` PR comment that is edited from “queued” to the final tally. Dashboard pages return the TestSprite shell (HTTP 200, title “TestSprite”) and do not expose pass/fail without a login, so counts below are from commit statuses and the comment bodies, not from a scraped dashboard.

| PR | SHA | Status description | When | Execution |
|---|---|---|---|---|
| [#1](https://github.com/N-45div/alibi/pull/1) run 1 | [`9385c7f`](https://github.com/N-45div/alibi/commit/9385c7ff2eaf13de28f01627bcee5b9882623b6b) | failure, `24/30 passed · 6 failed` | 2026-10-21T07:25:42Z | [64d50bff](https://www.testsprite.com/dashboard-v3/o/e9fd251f-92e5-5b3d-b83d-0345e4dcbfb5/projects/7a2fde3d-c1f4-4f29-a425-d8a28c21485a/execution/64d50bff-dcee-4d88-889a-84bcf0b62eb1) |
| [#1](https://github.com/N-45div/alibi/pull/1) run 2 | [`57c4d87`](https://github.com/N-45div/alibi/commit/57c4d876df921c7408bc21fe926fcf0b236b79f2) | failure, `29/30 passed · 1 failed` | 2026-10-21T07:33:44Z | [c804acb7](https://www.testsprite.com/dashboard-v3/o/e9fd251f-92e5-5b3d-b83d-0345e4dcbfb5/projects/7a2fde3d-c1f4-4f29-a425-d8a28c21485a/execution/c804acb7-7821-4d93-851a-cb85552e99c6) |
| [#1](https://github.com/N-45div/alibi/pull/1) run 3 | [`d25a061`](https://github.com/N-45div/alibi/commit/d25a0612294ee065ad0ff0d29772c15c6b6302d4) | success, `All 30 tests passed` | 2026-10-21T07:37:50Z | [8d07e135](https://www.testsprite.com/dashboard-v3/o/e9fd251f-92e5-5b3d-b83d-0345e4dcbfb5/projects/7a2fde3d-c1f4-4f29-a425-d8a28c21485a/execution/8d07e135-8ede-4427-964c-51d6e4494187) · [comment](https://github.com/N-45div/alibi/pull/1#issuecomment-6310667283) |
| [#2](https://github.com/N-45div/alibi/pull/2) | [`5bf0e58`](https://github.com/N-45div/alibi/commit/5bf0e58bbe65320b5db239389304be6baaa804da) | success, `All 23 tests passed` | 2026-10-21T08:17:45Z | [77f73c12](https://www.testsprite.com/dashboard-v3/o/e9fd251f-92e5-5b3d-b83d-0345e4dcbfb5/projects/7a2fde3d-c1f4-4f29-a425-d8a28c21485a/execution/77f73c12-acc7-4ff2-9b12-7d77a454179d) · [comment](https://github.com/N-45div/alibi/pull/2#issuecomment-6311330205) |
| [#3](https://github.com/N-45div/alibi/pull/3) | [`5dbcaec`](https://github.com/N-45div/alibi/commit/5dbcaecdfbf7cd991ed1a4a61fee236974b45948) | success, `All 23 tests passed` | 2026-10-21T09:28:34Z | [4629dfef](https://www.testsprite.com/dashboard-v3/o/e9fd251f-92e5-5b3d-b83d-0345e4dcbfb5/projects/7a2fde3d-c1f4-4f29-a425-d8a28c21485a/execution/4629dfef-2d10-4918-ac6d-673d3fbbdab6) · [comment](https://github.com/N-45div/alibi/pull/3#issuecomment-6312612391) |

Statuses: `GET /repos/N-45div/alibi/commits/{sha}/status`. PR #2 and PR #3 each have exactly one `TestSprite V3` status, on the head commit. Comment edit history (GraphQL `userContentEdits`) goes from “queued **23 tests**” to “23 of 23” with no failure revision in between. The PR #1 comment on the head was edited from “queued **30 tests**” to “30 of 30”; the 24/30 and 29/30 results survive as statuses on the earlier SHAs, not in that comment. The author later wrote which failures were product bugs versus generated tests asking for pages the app does not have, in the README at [`5bf0e58`](https://github.com/N-45div/alibi/blob/5bf0e58bbe65320b5db239389304be6baaa804da/README.md) (removed from `main` by PR #3): run 1 caught four ledger bugs plus two bad generated tests; run 2 left one generated test asking for a Delvetown framing of the Method page; run 3 rewrote that test. So three of the six reds were the tests being changed to match the product.

The 23 names in the PR #2 and PR #3 comments are the same set as [`testsprite/suite.jsonl`](https://github.com/N-45div/alibi/blob/main/testsprite/suite.jsonl).

### Required check

`GET /repos/N-45div/alibi/rulesets/25535358` (HTML: https://github.com/N-45div/alibi/rules/25535358):

- name `main needs TestSprite`, `enforcement: active`, `include: ["~DEFAULT_BRANCH"]`, created 2026-10-21T09:16:27Z
- rules: deletion blocked, non-fast-forward blocked, pull request required (`required_approving_review_count: 0`), required status check context `TestSprite V3` integration `2756476`
- `strict_required_status_checks_policy: false` (head does not have to be up to date with main)
- response has no `bypass_actors`; `current_user_can_bypass: "never"` for the calling integration
- classic branch protection `GET /repos/N-45div/alibi/branches/main/protection` returned **403**

The ruleset did not exist when PR #1 merged (07:55Z) or PR #2 merged (09:03Z). PR #3 was opened 09:25Z, the check went green at 09:28Z, and the merge was 09:39Z. That is a merge through the required check. There is no observed red merge attempt after the ruleset, so a block was not witnessed; the requirement itself is in the API payload. Reviews are not required, so the author can merge their own PR once the check is green. Merge commits on main (`09e69c3`, `870717b`, `9a35462`) have a Vercel status only, not a new TestSprite run.

### CLI, MCP, schedules, triage, credits

- **CLI:** documented only, as `testsprite test create-batch --plans testsprite/suite.jsonl` in the [README](https://github.com/N-45div/alibi/blob/main/README.md). No workflow runs it. Every line’s `projectId` is the placeholder `<your-testsprite-project-id>`, so the command does not run from a fresh clone. The App’s real project id (`7a2fde3d-c1f4-4f29-a425-d8a28c21485a`) is only in the dashboard URLs.
- **MCP:** none in the repo.
- **Schedules:** no nightly, no on-merge TestSprite job. The Delvetown bot file mentions a 2-minute Lambda schedule ([`delve-bot-lambda.ts`](https://github.com/N-45div/alibi/blob/main/site/scripts/delve-bot-lambda.ts)); that account is documented as switched off on 15 Oct 2026, and it is not TestSprite.
- **Triage:** the App comments on the PR with per-test links and screenshots. Zero GitHub issues, zero review threads, no auto-fix bot, no run ledger.
- **Credits:** no TestSprite credit accounting. [`FINDINGS.md`](https://github.com/N-45div/alibi/blob/main/FINDINGS.md) says OpenRouter credits ran out during contradiction confirmation (88 of the first-pass contradictions skipped the fuller DeepSeek pass and went straight to the second model).

### Red → green

One loop, all on PR #1, three pushes, then merge:

1. [`9385c7f`](https://github.com/N-45div/alibi/commit/9385c7ff2eaf13de28f01627bcee5b9882623b6b) → [24/30](https://www.testsprite.com/dashboard-v3/o/e9fd251f-92e5-5b3d-b83d-0345e4dcbfb5/projects/7a2fde3d-c1f4-4f29-a425-d8a28c21485a/execution/64d50bff-dcee-4d88-889a-84bcf0b62eb1)
2. [`57c4d87`](https://github.com/N-45div/alibi/commit/57c4d876df921c7408bc21fe926fcf0b236b79f2) → [29/30](https://www.testsprite.com/dashboard-v3/o/e9fd251f-92e5-5b3d-b83d-0345e4dcbfb5/projects/7a2fde3d-c1f4-4f29-a425-d8a28c21485a/execution/c804acb7-7821-4d93-851a-cb85552e99c6)
3. [`d25a061`](https://github.com/N-45div/alibi/commit/d25a0612294ee065ad0ff0d29772c15c6b6302d4) → [30/30](https://www.testsprite.com/dashboard-v3/o/e9fd251f-92e5-5b3d-b83d-0345e4dcbfb5/projects/7a2fde3d-c1f4-4f29-a425-d8a28c21485a/execution/8d07e135-8ede-4427-964c-51d6e4494187), merged as PR #1

PR #2 and PR #3 were green on the first (and only) App run.

### Plans committed

One file, 23 frontend plans: [`testsprite/suite.jsonl`](https://github.com/N-45div/alibi/blob/main/testsprite/suite.jsonl). Parsed locally: 23 rows, 58 actions, **76 assertions**, 134 steps, all `type: frontend`, priorities p0–p2. Earlier split files (removed in [`3f13a45`](https://github.com/N-45div/alibi/commit/3f13a457ca61fd6094f2e5b185993274e2b2de9b)): `testsprite/ledger-link.jsonl` (5 plans), `method-overview.steps.json`, `method-verdicts.steps.json`, `town-flags.steps.json`.

## Test inventory

| Layer | Claimed | Verified | Evidence | Status |
|---|---|---|---|---|
| TestSprite browser plans in git | 23 tests, 76 assertions | 23 plans, 76 steps with `type: assertion` | [`suite.jsonl`](https://github.com/N-45div/alibi/blob/main/testsprite/suite.jsonl) | VERIFIED |
| TestSprite executions | PR1 24/30 → 29/30 → 30/30; PR2 23/23; PR3 23/23 | Same counts on commit statuses; PR2/PR3 comment names equal the 23 plan names | table above | VERIFIED |
| Hand-written vs rewritten | 6 hand-written, 17 rewritten from TestSprite drafts | 5 names match `ledger-link.jsonl` at the PR #1 merge ([file](https://github.com/N-45div/alibi/blob/09e69c324fef31e59e181679e9ff8d04b35562c1/testsprite/ledger-link.jsonl)); PR #1 body says those five were written for the change; [`3f13a45`](https://github.com/N-45div/alibi/commit/3f13a457ca61fd6094f2e5b185993274e2b2de9b) adds the copy-link test and says eight duplicates were merged and every generated test was rewritten. 30 − 8 + 1 = 23, and 23 − 6 = 17. The file does not tag authorship. 15 of the 23 current titles are new relative to the 30-name run | PR bodies + that commit | VERIFIED (count reconstructed; origin is the author’s git note, not TestSprite metadata) |
| Exact dataset assertions | 29% of 6,260; 155 for `$115`; 1,051 citations | Those strings are in `suite.jsonl`. Live JSON matches: checkable 3,915+544+1,750+51 = 6,260; no-receipt UI ratio (1,750+51)/6,260 = 28.769…% which `pct()` renders with `toFixed(0)` as 29% ([`lib.ts`](https://github.com/N-45div/alibi/blob/main/site/src/lib.ts)); index has 155 rows containing `$115`; `delve.json` has 1,051 citations | [overview](https://alibi-one.vercel.app/data/overview.json), [index](https://alibi-one.vercel.app/data/index.json), [delve](https://alibi-one.vercel.app/data/delve.json) | VERIFIED against published JSON, not re-derived from the gated HF tables |
| Python pipeline unit tests | none claimed | 0 `test_*.py` files | repo tree | VERIFIED (absent) |
| Frontend unit / e2e in repo | none besides the plans | `package.json` has no `test` script; no `*.test.ts` | [`site/package.json`](https://github.com/N-45div/alibi/blob/main/site/package.json) | VERIFIED (absent) |
| CI other than Vercel + TestSprite App | none | 0 workflows | Actions API | VERIFIED (absent) |

**Local run:** `python3 -m compileall alibi` succeeded (syntax only). `python3 -m pytest` failed: pytest is not installed and there are no tests. The pipeline was not run: it needs the gated Hugging Face dataset and `OPENROUTER_API_KEY` ([`.env.example`](https://github.com/N-45div/alibi/blob/main/.env.example), [README reproduce](https://github.com/N-45div/alibi/blob/main/README.md)). The TestSprite suite was not executed: it needs a TestSprite project id and their cloud browser against a deployment. No `node_modules` was installed.

Other published figures the plans assert, checked in the same JSON on 2026-10-23: 7,118 index rows and 14 distinct agents; four-filter Apr 3 / GPT-5.4 / verification / backed = 41; GPT-5.2 + relay = 127; ledger page size 50 ([`Claims.tsx`](https://github.com/N-45div/alibi/blob/main/site/src/pages/Claims.tsx)) so 7,118 claims → 143 pages and 108 contradicted rows → 3 pages; Delvetown glm = 608 citations of which 7 are contradicted; Apr 3 summary sentence statuses backed 8, unverified 5, contradicted 0 across 17 summary days ([summaries](https://alibi-one.vercel.app/data/summaries.json)); claim `32d051a7-459d-4009-99ad-642967eb0a27:12` is the Sonnet 4.5 “Mystic Slime” line, verdict `no_record`.

## Claim verification

| Claim | Verdict | Evidence |
|---|---|---|
| Built on the AI Village dataset: 7,118 claims from 14 agents, plus Delvetown public records | VERIFIED against published output, not against the gated source | [FINDINGS.md](https://github.com/N-45div/alibi/blob/main/FINDINGS.md) (7,466 extracted, 348 set aside, 7,118 judged, 14 agents) and [overview.json](https://alibi-one.vercel.app/data/overview.json). Index has 7,118 rows and 14 agent names. Delve snapshot `fetchedAt` 2026-10-04T05:14:57Z, 57 residents, 4,943 records, 1,051 citations ([delve.json](https://alibi-one.vercel.app/data/delve.json)). `config.py` names `aidigestorg/ai-village`. The raw tables are not in the repo and were not re-downloaded. |
| First TestSprite run went red 24/30, then 29/30, then 30/30, and the PR merged | VERIFIED | Commit statuses on `9385c7f`, `57c4d87`, `d25a061`; PR #1 `mergedAt` 2026-10-21T07:55:44Z. Three pushes, not three reruns of one SHA. |
| PR #2 and PR #3 passed 23/23 on the first run | VERIFIED | One `TestSprite V3` status each, description `All 23 tests passed`. Comment edits go queued → 23/23 with no failure body. |
| PR #3 merged through the required check | VERIFIED | Ruleset created 09:16:27Z; check success 09:28:34Z on the head; merge 09:39:52Z. Classic protection API was 403; the ruleset API is the evidence. No red push was attempted after the ruleset, so a block was not observed. |
| 23 browser tests and 76 assertions | VERIFIED | `suite.jsonl` parse; PR #2 and #3 comments list the same 23 names. |
| 17 TestSprite drafts were rewritten to assert exact values (29% of 6,260 with no receipt, 155 matches for `$115`, 1,051 citations), and 6 tests were hand-written | VERIFIED as a count; the “drafted by TestSprite” label is the author’s | See inventory. The three numbers are in the plan text and match live JSON. [README](https://github.com/N-45div/alibi/blob/main/README.md) states 29% / 6,260, 155, and 1,051 in the testing table. |
| A GitHub ruleset makes `TestSprite V3` required on `main` | VERIFIED | [ruleset 25535358](https://github.com/N-45div/alibi/rules/25535358). It started after PR #1 and PR #2 had already merged. |
| Every PR is tested on the full dataset | VERIFIED for the published JSON the preview embeds; the browser does not rerun the Python pipeline | [`fetch-data.ts`](https://github.com/N-45div/alibi/blob/main/site/scripts/fetch-data.ts) copies `overview.json`, `summaries.json`, `delve.json`, `index.json`, and every day file from `https://alibi-n45divs-projects.vercel.app` at build time. That origin and `alibi-one` currently serve identical overview and index SHA-256s. PR #2/#3 plans assert 7,118 claims and 1,051 citations, and those runs passed, so those previews were serving that snapshot. “Full dataset” here means the published slice (7,118 judged claims), not the gated HF dumps. |
| Every step is in `testsprite/suite.jsonl` | VERIFIED | 134 `planSteps` across 23 lines. |
| Demo: none | FALSE as a description of the repo | README embeds a 178s, 1920×1080, ~7.6 MB mp4. The card can still have left the demo field empty. |

## Code quality

The Python side is small, commented, and split by stage (about 1,840 lines under `alibi/`). The receipt judge is instructed not to see narration, and the module downgrades verdicts whose citations are not real log lines. The site is a single hash router, no component library, React 19, and the ledger page size and filters are ordinary state written into the hash. `tsconfig.app.json` turns on `noUnusedLocals`, `noUnusedParameters`, and `verbatimModuleSyntax`. `strict` is not set. There is no ESLint, Prettier, mypy, or pyproject. Requirements are unpinned except `huggingface_hub>=1.0`.

Smells that matter for judging:

- 106 of 124 commits landed on `main` before the first PR commit (`c165246`). The analysis code never went through TestSprite. Only the last three UI/docs PRs did. One author.
- The interesting behavior (extraction, judging, spread, confirmation) has no automated test. TestSprite’s own PR #3 comment says no backend tests ran.
- Generated tests were rewritten when they demanded pages the product does not have. That is honest, and it also means part of the red-to-green was the oracle moving.
- `suite.jsonl` cannot be replayed as committed.
- Human labels are still unfinished: FINDINGS says a 60-claim blind sample “is being labelled” and results will be added.
- Contradiction confirmation was partial when credits ran out (88 cases skipped the fuller same-family pass).
- Open Graph image and the build-time data origin point at `alibi-n45divs-projects.vercel.app`, while the README live URL is `alibi-one.vercel.app`. They match today. A drift on the data origin changes what every future PR is tested against.
- Hash routes only. `GET /claims` is a platform 404, not the ledger.

## Live-site behavior

Checked 2026-10-23 with curl. No forms submitted. The “Check the town now” button was not clicked (it reads `pds.delve.town`).

| URL | Result |
|---|---|
| https://alibi-one.vercel.app/ | 200 in 0.05s, 1,208 bytes, title `Alibi · said vs did`, JS `/assets/index-DUtTkTgR.js` 200 (290,535 bytes), CSS 200 |
| https://alibi-one.vercel.app/data/overview.json | 200, 5,365 bytes, 14 agents, 7,118 judged, totals 3,915 / 544 / 1,750 / 51 |
| https://alibi-one.vercel.app/data/index.json | 200, 1,591,347 bytes, 7,118 rows |
| https://alibi-one.vercel.app/data/delve.json | 200, 743,725 bytes, 1,051 citations: 997 backed, 37 deleted, 9 contradicted, 8 no record |
| https://alibi-one.vercel.app/data/summaries.json | 200, 17 days |
| https://alibi-one.vercel.app/data/days/2026-04-02.json | 200, ~1.0 MB |
| https://alibi-one.vercel.app/data/days/nope.json | 404 |
| https://alibi-one.vercel.app/does-not-exist and `/claims` | 404 `NOT_FOUND` plaintext, ~0.04s |
| https://alibi-one.vercel.app/favicon.svg and `/og.png` | 200 (SVG; PNG 52,929 bytes) |
| https://alibi-n45divs-projects.vercel.app/ and its `overview.json` / `index.json` | 200; overview and index hashes match `alibi-one` |

The shell is a SPA: overview, ledger, summaries, Delvetown, and method are hash routes (`#/claims`, `#/town`, `#/method`, `#/summaries/2026-04-03`). Server-rendered HTML does not include the claim figures; those load from `/data/*`. Both hostnames respond quickly. Nothing fetched was broken. Unverified in a browser: filter clicks, copy-link, theme persistence, and the live Delvetown re-check.

## Demo

A demo exists in the README even though the card says none. ffprobe on the GitHub asset: duration 178.0 seconds, size 7,605,697 bytes, `video/mp4`, 1920×1080. Sampled frames: a title card on the Hugging Face incident and the METR quote about the analysis model adopting the agent’s perspective; a thesis slide “Agents’ words aren’t evidence.”; a “Try it yourself” frame of `alibi-one.vercel.app/#/summaries/2026-04-03` with the audited daily summary and a four-step caption (search the ledger, open a claim, read the summaries, check Delvetown). One mid-video frame was a black transition. It is a narrated product film with a screenshot of the live app, not a recording of the TestSprite run.

## Weaknesses / risks for judges

- TestSprite never executes the claim judge, the spread statistics, or the Delvetown checker. A wrong verdict in `receipts.py` still ships a green UI if the exported JSON is unchanged.
- The required check gated one docs PR. The science landed as direct pushes. Approving reviews are 0, and the status policy is not strict.
- Part of the red-to-green was rewriting generated tests that asked for UI the product does not have. The final suite is sharper (exact numbers), and it was also fitted to the app.
- Plans in git and the App’s project are only tied together by matching test names on two PRs. Nothing stops the dashboard copy from drifting, and the committed file does not contain the project id.
- Published numbers cannot be reproduced here without the gated dataset and a paid LLM. FINDINGS still has an open human-label pass and a credit-limited confirmation path. “29%” is integer rounding of 28.8%.
- No CI lint, typecheck, or unit run. `strict` is off. Data origin and the advertised hostname are two Vercel URLs.
- The in-town bot is off, and the live re-check is deliberately untested.

## Where it beats Ninety

Ninety: https://github.com/mohamedwael201193/ninety , live https://ninety-coral.vercel.app. Ninety is ahead on engine tests, CLI gating, volume, and nightly fuzz. These are the places Alibi is specifically ahead.

1. **A ruleset that names `TestSprite V3` and is readable.** [ruleset 25535358](https://github.com/N-45div/alibi/rules/25535358) is active on the default branch, and [PR #3](https://github.com/N-45div/alibi/pull/3) merged only after that check was green ([execution 4629dfef](https://www.testsprite.com/dashboard-v3/o/e9fd251f-92e5-5b3d-b83d-0345e4dcbfb5/projects/7a2fde3d-c1f4-4f29-a425-d8a28c21485a/execution/4629dfef-2d10-4918-ac6d-673d3fbbdab6)). Ninety’s branch-protection API returns 403, and PR #63 merged while TestSprite V3 was red. To match, Ninety needs a ruleset whose required context is `TestSprite V3`, with the JSON visible to a read-only token, and a merge that waits for it.
2. **Plans whose steps assert the published dataset, and a run whose names match the file.** [`suite.jsonl`](https://github.com/N-45div/alibi/blob/main/testsprite/suite.jsonl) has 76 assertions (29% of 6,260, 155 rows for `$115`, 1,051 citations, 41-claim four-filter, 3,915/544/1,750/51). The PR #2 comment lists the same 23 titles ([execution 77f73c12](https://www.testsprite.com/dashboard-v3/o/e9fd251f-92e5-5b3d-b83d-0345e4dcbfb5/projects/7a2fde3d-c1f4-4f29-a425-d8a28c21485a/execution/77f73c12-acc7-4ff2-9b12-7d77a454179d)). Ninety has more plans (43 frontend, 28 API) but would need the plan text itself to pin exact oracle numbers and a check-run comment that still matches the file.
3. **Failing counts left on the intermediate SHAs after the PR comment was overwritten with green.** [24/30](https://github.com/N-45div/alibi/commit/9385c7ff2eaf13de28f01627bcee5b9882623b6b) and [29/30](https://github.com/N-45div/alibi/commit/57c4d876df921c7408bc21fe926fcf0b236b79f2) are still on those commits; the visible PR comment is only the final [30/30](https://github.com/N-45div/alibi/pull/1#issuecomment-6310667283). Ninety’s red-to-green lives in `LOOP-ITERATIONS.md`. To exceed Alibi, keep the failing status on the SHA that failed, not only in a narrative file.
4. **Preview builds pull the full published snapshot, so the browser run is not a fixture.** [`fetch-data.ts`](https://github.com/N-45div/alibi/blob/main/site/scripts/fetch-data.ts) plus a green run that asserts 7,118 ledger rows. Ninety’s engine tests are the stronger oracle for a calculator; the technique Ninety lacks is “the PR preview is a copy of production data, and the App asserts that copy’s counts.”

Technique Ninety does not have: a required, API-visible `TestSprite V3` ruleset that actually preceded a merge, combined with natural-language plans that state exact production numbers and were name-matched to the App’s comment. Ninety also lacks nothing important that Alibi has in CLI, MCP, or nightly runs — Alibi has none of those.

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 8 | A concrete audit of agent claims against logs and signed records, with a published slice and a second swarm. Narrow audience, real artifact. |
| TestSprite depth | 7 | App on every PR, plans in git, exact assertions, one real red-to-green, ruleset required and used once. No CLI, MCP, schedule, or engine tests. |
| Verifiability | 8 | Counts, ruleset, and live JSON all check out. Gated source and the “who drafted which plan” tag are not independently labeled. Demo field disagrees with the README. |
| Polish | 7 | Coherent README, findings, and a fast static site. No unit CI, unfinished human labels, two hostnames, hash-only routing. |
| Demo | 6 | 178s explainer with a live-app screenshot is in the README. The card says none. It does not show the test loop. |
| **Overall** | **7** | Strong, checkable TestSprite story on a serious static audit UI. The judge that produces the numbers is outside the suite, and the required check only covered the last PR. |
