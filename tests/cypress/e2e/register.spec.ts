
/// <reference types="cypress" />

//Do NOT delete this
type Row = {
  testName: string
  testUser: string
  password: string
  email: string
  table?: string
  chair?: string
  quantity?: string | number
  scenario?: string 
}

function openRegisterPage() {
  cy.visit('/')
  cy.document().its('readyState').should('eq', 'complete')

  cy.get('.header-right-wrap').find('button').first().click()
  cy.get('.account-dropdown').should('contain', 'Register').click()

  cy.get('.login-register-tab-list').should('exist')
  cy.get('.login-register-tab-list').should('contain', 'Login')
  cy.get('.login-register-tab-list').should('contain', 'Register')
  cy.get('.login-register-form').should('exist')
}

function fillRegisterForm({ email, password, testUser }: Row) {
  cy.get('.login-register-form input[type="email"]').clear().type(email)
  cy.get('.login-register-form input[name="password"]').clear().type(password ?? '')
  cy.get('.login-register-form input[name="repeatPassword"]').clear().type(password ?? '')
  cy.get('.login-register-form input[name="firstName"]').clear().type(`${testUser ?? ''}FirstName`)
  cy.get('.login-register-form input[name="lastName"]').clear().type(`${testUser ?? ''}LastName`)
  cy.get(':nth-child(8) > select').select(1)  
  cy.get(':nth-child(9) > select').select(1)  
}

function submitRegister() {
  cy.contains('button', 'Register').click()
}

function assertRegisterSuccess() {
  cy.get('.react-toast-notifications__container').should('not.contain.text', 'Registering customer already exist') 
  cy.get('.react-toast-notifications__container').should('contain.text', 'You have successfully registered in to this website') 
  cy.url().should('not.include', '/register')

}

function assertRegisterFail() {
  cy.get('.toast-error, .alert-danger, .validation-error, .error-msg')
    .should('exist')
    .and('be.visible')
  cy.get('.login-register-form').should('exist')
}

{
const rows: Row[] = (Cypress.env('registerRows') as Row[]) || []
const successRows = rows.filter(r => (r.scenario || 'success').toLowerCase() === 'success')
const failRows = rows.filter(r => (r.scenario || '').toLowerCase() === 'fail')



describe('Register', () => {
  describe('Success', () => {
    successRows.forEach((row, idx) => {
      const name = row.testName?.trim() || `Register success #${idx + 1}`
      it(name, () => {
        openRegisterPage()
        fillRegisterForm(row)
        submitRegister()
        assertRegisterSuccess()
      })
    })
  })

  describe('Fail', () => {
    failRows.forEach((row, idx) => {
      const name = row.testName?.trim() || `Register fail #${idx + 1}`
      it(name, () => {
        openRegisterPage()
        fillRegisterForm(row)
        submitRegister()
        assertRegisterFail()
      })
    })
  })
})
}