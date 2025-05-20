import * as helper from '../utils/const';

describe("Shopizer User UI", () => {
    before("Page loads", ()=>{
         cy.visit("/")
        cy.document().its("readyState").should("eq", "complete")
    })

    it("Register", () => {
        cy.get(".header-right-wrap").find("button").first().click()
        cy.get(".account-dropdown").should("contain", "Register").click()
        cy.get(".login-register-tab-list").should("exist")
        cy.get(".login-register-tab-list").should("contain", "Login")
        cy.get(".login-register-tab-list").should("contain", "Register")
        cy.get(".login-register-form").should("exist")
        cy.get('.login-register-form input[type="email"]').type(helper.email)
        cy.get('.login-register-form input[name="password"]').type(helper.password)
        cy.get('.login-register-form input[name="repeatPassword"]').type(helper.password)
        cy.get('.login-register-form input[name="firstName"]').type(helper.testUser + "FirstName")
        cy.get('.login-register-form input[name="lastName"]').type(helper.testUser + "LastName")
        cy.get(':nth-child(8) > select').select(1)
        cy.get(':nth-child(9) > select').select(1)
        cy.contains("button", "Register").click()

    })

    

    it("login", ()=>{
        cy.visit("/login")
        cy.get(".login-form-container input[name='username']").type(helper.email)
        cy.get(".login-form-container input[name='loginPassword']").type(helper.password)
        cy.get(".button-box").contains("Button", "Login").click()
        cy.wait(500)
    })

    it("My account", ()=>{
        cy.get(".accordion").should("contain", "Your account")
 //       cy.get('[data-layer="Content"]').should("contain", helper.email)
 //       cy.contains("button", "Continue").click()
 //       cy.get("react-toast-notifications__container css-zq9lxo").should("exist")
 //       cy.get(".panel-title").contains("Billing Address").click()
 //       cy.get(".row").then($row =>{
 //           cy.wrap($row).should("contain", helper.testUser + "firstName")
 //           cy.wrap($row).should("contain", helper.testUser + "lastName")
 //       })
 //       cy.get("input[name='address']").type(helper.address)
    })

    it("check login", ()=>{
        cy.visit("/")
        cy.get(".header-right-wrap").find("button").first().click()
        cy.get(".user-name").should("contain", "Welcome")
    })

    it("Add tables", ()=>{
        cy.get(".main-menu").then($menu =>{
            cy.wrap($menu).should("contain", "Home")
            cy.wrap($menu).should("contain", "Tables")
            cy.wrap($menu).should("contain", "Chairs")
        })
        cy.contains("a", "Tables").click()
        cy.get(".product-content").contains(helper.table).then($table=>{
            cy.get('.pro-cart > button').click({force:true})
        })
        cy.get(".header-right-wrap").find("button").eq(1).click()
        cy.get('.single-shopping-cart').should("contain", helper.table).and("contain", "Qty: 1")
        cy.get(".product-content").contains(helper.table).click()
        cy.get('.description-review-bottom').should("contain", helper.table)
        cy.get(".cart-plus-minus-box").should("have.value", "1")
        cy.get('.inc').click()
        cy.get(".cart-plus-minus-box").should("have.value", "2")
        cy.get('.pro-details-cart > button').click()
        cy.get(".header-right-wrap").find("button").eq(1).click()
        cy.get('.single-shopping-cart').should("contain", helper.table).and("contain", "Qty: 3")
    })
    it("Add chairs", ()=>{
        cy.get(".main-menu").contains("Chairs").click()
        cy.get(".shop-bottom-area").should("contain", helper.chair).then($char=>{
            cy.get(".pro-cart > button").eq(1).click({force:true})
            cy.get(".pro-cart > button").eq(2).click({force:true})
        })
        cy.get(".header-right-wrap").find("button").eq(1).click()
        cy.get('.single-shopping-cart').contains(helper.chair)
    })

    it("Check cart items", ()=>{
        cy.get(".shopping-cart-btn > [href='/cart']").click()
        cy.get(".cart-page-title").should("have.text", "Your cart items")
        cy.get("tbody").contains(helper.table)
        cy.get("tbody").contains(helper.chair)
    })

    it("Cleanup", ()=>{
        cy.wait(2000)
        cy.get('.cart-clear > button').click()
        cy.wait(2000)
        cy.visit("/")
        cy.get(".header-right-wrap").find("button").eq(1).click()
        cy.get('.shopping-cart-content').should("have.text", "No items added to cart")
    })

})
