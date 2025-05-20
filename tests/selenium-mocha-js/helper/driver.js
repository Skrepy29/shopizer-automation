// helper/driver.js

const { Builder } = require('selenium-webdriver');
const chromedriver = require('chromedriver');
const chrome       = require('selenium-webdriver/chrome');

// explicit Chrome ServiceBuilder
const serviceBuilder = new chrome.ServiceBuilder(chromedriver.path);

module.exports.createDriver = async () => {
  // opcionálisan beállíthatsz itt headless(false)-t is, ha kell
  const options = new chrome.Options();
  // pl. options.headless(false);

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeService(serviceBuilder)
    .setChromeOptions(options)
    .build();

  return driver;
};
