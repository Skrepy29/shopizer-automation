/// <reference types="cypress" />

{
  type Row = {
    testName?: string
    email: string
    password: string
    table: string
    scenario?: string
    [key: string]: any
  }

  const rows = (Cypress.env('registerRows') ?? []) as Row[]
  const successRows = rows.filter(r => (r.scenario || 'success').toLowerCase() === 'success')

  function loginViaUI(email: string, password: string) {
    cy.visit('/')
    cy.document().its('readyState').should('eq', 'complete')
    cy.get('.header-right-wrap button').first().click()
    cy.contains('.account-dropdown a, .account-dropdown button', 'Login').click()
    cy.get('.login-form-container input[name="username"]').clear().type(email)
    cy.get('.login-form-container input[name="loginPassword"]').clear().type(password)
    cy.get('.login-btn, .button-box button, button[type="submit"]').first().click({ force: true })
    cy.get('.header-right-wrap button').first().click()
    cy.get('.react-toast-notifications__container').should('contain.text', 'You have successfully logged in to this website')

  }

  function goToProductByName(name: string) {
    cy.contains("a", "Tables").click()
    cy.get('.product-content').contains(name).click()
    cy.get('.description-review-bottom, body').should('contain.text', name)
  }

  function clickAddToCart() {
    cy.contains('button, a', 'Add to cart').first().click({ force: true })
  }

  describe('Cart Cleanup', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
    })
    successRows.forEach((row, idx) => {
      const title = row.testName?.trim() || `Cleanup cart #${idx + 1}`
      it(title, () => {
        loginViaUI(row.email, row.password)
        cy.visit('/')
        goToProductByName(row.table)
        clickAddToCart()
        cy.contains('a, button', 'Cart').click({ force: true })
        cy.get('.cart-clear > button').click()
        cy.visit('/')
        cy.get('.header-right-wrap button').eq(1).click()
        cy.get('.shopping-cart-content').should('have.text', 'No items added to cart')
      })
    })
  })
}