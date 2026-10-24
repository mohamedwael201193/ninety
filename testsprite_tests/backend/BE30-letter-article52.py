import requests

BASE_URL = "https://ninety-coral.vercel.app"

IDENTITY = {
    "fullName": "Ana Test",
    "dateOfBirth": "1990-01-01",
    "nationality": "Canadian",
    "documentNumber": "X123",
    "email": "ana@example.com",
    "memberState": "France",
}


def test_letter_article52() -> None:
    # A real gap (trips 10 days, EES 14): the letter is drafted to France under Article 52.
    r = requests.post(
        f"{BASE_URL}/api/v1/letter",
        json={"trips": [{"entry": "2026-09-01", "exit": "2026-09-10"}], "ees": {"daysUsed": 14, "on": "2026-10-19"}, "identity": IDENTITY},
        timeout=30,
    )
    assert r.status_code == 200, (r.status_code, r.text)
    d = r.json()
    assert "Article 52 of Regulation (EU) 2017/2226" in d["title"], d["title"]
    assert d["addressee"] == "To the competent authority of France", d["addressee"]
    t = d["text"]
    assert "Ana Test" in t and "X123" in t and "1990-01-01" in t, t[:400]
    assert "within 45 days" in t, "the 45-day reply duty of Article 52(1) is missing"
    for clause in ["Article 52(1)", "Article 52(2)", "Article 52(3)", "Article 52(4)"]:
        assert clause in t, clause

    # No gap (EES 10 = trips 10): refused with 422 no_difference, no letter.
    r = requests.post(
        f"{BASE_URL}/api/v1/letter",
        json={"trips": [{"entry": "2026-09-01", "exit": "2026-09-10"}], "ees": {"daysUsed": 10, "on": "2026-10-19"}, "identity": IDENTITY},
        timeout=30,
    )
    assert r.status_code == 422, (r.status_code, r.text)
    assert r.json()["error"] == "no_difference", r.text

    # Missing identity fields: 422 naming each one.
    r = requests.post(
        f"{BASE_URL}/api/v1/letter",
        json={"trips": [{"entry": "2026-09-01", "exit": "2026-09-10"}], "ees": {"daysUsed": 14, "on": "2026-10-19"}, "identity": {}},
        timeout=30,
    )
    assert r.status_code in (400, 422), (r.status_code, r.text)
    paths = {i["path"] for i in r.json()["issues"]}
    assert {"identity.fullName", "identity.email", "identity.memberState"} <= paths, paths


test_letter_article52()
