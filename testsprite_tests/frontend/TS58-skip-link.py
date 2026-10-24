import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# TS58-skip-link: The skip link is the first Tab stop and moves focus to the main content
# Plan: testsprite_tests/plans/TS58-skip-link.json. Stored with `testsprite test code put` (user-authored, replayed).


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
        await page.wait_for_load_state("networkidle")
        await page.keyboard.press("Tab")
        await expect(tid("skip-link")).to_be_focused()
        await expect(tid("skip-link")).to_have_text("Skip to main content")
        target = (await tid("skip-link").get_attribute("href")) or ""
        assert target.startswith("#") and len(target) > 1, f"skip link href {target!r}"
        await page.keyboard.press("Enter")
        await page.wait_for_timeout(500)
        inside = await page.evaluate("(sel) => { const m = document.querySelector(sel); return !!m && (m === document.activeElement || m.contains(document.activeElement) || location.hash === sel); }", target)
        assert inside, f"focus did not move to {target}"
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
