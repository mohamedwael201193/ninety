import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# TS59-footer-links: Footer links open /proof and /developers
# Plan: testsprite_tests/plans/TS59-footer-links.json. Stored with `testsprite test code put` (user-authored, replayed).


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
        await tid("footer-proof").click()
        await expect(page).to_have_url(re.compile(r"/proof"))
        await expect(tid("proof-table")).to_be_visible()
        await tid("footer-developers").click()
        await expect(page).to_have_url(re.compile(r"/developers"))
        await expect(tid("developers-heading")).to_be_visible()
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
