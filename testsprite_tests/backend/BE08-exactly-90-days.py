import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    # Commission: 'At 30/03/24 a stay may be authorized for 0 days', no overstay.
    r = check({"trips": [{'entry': '2024-01-01', 'exit': '2024-03-30'}], "on": "2024-03-30"})
    assert r.status_code == 200, (r.status_code, r.text)
    d = r.json()
    assert d["on"] == "2024-03-30", d
    assert d["daysUsed"] == 90, ("daysUsed", d)
    assert d["daysLeft"] == 0, ("daysLeft", d)
    assert d["latestExit"] == '2024-03-30', ("latestExit", d)
    pass
    assert d["overstays"] == [], ("overstays", d)


test()
