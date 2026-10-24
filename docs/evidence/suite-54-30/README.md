# 11 new frontend tests and 2 new backend tests (2026-10-24)

Each test covers a flow no earlier test covered. It was run locally (Playwright, or `requests` for the API) against https://ninety-coral.vercel.app, then run again with one expected value changed, which had to fail and did. Only then was it uploaded (`testsprite test code put`) and run on TestSprite. Code: [`testsprite_tests/frontend/`](../../../testsprite_tests/frontend/), [`testsprite_tests/backend/`](../../../testsprite_tests/backend/).

## Frontend (project Ninety): 11/11 passed on TestSprite against production

| Test | TestSprite run | Mutation (failed as expected) |
|---|---|---|
| TS53-developers-openapi | `12ebb14c-70b5-4c96-af47-9a4b28eef570` | `"/api/v1/letter"` → `"/api/v1/letterX"` |
| TS54-invalid-today-param | `37271e24-0416-431a-ac47-943a2fb0b685` | `today-override "no"` → `"yes"` |
| TS55-cancel-trip | `fab0e96e-37de-46c0-9742-9513f841ad91` | `0 trip rows` → `1 trip row` |
| TS56-delete-all-trips | `d6884b66-654f-4f0e-81d5-453a50c6befb` | `90 left` → `91 left` |
| TS57-deep-parity | `996e574d-ca6f-4c41-b402-dffe39870482` | `"399/400"` → `"400/400"` |
| TS58-skip-link | `3f44cffd-c59c-4f1f-ac81-e1e00edce10a` | `"Skip to main content"` → `"Skip to content"` |
| TS59-footer-links | `2458d953-c7f8-40dd-8370-f45b106a9642` | `URL /proof` → `URL /proofx` |
| TS60-window-bar-dates | `c97fdb4b-a8f0-46e9-b21e-6b116d862f35` | `"20 May"` → `"21 May"` |
| TS61-ees-invalid-today | `1236e62f-4e2b-45c7-b9a2-b8a469e684b3` | `"not a real calendar date"` → `"2026-13-01"` |
| TS62-phone-days-bar | `63b608ae-c124-4dce-ad2a-1fd64deeb21c` | `26 days left` → `27 days left` |
| TS63-band-saved-trips | `01b6f49c-c1af-43ef-8dbd-415e1d596f6d` | `band left 80` → `81` |

## Backend (project Ninety API): 2/2 passed

| Test | TestSprite run | Mutation (failed as expected) |
|---|---|---|
| BE29-ees-reconcile-exit-disagree | `b9aff48a-0dd6-475e-b644-9c7dc084cdb7` | `figureGap == 4` → `== 5` |
| BE30-letter-article52 | `0cffdd2e-e820-438d-af78-cc7e6244a246` | `within 45 days` → `within 44 days` |

Before these two, no backend test called `/api/v1/ees-reconcile` or `/api/v1/letter` (BE01 only checks that the OpenAPI document lists them).

## First PR run of the 54 + 30 (PR #68, `db7776c`): red, causes found

- **TestSprite V3: 52/54, 1 failed, 1 blocked** ([execution 22252c6d](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/22252c6d-540e-4963-9f23-f9cfc648cd18)).
  - **TS18 failed** (run `3e1e889a`): the letter evidence showed 0 days instead of 88. The failure bundle (`testsprite test artifact get`) shows the stored, healed code opened **the PR #67 preview by its full URL** (`ninety-git-ts03-stale-code-…`), not this PR's preview. That is a test defect: TS18 was not testing the PR it ran on. Fix: the stored code now uses the run's base URL (`VAR_{url}`) and is kept in [`TS18-letter-evidence.py`](../../../testsprite_tests/frontend/TS18-letter-evidence.py). Rerun on the PR #68 preview: passed (run `cd7adc80`).
  - **TS62 blocked** (run `9f1925fd`): "the browser viewport is desktop-sized and cannot be changed for this test". The plan now starts with an explicit "Set the browser viewport to 390 x 844" step (as TS39 does) and the code calls `set_viewport_size`. Rerun on the PR #68 preview: passed (run `4368bda2`).
- **TestSprite backend: 30/30 "error", no test ran** ([run 40047453023](https://github.com/mohamedwael201193/ninety/actions/runs/40047453023)). Every trigger failed in about 1.4 s with no run id while the GitHub App had 54 frontend runs in flight; the CLI refuses triggers over the 50-run in-flight cap (exit 11, `testsprite test run --help`). [`backend-run.mjs`](../../../scripts/ci/backend-run.mjs) now retries exit 11 every 30 s and keeps the CLI's stderr line, and the triage comment labels exit 11 as rate limiting, not a test result. The [triage comment](https://github.com/mohamedwael201193/ninety/pull/68#issuecomment-6377849876) on this PR was the first one posted by a real red run.
