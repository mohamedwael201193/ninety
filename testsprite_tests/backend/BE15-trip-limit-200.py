import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    import datetime
    def trips(n):
        s = datetime.date(2020, 1, 1)
        return [{"entry": (s + datetime.timedelta(days=2 * i)).isoformat(), "exit": (s + datetime.timedelta(days=2 * i)).isoformat()} for i in range(n)]
    ok = check({"trips": trips(200), "on": "2022-01-01"})
    assert ok.status_code == 200, (ok.status_code, ok.text[:300])
    over = check({"trips": trips(201), "on": "2022-01-01"})
    assert over.status_code == 400, (over.status_code, over.text[:300])


test()
