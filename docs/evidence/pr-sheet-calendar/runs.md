# Trip sheet focus and inert background; impossible calendar dates
- The sheet moves focus to its first field when it opens, the page behind it is inert while it is open, and focus returns to the opener on close. Unit test + cloud test TS41.
- An impossible date (2024-02-30, 2023-02-29, month 13) is now named as a date that doesn't exist, not "enter a date". Leap-day, year-end and 2100 edge tests. Cloud tests TS21, TS42. Suite 32 → 35.
- /proof matrix regenerated. Generator fix: a cloud test that has never run reports "ready", and that was being counted as a run that didn't pass. It now counts as not run. Until this PR's run lands, the page names TS21 and TS42 as "not run yet". It will read all passing once regenerated after this PR is green.
- `qa/54-proof-25of25.webp`: momo's #54 recheck.
