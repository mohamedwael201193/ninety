# TestSprite suite

Frontend end-to-end tests for Ninety. TestSprite runs them in its cloud browser against the Vercel deployment: on every push to `main`, and on pull requests against the PR's preview.

## Test cases

| Plan | What it proves |
| --- | --- |
| `TC001-example-trips.json` | "Try an example" loads trips and the status panel shows the expected days used |
| `TC002-parity-table.json` | `/parity` reads 14/14 against the live Commission calculator, with all 14 rows |
| `TC003-add-trip.json` | Adding a trip updates days used |
| `TC004-invalid-trip.json` | An exit before entry is rejected and nothing is saved |
| `TC005-delete-undo.json` | Deleting a trip can be undone from the toast |
| `TC006-planned-trip.json` | A planned trip gets a fits / does-not-fit verdict |
| `TC007-ees-compare.json` | `/ees` reports the gap between your count and the EES figure |
| `TC008-letter.json` | `/letter` drafts a first-person Article 52 request with a PDF download |
| `TC009-date-format.json` | A `MM/DD/YYYY` date is rejected with a message asking for `YYYY-MM-DD` |

Two more cases (edit a trip, trips persist after reload) were generated in the TestSprite project, for 11 tests in total. Every pull request runs all of them against its Vercel preview, and the merge is blocked until they pass.

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
