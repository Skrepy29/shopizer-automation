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
  await expect(page.locator('.account-dropdown:has-text("My Account"), .account-dropdown:has-text("Welcome")')).toBeVisible();
}

async function goToProductByName(page, name: string) {
  await page.getByRole('link', { name: 'Chairs' }).first().click();
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
  const cart = page.locator('.single-shopping-cart');
  await expect(cart.filter({hasText:name})).toContainText(`Qty: ${qty}`);
}

async function assertCartPageHas(page, name: string) {
  await page.locator('a:has-text("Cart"), button:has-text("Cart")').first().click({ force: true });
  await expect(page.locator('tbody')).toContainText(name);
}

test.describe('Add Chairs', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  for (const [idx, row] of successRows.entries()) {
    const title = row.testName?.trim() || `Add chair #${idx + 1}`;
    test(title, async ({ page }) => {
      await loginViaUI(page, row.email, row.password);
      const qty = Number(row.quantity) || 1;
      await page.goto('/');
      await goToProductByName(page, row.chair);
      await addQuantityViaPlusButton(page, qty);
      await clickAddToCart(page);
      await assertMiniCartHas(page, row.chair, qty);
      await assertCartPageHas(page, row.chair);
    });
  }
});