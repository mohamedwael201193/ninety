# #41 browser QA follow-up (2026-10-20)
Found in browser QA (`qa/41-desktop.png`): the "Every day of the last 180" band stayed on the example history (56 used / 34 left, read on 2026-10-19) even with trips saved.
Tests first (`red-vitest.txt`, 2 failing), then the fix (`green-vitest.txt`): with no ?scenario=, the band reads the trips saved in this browser on today's date (or ?today=), labelled "Your saved trips, read on …", and re-reads on every save (same tab) and on `storage` events (other tabs). With nothing saved it still shows the labelled example.

## TC011 failed twice on this PR (16/17, run 33ed3b0a)
The test agent re-opened `?today=2026-10-19&fresh=1` after saving, which wiped the trip by design. Rather than re-run a second time, the root cause is fixed: `?fresh=1` is now consumed (trips cleared once, flag removed from the address with replaceState), so a reload of the same tab keeps the trips. Unit test first (`red-fresh.txt`), then green (`green-fresh.txt`). A real user reloading a shared `fresh=1` link no longer loses their trips either.
