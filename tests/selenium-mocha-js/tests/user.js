// tests/user.spec.js

// 1) FirefoxDriver regisztrálása
 require('geckodriver');


const { Builder } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Sanity Check on Firefox (fixed)', function() {
  this.timeout(30000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('firefox').build();
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('should load a minimal data URL page and have the correct title', async () => {
    const html = 'data:text/html,<html><head><title>FFTest</title></head><body>OK</body></html>';
    await driver.get(html);
    const title = await driver.getTitle();
    expect(title).to.equal('FFTest');
  });
});
