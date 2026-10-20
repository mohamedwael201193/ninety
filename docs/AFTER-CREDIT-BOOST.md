# After the TestSprite credit boost

Steps that spend credits or switch on paid runs, kept here so they happen once, in order.

1. **One push** of the branch. The suite stays at 35 tests (TS02 unchanged), so the PR run bills 35 × 0.5 = 17.5 credits.
2. **Later, with credits to spare:** the two plans for the API page and the OpenAPI document are parked in `docs/testsprite-parked/` (TS43, TS44). Registering them is a generation (it costs credits) and adds 1 credit to every later run, so they wait:
   `npm run tests:add -- docs/testsprite-parked/TS43-developers-api.json docs/testsprite-parked/TS44-openapi-document.json`
3. After the merge, `npm run proof:matrix` regenerates `/proof` from the new runs (reads only, no credits).
4. **Turn on the runs outside pull requests** once the production URL is confirmed and the balance covers them (each run bills the whole suite):
   - post-merge on production: repository variable `TESTSPRITE_ON_MAIN=true`
   - nightly: repository variable `TESTSPRITE_NIGHTLY=true`

   Both are read by `.github/workflows/testsprite-cli.yml` and are off by default; `src/lib/ci/workflows.test.ts` fails if a run is wired to push or pull request.
