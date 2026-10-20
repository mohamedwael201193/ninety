# /proof + scenario gallery + wide-table scroll focus
- /proof: the rule-to-test matrix (12 rules, each with its engine test, Commission scenario and TestSprite result), generated JSON with a timestamp. Cloud test TS36.
- The gallery: six worked histories with engine-computed figures and 'guarded by TS-xx' badges. Cloud test TS37. Suite 27 → 29.
- Wide tables on /parity and /proof scroll in a named, keyboard-focusable region on phones.

## Folded in: the planned-trip verdict was hidden under the phone's bottom bar (#49 recheck note)
Headless Chrome on production, 390×844, with the Check button just above the fixed "days left / Add trip" bar: the error "The planned exit is before the planned entry." rendered at 808–857 px, under the bar at 780 px (`before-390.png`). Test first (`red-vitest.txt`), then fixed (`green-vitest.txt`): after each check the verdict scrolls into view with a 6 rem bottom scroll margin on phones (instant with reduced motion).
`qa/49-a11y-letter.webp`: momo's #49 recheck screenshot.
