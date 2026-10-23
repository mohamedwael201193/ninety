# Vaka

- **Name:** Vaka
- **Repo:** https://github.com/canzorlu-eng/Vaka (author `canzorlu-eng`, MIT, default branch `main`, 0 stars)
- **Live:** https://vaka-z1na.onrender.com/
- **TestSprite PRs:** https://github.com/canzorlu-eng/Vaka/pull/20 , https://github.com/canzorlu-eng/Vaka/pull/6 (also ran on https://github.com/canzorlu-eng/Vaka/pull/17 and https://github.com/canzorlu-eng/Vaka/pull/26)
- **Demo:** https://youtu.be/p4gcD--I_NQ
- **Review date:** 2026-10-23
- **Reviewer model:** Grok 4.7

## What it is

Vaka is a bilingual (Turkish default, English toggle) virtual-patient trainer for dental students. A student picks one of 11 specialties, opens one of 139 authored cases, interviews an AI patient by text or voice, examines, orders tests, commits a diagnosis and treatment plan, and receives a rubric-scored debrief (history 25, exam 20, test stewardship 15, diagnosis 25, treatment 15). Free accounts get 3 sessions a month; Pro ($9/month or $90/year via iyzico) gets 60 sessions, 10 AI case generations, and server-side OpenAI TTS. It is framed as education, and the README says the content has not been reviewed by a practising dentist. Live catalogue: https://vaka-z1na.onrender.com/api/topics?lang=en

## Architecture

One Docker image on Render (web service `vaka`, Frankfurt, `starter`, health check `/api/health`) serves a FastAPI process that also hosts the CRA React 19 SPA. PostgreSQL 16 is the source of truth; Render Key Value (Redis, free plan in the blueprint) holds rate limits, locks, and a TTS cache. Case JSON is loaded at startup from `backend/cases/`. AI calls (Gemini chat/generation, OpenAI TTS, iyzico) stay on the server.

| Piece | Role | Link |
|---|---|---|
| App entry, SPA fallback, routers | `backend/server.py` | https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/server.py |
| Catalogue load + compact-case expansion | `backend/case_store.py` | https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/case_store.py |
| Spoiler-free public case + rubric | `backend/casetools.py` | https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/casetools.py |
| Plans (free vs pro, voice flag, quotas) | `backend/plans.py` | https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/plans.py#L23-L28 |
| Sessions, scoring, TTS route | `backend/routes_sessions.py` | https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/routes_sessions.py#L236-L242 |
| Gemini + OpenAI TTS gateway | `backend/llm.py` | https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/llm.py |
| Job queue for case generation | `backend/jobs.py` | https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/jobs.py |
| iyzico subscriptions | `backend/billing.py` | https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/billing.py |
| React routes | `frontend/src/App.js` | https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/frontend/src/App.js |
| Deploy blueprint | `render.yaml` | https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/render.yaml |
| Write-up | `docs/ARCHITECTURE.md` | https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/docs/ARCHITECTURE.md |

CI is `.github/workflows/ci.yml`: backend (ruff, Alembic on empty Postgres 16, pytest, pip-audit), frontend production build, Docker image smoke (`/api/health` + SPA shell), gitleaks, then an aggregate job named `deploy gate`. https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/.github/workflows/ci.yml

## TestSprite integration depth

**Score: 4 / 10.** The GitHub App posts a `TestSprite V3` commit status and a long PR comment on four pulls, and a 25-criterion PRD is committed. The check is not required, it stays green when a test fails, six of the 34 browser tests are blocked on every run because Google rejects the test account, generated test code is not in the repo, and there is no CLI, MCP, schedule, issue triage, or red-to-green TestSprite loop.

### GitHub App

Commit status context `TestSprite V3` (status API, not a GitHub Actions check run). Bot comments are from `testsprite[bot]`. No `.github` workflow, MCP config, or TestSprite CLI invocation exists in the tree (search of the clone). The README says the app runs after `deploy gate`; timestamps match on the PRs below (comment within about a minute of the gate).

| PR | Merged | `TestSprite V3` | Counts | Execution | Comment |
|---|---|---|---|---|---|
| [#6](https://github.com/canzorlu-eng/Vaka/pull/6) ci/docs | 2026-10-20 19:39Z | SUCCESS | 28 passed, 6 blocked, 34 total | [execution 4cebe771](https://www.testsprite.com/dashboard-v3/o/38ac4724-748a-5691-9d6c-03af386d7b20/projects/0d19c4a1-b965-4166-a329-3604c0f94607/execution/4cebe771-af14-4144-b786-0f5128ef8a7e) | [comment](https://github.com/canzorlu-eng/Vaka/pull/6#issuecomment-6299720491) |
| [#17](https://github.com/canzorlu-eng/Vaka/pull/17) PRD/README | 2026-10-20 20:13Z | SUCCESS | 28 passed, 6 blocked, 34 total | [execution 120e5e8d](https://www.testsprite.com/dashboard-v3/o/38ac4724-748a-5691-9d6c-03af386d7b20/projects/0d19c4a1-b965-4166-a329-3604c0f94607/execution/120e5e8d-9c77-4c23-81be-70808cad849c) | [comment](https://github.com/canzorlu-eng/Vaka/pull/17#issuecomment-6299860644) |
| [#20](https://github.com/canzorlu-eng/Vaka/pull/20) session titles / limit copy | 2026-10-20 20:13Z | SUCCESS | 28 passed, 6 blocked, 34 total | [execution 0d764aef](https://www.testsprite.com/dashboard-v3/o/38ac4724-748a-5691-9d6c-03af386d7b20/projects/0d19c4a1-b965-4166-a329-3604c0f94607/execution/0d764aef-434b-431b-9e88-86ca12238b85) | [comment](https://github.com/canzorlu-eng/Vaka/pull/20#issuecomment-6299913041) |
| [#26](https://github.com/canzorlu-eng/Vaka/pull/26) polish | 2026-10-20 20:19Z | SUCCESS | 27 passed, **1 failed**, 6 blocked, 34 total | [execution c159147f](https://www.testsprite.com/dashboard-v3/o/38ac4724-748a-5691-9d6c-03af386d7b20/projects/0d19c4a1-b965-4166-a329-3604c0f94607/execution/c159147f-8656-4d32-8e8b-e4338b3e6128) | [comment](https://github.com/canzorlu-eng/Vaka/pull/26#issuecomment-6300552886) |

The failed case on PR 26 is [View pricing plans in the default currency and billing cycle](https://www.testsprite.com/dashboard-v3/o/38ac4724-748a-5691-9d6c-03af386d7b20/projects/0d19c4a1-b965-4166-a329-3604c0f94607/execution/c159147f-8656-4d32-8e8b-e4338b3e6128/test/d7c65aaf-3919-4f2b-913b-52c382a646fe): the page opens on yearly billing (`$90/year`, "Yıllık" selected). The UI default is `useState("year")` in [Pricing.jsx](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/frontend/src/pages/Pricing.jsx#L29). The PR merged with the status still SUCCESS.

The same six cases are blocked on every run, because Google sign-in returns "Couldn't find this account" for `example@gmail.com`: signed-in nav, account menu, language switch while signed in, yearly Pro payment form, currency switch inside the payment form, restart-from-debrief. The passed set is public: landing, language, topics, briefing, scripted demo, pricing toggles, legal pages. The bot's prose sometimes says "21 passed and 4 blocked" or "22 passed" while the results line and tables say 28/6. Use the results line.

PRs [#1](https://github.com/canzorlu-eng/Vaka/pull/1)–[#5](https://github.com/canzorlu-eng/Vaka/pull/5) have no TestSprite comment. [#27](https://github.com/canzorlu-eng/Vaka/pull/27) opened and merged in about 10 seconds (20:27:37Z to 20:27:47Z) with `deploy gate` success and no `TestSprite V3` status. Later direct pushes to `main` (21–22 Oct, including [run 39822568459](https://github.com/canzorlu-eng/Vaka/actions/runs/39822568459)) have an empty commit status list.

### Required check?

- Classic branch protection: `GET /repos/canzorlu-eng/Vaka/branches/main/protection` returns **403** (`Resource not accessible by integration`).
- Ruleset [Protect main](https://github.com/canzorlu-eng/Vaka/rules/25504457) (`id` 25504457, active since 2026-10-20T20:23:43Z, includes `refs/heads/main`) contains deletion, non-fast-forward, and pull request (0 required reviews). It has no `required_status_checks` rule. `TestSprite V3` and `deploy gate` are therefore not required by the ruleset this token can read.
- Evidence the status does not block merges: PR 26 merged while one browser test had failed and the status was SUCCESS; PR 27 merged with no TestSprite status at all.

### CLI, MCP, plans in git, triage, schedules

- **CLI:** none. No `testsprite` command in workflows.
- **MCP:** no `mcp.json` or TestSprite MCP config.
- **Plans/code in repo:** 0 generated test files. The source document is [docs/TESTSPRITE_PRD.md](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/docs/TESTSPRITE_PRD.md): 25 numbered acceptance criteria plus safe-testing rules (never delete the account, no checkout, no AI case generation, at most 3 patient messages). The PRD's criterion 20 says the Pro button stays unavailable and no payment form is shown; later commits added a checkout modal, and the suite now tries payment forms that stay blocked.
- **Triage:** the bot comment is the only triage. The repo has **0 issues** (`gh issue list` empty). No auto-fix bot. No classification of failures into UI vs engine beyond the bot's blocked-vs-failed split, and that split does not fail the status.
- **Schedules:** CI is `push` to `main`/`staging` and `pull_request` only. [staging-smoke.yml](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/.github/workflows/staging-smoke.yml) is `workflow_dispatch` / `repository_dispatch`, not cron. Dependabot version PRs are paused (`open-pull-requests-limit: 0`).
- **Red to green:** no TestSprite loop. The one failed browser case was merged green. CI on PR 6 did go red then green (below), which is the project's own pytest/audit gate, not TestSprite.

### CI red to green on PR 6 (not TestSprite)

Failed runs on `ci/deploy-and-docs`: [39429797234](https://github.com/canzorlu-eng/Vaka/actions/runs/39429797234), [39483036012](https://github.com/canzorlu-eng/Vaka/actions/runs/39483036012), [39483552894](https://github.com/canzorlu-eng/Vaka/actions/runs/39483552894), [39484010477](https://github.com/canzorlu-eng/Vaka/actions/runs/39484010477). Fix commits: skip live tests and gitleaks PR permission (`07dbdaf`), align the test database name (`1198874`), upgrade FastAPI/Starlette for 14 pip-audit advisories (`0dbf736`). Green gate: [39484984477](https://github.com/canzorlu-eng/Vaka/actions/runs/39484984477) — **484 passed, 1 skipped**.

### Credits

UNVERIFIED. Nothing in the repo or the public PR comments states TestSprite credit spend.

## Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
|---|---|---|---|---|
| Backend pytest in CI | "400+ ci tests"; README also says 484 | **493 passed, 1 skipped** on current `main` (15.19s). PR 6 era was 484 passed, 1 skipped | [run 39822568459](https://github.com/canzorlu-eng/Vaka/actions/runs/39822568459) (493); [run 39484984477](https://github.com/canzorlu-eng/Vaka/actions/runs/39484984477) (484) | **VERIFIED** for 400+. README **484 is stale** (now 493) |
| The 1 skip | (not claimed) | Module skip: live tests need `REACT_APP_BACKEND_URL` | [backend_test.py:24](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/tests/backend_test.py#L24); local `pytest --collect-only` reproduced "SKIPPED [1]" plus "493 tests collected" | VERIFIED |
| Catalogue content tests | 139 cases | 139 unique case ids across 11 topics; two parametrized tests walk every case | JSON count in `backend/cases/**`; live sum 139 at https://vaka-z1na.onrender.com/api/topics?lang=en ; [test_catalogue.py](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/tests/test_catalogue.py) | VERIFIED |
| TestSprite browser suite | 34 | 34 total on four executions. Passed cases are public UI. 6 blocked every time. 0 test files committed | executions linked above | **VERIFIED** as a remote suite size. **FALSE** if read as 34 tests stored in git |
| Frontend unit tests | none stated; `npm test` script exists | 0 `*.test.*` / `*.spec.*` files. CI frontend job is `npm run build` only | [package.json](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/frontend/package.json), [ci.yml](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/.github/workflows/ci.yml) | VERIFIED absence |
| Docker smoke + gitleaks + pip-audit | described in README | latest main CI jobs `docker`, `secret-scan`, `backend` all success | [run 39822568459](https://github.com/canzorlu-eng/Vaka/actions/runs/39822568459) | VERIFIED |
| Local execution | — | Collection only. Full pytest was not run | this review | not runnable locally: suite needs PostgreSQL (`TEST_ADMIN_DSN` defaults to `localhost:55432`); this environment has no Docker and no Postgres. `pytest --collect-only` after installing `requirements-dev.txt` matched CI: 493 collected, 1 skipped |

Pytest is `pytest -q` with `addopts = -m "not live"` ([pytest.ini](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/pytest.ini)). The 493 includes parametrized case validation, authz/CSRF/rate-limit/privacy tests, billing with a mocked iyzico transport, and the job queue. `backend/tests/backend_test.py` (the older live HTTP file, including a TTS audio test) does not run in CI.

## Claim verification

| Claim | Verdict | Evidence |
|---|---|---|
| "There are 400+ ci tests across 34 TestSprite browser tests" | **VERIFIED** as two separate layers: 493 pytest passed in CI, and a 34-case browser suite on the TestSprite dashboard. The 34 are not inside the 493, and they are not files in the repo. Latest public runs executed 28 (or 27) of them | [CI 493](https://github.com/canzorlu-eng/Vaka/actions/runs/39822568459); [PR 20 execution, 34 total](https://www.testsprite.com/dashboard-v3/o/38ac4724-748a-5691-9d6c-03af386d7b20/projects/0d19c4a1-b965-4166-a329-3604c0f94607/execution/0d764aef-434b-431b-9e88-86ca12238b85) |
| "(TTS and more quota inside pro plan)" | **VERIFIED** as an enforced entitlement. Free: 3 sessions/month, 0 generations, `voice=False`. Pro: 60 sessions, 10 generations, `voice=True`. `POST /api/tts` returns `{"audio": null, "reason": "plan"}` unless the plan has voice. UI copy on the live bundle: "60 sessions per month (fair use)", "Natural AI patient voice", "AI-generated cases (10 per month)". Live production of OpenAI audio for a Pro user was not exercised (would spend money; unit tests stub `llm.synthesize` to `None`) | [plans.py](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/plans.py#L23-L28); [TTS route](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/routes_sessions.py#L236-L242); [test_tts_is_pro_only](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/tests/test_security_limits.py#L161-L162); [test_pro_and_admin_get_larger_quota](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/tests/test_security_limits.py#L90-L104); [i18n pr_pro_f1–f3](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/frontend/src/i18n.js#L423-L425); live JS `https://vaka-z1na.onrender.com/static/js/main.8118a684.js` contains those English strings |
| README: TestSprite runs the live app on every PR | **FALSE** for the whole PR history. Four PRs have comments (6, 17, 20, 26). PRs 1–5 have none. PR 27 merged with no TestSprite status. Pushes to `main` after 20 Oct have no `TestSprite V3` status | PR list and status API on those SHAs |
| README: the 34-test suite covers the signed-in simulation (five phases, exam, tests, diagnosis, treatment, debrief) and the public API/security-header contract | **FALSE** for the published executions. Passed titles are public pages, demo, pricing, briefing. Signed-in cases are in the blocked six. No passed title is an API or header check (those exist as pytest and as the manual smoke workflow) | [PR 20 comment](https://github.com/canzorlu-eng/Vaka/pull/20#issuecomment-6299913041) |
| README: 484 pytest tests | **FALSE** as a current count. That number matches the PR 6 run. Current `main` is 493 passed, 1 skipped | [484 run](https://github.com/canzorlu-eng/Vaka/actions/runs/39484984477); [493 run](https://github.com/canzorlu-eng/Vaka/actions/runs/39822568459) |
| README / PRD: 139 cases, 11 specialties, weights 25/20/15/25/15, prices $9 and $90 with $108 struck through | **VERIFIED** | live topics sum 139; [DIMENSIONS](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/casetools.py#L73-L79); live `GET /api/billing/plans` returns monthly usd 9.0, yearly usd 90.0, `list_price_yearly_usd` 108.0, `available: true` |
| README: `deploy gate` is the required check | **UNVERIFIED** as GitHub enforcement. The visible ruleset does not require status checks. Branch protection API returned 403. The job exists and is what the workflow comment says Render waits on | [ruleset 25504457](https://github.com/canzorlu-eng/Vaka/rules/25504457); [ci.yml deploy-gate comment](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/.github/workflows/ci.yml#L150-L160) |
| README: iyzico sandbox still waiting on Subscription API activation | **UNVERIFIED / stale**. Live `/api/billing/plans` returns `"available": true`. This review did not submit a payment | https://vaka-z1na.onrender.com/api/billing/plans |
| README: clinical content not reviewed by a practising dentist; legal pages are drafts | **UNVERIFIED** externally (it is the author's own limitation). Legal copy in the repo is marked `[DRAFT]` / `[TASLAK]` | [README](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/README.md); [legal.js](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/frontend/src/content/legal.js) |
| Measured cost about $0.015 per voiced run | **UNVERIFIED** by this review (document only, no re-measurement) | [docs/COST_MEASUREMENT.md](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/docs/COST_MEASUREMENT.md) |

## Code quality

Python backend is typed, split by concern (auth, catalogue, sessions, jobs, billing, plans, usage ledger), and ruff is a failing CI step. `ruff format --check` is advisory (`|| echo warning`), so format drift does not fail the gate. Frontend is JavaScript/JSX on CRA + craco + Tailwind, not TypeScript. ESLint is a devDependency and is not a CI step. A large unused-looking Radix/shadcn kit ships with the app. `data-testid` hooks are spread across pages; `frontend/src/constants/testIds/` still describes a "qabot" registry and is only partly wired.

Security posture in tests is the strongest part of the codebase: route inventory that anonymous callers cannot hit non-public routes, per-user session/report/job isolation, CSRF origin checks, body size limits, secret redaction, quota and budget caps. Public case JSON strips `correct` flags ([public_case](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/casetools.py#L10-L32)). Live `GET /api/cases/cracked-tooth?lang=en` returns diagnosis options with `id` and `label` only. The scripted demo endpoint does return the correct diagnosis and treatment for `acute-pulpitis`, which matches a public replay.

Smells: pricing defaults to yearly while the TestSprite PRD expects monthly; the PRD forbids checkout and the product now opens a checkout modal; `App.js` has no unknown-route element, so any path returns the SPA shell with HTTP 200; architecture doc still describes cron backups that the lean `render.yaml` does not define; workers live in the single web process (`numInstances: 1`); Dependabot version updates are paused; several commits landed on `main` after the "pull request required" ruleset was created.

## Live-site behavior

Probed 2026-10-23 with curl. The instance was warm (about 0.14–0.36s). Every HTML route returns the same 940-byte shell, title `Vaka`, including unknown paths.

| URL | Code | Notes |
|---|---|---|
| https://vaka-z1na.onrender.com/ | 200 | SPA shell, `<div id="root">` |
| `/pricing`, `/demo`, `/topic/endodontics`, `/briefing/cracked-tooth`, `/legal/terms`, `/legal/privacy`, `/legal/refund`, `/account` | 200 | same shell; client routes |
| `/sim/nope`, `/no-such-page` | 200 | SPA fallback, no server 404 |
| `/api/health` | 200 | `{"status":"ok"}` |
| `/api/ready` | 200 | `{"status":"ok","database":true,"cache":true}` |
| `/api/topics?lang=en` | 200 | 11 topics, counts sum to 139 |
| `/api/cases?lang=en&limit=1` | 200 | one public case card |
| `/api/cases/cracked-tooth?lang=en` | 200 | spoiler-free detail |
| `/api/cases/does-not-exist?lang=en` | 404 | `Case not found` |
| `/api/demo` | 200 | scripted encounter plus correct diagnosis/treatment for the demo case |
| `/api/billing/plans` | 200 | `available: true`, $9 / $90, list yearly $108 |
| `POST /api/sessions` (no cookie) | 401 | `Authentication required` |
| `POST /api/tts` (no cookie) | 401 | `Authentication required` |
| `GET /api/me/export` | 401 | README/PRD path `/api/account/export` is 404; the route is `/api/me/export` |
| `GET /api/auth/me` | 200 | `{"authenticated":false}` |
| `GET /api/does-not-exist` | 404 | JSON |

Security headers on HTML and API: `Content-Security-Policy` (`script-src 'self'`, `frame-ancestors 'none'`), `Strict-Transport-Security` max-age 31536000, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` (microphone self). `x-render-origin-server: uvicorn` behind Cloudflare. Signed-in simulation, Google login, TTS audio, and checkout were not exercised.

## Demo

The video exists: https://youtu.be/p4gcD--I_NQ . oEmbed title: "Vaka – AI Clinical Reasoning & Virtual Patient for Dental Students" (channel "hapşırık", https://www.youtube.com/@hapsrk1703). Watch-page metadata on 2026-10-23: unlisted, published Oct 22, 2026, 5 views, 1 like. Description: "Meet Vaka: Voice-based virtual patients for dental students. Take a history, order tests, examine, diagnose, and get evaluated on clinical reasoning against evidence-based guidelines." Length is **UNVERIFIED**: the player response was `LOGIN_REQUIRED` ("Sign in to confirm you're not a bot"), so `lengthSeconds` was not in the HTML. This review did not play the video.

## Weaknesses / risks for judges

- TestSprite never executed the product's core loop. Six of 34 tests are blocked on a nonexistent Google account, including debrief restart and payment. The status is SUCCESS anyway, including when pricing actually failed (PR 26).
- The check is not in the ruleset. PR 27 and every later `main` push have no TestSprite run. "On every PR" is not what the history shows.
- Generated tests are not in git, so a judge cannot see the 34 cases without the dashboard, and the bot's narrative counts disagree with its own results line.
- The PRD and the product have drifted (no payment form vs a live checkout; monthly default vs yearly default).
- README test count (484) and "signed-in suite" description are behind the code and the dashboards.
- Clinical content is self-declared unreviewed. Legal pages are drafts. A wrong teaching case is a real risk for this domain.
- No frontend unit tests, format not enforced, no mutation tests, no nightly TestSprite or pytest schedule.
- Single-instance Render service; job workers live in the web process. Redis is on the free Key Value plan in `render.yaml`.
- Live TTS audio and a real iyzico charge were not demonstrated in CI (TTS stubbed; iyzico mocked). `available: true` only proves the plans endpoint is configured.

## Where it beats Ninety

Ninety is a no-account Schengen 90/180 calculator (Next.js on Vercel) with a deeper TestSprite footprint (plans in git, a backend CLI gate, red-to-green notes). Vaka is ahead on these specific points:

1. **A walkthrough video exists.** Unlisted YouTube demo with a description that matches the product: https://youtu.be/p4gcD--I_NQ . Ninety has no demo video. Matching it means recording a real session (history, tests, score) and publishing the link. Length and content of this one are only partly verified.
2. **Enforced plan entitlements, including TTS and quota, with tests.** Pro is 60 sessions, 10 generations, and server TTS; free is 3 / 0 / no server voice, and `POST /api/tts` refuses free users. https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/plans.py#L23-L28 and https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/tests/test_security_limits.py#L67-L162 . Ninety has no accounts. Matching it means a server-side entitlement check plus a test that the free tier cannot call the paid capability. Vaka still has not shown live Pro audio in CI.
3. **A committed TestSprite PRD plus bot comments that separate blocked from failed.** 25 acceptance criteria and explicit "do not delete / do not pay / limit AI calls" rules: https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/docs/TESTSPRITE_PRD.md . Example comment with per-test dashboard links: https://github.com/canzorlu-eng/Vaka/pull/20#issuecomment-6299913041 . Ninety's gap is the missing failure-class triage. Matching it means a PRD (or equivalent) in git and a comment that labels blocked setup vs product failure. Vaka does not fail the GitHub status on that split, and Ninety is ahead on plans committed in git, a CLI gate, and recorded red-to-green counts.
4. **Multi-user safety tests as a merge gate.** Ownership, anonymous-route inventory, CSRF, secret redaction, and pip-audit sit inside `deploy gate`: https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/tests/test_security_authz.py and the audit step in [ci.yml](https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/.github/workflows/ci.yml). Ninety would match by keeping an equivalent authz inventory only if it grew accounts; the pip-audit-in-the-gate pattern is portable now.
5. **Authored domain scale with a content oracle.** 139 bilingual cases, each checked for schema, both languages, and placeholder text: https://github.com/canzorlu-eng/Vaka/blob/d92d585bcde489c973ef48f9f0c9796e7e42286f/backend/tests/test_catalogue.py and live https://vaka-z1na.onrender.com/api/topics?lang=en . Ninety's analogue is the Commission oracle, which is stronger as an external oracle. Matching the catalogue part means a large checked content set, which Ninety's problem does not require.

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 8 | A full practice loop for a real student workflow, 139 cases, bilingual, with an honest "not clinically reviewed" limit. |
| TestSprite depth | 4 | App status + four dashboard runs + a PRD. Not required, green when a test fails, auth cases never run, no CLI/MCP/plans-in-git/schedule/red-to-green. |
| Verifiability | 7 | CI counts, live API, case count, and dashboard links all check out. README overclaims coverage and is stale on 484. |
| Polish | 7 | Security headers, typed Python, docs, Docker smoke. JS-only UI, advisory format, SPA 200s, draft legal, pricing default bug left merged. |
| Demo | 6 | Video exists and the description matches the product. Unlisted, 5 views, length and footage not verified. |
| **Overall** | **6** | Strong product and ordinary CI; the hackathon's TestSprite story is a public-page smoke suite that cannot see the signed-in simulator and does not gate merges. |
