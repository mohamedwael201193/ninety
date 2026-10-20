# #32 smooth scroll on the landing only
- Browser QA passed (`qa/32-*.png`). Brought up to date by merging main (conflict in LetterPanel resolved: main's evidence table kept, data-lenis-prevent kept on the letter box). Net diff equals the reviewed r-smooth branch: 3 files.

## Re-trigger (approved by momo)
Run 9dd3a70 was 15/17: the TC011 agent re-opened ?fresh=1 instead of reloading, and TS18 read the Difference cell as blank (DOM had 2; red in 3 of 5 runs). Both plans rewritten (free, same ids): TC011 uses a real browser refresh; TS18 checks the four cells by data-testid DOM text plus the letter sentence. One re-trigger push.
