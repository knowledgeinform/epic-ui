import { test, expect } from "@playwright/test";

import defineConfig from "../../playwright.config";
import {addNewChangeType, deleteChangeType, randInt} from "../test-utils";

// The 'serial' attribute means these tests will run in sequential order
test.describe.serial('accept toggle changes', () => {
    const {baseURL} = defineConfig.use;

    // Before each test, navigate to the admin page.
    test.beforeEach(async ({page}) => {
      await page.goto(baseURL + '/admin/1', {waitUntil: 'load'});
    });

    test('page can toggle on enable', async ({page}) => {
      const randomNum = randInt(1, 100000);
      const testString = 'test-change-enable' + randomNum;
      // Add a new change type called test-change-enable
      await addNewChangeType(page, testString);
      // Click the last (latest) item in the "Enabled" column, by default the enabled value is True.
      const enabledToggle = page.getByRole('cell', {name: 'isEnabledToggle'}).nth(-1).locator('[id^="mat-slide-toggle"] label')
      //Click twice, and check if True.
      await enabledToggle.click();
      await page.reload();
      await enabledToggle.click();
      await page.reload();
      expect(await enabledToggle.isChecked()).toBeTruthy();
      //Delete the change type
      await deleteChangeType(page, testString);
    });

    test('page can toggle off enable', async ({page}) => {
      const randomNum = randInt(1, 100000);
      const testString = 'test-change-enable' + randomNum;
      // Add a new change type called test-change-enable
      await addNewChangeType(page, testString);
      // Click the last (latest) item in the "Enabled" column, by default the enabled value is True.
      const enabledToggle = page.getByRole('cell', {name: 'isEnabledToggle'}).nth(-1).locator('[id^="mat-slide-toggle"] label')
      await enabledToggle.click();
      await page.reload();
      // Check if False
      expect(await enabledToggle.isChecked()).toBeFalsy();
      //Delete the change type
      await deleteChangeType(page, testString);
    });

});
