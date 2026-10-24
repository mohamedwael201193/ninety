import requests

BASE_URL = "https://ninety-coral.vercel.app"


def test_ees_reconcile_exit_disagree() -> None:
    # Trips: 2026-09-01 to 2026-09-10 (10 days). The EES says 14 days and records the same entry
    # with exit 2026-09-14, so the 4 days 11-14 September are on the EES side only.
    r = requests.post(
        f"{BASE_URL}/api/v1/ees-reconcile",
        json={
            "trips": [{"entry": "2026-09-01", "exit": "2026-09-10"}],
            "ees": {"daysUsed": 14, "on": "2026-10-19", "records": [{"entry": "2026-09-01", "exit": "2026-09-14"}]},
        },
        timeout=30,
    )
    assert r.status_code == 200, (r.status_code, r.text)
    d = r.json()
    assert d["on"] == "2026-10-19", d
    assert d["windowStart"] == "2026-04-23", d  # 179 days before 2026-10-19
    assert d["travellerDaysUsed"] == 10, d
    assert d["eesDaysUsed"] == 14, d
    assert d["figureGap"] == 4, d
    assert sorted(d["codes"]) == ["exit-dates-disagree", "figure-differs"], d["codes"]
    assert d["differences"] == [{"from": "2026-09-11", "to": "2026-09-14", "side": "ees-only", "count": 4}], d["differences"]
    assert "2026-09-10" in d["explanation"] and "2026-09-14" in d["explanation"], d["explanation"]

    # Same trips, EES agrees: no codes but a match, no differences.
    r = requests.post(
        f"{BASE_URL}/api/v1/ees-reconcile",
        json={"trips": [{"entry": "2026-09-01", "exit": "2026-09-10"}], "ees": {"daysUsed": 10, "on": "2026-10-19"}},
        timeout=30,
    )
    assert r.status_code == 200, (r.status_code, r.text)
    d = r.json()
    assert d["figureGap"] == 0, d
    assert d["differences"] == [], d
    assert "figure-differs" not in d["codes"], d["codes"]


test_ees_reconcile_exit_disagree()
