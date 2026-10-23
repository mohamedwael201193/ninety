# AgentPulse

- **Name:** AgentPulse
- **Repo:** https://github.com/naufalfx805-source/agentpulse
- **Live:** https://agentpulse-pi.vercel.app/
- **TestSprite PR:** https://github.com/naufalfx805-source/agentpulse/pull/5 (merged 2026-10-22). Also green on https://github.com/naufalfx805-source/agentpulse/pull/6.
- **Demo:** https://drive.google.com/file/d/1FXHbW6gyLwtJvrNj4c81uDmH9yWtI22T/view (`AgentPulse-TestSprite-S4-demo.mp4`, created 2026-10-23, 101.5s, 1280×720, 3,722,452 bytes). Older release cut: https://github.com/naufalfx805-source/agentpulse/releases/download/v1.0.0/agentpulse-demo-with-subtitles.mp4 (2026-10-15, 90.12s, 7,811,752 bytes).
- **Article:** https://dev.to/naufalfx805source/testsprite-caught-three-real-bugs-before-i-could-merge-building-agentpulse-for-testsprite-3gdg
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7
- **HEAD reviewed:** `4ebcea9` (merge of PR #6)

## What it is

AgentPulse is a single-page mission-control demo for people shipping with coding agents. It shows fleet telemetry, a pipeline DAG, a test-scenario catalog, a chaos/webhook simulator, and a four-step write → test → fix → test-again inspector. The data is client-side mock state. The part that is real is the loop on this repo: every pull request gets a Vercel preview, the TestSprite GitHub App runs a 37-case browser suite against that preview, and branch protection on `main` will not take the merge until that check and the build/unit-test check are green. PR #5 is the evidence: the suite failed on the scenario form and on a missing pipeline drill-down, the author fixed both, and the check reran until 37/37.

## Architecture

- **Stack:** Next.js 16.4.0 App Router, React 19.3.0, TypeScript `strict`, Tailwind CSS 4, Lucide. One client page, no API routes, no database. Deployed on Vercel (`server: Vercel`, `x-vercel-cache: HIT` on https://agentpulse-pi.vercel.app/).
- **UI shell:** [`src/app/page.tsx`](https://github.com/naufalfx805-source/agentpulse/blob/main/src/app/page.tsx) holds tab state and simulated pipeline runs. Tabs are component swaps, not routes.
- **Views:** [`DashboardView.tsx`](https://github.com/naufalfx805-source/agentpulse/blob/main/src/components/DashboardView.tsx), [`PipelineStudioView.tsx`](https://github.com/naufalfx805-source/agentpulse/blob/main/src/components/PipelineStudioView.tsx), [`ScenarioStudioView.tsx`](https://github.com/naufalfx805-source/agentpulse/blob/main/src/components/ScenarioStudioView.tsx), [`ChaosSimulatorView.tsx`](https://github.com/naufalfx805-source/agentpulse/blob/main/src/components/ChaosSimulatorView.tsx), [`SelfHealingLoopView.tsx`](https://github.com/naufalfx805-source/agentpulse/blob/main/src/components/SelfHealingLoopView.tsx), [`TestHealthMonitorView.tsx`](https://github.com/naufalfx805-source/agentpulse/blob/main/src/components/TestHealthMonitorView.tsx), [`SettingsView.tsx`](https://github.com/naufalfx805-source/agentpulse/blob/main/src/components/SettingsView.tsx).
- **Data:** [`src/data/mockData.ts`](https://github.com/naufalfx805-source/agentpulse/blob/main/src/data/mockData.ts). Types in [`src/types/agent.ts`](https://github.com/naufalfx805-source/agentpulse/blob/main/src/types/agent.ts).
- **Real logic under test:** [`src/lib/scenarioValidation.mjs`](https://github.com/naufalfx805-source/agentpulse/blob/main/src/lib/scenarioValidation.mjs) (status 100–599, trim title and path). The scenario form reads `FormData` on submit so a scripted clear cannot leave React state at `"200"` ([`ScenarioStudioView.tsx`](https://github.com/naufalfx805-source/agentpulse/blob/main/src/components/ScenarioStudioView.tsx)).
- **CI:** [`.github/workflows/ci.yml`](https://github.com/naufalfx805-source/agentpulse/blob/main/.github/workflows/ci.yml) — `npm ci`, `npm run build`, `npm test` (`node --test tests/*.test.mjs`) on push to `main` and on pull requests. Job name `Build & Unit Tests`.
- **Deploy target:** Vercel project `agentpulse`, production https://agentpulse-pi.vercel.app/. PR previews use `agentpulse-git-<branch>-naufalfx805-sources-projects.vercel.app` (PR #5 preview linked from the Vercel bot: https://agentpulse-git-verify-gate-naufalfx805-sources-projects.vercel.app).

## TestSprite integration depth

**Score: 7/10.** The GitHub App check is real, it targets PR previews, it is a required status for everyone including admins, and PR #5 has a four-step red→green record with product bugs underneath. Plans are not in git, there is no MCP config, the CLI action was removed after it proved hollow, nothing runs on a schedule, and the suite only clicks a mock SPA.

### GitHub App check

Context name `TestSprite V3` (status `app_id` 2756476; `/apps/2756476` returns 404 to this token). Target URLs are TestSprite dashboard executions. The bot `testsprite[bot]` comments on the PR. The final comment on PR #5 is edited in place (the Drive demo frame shows “edited”), so the red-run bodies are gone. Counts below are the commit status descriptions, which GitHub kept.

| Commit | PR | Status description | Execution |
|---|---|---|---|
| [`48e1a98`](https://github.com/naufalfx805-source/agentpulse/commit/48e1a981f242d272eb3a6ce142cd2256e1ac7067) | #4 / early #5 | All 33 tests passed | [955201d6](https://www.testsprite.com/dashboard-v3/o/e51f28e4-5341-5e60-8bfd-ada01caee2ed/projects/7e641100-d279-409c-80ef-fed6a641762e/execution/955201d6-925d-4f9c-a56b-522fe800759b) |
| [`dbd7bf7`](https://github.com/naufalfx805-source/agentpulse/commit/dbd7bf779dae4178ae39e033f09083d36bfc60a7) | #5 | **33/37 passed · 4 failed** | [96a5dcde](https://www.testsprite.com/dashboard-v3/o/e51f28e4-5341-5e60-8bfd-ada01caee2ed/projects/7e641100-d279-409c-80ef-fed6a641762e/execution/96a5dcde-3dce-434b-bae6-291901c89306) |
| [`d167e52`](https://github.com/naufalfx805-source/agentpulse/commit/d167e52707c6d25e3688487d857a5317b0b030ff) | #5 | **35/37 passed · 2 failed** | [c9872ebc](https://www.testsprite.com/dashboard-v3/o/e51f28e4-5341-5e60-8bfd-ada01caee2ed/projects/7e641100-d279-409c-80ef-fed6a641762e/execution/c9872ebc-253a-4eec-8755-044303c5a571) |
| [`7457257`](https://github.com/naufalfx805-source/agentpulse/commit/74572572d028c997ed478d18bc9161ff999f5ced) | #5 | **36/37 passed · 1 failed** | [b543911b](https://www.testsprite.com/dashboard-v3/o/e51f28e4-5341-5e60-8bfd-ada01caee2ed/projects/7e641100-d279-409c-80ef-fed6a641762e/execution/b543911b-dcf6-4e2c-98fa-86864f4ad58b) |
| [`431454a`](https://github.com/naufalfx805-source/agentpulse/commit/431454a8faa2872b0926e3aab6f4182fb93ccdc6) | #5 head | **All 37 tests passed** | [d86da53c](https://www.testsprite.com/dashboard-v3/o/e51f28e4-5341-5e60-8bfd-ada01caee2ed/projects/7e641100-d279-409c-80ef-fed6a641762e/execution/d86da53c-5e71-446d-908a-bd658925b24b) |
| [`acd5f1b`](https://github.com/naufalfx805-source/agentpulse/commit/acd5f1b0c163a1adc1b040d0b13e9e9012b0400f) | #6 | **All 37 tests passed** | [2af46105](https://www.testsprite.com/dashboard-v3/o/e51f28e4-5341-5e60-8bfd-ada01caee2ed/projects/7e641100-d279-409c-80ef-fed6a641762e/execution/2af46105-0c29-4db7-8a6a-cdcf17ed6c05) |

The green PR #5 comment (testsprite[bot], 2026-10-22T05:26:17Z) lists **37** test titles and links each to that execution: https://github.com/naufalfx805-source/agentpulse/pull/5. PR #6’s bot comment header also says 37 of 37 and the HTML table has 37 titles, while one summary sentence says “36 tests executed and all 36 passed” (https://github.com/naufalfx805-source/agentpulse/pull/6). The status string and the 37 links agree; the “36” sentence is a report glitch.

PRs #1–#3 have no `TestSprite V3` status. They only have the old Actions job (see CLI). Merge commits on `main` (`ab0cdf6`, `4ebcea9`) have Vercel plus `Build & Unit Tests` and no TestSprite status. The app fires on pull requests, after the preview deploy (each red/green status lands about two minutes after that commit’s Vercel success).

Dashboard execution URLs return HTTP 200 and the TestSprite app shell. The case list used here is the public GitHub comment, not the dashboard HTML.

### Required check

`GET /repos/naufalfx805-source/agentpulse/branches/main` (public branch object): `protected: true`, `required_status_checks.contexts` = `TestSprite V3` and `Build & Unit Tests`, `enforcement_level: everyone`. `everyone` is GitHub’s value for “apply to admins too.”

`GET .../branches/main/protection` returns **403** (integration is not an admin), so strictness, review count, and force-push rules are not visible. `GET .../rulesets` returns `[]` (classic branch protection, no rulesets).

PR #5 stayed open through the three red statuses and was merged by `naufalfx805-source` at 2026-10-22T20:01:39Z, after the 37/37 status at 05:27:42Z. That matches a gate. There is no recorded API rejection of a merge attempt while red.

### CLI

Current `ci.yml` does not call the TestSprite CLI. The first workflow, [testsprite.yml at `6b16279`](https://github.com/naufalfx805-source/agentpulse/blob/6b16279/.github/workflows/testsprite.yml), named the job `TestSprite 3.0 Verification Gate` and ran `TestSprite/testsprite-action@v1` with `continue-on-error: true`. On the first main run the action exited 5 and the job still succeeded: https://github.com/naufalfx805-source/agentpulse/actions/runs/38167370655. Commit `48e1a98` renamed the job to `Build & Unit Tests` and deleted the action. [`scripts/testsprite-portal-automation.py`](https://github.com/naufalfx805-source/agentpulse/blob/main/scripts/testsprite-portal-automation.py) is a Windows-local Playwright login helper (hardcoded email, no password, path `C:\Users\naufa\playwright-agent`). It is not in CI.

### MCP

No MCP config, no `.cursor/mcp.json`, no TestSprite MCP server in the tree or in git history file names.

### Plans committed in the repo

**0** TestSprite plan files. The 37 cases live in portal project `agentpulse-pi` (org `e51f28e4-5341-5e60-8bfd-ada01caee2ed`, project `7e641100-d279-409c-80ef-fed6a641762e`). The repo documents them in the README table only.

### Triage / automation

The bot posts a PR comment with per-case links and screenshots. No GitHub issues exist. No auto-fix bot. Codex left one review on `dbd7bf7` predicting that empty/`0` status would be stored as 200 (https://github.com/naufalfx805-source/agentpulse/pull/5). Fixes were pushed by the author with Claude as co-author.

### Schedules

None. Workflow triggers are `push` to `main` and `pull_request`. No cron. No TestSprite run on the merge to `main`.

### Red → green

1. **PR #5, TestSprite V3, real UI bugs.** 33/37 → 35/37 → 36/37 → 37/37. Links in the table above. Push `dbd7bf7` added cases and the form accepted status `0` / `999` / blank and rejected a path with surrounding spaces (commit message on [`d167e52`](https://github.com/naufalfx805-source/agentpulse/commit/d167e52707c6d25e3688487d857a5317b0b030ff) and the [article](https://dev.to/naufalfx805source/testsprite-caught-three-real-bugs-before-i-could-merge-building-agentpulse-for-testsprite-3gdg)). Fix 1 moved validation into `scenarioValidation.mjs`. Rerun was 35/37: the article says the blank-status case still saw stale React state `"200"` and a second case still failed because Fleet Overview could not open one specific pipeline. Fix 2 (`7457257`) reads `FormData` on submit → 36/37. Fix 3 (`431454a`) adds “View Details” on each pipeline card → 37/37, then the PR merged.
2. **PR #1, unit tests only, misnamed job.** Intentional reliability-rounding regression: https://github.com/naufalfx805-source/agentpulse/actions/runs/38247632648 (`# tests 7`, `# pass 6`, `# fail 1`) then https://github.com/naufalfx805-source/agentpulse/actions/runs/38247718293 (`# pass 7`). The README now says the unit tests caught it, which matches the log. This is not a TestSprite App run.

### Credits

No ledger in the repo. The committed screenshot [`public/screenshots/testsprite_api_keys.png`](https://github.com/naufalfx805-source/agentpulse/blob/main/public/screenshots/testsprite_api_keys.png) is the portal chat home, not an API-key page. It shows plan **Free**, **150 Credits Remaining**, and a 1 Month Free Trial badge. That is a point-in-time capture, not a live balance.

## Test inventory

| Layer | Claimed | Verified | Evidence | Status |
|---|---:|---:|---|---|
| TestSprite 3.0 E2E, total | 37 | 37 titles in the PR #5 bot comment; status “All 37 tests passed” | [PR #5 comment](https://github.com/naufalfx805-source/agentpulse/pull/5), [execution d86da53c](https://www.testsprite.com/dashboard-v3/o/e51f28e4-5341-5e60-8bfd-ada01caee2ed/projects/7e641100-d279-409c-80ef-fed6a641762e/execution/d86da53c-5e71-446d-908a-bd658925b24b) | **VERIFIED** (count). Plans are not in git. |
| Fleet Overview | 5 | Use-case ids are not on the check comment | [README table](https://github.com/naufalfx805-source/agentpulse/blob/main/README.md) | **UNVERIFIED** as a bucket. Titles overlap fleet, scenarios, and the loop. |
| Pipeline Studio | 6 | same | README | **UNVERIFIED** as a bucket |
| Test Scenarios | 14 | same | README | **UNVERIFIED** as a bucket |
| of which input-validation | 4 | 4 titles: require Expected Status; reject below 100; reject above 599; trim surrounding spaces on Target Path | PR #5 bot comment | **VERIFIED** (those four titles exist) |
| Self-Healing Verification Loop | 6 | same | README | **UNVERIFIED** as a bucket |
| Chaos & Webhook Simulation | 6 | same | README | **UNVERIFIED** as a bucket |
| Unit tests | not given as a number in the post; CI runs `npm test` | 12 passed, 0 failed | [CI run 39981006747](https://github.com/naufalfx805-source/agentpulse/actions/runs/39981006747) (`# tests 12`, `# pass 12`). Local `npm test` on Node 22.23.4 also 12/12, then `node_modules` deleted. | **VERIFIED** |
| TestSprite plans in git | implied by “the suite” | 0 files | repo tree | **VERIFIED** absence |
| Earlier portal suite | 33, then +4 | status “All 33 tests passed” on `48e1a98`, then 33/37 on `dbd7bf7` | commits above | **VERIFIED** |

Five of the 12 unit tests import `scenarioValidation.mjs` ([`tests/scenario-validation.test.mjs`](https://github.com/naufalfx805-source/agentpulse/blob/main/tests/scenario-validation.test.mjs)). The other seven live inside [`tests/self-healing-verification.test.mjs`](https://github.com/naufalfx805-source/agentpulse/blob/main/tests/self-healing-verification.test.mjs) and test functions defined in that file. The app does not import them.

## Claim verification

| Claim | Verdict | Evidence |
|---|---|---|
| 37 TestSprite 3.0 tests | **VERIFIED** | Status “All 37 tests passed” on `431454a` and `acd5f1b`; bot comment lists 37 titles. |
| Split 5 / 6 / 14 / 6 / 6 across those five use cases | **UNVERIFIED** | Only the README states the buckets. The check comment does not label FLE/PIP/SCE/LOO/CHA or print per-bucket counts. 5+6+14+6+6 = 37, which matches the total. |
| 4 of the scenario cases are input validation | **VERIFIED** | Four matching titles in the PR #5 comment (blank/required status, below 100, above 599, trim path). |
| Branch protection on `main` requires the TestSprite check, admins included | **VERIFIED** | Branch object: context `TestSprite V3`, `enforcement_level: everyone`. Full protection endpoint 403. |
| Protection also requires the CI build and unit tests | **VERIFIED** | Same object: context `Build & Unit Tests` (app_id 15368, GitHub Actions). |
| First push 33/37: form accepted status 0, 999, or blank, and rejected paths with spaces | **VERIFIED** for 33/37 (`dbd7bf7` status). The four failure names are the author’s commit message, the article, and a Codex note that empty/`0` was stored as 200. The red bot comment was overwritten. |
| Fix 1 → 35/37 because of stale React state `"200"` | **VERIFIED** for 35/37 (`d167e52` status, “2 failed”). The article says both the blank-status stale-`"200"` bug and the missing per-pipeline drill-down were still red. The parenthetical names one of the two. |
| Fix 2 → 36/37 | **VERIFIED** | `7457257` status “36/37 passed · 1 failed”. Next commit message says the remaining case was opening one pipeline from Fleet Overview. |
| Fix 3 → 37/37 and the merge unblocked | **VERIFIED** | `431454a` “All 37 tests passed”; PR #5 merged 2026-10-22T20:01:39Z after that status. |
| The suite runs on the PR preview, not production | **VERIFIED** as the design, with timing evidence. Each TestSprite status is posted after that commit’s Vercel deployment success. The status payload does not echo the preview hostname. Article and README describe the `{branch-slug}` preview URL. Branch `verify-gate` preview host is in the Vercel bot comment on PR #5. |
| Article: three real bugs before merge | **VERIFIED** as the article’s grouping (bad status, path trim, stale state), with a fourth finding on the rerun (no per-pipeline open). Counts match the status API. |
| An earlier job named “TestSprite 3.0 Verification Gate” did not run TestSprite | **VERIFIED** | `continue-on-error: true`; run 38167370655 action exit 5, job success. Removed in `48e1a98`. |
| PR #1 was a TestSprite self-healing loop | **FALSE** as a TestSprite App loop. It was 7 unit tests under the misnamed job (6/7 then 7/7). The current README says this. The in-app loop inspector still shows a fictional `test_schedule_update_empty_cron` and “All 26/26”. |
| Live app is production telemetry for agent fleets (98.6% fleet success, MTTR 42s) | **FALSE** as measurement. Those figures are literals in `mockData.ts` (`successRate: 98.6` on one pipeline, `passRate: 97.6` on the hero). The live HTML hero reads **97.6%**. |
| Apache 2.0 | **FALSE** | README badge links to `LICENSE`. No `LICENSE` file in the repo (43 tracked files). |
| Demo is 1:30 | **VERIFIED** for the GitHub release asset (90.12s). The Drive file named in the submission packet reviewed here is **101.5s**. |
| TestSprite runs on every pull request | **VERIFIED** after the app trigger (PR #4 head, #5, #6). **FALSE** for PR #1, #2, and #3. |
| “26 scenarios” copy still in the product | Present, and it contradicts 37. Mock event text and the loop inspector still say 26. | [`mockData.ts`](https://github.com/naufalfx805-source/agentpulse/blob/main/src/data/mockData.ts), [`SelfHealingLoopView.tsx`](https://github.com/naufalfx805-source/agentpulse/blob/main/src/components/SelfHealingLoopView.tsx) |

## Code quality

Small, readable client app. `strict` is on. The validation module is plain JS with JSDoc so `node --test` can import it, and the form uses it. CI builds and tests on every PR and on `main`. ESLint is configured (`eslint.config.mjs`) and is not a CI step. No test-coverage gate, no typecheck script beyond `next build`.

Smells that matter to a judge:

- Almost all “telemetry” is seeded mock data. Creating a scenario or running a pipeline only mutates React state. Chaos dispatch does not call GitHub or TestSprite.
- `calculateFleetReliability` and the chaos helpers are defined in the test file, so the green unit job does not lock the UI.
- `ci.yml` still comments that the app “runs the 33-case portal suite.”
- `SUBMISSION.md` video script still says “33-case.” The committed SRT still cites closed TestSprite CLI PR **#386** and “21/21 CI Workflows GREEN.” PR #4’s own body says #386 was closed by maintainers. The record script was pointed at PR #354; the SRT and the release mp4 were not regenerated.
- README Apache badge with no license file.
- [`SettingsView.tsx`](https://github.com/naufalfx805-source/agentpulse/blob/main/src/components/SettingsView.tsx) defaults a client-side API-key field to a demo string.
- The “API keys” screenshot is the portal home (Free, 150 credits), captioned as key provisioning.
- Loop inspector copy is a fictional cron bug and “26/26,” while the proof link under it correctly points at PR #5 “33/37 → 37/37.”

## Live-site behavior

Checked 2026-10-23 with curl.

| URL | Status | Time | What came back |
|---|---:|---:|---|
| https://agentpulse-pi.vercel.app/ | 200 | 0.27s then 0.05s (cache HIT) | HTML title “AgentPulse — Autonomous AI Agent Verification & Self-Healing Ops”. Prerendered hero includes Fleet Overview, Pipeline Studio, Test Scenarios, Chaos & Webhooks, The TestSprite Loop, Test Health, Settings, **Fleet Reliability 97.6%**, MTTR 42s, pipeline cards with **View Details** and **Run Pipeline**, success 98.6% / 94.2% / 100%. |
| `/favicon.ico` | 200 | 0.08s | icon |
| `/screenshots/testsprite_dashboard_tab.png` | 200 | 0.11s | PNG from `public/` |
| `/pipelines`, `/scenarios`, `/api`, `/api/health`, `/does-not-exist` | 404 | 0.05–0.11s | Next 404, ~9 KB |

No REST API. Tabs are not URLs, so a refresh cannot deep-link a studio. The page is a public demo (article says preview deployment protection was turned off so TestSprite would not hit a Vercel login wall). This review did not click through the SPA in a browser; the prerender already contains the fleet, pipeline, and View Details markup, and the Drive video shows the scenario modal rejecting an out-of-range status.

## Demo

**Yes.** Two different files.

- **Drive file the packet points at:** `AgentPulse-TestSprite-S4-demo.mp4`, 101.52s, 1280×720, H.264, no audio stream, 3.6 MB, created 2026-10-23T13:52Z. Frames: title card (“37 TestSprite tests on every pull request”); Pipeline Studio with a caption that View Details was missing and TestSprite flagged it; the create-scenario modal with a caption about status 0/999/blank; the same modal showing the 100–599 error and a trimmed path; Chaos & Webhooks; GitHub PR #5 merged with the TestSprite comment “37 of 37 tests green” and a caption “33/37 → 35/37 → 36/37 → 37/37.”
- **GitHub release v1.0.0 (2026-10-15):** 90.12s, 1280×720, 7.8 MB. The SRT in git walks fleet metrics, the DAG, chaos, PR #1, and ends on CLI PR #386 / 21/21. That cut predates PR #5 and still carries the claim PR #4 withdrew.

## Weaknesses / risks for judges

- The product does not observe agents, pipelines, or webhooks. A judge who treats it as an ops tool will score problem value low. The honest product is “a polished mock, plus a real TestSprite gate on the mock.”
- E2E cases are portal-only. A judge cannot re-run them from git, and the red-run comments were edited away. Status strings survive; per-case failure text for the 33/37 run does not.
- Use-case counts 5/6/14/6/6 are an author table. Titles in the green comment do not carry those ids.
- In-product copy still says 26 scenarios and a made-up cron failure, next to a link that says 37. The release video and SRT still sell closed PR #386.
- No license file. CI does not lint. Unit tests for “fleet reliability” do not touch the UI.
- TestSprite does not run on `main` after merge, and there is no nightly. The gate is PR-only.
- PR #6’s bot summary says both “37 of 37” and “36 tests executed.”
- Full branch-protection document is 403. `enforcement_level: everyone` is visible; other rules are not.

## Where it beats Ninety

Ninety is https://github.com/mohamedwael201193/ninety (live https://ninety-coral.vercel.app). Its TestSprite story is a GitHub App check (PR #62 43/43, PR #63 42/43), 43 frontend plans and 28 Python API tests committed in git, and a CLI workflow whose nightly and smoke paths are disabled or broken. Branch protection is API 403, and PR #63 merged while TestSprite V3 was red. No demo video.

1. **The check is actually required, including for admins.** AgentPulse’s `main` branch object lists required contexts `TestSprite V3` and `Build & Unit Tests` with `enforcement_level: everyone` (https://api.github.com/repos/naufalfx805-source/agentpulse/branches/main). PR #5 merged only after 37/37. Ninety would need the same required contexts with enforcement for admins, and it would need to stop merging while `TestSprite V3` is red (PR #63).
2. **One PR with four recorded counts and real UI bugs, rerun by the app.** 33/37, 35/37, 36/37, 37/37 on https://github.com/naufalfx805-source/agentpulse/pull/5, executions [96a5dcde](https://www.testsprite.com/dashboard-v3/o/e51f28e4-5341-5e60-8bfd-ada01caee2ed/projects/7e641100-d279-409c-80ef-fed6a641762e/execution/96a5dcde-3dce-434b-bae6-291901c89306), [c9872ebc](https://www.testsprite.com/dashboard-v3/o/e51f28e4-5341-5e60-8bfd-ada01caee2ed/projects/7e641100-d279-409c-80ef-fed6a641762e/execution/c9872ebc-253a-4eec-8755-044303c5a571), [b543911b](https://www.testsprite.com/dashboard-v3/o/e51f28e4-5341-5e60-8bfd-ada01caee2ed/projects/7e641100-d279-409c-80ef-fed6a641762e/execution/b543911b-dcf6-4e2c-98fa-86864f4ad58b), [d86da53c](https://www.testsprite.com/dashboard-v3/o/e51f28e4-5341-5e60-8bfd-ada01caee2ed/projects/7e641100-d279-409c-80ef-fed6a641762e/execution/d86da53c-5e71-446d-908a-bd658925b24b). The failures were form validation, stale React state, and a missing drill-down. Unit tests stayed green the whole time (the article’s point). Ninety would need a preview-targeted run whose red counts stay on the commit statuses, and a merge that waits for green.
3. **A demo that shows that loop.** Drive mp4, 101.5s, 720p, filmed 2026-10-23, ends on the merged PR and the 37/37 comment: https://drive.google.com/file/d/1FXHbW6gyLwtJvrNj4c81uDmH9yWtI22T/view. Ninety has no demo video. Matching it means a short recording of a real red→green PR, not a slide.

Ninety still leads on substance under the tests: plans and API tests in git, an engine with a parity oracle, and a much larger verified suite. AgentPulse’s tests prove a mock UI. Ninety’s weakness is that the gate can be red and still land.

**TestSprite technique Ninety lacks:** a portal trigger aimed at the PR’s Vercel preview URL, plus branch protection that requires `TestSprite V3` for admins. The article also records a concrete gotcha: do not put a Vercel deployment-protection bypass secret in that URL, because TestSprite prints the URL on a public PR comment. AgentPulse’s author deleted the `continue-on-error` CLI step that let a job named TestSprite pass on exit 5; Ninety’s `testsprite-smoke.yml` is the same class of broken CLI invocation and is still in tree, disabled.

## Estimated judging scores

| Criterion | Score | Why |
|---|---:|---|
| Problem value | 4 | The agent-QA problem is real. This app does not do that job. It simulates the dashboard. |
| TestSprite depth | 7 | Required App check, preview target, four-step red→green on real bugs. No plans in git, no MCP, no CLI, no schedule, no triage bot. |
| Verifiability | 8 | Status API, branch object, 37 titles, CI log of 12 unit tests, local re-run. Bucket counts and the overwritten red comments are the holes. |
| Polish | 6 | Coherent dark UI and a real validation fix. Mock numbers, 26-vs-37 copy, missing license, stale SRT, lint not in CI. |
| Demo | 7 | Drive video is 101.5s and shows the actual PR #5 loop. Silent. The release cut still sells PR #386. |
| **Overall** | **6** | Strongest as a TestSprite wiring exhibit. Weak as a product. A judge who weights “tests that run themselves” will rank it higher than the overall. |
