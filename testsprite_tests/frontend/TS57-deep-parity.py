import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# TS57-deep-parity: /parity shows the deep parity score 399/400 and names the one scenario outside the calculator
# Plan: testsprite_tests/plans/TS57-deep-parity.json. Stored with `testsprite test code put` (user-authored, replayed).


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
        await page.goto(base + "/parity")
        await expect(tid("deep-parity-score")).to_contain_text("399/400")
        dis = tid("deep-parity-disagreements")
        await expect(dis).to_contain_text("kom-1-4")
        await expect(dis).to_contain_text("22 April 2013")
        await expect(tid("deep-parity-groups")).to_contain_text("existing-14")
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
