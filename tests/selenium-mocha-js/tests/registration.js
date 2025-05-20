// tests/registration.spec.js

const { createDriver } = require('../helper/driver');
const { BASE_URL, VIEWPORT, DEFAULT_TIMEOUT } = require('../helper/config');
const { By, until } = require('selenium-webdriver');
const { expect, util } = require('chai');
const { table, testUser, email, password, chair } = require('../utils/const');


describe('User Registration Flow (Chrome)', function() {
  this.timeout(60000);
  let driver;

  before(async () => {
    driver = await createDriver();
    await driver.manage().window().setRect(VIEWPORT);
  });

  after(async () => {
    await driver.quit();
  });

  it('opens the home page and reveals the Register link', async () => {
    await driver.get(BASE_URL);

    // cookie-banner elrejtése
    try {
      const btn = await driver.wait(
        until.elementLocated(By.css('.CookieConsent button')),
        DEFAULT_TIMEOUT
      );
      await btn.click();
    } catch (e) {}

    // felhasználói ikon kattintás
    const userIcon = await driver.wait(
      until.elementLocated(By.css('.pe-7s-user-female')),
      DEFAULT_TIMEOUT
    );
    await userIcon.click();

    // Register-link megjelenésének ellenőrzése
    const registerLink = await driver.wait(
      until.elementLocated(By.linkText('Register')),
      DEFAULT_TIMEOUT
    );
    expect(await registerLink.isDisplayed()).to.be.true;
  });

  it('fills out and submits the registration form', async () => {
    await driver.findElement(By.linkText('Register')).click();

    const emailInput = await driver.wait(
      until.elementLocated(By.name('email')),
      DEFAULT_TIMEOUT
    );
    await emailInput.sendKeys(email);

    await driver.findElement(By.name('password')).sendKeys(password);
    await driver.findElement(By.name('repeatPassword')).sendKeys(password);
    await driver.findElement(By.name('firstName')).sendKeys(testUser + 'Firstname');
    await driver.findElement(By.name('lastName')).sendKeys(testUser + 'Lastname');

  const countrySelect = await driver.wait(
    until.elementLocated(By.name('country')),
    DEFAULT_TIMEOUT
  );
  await countrySelect.click();
  // kiválasztjuk a 'Canada' opciót a select-en belül
  const canadaOption = await countrySelect.findElement(
    By.xpath(".//option[normalize-space(text())='Canada']")
  );
  await canadaOption.click();

    const state = await driver.findElement(By.name('state'));
    await state.click();
    await driver.findElement(By.xpath("//option[.='Quebec']")).click();

    await driver.findElement(By.css('button[type="submit"]')).click();

    const successAlert = await driver.wait(
      until.elementLocated(By.css('.alert-success')),
      DEFAULT_TIMEOUT
    );
    const text = await successAlert.getText();
    expect(text.toLowerCase()).to.include('account');
  });
});
