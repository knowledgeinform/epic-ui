import { test, expect } from "@playwright/test";
import defineConfig from "../../playwright.config";
import {attemptPinChange, userProfileView} from "../test-utils";

test.describe.serial('user profile', () => {
    const { baseURL } = defineConfig.use;

    // Before each test, navigate to the login page.
    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL + '/dashboard', { waitUntil: 'load'});
        //await authenticateUser(page, defineConfig);
    });

    test('can access the user profile', async ({ page }) => { 
        await userProfileView(page);
        await expect(page.url()).toEqual(baseURL + '/profile');
    });

    test('can view profile pin', async ({ page }) => { 
        await userProfileView(page);
        await page.click('#profileViewerButton');
        let userPin = await page.locator('#user-pin-box');
        await expect(userPin).toHaveAttribute('type', 'text');
    });

    test('can change user pin', async ({ page }) => {
        await userProfileView(page); 
        let originalValue:string = await page.inputValue("#user-pin-box");
        await attemptPinChange(page, "123456", "valid");
        await expect(page.locator("#user-pin-box")).toHaveValue("123456");
        await attemptPinChange(page, originalValue, "reset");
        await expect(page.locator("#user-pin-box")).toHaveValue(originalValue);
    });

    test('typing letters into pin change fails', async ({ page }) => {
        await userProfileView(page); 
        await attemptPinChange(page, "123s56", "letters");
        await expect(page.locator('#submit-new-pin-button')).toBeDisabled();
        await expect(page.locator('#new-pin-reenter-box')).toBeDisabled();
        await expect(page.locator("#new-pin-error-id")).toHaveValue('Contains non-numbers - use numbers only.');
    });

    test('typing different into pin change fails', async ({ page }) => {
        await userProfileView(page); 
        await attemptPinChange(page, "923451", "different");
        await expect(page.locator('#submit-new-pin-button')).toBeDisabled();
        await expect(page.locator("#confirm-new-pin-error-id")).toHaveValue('Does not match new pin - re-enter new pin.');
    });

    test('typing a five letter pin fails', async ({ page }) => {
        await userProfileView(page); 
        await attemptPinChange(page, "12356", "short");
        await expect(page.locator('#submit-new-pin-button')).toBeDisabled();
        await expect(page.locator('#new-pin-reenter-box')).toBeDisabled();
        await expect(page.locator("#new-pin-error-id")).toHaveValue('Not enough digits - pins are six digits.');
    });

});