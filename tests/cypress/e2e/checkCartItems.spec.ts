/// <reference types="cypress" />


{
  type Row = {
    testName?: string
    email: string
    password: string
    table: string
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


  function assertCartPageHas(name: string, qty: number) {
  cy.contains('tbody tr', name)
    .should('contain.text', name)
    .and('contain.text', qty.toString());
}

  describe('Check Cart Items', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
    })
    successRows.forEach((row, idx) => {
      const title = row.testName?.trim() || `Check cart items #${idx + 1}`
      it(title, () => {
        loginViaUI(row.email, row.password)
        const qty = Number(row.quantity) || 1
        cy.visit('/')
        cy.contains('a, button', 'Cart').click({ force: true })
        assertCartPageHas(row.table, qty)
        assertCartPageHas(row.chair, qty)
      })
    })
  })
}