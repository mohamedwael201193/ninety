import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    r = check({"trips": [{"entry": "2024-01-10", "exit": "2024-01-01"}], "on": "2024-02-01"})
    assert r.status_code == 422, (r.status_code, r.text)
    assert r.json().get("error"), r.text


test()
