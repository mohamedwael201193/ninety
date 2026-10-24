import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

# TS03, written to match the 7 plan steps in testsprite_tests/plans/TS03-add-trip.json.
# Uploaded with: testsprite test code put b6981077-60ba-4847-b769-719dd19ebc2c --code-file <this file>


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

        # 1. Pin today to 2026-10-19 and start from an empty trip list.
        base = "VAR_{url}".rstrip("/")
        await page.goto(base + "/?today=2026-10-19&fresh=1")
        await page.wait_for_load_state("domcontentloaded")

        # 2. Open the trip sheet.
        await page.get_by_test_id("trip-add").click(timeout=10000)

        # 3. Entry 2026-09-01, exit 2026-09-10.
        entry = page.get_by_test_id("trip-entry")
        await entry.wait_for(state="visible", timeout=10000)
        await entry.fill("2026-09-01")
        await page.get_by_test_id("trip-exit").fill("2026-09-10")

        # 4. Save.
        await page.get_by_test_id("trip-save").click(timeout=10000)

        # 5. Exactly one trip row, for 2026-09-01 to 2026-09-10, showing 10 days.
        rows = page.get_by_test_id("trip-row")
        await expect(rows).to_have_count(1, timeout=15000)
        row_text = await rows.nth(0).inner_text()
        assert re.search(r"\b10\s*days?\b", row_text), f"trip row does not show 10 days: {row_text!r}"

        # 6. Days used shows 10.
        await expect(page.get_by_test_id("days-used")).to_contain_text(re.compile(r"(^|\D)10(\D|$)"), timeout=15000)

        # 7. Days left shows 80.
        await expect(page.get_by_test_id("days-left")).to_contain_text(re.compile(r"(^|\D)80(\D|$)"), timeout=15000)
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
