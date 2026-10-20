import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    # Commission: on 26/08/24 the 180-day period starts 29/02/24; on 27/08/24 it starts 01/03/24.
    trip = [{"entry": "2024-02-29", "exit": "2024-02-29"}]
    a = check({"trips": trip, "on": "2024-08-26"}).json()
    b = check({"trips": trip, "on": "2024-08-27"}).json()
    assert a["daysUsed"] == 1, a
    assert b["daysUsed"] == 0, b
    assert a["daysLeft"] == 90 and b["daysLeft"] == 90, (a, b)
    assert a["latestExit"] == "2024-11-23", a
    assert b["latestExit"] == "2024-11-24", b


test()
