import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    # Commission on 29/02/24 with 1-29 Feb used: 'authorised for up to: 61 day(s)', 'Possible stay until 30/04/24'.
    trips = [{"entry": "2024-02-01", "exit": "2024-02-29"}]
    fit = check({"trips": trips, "on": "2024-02-29", "planned": {"entry": "2024-03-01", "exit": "2024-04-30"}}).json()
    assert fit["planned"]["plannedDays"] == 61 and fit["planned"]["fits"] is True, fit["planned"]
    no = check({"trips": trips, "on": "2024-02-29", "planned": {"entry": "2024-03-01", "exit": "2024-05-01"}}).json()
    assert no["planned"]["plannedDays"] == 62 and no["planned"]["fits"] is False, no["planned"]


test()
