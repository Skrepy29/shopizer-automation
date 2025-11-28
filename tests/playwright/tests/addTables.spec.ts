import { test, expect } from '@playwright/test';
import { parseCsvToRows } from '../utils/csv';
import path from 'path';


const valuesCsvPath = path.resolve(__dirname, '../utils/values.csv');
const tablesCsvPath = path.resolve(__dirname, '../utils/tables.csv');
const registerRows = parseCsvToRows(valuesCsvPath);
const tableRows = parseCsvToRows(tablesCsvPath);
const successUser = registerRows.find(u => (u.scenario || 'success').toLowerCase() === 'success');


async function openLoginPageAndLogin(page, email: string, password: string) {
  await page.goto('/', { waitUntil: 'load' });
  await page.locator('div').filter({ hasText: /^LoginRegister$/ }).first().click();
  await page.getByRole('banner').getByRole('link', { name: 'Login' }).click();
  await page.locator('.login-form-container input[name="username"]').fill(email);
  await page.locator('.login-form-container input[name="loginPassword"]').fill(password);
  await page.locator('.login-btn, .button-box button, button[type="submit"]').first().click({ force: true });
  await page.locator('.header-right-wrap button').first().click();
  await expect(page.locator('.account-dropdown:has-text("My Account"), .account-dropdown:has-text("Welcome")')).toBeVisible();
}

async function goToProductByName(page, name: string) {
  await page.getByRole('link', { name: 'Tables' }).first().click();
  await page.locator('.product-content').getByText(name).click();
}

async function addQuantityViaPlusButton(page, qty: number) {
  const n = Number(qty) || 1;
  for (let i = 1; i < n; i++) {
    await page.getByRole('button', { name: '+' }).click();
  }
}

async function clickAddToCart(page) {
  const addBtn = page.locator('button:has-text("Add to cart"), a:has-text("Add to cart")').first();
  await addBtn.click({ force: true });
}

async function assertMiniCartHas(page, name: string, qty: number) {
  await page.locator('.header-right-wrap button').nth(1).click();
  const cartItem = page.locator('.single-shopping-cart');
  await expect(cartItem).toContainText(name);
  await expect(cartItem).toContainText(`Qty: ${qty}`);
}


async function assertCartPageHas(page, name: string) {
  await page.locator('.header-right-wrap').locator('button').nth(1).click();
  await expect(page.locator('.single-shopping-cart')).toContainText(name);
}

async function assertHasErrorUI(page) {
  await expect.soft(page.locator('.react-toast-notifications__container')).toBeVisible();
}

test.describe('Add Tables)', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.context().clearPermissions();
    await openLoginPageAndLogin(page, successUser!.email, successUser!.password);
  });

  for (const [idx, row] of tableRows.entries()) {
    const title = row.testName?.trim() || `Add table #${idx + 1}`;
    test(title, async ({ page }) => {
      const qty = Number(row.quantity) || 1;
      const scenario = (row.scenario || 'success').toLowerCase();

      if (scenario === 'success') {
        await page.goto('/');
        await goToProductByName(page, row.table);
        await addQuantityViaPlusButton(page, qty);
        await clickAddToCart(page);
        await assertMiniCartHas(page, row.table, qty);
        await assertCartPageHas(page, row.table);
      }

      if (scenario === 'invalid') {
        await page.goto('/');
        await goToProductByName(page, row.table);
        await clickAddToCart(page);
        await assertHasErrorUI(page);
      }

      if (scenario === 'notfound') {
        await page.goto('/');
        await expect(page.locator('body')).not.toContainText(row.table);
      }

    });
  }
});