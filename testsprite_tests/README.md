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

These 14 plans are the cloud suite. `TS13`–`TS15` are written and join the suite in later pull requests. Every pull request runs all of them against its Vercel preview, and the merge is blocked until they pass. `test-ids.json` maps each plan to its TestSprite test id.

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
