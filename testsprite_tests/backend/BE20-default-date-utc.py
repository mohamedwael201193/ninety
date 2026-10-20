import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    import datetime
    before = datetime.datetime.now(datetime.timezone.utc).date().isoformat()
    r = check({"trips": []})
    after = datetime.datetime.now(datetime.timezone.utc).date().isoformat()
    assert r.status_code == 200, (r.status_code, r.text)
    assert r.json()["on"] in (before, after), (r.json()["on"], before, after)
    # Dates are calendar days: an ISO timestamp or an offset is not a date.
    for bad in ["2024-03-10T23:30:00+02:00", "2024-03-10Z", "2024-3-10", "10/03/2024"]:
        r = check({"trips": [], "on": bad})
        assert r.status_code == 400, (bad, r.status_code)


test()
