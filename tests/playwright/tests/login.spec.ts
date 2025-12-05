import { test, expect, Page } from '@playwright/test';
import { parseCsvToRows } from '../utils/csv';
import path from 'path';

const valuesCsvPath = path.resolve(__dirname, '../utils/values.csv');
const registerRows = parseCsvToRows(valuesCsvPath);
const successRows = registerRows.filter(r => (r.scenario || 'success').toLowerCase() === 'success');
const failRows = registerRows.filter(r => (r.scenario || '').toLowerCase() === 'fail');

async function openLoginPage(page: Page) {
  await page.goto('/', { waitUntil: 'load' });
  await page.locator('div').filter({ hasText: /^LoginRegister$/ }).first().click();
  await page.getByRole('banner').getByRole('link', { name: 'Login' }).click();
}

async function doLogin(page: Page, row: any) {
  await page.goto('/login');
  await page.locator('.login-form-container input[name="username"]').fill(row.email || '');
  await page.locator('.login-form-container input[name="loginPassword"]').fill(row.password || '');
  await page.locator('.login-btn, .button-box button, button[type="submit"]').first().click({ force: true });
}

async function checkLoginSuccess(page: Page) {
  const message = page.locator('.react-toast-notifications__container');
  await expect(message).toContainText('You have successfully logged in to this website');
  await page.locator('.header-right-wrap button').first().click();
  await expect(page.locator('.account-dropdown')).toBeVisible();
}

async function checkLoginFail(page: Page) {
  const message = page.locator('.react-toast-notifications__container');
  await expect(message).toContainText('Incorrect username or password');
}

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test.describe('Successful logins', () => {
    for (const [idx, row] of successRows.entries()) {
      const name = row.testName?.trim() || `Login success #${idx + 1}`;
      test(name, async ({ page }) => {
        await openLoginPage(page);
        await doLogin(page, row);
        await checkLoginSuccess(page);
      });
    }
  });

  test.describe('Failing logins', () => {
    for (const [idx, row] of failRows.entries()) {
      const name = row.testName?.trim() || `Login fail #${idx + 1}`;
      test(name, async ({ page }) => {
        await openLoginPage(page);
        await doLogin(page, row);
        await checkLoginFail(page);
      });
    }
  });
});