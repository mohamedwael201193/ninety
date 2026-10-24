import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# TS39-phone-nav: at 390 px the nav links stay visible, carry the scenario, and mark the current page.
# Plan: testsprite_tests/plans/TS39-phone-nav.json. The earlier stored code never set the viewport,
# so it ran at desktop width; this one sets 390 x 844 and checks the page really is 390 px wide.


async def run_test():
    pw = None
    browser = None
    context = None
    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(headless=True, args=["--window-size=390,844", "--disable-dev-shm-usage", "--ipc=host", "--single-process"])
        context = await browser.new_context(viewport={"width": 390, "height": 844})
        context.set_default_timeout(15000)
        page = await context.new_page()
        await page.set_viewport_size({"width": 390, "height": 844})
        base = "VAR_{url}".rstrip("/")
        tid = page.get_by_test_id

        await page.goto(base + "/?scenario=near-limit")
        width = await page.evaluate("window.innerWidth")
        assert width == 390, f"viewport is {width} px wide, not 390"

        links = tid("nav-links")
        await expect(links).to_be_visible()
        for name in ["EES check", "Letter", "Parity", "Proof"]:
            await expect(links).to_contain_text(name)

        await tid("nav-ees").click()
        await expect(page).to_have_url(re.compile(r"/ees\?scenario=near-limit"))
        await expect(tid("ees-days-used")).to_be_visible()
        await expect(tid("nav-ees")).to_have_attribute("aria-current", "page")

        await tid("nav-proof").scroll_into_view_if_needed()
        await tid("nav-proof").click()
        await expect(page).to_have_url(re.compile(r"/proof"))
        await expect(tid("proof-table")).to_be_visible()
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
