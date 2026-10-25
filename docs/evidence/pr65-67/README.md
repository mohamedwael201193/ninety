# PR #65 to #67: gates, nightly smoke, a red run and its fix

Screenshots taken on 2026-10-24 (UTC+3). Browser avatar removed; nothing else edited.

| Screenshot | What it shows |
|---|---|
| ![PR #65 checks](pr65-checks.png) | PR #65 merged with every check green: Vercel, API contract (Schemathesis), Accessibility (axe), CI, TestSprite backend. |
| ![TestSprite 43/43 on PR #65](ts-pr65-43of43.png) | The TestSprite V3 execution for PR #65: 43 passed, 0 failed, 0 blocked, 100% pass rate (execution 575bb9d6). |
| ![Branch protection](branch-protection.png) | `main` branch protection with the six required checks of that time (a seventh, `TestSprite N/N gate`, was added later: [NN-GATE.md](../../NN-GATE.md)) (TestSprite V3, TestSprite backend, Lint/types/unit/property/fuzz, MCP server, Schemathesis, axe-core). Taken before "Require a pull request before merging" was also switched on, and before the backend check was renamed for 30 tests. |
| ![Smoke red](smoke-red.png) | The first run of the fixed nightly smoke ([run 40035771094](https://github.com/mohamedwael201193/ninety/actions/runs/40035771094)): TS01 and TS07 passed, TS03 blocked as `stale_code`. |
| ![Issue #66](issue66-auto.png) | The run ledger opened [#66](https://github.com/mohamedwael201193/ninety/issues/66) from that red run on its own, with the failing test and its TestSprite run id. |
| ![TS03 green](ts03-green.png) | TS03 with its rewritten stored code, rerun alone on TestSprite: passed, all 7 plan steps (run 9f238bd5 (TestSprite execution `409ff79c`)). Write-up: [`../ts03-stale-code/`](../ts03-stale-code/README.md). |
| ![PR #67 merged](pr67-merged.png) | PR #67 ("Fixes #66") merged green; #66 closed by it. |
| ![Docs-only skip](docs-skip.png) | On docs-only PR #67 the backend gate listed the files, skipped the paid run and passed ([run 40036549585](https://github.com/mohamedwael201193/ninety/actions/runs/40036549585)). |
