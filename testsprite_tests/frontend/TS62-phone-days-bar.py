import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# TS62-phone-days-bar: At phone width the sticky days bar shows 26 days left and its Add trip button opens the trip sheet
# Plan: testsprite_tests/plans/TS62-phone-days-bar.json. Stored with `testsprite test code put` (user-authored, replayed).


async def run_test():
    pw = None
    browser = None
    context = None
    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(headless=True, args=["--window-size=1280,720", "--disable-dev-shm-usage", "--ipc=host", "--single-process"])
        context = await browser.new_context(viewport={'width': 390, 'height': 844})
        context.set_default_timeout(15000)
        page = await context.new_page()
        base = "VAR_{url}".rstrip("/")
        tid = page.get_by_test_id
        await page.goto(base + "/?today=2026-10-19&fresh=1")
        await tid("trip-example").first.click()
        await expect(tid("trip-row")).to_have_count(3)
        await page.mouse.wheel(0, 600)
        bar = tid("mobile-days-bar")
        await expect(bar).to_be_visible()
        await expect(bar).to_contain_text(re.compile(r"(^|\D)26 days left"))
        await bar.get_by_role("button", name="Add trip").click()
        await expect(tid("trip-sheet")).to_be_visible()
        await expect(tid("trip-entry")).to_be_visible()
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
