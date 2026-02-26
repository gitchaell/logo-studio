
import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        # Navigate to the gallery page
        await page.goto("http://localhost:4321/")

        # Take a screenshot of the Gallery
        await page.screenshot(path="verification/gallery.png")
        print("Gallery screenshot captured.")

        # Create a new project (upload SVG)
        # Creating a dummy SVG file for upload
        svg_content = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red" /></svg>'
        with open("verification/test_logo.svg", "w") as f:
            f.write(svg_content)

        # Upload the file
        # Find the input element associated with the label
        file_input = page.locator('input[type="file"]')
        await file_input.first.set_input_files("verification/test_logo.svg")

        # Wait for navigation to editor
        # Relaxing url check and increasing timeout, checking for editor element
        try:
            await page.wait_for_url("**/editor?id=*", timeout=5000)
        except:
            print("Wait for URL timed out, checking if we are already there or need manual nav.")

        # If not redirected automatically (which it should be), try clicking the first card if it appeared
        if "editor" not in page.url:
             # Wait a bit for DB to save
             await page.wait_for_timeout(1000)
             await page.goto("http://localhost:4321/en/editor?id=1")

        print("Navigated to editor.")

        # Take screenshot of Editor (Edit Tab)
        await page.screenshot(path="verification/editor_edit.png")
        print("Editor (Edit) screenshot captured.")

        # Switch to Preview Tab
        # Use more precise selector based on SVG icon or structure if text fails
        try:
             # Try clicking the button that contains the "Preview" text, specifically in the header
             await page.click('button:has-text("Preview")', timeout=5000)
        except:
             print("Could not find Preview button with simple selector, trying fallback")
             # Fallback to structure: header -> div -> 2nd button
             await page.locator('header div.flex button').nth(1).click()

        await page.wait_for_selector('text=Web', timeout=5000) # Wait for tabs

        # Screenshot Web Preview
        await page.screenshot(path="verification/preview_web.png")
        print("Preview (Web) screenshot captured.")

        # Switch to Mobile Preview
        await page.click('button:has-text("Mobile")')
        await page.wait_for_selector('text=9:41') # Wait for iOS time
        await page.screenshot(path="verification/preview_mobile.png")
        print("Preview (Mobile) screenshot captured.")

        # Switch to Social Preview
        await page.click('button:has-text("Social")')
        await page.wait_for_selector('text=LinkedIn')
        await page.screenshot(path="verification/preview_social.png")
        print("Preview (Social) screenshot captured.")

        # Switch to Manifest Preview
        await page.click('button:has-text("Manifest")')
        await page.wait_for_selector('text=Splash Screen')
        await page.screenshot(path="verification/preview_manifest.png")
        print("Preview (Manifest) screenshot captured.")

        # Switch to Exports
        await page.click('button:has-text("Exports")')
        await page.wait_for_selector('text=Export Selection')
        await page.screenshot(path="verification/preview_exports.png")
        print("Preview (Exports) screenshot captured.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
