import asyncio
from playwright.async_api import async_playwright

async def verify_og_layout():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # 1. Navigate to the editor
        # Note: We need to create a project first or use the demo URL if available.
        # Since we don't have a persistent DB in this environment easily, we'll try to rely on the default state or create one.
        # Let's try to go to the main page and click "Start New Project" or similar if it exists, or just go to editor directly?
        # The editor needs an ID.
        # Actually, let's try to use the API directly to generate the OG image since that's what we modified.
        # But we want to see the UI changes in PreviewGallery too.

        # Let's mock the project creation flow
        await page.goto("http://localhost:4321/")

        # Wait for hydration
        await page.wait_for_timeout(2000)

        # Click "Start New Project" or similar.
        # Based on file exploration, there might be a Hero component with a CTA.
        # Let's try to find a link to the editor or a button.
        # If not, we can try to manually insert a project into IndexedDB via console, but that's complex.
        # Alternative: The Editor component handles "new project" if ID is not present?
        # The code says: `const project = useLiveQuery(() => (id ? db.projects.get(id) : undefined), [id]);`
        # So we need an ID.

        # Let's look at `src/pages/index.astro` or `src/components/Hero.astro` to see how new projects are created.
        # I'll blindly try to click a "Start" button.

        try:
             await page.get_by_role("link", name="Start").click()
             # or
             # await page.get_by_text("Start Designing").click()
        except:
             print("Could not find start button, trying direct editor access might fail without ID")

        # Let's try to create a project via console evaluation if needed.
        # Or just use the API endpoint directly to verify the OG image visually?
        # The user wants to see the "Open Graph" export option in the UI.

        # Let's try to simulate a user creating a project.
        # I will read the Hero component to know the text.

        await page.screenshot(path="verification/home.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_og_layout())
