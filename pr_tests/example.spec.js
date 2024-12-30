const { test, expect } = require('@playwright/test');

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3003'); // Replace with your app's URL
  await expect(page).toHaveTitle(/React App/); // Adjust the title check as needed
});


test('test', async ({ page }) => {
  await page.goto('http://localhost:3003/');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByPlaceholder('Enter your email').click();
  await page.getByPlaceholder('Enter your email').fill('equalsandy@gmail.com');
  await page.getByPlaceholder('Enter your password').click();
  await page.getByPlaceholder('Enter your password').fill('z^HCndLaQMp5s^sD');
  await page.getByRole('button', { name: 'Log In', exact: true }).click();
  await expect(page.locator('span')).toContainText('equalsandy@gmail.com');
  await page.getByRole('button', { name: 'View All Andys' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('h2')).toContainText('List of Andy Profiles');
});