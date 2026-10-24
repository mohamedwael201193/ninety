import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# TS65-parity-hand-worked: the 12 hand-worked boundary cases on /parity (src/lib/schengen/golden.ts),
# whose answers were written down before either calculator ran, all match. Mirrors
# testsprite_tests/plans/TS65-parity-hand-worked.json.


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
        await expect(page.get_by_role("heading", name="Boundary cases worked out by hand")).to_be_visible()
        rows = tid("golden-table").get_by_test_id("golden-row")
        await expect(rows).to_have_count(12)
        for i in range(12):
            await expect(rows.nth(i)).to_have_attribute("data-match", "true")
            await expect(rows.nth(i)).to_contain_text("Match")
            await expect(rows.nth(i)).not_to_contain_text("Differs")
        def by_hand(s):
            return page.locator(f'[data-testid="golden-row"][data-scenario="{s}"]').get_by_test_id("golden-expected")
        await expect(by_hand("overlapping-trips")).to_have_text(re.compile(r"^\s*60 left\s*$"))
        await expect(by_hand("exit-before-entry-refused")).to_have_text(re.compile(r"^\s*refused\s*$"))
        await expect(by_hand("overlap-overstay-counted-once")).to_have_text(re.compile(r"^\s*11 overstay\s*$"))
        notes = tid("golden-first-expected")
        await expect(notes).to_have_count(1)
        await expect(notes).to_contain_text("First written down as")
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
