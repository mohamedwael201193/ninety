# Band counters read 0 / 0 before scrolling
Watchdog on production, `/?scenario=demo` at ~500 px: the 180-day band said "Days used 0 / Days left 0" while its label and the calculator said 88 of 90.
Reproduced in headless Chrome on ninety-coral (500×900): `0, 0` at load, `88, 2` only after the band scrolls into view (`before-prod.png`). `CountUp` started at 0 and waited for the in-view trigger.
Test first (`red-vitest.txt`, 2 failing), then fixed (`green-vitest.txt`): `CountUp` renders the real figure from the first paint, plays the count-up once when it scrolls into view, and shows a later value (scenario or saved trips read after mount) at once.

## Browser recheck 1 failed (UX): the count-up replayed from 0
On scroll-in the counters went 88/2 → 0/0 → 88/2 (and 56/34 → 0 on the plain page). Test first (`red2-vitest.txt`: with the band on screen, the counter read 11, 20, 27, 34, 41… instead of only 88), then fixed (`green2-vitest.txt`): the count-up is removed; the band shows the real figures and never animates them, so reduced-motion users and everyone else see the same stable numbers.
