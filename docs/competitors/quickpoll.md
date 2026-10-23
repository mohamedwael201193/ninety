# QuickPoll

- **Name:** QuickPoll
- **Author:** tujack39
- **Repo:** https://github.com/tujack39/quickpoll
- **Live:** https://quickpoll.myeventwatch.com/
- **TestSprite PR:** https://github.com/tujack39/quickpoll/pull/1 (open; base `master`, head `feature/vote-count-labels`)
- **Workflow:** https://github.com/tujack39/quickpoll/blob/master/.github/workflows/testsprite.yml
- **Demo:** none (no video in the repo or README; the live URL is the product)
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7
- **Default branch:** `master` (there is no `main` branch). Last push 2026-10-10.

## What it is

QuickPoll is a no-account poll app: a visitor writes a question and 2–8 options, receives a short public link (`/p/<code>`) and a secret manage link (`/m/<token>`), and watches results refresh every 5 seconds. The user is anyone who needs a one-off vote without signup. The value is real and small. The job is already served by many poll sites, and this build adds single vs multiple choice, optional voter name, hide-until-close, and manual or timed close. It is a complete tiny product, not a novel problem.

## Architecture

Flask + stdlib SQLite, no frontend build, no lockfile. Dependency file is one line, `Flask>=3.0` ([requirements.txt](https://github.com/tujack39/quickpoll/blob/master/requirements.txt)). The app is one module, [app.py](https://github.com/tujack39/quickpoll/blob/master/app.py) (441 lines): schema, poll/vote/manage routes, in-memory rate limit, and `app.run(host="0.0.0.0", port=PORT)`.

| Piece | Role | Link |
|---|---|---|
| `app.py` | Routes, SQL, vote hashing, results JSON | https://github.com/tujack39/quickpoll/blob/master/app.py |
| `templates/new.html` | Create form, `data-testid` hooks | https://github.com/tujack39/quickpoll/blob/master/templates/new.html |
| `templates/poll.html` | Vote UI, result bars, 5s refresh | https://github.com/tujack39/quickpoll/blob/master/templates/poll.html |
| `templates/manage.html` | Close / reopen / delete / edit-before-first-vote | https://github.com/tujack39/quickpoll/blob/master/templates/manage.html |
| `templates/created.html` | Share + manage links after create | https://github.com/tujack39/quickpoll/blob/master/templates/created.html |
| `static/style.css` | Hand-written CSS (215 lines) | https://github.com/tujack39/quickpoll/blob/master/static/style.css |
| Workflow | Only CI file | https://github.com/tujack39/quickpoll/blob/master/.github/workflows/testsprite.yml |

Deploy target is not declared in the repo (no Dockerfile, Procfile, or Blueprint). Live responses are `Server: nginx` with HSTS and a 301 from HTTP to HTTPS ([https://quickpoll.myeventwatch.com/](https://quickpoll.myeventwatch.com/)). Polls created on 2026-10-10 are still on the homepage on 2026-10-23, so the SQLite file is on a persistent disk. The code comment says gunicorn would import `app.py` and create tables at import time. Host beyond “nginx on myeventwatch.com” is UNVERIFIED.

The open PR does not change the server. It adds a per-option vote count beside the percentage in `templates/poll.html` and raises the Action timeout. That UI is not on the live site (no `data-testid="result-votes"` on [https://quickpoll.myeventwatch.com/p/ha7qzw](https://quickpoll.myeventwatch.com/p/ha7qzw)).

## TestSprite integration depth

**Depth score: 3/10.** A real official Action ran a cloud browser suite twice and published JUnit. The suite is not in git, nothing requires the check, the push trigger names a branch that does not exist, and the red run went green because two cloud tests disappeared, not because the product changed.

### GitHub App check

No TestSprite GitHub App check. The only check-run on the PR head is `e2e` from app slug `github-actions` (workflow name `TestSprite`).

- Current head `9475256` ([commit](https://github.com/tujack39/quickpoll/commit/9475256124cf2d510f8a163358a12532d31223c5)): 1 check, `e2e` **success**. Job: https://github.com/tujack39/quickpoll/actions/runs/38016829940/job/114114158729
- First PR commit `9b72017` ([commit](https://github.com/tujack39/quickpoll/commit/9b720178a097dab0677d3a12fb456806351a6b6a)): 1 check, `e2e` **failure**. Job: https://github.com/tujack39/quickpoll/actions/runs/38015852096/job/114105793458
- `master` HEAD `74269c0` ([commit](https://github.com/tujack39/quickpoll/commit/74269c0)): **0** check-runs. Same for the two earlier `master` commits that touched the workflow (`2afd1d6`, `101ad27`).

### Runs (only two exist)

Actions history is exactly two `pull_request` runs. Zero `push` runs. https://github.com/tujack39/quickpoll/actions

| Run | Event | SHA | Result | What the log says |
|---|---|---|---|---|
| https://github.com/tujack39/quickpoll/actions/runs/38015852096 | `pull_request` 2026-10-10 02:08Z | `9b72017` | **failure** (job ~7m) | `Dispatched 11 tests.` `Batch run complete: 10/11 passed, 1 failed/blocked, 0 timed out`. Timeout input was the action default **600**. The batch finished; it did not hit the wait timeout. |
| https://github.com/tujack39/quickpoll/actions/runs/38016829940 | `pull_request` 2026-10-10 02:24Z (job started 02:52Z) | `9475256` | **success** (job ~2m49s) | `Dispatched 9 tests.` `Batch run complete: 9/9 passed, 0 failed/blocked, 0 timed out`. Timeout input **1800**. |

Dashboard project (printed in both logs; page shell is public, execution detail is login-gated): https://www.testsprite.com/dashboard-v3/o/734555c1-5d70-59a5-bb49-8f2829205033/projects/05ffab45-d2e7-4f74-a1a6-a90462468fcc

Blocked execution from the red run (annotation on the failed job): https://www.testsprite.com/dashboard-v3/o/734555c1-5d70-59a5-bb49-8f2829205033/projects/05ffab45-d2e7-4f74-a1a6-a90462468fcc/execution/caa37e88-6621-4472-8612-73beab24e527

JUnit artifacts (not expired; expire 2027-01-08):

- Red, 11 cases, 1 failure: https://github.com/tujack39/quickpoll/actions/runs/38015852096/artifacts/11656726016
- Green, 9 cases, 0 failures: https://github.com/tujack39/quickpoll/actions/runs/38016829940/artifacts/11657396735

Project id in the workflow: `05ffab45-d2e7-4f74-a1a6-a90462468fcc`. Action: `TestSprite/testsprite-action@v1` (floating tag, not a SHA). The job does not `checkout` the repo, does not build, and does not pass `target-url` or `test-id`. Both runs call the cloud project’s full suite (`test run --all` inside the action). The green check does not execute the PR diff. Live HTML still matches `master` (percentage only, count inside the bar).

### Required check

- `GET /repos/tujack39/quickpoll/rulesets` returned `[]` (no rulesets).
- `GET /repos/tujack39/quickpoll/branches/main/protection` and `GET /repos/tujack39/quickpoll/branches/master/protection` both returned **403** `Resource not accessible by integration`. Protection is not verifiable. No blocked-merge event: PR #1 is still open, and nothing has been merged (0 merged PRs).

### CLI, MCP, plans in git, triage, schedules

- **CLI:** only through the Action. No committed `testsprite` command, config, or test id list. The action installs `@testsprite/testsprite-cli@latest` and runs `test run --all --wait`.
- **MCP:** no MCP config, server, or client anywhere in the repo.
- **Plans / test code in git:** **0** files. The only TestSprite file is the workflow. Test names exist only in the JUnit artifacts and the TestSprite project.
- **Triage:** 0 issues, 0 PR issue comments, 0 review comments, no bot, no ledger. The failure annotation is the action’s own `status=blocked` line plus the execution URL. Nobody replied.
- **Schedules:** none. `on` is `push` to `main` and `pull_request` only. No `workflow_dispatch`, no cron, no on-merge job beyond that push filter.
- **Credits:** not mentioned in the README, workflow, or run logs. UNVERIFIED.

### Red → green

One loop, and it is not a product fix.

1. **Red.** PR commit [9b72017](https://github.com/tujack39/quickpoll/commit/9b720178a097dab0677d3a12fb456806351a6b6a) (vote-count labels only). Run https://github.com/tujack39/quickpoll/actions/runs/38015852096. JUnit: **11 tests, 10 passed, 1 blocked**. Blocked case: “Vote with a name on a poll that requests it” (`testId` `fbb80feb-ed9f-4871-8974-a369a85b388a`, `runId` `3b33322c-5384-4efb-8755-b43afb7b5b81`). Execution link above. The other 10, including “Manage a created poll from the manage link” (398.984s in the JUnit `time` attribute), passed.
2. **Green.** Next commit [9475256](https://github.com/tujack39/quickpoll/commit/9475256124cf2d510f8a163358a12532d31223c5) changes only the workflow comment and `timeout: 1800`. Commit message says “11 browser tests need ~15 min”. Run https://github.com/tujack39/quickpoll/actions/runs/38016829940. JUnit: **9 tests, 9 passed, 0 skipped**. The blocked name-vote test is gone. So is “Manage a created poll from the manage link” (`testId` `71f356de-f2ba-4741-97be-d163dbc1ba33`), which had passed. No app file changed between the two runs. The suite was edited in the TestSprite project, outside git.

The workflow comment on `master` still says “11 browser tests” ([testsprite.yml](https://github.com/tujack39/quickpoll/blob/master/.github/workflows/testsprite.yml)). The README on `master`, committed later with **0** check-runs, says 9.

## Test inventory

| Layer | Claimed count | Verified count | Evidence | Status |
|---|---|---|---|---|
| TestSprite cloud E2E (green run) | 9, all passing, covering create / vote / live results / manage | 9 testcases, 0 failures, 0 skipped, 0 errors | [green run](https://github.com/tujack39/quickpoll/actions/runs/38016829940), [JUnit artifact](https://github.com/tujack39/quickpoll/actions/runs/38016829940/artifacts/11657396735) | VERIFIED for that run on 2026-10-10. Not re-run since. |
| TestSprite cloud E2E (previous run) | Workflow comment and the timeout commit say 11 | 11 testcases, 1 blocked, 10 passed | [red run](https://github.com/tujack39/quickpoll/actions/runs/38015852096), [JUnit artifact](https://github.com/tujack39/quickpoll/actions/runs/38015852096/artifacts/11656726016) | VERIFIED. Contradicts “the suite is 9”. |
| Test plans or test code in the repo | implied by “the suite” in README | 0 files | repo file list; only the workflow mentions TestSprite | FALSE if read as tests living in git |
| Unit / pytest / lint / typecheck | none claimed | 0 | no `test_*.py`, no pyproject, no package.json | no suite |
| Local execution by this review | — | no project test command. Smoke of `master`: process booted, `GET /healthz` 200, `GET /` 200, `GET /new` 200, `GET /p/nope` 404, empty `POST /new` 400 | local copy of https://github.com/tujack39/quickpoll/blob/master/app.py | not their suite. No secrets required. |

Green JUnit names (all passed):

1. Create a poll with live results enabled (`a3763f99-e96c-4d58-b9f3-4cd873fd6956`)
2. Create a poll with live results and voter name enabled (`eadc53e7-2d07-4334-a7e3-5db60ae9ff19`)
3. Vote in a poll (`212737f5-7aa7-4dd6-a31a-780c3c6f52f6`)
4. Vote on a poll with live results visible (`89c7bfec-d254-4062-af82-2f40e9e79922`)
5. Cast a multiple-choice vote (`3cb921db-0862-4374-8bd5-70fc0cbf4cc8`)
6. Watch live results update after additional votes (`d30e9a72-5c80-4190-8516-5cb060e453b9`)
7. Close a newly created poll (`e6dfd502-4b82-48c2-8b9c-fcc243cd11d5`)
8. Reopen a closed poll (`4ab36037-8dbd-4b38-9494-e47cc9d47fc1`)
9. Delete a poll created in the session (`6b8b7ca5-5660-44e2-bf1c-56fe4949f185`)

Present in the red JUnit and absent from the green JUnit: “Vote with a name on a poll that requests it” (blocked) and “Manage a created poll from the manage link” (passed). Close / reopen / delete cases remain, so a manage path is still in the 9.

JUnit `time` on the green suite sums to 1032.548 seconds across cases while the job step finished in about 2.5 minutes, which matches parallel cloud runs, not a skipped suite (`skipped="0"`).

**Local tests:** not runnable as a suite: the repo has no unit or e2e command. Smoke boot above used a temp SQLite file and was discarded. No `node_modules`.

## Claim verification

| Claim | Verdict | Evidence | Reason |
|---|---|---|---|
| No-signup poll app | VERIFIED | [README](https://github.com/tujack39/quickpoll/blob/master/README.md), [app.py](https://github.com/tujack39/quickpoll/blob/master/app.py), [live home](https://quickpoll.myeventwatch.com/) | No account, session, or login route. Homepage copy says “No account, no fuss.” |
| Every PR runs the TestSprite workflow | VERIFIED for same-repo PRs, with a narrow sample | [workflow](https://github.com/tujack39/quickpoll/blob/master/.github/workflows/testsprite.yml), [PR #1](https://github.com/tujack39/quickpoll/pull/1) | `pull_request` is a trigger. The only PR ran the workflow on both commits. Fork PRs are skipped when `head.repo` differs, so a fork PR does not run the suite. |
| Every push to `main` runs the 9-test suite | FALSE | [workflow `branches: [main]`](https://github.com/tujack39/quickpoll/blob/master/.github/workflows/testsprite.yml), branch API 404 for `main`, [Actions](https://github.com/tujack39/quickpoll/actions), [master HEAD](https://github.com/tujack39/quickpoll/commit/74269c0) | Default branch is `master`. `main` does not exist. Zero push runs. The README commit on `master` after the workflow landed has 0 check-runs. |
| The suite is 9 tests and they all pass | VERIFIED for the latest run only | [green run](https://github.com/tujack39/quickpoll/actions/runs/38016829940) | Log and JUnit say 9/9. The earlier run on the same PR dispatched 11 and blocked 1. The in-repo comment still says 11. |
| Coverage is create, vote, live results, and manage | VERIFIED for the green 9 | green JUnit names above | Create (2), vote (3, including multiple choice), live-results refresh (1), close/reopen/delete (3). The dedicated manage-link test and the name-field vote test are not in this 9. |
| PR #1 carries a green TestSprite check | VERIFIED as an Actions check, not a GitHub App | [PR checks](https://github.com/tujack39/quickpoll/pull/1), [job](https://github.com/tujack39/quickpoll/actions/runs/38016829940/job/114114158729) | Head check `e2e` is success. The first commit on that PR was red. The check name is `e2e`, workflow display name `TestSprite`, app `github-actions`. |
| Tests run against the live app | VERIFIED by side effect; target URL not in git | [README](https://github.com/tujack39/quickpoll/blob/master/README.md), [live home](https://quickpoll.myeventwatch.com/) | Workflow never deploys a preview. Homepage still lists “QA Close Poll 2026-10-10 run 1”, “QA Test Poll 2026-10-10 unique-001”, “Reopen-test-poll-2026-10-10-XYZ123”, created 2026-10-10, the day of the runs. |
| “11 browser tests take ~15 min” (workflow comment and [timeout commit](https://github.com/tujack39/quickpoll/commit/9475256124cf2d510f8a163358a12532d31223c5)) | FALSE as a description of the green suite | green log dispatched 9; red log dispatched 11 and finished in ~7 minutes with a blocked case, not a 600s wait timeout | Stale comment. Raising the timeout did not change the failure mode. |
| Live demo URL works | VERIFIED | https://quickpoll.myeventwatch.com/ | HTTP 200, title “Home · QuickPoll”. This is the site, not a video. |
| Demo video | none claimed in the task; none in the repo | repo file list, README | No demo video. |
| Feature list (share code, manage token, duplicate-vote IP hash, HTTP 410, parameterized SQL, `data-testid`) | VERIFIED in source. Live write path not re-posted by this review | [app.py](https://github.com/tujack39/quickpoll/blob/master/app.py), [live poll](https://quickpoll.myeventwatch.com/p/ha7qzw), [closed poll](https://quickpoll.myeventwatch.com/p/vjav7k) | Closed poll renders `closed-banner` and no vote form. Open poll renders the test ids from `master`. Creating a new live poll was not attempted here. Historical QA rows show the Oct 10 runs did create polls on production. |
| Per-option counts beside the percentage (PR title) | UNVERIFIED on the live app; code is only on the open branch | [PR diff](https://github.com/tujack39/quickpoll/pull/1), [live poll](https://quickpoll.myeventwatch.com/p/ha7qzw) | PR is unmerged. Live markup has no `result-votes` test id. |

## Code quality

The structure is easy to read: one Flask module, Jinja templates, one CSS file, parameterized SQL, Jinja autoescape for `.html`, and result labels assigned with `textContent` in the refresh script. `data-testid` values are consistent on create, vote, results, and manage. Error pages exist for 404 and 500. Health check is `GET /healthz`.

Smells that matter:

- No types, linter, formatter, lockfile, or second CI job. `Flask>=3.0` floats.
- The only CI workflow does not check out the code it claims to gate, and `push.branches` is `main` while the repo’s branch is `master`.
- Vote identity is `sha256(SECRET_SALT|code|ip)` with default salt `quickpoll-dev-salt` in source. The first `X-Forwarded-For` hop is trusted. Shared NATs collide; a client-supplied forwarded header bypasses the duplicate check if nginx does not overwrite it. Whether production sets `SECRET_SALT` is UNVERIFIED.
- Rate limit is an in-process dict (20/min), which the README already flags as single-worker only.
- `is_closed()` can `UPDATE` the row during a GET when `closes_at` has passed.
- `total_votes` is the sum of option rows, so a multi-select ballot increments the public “votes” number once per selected option. `total_ballots` exists in the JSON and is not what the page headline shows.
- TestSprite runs write public rows. The homepage’s “Recent public polls” list is QA titles from 2026-10-10 plus two polls dated 2026-10-23.
- Admin power is a 32-byte URL token. There is no CSRF token; forging a manage POST still requires that secret.
- Favicon request returns the HTML 404 (1057 bytes): https://quickpoll.myeventwatch.com/favicon.ico

## Live-site behavior

Measured 2026-10-23 with curl. Times are from this client, not a published metric.

| Request | Status | Time | What came back |
|---|---|---|---|
| https://quickpoll.myeventwatch.com/ | 200 | 0.086s | “Home · QuickPoll”. Hero, create CTA, 8 recent polls (the SQL `LIMIT 8`). |
| http://quickpoll.myeventwatch.com/ | 301 | — | Redirects to HTTPS. |
| https://quickpoll.myeventwatch.com/new | 200 | 0.060s | “Create a poll · QuickPoll”. |
| https://quickpoll.myeventwatch.com/healthz | 200 | 0.076s | `{"ok":true}` |
| https://quickpoll.myeventwatch.com/p/ha7qzw | 200 | 0.072s | Open poll, vote form, live percentages. No `result-votes`. |
| https://quickpoll.myeventwatch.com/api/p/ha7qzw/results | 200 | 0.048s | JSON, `ok: true`, `hidden: false`, 5 options, `total_votes` 2. |
| https://quickpoll.myeventwatch.com/p/vjav7k | 200 | 0.070s | “QA Close Poll 2026-10-10 run 1”. Closed banner, no vote form, results-hidden empty state. |
| https://quickpoll.myeventwatch.com/p/2j9uqr | 200 | 0.085s | Closed, results hidden, no vote form (created 2026-10-23, “sonuçlar kapalı”). |
| https://quickpoll.myeventwatch.com/p/doesnotexist | 404 | 0.064s | “Not found · QuickPoll”. |
| https://quickpoll.myeventwatch.com/m/doesnotexist | 404 | 0.090s | Same 404 page. |
| https://quickpoll.myeventwatch.com/created/nope | 404 | 0.074s | Same 404 page. |
| https://quickpoll.myeventwatch.com/nope | 404 | 0.060s | Same 404 page. |
| https://quickpoll.myeventwatch.com/api/p/doesnotexist/results | 404 | 0.068s | `{"ok":false,"error":"Poll not found."}` |
| https://quickpoll.myeventwatch.com/static/style.css | 200 | 0.048s | 8085 bytes. |
| https://quickpoll.myeventwatch.com/favicon.ico | 404 | 0.080s | HTML 404, not an icon. |

Response headers on `/`: `Strict-Transport-Security`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Server: nginx`.

This review did not POST a create or a vote to production. Read paths, the closed state, the hidden-results state, and the 404/JSON 404 behavior work. The create/vote/manage write path on the live host is evidenced by the leftover QA polls and by the Oct 10 JUnit, not by a new submission from this review.

## Demo

No demo video. README “Live demo” is the site itself: https://quickpoll.myeventwatch.com/ . Length: none.

## Weaknesses / risks for judges

- The push-to-`main` claim is false, and a judge can see that in one Actions page.
- The green check tests whatever URL is saved in the TestSprite project (production), not the PR branch. The feature under review is not what passed.
- Red to green was a cloud-side deletion of the blocked test (and of one passing test). The code commit in between only raised a timeout the failure did not hit.
- Test definitions are not in the repo, so the 9/9 result cannot be re-read or re-run without their API key. `cli-version: latest` and `action@v1` float.
- The check is not a required status (rulesets empty; protection API 403; PR still unmerged).
- No MCP, no schedule, no triage, no second run since 2026-10-10.
- Production is the fixture database. The public homepage shows QA poll titles.
- Duplicate-vote control is an IP hash plus a cookie, with a hardcoded dev salt as the default.
- No demo video. One open PR, zero merged PRs, last activity 2026-10-10.

## Where it beats Ninety

Ninety (https://github.com/mohamedwael201193/ninety, https://ninety-coral.vercel.app) is a deeper TestSprite project: plans in git, a GitHub App check, a backend CLI gate, and a written red→green history. QuickPoll does not beat that depth. Three narrow gaps:

1. **A working official Action that fails the job when a browser case is blocked, and stores JUnit.** Workflow: https://github.com/tujack39/quickpoll/blob/master/.github/workflows/testsprite.yml . Red artifact names the blocked case: https://github.com/tujack39/quickpoll/actions/runs/38015852096/artifacts/11656726016 . Ninety’s `testsprite-smoke.yml` is broken (several test ids passed to one `testsprite test run` without `--local`) and disabled, so Ninety does not currently have this Actions-level full-project browser gate. To match, Ninety would replace that smoke workflow with this action (or one `test run --all`) and upload JUnit. To exceed it, keep the plans in git and point them at the PR, which QuickPoll does not do.

2. **The deployed site is what the suite hit, and the public homepage still shows it.** QA titles dated 2026-10-10 are listed on https://quickpoll.myeventwatch.com/ . Ninety’s TestSprite checks do not leave a readable footprint on https://ninety-coral.vercel.app. To match, Ninety would run one suite against the deployed URL. To exceed, use a preview database so production is not the fixture store.

3. **Fork PRs cannot go permanently red for a missing secret.** The workflow `if` skips pull requests whose head repo is not `tujack39/quickpoll`: https://github.com/tujack39/quickpoll/blob/master/.github/workflows/testsprite.yml . Ninety’s secret-backed CLI workflows would need the same guard so an external PR without `TESTSPRITE_API_KEY` is skipped instead of failing closed forever. This is small, and QuickPoll has never received a fork PR, so the guard is unexercised.

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 4 | Clear no-signup poll, and the live app does the job. The category is crowded and the scope is one afternoon of product. |
| TestSprite depth | 3 | One official Action, two real cloud runs, JUnit, a dashboard link. No plans in git, no App check, no required check, no MCP, no schedule, no triage, dead `main` trigger, green reached by deleting the blocked test. |
| Verifiability | 5 | The 9/9 and the 10/11 are public Actions artifacts a judge can download. The test bodies are not in git, and several written claims contradict those artifacts. |
| Polish | 6 | Coherent UI, test ids, 404s, health check, nginx security headers. Homepage is a QA dump, favicon 404s, no lockfile, IP-hash voting. |
| Demo | 2 | No video. The live site is up and demonstrates read paths. |
| **Overall** | **4** | A real tiny app with one genuine TestSprite Action run, undermined by a false CI trigger and a suite that was trimmed in the cloud until it passed. |

Technique Ninety lacks: `TestSprite/testsprite-action@v1` on a project id, which runs `test run --all`, fails the job on `blocked`, and uploads `testsprite-junit.xml`. Ninety’s disabled smoke workflow is the broken hand-rolled CLI path this action is built to avoid. QuickPoll does not have Ninety’s in-repo plans, GitHub App check, backend CLI gate, or red→green write-up.
