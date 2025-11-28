
const { Builder } = require('selenium-webdriver');
const chromedriver = require('chromedriver');
const chrome       = require('selenium-webdriver/chrome');

const serviceBuilder = new chrome.ServiceBuilder(chromedriver.path);

module.exports.createDriver = async () => {
  const options = new chrome.Options();

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeService(serviceBuilder)
    .setChromeOptions(options)
    .build();

  return driver;
};
