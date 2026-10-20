import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    body = json.dumps({"trips": [{"entry": "2024-01-01", "exit": "2024-01-10"}], "on": "2024-01-10"}).encode()
    # RFC 9110: media type names are case-insensitive; parameters such as charset are allowed.
    for ct in ["application/json", "application/json; charset=utf-8", "application/json;charset=UTF-8", "Application/JSON", "APPLICATION/JSON; charset=utf-8"]:
        r = requests.post(f"{BASE_URL}/api/v1/check", data=body, headers={"Content-Type": ct}, timeout=30)
        assert r.status_code == 200, (ct, r.status_code, r.text[:200])
        assert r.json()["daysUsed"] == 10, ct
    for ct in ["text/plain", "application/x-www-form-urlencoded", "multipart/form-data; boundary=x", "application/jsonx", None]:
        headers = {"Content-Type": ct} if ct else {}
        r = requests.post(f"{BASE_URL}/api/v1/check", data=body, headers=headers, timeout=30)
        if ct is None:
            r = requests.post(f"{BASE_URL}/api/v1/check", data=body, headers={"Content-Type": ""}, timeout=30)
        assert r.status_code == 415, (ct, r.status_code, r.text[:200])


test()
