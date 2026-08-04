import { chromium } from "@playwright/test";
import { authenticateAdmin } from "./e2e/test-utils";
import defineConfig from "./playwright.config"

export default async function globalSetup() {
    const { baseURL } = defineConfig.use;

    // Launching in Chrominium.
    const browser = await chromium.launch({headless: false});

    // Sets the browser context to ignore HTTPS errors.
    const context = await browser.newContext({
        ignoreHTTPSErrors: true
    });

    // Get the page, navigate to the base URL.
    const page = await context.newPage();
    await page.goto(baseURL, {waitUntil: 'load'});

    // Call authentication
    await authenticateAdmin(page, defineConfig);
}