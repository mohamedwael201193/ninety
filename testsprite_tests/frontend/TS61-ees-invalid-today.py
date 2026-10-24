import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# TS61-ees-invalid-today: The EES check refuses an impossible ?today= date with its own message
# Plan: testsprite_tests/plans/TS61-ees-invalid-today.json. Stored with `testsprite test code put` (user-authored, replayed).


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
        await page.goto(base + "/ees?today=2026-13-01&fresh=1")
        await expect(tid("ees-today-error")).to_be_visible()
        await expect(tid("ees-today-error")).to_contain_text("not a real calendar date")
        shown = await tid("ees-on").input_value() if await tid("ees-on").evaluate("e => 'value' in e") else await tid("ees-on").inner_text()
        assert shown.strip() != "2026-13-01", "the impossible date was used"
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
