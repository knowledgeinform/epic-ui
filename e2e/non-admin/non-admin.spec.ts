import { test, expect } from "@playwright/test";
import defineConfig from "../../playwright.config";
import { authenticateUser } from "../test-utils";

// Note: before running this test, turn off LDAP in the WS /docker/config/ldap.properties file
test.describe.serial('non-admin ldap off', () => {

    const { baseURL } = defineConfig.use;

    // Before each test, navigate to the admin page.
    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL + '/login', { waitUntil: 'load'});
        await authenticateUser(page, defineConfig, 'user1', 'password')
    });

    test('cannot navigate directly', async ({ page }) => {
        await page.goto(baseURL + '/admin', { waitUntil: 'load'});
        await page.waitForURL(baseURL + '/dashboard');
        await expect(page.url()).toEqual(baseURL + '/dashboard');
    });

    test('cannot navigate via menu', async ({ page }) => {
        await page.locator('button').filter({ hasText: 'menu' }).click();
        await expect(page.getByRole('menuitem', { name: 'Admin' })).not.toBeVisible();
    });
});
