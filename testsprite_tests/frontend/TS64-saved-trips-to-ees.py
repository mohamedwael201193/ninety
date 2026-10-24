import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# TS64-saved-trips-to-ees: trips saved on the calculator are the ones the EES check compares.
# Plan: testsprite_tests/plans/TS64-saved-trips-to-ees.json. Stored with `testsprite test code put` (user-authored, replayed).


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
        await tid("trip-save").click()
        await expect(tid("trip-row")).to_have_count(1)

        await page.goto(base + "/ees?today=2026-10-19")
        await expect(tid("ees-empty-count")).to_be_visible()
        await expect(tid("ees-empty-count")).to_contain_text(re.compile(r"(^|\D)10(\D|$)"))
        await expect(page.get_by_text("Your trips: 10 days used.")).to_be_visible()

        await tid("ees-days-used").fill("14")
        await tid("ees-compare").click()
        await expect(tid("ees-traveller-days")).to_contain_text(re.compile(r"(^|\D)10(\D|$)"))
        await expect(tid("ees-figure-gap")).to_contain_text(re.compile(r"(^|\D)4(\D|$)"))
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
