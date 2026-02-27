from playwright.sync_api import sync_playwright
import time

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to home (Use port 4322)
        page.goto("http://localhost:4322/en")

        # Create a new project
        with open("test_logo.svg", "w") as f:
            f.write('<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="128" fill="blue"/></svg>')

        page.set_input_files('input[type="file"]', "test_logo.svg")
        page.wait_for_url("**/editor?id=*")
        time.sleep(2)

        # 1. Verify Editor Canvas Size
        page.screenshot(path="verification/1_editor_canvas.png")

        # 2. Verify Web Preview Header
        page.get_by_role("button", name="Preview").click()
        time.sleep(1)
        page.screenshot(path="verification/2_web_preview.png")

        # 3. Verify Manifest Preview Dark Mode
        # Use more specific selector for the tab button
        page.get_by_role("button", name="Manifest", exact=True).click()
        time.sleep(1)
        page.screenshot(path="verification/3_manifest_light.png")

        # 4. Verify Sidebar Icons
        page.screenshot(path="verification/4_sidebar_icons.png")

        browser.close()

if __name__ == "__main__":
    verify_changes()
