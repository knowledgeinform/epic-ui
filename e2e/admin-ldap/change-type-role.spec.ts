import { test, expect } from "@playwright/test";
import defineConfig from "../../playwright.config";
import {addNewChangeType, addNewRole, deleteChangeType, deleteRole, randInt} from "../test-utils";

// The 'serial' attribute means these tests will run in sequential order
test.describe.serial('accept linking/unlinking a type to a role', () => {
  const {baseURL} = defineConfig.use;
  let linkType, newRole;

  // Before each test, navigate to the admin page.
  test.beforeEach(async ({page}) => {
    await page.goto(baseURL + '/admin/1', {waitUntil: 'load'});
    linkType = 'link-type' + randInt(0, 100000);
    newRole = 'new-role' + randInt(0, 100000);
  });

  test.afterEach(async ({page}) => {
    await deleteChangeType(page, linkType);
    await deleteRole(page, newRole);
  })

  test('page can link a type to a role', async ({page}) => {
    // Add a new change type called link-type and a new role called new-role
    await addNewChangeType(page, linkType);
    await addNewRole(page, newRole);
    //Click the role checkbox, setting it to true.
    let checkbox = page.getByRole('cell', { name: 'roleCheckbox' }).last().locator('[id^="mat-checkbox"] label');
    await checkbox.click();
    await checkbox.blur();
    //Check if checkbox is set to true.
    expect(await checkbox.isChecked()).toBeTruthy();
    await page.reload({waitUntil: 'domcontentloaded'});
    checkbox = page.getByRole('cell', { name: 'roleCheckbox' }).last().locator('[id^="mat-checkbox"] label');
    //Check if checkbox is set to true.
    expect(await checkbox.isChecked()).toBeTruthy();
  });

  test('page can unlink a type to a role', async ({page}) => {
    // Add a new change type called link-type
    await addNewChangeType(page, linkType)
    await addNewRole(page, newRole)
    //Click the role checkbox twice, setting it from true to false.
    let checkbox = page.getByRole('cell', { name: 'roleCheckbox' }).last().locator('[id^="mat-checkbox"] label');
    await checkbox.click();
    expect(await checkbox.isChecked()).toBeTruthy();
    await page.reload();
    checkbox = page.getByRole('cell', { name: 'roleCheckbox' }).last().locator('[id^="mat-checkbox"] label');
    await checkbox.click();
    expect(await checkbox.isChecked()).toBeFalsy();
    await page.reload();
    //Check if checkbox is set to false.
    checkbox = page.getByRole('cell', { name: 'roleCheckbox' }).last().locator('[id^="mat-checkbox"] label');
    expect(await checkbox.isChecked()).toBeFalsy();
  });

});
