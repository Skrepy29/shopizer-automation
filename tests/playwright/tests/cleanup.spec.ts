import { test, expect, Page } from '@playwright/test';
import { parseCsvToRows } from '../utils/csv';
import path from 'path';


const valuesCsvPath = path.resolve(__dirname, '../utils/values.csv');
const registerRows = parseCsvToRows(valuesCsvPath);
const successRows = registerRows.filter(r => (r.scenario || 'success').toLowerCase() === 'success');

async function loginViaUI(page: Page, email: string, password: string) {
  await page.goto('/', { waitUntil: 'load' });
  await page.locator('div').filter({ hasText: /^LoginRegister$/ }).first().click();
  await page.getByRole('banner').getByRole('link', { name: 'Login' }).click();
  await page.locator('.login-form-container input[name="username"]').fill(email);
  await page.locator('.login-form-container input[name="loginPassword"]').fill(password);
  await page.locator('.login-btn, .button-box button, button[type="submit"]').first().click({ force: true });
  await page.locator('.header-right-wrap button').first().click();
  await expect(page.locator('.account-dropdown:has-text("My Account"), .account-dropdown:has-text("Welcome")')).toBeVisible();
}

test.describe('Cart cleanup', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  for (const [idx, row] of successRows.entries()) {
    const title = row.testName?.trim() || `Cleanup cart #${idx + 1}`;
    test(title, async ({ page }) => {
      await loginViaUI(page, row.email, row.password);
      await page.goto('/');
      await page.locator('.header-right-wrap').locator('button').nth(1).click();
      await page.getByRole('link', { name: 'View Cart' }).click();
      await page.locator('.cart-clear > button').click();
      await page.goto('/');
      await page.locator('.header-right-wrap button').nth(1).click();
      await expect(page.locator('.shopping-cart-content')).toHaveText('No items added to cart');
    });
  }
});