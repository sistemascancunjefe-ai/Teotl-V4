from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:3001')
    time.sleep(2)
    page.screenshot(path='screenshot_final.png')

    # Maybe try to click to start audio/wasm
    try:
        page.click("body")
        time.sleep(2)
        page.screenshot(path='screenshot_running.png')
    except Exception as e:
        print(f"Could not click: {e}")

    browser.close()
