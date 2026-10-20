# Metadata, sitemap/robots, footer links (+ two fixes)
## /proof read "12 rules · 13/26 TestSprite references passing"
Cause: `src/data/proof.json` was generated on 2026-10-19 15:55 UTC, before 13 of the referenced tests (TS13–15, TS17–18, TS27–31, TS34–35, TS38) existed in the cloud. Their `latest` was null, and the page counted null as "not passing". Nothing had failed.
Fix, test first (`red-vitest.txt` → `green-vitest.txt`): the summary counts distinct tests, only the ones with a latest run, and lists any "not run yet" by name. The generator records which cloud runs the figures come from. Regenerated on 2026-10-20 08:42 UTC: 26 references, 25 distinct tests, all passed on their latest run (environment github-pr-53, the 32/32 green run). The page now reads "12 rules · 25/25 TestSprite tests passed on their latest cloud run (github-pr-53)".
## Nav Check/Plan dropped ?scenario=
From /ees?scenario=near-limit, Check went to /#check and showed your own trips instead of the demo. SectionLink now carries ?scenario= and ?today= like CarryLink (test first, same files).
`qa/53-nav-proof.webp`: momo's #53 recheck.
