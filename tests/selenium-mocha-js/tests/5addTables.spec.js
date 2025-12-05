const { createDriver } = require('../helper/driver');
const { BASE_URL, VIEWPORT, DEFAULT_TIMEOUT } = require('../helper/config');
const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const path = require('path');
const parseCsvToRows = require('../utils/csv');


describe('Add Tables', function() {
  this.timeout(90000);
  let driver;
  const users = parseCsvToRows(path.resolve(__dirname, '../utils/values.csv'));
  const successUser = users.find(u => (u.scenario || 'success').toLowerCase() === 'success');
  const tableRows = parseCsvToRows(path.resolve(__dirname, '../utils/tables.csv'));

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
    const tablesLink = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(),'Tables')]")), DEFAULT_TIMEOUT);
    await tablesLink.click();
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

  async function reduceQuantityViaDecButton(qty) {
    const n = Number(qty) || -1;
    if (n <= 0) return;
    for (let i = 0; i > n; i--) {
      const minusBtn = await driver.findElement(By.css('.dec'));
      await minusBtn.click();
    }
  }

  async function clickAddToCart() {
    const addToCartBtn = await driver.wait(until.elementLocated(By.css('.pro-details-cart > button')), DEFAULT_TIMEOUT);
    await addToCartBtn.click();
    await driver.sleep(2000);
  }

  async function assertMiniCartHas(name, qty) {
    const buttons = await driver.findElements(By.css('.header-right-wrap button'));
    if (buttons.length >= 2) {
      await buttons[1].click();
    } else if (buttons.length === 1) {
      await buttons[0].click();
    }
    await driver.sleep(1000);
    const items = await driver.findElements(By.css('.single-shopping-cart'));
    let found = false;
    for (const item of items) {
     const text = await item.getText();
     if (text.includes(name)) {
       expect(text).to.include(name);
       expect(text).to.include(`Qty: ${qty}`);
       found = true;
       break;
     }
    }
    expect(found, `Mini cart did not contain ${name}`).to.be.true;
  }

  async function assertCartPageHas(name) {
    const cartLink = await driver.findElement(By.xpath("//a[contains(text(),'Cart')] | //button[contains(text(),'Cart')]"));
    await cartLink.click();
    const tbody = await driver.wait(until.elementLocated(By.css('tbody')), DEFAULT_TIMEOUT);
    const text = await tbody.getText();
    expect(text).to.include(name);
  }

  async function assertHasErrorUI() {
    const toast = await driver.wait(until.elementLocated(By.css('.react-toast-notifications__container')), DEFAULT_TIMEOUT);
    const displayed = await toast.isDisplayed();
    expect(displayed).to.be.true;
  }

  tableRows.forEach((row, idx) => {
    const title = (row.testName && row.testName.trim()) || `Add table #${idx + 1}`;
    it(title, async () => {
      const qty = Number(row.quantity) || 1;
      const scenario = (row.scenario || 'success').toLowerCase();
      await loginViaUI(successUser.email, successUser.password);
      if (scenario === 'success') {
        await driver.get(BASE_URL);
        await goToProductByName(row.table);
        await addQuantityViaPlusButton(qty);
        await clickAddToCart();
        await assertMiniCartHas(row.table, qty);
        await assertCartPageHas(row.table);
      } else if (scenario === 'invalid') {
        await driver.get(BASE_URL);
        await goToProductByName(row.table);
        await addQuantityViaPlusButton(qty);
        await reduceQuantityViaDecButton(qty);
        await clickAddToCart();
        await assertHasErrorUI();
      } else if (scenario === 'notfound') {
        await driver.get(BASE_URL);
        const body = await driver.findElement(By.tagName('body'));
        const bodyText = await body.getText();
        expect(bodyText).to.not.include(row.table);
      } else {
        await driver.get(BASE_URL);
        await goToProductByName(row.table);
        await addQuantityViaPlusButton(qty);
        await clickAddToCart();
        await assertMiniCartHas(row.table, qty);
        await assertCartPageHas(row.table);
      }
    });
  });
});