import { test, expect } from '@playwright/test';
import { parseCsvToRows } from '../utils/csv';
import path from 'path';


const valuesCsvPath = path.resolve(__dirname, '../utils/values.csv');
const registerRows = parseCsvToRows(valuesCsvPath);
const successRows = registerRows.filter(r => (r.scenario || 'success').toLowerCase() === 'success');
const failRows = registerRows.filter(r => (r.scenario || '').toLowerCase() === 'fail');


async function openRegisterPage(page) {
  await page.goto('/', { waitUntil: 'load' });
  await page.locator('div').filter({ hasText: /^LoginRegister$/ }).first().click();
  await page.getByRole('banner').getByRole('link', { name: 'Register' }).click();
}

async function fillRegisterForm(page, row: any) {
  const testUser = row.testUser || '';
  await page.locator('.login-register-form input[type="email"]').fill(row.email || '');
  await page.locator('.login-register-form input[name="password"]').fill(row.password || '');
  await page.locator('.login-register-form input[name="repeatPassword"]').fill(row.password || '');
  await page.locator('.login-register-form input[name="firstName"]').fill(`${testUser}FirstName`);
  await page.locator('.login-register-form input[name="lastName"]').fill(`${testUser}LastName`);
  await page.locator(':nth-child(8) > select').selectOption({ index: 1 });
  await page.locator(':nth-child(9) > select').selectOption({ index: 1 });
}

async function submitRegister(page) {
  await page.locator('button', { hasText: 'Register' }).first().click();
}

async function assertRegisterSuccess(page) {
  const errors = page.locator('.react-toast-notifications__container');
  await expect(errors).toHaveText('You have successfully registered in to this website');
  await expect(page).not.toHaveURL(/\/register/);
}

async function assertRegisterFail(page) {
  const errors = page.locator('react-toast-notifications__container');
  await expect(errors).toBeVisible();
}

test.describe('Register', () => {
  test.describe('Success', () => {
    for (const [idx, row] of successRows.entries()) {
      const name = (row.testName?.trim() || `Register success #${idx + 1}`);
      test(name, async ({ page }) => {
        await page.context().clearCookies();
        await page.context().clearPermissions();
        await openRegisterPage(page);
        await fillRegisterForm(page, row);
        await submitRegister(page);
        await assertRegisterSuccess(page);
      });
    }
  });

  test.describe('Fail', () => {
    for (const [idx, row] of failRows.entries()) {
      const name = (row.testName?.trim() || `Register fail #${idx + 1}`);
      test(name, async ({ page }) => {
        await page.context().clearCookies();
        await page.context().clearPermissions();
        await openRegisterPage(page);
        await fillRegisterForm(page, row);
        await submitRegister(page);
        await assertRegisterFail(page);
      });
    }
  });
});