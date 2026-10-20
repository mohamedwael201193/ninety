import json
import requests

BASE_URL = "https://ninety-coral.vercel.app"
MCP_HEADERS = {"Accept": "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18", "Content-Type": "application/json"}


def test() -> None:
    # JSON-RPC 2.0, section 5 (Response object): "id: This member is REQUIRED. ... If there was an
    # error in detecting the id in the Request object (e.g. Parse error/Invalid Request), it MUST be Null."
    for bad_id in [True, {"a": 1}, [1]]:
        r = requests.post(f"{BASE_URL}/api/mcp", data=json.dumps({"jsonrpc": "2.0", "id": bad_id, "method": "tools/list"}),
                          headers=MCP_HEADERS, timeout=30)
        body = r.json()
        assert body["error"]["code"] == -32600, (bad_id, body)
        assert "id" in body, (bad_id, "error response has no id member", body)
        assert body["id"] is None, (bad_id, body)


test()
