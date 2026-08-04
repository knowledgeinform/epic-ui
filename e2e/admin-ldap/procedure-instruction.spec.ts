import { test, expect, Page } from "@playwright/test";
import defineConfig from "../../playwright.config";
import { randInt, createProcedure, createInstructionSection } from "../test-utils";

test.describe.serial('Instruction Section', () => {

  const { baseURL } = defineConfig.use;

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL + '/dashboard', { waitUntil: 'load'});
  });


  test('Create New Instruction Section', async ({ page }) => {
    //create procedure for viewing
    const procedureName = 'Playwright procedure test ' + randInt(1, 1000000);
    const description = 'procedure test under dart program';
    const program = 'DART: Double Asteroid Redirection Test';
    const subsystem = '009: Avionics'
    await createProcedure(page, procedureName, description, program, subsystem, false, false, '');

    //navigate to instruction information and unlock the page
    await page.getByTestId('procedure-view-select').locator('div').first().click();
    await page.getByText('Instruction Information').click();
    await page.locator('button').filter({ hasText: 'lock' }).click();

    //create new instruction section
    const sectionTitle = 'Section Title' + randInt(1,1000000);
    await createInstructionSection(page,sectionTitle);
    //Check if new instruction section exists.
    await expect(page.locator("input[ng-reflect-model='" +sectionTitle+ "']")).toHaveValue(sectionTitle);

    await page.reload({waitUntil: "domcontentloaded"});
    await expect(page.locator("input[ng-reflect-model='" +sectionTitle+ "']")).toHaveValue(sectionTitle);
  });

  test('Edit New Instruction Section', async ({ page }) => {
    //create procedure for viewing
    const procedureName = 'Playwright procedure test ' + randInt(1, 1000000);
    const description = 'procedure test under dart program';
    const program = 'DART: Double Asteroid Redirection Test';
    const subsystem = '009: Avionics'
    await createProcedure(page, procedureName, description, program, subsystem, false, false, '');

    //navigate to instruction information and unlock the page
    await page.getByTestId('procedure-view-select').locator('div').first().click();
    await page.getByText('Instruction Information').click();
    await page.locator('button').filter({ hasText: 'lock' }).click();

    //create new instruction section
    const sectionTitle = 'Section Title ' + randInt(1,1000000);
    await createInstructionSection(page,sectionTitle);
    await page.waitForResponse(response => response.url().endsWith('AddSection') && response.status() === 200)
    await page.reload({waitUntil: "domcontentloaded"});
    await page.locator('button').filter({ hasText: 'lock' }).click();

    //Check if new instruction section exists.
    await expect(page.locator("input[ng-reflect-model='" +sectionTitle+ "']")).toHaveValue(sectionTitle);

    //change section title
    const appProcedureInfo = page.locator("input[ng-reflect-model='" +sectionTitle+ "']")
    const newSectionTitle = 'Section Title ' + randInt(1,1000000);
    await appProcedureInfo.fill(newSectionTitle);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.waitForResponse(response => response.url().endsWith('UpdateInstruction') && response.status() === 200)
    await page.reload();
    //check if changed section title has changed.
    await expect(page.locator("input[ng-reflect-model='" +newSectionTitle+ "']")).toHaveValue(newSectionTitle);

  });

  test('Edit Instruction Description', async ({ page }) => {
    //create procedure for viewing
    const procedureName = 'Playwright procedure test ' + randInt(1, 1000000);
    const description = 'procedure test under dart program';
    const program = 'DART: Double Asteroid Redirection Test';
    const subsystem = '009: Avionics'
    await createProcedure(page, procedureName, description, program, subsystem, false, false, '');

    //navigate to instruction information and unlock the page
    await page.getByTestId('procedure-view-select').locator('div').first().click();
    await page.getByText('Instruction Information').click();
    await page.locator('button').filter({ hasText: 'lock' }).click();

    //create new instruction section
    const sectionTitle = 'Section Title ' + randInt(1,1000000);
    await createInstructionSection(page,sectionTitle);
    await page.waitForResponse(response => response.url().endsWith('AddSection') && response.status() === 200)
    await page.reload();
    //Check if new instruction section exists.
    await expect(page.locator("input[ng-reflect-model='" +sectionTitle+ "']")).toHaveValue(sectionTitle);

    //edit description on the page
    await page.locator('button').filter({ hasText: 'lock' }).click();
    const editableDescription = 'Playwright description test ' + randInt(1,1000000);
    (await page.waitForSelector(".note-editable")).fill(editableDescription);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.waitForResponse(response => response.url().endsWith('UpdateInstruction') && response.status() === 200)
    await page.reload();
    //check if it has been successfully saved
    await expect (page.getByText(editableDescription)).toBeTruthy();

  });

  test('Delete Instruction Section', async ({ page }) => {
    //create procedure for viewing
    const procedureName = 'Playwright procedure test ' + randInt(1, 1000000);
    const description = 'procedure test under dart program';
    const program = 'DART: Double Asteroid Redirection Test';
    const subsystem = '009: Avionics'
    await createProcedure(page, procedureName, description, program, subsystem, false, false, '');

    //navigate to instruction information and unlock the page
    await page.getByTestId('procedure-view-select').locator('div').first().click();
    await page.getByText('Instruction Information').click();
    await page.locator('button').filter({ hasText: 'lock' }).click();

    //create new instruction section
    const sectionTitle = 'Section Title ' + randInt(1,1000000);
    await createInstructionSection(page,sectionTitle);
    await page.waitForResponse(response => response.url().endsWith('AddSection') && response.status() === 200);
    await page.reload();

    //delete new instruction section
    await page.locator('button').filter({ hasText: 'lock' }).click();
    await page.getByRole('button', {name: '1. '+sectionTitle.length+'/100'}).getByRole('button').click();
    await page.getByRole('menuitem', {name: 'Delete Section'}).click();
    await page.getByRole('button', {name: 'Yes'}).click();
    await page.getByRole('button', { name: 'CLOSE' }).click();

    //check if instruction is NOT visible.
    await page.reload();
    await expect(page.locator("input[ng-reflect-model='" +sectionTitle+ "']")).toBeHidden();

  });

  test('Cancel creation of Instruction Section', async ({ page }) => {
    //create procedure for viewing
    const procedureName = 'Playwright procedure test ' + randInt(1, 1000000);
    const description = 'procedure test under dart program';
    const program = 'DART: Double Asteroid Redirection Test';
    const subsystem = '009: Avionics'
    await createProcedure(page, procedureName, description, program, subsystem, false, false, '');

    //navigate to instruction information and unlock the page
    await page.getByTestId('procedure-view-select').locator('div').first().click();
    await page.getByText('Instruction Information').click();
    await page.locator('button').filter({ hasText: 'lock' }).click();

    //create new instruction section but cancel
    const sectionTitle = 'Section Title ' + randInt(1,1000000);
    await page.getByLabel('Add new instruction section').click();
    await page.getByLabel('Section Title *').fill(sectionTitle);
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.reload();

    //check if instruction does NOT exist.
    await page.reload();
    await expect(page.locator("input[ng-reflect-model='" +sectionTitle+ "']")).toBeHidden();

  });

  test('Copy Instruction Section', async ({ page }) => {
    //create first procedure
    const procedureName1 = 'Playwright procedure test ' + randInt(1, 1000000);
    const description = 'procedure test under dart program';
    const program = 'DART: Double Asteroid Redirection Test';
    const subsystem = '009: Avionics'
    await createProcedure(page, procedureName1, description, program, subsystem, false, false, '');

    //navigate to instruction information and unlock the page
    await page.getByTestId('procedure-view-select').locator('div').first().click();
    await page.getByText('Instruction Information').click();
    await page.locator('button').filter({ hasText: 'lock' }).click();

    //create instruction section for copying
    const copySectionTitle = 'Section Title ' + randInt(1,1000000);
    await createInstructionSection(page,copySectionTitle);
    await page.waitForResponse(response => response.url().endsWith('AddSection') && response.status() === 200);
    await page.reload();

    //add description for first test
    await page.locator('button').filter({ hasText: 'lock' }).click();
    const editableDescription = 'Playwright description test ' + randInt(1,1000000);
    (await page.waitForSelector(".note-editable")).fill(editableDescription);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    //navigate to dashboard
    await page.goto(baseURL + '/dashboard', { waitUntil: 'load'});

    //create second procedure and navigate to instruction information page
    const procedureName2 = 'Playwright procedure test ' + randInt(1, 1000000);
    await createProcedure(page, procedureName2, description, program, subsystem, false, false, '');
    await page.getByTestId('procedure-view-select').locator('div').first().click();
    await page.getByText('Instruction Information').click();

    //unlock and copy first section
    await page.locator('button').filter({ hasText: 'lock' }).click();
    await page.getByLabel('Copy one or more instruction sections from another procedure').click();
    await page.getByLabel('Search by name, description, or ID').click();
    await page.getByLabel('Search by name, description, or ID').fill(procedureName1);
    await page.getByLabel('Search by name, description, or ID').press('Enter');
    await page.getByText('edit', { exact: true }).click();
    await page.getByText(copySectionTitle).click();
    await page.getByRole('button', { name: 'Clone Instructions' }).click();
    await page.waitForResponse(response => response.url().includes('Clone') && response.status() === 200);
    page.reload();

    //check if the description and title have been successfully copied
    await expect (page.getByText(editableDescription)).toBeTruthy();
    await expect(page.locator("input[ng-reflect-model='" +copySectionTitle+ "']")).toHaveValue(copySectionTitle);

  });

});
