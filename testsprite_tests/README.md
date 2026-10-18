# TestSprite suite

Frontend end-to-end tests for Ninety, run in the TestSprite cloud against each pull request's Vercel preview by the TestSprite GitHub App.

- `plans/` holds the plan for each test case (TC001–TC008): the steps and assertions TestSprite runs. They use the `data-testid` attributes in the app as locators.
- Project: `bd039118-0c25-4707-b018-b25619a37fce`.

Run locally with the CLI:

```bash
npm i -g @testsprite/testsprite-cli
export TESTSPRITE_API_KEY=...   # never commit
testsprite test run --all --project bd039118-0c25-4707-b018-b25619a37fce --target-url <preview-url> --wait
```
