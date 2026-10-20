import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    for raw in ['{"trips": [', "", "null", "[]", '{"trips": "x"}', "\ufeff{}", '{"trips": [], "trips": 1}']:
        r = requests.post(f"{BASE_URL}/api/v1/check", data=raw.encode(), headers={"Content-Type": "application/json"}, timeout=30)
        assert r.status_code == 400, (raw, r.status_code, r.text[:200])
        assert r.headers.get("content-type", "").startswith("application/json"), (raw, r.headers.get("content-type"))
        assert r.json().get("error"), (raw, r.text[:200])


test()
