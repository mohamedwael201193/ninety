# #41 browser QA follow-up (2026-10-20)
Found in browser QA (`qa/41-desktop.png`): the "Every day of the last 180" band stayed on the example history (56 used / 34 left, read on 2026-10-19) even with trips saved.
Tests first (`red-vitest.txt`, 2 failing), then the fix (`green-vitest.txt`): with no ?scenario=, the band reads the trips saved in this browser on today's date (or ?today=), labelled "Your saved trips, read on …", and re-reads on every save (same tab) and on `storage` events (other tabs). With nothing saved it still shows the labelled example.
