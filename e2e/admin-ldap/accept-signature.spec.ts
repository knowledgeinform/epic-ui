import { test, expect } from "@playwright/test";
import defineConfig from "../../playwright.config";
import {addNewChangeType, deleteChangeType, randInt} from "../test-utils";

// The 'serial' attribute means these tests will run in sequential order
test.describe.serial('accept signatures', () => {
    const { baseURL } = defineConfig.use;

    // Before each test, navigate to the login page.
    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL + '/admin/1', { waitUntil: 'load'});
    });

    // accept signature toggles on as expected
    test('page can toggle on signature', async ({ page }) => {
      const randomNum = randInt(1, 100000);
      const testString = 'test-change-signature' + randomNum;
      // Add a new change type called test-change-signature
      await addNewChangeType(page, testString);
      // Click the last (latest) item in the "Enabled" column, by default the enabled value is False.
      const enabledToggle = page.getByRole('cell', {name: 'acceptsAllSignaturesToggle'}).nth(-1).locator('[id^="mat-slide-toggle"] label')
      await enabledToggle.click();
      await page.reload();
      // Check if True
      expect(await enabledToggle.isChecked()).toBeTruthy();
      //Delete the change type
      await deleteChangeType(page, testString);
    });
    // accept signature toggles off as expected
    test('page can toggle off signature', async ({ page }) => {
      const randomNum = randInt(1, 100000);
      const testString = 'test-change-signature' + randomNum;
      // Add a new change type called test-change-signature
      await addNewChangeType(page, testString)
      // Click the last (latest) item in the "Enabled" column, by default the enabled value is False.
      const enabledToggle = page.getByRole('cell', {name: 'acceptsAllSignaturesToggle'}).nth(-1).locator('[id^="mat-slide-toggle"] label')
      await enabledToggle.click();
      await page.reload();
      // Click again
      await enabledToggle.click();
      await page.reload();
      //Check If False
      expect(await enabledToggle.isChecked()).toBeFalsy();
      //Delete the change type
      await deleteChangeType(page, testString);
    });

});
