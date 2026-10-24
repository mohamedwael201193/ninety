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
