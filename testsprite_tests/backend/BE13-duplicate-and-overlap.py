import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    # 1-10 Jan twice, plus 5-15 Jan overlapping: the days are 1-15 Jan, 15 days (Art. 6 SBC counts days of stay).
    trips = [{"entry": "2024-01-01", "exit": "2024-01-10"}, {"entry": "2024-01-01", "exit": "2024-01-10"},
             {"entry": "2024-01-05", "exit": "2024-01-15"}]
    r = check({"trips": trips, "on": "2024-01-15"})
    assert r.status_code == 200, (r.status_code, r.text)
    d = r.json()
    assert d["daysUsed"] == 15 and d["daysLeft"] == 75 and d["overstays"] == [], d


test()
