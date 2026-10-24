import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# TS60-window-bar-dates: The 180-day window bar spans 23 Apr to 19 Oct on 2026-10-19 and moves with the date
# Plan: testsprite_tests/plans/TS60-window-bar-dates.json. Stored with `testsprite test code put` (user-authored, replayed).


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
        bar = tid("window-bar")
        await expect(bar).to_contain_text("23 Apr")
        await expect(bar).to_contain_text("19 Oct")
        await page.goto(base + "/?today=2026-11-15&fresh=1")
        await expect(tid("window-bar")).to_contain_text("20 May")
        await expect(tid("window-bar")).to_contain_text("15 Nov")
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
