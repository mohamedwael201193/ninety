import requests

BASE_URL = "https://ninety-coral.vercel.app"


def test_openapi_document() -> None:
    r = requests.get(f"{BASE_URL}/api/openapi.json", timeout=30)
    assert r.status_code == 200, r.status_code
    doc = r.json()
    assert doc["openapi"] == "3.1.0", doc.get("openapi")
    assert sorted(doc["paths"]) == ["/api/v1/check", "/api/v1/ees-reconcile", "/api/v1/letter"], list(doc["paths"])
    check = doc["paths"]["/api/v1/check"]["post"]
    assert sorted(check["responses"]) == ["200", "400", "413", "415", "422"], list(check["responses"])
    body = check["requestBody"]["content"]["application/json"]["schema"]
    assert body["required"] == ["trips"] and body["additionalProperties"] is False


test_openapi_document()
