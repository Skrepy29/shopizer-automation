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

async function assertCartPageHas(page: Page, name: string) {
  await expect(page.locator('tbody')).toContainText(name);
}

test.describe(' Check Cart Items', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  for (const [idx, row] of successRows.entries()) {
    const title = row.testName?.trim() || `Check cart items #${idx + 1}`;
    test(title, async ({ page }) => {
      await loginViaUI(page, row.email, row.password);
      const qty = Number(row.quantity) || 1;
      await page.goto('/');
      await page.locator('.header-right-wrap').locator('button').nth(1).click();
      await page.getByRole('link', { name: 'View Cart' }).click();
      await assertCartPageHas(page, row.table);
      await assertCartPageHas(page, row.chair);
    });
  }
});