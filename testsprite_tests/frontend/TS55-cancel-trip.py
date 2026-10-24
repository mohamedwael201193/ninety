import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# TS55-cancel-trip: Cancelling the trip sheet saves nothing
# Plan: testsprite_tests/plans/TS55-cancel-trip.json. Stored with `testsprite test code put` (user-authored, replayed).


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
        await page.goto(base + "/?today=2026-10-19&fresh=1")
        await tid("trip-add").click()
        await tid("trip-entry").fill("2026-09-01")
        await tid("trip-exit").fill("2026-09-10")
        await tid("trip-cancel").click()
        await expect(tid("trip-sheet")).to_have_count(0)
        await expect(tid("trip-row")).to_have_count(0)
        await expect(tid("trip-empty")).to_be_visible()
        await expect(tid("days-used")).to_contain_text(re.compile(r"(^|\D)0(\D|$)"))
        await expect(tid("days-left")).to_contain_text(re.compile(r"(^|\D)90(\D|$)"))
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
