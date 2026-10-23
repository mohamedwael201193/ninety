# TS03 red, then green: stale stored test code (issue #66)

**Red.** The first run of the fixed nightly smoke ([`testsprite-smoke.yml`](../../../.github/workflows/testsprite-smoke.yml), [run 40035771094](https://github.com/mohamedwael201193/ninety/actions/runs/40035771094), on `69163e6`, 2026-10-24 01:47 UTC+3) ran TS01, TS03 and TS07 against production. TS01 and TS07 passed. TS03 was **blocked** by TestSprite before it ran (TestSprite run `57979ea2-faa7-4c6d-81e9-58baf3695272`):

> blocked: stale_code: the stored script was written for an earlier version of this test, so replaying it would run the previous definition. Update the stored test code to match the current test, e.g. testsprite test code put <test-id> --code-file <path>.

The run ledger opened [#66](https://github.com/mohamedwael201193/ninety/issues/66) on its own.

**Cause.** `testsprite test code get b6981077-…` showed the stored script predated the current plan ([`TS03-add-trip.json`](../../../testsprite_tests/plans/TS03-add-trip.json), 7 steps): it opened the bare URL without `?today=2026-10-19&fresh=1`, and checked only that a trip edit button was visible. It never checked the plan's three assertions (one row showing 10 days, Days used 10, Days left 80). A test, not an app defect.

**Fix.** [`TS03-add-trip.py`](TS03-add-trip.py) implements all 7 plan steps. Before uploading it was run locally with Playwright against production (passed), and with the expected 80 changed to 81 (failed), so its assertions can fail. Then, as the error says:

```
testsprite test code put b6981077-60ba-4847-b769-719dd19ebc2c --code-file TS03-add-trip.py --force   # codeVersion v-2d29afcc94de
testsprite test run b6981077-60ba-4847-b769-719dd19ebc2c --target-url https://ninety-coral.vercel.app --wait
```

**Green.** TestSprite run `9f238bd5-c205-4bab-9f5f-ef433ef73ac1`: **passed** ([execution](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/409ff79c-0737-4dac-97b4-0db733b6c9a0/test/9f238bd5-c205-4bab-9f5f-ef433ef73ac1)). Cost: 0.5 credits.
