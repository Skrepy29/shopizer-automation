const { createDriver } = require('../helper/driver');
const { BASE_URL, VIEWPORT, DEFAULT_TIMEOUT } = require('../helper/config');
const { By, until, Actions } = require('selenium-webdriver');
const { expect } = require('chai');
const { table, testUser, email, password, chair } = require('../utils/const');

describe('Shopizer User UI', function() {
  this.timeout(90000);
  let driver;

  before(async () => {
    driver = await createDriver();
    await driver.manage().window().setRect(VIEWPORT);
  });

  after(async () => {
    await driver.quit();
  });

  it('Register', async () => {
    await driver.get(BASE_URL);
    await driver.sleep(2000);
    
    const btn = await driver.wait(until.elementLocated(By.css('.CookieConsent button')), DEFAULT_TIMEOUT);
    await btn.click();
    
    const userBtn = await driver.wait(until.elementLocated(By.css('.header-right-wrap button')), DEFAULT_TIMEOUT);
    await userBtn.click();
    
    const registerLink = await driver.wait(until.elementLocated(By.linkText('Register')), DEFAULT_TIMEOUT);
    await registerLink.click();
    
    await driver.wait(until.elementLocated(By.css('.login-register-form')), DEFAULT_TIMEOUT);
    await driver.findElement(By.css('.login-register-form input[type="email"]')).sendKeys(email);
    await driver.findElement(By.name('password')).sendKeys(password);
    await driver.findElement(By.name('repeatPassword')).sendKeys(password);
    await driver.findElement(By.name('firstName')).sendKeys(testUser + 'FirstName');
    await driver.findElement(By.name('lastName')).sendKeys(testUser + 'LastName');
    
    const countrySelect = await driver.wait(until.elementLocated(By.css('.login-input select')), DEFAULT_TIMEOUT);
    await countrySelect.click();
    const canadaOption = await countrySelect.findElement(By.xpath(".//option[normalize-space(text())='Canada']"));
    await canadaOption.click();
    
    const stateSelect = await driver.wait(until.elementLocated(By.css('.login-input:nth-child(9) > select')), DEFAULT_TIMEOUT);
    await stateSelect.click();
    const quebecOption = await stateSelect.findElement(By.xpath(".//option[normalize-space(text())='Quebec']"));
    await quebecOption.click();
    
    const submitButton = await driver.wait(until.elementLocated(By.css('.button-box:nth-child(10) > button')), DEFAULT_TIMEOUT);
    await driver.wait(until.elementIsVisible(submitButton), DEFAULT_TIMEOUT);
    await driver.wait(until.elementIsEnabled(submitButton), DEFAULT_TIMEOUT);
    await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
    await driver.sleep(1000);
    await submitButton.click();
    
    await driver.wait(until.urlContains('/my-account'), DEFAULT_TIMEOUT);
    await driver.sleep(2000);
  });

  it('Login', async () => {
    await driver.get(BASE_URL + '/login');
    await driver.findElement(By.name('username')).sendKeys(email);
    await driver.findElement(By.name('loginPassword')).sendKeys(password);
    await driver.findElement(By.css('.button-box button[type="submit"]')).click();
    await driver.sleep(1000);
  });

  it('My account', async () => {
    const accordion = await driver.wait(until.elementLocated(By.css('.accordion')), DEFAULT_TIMEOUT);
    const text = await accordion.getText();
    expect(text.toLowerCase()).to.include('your account');
  });

  it('Check login', async () => {
    await driver.get(BASE_URL);
    const userBtn = await driver.wait(until.elementLocated(By.css('.header-right-wrap button')), DEFAULT_TIMEOUT);
    await userBtn.click();
    const welcome = await driver.wait(until.elementLocated(By.css('.user-name')), DEFAULT_TIMEOUT);
    const text = await welcome.getText();
    expect(text).to.include('Welcome');
  });

  it.only('Add tables', async () => {
    await driver.get(BASE_URL);
    await driver.sleep(2000);
    
    const tablesLink = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(), 'Tables')]")), DEFAULT_TIMEOUT);
    await tablesLink.click();
    await driver.sleep(2000);
    
    const product = await driver.wait(until.elementLocated(By.css('.product-content')), DEFAULT_TIMEOUT);
    await driver.actions().move({origin: product}).perform();
    
    const addToCartBtn = await driver.wait(until.elementLocated(By.css('.pro-cart > button')), DEFAULT_TIMEOUT);
    await addToCartBtn.click();
    await driver.sleep(2000);
    
    const cartBtn = await driver.wait(until.elementLocated(By.xpath('//div[@id="root"]/header/div[2]/div/div/div[3]/div/div[2]/button/i')), DEFAULT_TIMEOUT);
    await cartBtn.click();
    await driver.sleep(1000);
    
    const cart = await driver.wait(until.elementLocated(By.css('.single-shopping-cart')), DEFAULT_TIMEOUT);
    const cartText = await cart.getText();
    expect(cartText).to.include(table);
    expect(cartText).to.include('Qty: 1');

    const openCrt = await driver.wait(until.elementLocated(By.xpath("(//a[contains(text(),'Olive Table')])[2]")), DEFAULT_TIMEOUT);
    await driver.wait(until.elementIsVisible(openCrt), DEFAULT_TIMEOUT);
    await openCrt.click();
    
    const incButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(.,'+')]")), DEFAULT_TIMEOUT);
    await driver.wait(until.elementIsVisible(incButton), DEFAULT_TIMEOUT);
    await incButton.click();
    await driver.sleep(1000);
    
    const addButton = await driver.wait(until.elementLocated(By.css('.pro-details-cart > button')), DEFAULT_TIMEOUT);
    await driver.wait(until.elementIsVisible(addButton), DEFAULT_TIMEOUT);
    await addButton.click();
    
    const cartBtn2 = await driver.wait(until.elementLocated(By.xpath('//div[@id="root"]/header/div[2]/div/div/div[3]/div/div[2]/button/i')), DEFAULT_TIMEOUT);
    await cartBtn2.click();
    
    const cart2 = await driver.wait(until.elementLocated(By.css('.single-shopping-cart')), DEFAULT_TIMEOUT);
    const cartText2 = await cart2.getText();
    expect(cartText2).to.include(table);
    expect(cartText2).to.include('Qty: 3');
  });

  it.only('Add chairs', async () => {
    await driver.findElement(By.linkText('Chairs')).click();
    await driver.sleep(2000);
    
    const product = await driver.wait(until.elementLocated(By.css('.product-content')), DEFAULT_TIMEOUT);
    await driver.actions().move({origin: product}).perform();
    
    const productContainer2 = await driver.wait(until.elementLocated(By.css('.col-xl-4:nth-child(2)')), DEFAULT_TIMEOUT);
    await driver.actions().move({origin: productContainer2}).perform();
    const addToCartBtn2 = await driver.wait(until.elementLocated(By.css('.col-xl-4:nth-child(2) .pro-cart > button')), DEFAULT_TIMEOUT);
    await addToCartBtn2.click();
    await driver.sleep(2000);
    
    const productContainer3 = await driver.wait(until.elementLocated(By.css('.col-xl-4:nth-child(3)')), DEFAULT_TIMEOUT);
    await driver.actions().move({origin: productContainer3}).perform();
    const addToCartBtn3 = await driver.wait(until.elementLocated(By.css('.col-xl-4:nth-child(3) .pro-cart > button')), DEFAULT_TIMEOUT);
    await addToCartBtn3.click();
    await driver.sleep(2000);
    
    const cartBtn = await driver.wait(until.elementLocated(By.xpath('//div[@id="root"]/header/div[2]/div/div/div[3]/div/div[2]/button/i')), DEFAULT_TIMEOUT);
    await cartBtn.click();
    await driver.sleep(1000);
    
    const cart = await driver.wait(until.elementLocated(By.css('.shopping-cart-content > ul')), DEFAULT_TIMEOUT);
    const cartText = await cart.getText();
    expect(cartText).to.include(chair);
  });

  it.only('Check cart items', async () => {
    const cartBtn = await driver.wait(until.elementLocated(By.xpath('//div[@id="root"]/header/div[2]/div/div/div[3]/div/div[2]/button/i')), DEFAULT_TIMEOUT);
    await cartBtn.click();
    await driver.sleep(1000);
    
    const viewCartBtn = await driver.wait(until.elementLocated(By.css('.shopping-cart-btn .default-btn[href="/cart"]')), DEFAULT_TIMEOUT);
    await driver.executeScript("arguments[0].click();", viewCartBtn);
    await driver.sleep(1000);
    
    const tbody = await driver.wait(until.elementLocated(By.css('tbody')), DEFAULT_TIMEOUT);
    const tbodyText = await tbody.getText();
    expect(tbodyText).to.include(table);
    expect(tbodyText).to.include(chair);
  });

  it.only('Cleanup', async () => {
    await driver.sleep(2000);
    const clearButton = await driver.wait(until.elementLocated(By.css('.cart-clear > button')), DEFAULT_TIMEOUT);
    await clearButton.click();
    await driver.sleep(2000);
    
    await driver.get(BASE_URL);
    const cartBtn = await driver.wait(until.elementLocated(By.xpath('//div[@id="root"]/header/div[2]/div/div/div[3]/div/div[2]/button/i')), DEFAULT_TIMEOUT);
    await cartBtn.click();
    await driver.sleep(1000);
    
    const cartContent = await driver.wait(until.elementLocated(By.css('.shopping-cart-content')), DEFAULT_TIMEOUT);
    const cartText = await cartContent.getText();
    expect(cartText).to.include('No items added to cart');
  });
}); 