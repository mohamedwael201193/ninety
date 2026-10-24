import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# TS53-developers-openapi: The developers page documents the API and its OpenAPI document lists the three endpoints
# Plan: testsprite_tests/plans/TS53-developers-openapi.json. Stored with `testsprite test code put` (user-authored, replayed).


async def run_test():
    pw = None
    browser = None
    context = None
    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(headless=True, args=["--window-size=1280,720", "--disable-dev-shm-usage", "--ipc=host", "--single-process"])
        context = await browser.new_context()
        context.set_default_timeout(15000)
        page = await context.new_page()
        base = "VAR_{url}".rstrip("/")
        tid = page.get_by_test_id
        await page.goto(base + "/developers")
        await expect(tid("developers-heading")).to_have_text("The same engine, as an API and an MCP server")
        await expect(tid("developers-mcp-http")).to_contain_text("POST /api/mcp")
        href = await tid("openapi-link").get_attribute("href")
        assert href and href.endswith("/api/openapi.json"), f"openapi link is {href!r}"
        res = await page.request.get(base + "/api/openapi.json")
        assert res.status == 200, f"openapi.json answered {res.status}"
        doc = await res.json()
        assert doc["openapi"].startswith("3.1"), doc["openapi"]
        paths = sorted(doc["paths"].keys())
        for p in ["/api/v1/check", "/api/v1/ees-reconcile", "/api/v1/letter"]:
            assert p in paths, f"{p} missing from {paths}"
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
