import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# TS42-leap-day: a stay on 29 February 2024 counts on 2024-08-26 (day 180) and has left the window on
# 2024-08-27 (day 181). Mirrors testsprite_tests/plans/TS42-leap-day.json: each read waits for the
# Latest legal exit tile, a plain date (2024-11-23 on day 180, 2024-11-24 on day 181), not the
# rolling ring digits an agent can misread.


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
        exit_ = tid("status-panel").get_by_test_id("latest-exit")

        await page.goto(base + "/?today=2024-08-26&fresh=1")
        await tid("trip-add").click()
        await tid("trip-entry").fill("2024-02-29")
        await tid("trip-exit").fill("2024-02-29")
        await tid("trip-save").click()
        await expect(exit_).to_contain_text("2024-11-23")
        await expect(exit_.locator("xpath=..")).to_contain_text("23 November 2024")

        await page.goto(base + "/?today=2024-08-27")
        assert "fresh=1" not in page.url, page.url
        await expect(exit_).to_contain_text("2024-11-24")
        await expect(exit_.locator("xpath=..")).to_contain_text("24 November 2024")
        rows = tid("trip-row")
        await expect(rows).to_have_count(1)
        await expect(rows.nth(0)).to_contain_text("2024-02-29")
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
