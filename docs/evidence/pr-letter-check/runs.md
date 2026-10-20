# Letter: field-level validation and evidence table (TS17, TS18)
- Cloud tests created 20 Oct 2026: TS17 131f6bcd-36db-44bf-9cb5-14fd3769a1d1, TS18 c3525f00-6e6f-44e8-a3c2-92049a297106. Suite 15 -> 17.
- TC011 plan hardened (never re-open fresh=1 after saving), free plan update.

## Browser QA follow-up (2026-10-20)
Found in browser QA, tests written first (red, `red-vitest.txt`: 2 failing), then fixed (`green-vitest.txt`):
1. The evidence figures were a `<dl>`, not a table. Now a `<table>` with a caption, column headers (Date, Your dates, EES figure, Difference) and the date as the row header.
2. `?scenario=demo` did nothing on /letter (unknown id). `demo` is now an alias for the landing demo history (`near-limit`), on /letter and /ees alike.
