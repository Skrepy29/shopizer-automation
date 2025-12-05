const { createDriver } = require('../helper/driver');
const { BASE_URL, VIEWPORT, DEFAULT_TIMEOUT } = require('../helper/config');
const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const path = require('path');
const parseCsvToRows = require('../utils/csv');

describe('Login', function() {
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
      const btn = await driver.findElement(By.css('.CookieConsent button'));
      if (btn) await btn.click();
  }

  async function openLoginPage() {
    await driver.get(BASE_URL);
    await driver.sleep(500);
    await acceptCookiesIfPresent();
    const userBtn = await driver.wait(until.elementLocated(By.css('.header-right-wrap button')), DEFAULT_TIMEOUT);
    await userBtn.click();
    const loginLink = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(),'Login')] | //button[contains(text(),'Login')]")), DEFAULT_TIMEOUT);
    await loginLink.click();
  }

  async function doLogin(row) {
    await driver.get(`${BASE_URL}/login`);
    const usernameInput = await driver.findElement(By.name('username'));
    await usernameInput.sendKeys(row.email || '');
    const passInput = await driver.findElement(By.name('loginPassword'));
    await passInput.sendKeys(row.password || '');
    const submitButton = await driver.findElement(By.css('.button-box button[type="submit"]'));
    await submitButton.click();
  }

  async function checkLoginSuccess() {
    await driver.wait(until.urlContains('/my-account'), DEFAULT_TIMEOUT);
  }

  async function checkLoginFail() {
    await driver.wait(until.urlContains('/login'), DEFAULT_TIMEOUT);
  }

  describe('Successful logins', () => {
    successRows.forEach((row, idx) => {
      const name = (row.testName && row.testName.trim()) || `Login success #${idx + 1}`;
      it(name, async () => {
        await openLoginPage();
        await doLogin(row);
        await checkLoginSuccess();
      });
    });
  });

  describe('Failing logins', () => {
    failRows.forEach((row, idx) => {
      const name = (row.testName && row.testName.trim()) || `Login fail #${idx + 1}`;
      it(name, async () => {
        await openLoginPage();
        await doLogin(row);
        await checkLoginFail();
      });
    });
  });
});