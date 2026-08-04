import { test, expect } from "@playwright/test";
import defineConfig from "../../playwright.config";
import { authenticateAdmin, logoutUser} from "../test-utils";

// The 'serial' attribute means these tests will run in sequential order
test.describe.serial('login', () => {

    const { baseURL } = defineConfig.use;

    // Before each test, navigate to the login page.
    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL + '/login', { waitUntil: 'load'});
    });
    
    // Test that the page title is as expected.
    test('has title', async ({ page }) => {
        await expect(page).toHaveTitle(/EPIC/);
    });
    test('can log in with correct credentials', async ({ page }) => {
        await authenticateAdmin(page, defineConfig);
        await expect(page.url()).toEqual(baseURL + '/dashboard');
    });
    

    // assert that cannot log in without credentials.
    test('cannot login with empty credentials', async ({ page }) => {
        const button = await page.getByRole('button', { name: 'Log In' });
        await expect(button).toBeDisabled();
    });

    test('cannot login with non-existent username', async ({ page }) => {
        await page.getByLabel('Username').fill('user34');
        await page.getByLabel('Password').fill('test');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByText('Username or Password is incorrect')).toBeVisible();
    });

    test('cannot login with wrong password', async ({ page }) => {
        await page.getByLabel('Username').fill(process.env.USERNAME);
        await page.getByLabel('Password').fill('test');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByText('Username or Password is incorrect')).toBeVisible();
    });


});

test.describe.serial('logout', () => {
    const { baseURL } = defineConfig.use;


    test('can logout correctly', async ({ page }) => { 
        await page.goto(baseURL + '/dashboard', { waitUntil: 'load'});
        await logoutUser(page);
        await expect(page.url()).toEqual(baseURL + '/login');
        await authenticateAdmin(page, defineConfig);
    });

});
