import { test, expect, Page } from "@playwright/test";
import defineConfig from "../../playwright.config";
import { randInt, createProcedure } from "../test-utils";

test.describe.serial('procedure', () => {

    const { baseURL } = defineConfig.use;

    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL + '/dashboard', { waitUntil: 'load'});
    });

    test('creation fields are required', async ({ page }) => {
        await page.locator('button').filter({ hasText: 'menu' }).click();
        await page.getByRole('menuitem', { name: 'Procedures' }).click();
        await page.getByRole('menuitem', { name: 'Create Procedure' }).click();
        await expect(page.getByRole('button', { name: 'Create' })).not.toBeVisible();
        await expect(page.getByLabel('Procedure Name *')).toHaveAttribute('required', '');
        await expect(page.getByLabel('Description *')).toHaveAttribute('required', '');
        await expect(page.getByLabel('Program *')).toHaveAttribute('required', '');
        await expect(page.getByLabel('Subsystem *')).toHaveAttribute('required', '');
    });

    test('checkboxes update creation wizard', async ({ page }) => {
        await page.locator('button').filter({ hasText: 'menu' }).click();
        await page.getByRole('menuitem', { name: 'Procedures' }).click();
        await page.getByRole('menuitem', { name: 'Create Procedure' }).click();
        const esdCheckbox = await page.getByText('ESD Class 0', { exact: true })
        await esdCheckbox.click();
        await expect(esdCheckbox).toBeChecked();
        await page.getByText(/Procedure is hazardous/).click();
        await expect(page.getByLabel('Hazard description *')).toBeVisible();
        await expect(page.getByLabel('Hazard description *')).toHaveAttribute('required', '');
    });
    //make sure to add DISPLAYNAME = (your name) into the .env file or it will fail
    test('create procedure', async ({ page }) => {
        // create procedure
        const name = 'Playwright procedure test ' + randInt(1, 1000000);
        const description = 'procedure test under dart program';
        const program = 'DART: Double Asteroid Redirection Test';
        const subsystem = '009: Avionics'
        await createProcedure(page, name, description, program, subsystem, true, true, 'Fuel is hazardous');
        const created = new Date().toLocaleString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});

        // verify we are viewing the procedure's header
        await page.waitForURL(/procedure/);
        await expect(page.url()).toContain(baseURL + '/procedure');
        await expect(page.getByText(/Retrieving Procedure/)).toHaveCount(0);
        await expect(page.getByText('Header')).toBeVisible();

        // verify procedure details fields
        await expect(page.getByLabel('Procedure Name')).toHaveValue(name);
        await expect(page.getByLabel('Procedure Description')).toHaveValue(description);
        await expect(page.getByLabel(/This procedure is part of program/)).toHaveValue(program.split(': ')[1]);
        await expect(page.getByLabel(/This procedure is part of subsystem/)).toHaveValue(subsystem.replace(':', ' -'));
        await expect(page.getByLabel('Author')).toHaveValue(process.env.DISPLAYNAME);
        await expect(page.getByLabel('Revision')).toHaveValue('1');

        // verify procedure status fields
        await expect(page.getByLabel('Status')).toHaveValue('DRAFT');
        await expect(page.getByLabel(/This procedure was created on/)).toHaveValue(new RegExp(created));
        await page.locator('#display-history-button').click();
        const counter = await page.locator('app-generic-comment-history-display').count();
        if (counter == 0) {
            await page.locator('#display-history-button').click();
        }
        await expect(page.locator('app-generic-comment-history-display')).toHaveCount(1);

        // procedure should have no instruction info
        await page.locator('#procedure-section-mat-select').click();
        await page.getByText('Instruction Information').click();
        await expect(page.locator('app-procedureinstructioninfo')).toHaveCount(0);

        // procedure should have no steps
        await page.locator('#procedure-section-mat-select').click();
        await page.getByText('Steps').click();
        await expect(page.locator('app-procedurestepgroups')).toHaveCount(0);

    });

    test('confirm procedure is locked by default', async ({ page }) => {

        //create procedure for viewing
        const name = 'Playwright procedure test ' + randInt(1, 1000000);
        const description = 'procedure test under dart program';
        const program = 'DART: Double Asteroid Redirection Test';
        const subsystem = '009: Avionics'
        await createProcedure(page, name, description, program, subsystem, false, false, '');

        //these fields should all be disabled when locked
        await expect(page.locator('#procedure-author-textbox')).toHaveAttribute('readonly', 'true');
        await expect(page.locator('#procedureHeaderProcedureNameInput')).toHaveAttribute('readonly', 'true');
        await expect(page.locator('#procedureHeaderProcedureDescriptionInput')).toHaveAttribute('readonly', 'true');
        await expect(page.locator('#procedureHeaderIsHazardous')).toHaveAttribute('aria-disabled', 'true');
        await expect(page.locator('#procedureHeaderIsEsd0')).toHaveAttribute('aria-disabled', 'true');
        await expect(page.locator('#procedureHeaderAddReviewers')).toBeHidden();
        await expect(page.locator('#procedureHeaderAddApprovers')).toBeHidden();
        await page.locator('#procedure-section-mat-select').click();
        await page.getByText('Instruction Information').click();
        await expect(page.locator('#instructionInformationAddSection')).toBeHidden();
        await page.locator('#procedure-section-mat-select').click();
        await page.getByText('Steps').click();
        await expect(page.locator('#addGroupButton')).toBeHidden();
        await page.locator('button').filter({ hasText: 'lock' }).click();
        //these fields should all be enabled when unlocked
        await page.locator('#procedure-section-mat-select').click();
        await page.getByText('Header').click();
    });

    test('confirm procedure can be unlocked and locked again', async ({ page }) => {

        //create procedure for viewing
        const name = 'Playwright procedure test ' + randInt(1, 1000000);
        const description = 'procedure test under dart program';
        const program = 'DART: Double Asteroid Redirection Test';
        const subsystem = '009: Avionics'
        await createProcedure(page, name, description, program, subsystem, false, false, '');
        await page.locator('button').filter({ hasText: 'lock' }).click();
        //these fields should all be enabled when unlocked
        await expect(page.locator('#procedureHeaderIsHazardous')).toBeEnabled();
        await expect(page.locator('#procedureHeaderIsEsd0')).toBeEnabled();
        await expect(page.locator('#procedureHeaderProcedureNameInput')).toBeEditable();
        await expect(page.locator('#procedureHeaderProcedureDescriptionInput')).toBeEditable();
        await expect(page.locator('#procedureHeaderAuthorButton')).toBeVisible();
        await expect(page.locator('#procedureHeaderAddReviewers')).toBeVisible();
        await expect(page.locator('#procedureHeaderAddApprovers')).toBeVisible();
        await page.locator('#procedure-section-mat-select').click();
        await page.getByText('Instruction Information').click();
        await expect(page.locator('#instructionInformationAddSection')).toBeVisible();
        await page.locator('#procedure-section-mat-select').click();
        await page.getByText('Steps').click();
        await expect(page.locator('#addGroupButton')).toBeVisible();

        //go back to original page
        await page.locator('#procedure-section-mat-select').click();
        await page.getByText('Header').click();
        //these fields should all be disabled when locked
        await page.locator('button').filter({ hasText: 'lock_open' }).click();
        await expect(page.locator('#procedure-author-textbox')).toHaveAttribute('readonly', 'true');
        await expect(page.locator('#procedureHeaderProcedureNameInput')).toHaveAttribute('readonly', 'true');
        await expect(page.locator('#procedureHeaderProcedureDescriptionInput')).toHaveAttribute('readonly', 'true');
        await expect(page.locator('#procedureHeaderIsHazardous')).toHaveAttribute('aria-disabled', 'true');
        await expect(page.locator('#procedureHeaderIsEsd0')).toHaveAttribute('aria-disabled', 'true');
        await expect(page.locator('#procedureHeaderAddReviewers')).toBeHidden();
        await expect(page.locator('#procedureHeaderAddApprovers')).toBeHidden();
        await page.locator('#procedure-section-mat-select').click();
        await page.getByText('Instruction Information').click();
        await expect(page.locator('#instructionInformationAddSection')).toBeHidden();
        await page.locator('#procedure-section-mat-select').click();
        await page.getByText('Steps').click();
        await expect(page.locator('#addGroupButton')).toBeHidden();
    });


    test('confirm can add and remove Hazardous  Selection', async ({ page }) => {

        //create procedure for viewing
        const name = 'Playwright procedure test ' + randInt(1, 1000000);
        const description = 'procedure test under dart program';
        const program = 'DART: Double Asteroid Redirection Test';
        const subsystem = '009: Avionics'
        await createProcedure(page, name, description, program, subsystem, false, false, '');

        //unlock page and click checkbox and make sure esdo is checked
        await page.locator('button').filter({ hasText: 'lock' }).click();
        await page.locator('#procedureHeaderIsHazardous').click();
        await page.locator('snack-bar-container');
        await expect(page.locator('#procedureHeaderIsHazardous')).toHaveAttribute("aria-checked", "true");
        await expect(page.locator("#hazardous-striped-banner")).toBeVisible();
        await expect(page.locator("#hazardous-striped-banner")).toHaveAttribute("class", "warning-indicator-hazard ng-star-inserted");
        await expect(page.locator("#hazardous-description-box")).toBeVisible();
        //reload and check again
        await page.reload({waitUntil: 'domcontentloaded'});
        await expect(page.locator('#procedureHeaderIsHazardous')).toHaveAttribute("aria-checked", "true");
        await expect(page.locator("#hazardous-striped-banner")).toBeVisible();
        await expect(page.locator("#hazardous-description-box")).toBeVisible();
        await expect(page.locator("#hazardous-striped-banner")).toHaveAttribute("class", "warning-indicator-hazard ng-star-inserted");
        await page.locator('button').filter({ hasText: 'lock' }).click();
        //click and make sure its not checked anymore
        await page.locator('#procedureHeaderIsHazardous').click();
        await page.locator('snack-bar-container');
        await expect(page.locator('#procedureHeaderIsHazardous')).toHaveAttribute("aria-checked", "false");
        await expect(page.locator("#hazardous-striped-banner")).not.toBeVisible();
        await expect(page.locator("#hazardous-description-box")).not.toBeVisible();
        //reload and check again
        await page.reload({waitUntil: 'domcontentloaded'});
        await expect(page.locator('#procedureHeaderIsHazardous')).toHaveAttribute("aria-checked", "false");
        await expect(page.locator("#hazardous-striped-banner")).not.toBeVisible();
        await expect(page.locator("#hazardous-description-box")).not.toBeVisible();
    });

    test('confirm can add and remove EDSO Selection', async ({ page }) => {

        //create procedure for viewing
        const name = 'Playwright procedure test ' + randInt(1, 1000000);
        const description = 'procedure test under dart program';
        const program = 'DART: Double Asteroid Redirection Test';
        const subsystem = '009: Avionics'
        await createProcedure(page, name, description, program, subsystem, false, false, '');

        //unlock page and click checkbox and make sure esdo is checked
        await page.locator('button').filter({ hasText: 'lock' }).click();
        await page.locator('#procedureHeaderIsEsd0').click();
        await expect(page.locator('#procedureHeaderIsEsd0')).toHaveAttribute("aria-checked", "true");
        await expect(page.locator("#hazardous-striped-banner")).toBeVisible();
        await expect(page.locator("#hazardous-striped-banner")).toHaveAttribute("class", "warning-indicator-esd0 ng-star-inserted");
        //reload and check again
        await page.reload({waitUntil: 'domcontentloaded'});
        await expect(page.locator("#hazardous-striped-banner")).toBeVisible();
        await expect(page.locator('#procedureHeaderIsEsd0')).toHaveAttribute("aria-checked", "true");
        await expect(page.locator("#hazardous-striped-banner")).toHaveAttribute("class", "warning-indicator-esd0 ng-star-inserted");
        await page.locator('button').filter({ hasText: 'lock' }).click();
        //click and make sure its not checked anymore
        await page.locator('#procedureHeaderIsEsd0').click();
        await expect(page.locator('#procedureHeaderIsEsd0')).toHaveAttribute("aria-checked", "false");
        await expect(page.locator("#hazardous-striped-banner")).not.toBeVisible();
        //reload and check again
        await page.reload({waitUntil: 'domcontentloaded'});
        await expect(page.locator('#procedureHeaderIsEsd0')).toHaveAttribute("aria-checked", "false");
        await expect(page.locator("#hazardous-striped-banner")).not.toBeVisible();
    });

    test('toggle procedure favoriting on and off', async ({ page }) => {
        //create procedure for viewing
        const name = 'Playwright procedure test ' + randInt(1, 1000000);
        const description = 'procedure test under dart program';
        const program = 'DART: Double Asteroid Redirection Test';
        const subsystem = '009: Avionics'
        await createProcedure(page, name, description, program, subsystem, false, false, '');
  
        //Click favorite button and reload, make sure that the button is Not Favorite.
        await page.getByRole('button', { name: 'Favorite!' }).click();
        await expect (page.getByRole('button', { name: 'Not Favorite' })).toBeVisible();
        await page.reload({waitUntil: 'domcontentloaded', timeout: 5000});
        await expect (page.getByRole('button', { name: 'Not Favorite' })).toBeVisible();
        //Click non-favorite button and reload, make sure button is favorite.
        await page.getByRole('button', { name: 'Not Favorite' }).click();
        await page.reload({waitUntil: 'domcontentloaded'});
        await expect (page.getByRole('button', { name: 'Favorite' })).toBeVisible();
      });

    test('confirm edit the procedure name', async ({ page }) => {
        const randNum = randInt(1,1000000);
        //create procedure for viewing
        const name = 'Playwright procedure test ' + randNum;
        const description = 'procedure test under dart program';
        const program = 'DART: Double Asteroid Redirection Test';
        const subsystem = '009: Avionics'
        await createProcedure(page, name, description, program, subsystem, false, false, '');

        //unlock page and confirm name is editable
        await page.locator('button').filter({ hasText: 'lock' }).click();
        await expect(page.locator('#procedureHeaderProcedureNameInput')).toBeEditable();
        await page.locator('#procedureHeaderProcedureNameInput').fill('testing' + randNum);
        await expect(page.locator('#procedureHeaderProcedureNameInput')).toHaveValue("testing" + randNum);
        await page.getByLabel('Save procedure name').click({timeout: 1000});

        //refresh and check again
        await page.reload();
        await expect(page.locator('#procedureHeaderProcedureNameInput')).toHaveValue("testing" + randNum);
    });

    test('confirm edit the prcedure description', async ({ page }) => {
        const randNum = randInt(1,1000000);
        //create procedure for viewing
        const name = 'Playwright procedure test ' + randNum;
        const description = 'procedure test under dart program';
        const program = 'DART: Double Asteroid Redirection Test';
        const subsystem = '009: Avionics'
        await createProcedure(page, name, description, program, subsystem, false, false, '');

        //unlock page and confirm description is editable
        await page.locator('button').filter({ hasText: 'lock' }).click();
        await expect(page.locator('#procedureHeaderProcedureDescriptionInput')).toBeEditable();
        await page.locator('#procedureHeaderProcedureDescriptionInput').fill("some new description" + randNum);
        await expect(page.locator('#procedureHeaderProcedureDescriptionInput')).toHaveValue("some new description" + randNum);
        await page.getByLabel('Click here to save the procedure description').click({timeout: 1000});

        //refresh and check again
        await page.reload();
        await expect(page.locator('#procedureHeaderProcedureDescriptionInput')).toHaveValue("some new description" + randNum);
    });
});
