import { test, expect } from "@playwright/test";
import defineConfig from "../../playwright.config";
import {randInt} from "../test-utils";

// The 'serial' attribute means these tests will run in sequential order
test.describe.serial('program', () => {

    const { baseURL } = defineConfig.use;

    // Before each test, navigate to the login page.
    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL + '/dashboard', { waitUntil: 'load'});
    });

    //test that user can navigate to program feature
    test('can navigate to program feature', async ({ page }) => { 
        await page.click('#main-menu-nav-button');
        await page.click('#navMenuPrograms');
        await expect(page.url()).toEqual(baseURL + '/programs');
    });

    //test that user can create program successfully
    test('can create program successfully', async ({ page }) => { 
        await page.click('#main-menu-nav-button');
        await page.click('#navMenuPrograms');
        await expect(page.url()).toEqual(baseURL + '/programs');
        await page.click('#mat-create-program-button');
        await page.getByLabel('Name *').click();
        const randomNum = randInt(1, 1000000);
        const programTestName = "playwright-test-create" + randomNum;
        await page.getByLabel('Name *').fill(programTestName);
        await page.getByLabel('Code *').fill(randomNum.toString());
        await page.getByRole('button', { name: 'Submit' }).click();
        const heading:string = randomNum + ": " + programTestName;
        await page.getByRole('heading', { name: heading }).click();
        const expectedURlBase = '/programs/' + randomNum;
        await expect(page.url()).toEqual(baseURL + expectedURlBase + '/0');
        await page.getByText('Roles & Change Types').click();
        await expect(page.url()).toEqual(baseURL + expectedURlBase + '/1');
    });

        //test that user can create program successfully from admin menu
        test('can create program from admin menu', async ({ page }) => { 
            await page.click('#main-menu-nav-button');
            await page.click('#navMenuAdmin');
            await expect(page.url()).toEqual(baseURL + '/admin/0');
            await page.getByRole('button', { name: 'Program' }).click();
            await page.getByRole('textbox', { name: 'Name' }).click();
            const randomNum = randInt(1, 1000000);
            const programTestName = "playwright-test-create-admin" + randomNum;
            await page.getByRole('textbox', { name: 'Name' }).fill(programTestName);
            await page.getByRole('textbox', { name: 'Code' }).click();
            await page.getByRole('textbox', { name: 'Code' }).fill(randomNum.toString());
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.click('#main-menu-nav-button');
            await page.click('#navMenuPrograms');
            const heading:string = randomNum + ": " + programTestName;
            await page.getByRole('heading', { name: heading }).click();
            const expectedURlBase = '/programs/' + randomNum;
            await expect(page.url()).toEqual(baseURL + expectedURlBase + '/0');
            await page.getByText('Roles & Change Types').click();
            await expect(page.url()).toEqual(baseURL + expectedURlBase + '/1');
        });


});