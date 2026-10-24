import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# TS63-band-saved-trips: The landing band switches from the example to the saved trips after a reload
# Plan: testsprite_tests/plans/TS63-band-saved-trips.json. Stored with `testsprite test code put` (user-authored, replayed).


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
        await expect(tid("count-band")).to_have_attribute("data-source", "example")
        await tid("trip-add").click()
        await tid("trip-entry").fill("2026-09-01")
        await tid("trip-exit").fill("2026-09-10")
        await tid("trip-save").click()
        await expect(tid("trip-row")).to_have_count(1)
        await page.goto(base + "/?today=2026-10-19")
        band = tid("count-band")
        await expect(band).to_have_attribute("data-source", "saved")
        await expect(band).to_contain_text("Your saved trips, read on 2026-10-19")
        await expect(tid("band-used")).to_contain_text(re.compile(r"(^|\D)10(\D|$)"))
        await expect(tid("band-left")).to_contain_text(re.compile(r"(^|\D)80(\D|$)"))
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
