import requests

BASE_URL = "https://ninety-coral.vercel.app"


def test_parity() -> None:
    r = requests.get(f"{BASE_URL}/api/parity", timeout=60)
    assert r.status_code == 200, r.status_code
    d = r.json()
    assert d["status"] == "match", (d.get("status"), d.get("reason"))
    assert d["score"] == "14/14" and d["matched"] == 14 and d["total"] == 14, d["score"]
    assert d["mismatches"] == [], d["mismatches"]
    assert len(d["rows"]) == 14 and all(row["match"] for row in d["rows"])
    # Honest source: either the live page, or the stored copy with its hash named.
    assert d["origin"] in ("live", "stored"), d.get("origin")
    if d["origin"] == "stored":
        assert "checked against the stored official copy" in d["notice"], d["notice"]
        assert "bd538a7d744ce090cb110b3c0bb0eaf4e65cb9b6ad1ec7cc0bb923d3d1ce4513" in d["notice"]


test_parity()
