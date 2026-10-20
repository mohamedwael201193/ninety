import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    # 60 single-day trips every 3rd day from 2024-01-01 to 2024-06-26 (day 178). All 60 lie in the
    # 180 days ending 2024-06-26, so 60 days are used (inclusive count, Art. 6(1) SBC).
    import datetime
    start = datetime.date(2024, 1, 1)
    trips = []
    for i in range(60):
        d = (start + datetime.timedelta(days=3 * i)).isoformat()
        trips.append({"entry": d, "exit": d})
    on = trips[-1]["exit"]
    assert on == "2024-06-26"
    r = check({"trips": trips, "on": on})
    assert r.status_code == 200, (r.status_code, r.text)
    d = r.json()
    # Expected values from a day-by-day count of Art. 6(1) SBC (every 180-day window holds at most
    # 90 days): staying on from 2024-06-26, the last legal day is 2024-08-10, 46 days of stay counting
    # today, so 45 more days after today. The Commission script gives 45 / 10-08-2024 for the last 50
    # of these trips but 59 / 23-08-2024 for all 60, so it is not used as the oracle here.
    assert d["daysUsed"] == 60, d
    assert d["latestExit"] == "2024-08-10", d
    assert d["overstays"] == [], d


test()
