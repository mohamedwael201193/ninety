# Ninety

How many Schengen days do you really have left?

Ninety rebuilds the short-stay count — **90 days in any 180-day period** — from the trips you enter. The entry day and the exit day both count. It tells you how many days are already used, how many are left on a given date, the latest legal exit for a planned trip, and whether a stay has gone over 90.

It is aimed at travellers who are not EU residents and who need the same figure a border check uses, including when an official record looks wrong. Comparing that count with the EU Entry/Exit System, and drafting an Article 52 correction request under Regulation (EU) 2017/2226, is not in this version.

This is a helping tool only. It does not grant a right to stay. The same limit is stated by the European Commission for its own calculator.

## Live app

https://ninety-coral.vercel.app

Pull requests deploy a Vercel preview. Open `/?today=YYYY-MM-DD` to pin “today” so a check does not depend on the calendar. Trip dates are typed as `YYYY-MM-DD`.

## How to run

```bash
npm install
npm test
npm run dev
```

`npm run build` produces the production build Vercel deploys. Trips stay in `localStorage` in the browser (`ninety.trips.v1`). There is no database and no account.

## The 90/180 rules

The engine follows the European Commission’s short-stay calculator and its user manual:

- Calculator (public JavaScript): https://ec.europa.eu/assets/home/visa-calculator/calculator.htm
- User manual: https://ec.europa.eu/assets/home/visa-calculator/docs/short_stay_schengen_calculator_user_manual_en.pdf

Confirmed from that script (`daysBetween`, `leggInndager`, `Beregn2`, `BeregnControl`, `BeregnVisa`) and from the manual’s worked examples:

- The date of entry is the first day of stay and the date of exit is the last day. Both count.
- A calendar day covered twice (including leaving and re-entering on the same day) counts once.
- For every day of stay, look back over the 180 calendar days ending that day, inclusive. The total presence in that window must not exceed 90.
- Days are calendar dates. The engine does not convert a trip through a local timezone, so a daylight-saving change cannot add or drop a day.

`/parity` loads the Commission page, runs the published script on a fixed set of scenarios, and compares it with Ninety. The page shows `N/N match` when every scenario agrees, and lists mismatches when they do not. If the reference cannot be loaded or executed, the page says **couldn't verify** and does not claim a match.

The calculator, and Ninety, do not apply a visa sticker that authorises fewer than 90 days, and they do not apply bilateral visa-waiver extensions under Article 20(2) of the Convention implementing the Schengen Agreement. Stays in Cyprus, Ireland, and the United Kingdom are outside the Schengen area and should not be entered. Stays in Iceland, Liechtenstein, Norway, and Switzerland do count.

## Test suite

### Unit tests

`npm test` covers the date arithmetic and the 90/180 engine (both endpoint days, the rolling 180-day window, days used, days left, the latest legal exit, overstay, an open trip closed on the reference day, and a planned trip), trip storage parsing, and a live parity run against the Commission script on the fixed scenarios. The parity test fails if the reference cannot be loaded rather than reporting a match.

### TestSprite

Placeholder. The TestSprite 3.0 suite is not generated yet. This section will say what that suite covers once it is created against the live app and attached to this repository’s pull requests.
