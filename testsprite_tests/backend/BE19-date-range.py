import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    # 2099-12-15 to 2100-03-01: 17 + 31 + 28 (2100 is not a leap year) + 1 = 77 days.
    r = check({"trips": [{"entry": "2099-12-15", "exit": "2100-03-01"}], "on": "2100-03-01"})
    assert r.status_code == 200, (r.status_code, r.text)
    assert r.json()["daysUsed"] == 77, r.json()
    bad = check({"trips": [{"entry": "2100-02-29", "exit": "2100-02-29"}], "on": "2100-03-01"})
    assert bad.status_code == 400, (bad.status_code, bad.text)
    # 1900 is not a leap year either: 20 Feb to 1 Mar 1900 is 9 + 1 = 10 days.
    r = check({"trips": [{"entry": "1900-02-20", "exit": "1900-03-01"}], "on": "1900-03-01"})
    assert r.status_code == 200 and r.json()["daysUsed"] == 10, (r.status_code, r.text)
    for on in ["1899-12-31", "2200-01-01", "0999-01-01", "99999-01-01"]:
        r = check({"trips": [], "on": on})
        assert r.status_code == 400, (on, r.status_code, r.text[:200])


test()
