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
    # Commission: 1 Jan-15 Apr 2024 -> 'Overstay in the period from 31/03/24 to 15/04/24 (16 days)'.
    r = mcp({"jsonrpc": "2.0", "id": 9, "method": "tools/call", "params": {"name": "schengen_check",
             "arguments": {"trips": [{"entry": "2024-01-01", "exit": "2024-04-15"}], "on": "2024-04-15"}}})
    assert r.status_code == 200, r.status_code
    res = r.json()["result"]
    assert not res.get("isError"), res
    data = res.get("structuredContent") or json.loads(res["content"][0]["text"])
    assert data["daysUsed"] == 106, data
    assert data["overstays"] == [{"from": "2024-03-31", "to": "2024-04-15", "days": 16}], data["overstays"]


test()
