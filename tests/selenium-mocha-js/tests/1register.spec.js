const { createDriver } = require('../helper/driver');
const { BASE_URL, VIEWPORT, DEFAULT_TIMEOUT } = require('../helper/config');
const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const path = require('path');
const parseCsvToRows = require('../utils/csv');


describe('Register', function() {
  this.timeout(90000);
  let driver;
  const rows = parseCsvToRows(path.resolve(__dirname, '../utils/values.csv'));
  const successRows = rows.filter(r => ((r.scenario || 'success').toLowerCase() === 'success'));
  const failRows = rows.filter(r => ((r.scenario || '').toLowerCase() === 'fail'));

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
      if (btn) {
        await btn.click();
      }
  }


  async function openRegisterPage() {
    await driver.get(BASE_URL);
    await driver.sleep(500); 
    await acceptCookiesIfPresent();
    const userBtn = await driver.wait(until.elementLocated(By.css('.header-right-wrap button')), DEFAULT_TIMEOUT);
    await userBtn.click();
    const registerLink = await driver.wait(until.elementLocated(By.linkText('Register')), DEFAULT_TIMEOUT);
    await registerLink.click();
    await driver.wait(until.elementLocated(By.css('.login-register-form')), DEFAULT_TIMEOUT);
  }


  async function fillRegisterForm(row) {
    const emailInput = await driver.findElement(By.css('.login-register-form input[type="email"]'));
    await emailInput.sendKeys(row.email);
    const passwordInput = await driver.findElement(By.name('password'));
    await passwordInput.sendKeys(row.password);
    const repeatInput = await driver.findElement(By.name('repeatPassword'));
    await repeatInput.sendKeys(row.password);
    const firstNameInput = await driver.findElement(By.name('firstName'));
    await firstNameInput.sendKeys(`${row.testUser} FirstName`);
    const lastNameInput = await driver.findElement(By.name('lastName'));
    await lastNameInput.sendKeys(`${row.testUser} LastName`);
    const countrySelect = await driver.wait(until.elementLocated(By.css('.login-input select')),
     DEFAULT_TIMEOUT);
    await countrySelect.click();
    const canadaOption = await countrySelect.findElement(By.xpath(".//option[normalize-space(text())='Canada']"));
    await canadaOption.click();  
    const stateSelect = await driver.wait(until.elementLocated(By.css('.login-input:nth-child(9) > select')),
     DEFAULT_TIMEOUT);
    await stateSelect.click();
    const quebecOption = await stateSelect.findElement(By.xpath(".//option[normalize-space(text())='Quebec']"));
    await quebecOption.click();    
     
  }

  async function submitRegister() {
    const submitButton = await driver.wait(until.elementLocated(By.css('.button-box:nth-child(10) > button')), DEFAULT_TIMEOUT);
    await driver.wait(until.elementIsVisible(submitButton), DEFAULT_TIMEOUT);
    await driver.wait(until.elementIsEnabled(submitButton), DEFAULT_TIMEOUT);
    await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
    await driver.sleep(3000);
    await submitButton.click();
    await driver.sleep(3000);
  }

  async function assertRegisterSuccess() {
    await driver.wait(until.urlContains('/my-account'), DEFAULT_TIMEOUT);
  }

  async function assertRegisterFail() {
    await driver.wait(until.urlContains('/register'), DEFAULT_TIMEOUT);
  }

   successRows.forEach((row, idx) => {
    const title = (row.testName && row.testName.trim()) || `Register success #${idx + 1}`;
    it(title, async () => {
      await openRegisterPage();
      await fillRegisterForm(row);
      await submitRegister();
      await assertRegisterSuccess();
    });
  });

  failRows.forEach((row, idx) => {
    const title = (row.testName && row.testName.trim()) || `Register fail #${idx + 1}`;
    it(title, async () => {
      await openRegisterPage();
      await fillRegisterForm(row);
      await submitRegister();
      await assertRegisterFail();
    });
  });
});