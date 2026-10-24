import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# TS54-invalid-today-param: An impossible ?today= date is refused with a message and the real date is used
# Plan: testsprite_tests/plans/TS54-invalid-today-param.json. Stored with `testsprite test code put` (user-authored, replayed).


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
        await page.goto(base + "/?today=2026-02-30&fresh=1")
        await expect(tid("today-error")).to_be_visible()
        await expect(tid("today-error")).to_contain_text("not a real calendar date")
        await expect(tid("today-override")).to_have_text("no")
        shown = (await tid("today-date").inner_text()).strip()
        assert shown != "2026-02-30", "the impossible date was used as today"
        assert re.fullmatch(r"\d{4}-\d{2}-\d{2}", shown), f"today-date is {shown!r}"
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
