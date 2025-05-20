import { test, expect } from '@playwright/test';
import { testUser, password,email, address, table, chair } from '../utils/const';

test.describe.serial("Shopizer user UI", ()=>{
    test.beforeEach(async({page})=>{
        await page.goto("/", {waitUntil: "load"})
    });

    test("Register",async ({page})=>{
        await page.locator('div').filter({ hasText: /^LoginRegister$/ }).first().click();        
        await page.getByRole('banner').getByRole('link', { name: 'Register' }).click();
        await page.getByRole('textbox', { name: 'Email address', exact: true }).fill(email);
        await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
        await page.getByRole('textbox', { name: 'Repeat Password' }).fill(password);
        await page.getByRole('textbox', { name: 'First Name' }).fill(testUser+ "FirstName");
        await page.getByRole('textbox', { name: 'Last Name' }).fill(testUser+"Lastname");
        await page.getByRole('tabpanel').getByRole('combobox').selectOption('CA');
        await page.getByRole('tabpanel').locator('form div').filter({ hasText: 'Select a stateQuebecYukon' }).getByRole('combobox').selectOption('QC');
        await page.getByRole('button', { name: 'Register' }).click();
    });

    test("Login and My account", async({page})=>{
        //Login
        await page.locator('div').filter({ hasText: /^LoginRegister$/ }).first().click();        
        await page.getByRole('banner').getByRole('link', { name: 'Login' }).click();
        await expect(page).toHaveURL('/login');
        await page.getByRole('textbox', { name: 'Email address', exact: true }).fill(email);
        await page.getByRole('textbox', { name: 'Password' }).fill(password);
        await page.getByRole('button', { name: 'Login' }).click();

        //My account check
        await expect(page).toHaveURL('/my-account');
        await expect(page.getByRole("button", {name: "Your account"})).toHaveText("1 . Your account")
        await expect(page.locator('input[name="username"]')).toHaveValue(email)
        await expect(page.locator('form').filter({ hasText: 'User NameEmail addressContinue' }).locator('input[name="email"]')).toHaveValue(email)
    });

    test("Add products and check cart", async({page})=>{
        //Table
        await page.getByRole('link', { name: 'Tables' }).first().click();
        const addToCart = page.getByRole('button', { name: ' Add to cart' });
        await page.locator('.product-img').first().hover();
        await addToCart.click();
        const cartAction = page.locator('.header-right-wrap').locator('button').nth(1).click()
        const cart = page.locator('.single-shopping-cart');
        await expect(cart).toContainText(table);
        await expect(cart).toContainText('Qty: 1');
        await cartAction
        await page.getByRole('link', { name: table }).nth(1).click()
        await expect(page.getByRole('tabpanel').getByText('Olive Table')).toHaveText(table )
        await page.getByRole('button', { name: '+' }).click();
        await page.getByRole('button', { name: 'Add to cart' }).click();
        await cartAction
        await expect(cart).toContainText(table);
        await expect(cart).toContainText('Qty: 3');
        await cartAction

        //Chairs
        await page.getByRole('link', { name: 'Chairs' }).first().click();
        await expect(page).toHaveURL('/category/chairs');
        await page.locator('div:nth-child(2) > .product-wrap > .product-img > a').hover();
        await addToCart.click()
        await page.locator('div:nth-child(3) > .product-wrap > .product-img > a').hover();
        await addToCart.click()
        await cartAction
        await expect(cart).toContainText([chair, 'Qty: 1'])
        await cartAction
        await page.getByRole('link', { name: 'Chair Beige' }).click()
        await page.getByRole('button', { name: '+' }).click();
        await page.getByRole('button', { name: 'Add to cart' }).click();
        await cartAction
        await expect(cart.filter({hasText:chair})).toContainText('Qty: 3')
        
        //Cart validation
        await cartAction
        await page.getByRole('link', { name: 'View Cart' }).click()
        await expect(page.locator('.cart-page-title')).toHaveText('Your cart items');
        const tbody = page.locator('tbody');
        await expect(tbody).toContainText(table);
        await expect(tbody).toContainText(chair);

        await page.locator('.cart-clear > button').click();
        await page.goto('/', { waitUntil: 'load' });
        await cartAction;
        await expect(page.locator('.shopping-cart-content')).toHaveText('No items added to cart');
    })

})

