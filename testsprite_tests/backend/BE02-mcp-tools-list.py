import requests

BASE_URL = "https://ninety-coral.vercel.app"


def test_mcp_tools_list() -> None:
    r = requests.post(
        f"{BASE_URL}/api/mcp",
        json={"jsonrpc": "2.0", "id": 1, "method": "tools/list"},
        headers={"Accept": "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18"},
        timeout=30,
    )
    assert r.status_code == 200, r.status_code
    msg = r.json()
    assert msg["jsonrpc"] == "2.0" and msg["id"] == 1, msg
    names = sorted(t["name"] for t in msg["result"]["tools"])
    assert names == ["article52_letter", "ees_reconcile", "schengen_check"], names
    for tool in msg["result"]["tools"]:
        assert tool["inputSchema"]["type"] == "object", tool["name"]
    # An unsupported protocol version is refused (MCP 2025-06-18).
    bad = requests.post(
        f"{BASE_URL}/api/mcp",
        json={"jsonrpc": "2.0", "id": 2, "method": "tools/list"},
        headers={"Accept": "application/json, text/event-stream", "MCP-Protocol-Version": "1999-01-01"},
        timeout=30,
    )
    assert bad.status_code == 400, bad.status_code


test_mcp_tools_list()
