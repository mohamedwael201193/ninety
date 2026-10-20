import requests

BASE_URL = "https://ninety-coral.vercel.app"


def test_check_bad_input() -> None:
    impossible = requests.post(
        f"{BASE_URL}/api/v1/check",
        json={"trips": [{"entry": "2024-02-30", "exit": "2024-03-01"}], "on": "2024-04-15"},
        timeout=30,
    )
    assert impossible.status_code == 400, impossible.status_code
    body = impossible.json()
    assert body["error"] == "invalid_request", body
    assert {"path": "trips.0.entry", "message": "Use a real calendar date as YYYY-MM-DD."} in body["issues"], body

    unknown_key = requests.post(f"{BASE_URL}/api/v1/check", json={"stays": []}, timeout=30)
    assert unknown_key.status_code == 400, unknown_key.status_code

    wrong_type = requests.post(
        f"{BASE_URL}/api/v1/check", data="trips=1", headers={"Content-Type": "text/plain"}, timeout=30
    )
    assert wrong_type.status_code == 415, wrong_type.status_code


test_check_bad_input()
