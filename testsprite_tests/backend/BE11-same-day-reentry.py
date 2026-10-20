import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    # Commission: 'authorised for up to: 70 day(s)', 'Possible stay until 30/03/24'.
    r = check({"trips": [{'entry': '2024-01-01', 'exit': '2024-01-10'}, {'entry': '2024-01-10', 'exit': '2024-01-20'}], "on": "2024-01-20"})
    assert r.status_code == 200, (r.status_code, r.text)
    d = r.json()
    assert d["on"] == "2024-01-20", d
    assert d["daysUsed"] == 20, ("daysUsed", d)
    assert d["daysLeft"] == 70, ("daysLeft", d)
    assert d["latestExit"] == '2024-03-30', ("latestExit", d)
    pass
    assert d["overstays"] == [], ("overstays", d)


test()
