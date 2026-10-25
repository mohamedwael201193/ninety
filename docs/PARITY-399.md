# Deep parity 399/400: the one difference

Deep parity runs 412 stored scenarios through Ninety and the vendored European Commission calculator script ([`deep.test.ts`](../src/lib/schengen/deep/deep.test.ts), stored script output in [`oracle-output.json`](../src/lib/schengen/deep/oracle-output.json)). 400 are inputs the Commission form accepts; 12 are inputs it refuses or cannot represent, listed apart with both answers. **399 of the 400 match on every printed field. The one that does not is `overlap-overstay-two-trips`.**

| | |
|---|---|
| Scenario | [`overlap-overstay-two-trips`](../src/lib/schengen/deep/scenarios.ts) |
| Stays | 2024-01-01 to 2024-04-05, and 2024-03-25 to 2024-04-10 (the second starts before the first ends) |
| Checked on | 2024-04-10 |
| Field that differs | overstay count |
| Commission script | 2 overstays: 2024-03-31 to 2024-04-05 (6 days), window 2023-10-09 to 2024-04-05: 96 days, and 2024-03-31 to 2024-04-10 (11 days), window 2023-10-14 to 2024-04-10: 101 days |
| Ninety | 1 overstay: 2024-03-31 to 2024-04-10 (11 days), window 2023-10-14 to 2024-04-10: 101 days |

**Why.** The script does not reject an overlap of the first and second rows, and prints one overstay per row. Its 6 days (31 Mar to 5 Apr) are inside its 11 days (31 Mar to 10 Apr), so the traveller overstayed 11 real days, not 17 and not two separate times. Ninety merges overlapping stays before counting, and lists those 11 days once. The same days entered as one stay (2024-01-01 to 2024-04-10, scenario `overlap-overstay-entered-as-one-stay`) make the script print a single 11-day overstay, which Ninety matches. Both answers agree on the last day (10 April), the 11 days and the 101 days in the window; only the number of overstay lines differs.

The test classifies it as `commission-quirk` (the script's own two ways of entering the same days disagree), not as a Ninety bug, and fails if any other in-domain field ever disagrees. The fuzzer first found this shape (seed 20261019, run 14), when Ninety also listed two overstays; that was a real Ninety bug and it was fixed by merging overlapping stays (README, "Commission parity").

Reproduce: `npm ci && npx vitest run src/lib/schengen/deep/deep.test.ts`.
