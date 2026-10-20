import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    LIMIT = 64 * 1024
    base = json.dumps({"trips": [{"entry": "2024-01-01", "exit": "2024-01-02"}], "on": "2024-01-02"})
    under = base + " " * (LIMIT - len(base.encode()))
    assert len(under.encode()) == LIMIT
    r = requests.post(f"{BASE_URL}/api/v1/check", data=under.encode(), headers={"Content-Type": "application/json"}, timeout=30)
    assert r.status_code == 200, (r.status_code, r.text[:200])
    assert r.json()["daysUsed"] == 2
    over = under + " "
    r = requests.post(f"{BASE_URL}/api/v1/check", data=over.encode(), headers={"Content-Type": "application/json"}, timeout=30)
    assert r.status_code == 413, (r.status_code, r.text[:200])
    # Multi-byte: 33,000 x "é" is 66,000 bytes but 33,000 characters.
    wide = json.dumps({"trips": [], "note": "é" * 33000}, ensure_ascii=False).encode("utf-8")
    r = requests.post(f"{BASE_URL}/api/v1/check", data=wide, headers={"Content-Type": "application/json"}, timeout=30)
    assert r.status_code == 413, (r.status_code, r.text[:200])


test()
