# TS18-letter-evidence: stored code. The healed copy TestSprite had stored opened the PR #67 preview by its full URL;
# this one uses the run's base URL (VAR_{url}) so every PR tests its own preview.
import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        # @@ts-step {"i":1,"type":"action","action":"navigate","selector":null,"desc":"Navigate to VAR_{url}","input":"VAR_{url}","field":null}
        await page.goto("VAR_{url}")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the near-limit demo scenario at the site's root URL with the scenario query parameter.
        # @@ts-step {"i":2,"type":"action","action":"navigate","selector":null,"desc":"Navigate to VAR_{url}/?scenario=near-limit","input":"VAR_{url}/?scenario=near-limit","field":null}
        await page.goto("VAR_{url}/?scenario=near-limit")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the Letter page using the top navigation.
        # @@ts-step {"i":3,"type":"action","action":"click","selector":"xpath=/html/body/header/nav/div/a[4]","desc":"Click 'Letter link'","input":null,"field":"1692"}
        # Letter link
        elem = page.get_by_test_id("nav-letter")
        await elem.click(timeout=10000)
        
        # -> Enter Jane Traveller’s name, date of birth, nationality, and travel document number in the letter form.
        # @@ts-step {"i":4,"type":"action","action":"fill","selector":"xpath=/html/body/main/div/div/form/fieldset/div/div/input","desc":"Fill 'Jane Traveller' into text field","input":"Jane Traveller","field":"3452"}
        # text field
        elem = page.get_by_test_id("letter-name")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Jane Traveller")
        
        # -> Enter Jane Traveller’s name, date of birth, nationality, and travel document number in the letter form.
        # @@ts-step {"i":5,"type":"action","action":"fill","selector":"xpath=/html/body/main/div/div/form/fieldset/div[2]/input","desc":"Fill '1990-05-04' into YYYY-MM-DD text field","input":"1990-05-04","field":"3455"}
        # YYYY-MM-DD text field
        elem = page.get_by_test_id("letter-birth")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("1990-05-04")
        
        # -> Enter Jane Traveller’s name, date of birth, nationality, and travel document number in the letter form.
        # @@ts-step {"i":6,"type":"action","action":"fill","selector":"xpath=/html/body/main/div/div/form/fieldset/div[3]/input","desc":"Fill 'Egypt' into e.g. Egypt text field","input":"Egypt","field":"3457"}
        # e.g. Egypt text field
        elem = page.get_by_test_id("letter-nationality")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Egypt")
        
        # -> Enter Jane Traveller’s name, date of birth, nationality, and travel document number in the letter form.
        # @@ts-step {"i":7,"type":"action","action":"fill","selector":"xpath=/html/body/main/div/div/form/fieldset/div[4]/input","desc":"Fill 'A1234567' into text field","input":"A1234567","field":"3459"}
        # text field
        elem = page.get_by_test_id("letter-document")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("A1234567")
        
        # -> Enter the requested email, Member State, and EES days used, then draft the correction letter.
        # @@ts-step {"i":8,"type":"action","action":"fill","selector":"xpath=/html/body/main/div/div/form/fieldset/div[5]/input","desc":"Fill 'jane@example.com' into text field","input":"jane@example.com","field":"3461"}
        # text field
        elem = page.get_by_test_id("letter-email")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("jane@example.com")
        
        # -> Enter the requested email, Member State, and EES days used, then draft the correction letter.
        # @@ts-step {"i":9,"type":"action","action":"fill","selector":"xpath=/html/body/main/div/div/form/fieldset[2]/div/input","desc":"Fill 'France' into e.g. France text field","input":"France","field":"3469"}
        # e.g. France text field
        elem = page.get_by_test_id("letter-member-state")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("France")
        
        # -> Enter the requested email, Member State, and EES days used, then draft the correction letter.
        # @@ts-step {"i":10,"type":"action","action":"fill","selector":"xpath=/html/body/main/div/div/form/fieldset[2]/div[2]/input","desc":"Fill '90' into e.g. 90 text field","input":"90","field":"3471"}
        # e.g. 90 text field
        elem = page.get_by_test_id("letter-ees-days")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("90")
        
        # -> Enter the requested email, Member State, and EES days used, then draft the correction letter.
        # @@ts-step {"i":11,"type":"action","action":"click","selector":"xpath=/html/body/main/div/div/form/button","desc":"Click 'Draft letter button'","input":null,"field":"3490"}
        # Draft letter button
        elem = page.get_by_test_id("letter-generate")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The generated letter includes an evidence row for the date and day-count comparison.
        await page.get_by_role("row", name="-10-19 88 days 90 days 2 days").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: not verified — the export-time check could not be evaluated
        # Assert: The letter's evidence row is visible.
        await expect(page.get_by_role("row", name="-10-19 88 days 90 days 2 days").nth(0)).to_be_visible(timeout=15000), "The letter's evidence row is visible."
        
        # --> The generated letter includes its figures comparison statement.
        # Assert-outcome: not verified — the export-time check could not be evaluated
        # Assert: The generated letter includes its figures comparison statement.
        await expect(page.get_by_test_id("letter-text").nth(0)).to_contain_text("In figures:", timeout=15000), "The generated letter includes its figures comparison statement."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    