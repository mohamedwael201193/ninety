import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    # Open stay from 2024-03-01, counted on 2024-03-10. The Commission calculator, given the same stay
    # closed on 2024-03-10: 'authorised for up to: 80 day(s)', 'Possible stay until 29/05/24'.
    for trip in ({"entry": "2024-03-01"}, {"entry": "2024-03-01", "exit": None}):
        r = check({"trips": [trip], "on": "2024-03-10"})
        assert r.status_code == 200, (trip, r.status_code, r.text)
        d = r.json()
        assert d["present"] is True and d["daysUsed"] == 10 and d["daysLeft"] == 80, d
        assert d["latestExit"] == "2024-05-29", d


test()
