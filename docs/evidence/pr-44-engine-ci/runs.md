# #44 engine rewrite + TestSprite CI
## Run 1 (d701a46): TestSprite V3 0/17, all blocked
The last commit touched only CI, README and docs, so `vercel.json`'s ignoreCommand skipped the preview build ("Canceled by Ignored Build Step"). The preview URL served Vercel's "Deployment was cancelled" page, and every TestSprite test was blocked on it. Unit/lint CI was green.
Fix, test first (`red-vitest.txt` → `green-vitest.txt`): the ignoreCommand now applies only when `VERCEL_ENV` is production. Every PR preview builds, so TestSprite always has a live app. Production builds of CI/docs-only commits on main are still skipped.
