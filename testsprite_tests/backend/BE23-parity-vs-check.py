import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    # Trips for three parity scenarios, from the Commission user manual and the calculator's own example.
    scenarios = {
        "manual-14-jun-2024": ([{"entry": "2024-01-01", "exit": "2024-01-01"}, {"entry": "2024-06-01", "exit": "2024-06-14"}], "2024-06-14"),
        "manual-entry-19-jun-2024": ([{"entry": "2024-01-01", "exit": "2024-01-10"}, {"entry": "2024-03-01", "exit": "2024-03-30"}, {"entry": "2024-05-01", "exit": "2024-06-09"}], "2024-06-19"),
        "no-previous-stay": ([], "2024-06-01"),
    }
    rows = {row["scenario"]: row for row in requests.get(f"{BASE_URL}/api/parity", timeout=60).json()["rows"]}
    for sid, (trips, on) in scenarios.items():
        theirs = rows[sid]["theirs"]  # the Commission calculator's figure, e.g. "76 left"
        assert theirs.endswith(" left"), (sid, theirs)
        d = check({"trips": trips, "on": on}).json()
        assert f"{d['daysLeft']} left" == theirs, (sid, d["daysLeft"], theirs)


test()
