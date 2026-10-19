# Ninety

**How many Schengen days do you really have left — and does the border agree?**

Ninety counts your Schengen short-stay days from your own trips, checks that count against the EU Entry/Exit System (EES), and when the two disagree, drafts the correction request the law gives you a right to send.

**Live:** https://ninety-coral.vercel.app

---

## The 90/180 rule

A non-EU traveller may stay in the Schengen area for **at most 90 days in any rolling 180-day period**. On any date you look back 180 days (that day included) and count every day you were present. Entry day and exit day both count.

Ninety rebuilds that count from the trips you enter and tells you:

- days used and days left on any date,
- the latest legal exit for a stay in progress,
- whether a **planned trip** fits, and if not, how many days it overruns,
- exactly when and by how much a past stay went over 90.

Trips are typed as `YYYY-MM-DD` (other formats such as `MM/DD/YYYY` are rejected with a clear message), overlapping trips are flagged, and everything is stored only in your browser — no account, no server.

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

`testsprite_tests/plans/` holds the 11-test end-to-end suite that TestSprite runs in the cloud against the Vercel deployment. Every plan starts at `/?today=2026-10-19&fresh=1`, which pins the date and clears saved trips, so results do not drift with the calendar or leak between tests. Each assertion checks a number or a specific message:

- the example trips give 64 days used and 26 left (TS01),
- the parity page shows 14/14 with all 14 rows matching (TS02),
- adding 2026-09-01 → 2026-09-10 gives 10 used and 80 left (TS03),
- an exit before entry is rejected with its message and nothing is saved (TS04),
- deleting a trip and pressing Undo brings back the same dates and 64 days (TS05),
- a legal planned trip fits (TS06),
- the EES comparison reports a 26-day gap and `figure-differs` (TS07),
- the Article 52 letter states both counts and the 45-day reply (TS08),
- an `MM/DD/YYYY` date is rejected (TC009), an edited trip is recounted (TC010), and trips survive a reload (TC011).

`testsprite_tests/test-ids.json` maps each plan file to its TestSprite test id.

It catches real bugs, not just happy paths:

- **The parity table:** the parity page used to show only a bare score. It was rebuilt as a table of every scenario with both counts and the match, and the suite now fails if the score is not 14/14 or the table does not have all 14 rows.
- **The pinned story blocking the planned-trip button:** after adding trips, the pinned scroll section on the home page had measured its position before the page grew, and at 1280 px wide it sat over the "Check planned trip" button so the click never landed. TestSprite's run failed on it; the section now re-measures whenever the page height changes.
- **The undo toast** disappeared before a real user (or a test) could press Undo; it now stays until dismissed.

## CI in action

Every pull request into `main` runs the 11-test TestSprite V3 suite against that PR's Vercel preview deployment. The TestSprite check is required by branch protection, so a failing run blocks the merge.

- **PR #8 — fail, fix, green.** A refactor of the parity table made the row loop start at index 1, which silently dropped the first scenario. TestSprite went red at 9/11 and the merge was blocked. The fix (6f48b55, then 04527b4) restored the loop and added a unit test for the row count; the next run was 11/11 and the PR merged.
- **PR #7 — a passing run.** Adds a date-format test and the test index; the suite ran 11/11 on the preview before merge.

## Run it locally

Requires Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:3000
```

Open `/?today=YYYY-MM-DD` to pin "today" so results do not depend on the calendar.

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
