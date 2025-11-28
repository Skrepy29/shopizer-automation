/// <reference types="cypress" />

{
function openLoginPage() {
  cy.visit('/')
  cy.document().its('readyState').should('eq', 'complete')

  cy.get('.header-right-wrap').find('button').first().click()
  cy.get('.account-dropdown').should('contain', 'Login').click()
  cy.get('.login-register-tab-list').should('exist')
  cy.get('.login-form-container').should('exist')
}

function doLogin({ email, password }: Row) {
  cy.visit('/login')
  cy.get('.login-form-container input[name="username"]').clear().type(email)
  cy.get('.login-form-container input[name="loginPassword"]').clear().type(password ?? '')
  cy.get('.login-btn, .button-box button, button[type="submit"]').first().click({ force: true })
}

function checkLoginSuccess() {
  cy.get('.react-toast-notifications__container').should('contain.text', 'You have successfully logged in to this website')

  cy.get('.header-right-wrap').find('button').first().click()
  cy.get('.react-toast-notifications__toast__content')    
}

function checkLoginFail() {
  cy.get('.react-toast-notifications__container').should('contain.text', 'Incorrect username or password') 
}


{
  const rows = (Cypress.env('registerRows') ?? []) as Row[]
  const successRows = rows.filter(r => (r.scenario || 'success').toLowerCase() === 'success')
  const failRows    = rows.filter(r => (r.scenario || '').toLowerCase() === 'fail')
  
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });
  
  describe('Login', () => {
    describe('Successful logins', () => {
      successRows.forEach((row, idx) => {
        const name = row.testName?.trim() || `Login success #${idx + 1}`
        it(name, () => {
          openLoginPage()
          doLogin(row)
          checkLoginSuccess()
        })
      })
    })
  
    describe('Failing logins', () => {
      failRows.forEach((row, idx) => {
        const name = row.testName?.trim() || `Login fail #${idx + 1}`
        it(name, () => {
          openLoginPage()
          doLogin(row)
          checkLoginFail()
        })
      })
    })
  })
}
}