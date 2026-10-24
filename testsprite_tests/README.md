# TestSprite suite

Frontend end-to-end tests for Ninety. TestSprite runs them in its cloud browser on every pull request, against that PR's Vercel preview. `TestSprite V3` is a required check, so a red run blocks the merge.

## Test cases

Every plan pins the date with `?today=2026-10-19` and starts either with `fresh=1` (saved trips cleared) or from a named `?scenario=`.

| Plan | What it proves |
| --- | --- |
| `TS01-example-trips.json` | Example trips: 3 rows, 64 used, 26 left |
| `TS02-parity-table.json` | `/parity` reads 14/14, 14 rows all matching |
| `TS03-add-trip.json` | 2026-09-01 → 2026-09-10 gives 10 used, 80 left |
| `TS04-reversed-dates.json` | Exit before entry: specific error, no row saved |
| `TS05-delete-undo.json` | Delete then Undo restores the same dates and 64 days |
| `TS06-legal-plan.json` | A legal planned trip fits |
| `TS07-ees-gap.json` | `/ees` reports a 26-day gap and `figure-differs` |
| `TS08-letter.json` | `/letter` states both counts, Article 52 and the 45-day reply |
| `TC009-date-format.json` | `MM/DD/YYYY` is rejected with a YYYY-MM-DD message |
| `TC010-edit-trip.json` | Editing a trip recounts 3 → 10 days |
| `TC011-reload.json` | Trips and the count survive a reload |
| `TS09-open-stay-false-fit.json` | Open stay: a plan past day 90 does not fit |
| `TS10-open-stay-boundary.json` | Open stay: exit on day 90 fits, day 91 does not |
| `TS26-same-day-reentry.json` | Same-day exit and re-entry counts the day once |
| `TS16-scenario-carry.json` | A demo scenario carries to /ees through the nav with the same 88 days |
| `TS17-letter-validation.json` | Letter: each missing field gets its own message and no letter is drafted |
| `TS18-letter-evidence.json` | Letter from a scenario shows 88 / 90 / 2 and states them in the text |
| `TS13-earlier-exit.json` | EES: an earlier EES exit is an exit disagreement, not a missing entry |
| `TS14-missing-exit.json` | EES: a missing exit is found and its 4 days listed as one range |
| `TS30-cutoff-span.json` | EES: a stay that began before 10 April 2026 is left out (20 days, 0 comparable) |
| `TS31-cutoff-mixed.json` | EES: only the post-cutoff stay is compared (20 left out, 10 comparable) |
| `TS15-letter-law.json` | The letter states Article 52(1)–(5) accurately |
| `TS27-overstay-scenario.json` | Overstay scenario: 107 used, overstay 2026-08-30 to 2026-09-15 (17 days) |
| `TS28-open-stay-count.json` | Open stay counted through today: 19 used, 71 left, latest exit 2026-12-29 |
| `TS29-missing-entry.json` | A trip without an entry date is rejected and not saved |
| `TS34-rolling-window.json` | A later date drops old days: 30 used on 2026-10-19, 11 on 2026-11-15 |
| `TS35-use-latest-exit.json` | 'Use latest exit' turns a 105-day plan into a 46-day plan that fits |
| `TS36-proof-matrix.json` | /proof lists the 12 rules, each with its engine, parity and TestSprite tests |
| `TS37-scenario-gallery.json` | The six gallery cards show engine figures and guard badges, and open their history in the calculator or the EES check |
| `TS38-cutoff-card.json` | The /ees cutoff card states the 10 April 2026 rule, its figures match the reconciler, and its example loads and compares |
| `TS39-phone-nav.json` | At 390 px the nav links stay visible, carry the scenario, and mark the current page |
| `TS40-not-found.json` | An unknown path shows the 404 page, keeps the nav, and its links lead back to the calculator and the EES check |
| `TS41-sheet-focus.json` | Opening the trip sheet moves focus into it and makes the page behind inert; Escape releases the page and returns focus |
| `TS21-impossible-date.json` | An impossible date (2024-02-30) is named as not existing, and no trip is saved |
| `TS42-leap-day.json` | A stay on 29 February 2024 counts on 2024-08-26 and has left the window on 2024-08-27 |
| `TS45-plan-before-booked-stay.json` | A planned trip counts a stay booked after it: a 1-day plan on 2026-06-01 does not fit, latest exit 2026-04-01 |
| `TS46-overlapping-overstay-once.json` | Two overlapping trips that overstay are one overstay of 11 days |
| `TS47-ees-split-stay.json` | One stay entered as two trips matches one EES record (`match`) |
| `TS48-ees-open-stay-earlier-exit.json` | An open stay with an earlier EES exit is `exit-dates-disagree`, not a missing entry |
| `TS49-letter-refused-on-match.json` | No Article 52 letter when the EES figure matches the trips |
| `TS50-letter-pdf-cjk-name.json` | The PDF download refuses a name its font cannot draw and names the characters |
| `TS51-proof-parity-names.json` | `/proof` links exactly the 14 parity scenarios |
| `TS52-later-overstay-wording.json` | A booked overstay after the date shown is called later, not earlier |
| `TS53-developers-openapi.json` | `/developers` documents the API; its OpenAPI 3.1 document lists `/api/v1/check`, `/api/v1/ees-reconcile` and `/api/v1/letter` |
| `TS54-invalid-today-param.json` | `?today=2026-02-30` is refused with "not a real calendar date" and the real date is used |
| `TS55-cancel-trip.json` | Cancelling a filled trip sheet saves nothing: 0 rows, 0 used, 90 left |
| `TS56-delete-all-trips.json` | Deleting the 3 example trips one by one ends at the empty state, 0 used, 90 left |
| `TS57-deep-parity.json` | `/parity` shows deep parity 399/400 and names kom-1-4 (stays before 22 April 2013) |
| `TS58-skip-link.json` | The skip link is the first Tab stop and Enter moves to the main content |
| `TS59-footer-links.json` | Footer links open `/proof` and `/developers` |
| `TS60-window-bar-dates.json` | The 180-day window bar spans 23 Apr–19 Oct on 2026-10-19 and 20 May–15 Nov on 2026-11-15 |
| `TS61-ees-invalid-today.json` | `/ees?today=2026-13-01` is refused with its own message |
| `TS62-phone-days-bar.json` | At 390 px the sticky bar reads 26 days left and its Add trip button opens the sheet |
| `TS63-band-saved-trips.json` | The landing band switches from the example history to the saved trips (10 used, 80 left) after a reload |

Every plan listed here is in the cloud suite; `test-ids.json` maps each to its TestSprite id. TS03 and TS53–TS63 run stored, user-authored code (the files in [`frontend/`](frontend/)): each was run locally against production, then run again with one expected value changed to confirm it fails, before `testsprite test code put`. New plans are added with `node scripts/add-cloud-tests.mjs <plan.json>`. Every pull request runs all of them against its Vercel preview, and the merge is blocked until they pass. `test-ids.json` maps each plan to its TestSprite test id.

## Writing plans

- Navigate with relative paths or "the app home page" only. Never put a deployment URL in a plan: the run's environment supplies the base URL, so the same plan works on previews and production.
- Locate elements by their `data-testid` attributes; they are kept stable in the app.
- Assert what a user sees (text, counts, rows), not implementation details.

## Run with the CLI

```bash
npm i -g @testsprite/testsprite-cli
export TESTSPRITE_API_KEY=...   # never commit it
testsprite test run --all --project bd039118-0c25-4707-b018-b25619a37fce --wait
# against a specific deployment:
testsprite test run --all --project bd039118-0c25-4707-b018-b25619a37fce --target-url <deployment-url> --wait
```
