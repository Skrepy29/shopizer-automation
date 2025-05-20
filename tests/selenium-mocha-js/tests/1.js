// tests/1.spec.js

// 1) FirefoxDriver regisztrálása
require('geckodriver');


const { Builder, By, Key, until } = require('selenium-webdriver');
const assert = require('assert');

describe('User Registration (fixed)', function() {
  this.timeout(60000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('firefox').build();
    await driver.manage().window().setRect({ width: 1200, height: 800 });
  });

  after(async () => {
    await driver.quit();
  });

  it('should register a new user', async () => {
    await driver.get("http://localhost:80");

    // Cookie-banner eltüntetése, ha felbukkan
    try {
      const consent = await driver.wait(
        until.elementLocated(By.css('.CookieConsent button')), 5000);
      await consent.click();
    } catch (e) {
      // nincs cookie banner, folytathatjuk
    }

    // felhasználói ikon → regisztráció
    const userIcon = await driver.wait(
      until.elementLocated(By.css('.pe-7s-user-female')), 10000);
    await userIcon.click();

    const registerLink = await driver.wait(
      until.elementLocated(By.linkText("Register")), 5000);
    await registerLink.click();

    // mezők kitöltése
    await (await driver.wait(until.elementLocated(By.name("email")), 5000))
      .sendKeys("testuser@example.com");
    await driver.findElement(By.name("password")).sendKeys("Asd123!");
    await driver.findElement(By.name("repeatPassword")).sendKeys("Asd123!");
    await driver.findElement(By.name("firstName")).sendKeys("John");
    await driver.findElement(By.name("lastName")).sendKeys("Doe");

    // ország választása (Canada)
    const country = await driver.findElement(By.name("country"));
    await country.click();
    await country.findElement(By.xpath("//option[. = 'Canada']")).click();

    // tartomány választása (Quebec)
    const region = await driver.findElement(By.name("state"));
    await region.click();
    await region.findElement(By.xpath("//option[. = 'Quebec']")).click();

    // regisztráció elküldése
    await driver.findElement(By.css('button[type="submit"]')).click();

    // sikerüzenet ellenőrzése
    const success = await driver.wait(
      until.elementLocated(By.css('.alert-success')), 10000);
    const text = await success.getText();
    assert.ok(text.toLowerCase().includes('account'), 'Várjuk a sikerüzenetet');
  });
});
