/// <reference types="cypress" />


{
  type Row = {
    testName?: string
    email: string
    password: string
    chair: string
    quantity?: string | number
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
    cy.contains("a", "Chairs").click()
    cy.get('.product-content').contains(name).click()
    cy.get('.description-review-bottom, body').should('contain.text', name)
  }

  function addQuantityViaPlusButton(qty: number) {
    const n = Number(qty) || 1
    if (n <= 1) return
    for (let i = 1; i < n; i++) {
      cy.get('.inc').click()
    }
  }

  function clickAddToCart() {
    cy.contains('button, a', 'Add to cart').first().click({ force: true })
  }

  function assertMiniCartHas(name: string, qty: number) {
    cy.get('.header-right-wrap button').eq(1).click()
    cy.get('.single-shopping-cart')
      .should('contain.text', name)
      .and('contain.text', `Qty: ${qty}`)
  }

  function assertCartPageHas(name: string) {
    cy.contains('a, button', 'Cart').click({ force: true })
    cy.get('tbody').should('contain.text', name)
  }


  describe('Add Chairs', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
    })
    successRows.forEach((row, idx) => {
      const title = row.testName?.trim() || `Add chair #${idx + 1}`
      it(title, () => {
        loginViaUI(row.email, row.password)
        const qty = Number(row.quantity) || 1
        cy.visit('/')
        goToProductByName(row.chair)
        addQuantityViaPlusButton(qty)
        clickAddToCart()
        assertMiniCartHas(row.chair, qty)
        assertCartPageHas(row.chair)
      })
    })
  })
}