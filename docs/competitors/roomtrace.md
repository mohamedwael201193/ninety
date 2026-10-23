# RoomTrace

| | |
|---|---|
| Name | RoomTrace |
| Repo | https://github.com/PRADDZY/roomtrace |
| Live | https://roomtrace.pages.dev/ |
| PR preview (still up) | https://fix-finish-roomtrace.roomtrace.pages.dev/ |
| TestSprite PR | https://github.com/PRADDZY/roomtrace/pull/2 (merged 2026-10-23T06:37:01Z, squash `cf69198`, 0 reviews) |
| TestSprite run | https://github.com/PRADDZY/roomtrace/actions/runs/39910245024 |
| Dashboard project | https://www.testsprite.com/dashboard-v3/o/1c9ff7f8-f2d9-5666-8c5a-1224f6b1f7d7/projects/af18abeb-02e3-423e-8ced-c5db01f095d7 |
| Green execution | https://www.testsprite.com/dashboard-v3/o/1c9ff7f8-f2d9-5666-8c5a-1224f6b1f7d7/projects/af18abeb-02e3-423e-8ced-c5db01f095d7/execution/9fb870df-636d-4260-90d2-779a32e3eba1 |
| Demo | https://youtu.be/Z6Ep2E_bGuY |
| Review date | 2026-10-23 |
| Reviewer model | Grok 4.7 |
| Reviewed commit | `cf69198c94965f6cfd4032139f7725b70d61b3d6` (main). PR head that the suite ran against: `33726142049b4ffa676da4fdc36271c24af5ba0b`. |

## What it is

RoomTrace is a local-first journal for renters who need dated move-in and move-out photos of the same room. The user names a property and rooms, stores original image files in that browser’s IndexedDB, and must attach a move-out note to one exact move-in record before the app will show them side by side. A ZIP (`EvidenceArchiveV1`) carries the manifest plus original bytes; restore checks structure, references, and SHA-256 before writing a new journal. A PDF is only an index. There is no account, server, or photo-upload API. The product is honest that a checksum does not prove when, where, or by whom a photo was taken ([README](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/README.md)). Value is real for a deposit dispute and narrow: one browser, no landlord share link, no legal letter.

## Architecture

Static Vite SPA on Cloudflare Pages (`npm run build`, publish `dist/`). React 19.1, React Router 7.8, TypeScript strict, Dexie 4, JSZip, pdfkit 0.20.2, Vitest 5. No backend. Client routes: workspace at `/`, quality note at `/quality` ([`src/main.tsx`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/src/main.tsx), [`src/App.tsx`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/src/App.tsx)).

| Module | Role |
|---|---|
| [`src/data/models.ts`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/src/data/models.ts) | Project, observation (`move-in` / `move-out`, optional `baselineId`), media blob + sha256 |
| [`src/data/database.ts`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/src/data/database.ts) | Dexie v1, database name `roomtrace` |
| [`src/data/capture.ts`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/src/data/capture.ts) | Room uniqueness, exact baseline, raster signature check, 10 images, 25 MB each, 240 MiB / 5,000 files |
| [`src/data/archive.ts`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/src/data/archive.ts) | Export, verify, restore. Caps: 256 MB input, 5,002 ZIP entries, 8 MB manifest, 32 MB per media item |
| [`src/data/hash.ts`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/src/data/hash.ts) | SHA-256 via `crypto.subtle` |
| [`src/data/pdf.ts`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/src/data/pdf.ts) | pdfkit index; Devanagari vs Latin font switch on U+0900–U+097F. Fonts vendored under `public/fonts/` |
| [`src/ArchiveView.tsx`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/src/ArchiveView.tsx) | Download ZIP, download PDF, verify, restore |
| [`src/App.tsx`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/src/App.tsx) | Journal, capture, compare, sample journal, `/quality` trace table |

UI chrome loads Chivo and JetBrains Mono from Google Fonts ([`index.html`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/index.html)). Photo bytes are not uploaded.

## TestSprite integration depth

**Depth score: 6 / 10.** A real CLI gate runs on same-repo PRs, pins `--target-url` to the Cloudflare preview for that commit, fails on skips, and left a public 11/11 artifact. It is not the TestSprite GitHub App, the executed tests are the cloud project rather than the git files, there is no schedule, MCP, PR comment, or failure triage, and “required by branch protection” is not readable.

### What ran

Workflow [`.github/workflows/testsprite.yml`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/.github/workflows/testsprite.yml), job name **TestSprite browser journey**, app **github-actions** (not a TestSprite GitHub App). Triggers: `pull_request` opened / synchronize / reopened / ready_for_review, non-draft, same repository. It does not run on push to `main`. The merge commit `cf69198` has only Cloudflare Pages and “Archive checks and production build” ([check runs](https://github.com/PRADDZY/roomtrace/commit/cf69198c94965f6cfd4032139f7725b70d61b3d6)).

Steps: require `TESTSPRITE_API_KEY`; poll the head SHA until the Cloudflare Pages check is success; parse the Cloudflare PR comment and accept the preview only when the comment’s commit prefix matches the head and the host ends with `.roomtrace.pages.dev`; `npm install -g @testsprite/testsprite-cli@0.15.0`; then:

```text
testsprite ci run --project af18abeb-02e3-423e-8ced-c5db01f095d7 --all --env default --target-url "$PREVIEW_URL" --fail-on-skipped --timeout 1200 --summary-file testsprite-summary.json
```

There is no `actions/checkout`. CI does not upload `testsprite/code/*.py`. The cloud project is what executes. [`testsprite/plan.md`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/testsprite/plan.md) says the GitHub App trigger is intentionally unused because Pages does not emit a deployment-status event they hook.

### Runs on PR #2

| Run | SHA | Result | Notes |
|---|---|---|---|
| [39907302118](https://github.com/PRADDZY/roomtrace/actions/runs/39907302118) | `d9d0e66` “Wire TestSprite PR checks” | cancelled | Log: `The operation was canceled` at 2026-10-23T05:45:36Z while waiting on the preview comment. No suite count. |
| [39907502140](https://github.com/PRADDZY/roomtrace/actions/runs/39907502140) | `3afbfcf` “Fix preview comment detection” | **failure** | Preview `https://fix-finish-roomtrace.roomtrace.pages.dev`. CLI without `--all` still “Dispatched 11 tests”. **5/11 passed, 6 failed, 0 skipped.** Wall clock ~2 min (05:45:46Z–05:47:46Z). Execution [`ee827e17`](https://www.testsprite.com/dashboard-v3/o/1c9ff7f8-f2d9-5666-8c5a-1224f6b1f7d7/projects/af18abeb-02e3-423e-8ced-c5db01f095d7/execution/ee827e17-ae18-4760-ab58-153f3307922f). |
| [39910245024](https://github.com/PRADDZY/roomtrace/actions/runs/39910245024) | `3372614` “Add the full TestSprite PR suite” | **success** | Same preview URL. “Dispatched 11 tests.” **“Batch run complete: 11/11 passed, 0 failed/blocked, 0 timed out”** then **“CI run: 11/11 passed, 0 failed, 0 skipped, 0 timed out”** (06:14:45.948Z dispatch → 06:14:53.936Z batch complete, about 8s). Execution [`9fb870df`](https://www.testsprite.com/dashboard-v3/o/1c9ff7f8-f2d9-5666-8c5a-1224f6b1f7d7/projects/af18abeb-02e3-423e-8ced-c5db01f095d7/execution/9fb870df-636d-4260-90d2-779a32e3eba1). Artifact [`testsprite-pr-summary` 2613 bytes](https://github.com/PRADDZY/roomtrace/actions/runs/39910245024/artifacts/12482134391). Job ~1m4s including setup. |

Green artifact titles (all `passed` / `PASSED`, every `screenshotUrl` null):

| Slug | Title | Case |
|---|---|---|
| JRN-001 | Start a journal from the sample entry point | [778cf98a](https://www.testsprite.com/dashboard-v3/o/1c9ff7f8-f2d9-5666-8c5a-1224f6b1f7d7/projects/af18abeb-02e3-423e-8ced-c5db01f095d7/test-cases/778cf98a-dbce-4442-933b-05fe412afd36) |
| JRN-002 | Reject creating a journal with no rooms | [e757647e](https://www.testsprite.com/dashboard-v3/o/1c9ff7f8-f2d9-5666-8c5a-1224f6b1f7d7/projects/af18abeb-02e3-423e-8ced-c5db01f095d7/test-cases/e757647e-8848-4669-8d6e-66ef58dd61c0) |
| JRN-003 | Add rooms during journal setup | [a517c6da](https://www.testsprite.com/dashboard-v3/o/1c9ff7f8-f2d9-5666-8c5a-1224f6b1f7d7/projects/af18abeb-02e3-423e-8ced-c5db01f095d7/test-cases/a517c6da-00c4-403f-bff6-3e10a8e95c5f) |
| REC-001 | Save a move-in room observation | [84777d05](https://www.testsprite.com/dashboard-v3/o/1c9ff7f8-f2d9-5666-8c5a-1224f6b1f7d7/projects/af18abeb-02e3-423e-8ced-c5db01f095d7/test-cases/84777d05-dc6c-4c22-b0e2-07933181f1fb) |
| REC-002 | Save a move-out room observation | [06bb98fc](https://www.testsprite.com/dashboard-v3/o/1c9ff7f8-f2d9-5666-8c5a-1224f6b1f7d7/projects/af18abeb-02e3-423e-8ced-c5db01f095d7/test-cases/06bb98fc-2802-48f4-960c-3b59766c43e6) |
| CMP-001 | Compare a move-out observation to the exact move-in baseline | [4e1263de](https://www.testsprite.com/dashboard-v3/o/1c9ff7f8-f2d9-5666-8c5a-1224f6b1f7d7/projects/af18abeb-02e3-423e-8ced-c5db01f095d7/test-cases/4e1263de-6929-4b5d-bb6f-b45a25b5d111) |
| OVW-001 | Open archive and restore from overview | [60731a03](https://www.testsprite.com/dashboard-v3/o/1c9ff7f8-f2d9-5666-8c5a-1224f6b1f7d7/projects/af18abeb-02e3-423e-8ced-c5db01f095d7/test-cases/60731a03-4ffc-42e5-8dd3-28bd16b2f048) |
| ARC-001 | Export a journal archive | [3a5b9db7](https://www.testsprite.com/dashboard-v3/o/1c9ff7f8-f2d9-5666-8c5a-1224f6b1f7d7/projects/af18abeb-02e3-423e-8ced-c5db01f095d7/test-cases/3a5b9db7-4e3a-44a8-b527-f7e7869dbe80) |
| OVW-002 | Restore a verified archive as a new journal | [60bb5a6d](https://www.testsprite.com/dashboard-v3/o/1c9ff7f8-f2d9-5666-8c5a-1224f6b1f7d7/projects/af18abeb-02e3-423e-8ced-c5db01f095d7/test-cases/60bb5a6d-236c-4be5-8efd-492b9ca2e452) |
| ARC-002 | Reject a damaged archive without changing existing records | [6d487ce8](https://www.testsprite.com/dashboard-v3/o/1c9ff7f8-f2d9-5666-8c5a-1224f6b1f7d7/projects/af18abeb-02e3-423e-8ced-c5db01f095d7/test-cases/6d487ce8-9f24-4192-8310-ea65ea55f124) |
| PDF-001 | Export journal PDF with multilingual content | [4511c6db](https://www.testsprite.com/dashboard-v3/o/1c9ff7f8-f2d9-5666-8c5a-1224f6b1f7d7/projects/af18abeb-02e3-423e-8ced-c5db01f095d7/test-cases/4511c6db-bab3-4de4-8a54-1bf1666f6b8c) |

Red-run breakdown from that run’s artifact: passed JRN-001, JRN-002, JRN-003, OVW-001, CMP-001. **Failed** ARC-001 (click “Download verified packet” timed out twice; no download). **Blocked** REC-001, REC-002, PDF-001, OVW-002, ARC-002 because the runner had no photo or ZIP to upload. Compare was not the blocked case in this CI run.

### Required check?

`GET /repos/PRADDZY/roomtrace/branches/main` reports `"protected": true`. `GET .../branches/main/protection` and the required-status-checks, reviews, restrictions, enforce-admins, and signatures subresources all return **403** (`Resource not accessible by integration`). `GET .../rulesets` and `GET .../rules/branches/main` return **`[]`** (no rulesets). No merge-blocked event. PR #2 was merged by PRADDZY with an empty review list after the Actions check was already green. The check that exists is the Actions job, not a TestSprite App check. **Whether that job is a required status check is UNVERIFIED.**

### Plans in git

11 JSON plans and 11 Playwright Python files under [`testsprite/plans/`](https://github.com/PRADDZY/roomtrace/tree/cf69198c94965f6cfd4032139f7725b70d61b3d6/testsprite/plans) and [`testsprite/code/`](https://github.com/PRADDZY/roomtrace/tree/cf69198c94965f6cfd4032139f7725b70d61b3d6/testsprite/code) (752 lines of Python). Photo, restore, reject, and PDF scripts `GET` same-origin `/test-fixtures/*` and call `set_input_files`, which is how they avoid a hosted upload slot. [`testsprite/release-brief.md`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/testsprite/release-brief.md) lists a wider RT-01..RT-12 spec (invalid image, ten-photo keyboard gallery, phone width, direct `/quality` reload). Those three are not in the 11 cloud cases.

PDF browser script types Hindi and Marathi notes, then only asserts a `.pdf` download larger than 500 bytes whose first bytes are `%PDF-` ([`pdf-multilingual.py`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/testsprite/code/pdf-multilingual.py)). It does not extract Devanagari from the PDF. That check is in Vitest.

### Triage, schedules, MCP, credits

No TestSprite PR comment (only the Cloudflare bot). No issues in the repo. No auto-fix bot. No cron, no on-merge TestSprite run. No MCP config. Quality page status strings are hardcoded “Covered” / “Configured”, not live results.

Credits: PR body says free plan, balance 142, 30 held, no purchase. The Actions log does not print a balance. **142 is UNVERIFIED** and the body predates the final suite (it still says the GitHub App run is pending).

### Red → green

1. **Vitest, not TestSprite.** [39796140326](https://github.com/PRADDZY/roomtrace/actions/runs/39796140326) (2026-10-22): 49 passed, 1 failed, 50 total. Failure: `App.test.tsx` could not find text `EXACT BASELINE LINK`. Later quality runs report 75 passed. That string is in current `App.tsx`.
2. **TestSprite CI.** [39907502140](https://github.com/PRADDZY/roomtrace/actions/runs/39907502140) 5/11 (1 product-facing export timeout, 5 blocked on missing files) → commit [`3372614`](https://github.com/PRADDZY/roomtrace/commit/33726142049b4ffa676da4fdc36271c24af5ba0b) → [39910245024](https://github.com/PRADDZY/roomtrace/actions/runs/39910245024) 11/11. The commit’s product diff is two copy lines on the quality page (status “Pending” → “Configured”) plus `--all` in the workflow and the new Python/JSON files. Archive export code did not change. The export button name in the new script is still “Download verified packet”, the control that timed out. This loop is a cloud-test rewrite (fixture fetch instead of a missing upload) plus a rerun, not a demonstrated product bugfix. The 8-second green batch is consistent with short parallel tests after the previous run burned time on timeouts. It is not per-test duration evidence; screenshots are null.

The PR body also describes an earlier manual no-room failure on `6503612` fixed by `a660607` (9/9 steps) and a blocked comparison. Those dashboard runs are **not** in GitHub Actions (the workflow did not exist yet). **UNVERIFIED.**

## Test inventory

| Layer | Claimed | Verified count | Evidence | Status |
|---|---|---|---|---|
| Vitest | 75/75 on the PR head | 75 passed / 6 files. Local `npm ci && npm test` on `cf69198`, Vitest 5.0.5, 3.71s, exit 0. Same 75 on [PR quality run](https://github.com/PRADDZY/roomtrace/actions/runs/39910245025) and [main push](https://github.com/PRADDZY/roomtrace/actions/runs/39912591669). `node_modules` removed after. | CI logs + local run | VERIFIED |
| Vitest breakdown | not stated as a split | 44 archive (16 `it` + 28 `it.each`), 10 PDF, 10 App journey, 5 capture, 3 archive view, 3 fixtures | test sources on `cf69198` | VERIFIED |
| TestSprite browser | 11/11 latest run | 11 passed, 0 failed, 0 skipped, 0 timed out | [run 39910245024](https://github.com/PRADDZY/roomtrace/actions/runs/39910245024) and downloaded artifact | VERIFIED |
| TestSprite plans in git | 11 journeys | 11 JSON + 11 Python | [`testsprite/plan.md`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/testsprite/plan.md) | VERIFIED |
| Production build | succeeds | CI `tsc -b && vite build`, 1678 modules, built in 4.17s on the PR head | [39910245025](https://github.com/PRADDZY/roomtrace/actions/runs/39910245025) | VERIFIED |
| Release-brief RT-01..RT-12 | spec, not a pass count | 11 cloud cases. Invalid-image, 10-photo Escape/focus, and phone `/quality` reload are Vitest or absent, not in the 11 | [release-brief](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/testsprite/release-brief.md) | n/a (spec) |
| Browser PDF Unicode | journey named multilingual | Cloud assertion is `%PDF-` and size > 500. Unicode extraction is Vitest (`embeds Unicode text for Hindi, Marathi and accented Latin`) | python vs [`pdf.test.ts`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/src/data/pdf.test.ts) | VERIFIED distinction |
| Lint | none claimed | No eslint script, no lint CI | [`package.json`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/package.json) | n/a |
| MCP / nightly / mutation | none claimed | none found | workflows | n/a |

Local tests did not need secrets or a database (`fake-indexeddb`).

## Claim verification

| Claim | Verdict | Evidence |
|---|---|---|
| Latest TestSprite run: 11/11 passed | VERIFIED | Latest suite run is [39910245024](https://github.com/PRADDZY/roomtrace/actions/runs/39910245024): log line `CI run: 11/11 passed, 0 failed, 0 skipped, 0 timed out` and artifact `passed: 11`. No later TestSprite workflow run exists (PR-only). Dashboard HTML for that execution is a client shell; counts come from the Actions artifact, not a public dashboard scrape. |
| 11 browser journeys on the PR preview: photo capture, comparisons, archive export/restore, damaged-archive rejection, multilingual PDF | VERIFIED | Log `PREVIEW_URL: https://fix-finish-roomtrace.roomtrace.pages.dev` on that run. Artifact titles cover those five themes (table above). PDF case does not assert extracted Hindi/Marathi; it types those notes and checks a real PDF download. |
| TestSprite check is required by main branch protection | UNVERIFIED | `main.protected` is true; protection payload is HTTP 403; rulesets are `[]`; no blocked merge; the emitted check is GitHub Actions “TestSprite browser journey”, and [`plan.md`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/testsprite/plan.md) says the GitHub App is not used. |
| PR body: 75/75 local tests and production build passed on this head | VERIFIED | [39910245025](https://github.com/PRADDZY/roomtrace/actions/runs/39910245025) and local rerun. |
| PR body: Actions and Cloudflare Pages passed for the head | VERIFIED | Three successful checks on `3372614`: quality, TestSprite job, [Cloudflare Pages](https://dash.cloudflare.com/?to=/0f29b8c67d98ac571ea8874d8b3c7345/pages/view/roomtrace/f8146669-e018-4ecb-adcf-a0146594f85c). |
| PR body: production and PR preview respond | VERIFIED | Both HTTP 200 on 2026-10-23 (see live section). |
| PR body: GitHub App trigger and full suite still pending; do not merge until it reports | FALSE for the merged head | The CLI suite finished 11/11 at 06:15Z and the PR merged at 06:37Z. No TestSprite GitHub App check was ever posted on `3372614` (check suites: cloudflare-workers-and-pages and github-actions only). The body was left stale. |
| PR body: no-room failure on `6503612` then 9/9 on `a660607`; sample passed; comparison blocked and “not a product failure” | UNVERIFIED | Not in Actions. The later CI red run blocked photo/ZIP cases and failed export; comparison passed there. |
| PR body: free plan, 142 credits, 30 held, no purchase | UNVERIFIED | Not in the run log or repo. Body was written before the final `--all` run. |
| README: no account, backend, analytics, or image upload | VERIFIED as far as the repo and responses show | No API routes. Pages HTML has no analytics tag. Google Fonts is a third-party request. |
| Quality page: separate TestSprite check runs the 11-case suite on the exact PR preview | VERIFIED for the workflow behavior | Copy is in the production bundle (`TestSprite runs against the PR preview`, `11-case browser suite`). The page hardcodes status “Configured”. |

## Code quality

Strict TypeScript (`strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`). CI typechecks via `tsc -b` before Vite. Archive tests are the strong part: checksum mismatch, missing media, path traversal in the manifest and in a real ZIP entry, date and baseline validation, size caps before inflate, export refused when the source would not verify, restore rolls back by validating before the write transaction. UI tests use Testing Library roles (alerts, focus return, sample labeled `DEMO DATA`).

Smells: `App.tsx` is 513 lines and several components are single long JSX lines (`ArchiveView.tsx` is 80 lines with the export UI on one line). No ESLint or Prettier. Sample journal writes SVG blobs directly, while user capture rejects SVG. `/quality` statuses cannot go red. TestSprite workflow never checks out the commit it claims to gate, so a cloud edit can pass CI without matching git. `access-control-allow-origin: *` on the HTML response. Two PRs, six first-parent commits, no license file.

## Live-site behavior

Checked 2026-10-23 with curl. No browser drive of IndexedDB (the app does not render records without JS + a local database). Production bundle does contain the sample button, “Download verified packet”, “This packet needs attention.”, “No cloud upload.”, and the 11-case quality copy.

| URL | Result |
|---|---|
| https://roomtrace.pages.dev/ | 200 in ~0.11s, title `RoomTrace — Property condition dossier`, 944-byte HTML |
| https://roomtrace.pages.dev/quality | 200, same SPA shell (client route) |
| https://roomtrace.pages.dev/does-not-exist | 200, same shell. No HTTP 404 |
| https://roomtrace.pages.dev/assets/index-CGkWEztG.js | 200, 420,882 bytes, ~0.12s |
| https://roomtrace.pages.dev/assets/index-NFcv--FD.css | 200, 68,292 bytes |
| `/test-fixtures/arrival.png`, `departure.png` | 200, `image/png`, 164 and 167 bytes |
| `/test-fixtures/valid-archive.zip`, `corrupt-media.zip`, `missing-media.zip` | 200, `application/zip`, 2370 / 2370 / 2073 bytes |
| https://fix-finish-roomtrace.roomtrace.pages.dev/ and `/quality` | 200 |
| https://f8146669.roomtrace.pages.dev/ (commit preview from the Cloudflare comment) | 200 |

Headers on `/`: `server: cloudflare`, `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, `cache-control: public, max-age=0, must-revalidate`, preconnect to `fonts.googleapis.com`. No Set-Cookie.

## Demo

A public video exists. oEmbed for https://youtu.be/Z6Ep2E_bGuY returns title **RoomTrace**, author **Pratik Daithankar** (https://www.youtube.com/@pratikdaithankar). Length, view count, and whether the frames show the failing run, the fix, and the 11/11 rerun are **UNVERIFIED** (player endpoint returned `LOGIN_REQUIRED`; watch HTML did not include `lengthSeconds`). [docs/demo-script.md](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/docs/demo-script.md) is a ~2 minute narration that requires showing the real failing case, the fix, and the passing preview rerun, and it says the merge is held until required checks pass. That last sentence is the unverified protection claim.

## Weaknesses / risks for judges

- “Required by main branch protection” cannot be confirmed. The owner merged their own PR with zero reviews. Admin bypass is also unreadable (403).
- The green 11/11 did not change archive/export product code. The previous red was mostly missing uploads plus one export timeout. Judges who open only the latest badge miss that.
- CI never runs the committed Python. Cloud tests can drift from git. Eight-second wall clock and null screenshots make step-level proof depend on a login-gated dashboard.
- The multilingual PDF journey does not check the glyphs it claims to protect. That work is local Vitest only.
- Release-brief cases for bad images, a 10-photo keyboard gallery, and a phone `/quality` reload are outside the cloud suite.
- No GitHub App check, no nightly, no MCP, no PR comment, no issue triage, no re-run on `main`.
- PR description still says the App run is pending and cites 142 credits.
- Single-browser product: clearing site data deletes the journal unless the user exported. The app says this. It is still the main product risk.
- Unknown URLs return 200. UI loads Google Fonts on a privacy-framed product.

## Where it beats Ninety

Ninety baseline used here: https://github.com/mohamedwael201193/ninety, live https://ninety-coral.vercel.app. Ninety is ahead on suite size (43 frontend plans, 28 backend API tests), a TestSprite GitHub App check, Commission parity, fuzz, and an HTTP+stdio MCP. RoomTrace does not beat that volume. These are the specific gaps Ninety would have to close:

1. **Preview-pinned CLI that fails closed.** [testsprite.yml](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/.github/workflows/testsprite.yml) waits until the Cloudflare comment’s commit matches the PR head, then runs `testsprite ci run --all --target-url <that origin> --fail-on-skipped`. The red job [39907502140](https://github.com/PRADDZY/roomtrace/actions/runs/39907502140) exited 1 on blocked cases, and that SHA was not merged. Ninety’s `testsprite-smoke.yml` is broken (several test ids, one `testsprite test run`, no `--local`) and disabled, and PR #63 merged while TestSprite V3 was red. To match, Ninety needs one PR job that resolves the deployment URL for the head SHA and fails the check when cases are blocked or skipped, and it needs to stop merging red TestSprite results. RoomTrace has not proved the check is branch-protection-required either.

2. **Same-origin fixture uploads on the free runner.** [`archive-reject.py`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/testsprite/code/archive-reject.py) downloads `/test-fixtures/corrupt-media.zip` from the preview and attaches it. The red run’s blockers were exactly “no file was provided.” Fixtures are live (HTTP 200). Ninety would need the same pattern anywhere a cloud browser must attach a file without TestSprite’s hosted upload feature.

3. **A published demo video.** https://youtu.be/Z6Ep2E_bGuY exists (oEmbed title RoomTrace). Ninety has no demo video. RoomTrace’s script also requires the red and green executions on screen; that content was not verified, so this beat is “a video exists,” not “the video proves the loop.”

4. **Deployed negative archive journey plus a deep local packet suite.** Cloud ARC-002 passed against the preview, and Vitest covers traversal, checksum, missing media, and pre-inflate size limits ([`archive.test.ts`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/src/data/archive.test.ts), [`archive-reject.py`](https://github.com/PRADDZY/roomtrace/blob/cf69198c94965f6cfd4032139f7725b70d61b3d6/testsprite/code/archive-reject.py)). Ninety’s integrity story is legal/math parity, not a user-held evidence packet. Matching this would be a different feature, not a port of the workflow.

Technique Ninety lacks: commit-matched `--target-url` plus `--fail-on-skipped` in the PR workflow, and browser tests that fetch their own fixtures. RoomTrace has no MCP config either, so it does not beat Ninety there. It also has no GitHub App check, which Ninety has.

## Estimated judging scores

| Criterion | Score | Why |
|---|---|---|
| Problem value | 7 | Real move-in/out evidence problem and a local-first design that matches it. No sharing, no legal output, one browser. |
| TestSprite depth | 6 | Real CLI gate, preview pin, fail-on-skipped, 11 committed plans, one red job then a green job. Not the GitHub App, not executed from git, no schedule, MCP, or triage. Protection claim unproven. |
| Verifiability | 7 | 11/11 and 75/75 are in public Actions logs and were re-run locally for Vitest. Dashboard steps, screenshots, credits, video contents, and required-check status are not publicly proven. |
| Polish | 7 | Strict types, careful archive limits, accessible test selectors, designed CSS, honest checksum copy. Giant components, no linter, hardcoded quality status, SPA 200s. |
| Demo | 5 | Video exists. Length and whether it shows the failing and passing runs are unverified. |
| **Overall** | **6** | A finished small product with a genuine preview CLI gate and a public 11/11. The required-check claim is unproven, the green run is mostly a test rewrite, and the suite is eleven frontend cases with no App check or triage. |
