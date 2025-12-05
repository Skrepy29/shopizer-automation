const { createDriver } = require('../helper/driver');
const { BASE_URL, VIEWPORT, DEFAULT_TIMEOUT } = require('../helper/config');
const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const path = require('path');
const parseCsvToRows = require('../utils/csv');


describe('Add Chairs', function() {
  this.timeout(90000);
  let driver;
  const rows = parseCsvToRows(path.resolve(__dirname, '../utils/values.csv'));
  const successRows = rows.filter(r => (r.scenario || 'success').toLowerCase() === 'success');

  before(async () => {
    driver = await createDriver();
    await driver.manage().window().setRect(VIEWPORT);
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  beforeEach(async () => {
    await driver.manage().deleteAllCookies();
  });

  async function acceptCookiesIfPresent() {
      const btn = await driver.findElement(By.css('.CookieConsent button'));
      if (btn) await btn.click();
  }

  async function loginViaUI(email, password) {
    await driver.get(BASE_URL);
    await driver.sleep(500);
    await acceptCookiesIfPresent();
    const userBtn = await driver.wait(until.elementLocated(By.css('.header-right-wrap button')), DEFAULT_TIMEOUT);
    await userBtn.click();
    const loginLink = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(),'Login')] | //button[contains(text(),'Login')]")), DEFAULT_TIMEOUT);
    await loginLink.click();
    const usernameInput = await driver.findElement(By.css('.login-form-container input[name="username"]'));
    await usernameInput.sendKeys(email || '');
    const passInput = await driver.findElement(By.css('.login-form-container input[name="loginPassword"]'));
    await passInput.sendKeys(password || '');
    const submitButton = await driver.findElement(By.css('.login-btn, .button-box button, button[type="submit"]'));
    await submitButton.click();
    await driver.wait(until.urlContains('/my-account'), DEFAULT_TIMEOUT);
  }

  async function goToProductByName(name) {
    const chairsLink = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(),'Chairs')]")), DEFAULT_TIMEOUT);
    await chairsLink.click();
    const productLink = await driver.wait(until.elementLocated(By.xpath(`//div[contains(@class,'product-content')]//*[contains(text(), "${name}")]`)), DEFAULT_TIMEOUT);
    await productLink.click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), "${name}")]`)), DEFAULT_TIMEOUT);
  }

  async function addQuantityViaPlusButton(qty) {
    const n = Number(qty) || 1;
    if (n <= 1) return;
    for (let i = 1; i < n; i++) {
      const incButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(.,'+')]")), DEFAULT_TIMEOUT);
      await driver.wait(until.elementIsVisible(incButton), DEFAULT_TIMEOUT);
      await incButton.click();
    }
  }

  async function clickAddToCart() {
    const addToCartBtn = await driver.wait(until.elementLocated(By.css('.pro-details-cart > button')), DEFAULT_TIMEOUT);
    await addToCartBtn.click();
  }

  async function assertMiniCartHas(name, qty) {
    const buttons = await driver.findElements(By.css('.header-right-wrap button'));
    if (buttons.length >= 2) {
      await buttons[1].click();
    } else if (buttons.length === 1) {
      await buttons[0].click();
    }
   const cart = await driver.wait(until.elementLocated(By.css('.shopping-cart-content > ul')), DEFAULT_TIMEOUT);
   const cartText = await cart.getText();
   expect(cartText).to.include(name);
  }

  async function assertCartPageHas(name) {
    const cartLink = await driver.findElement(By.xpath("//a[contains(text(),'Cart')] | //button[contains(text(),'Cart')]"));
    await cartLink.click();
    const tbody = await driver.wait(until.elementLocated(By.css('tbody')), DEFAULT_TIMEOUT);
    const text = await tbody.getText();
    expect(text).to.include(name);
  }

  successRows.forEach((row, idx) => {
    const title = (row.testName && row.testName.trim()) || `Add chair #${idx + 1}`;
    it(title, async () => {
      await loginViaUI(row.email, row.password);
      const qty = Number(row.quantity) || 1;
      await driver.get(BASE_URL);
      await goToProductByName(row.chair);
      await addQuantityViaPlusButton(qty);
      await clickAddToCart();
      await assertMiniCartHas(row.chair, qty);
      await assertCartPageHas(row.chair);
    });
  });
});