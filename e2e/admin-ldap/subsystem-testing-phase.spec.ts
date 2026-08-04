import { test, expect } from "@playwright/test";
import defineConfig from "../../playwright.config";
import {randInt} from "../test-utils";

// The 'serial' attribute means these tests will run in sequential order
test.describe.serial('susbsytsem and testing phase', () => {

    const { baseURL } = defineConfig.use;

    // Before each test, navigate to the login page.
    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL + '/admin/0', { waitUntil: 'load'});
    });


    //test that user can create program successfully
    test('can create program successfully', async ({ page }) => { 
        await page.getByRole('button', { name: 'Subsystem' }).click();

        //create random generated test name
        const randomNum = randInt(1, 1000000);
        const subsystemTestName = "playwright-test-subsystem" + randomNum;

        //fill in subsystem info
        await page.getByRole('textbox', { name: 'Name', exact: true }).fill(subsystemTestName);
        await page.getByRole('textbox', { name: 'Short Name' }).click();
        await page.getByRole('textbox', { name: 'Short Name' }).fill('test123' + randomNum);
        await page.getByRole('textbox', { name: 'Code' }).click();
        await page.getByRole('textbox', { name: 'Code' }).fill(randomNum.toString());
        await page.getByRole('button', { name: 'Submit' }).click();
        
        //wait for it to add and then check that it was added properly
        await page.getByText("Added!");
        await page.locator('#main-menu-nav-button').click();
        await page.click('#navMenuReporting');
        await expect(page.url()).toEqual(baseURL + '/reporting');
        await page.locator('app-reporting-container div').filter({ hasText: 'Select a Report *' }).nth(4).click();
        await page.getByText('Procedure Status').click();
        await page.getByLabel('Select Subsystem').locator('span').click();
        //successful if it finds this on page
        await page.getByText(randomNum + " - " + subsystemTestName).click();
    });

        //testing phase can be created correctly
        test('can create testing phase', async ({ page }) => {
            await page.getByRole('button', { name: 'Testing Phase' }).click();

            //create random generated test name
            const randomNum = randInt(1, 1000000);
            const testingPhaseName = "playwright-test-subsystem" + randomNum;

            //fill in testing phase info
            await page.getByRole('textbox', { name: 'Name', exact: true }).click();
            await page.getByRole('textbox', { name: 'Name', exact: true }).fill(testingPhaseName);
            await page.getByRole('textbox', { name: 'Short Name' }).click();
            await page.getByRole('textbox', { name: 'Short Name' }).fill('testing123' + randomNum);
            await page.getByRole('textbox', { name: 'Code' }).click();
            await page.getByRole('textbox', { name: 'Code' }).fill(randomNum.toString());
            await page.getByRole('button', { name: 'Submit' }).click();

            //wait for it to add and then check that it was added properly
            await page.getByText("Added!");
            await page.click('#main-menu-nav-button');
            await page.click('#navMenuReporting');
            await page.getByLabel('Select a Report *').locator('span').click();
            await page.getByText('Run Status').click();
            await page.getByLabel('Select Testing Phase').locator('span').click();
            await page.getByText(randomNum + " - " + testingPhaseName).click();
        });


});