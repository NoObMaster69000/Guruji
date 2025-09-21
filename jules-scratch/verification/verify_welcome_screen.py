from playwright.sync_api import sync_playwright, Page, expect

def verify_welcome_screen(page: Page):
    """
    This script verifies that the welcome screen is displayed correctly.
    """
    # 1. Navigate to the frontend URL.
    page.goto("http://localhost:3000")

    # 2. Log in.
    login_button = page.get_by_role("button", name="Log In")
    expect(login_button).to_be_visible()
    login_button.click()

    # 3. Wait for the welcome screen to be visible.
    welcome_heading = page.get_by_role("heading", name=/Good (morning|afternoon|evening), Abhinav/)
    expect(welcome_heading).to_be_visible()

    # 4. Take a screenshot.
    page.screenshot(path="jules-scratch/verification/verification.png")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    verify_welcome_screen(page)
    browser.close()
