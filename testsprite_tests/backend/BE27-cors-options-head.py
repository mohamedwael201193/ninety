import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


def test() -> None:
    r = requests.options(f"{BASE_URL}/api/v1/check", headers={"Origin": "https://example.org", "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type"}, timeout=30)
    assert r.status_code in (200, 204), r.status_code
    assert r.headers.get("access-control-allow-origin") == "*", dict(r.headers)
    assert "POST" in r.headers.get("access-control-allow-methods", ""), dict(r.headers)
    assert "content-type" in r.headers.get("access-control-allow-headers", "").lower(), dict(r.headers)
    # The real response carries the CORS header too, so a browser can read it.
    r = check({"trips": []}, headers={"Origin": "https://example.org"})
    assert r.headers.get("access-control-allow-origin") == "*", dict(r.headers)
    # RFC 9110: GET on a POST-only resource is 405 with an Allow header.
    r = requests.get(f"{BASE_URL}/api/v1/check", timeout=30)
    assert r.status_code == 405 and "POST" in r.headers.get("allow", ""), (r.status_code, dict(r.headers))
    # HEAD on the OpenAPI document: 200, same content type as GET, no body.
    h = requests.head(f"{BASE_URL}/api/openapi.json", timeout=30)
    g = requests.get(f"{BASE_URL}/api/openapi.json", timeout=30)
    assert h.status_code == 200 and h.text == "", (h.status_code, h.text[:100])
    assert h.headers.get("content-type", "").split(";")[0] == g.headers.get("content-type", "").split(";")[0], (h.headers, g.headers)


test()
