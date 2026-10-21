# Evidence index

Every TestSprite run link, screenshot and report gathered for Ninety is kept here and never deleted. One folder per PR or topic.

## Latest: PRs #61 and #62, both gates required

- PR [#61](https://github.com/mohamedwael201193/ninety/pull/61), merged as `392a265`: 43/43 ([execution](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/d5ce97c4-05b4-4d90-b30f-7b62d893514a)).
- PR [#62](https://github.com/mohamedwael201193/ninety/pull/62), merged as `a777c3b`: 43/43 ([execution](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/b43fc678-1b47-4f4f-9c4c-cd08eb76daac)); `TestSprite backend (28 API tests)` green on the PR ([run](https://github.com/mohamedwael201193/ninety/actions/runs/39519798095/job/118960558605)) and on `main` ([run](https://github.com/mohamedwael201193/ninety/actions/runs/39520342113/job/118962382936)). Since #62 both `TestSprite V3` and `TestSprite backend (28 API tests)` are required checks on `main`.
- The README screenshots are in [`docs/screens/`](../screens/). The hero, EES check, letter and parity shots were taken from a local production build of the PR #63 branch; the others from production.
- [`fresh-band/`](fresh-band/): the `/?fresh=1` band showing the old count, reproduced and fixed in #62.
- `receipts/final-vitest.txt`: Vitest after these changes (367 passed, 3 skipped).

## Before that: PR #60 → [`testsprite/ts42-pr60/`](testsprite/ts42-pr60/)

- PR [#60](https://github.com/mohamedwael201193/ninety/pull/60), merged as `9f781f6`. TS42 went red, 42/43 ([execution](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/1f423c16-9271-4530-bbd6-11c6ec403bef)), on a blank loading state: a UX problem, not a wrong number. After the fix the run passed 43/43 ([execution `eba1bf9c`](https://www.testsprite.com/dashboard-v3/o/1b474b7a-30a8-51f3-9b61-fd8a3c733650/projects/bd039118-0c25-4707-b018-b25619a37fce/execution/eba1bf9c-2c9c-4a6a-8711-79b4955b870a)). The folder has the slowed-CPU timeline and the red and green Vitest output.

## Before that: PR #57 and the backend suite → [`testsprite/`](testsprite/README.md)

- PR [#57](https://github.com/mohamedwael201193/ninety/pull/57), merged to `main` as `396d6d9`: TS45–TS52 red on purpose (34/43), TS02 caught a production `/parity` problem (42/43), then 43/43. It has portal and GitHub screenshots and the merge gate.
- Backend project "Ninety API": 28 tests, 27/28, BE28 caught a missing JSON-RPC error `id`, then green after `8c86d02`. It has screenshots plus red and green files in [`testsprite/backend/`](testsprite/backend/).

| Folder | What it proves |
|---|---|
| [pr-39-scenario-carry](pr-39-scenario-carry/runs.md) | TS16 written first and red (14/15), then green 15/15 after the fix |
| [pr-40-engine-tests](pr-40-engine-tests/runs.md) | Differential fuzzer and EES corrupt-row fix, 15/15 |
| [pr-41-landing](pr-41-landing/runs.md) | Landing band follows the scenario; one TC011 agent flake explained and re-run green |
| [pr-letter-check](pr-letter-check/runs.md) | TS17/TS18 added for letter validation and the evidence table |

## Portal, 2026-10-20 (PR #55, 35/35)

- [`portal-2026-10-20/testsprite-report-35of35-2026-10-20.pdf`](portal-2026-10-20/testsprite-report-35of35-2026-10-20.pdf): TestSprite portal report, 35/35 passed
- [`portal-2026-10-20/run-map-35of35.webp`](portal-2026-10-20/run-map-35of35.webp): portal run map
- `portal-2026-10-20/nav-resize-red-vitest.txt` / `nav-resize-green-vitest.txt`: phone nav edge fade re-checks on resize (red, then green)

## Receipts branch (local build, 2026-10-20)

- `receipts/derive_parity.py`: superseded (kept): the earlier 36-case set, dropped because many cases repeated one formula; replaced by the 12 hand-worked cases in `src/lib/schengen/golden.ts`
- `receipts/parity-live-vitest.txt`, `receipts/parity-50of50.png`: superseded (kept): the 50-scenario version, not shipped
- `receipts/fuzz-10000-seed777.txt`: superseded (kept): the narrower generator, before overlaps and open stays were added
- `receipts/golden-vitest.txt`, `receipts/overlap-overstay-red-vitest.txt`: the 12 hand-worked cases; the fuzz finding (seed 20261019, run 14) red before the fix
- `receipts/fuzz-widened-3000x4.txt`: widened fuzzer at 3,000 histories, several seeds, 0 disagreements after the fix
- `receipts/mcp-http-sdk-client.txt`: the official MCP client against `/api/mcp` on a production build
- `receipts/proof-red-vitest.txt` / `proof-green-vitest.txt` and `receipts/proof-35of35.png`: `/proof` now reads the whole suite
- `receipts/api-smoke.txt`, `receipts/developers.png`: the API on a production build (200, 400 with the field path, 415, CORS preflight 204, OpenAPI 3.1)
- `receipts/mcp-stdio-test.txt`: the MCP server over stdio, all three tools
- `receipts/a11y-axe.txt`: axe on 8 pages × 2 widths, no serious or critical violations
- `receipts/pr-testsprite-history.json`: TestSprite status of every commit of every merged PR up to #56, a snapshot. The current source of the red-to-green count is `src/data/loop-iterations.json` (through #60), with `testsprite_tests/red-runs.json` for why each run went red
- `receipts/final-*.txt`, `receipts/parity-14-plus-12.png`, `receipts/proof-35of35-final.png`: final local run of this branch: lint, types, Vitest, live parity, axe, browser checks of /parity, /proof, /developers, MCP stdio
