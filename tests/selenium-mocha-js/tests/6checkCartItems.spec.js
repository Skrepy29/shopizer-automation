const { createDriver } = require('../helper/driver');
const { BASE_URL, VIEWPORT, DEFAULT_TIMEOUT } = require('../helper/config');
const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const path = require('path');
const parseCsvToRows = require('../utils/csv');


describe('Check Cart Items', function() {
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
    try {
      const btn = await driver.findElement(By.css('.CookieConsent button'));
      if (btn) await btn.click();
    } catch (err) {}
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
    await usernameInput.clear();
    await usernameInput.sendKeys(email || '');
    const passInput = await driver.findElement(By.css('.login-form-container input[name="loginPassword"]'));
    await passInput.clear();
    await passInput.sendKeys(password || '');
    const submitButton = await driver.findElement(By.css('.login-btn, .button-box button, button[type="submit"]'));
    await submitButton.click();
    await driver.wait(until.urlContains('/my-account'), DEFAULT_TIMEOUT);
  }

  
  async function assertCartPageHas(name, qty) {
    const rows = await driver.findElements(By.css('tbody tr'));
    let found = false;
    for (const row of rows) {
      const text = await row.getText();
      if (text.includes(name)) {
        expect(text).to.include(name);
        expect(text).to.include(String(qty));
        found = true;
        break;
      }
    }
    expect(found, `Cart page did not contain ${name}`).to.be.true;
  }

  successRows.forEach((row, idx) => {
    const title = (row.testName && row.testName.trim()) || `Check cart items #${idx + 1}`;
    it(title, async () => {
      await loginViaUI(row.email, row.password);
      const qty = Number(row.quantity) || 1;
      await driver.get(BASE_URL);
      const cartLink = await driver.findElement(By.xpath("//a[contains(text(),'Cart')] | //button[contains(text(),'Cart')]"));
      await driver.executeScript("arguments[0].click();", cartLink);
      await driver.wait(until.elementLocated(By.css('tbody')), DEFAULT_TIMEOUT);
      await assertCartPageHas(row.table, qty);
      await assertCartPageHas(row.chair, qty);
    });
  });
});