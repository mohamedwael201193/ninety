import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    # Commission calculator: 'Possible stay until 30/04/24', 'authorised for up to: 61 day(s)'. 29 days by inclusive count.
    r = check({"trips": [{'entry': '2024-02-01', 'exit': '2024-02-29'}], "on": "2024-02-29"})
    assert r.status_code == 200, (r.status_code, r.text)
    d = r.json()
    assert d["on"] == "2024-02-29", d
    assert d["daysUsed"] == 29, ("daysUsed", d)
    assert d["daysLeft"] == 61, ("daysLeft", d)
    assert d["latestExit"] == '2024-04-30', ("latestExit", d)
    pass
    assert d["overstays"] == [], ("overstays", d)


test()
