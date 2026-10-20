# Band counters read 0 / 0 before scrolling
Watchdog on production, `/?scenario=demo` at ~500 px: the 180-day band said "Days used 0 / Days left 0" while its label and the calculator said 88 of 90.
Reproduced in headless Chrome on ninety-coral (500×900): `0, 0` at load, `88, 2` only after the band scrolls into view (`before-prod.png`). `CountUp` started at 0 and waited for the in-view trigger.
Test first (`red-vitest.txt`, 2 failing), then fixed (`green-vitest.txt`): `CountUp` renders the real figure from the first paint, plays the count-up once when it scrolls into view, and shows a later value (scenario or saved trips read after mount) at once.
