# /proof + scenario gallery + wide-table scroll focus
- /proof: the rule-to-test matrix (12 rules, each with its engine test, Commission scenario and TestSprite result), generated JSON with a timestamp. Cloud test TS36.
- The gallery: six worked histories with engine-computed figures and 'guarded by TS-xx' badges. Cloud test TS37. Suite 27 → 29.
- Wide tables on /parity and /proof scroll in a named, keyboard-focusable region on phones.

## Folded in: the planned-trip verdict was hidden under the phone's bottom bar (#49 recheck note)
Headless Chrome on production, 390×844, with the Check button just above the fixed "days left / Add trip" bar: the error "The planned exit is before the planned entry." rendered at 808–857 px, under the bar at 780 px (`before-390.png`). Test first (`red-vitest.txt`), then fixed (`green-vitest.txt`): after each check the verdict scrolls into view with a 6 rem bottom scroll margin on phones (instant with reduced motion).
`qa/49-a11y-letter.webp`: momo's #49 recheck screenshot.

## Recheck note: "Out and back in on 10 May 2026" read 12 used / 90 left
Intentional, but unexplained. "Left" is how long a stay starting on the reading date can last. The 12 May days drop out of the 180-day window by 2026-11-08, long before such a stay would reach day 79, so it can last the full 90. Test first (`gallery-red-vitest.txt`), then `gallery-green-vitest.txt`: a card whose used + left exceeds 90 (and isn't an overstay) now explains it on the card. Only the same-day card qualifies.
After the planned-bar fix (`after-390.png`): the error sits at 679–728 px, above the bar at 780 px. /proof at 390 px (`proof-390.png`): the page doesn't scroll sideways (390 px wide). The matrix is a focusable `role=region` labelled "Rule-to-test matrix", 350 px wide over 860 px of table, and it scrolls sideways.
