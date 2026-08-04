import { Page } from "@playwright/test";

/**
 * Function for authenticating the user and storing cookies/session state.
 * @param page
 * @param config
 */
export async function authenticateUser(page: Page, config, username: string, password: string) {
  // Get the environment variables from .env file.
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForURL('http://localhost:4200/EPIC/dashboard', { waitUntil: 'domcontentloaded' });
  // save the session state to the state.json file (or file defined in the playwright.config use.storageState variable)
  await page.context().storageState({ path: config.use.storageState as string });
}
/**
 * Function for loging out the user after logged in.
 * @param page
 */

export async function logoutUser(page:Page) {
  await page.click('#main-menu-nav-button');
  await page.click('#nav-menu-logout');
  await page.waitForURL('http://localhost:4200/EPIC/login', { waitUntil: 'domcontentloaded' });
}

/**
 * Function for navigating to user profile and viewing it.
 * @param page
 */

export async function userProfileView(page:Page) {
  await page.click('#main-menu-nav-button');
  await page.click('#nav-menu-profile');
  await page.waitForURL('http://localhost:4200/EPIC/profile', { waitUntil: 'domcontentloaded' });
}

/**
 * Function for attempting to change the users pin.
 * @param page
 * @param newPin - the pin you wish to change it to
 * @param attempt - the type of attempt you are testing
 */
export async function attemptPinChange(page:Page, newPin:string, attempt:string) {
  await page.click('#change-the-pin-button');
  const pin:string = await page.inputValue("#user-pin-box");
  await page.type('#current-pin-id', pin);
  await page.type('#new-pin-enter-box', newPin);
  if (attempt == 'valid' || attempt == "reset") {
    await page.type('#new-pin-reenter-box', newPin);
    await page.click("#submit-new-pin-button");
  } else if (attempt == "different") {
    await page.type('#new-pin-reenter-box', "867530");
  }
}

export async function authenticateAdmin(page: Page, config) {
  await authenticateUser(page, config, process.env.USERNAME, process.env.PASSWORD);
}

export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Function for adding a new Change Type on the Admin Page.
 * @param page
 * @param typeName - name of the new Change Type.
 */
export async function addNewChangeType(page:Page, typeName:string){
  page.once('dialog', async (dialog) => {
    await dialog.accept(typeName);
  });
  await page.click('#add-change-type-button');
}
/**
 * Function for deleting a Change Type.
 * @param page
 * @param typeName - name of the Change Type that will be deleted.
 */
export async function deleteChangeType(page:Page, typeName:string){
  await page.getByRole('cell', { name: typeName }).getByRole('button').click();
}

/**
 * Function for adding a new Role on the Admin Page.
 * @param page
 * @param typeName - name of the new Role.
 */
export async function addNewRole(page:Page, typeName:string){
  page.once('dialog', async (dialog) => {
    await dialog.accept(typeName);
  });
  await page.click('#add-role-button');
}

/**
 * Function for deleting a new Role on the Admin Page.
 * @param page
 * @param typeName - name of the new Role.
 */
export async function deleteRole(page:Page, typeName:string){
  await page.getByRole('columnheader', { name: typeName }).getByRole('button').click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
}

/**
 * Function for creating a new blank procedure.
 * @param page
 * @param title
 * @param description
 * @param program
 * @param subsystem
 * @param esd
 * @param hazardous
 * @param hazard_description
 */
export async function createProcedure(page: Page, title: string, description: string, program: string,
                                      subsystem: string, esd: boolean, hazardous: boolean, hazard_description: string='') {
  await page.locator('button').filter({ hasText: 'menu' }).click();
  await page.getByRole('menuitem', { name: 'Procedures' }).click();
  await page.getByRole('menuitem', { name: 'Create Procedure' }).click();
  await page.getByLabel('Procedure Name *').fill(title);
  await page.getByLabel('Description *').fill(description);
  await page.getByLabel('Program *').getByText('Program').click();
  await page.getByText(program).click();
  await page.getByLabel('Subsystem *').getByText('Subsystem').click();
  await page.getByText(subsystem).click();
  if (esd) {
    await page.getByText('ESD Class 0', { exact: true }).click();
  }
  if (hazardous) {
    await page.getByText(/Procedure is hazardous/).click();
    await page.getByLabel('Hazard description *').fill(hazard_description);
  }
  await page.getByRole('button', { name: 'Create' }).click();
}

/**
 * Function to create a new section
 * @param page
 * @param sectionTitle - title of the section
 */
export async function createInstructionSection(page:Page, sectionTitle:string){
  await page.getByLabel('Add new instruction section').click();
  await page.getByLabel('Section Title *').fill(sectionTitle)
  await page.getByRole('button', { name: 'Save' }).click();
}
