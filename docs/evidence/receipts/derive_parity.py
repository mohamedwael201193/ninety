"""Hand rule used to derive the expected parity answers (kept as evidence).

For a control date `on` strictly after the last exit: if every past stay lies wholly within the
89 days before `on` (so none of its days leave the 180-day window during a new stay of up to 90
days) or wholly more than 179 days before `on` (already out), the longest stay starting on `on`
is 90 - U, where U is the number of recent days. A single stay of N > 90 days overstays by N - 90.
Cases that do not meet the rule are rejected, not guessed.
"""
from datetime import date, timedelta as td
import json
D = date.fromisoformat
cases = []

def easy(id, name, stays, on):
    o = D(on); U = 0
    for a, b in stays:
        a, b = D(a), D(b)
        assert b < o, id
        if a >= o - td(89): U += (b - a).days + 1
        elif b < o - td(179): pass
        else: raise Exception(f"{id}: stay straddles the window, hand rule does not apply")
    assert U < 90, id
    cases.append(dict(id=id, name=name, stays=stays, on=on, expect={"daysLeft": 90 - U},
                      why=f"{U} recent days, none leave the window during the next stay: 90 - {U} = {90 - U}"))

def over(id, name, entry, n):
    e = D(entry); x = e + td(n - 1)
    cases.append(dict(id=id, name=name, stays=[(entry, x.isoformat())], on=x.isoformat(), expect={"overstayDays": n - 90},
                      why=f"one {n}-day stay: days 91 to {n} are over the limit, {n - 90} days"))

easy("old-stay-fully-dropped-out","A stay more than 180 days ago no longer counts",[("2023-01-01","2023-03-01")],"2024-01-15")
easy("one-day-yesterday","One day, yesterday",[("2024-05-09","2024-05-09")],"2024-05-10")
easy("ten-days-last-week","Ten days ending last week",[("2024-05-01","2024-05-10")],"2024-05-17")
easy("thirty-days-ended-yesterday","30 days ending yesterday",[("2024-04-10","2024-05-09")],"2024-05-10")
easy("forty-five-days","45 days, back two weeks ago",[("2024-03-01","2024-04-14")],"2024-04-28")
easy("eighty-nine-days","89 days used: one day left",[("2024-01-02","2024-03-30")],"2024-03-31")
easy("sixty-days-two-stays","Two 30-day stays",[("2024-02-01","2024-03-01"),("2024-03-10","2024-04-08")],"2024-04-20")
easy("three-short-stays","Three short stays (5, 7, 9 days)",[("2024-06-01","2024-06-05"),("2024-06-20","2024-06-26"),("2024-07-10","2024-07-18")],"2024-08-01")
easy("leap-day-single","Only 29 Feb 2024",[("2024-02-29","2024-02-29")],"2024-03-05")
easy("across-leap-day","A stay across 29 Feb 2024",[("2024-02-20","2024-03-10")],"2024-03-20")
easy("across-new-year","A stay across New Year",[("2023-12-20","2024-01-05")],"2024-01-20")
easy("across-autumn-dst","A stay across the autumn clock change",[("2024-10-20","2024-11-03")],"2024-11-10")
easy("across-spring-dst-2025","A stay across the spring 2025 clock change",[("2025-03-25","2025-04-05")],"2025-04-12")
easy("old-and-recent","An old stay (dropped) and a recent one",[("2024-01-01","2024-02-15"),("2024-09-01","2024-09-20")],"2024-10-01")
easy("non-leap-feb-2025","Across February 2025 (28 days)",[("2025-02-15","2025-03-05")],"2025-03-15")
easy("year-2026-summer","Summer 2026, 40 days",[("2026-06-01","2026-07-10")],"2026-07-25")
easy("weekly-commuter","Four weekend trips",[("2024-09-06","2024-09-08"),("2024-09-13","2024-09-15"),("2024-09-20","2024-09-22"),("2024-09-27","2024-09-29")],"2024-10-02")
easy("seventy-days-one-stay","70 days in one stay",[("2024-07-01","2024-09-08")],"2024-09-15")
easy("eighty-days-two-stays","80 days in two stays",[("2024-03-01","2024-04-09"),("2024-04-15","2024-05-24")],"2024-05-27")
easy("eighty-nine-two-stays","89 days in two stays",[("2024-01-12","2024-02-29"),("2024-03-01","2024-04-09")],"2024-04-10")
easy("single-day-many","Six single-day visits",[("2024-08-01","2024-08-01"),("2024-08-05","2024-08-05"),("2024-08-09","2024-08-09"),("2024-08-13","2024-08-13"),("2024-08-17","2024-08-17"),("2024-08-21","2024-08-21")],"2024-08-30")
easy("two-old-stays-dropped","Two stays, both over 180 days ago",[("2023-03-01","2023-04-01"),("2023-05-01","2023-06-15")],"2024-02-01")
easy("end-of-month-31","Ending on the 31st",[("2024-07-02","2024-07-31")],"2024-08-01")
easy("start-on-first","Starting on the 1st of the month",[("2024-11-01","2024-11-25")],"2024-12-01")
easy("autumn-2025-55-days","Autumn 2025, 55 days",[("2025-09-01","2025-10-25")],"2025-11-02")
easy("christmas-2025","Christmas 2025, two weeks",[("2025-12-20","2026-01-02")],"2026-01-10")
easy("across-leap-day-2028","A stay across 29 Feb 2028",[("2028-02-25","2028-03-04")],"2028-03-10")
easy("long-gap-then-short","A 50-day stay 200+ days ago, then 5 days",[("2024-01-01","2024-02-19"),("2024-09-10","2024-09-14")],"2024-09-20")
easy("half-and-half","Two 45-day stays, the first dropped",[("2024-01-01","2024-02-14"),("2024-08-01","2024-09-14")],"2024-09-20")
easy("one-week-2027","One week in 2027",[("2027-04-05","2027-04-11")],"2027-04-20")
easy("eighty-eight-days","88 days used: two days left",[("2024-05-01","2024-07-27")],"2024-07-28")
easy("twenty-plus-twenty","20 + 20 days",[("2025-05-01","2025-05-20"),("2025-06-01","2025-06-20")],"2025-07-01")
over("overstay-one-day","A 91-day stay: one day over","2025-01-01",91)
over("overstay-ten-days","A 100-day stay: ten days over","2025-04-01",100)
over("overstay-across-leap","A 95-day stay across 29 Feb","2024-01-15",95)
over("overstay-120-days","A 120-day stay: 30 days over","2026-03-01",120)
json.dump(cases, open("/tmp/cases.json", "w"), indent=1)
print(len(cases))
