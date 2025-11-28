const { createDriver } = require('../helper/driver');
const { BASE_URL, VIEWPORT, DEFAULT_TIMEOUT } = require('../helper/config');
const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const path = require('path');
const parseCsvToRows = require('../utils/csv');


describe('My Account', function() {
  this.timeout(90000);
  let driver;
  const rows = parseCsvToRows(path.resolve(__dirname, '../utils/values.csv'));
  const successRows = rows.filter(r => (r.scenario || 'success').toLowerCase() === 'success');
  const failRows = rows.filter(r => (r.scenario || '').toLowerCase() === 'fail');

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
  }

  async function checkLoginSuccess() {
    await driver.wait(until.urlContains('/my-account'), DEFAULT_TIMEOUT);
  }

  async function checkLoginFail() {
    await driver.wait(until.urlContains('/login'), DEFAULT_TIMEOUT);
  }

  describe('Successful My account check', () => {
   successRows.forEach((row, idx) => {
      const name = (row.testName && row.testName.trim()) || `My account #${idx + 1}`;
      it(name, async () => {
        await loginViaUI(row.email, row.password);
        await checkLoginSuccess();
        await driver.get(`${BASE_URL}/my-account`);
        const accordion = await driver.wait(until.elementLocated(By.css('.accordion')), DEFAULT_TIMEOUT);
        const text = await accordion.getText();
        expect(text.toLowerCase()).to.include('your account');
      });
    });
  });

  describe('Failing My account check', () => {
    failRows.forEach((row, idx) => {
      const name = (row.testName && row.testName.trim()) || `My account #${idx + 1}`;
      it(name, async () => {
        await loginViaUI(row.email, row.password);
        await checkLoginFail();
      });
    });
  });
});