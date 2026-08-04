import { test, expect } from "@playwright/test";
import defineConfig from "../../playwright.config";
import { randInt } from "../test-utils";

// The 'serial' attribute means these tests will run in sequential order
test.describe.serial('admin-change-role', () => {

    const { baseURL } = defineConfig.use;

    // Before each test, navigate to the admin page.
    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL + '/admin/1', { waitUntil: 'load'});
    });

    // Test that you can add change type of role
    test('can add type', async ({ page }) => {
        const randomNum = randInt(1, 100000);
        const testString = 'test-change-type' + randomNum;
        page.on('dialog', async dialog => {
            await dialog.accept(testString);
        });
        await page.click('#add-change-type-button');
        await expect(page.getByRole('cell', {name:testString})).not.toBeEmpty();
        await page.getByRole('row', {name: testString}).getByRole('button').click();
    });

    // Test that you can delete change type of role
    test('can delete type', async ({ page }) => {
        const randomNum = randInt(1, 100000);
        const testString = 'test-change-type' + randomNum;
        page.on('dialog', async dialog => {
            await dialog.accept(testString);
        });
        await page.click('#add-change-type-button');
        await expect(page.getByRole('cell', {name:testString})).not.toBeEmpty();
        await page.getByRole('row', {name: testString}).getByRole('button').click();
        expect(await page.locator(testString).count()).toEqual(0);
    });
    
    // Test that you can add a role
    test('can add role', async ({ page }) => {
        const randomNum = randInt(1, 100000);
        const testString = 'test-change-type' + randomNum;
        page.on('dialog', async dialog => {
          await dialog.accept(testString);
        });
        await page.getByRole('button', { name: 'Add Role' }).click();
        await expect(page.getByRole('columnheader', {name: testString})).not.toBeEmpty();
        await page.getByRole('columnheader', { name: testString }).getByRole('button').click();
        await page.getByRole('menuitem', { name: 'Delete' }).click();
      });

    // Test that you can remove a role
    test('can remove role', async ({ page }) => {
        const randomNum = randInt(1, 100000);
        const testString = 'test-change-type' + randomNum;
        page.on('dialog', async dialog => {
          await dialog.accept(testString);
        });
        await page.getByRole('button', { name: 'Add Role' }).click();
        await page.getByRole('columnheader', { name: testString }).getByRole('button').click();
        await page.getByRole('menuitem', { name: 'Delete' }).click();
        expect(await page.locator(testString).count()).toEqual(0);
      });
});