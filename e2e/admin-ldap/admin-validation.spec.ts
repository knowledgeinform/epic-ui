import { test, expect } from "@playwright/test";
import defineConfig from "../../playwright.config";
import { Page } from "@playwright/test";
import { addNewRole, deleteRole, randInt } from "../test-utils";

// The 'serial' attribute means these tests will run in sequential order
test.describe.serial('admin-validation', () => {

    const { baseURL } = defineConfig.use;
    let randRole;

    // Before each test, navigate to the admin page.
    test.beforeEach(async ({ page }) => {
      await page.goto(baseURL + '/admin/1', { waitUntil: 'domcontentloaded'});
      randRole = 'test-role' + randInt(2, 10000);
      await addNewRole(page, randRole);
      await enableValidation(page, randRole);
    });

    test.afterEach(async ({page}) => {
      await page.reload({waitUntil: 'load'})
      await deleteRole(page, randRole);
      await expect(page.getByRole('columnheader', { name: randRole})).not.toBeVisible();
    })

    test('can enable validation', async({ page }) => {
      await page.reload({ waitUntil: 'load'});
      await page.getByRole('columnheader', { name: randRole }).getByRole('button').click();
      await expect(page.getByRole('menuitem', {name: 'Disable Validation'})).toBeVisible();  //check that validation is still enabled after page reload
    })

    test('can disable validation', async({ page}) => {
      await page.getByRole('menuitem', { name: 'Disable Validation' }).click();  //disable validation
      await page.getByRole('columnheader', { name: randRole }).getByRole('button').click();
      await expect(page.getByRole('menuitem', {name: 'Enable Validation'})).toBeVisible();
      await page.reload({ waitUntil: 'load'});  //reload page
      await page.getByRole('columnheader', { name : randRole }).getByRole('button').click();
      await expect(page.getByRole('menuitem', {name: 'Enable Validation'})).toBeVisible();  //check that validation is still disabled after page reload
    });

});

// enable validation
async function enableValidation(page: Page, randRole: string){
  await page.getByRole('columnheader', { name: randRole }).getByRole('button').click();
  await page.getByRole('menuitem', { name: 'Enable Validation' }).click();
  await page.getByRole('columnheader', { name: randRole }).getByRole('button').click();  //check if validation is enabled
  await expect(page.getByRole('menuitem', {name: 'Disable Validation'})).toBeVisible();
}