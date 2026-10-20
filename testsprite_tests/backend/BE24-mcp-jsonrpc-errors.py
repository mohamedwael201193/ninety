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
    r = mcp({"jsonrpc": "2.0", "id": 7, "method": "no/such"})
    assert r.status_code == 200, r.status_code
    assert r.json()["id"] == 7 and r.json()["error"]["code"] == -32601, r.text
    r = mcp('{"jsonrpc": "2.0", "id": 1, "method": "tools/list"')
    body = r.json()
    assert body["error"]["code"] == -32700 and body["id"] is None, r.text
    r = mcp({"jsonrpc": "1.0", "id": 2, "method": "tools/list"})
    assert r.json()["error"]["code"] == -32600, r.text
    r = mcp({"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "nope", "arguments": {}}})
    assert r.json()["error"]["code"] == -32602, r.text


test()
