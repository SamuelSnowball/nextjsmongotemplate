
describe('My First Test', () => {
    it('Does not do much!', () => {
      expect(true).to.equal(true)
    })

    it('App contains next.js!', () => {
      cy.visit('/')
      cy.contains('Next.js!')
    })
  })