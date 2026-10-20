# Ninety

**How many Schengen days do you really have left — and does the border agree?**

Ninety counts your Schengen short-stay days from your own trips, checks that count against the EU Entry/Exit System (EES), and when the two disagree, drafts the correction request the law gives you a right to send.

**Live:** https://ninety-coral.vercel.app

**Receipts** (each one checkable in this repo; TestSprite figures from PR #56 at `43d4ad0`):

| | |
|---|---|
| **14/14** | scenarios on [`/parity`](https://ninety-coral.vercel.app/parity) match the European Commission's own calculator (the manual's worked examples and edge cases), compared down to the latest legal day, from a stored, hashed copy on every PR ([`parity.test.ts`](src/lib/schengen/parity.test.ts)) and against the live page every night ([`drift.yml`](.github/workflows/drift.yml), last nightly [green](https://github.com/mohamedwael201193/ninety/actions/runs/39366383632)) |
| **12** | hand-worked boundary cases, each a different situation, whose answers were written down first and then checked word for word against what the calculator prints ([`golden.ts`](src/lib/schengen/golden.ts)) |
| **500 / 3,000** | random travel histories through Ninety and the Commission calculator per PR / per night (overlaps, open stays, trips out of order, exit before entry, dates around 10 April 2026 and the spring clock change), 0 disagreements after the one bug it found was fixed ([`differential.fuzz.test.ts`](src/lib/schengen/differential.fuzz.test.ts), [`ci.yml`](.github/workflows/ci.yml), last nightly [green](https://github.com/mohamedwael201193/ninety/actions/runs/39359668818)) |
| **Properties** | checked against brute force on random histories: no legal answer ever has more than 90 days in a 180-day window, a planned trip "fits" exactly when every window stays at 90 or less, and the output is deterministic and independent of trip order ([`properties.test.ts`](src/lib/schengen/properties.test.ts), [`properties.legal.test.ts`](src/lib/schengen/properties.legal.test.ts)) |
| **43** | TestSprite cloud tests on every PR preview (TS45–TS52 added for bugs found in code review), `TestSprite V3` a required check ([`test-ids.json`](testsprite_tests/test-ids.json), plans in [`testsprite_tests/plans`](testsprite_tests/plans)) |
| **35/35** | passed on the latest run, PR #56 at `43d4ad0` (status "All 35 tests passed", 2026-10-20; [portal report PDF](docs/evidence/portal-2026-10-20/testsprite-report-35of35-2026-10-20.pdf), [run map](docs/evidence/portal-2026-10-20/run-map-35of35.webp)) |
| **6** | real app bugs TestSprite caught on a PR preview and that were fixed before merging ([What TestSprite caught](#what-testsprite-caught)) |
| **332** | Vitest unit, property and fuzz tests on every PR, all passing (2 more run only against the live Commission page) (`npm test`) |
| **3** | public API endpoints with an [OpenAPI 3.1 document](https://ninety-coral.vercel.app/api/openapi.json) (copy in [`docs/openapi.json`](docs/openapi.json), kept equal by a test), and the same three as MCP tools: over streamable HTTP at `/api/mcp` and as a stdio [server](packages/ninety-mcp), both tested with the official MCP client |
| **54** | pull requests merged into `main` |

---

## The 90/180 rule

A non-EU traveller may stay in the Schengen area for **at most 90 days in any rolling 180-day period**. On any date you look back 180 days (that day included) and count every day you were present. Entry day and exit day both count.

Ninety rebuilds that count from the trips you enter and tells you:

- days used and days left on any date,
- the latest legal exit for a stay in progress,
- whether a **planned trip** fits, and if not, how many days it overruns,
- exactly when and by how much a past stay went over 90.

Trips are typed as `YYYY-MM-DD` (other formats such as `MM/DD/YYYY` are rejected with a clear message), overlapping trips are flagged, and everything is stored only in your browser — no account, no server.

## Scenario links

Any named demo history opens with one link, without touching your saved trips (edits to a demo are not saved):

| Link | History | Read on |
|---|---|---|
| `/?scenario=open-stay` | In the Schengen area since 2026-10-01, no exit yet | 2026-10-19 |
| `/?scenario=near-limit` | 2026-05-01 → 06-15 and 2026-08-20 → 09-30: 88 of 90 days used | 2026-10-19 |
| `/?scenario=overstay` | 2026-06-01 → 09-15: a 107-day stay | 2026-10-19 |

`?today=YYYY-MM-DD` still overrides the date. The scenarios live in `src/lib/scenarios.ts`, with tests.

## EES reconciliation (`/ees`)

The Entry/Exit System now records every crossing and shows a days-used figure. When an exit is not recorded, that figure can be badly wrong — and it is the border's number, not yours, that decides whether you are let in.

Enter the EES figure (and, if you have them, the EES entry/exit records — plain `ENTRY EXIT` lines or `Entry …` / `Exit …` lines). Ninety:

- shows both counts side by side and the gap between them,
- names the likely cause (missing exit, missing entry, exit dates that disagree, or an EES figure that contradicts its own records),
- lists the exact days that differ, grouped into ranges.

## The Article 52 letter (`/letter`)

Article 52 of Regulation (EU) 2017/2226 lets you ask the competent authority of any Member State to rectify, complete or erase your EES data. Ninety drafts that request in your own words — first person, with your details, the two counts and the exact differing days — and cites the reply deadlines in Article 52(1)–(4). Copy it or download it as a PDF (accented names included), then review, sign and send it yourself.

## Parity with the European Commission calculator — 14/14 (`/parity`)

A day-count tool is only useful if it gives the official answer. `/parity` fetches the European Commission's own short-stay calculator script **live**, runs 14 fixed scenarios through both it and Ninety's engine, and shows each one: Ninety's count, the calculator's count, whether they match, and, for a stay, the latest legal day each one gives (`data-testid=parity-span-ours` / `parity-span-theirs`). The scenarios are the Commission manual's worked examples plus edge cases: exactly 90 days, day 91, re-entry after a full 90, same-day stays and turnarounds, and a date just after a clock change. If the script cannot be loaded, the page says "couldn't verify" rather than claiming a match.

Below it, **12 hand-worked cases**, each a different situation (a test fails if two share the same reasoning): overlapping trips, an open stay through today, refused entry until the first day leaves the window, the spring clock change, leap day on the last day of the window and the day after, exit before entry, old days leaving during a stay, consecutive exit and entry days, a stay across the EES cutoff, two stays that add up to 93, and overlapping trips that overstay. Each one's answer was written down first with how it was reached (`why` in [`golden.ts`](src/lib/schengen/golden.ts)); the test checks that Ninety gives it and that the calculator prints the exact sentences listed. Writing them down first caught one of our own mistakes: a planned "two old stays, 90 left" case actually added up to 93 days in one window, an overstay. It is kept as a case, with the wrong first answer recorded next to the right one.

What the calculator itself does, found while doing this: it needs an exit for every stay (an open stay is closed on the control date), refuses an exit before the entry or after the control date, and refuses overlapping stays, except that it never compares the first stay with the second. The fuzzer gives it sorted, merged input for that reason.

The fuzzer also found a bug in Ninety: two overlapping trips that overstay were listed as two overstays (6 and 11 days) for 11 real days (seed 20261019, run 14). It is pinned as a named case and fixed: overlapping stays are merged before overstays are counted.

## Public API and MCP server (`/developers`)

The engine is also a JSON API on the same deployment, with no key and open CORS. Nothing you send is stored.

| Endpoint | Answers |
|---|---|
| `POST /api/v1/check` | days used and left on a date, latest legal exit, next legal entry, overstays, and (with `planned`) whether a trip fits |
| `POST /api/v1/ees-reconcile` | the EES figure against your trips: the gap, the likely cause, the exact days that differ |
| `POST /api/v1/letter` | the Article 52 request, drafted from your details and the comparison |

```bash
curl -s -X POST https://ninety-coral.vercel.app/api/v1/check -H 'content-type: application/json' \
  -d '{"trips":[{"entry":"2026-05-01","exit":"2026-06-15"},{"entry":"2026-08-20","exit":"2026-09-30"}],"on":"2026-10-19"}'
# {"on":"2026-10-19","daysUsed":88,"daysLeft":2,...}
```

A Schemathesis job ([`api-contract.yml`](.github/workflows/api-contract.yml)) generates requests from the OpenAPI document on every pull request and runs them against a production build: every answer must match the schema for its status, schema-valid requests must get 200 (or the documented 422), and nothing may be a server error. It is free and needs no secrets. Its coverage phase is off because it sends `TRACE`, which Next.js itself answers with a 500 before any app code runs.

Input is checked field by field (`400` names the path, for example `trips.0.entry`), dates that cannot be counted give `422`, and bodies are capped at 64 KB. The [OpenAPI 3.1 document](https://ninety-coral.vercel.app/api/openapi.json) is generated from the same file the tests read, and a test runs its example request and checks every documented field comes back. The examples on `/developers` are produced by the real functions when the page is built.

`POST /api/mcp` serves the same three tools over MCP streamable HTTP (stateless JSON-RPC: `initialize`, `tools/list`, `tools/call`, `ping`), from the same code; its unit test runs in `npm test`, and the official MCP client was run against it locally. [`packages/ninety-mcp`](packages/ninety-mcp) is a stdio MCP server with three tools, `schengen_check`, `ees_reconcile` and `article52_letter`, which call the same functions with the same input schemas. Its test starts the built server with the official MCP client, lists the tools and calls each one; CI runs it on every pull request.

## Scenario gallery

The home page has six worked histories (open stay, 88 of 90, overstay, same-day re-entry, a stay before the EES cutoff, and a mixed one). Each card's figures are computed by the engine at build time, opens its history with `?scenario=` without touching saved trips, and names the TestSprite tests that check that same history ("guarded by TS27"). A unit test fails if a card names a plan that does not exist.

## Proof (`/proof`)

`/proof` lists the 12 rules Ninety applies (90/180, entry and exit days, the rolling window, overstays, open stays, planned trips, input rules, EES findings, the 10 April 2026 cutoff, Article 52, parity) and, for each, the engine test, the Commission parity scenario and the TestSprite tests that guard it, with each test's latest cloud result. The table comes from `src/data/rules.json` and `npm run proof:matrix` (TestSprite reads only), and a unit test fails if any test it names stops existing.

## What TestSprite caught

Counted from the `TestSprite V3` commit statuses of every merged pull request (raw list: [`docs/evidence/receipts/pr-testsprite-history.json`](docs/evidence/receipts/pr-testsprite-history.json)).

**6 real app bugs**, each red on the PR preview and fixed in the same PR. The status strings are copied from GitHub:

| PR | Red status | What was wrong |
|---|---|---|
| #8 | `9/11 passed · 2 failed` (46336bf) | The parity table's row loop started at index 1 and dropped the first scenario |
| #14 | `12/14 passed · 2 failed` | The planner ignored the days of an open stay before a planned trip |
| #39 | `14/15 passed · 1 failed` | A demo scenario was lost on the way to `/ees` and `/letter` |
| #41 | `14/15 passed · 1 failed`, then `16/17 passed · 1 failed` | Reloading a `?fresh=1` page wiped saved trips again; the evidence table's difference cell read as blank |
| #55 | `34/35 passed · 1 failed` | Closing the trip sheet with Escape left keyboard focus on the page body instead of "Add trip" |

**Went red, but the app wasn't the defect:** #18 and #22 (dependency and CI pull requests, `13/14 passed · 1 failed`, green on the re-run after merging `main`), #32 (`15/17 passed · 2 failed`, a plan step a cloud agent read differently), #36 (`13/14 passed · 1 failed`, TS26 had a wrong expected value) and #43 (`16/17 passed · 1 failed`, TS18 wording). The plan was fixed, not the app. #9 (the run could not start) and #44 (blocked by the preview) are not counted.

**Found by an independent code review, reproduced by us.** Three rounds of a read-only Cursor review of this code reported bugs; we reproduced 26 of them (4, 6 and 16; one more in round 3 had already been fixed by round 2). Each was reproduced with a failing test first ([`review-findings.test.ts`](src/lib/bughunt/review-findings.test.ts), [`review-round2.test.ts`](src/lib/bughunt/review-round2.test.ts), [`review-round3.test.ts`](src/lib/bughunt/review-round3.test.ts)) and then fixed:

| Bug | Reproduction | Fix |
|---|---|---|
| The latest legal exit and the planned-trip check ignored booked stays after the date | 2026-07-01 → 09-28 booked (90 days); on 2026-01-15 a 1-day plan on 06-01 said "fits", though the 180 days ending 09-28 would hold 91; the status line gave 2026-04-14 instead of 04-01 | Every 180-day window that a new day falls in is checked, later ones too; a brute-force test compares the allowance |
| Two trips with the same entry date: the first row won | Trips 06-01 → 06-10 and 06-01 → 06-20, EES 06-01 → 06-15, on 06-25: "likely missing entry" citing 06-10 | The comparison uses the latest exit (also for a missing exit) |
| The Article 52 letter threw when only the 10 April 2026 cutoff explained the gap | `POST /api/v1/letter` and the MCP tool raised "No correction to request…" | `422` naming 2026-04-10; the MCP tool returns `isError: true` |
| The 64 KB body limit counted characters, not bytes | 40,000 × "é" (80 KB) got through on REST and `/api/mcp` | The limit is checked on the body's bytes |
| `/proof` still listed 36 parity ids from a dropped scenario set and a test file that no longer existed | `src/data/proof.json` had not been regenerated after `rules.json` went back to the 14 scenarios; the unit test only read `rules.json` | `proof.json` rebuilt from `rules.json`; a test now fails if they differ |
| An open stay with an earlier EES exit was called a missing entry | Open trip from 2026-06-01, EES 06-01 → 06-10, on 06-20 | An open stay ends on the reference date for the exit comparison: "exit dates disagree" |
| The letter page drafted a rectification request when the figures matched | Trips 06-01 → 06-10, EES figure 10 | No letter: "the EES figure matches your trips" |
| `/api/mcp` accepted any `MCP-Protocol-Version` and answered a request with `id: null` | `1999-01-01` → 200; `id: null` → a result | `400` for an unsupported version; `-32600` for a null id (MCP 2025-06-18) |
| The OpenAPI identity fields lacked the limits the API enforces | nationality of 61 characters: 400 from the API, allowed by the document | `maxLength` 60 / 60 / 200 in the document |
| One stay entered as two rows (France, then Germany) gave a false "exit dates disagree" and a letter | Trips 06-01 → 06-10 and 06-10 → 06-20, one EES record 06-01 → 06-20 | Trips that continue on the same or the next day are one stay for the EES comparison: `match`, no letter |
| A name the PDF font cannot draw (Chinese, emoji) became invisible characters | `李明` gave `\u0000\u0000` in the PDF | The download is refused with the characters named; the letter text can still be copied |
| `packages/ninety-mcp` `npm test` failed on Node 22, which CI uses | `node --test test/` is read as a module path | `node --test test/*.test.mjs` |
| The letter page drafted a letter while the comparison had input errors; line breaks and bidi controls in identity fields could forge letter paragraphs | `fullName: "Jane\n\nYours faithfully,\n\nMallory"` | No letter on input errors; one-line text only (400 naming the field) |
| The OpenAPI document allowed dates and blank names the API refuses; the API's email rule differed from the form's | `on: "1899-12-31"`, `fullName: " "`, `jürgen@münchen.de` | Date range and non-blank text in the document; one email rule |
| The stdio MCP server answered an unknown tool as a tool result; the PDF Author held the identity paragraph; the planned-trip bar ignored an open stay; a later overstay was called "earlier" | | `-32602`; Author is the signer; the bar counts what the verdict assumes; "later" |
| Protocol details on `/api/mcp` and the REST routes | a batch under MCP 2025-06-18, `initialize` in a batch, `params: "nope"`, `Content-Type: Application/JSON`, `GET` without `Allow` | Refused or answered per the MCP and JSON-RPC specs and RFC 9110 |
