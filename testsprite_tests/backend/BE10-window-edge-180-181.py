import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    # Commission: on 28/06/24 'A stay may not be authorised', 'At 29/06/24 a stay may be authorized for 90 days';
    # on 29/06/24 'authorised for up to: 90 day(s)', 'Possible stay until 26/09/24'.
    trip = [{"entry": "2024-01-01", "exit": "2024-03-30"}]
    a = check({"trips": trip, "on": "2024-06-28"}).json()
    b = check({"trips": trip, "on": "2024-06-29"}).json()
    assert a["daysLeft"] == 0 and a["latestExit"] is None and a["present"] is False, a
    assert a["nextLegalEntry"] == "2024-06-29", a
    assert b["daysLeft"] == 90 and b["latestExit"] == "2024-09-26", b


test()
