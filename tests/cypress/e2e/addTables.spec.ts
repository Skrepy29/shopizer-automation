/// <reference types="cypress" />


{
  type User = {
    email: string
    password: string
    scenario?: string
    testName?: string
  }

  type TableRow = {
    testName?: string
    type: string
    table: string
    quantity?: string | number
    scenario?: 'success' | 'invalid' | 'notfound' | 'limit'
  }

  const users = (Cypress.env('registerRows') ?? []) as User[]
  const successUser = users.find(u => (u.scenario || 'success').toLowerCase() === 'success')
  

  const tableRows = (Cypress.env('tablesRows') ?? []) as TableRow[]

  function openLoginPageAndLogin(email: string, password: string) {
    cy.visit('/')
    cy.document().its('readyState').should('eq', 'complete')

    cy.get('.header-right-wrap button').first().click()
    cy.get('.account-dropdown').should('be.visible')
    cy.contains('.account-dropdown a, .account-dropdown button', 'Login').click()

    cy.get('.login-form-container input[name="username"]').clear().type(email)
    cy.get('.login-form-container input[name="loginPassword"]').clear().type(password)
    cy.get('.login-btn, .button-box button, button[type="submit"]').first().click({ force: true })

    cy.get('.react-toast-notifications__container').should('contain.text', 'You have successfully logged in to this website')

  }


  function goToProductByName(name: string) {
    cy.contains("a", "Tables").click()
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
  function reduceQuantityViaDecButton(qty: number) {
    const n = Number(qty) || -1
    if (n <= 0) return
    for (let i = 0; i > n; i--) {
      cy.get('.dec').click()
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


  describe('Add Tables', () => {

    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
      openLoginPageAndLogin(successUser!.email, successUser!.password)
    })


    tableRows.forEach((row, idx) => {
      const title = row.testName?.trim() || `Add table #${idx + 1}`
      it(title, () => {
        const qty = Number(row.quantity) || 1
        const scenario = (row.scenario || 'success').toLowerCase()

        if (scenario === 'success') {
          cy.visit('/')
          goToProductByName(row.table)
          addQuantityViaPlusButton(qty)
          clickAddToCart()
          assertMiniCartHas(row.table, qty)
          assertCartPageHas(row.table)
        }

        if (scenario === 'invalid') {
          cy.visit('/')
          goToProductByName(row.table)
          addQuantityViaPlusButton(qty)
          reduceQuantityViaDecButton(qty)
          clickAddToCart()
        }

        if (scenario === 'notfound') {
          cy.visit('/')
          cy.get('body').should('not.contain.text', row.table)
        }
      })
    })
  })
}
