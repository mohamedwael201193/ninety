import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"


def check(body, **kw):
    return requests.post(f"{BASE_URL}/api/v1/check", json=body, timeout=30, **kw)


MCP_HEADERS = {"Accept": "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18"}


def mcp(payload, **headers):
    data = payload if isinstance(payload, (bytes, str)) else json.dumps(payload)
    return requests.post(f"{BASE_URL}/api/mcp", data=data, headers={**MCP_HEADERS, "Content-Type": "application/json", **headers}, timeout=30)


def test() -> None:
    # MCP 2025-06-18 (Streamable HTTP): a notification is answered 202 Accepted with no body,
    # and JSON-RPC batching is not supported.
    r = mcp({"jsonrpc": "2.0", "method": "notifications/initialized"})
    assert r.status_code == 202 and r.text == "", (r.status_code, r.text)
    r = mcp([{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}])
    assert r.status_code in (200, 400), r.status_code
    body = r.json()
    err = body["error"] if isinstance(body, dict) else body[0]["error"]
    assert err["code"] == -32600, r.text
    big = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {"pad": "x" * 70000}})
    r = mcp(big)
    assert r.status_code == 413, r.status_code


test()
