import { chromium } from "@playwright/test";
import defineConfig from "./playwright.config"


export default async function globalTeardown() {
    const { storageState } = defineConfig.use;
    // Launching in Chrominium. The headless attribute means that the browser will open.
    const browser = await chromium.launch();

    // Sets the browswer context to ignore HTTPS errors.
    const context = await browser.newContext({
        ignoreHTTPSErrors: true
    });

    await context.clearCookies();
    await context.storageState({path : storageState as string});
}