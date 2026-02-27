import asyncio
import os
from playwright.async_api import async_playwright

async def verify_og_layout():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Navigate to home
        await page.goto("http://localhost:4321/en")

        # Wait for page load
        await page.wait_for_selector("text=Gallery")

        # Upload SVG to create project
        # There is an input[type=file] inside the label
        # We need to find the input.
        # The label says "Create New".

        # Use set_input_files on the file input
        file_input = page.locator("input[type='file']").first
        await file_input.set_input_files("verification/test_logo.svg")

        # Wait for redirection to editor
        # The URL should contain '/editor'
        await page.wait_for_url("**/editor?id=*")
        print("Redirected to editor")

        # Wait for editor to load
        await page.wait_for_selector("text=Edit")

        # Click "Preview" tab
        await page.get_by_role("button", name="Preview").click()

        # Click "Exports" tab in the preview gallery
        await page.get_by_text("Exports").click()

        # Verify "Open Graph" card exists
        # It should contain text "opengraph.png"
        og_card = page.locator("text=opengraph.png")
        await og_card.wait_for()
        print("Open Graph card found")

        # Verify it is selected (has checkmark or border)
        # The parent div should have border-blue-500 class if selected
        # We can just take a screenshot to verify visually

        # Wait a bit for OG generation (it's async in useEffect)
        await page.wait_for_timeout(3000)

        await page.screenshot(path="verification/og_export_tab.png")
        print("Screenshot taken: verification/og_export_tab.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_og_layout())
