import { test, expect } from "@playwright/test";
import defineConfig from "../../playwright.config";
import { randInt } from "../test-utils";

// The 'serial' attribute means these tests will run in sequential order
test.describe.serial('admin', () => {

    const { baseURL } = defineConfig.use;

    // Before each test, navigate to the admin page.
    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL + '/admin', { waitUntil: 'load'});
    });

    test.afterEach(async ({ page }, testInfo) => {
        if (testInfo.title === 'can edit user information') {
            // reset 521 so test can be repeated
            await page.getByRole('textbox', { name: '521' }).fill('user1');
            await page.getByRole('textbox', { name: 'Email' }).fill('user1@jhuapl.edu');
            await page.getByRole('button', { name: 'Submit' }).click();
        }
    });

    test('can navigate via menu', async ({ page }) => {
        await page.goto(baseURL + '/dashboard', { waitUntil: 'load'});
        await page.locator('button').filter({ hasText: 'menu' }).click();
        await page.getByRole('menuitem', { name: 'Admin' }).click();
        await expect(page.url()).toEqual(baseURL + '/admin/0');
    });

    // creates a new user and searches for it to make sure it exsits
    test('can add a new user', async ({ page }) => {
        const rand521 = 'create' + randInt(2, 10000)
        await page.getByTestId('create-user').click();
        await page.getByRole('textbox', { name: 'Display Name' }).fill('test ' + rand521);
        await page.getByRole('textbox', { name: '521' }).fill(rand521);
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.getByTestId('create-user').click(); // close create user panel
        await page.getByTestId('edit-user').click();
        await page.getByRole('combobox', { name: '521 Search' }).fill(rand521);
        await expect(page.getByRole('textbox', { name: '521' })).toHaveValue(rand521);
    });

    // edits an existing user's 521 and searches for it to make sure it updates
    test('can edit user information', async ({ page }) => {
        await page.getByTestId('edit-user').click();
        await page.getByRole('combobox', { name: '521 Search' }).fill('user1');
        await page.getByRole('textbox', { name: '521' }).fill('edit test');
        await page.getByRole('textbox', { name: 'Email' }).fill('edit test@jhuapl.edu');
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.getByRole('combobox', { name: '521 Search' }).fill('edit test');
        await expect(page.getByRole('textbox', { name: '521' })).toHaveValue('edit test');
    });
});
