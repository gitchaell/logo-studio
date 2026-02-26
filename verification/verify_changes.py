from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Check both languages
        for lang in ['en', 'es']:
            print(f"\n--- Testing Language: {lang} ---")
            context = browser.new_context()
            page = context.new_page()

            # 1. Navigate to Dashboard
            dashboard_url = f"http://localhost:4321/{lang}"
            print(f"Navigating to dashboard: {dashboard_url}")
            page.goto(dashboard_url)

            # Verify Sidebar exists but has NO back button
            sidebar_back_btn = page.locator("nav").locator("header").locator("a:has(svg.lucide-arrow-left)")
            if sidebar_back_btn.count() > 0 and sidebar_back_btn.first.is_visible():
                 print("WARNING: Sidebar Back Button FOUND (Should be removed).")
            else:
                 print("Sidebar Back Button NOT found (Correct).")

            # 2. Upload SVG to create project
            print("Uploading SVG...")
            svg_path = os.path.abspath("verification/test.svg")
            if not os.path.exists(svg_path):
                with open(svg_path, "w") as f:
                    f.write('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" /></svg>')

            page.set_input_files("input[type='file']", svg_path)

            # 3. Wait for Editor Load
            try:
                page.wait_for_url(f"**/{lang}/editor?id=*", timeout=15000)
                print(f"Navigated to editor: {page.url}")

                # Check for Edit/Preview toggle (robust selector)
                page.wait_for_selector("button:has-text('Edit')", timeout=10000)
                print("Editor content loaded.")

                # 4. Check Editor Header Back Button
                # Should be in the top header of the main content area
                back_btn_selector = f"main > header a[href='/{lang}']"
                editor_back_btn = page.locator(back_btn_selector)

                if editor_back_btn.count() > 0:
                    print(f"Editor Header Back Button FOUND with selector: {back_btn_selector}")
                    # Print href
                    print(f"Back button href: {editor_back_btn.get_attribute('href')}")

                    # 5. Check Navigation Logic (Click Back)
                    print("Clicking back button...")
                    editor_back_btn.click(force=True)

                    # Wait for URL change
                    try:
                        page.wait_for_url(f"http://localhost:4321/{lang}", timeout=10000)
                        print("Back button correctly returned to Dashboard.")
                    except Exception as e:
                        print(f"ERROR: Navigation failed. Current URL: {page.url}")
                        # Check if we are still on editor
                        if "/editor" in page.url:
                            print("Still on editor page.")
                else:
                    print("ERROR: Editor Header Back Button NOT found.")
                    # Try finding ANY link with ArrowLeft
                    any_arrow_link = page.locator("main > header a:has(svg.lucide-arrow-left)")
                    if any_arrow_link.count() > 0:
                        print(f"Found a back button but href might be wrong. Href: {any_arrow_link.get_attribute('href')}")

                    page.screenshot(path=f"verification/error_no_back_btn_{lang}.png")


                # Re-enter editor for feature checks (using the project list link)
                # Find the project we just added. It should be the last one.
                # The sidebar project list links: a[href^='/{lang}/editor?id=']
                print("Re-entering editor via Sidebar...")
                page.goto(f"http://localhost:4321/{lang}") # Ensure we are at dashboard

                # Wait for projects to load (indexeddb might take a sec)
                page.wait_for_timeout(2000)

                # Click the first project link
                project_link = page.locator(f"a[href*='/{lang}/editor?id=']").first
                if project_link.count() > 0:
                    project_link.click()
                    page.wait_for_url(f"**/{lang}/editor?id=*", timeout=10000)
                    print("Sidebar project navigation working.")
                else:
                    print("ERROR: No project links found in Sidebar.")
                    continue

                # 6. Feature Verification (Exports, Social, etc.)
                # Verify Exports Tab
                print("Checking Exports tab...")
                page.click("text=Preview") # Switch to Preview mode
                page.wait_for_timeout(1000)

                # Find 'Exports' tab button.
                if page.locator("button:has-text('Exports')").count() > 0:
                     page.click("button:has-text('Exports')")
                     page.wait_for_timeout(1000)

                     if page.locator("text=Select All").count() > 0:
                         print("feature: Select All button visible.")
                     else:
                         print("ERROR: Select All button not found.")

                     if page.locator("text=favicon.ico").count() > 0:
                         print("feature: favicon.ico visible.")

                else:
                     print("ERROR: Exports tab not found.")

            except Exception as e:
                print(f"Error during {lang} test:", e)
                import traceback
                traceback.print_exc()
                page.screenshot(path=f"verification/error_{lang}.png")

            context.close()

        browser.close()

if __name__ == "__main__":
    run()
