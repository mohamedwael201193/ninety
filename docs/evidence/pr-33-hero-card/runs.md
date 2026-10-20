# #33 hero card
- Hero phone: the "EES count disagrees" card docks to the bottom and is in the first paint; the loop only runs while the phone is on screen.
- Browser QA passed at 375 px and desktop (`qa/33-*.png`).

## Folded in from the site watchdog (tests first: `pr33-fix-red.txt` 2 failing, then `pr33-fix-green.txt`)
1. `/letter?scenario=demo` now prefills Member State (France) and EES days used (90), so one Draft click after your own details shows the evidence table. Named scenarios prefill nothing.
2. The hero illustration (56 used / 34 left) and the calculator's "Try an example" (64 / 26) are different histories. The illustration note now says so and gives its figures.
3. The phone's ring showed "0 of 90" while "Safe · 34" was still fading out. It now shows a dash until the count runs, and the badge hides at once.
