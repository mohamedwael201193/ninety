import requests

BASE_URL = "https://ninety-coral.vercel.app"


def test_check_overstay() -> None:
    # 1 Jan to 15 Apr 2024 is 106 days; the European Commission calculator reports
    # "Overstay in the period from 31/03/24 to 15/04/24 (16 days)" for the same stay.
    r = requests.post(
        f"{BASE_URL}/api/v1/check",
        json={"trips": [{"entry": "2024-01-01", "exit": "2024-04-15"}], "on": "2024-04-15"},
        timeout=30,
    )
    assert r.status_code == 200, (r.status_code, r.text)
    d = r.json()
    assert d["on"] == "2024-04-15", d
    assert d["daysUsed"] == 106, d
    assert d["daysLeft"] == 0, d
    assert d["present"] is True, d
    assert d["latestExit"] is None, d
    assert d["overstays"] == [{"from": "2024-03-31", "to": "2024-04-15", "days": 16}], d["overstays"]


test_check_overstay()
