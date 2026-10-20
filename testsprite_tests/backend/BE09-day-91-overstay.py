import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    # Commission: 91 days in 04/10/23-31/03/24, 'Overstay in the period from 31/03/24 to 31/03/24 (1 days)'.
    r = check({"trips": [{'entry': '2024-01-01', 'exit': '2024-03-31'}], "on": "2024-03-31"})
    assert r.status_code == 200, (r.status_code, r.text)
    d = r.json()
    assert d["on"] == "2024-03-31", d
    assert d["daysUsed"] == 91, ("daysUsed", d)
    assert d["daysLeft"] == 0, ("daysLeft", d)
    assert d["latestExit"] == None, ("latestExit", d)
    pass
    assert d["overstays"] == [{'from': '2024-03-31', 'to': '2024-03-31', 'days': 1}], ("overstays", d)


test()
