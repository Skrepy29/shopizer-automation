/// <reference types="cypress" />

{
  type Row = {
    testName?: string
    email: string
    password: string
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

  describe('My Account page', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
    })
    successRows.forEach((row, idx) => {
      const name = row.testName?.trim() || `My account #${idx + 1}`
      it(name, () => {
        loginViaUI(row.email, row.password)
        cy.get('.accordion').should('contain.text', 'Your account')
      })
    })
  })
}