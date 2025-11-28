const { createDriver } = require('../helper/driver');
const { BASE_URL, VIEWPORT, DEFAULT_TIMEOUT } = require('../helper/config');
const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const path = require('path');
const parseCsvToRows = require('../utils/csv');


describe.only('Cart Cleanup', function() {
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



  async function clearCartAndAssertEmpty() {
    const cartLink = await driver.findElement(By.xpath("//a[contains(text(),'Cart')] | //button[contains(text(),'Cart')]"));
    await driver.executeScript("arguments[0].click();", cartLink);
    const clearBtn = await driver.wait(until.elementLocated(By.css('.cart-clear > button')), DEFAULT_TIMEOUT);
    await clearBtn.click();
    await driver.sleep(1000)
    await driver.get(BASE_URL);
    const buttons = await driver.findElements(By.css('.header-right-wrap button'));
    if (buttons.length >= 2) {
      await buttons[1].click();
    } 
    const cartContent = await driver.wait(until.elementLocated(By.css('.shopping-cart-content')), DEFAULT_TIMEOUT);
    const text = await cartContent.getText();
    expect(text.trim()).to.equal('No items added to cart');
  }

  successRows.forEach((row, idx) => {
    const title = (row.testName && row.testName.trim()) || `Cleanup cart #${idx + 1}`;
    it(title, async () => {
      await loginViaUI(row.email, row.password);
      await driver.get(BASE_URL);
      await clearCartAndAssertEmpty();
    });
  });
});