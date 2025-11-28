import { test, expect } from '@playwright/test';
import { parseCsvToRows } from '../utils/csv';
import path from 'path';


const valuesCsvPath = path.resolve(__dirname, '../utils/values.csv');
const registerRows = parseCsvToRows(valuesCsvPath);
const successRows = registerRows.filter(r => (r.scenario || 'success').toLowerCase() === 'success');

async function loginViaUI(page, email: string, password: string) {
  await page.goto('/', { waitUntil: 'load' });
  await page.locator('div').filter({ hasText: /^LoginRegister$/ }).first().click();
  await page.getByRole('banner').getByRole('link', { name: 'Login' }).click();
  await page.locator('.login-form-container input[name="username"]').fill(email);
  await page.locator('.login-form-container input[name="loginPassword"]').fill(password);
  await page.locator('.login-btn, .button-box button, button[type="submit"]').first().click({ force: true });
  await page.locator('.header-right-wrap button').first().click();
  const dropdown = page.locator('.account-dropdown:has-text("My Account"), .account-dropdown:has-text("Welcome")');
  await expect(dropdown).toBeVisible();
}

test.describe('My Account', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });
  for (const [idx, row] of successRows.entries()) {
    const name = row.testName?.trim() || `My account #${idx + 1}`;
    test(name, async ({ page }) => {
      await loginViaUI(page, row.email, row.password);
      await expect(page.locator('.accordion')).toContainText('Your account');
    });
  }
});