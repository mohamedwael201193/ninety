# TestSprite N/N gate (required check 7)

`TestSprite N/N gate` is a required check on `main`. It passes only when **both** TestSprite suites passed **every** test on the **same PR head SHA**, with N > 0, and it fails closed on anything it cannot read.

| Suite | Where the gate reads the count | Pass only if |
|---|---|---|
| Frontend, `TestSprite V3` (GitHub App) | The newest `TestSprite V3` commit status on the PR head SHA, posted by `testsprite[bot]`. Its description is the only place the count is given: `All 54 tests passed` or `42/43 passed · 1 failed` | description reads N/N, N > 0, and the state is `success` |
| Backend, 30 API + MCP tests (CLI) | `backend-results.json` from the same workflow run, which now records the SHA it tested | the file names that SHA, has exactly as many rows as [`backend-ids.json`](../testsprite_tests/backend-ids.json) and all of them `passed` |

Fails closed on: no status yet after 45 minutes, a status not from `testsprite[bot]`, a description it cannot parse (for example `TestSprite could not start this run`), N = 0, passed < N, a `success` state whose numbers are not N/N, a missing, short or other-commit results file. The one backend non-run it accepts is the explicit docs-only skip that [`testsprite-backend.yml`](../.github/workflows/testsprite-backend.yml) already makes (only Markdown or `docs/` changed, so no code reaches the API); the frontend half still has to be N/N.

Code: [`scripts/ci/nn-gate.mjs`](../scripts/ci/nn-gate.mjs), job `gate` in [`testsprite-backend.yml`](../.github/workflows/testsprite-backend.yml). Tests: [`nn-gate.test.ts`](../src/lib/ci/nn-gate.test.ts).

## What we found first: how `TestSprite V3` reports on this repo

- It is a **commit status**, not a check run. `GET /repos/mohamedwael201193/ninety/commits/<sha>/check-runs` lists no TestSprite entry on any PR; the count is only in the status `description` ([PR #57 red commit dae0081, public JSON](https://api.github.com/repos/mohamedwael201193/ninety/commits/dae00815749666ebcdce147abd640bb47e260eac/statuses)).
- On our PRs it **never concluded success with failures**. All 97 final statuses on 96 commits of 59 PRs ([raw list](evidence/nn-gate/testsprite-v3-final-statuses.txt)): 68 `success`, every one `All N tests passed`; 27 `failure` with `x/N passed · …`; 2 `failure` with `TestSprite could not start this run` (#9). Examples: [#57 `34/43 passed · 8 failed · 1 blocked`](https://api.github.com/repos/mohamedwael201193/ninety/commits/78ee487ff8e33740cbec59465e7ca97237787757/statuses), [#57 `42/43 passed · 1 failed`](https://api.github.com/repos/mohamedwael201193/ninety/commits/dae00815749666ebcdce147abd640bb47e260eac/statuses), [#57 `All 43 tests passed`](https://api.github.com/repos/mohamedwael201193/ninety/commits/1963cc1923403756491778893cea9e960dd2c32b/statuses). Blocked tests are counted as not passed (`34/43` with 8 failed and 1 blocked).
- So the colour has been honest here. What the gate adds: the merge rule no longer depends on the colour alone or on two separate checks; it reads the numbers, needs both suites N/N on one SHA, ignores a status anyone else posts under the same name, and turns "no result" into a red check instead of a wait.

## Proven offline on recorded payloads

[`nn-gate.test.ts`](../src/lib/ci/nn-gate.test.ts) runs the gate on unedited API payloads from our own PRs, saved in [`src/lib/ci/fixtures`](../src/lib/ci/fixtures): #57 `dae0081` (42/43, fails), #57 `78ee487` (34/43 with a blocked test, fails), #57 `1963cc1` (43/43, passes), the backend artifact of #68 `db7776c` (0/30, every trigger rate limited, fails) and of #69 `1e49cea` (30/30, passes). Cases with no real example here (a success state with a partial count, a status from another account, an unreadable description, N = 0, a short or other-commit results file) are built from those payloads in the test and all fail. Nothing was planted in the app.
