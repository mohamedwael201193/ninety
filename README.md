# Ninety

**How many Schengen days do you really have left — and does the border agree?**

Ninety counts your Schengen short-stay days from your own trips, checks that count against the EU Entry/Exit System (EES), and when the two disagree, drafts the correction request the law gives you a right to send.

**Live:** https://ninety-coral.vercel.app

**Receipts** (as of `main` at `1f24bc3`, each one checkable in this repo):

| | |
|---|---|
| **14/14** | scenarios match the European Commission's own calculator, run from a stored, hashed copy on every PR ([`parity.test.ts`](src/lib/schengen/parity.test.ts)) and live every night ([`drift.yml`](.github/workflows/drift.yml)) |
| **500 / 3,000** | random travel histories through Ninety and the Commission calculator per PR / per night, 0 disagreements ([`differential.fuzz.test.ts`](src/lib/schengen/differential.fuzz.test.ts), [`ci.yml`](.github/workflows/ci.yml)) |
| **15** | TestSprite cloud tests on every PR preview, `TestSprite V3` a required check ([`test-ids.json`](testsprite_tests/test-ids.json)) |
| **96** | Vitest unit, property and fuzz tests on every PR (`npm test`) |
| **35** | pull requests merged into `main` |
| **2** | real bugs caught red by TestSprite and fixed to green in the PR (#8, #14; see below) |

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

A day-count tool is only useful if it gives the official answer. `/parity` fetches the European Commission's own short-stay calculator script **live**, runs 14 fixed scenarios through both it and Ninety's engine, and shows the result for each one: Ninety's count, the Commission calculator's count, and whether they match. The scenarios cover the Commission manual's worked examples plus edge cases — exactly 90 days, day 91, re-entry after a full 90, same-day stays and turnarounds, and a date just after a clock change.

Current result: **14/14 match**. If the Commission script cannot be loaded, the page says "couldn't verify" rather than claiming a match.

## Tested with TestSprite

`testsprite_tests/plans/` holds the **14-test** end-to-end suite that TestSprite runs in its cloud browser against the Vercel preview of every pull request. Every plan starts from a pinned date (`?today=2026-10-19`) and either `fresh=1` (no saved trips) or a named `?scenario=`, so results do not drift with the calendar or leak between tests. Each assertion checks a number or a specific message:

| Id | Proves |
|---|---|
| TS01 | The example trips give 64 days used and 26 left |
| TS02 | `/parity` reads 14/14 with all 14 rows matching |
| TS03 | 2026-09-01 → 2026-09-10 gives 10 used and 80 left |
| TS04 | An exit before entry is rejected with its message and nothing is saved |
| TS05 | Delete then Undo brings back the same dates and 64 days |
| TS06 | A legal planned trip fits |
| TS07 | `/ees` reports a 26-day gap and `figure-differs` |
| TS08 | The Article 52 letter states both counts and the 45-day reply |
| TS09 | During an open stay, a plan past day 90 does not fit |
| TS10 | During an open stay, exit on day 90 fits and day 91 does not |
| TC009 | An `MM/DD/YYYY` date is rejected with a YYYY-MM-DD message |
| TC010 | Editing a trip recounts it (3 → 10 days) |
| TC011 | Trips and the count survive a reload |
| TS26 | A same-day exit and re-entry counts the day once |

`testsprite_tests/test-ids.json` maps each plan to its TestSprite test id. Plans for further tests (TS13–TS15) are in the folder and are added to the cloud suite in later pull requests.

Below the TestSprite suite, every pull request also runs lint, types, and the unit, property and fuzz tests in GitHub Actions (`.github/workflows/ci.yml`).

**From the official TestSprite action, outside pull requests.** `.github/workflows/testsprite-cli.yml` runs the whole cloud suite through [`TestSprite/testsprite-action`](https://github.com/TestSprite/testsprite-action) (pinned to a commit, CLI pinned too) against production: nightly, by hand (Actions → "TestSprite CLI"), and after a merge once Vercel reports the production deployment ready (when the repository variable `TESTSPRITE_ON_MAIN` is `true`). Before it spends a credit it runs `testsprite doctor`. Each run publishes the JUnit report as a per-test check, downloads the TestSprite failure bundle of every failed test as an artifact, and writes a pass/fail table with the credit balance before and after to the job summary. It never runs on push or pull request, because each run bills every test; `src/lib/ci/workflows.test.ts` fails if that changes. It needs the `TESTSPRITE_API_KEY` repository secret.

**Red runs become issues.** `.github/workflows/run-ledger.yml` watches the TestSprite and Commission workflows. Every finished run adds a line (verdict, commit, passed/total, link) to the pinned **Run log** issue. A red run opens an issue labelled `testsprite-red` with the run link and each failing test, or comments on the one already open; a green run after it comments "green again". The pull request that fixes the failure closes the issue with `Fixes #N`, so the red run, the issue and the fix point at each other. The logic is in `scripts/ci/ledger.mjs` and unit-tested in `src/lib/ci/ledger.test.ts`.

Bugs the suite caught that unit tests did not:

- **The pinned story blocking the planned-trip button:** at 1280 px the pinned scroll section measured its position before the page grew and sat over "Check planned trip", so the click never landed. It now re-measures when the page height changes.
- **The undo toast** disappeared before a user (or a test) could press Undo; it now stays until dismissed.
- **The nav dropped the scenario:** "Check" linked to `/#check` without `?scenario=`, so an opened demo lost its history (TS10 went red; fixed in #20).

## The gate, and its history

Every pull request into `main` runs the TestSprite V3 suite against that PR's preview deployment, and `TestSprite V3` is a **required** status check: a failing run shows "Merging is blocked". The record of how we got there, including what did not work:

- **PR #8: red, fix, green, but merged on a stale status.** A refactor of the parity table made the row loop start at index 1, which silently dropped the first scenario. TestSprite went red at 9/11. The fix (6f48b55, then 04527b4) restored the loop and added a unit test for the row count, and the next run was 11/11. The commit status GitHub showed at merge time still read 9/11; the green run was recorded as a comment. At that point the check was not yet required.
- **PR #14: test first, then the fix.** The planner ignored the days of an open stay before a planned trip. We added TS09/TS10 first, and they failed on the preview (12/14, 2 failing). The fix (f466c06, then cba2989 for a stale verdict in the form) turned them green. The merge commit `7a70dde` shows a TestSprite status of `success` with the description `12/14 passed · 2 failed`: the app reported "success" for a run that had failures. We are writing this up for TestSprite as feedback.
- **Since then** `TestSprite V3` is a required check in branch protection, and a red run blocks the merge (screenshot of PR #14 in the blocked state). Branch names stay short, because a preview hostname over 63 characters does not resolve and the check never starts.

## Run it locally

Requires Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:3000
```

Open `/?today=YYYY-MM-DD` to pin "today" so results do not depend on the calendar. Add `fresh=1` to start with no saved trips.

```bash
npm test           # unit tests (engine, parity against the live Commission script, EES, letter)
npx tsc --noEmit   # type check
npm run lint       # eslint
npm run build      # production build
```

Run the TestSprite suite with the CLI:

```bash
npm i -g @testsprite/testsprite-cli
export TESTSPRITE_API_KEY=...   # never commit it
testsprite test run --all --project <project-id> --wait
```

## Stack

Next.js 15 (App Router), React 19, Tailwind CSS v4, framer-motion, GSAP ScrollTrigger and Lenis for motion, react-hook-form + zod for forms, pdf-lib for the letter, Vitest for tests. Deployed on Vercel.

## Disclaimer

Ninety is a helping tool. It is not legal advice, it is not affiliated with the European Union, and its result is not a decision by a border authority.

---

Built by **devmo**.
