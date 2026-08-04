import { test, expect } from "@playwright/test";
import defineConfig from "../../playwright.config";

// The 'serial' attribute means these tests will run in sequential order
test.describe.serial('test non-admin programs view', () => {
  const {baseURL} = defineConfig.use;

  test('Create Program Button should not be visible to non-admin', async ({page}) => {
    await page.goto(baseURL + '/programs/', {waitUntil: 'load'});
    await expect(page.getByRole('button', { name: 'Create Program' })).not.toBeVisible()
  });

});
