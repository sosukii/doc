describe('Main Navigation and User Scenarios', () => {
  beforeEach(() => {
    cy.viewport(1280, 800)
    cy.visit('/')
  })

  it('displays the hero section correctly', () => {
    cy.get('h1').should('contain', 'Будущее Атмосферы уже здесь')
    cy.get('a[href="/products"]').should('exist')
  })

  it('can navigate to the catalog', () => {
    cy.get('nav').contains('Каталог').click()
    cy.url().should('include', '/products')
    cy.get('h1').should('contain', 'Каталог')
  })

  it('can filter products by category', () => {
    cy.visit('/products')
    cy.get('select').select(1)
    cy.get('.grid').children().should('have.length.at.least', 1)
  })

  it('can open a product detail page', () => {
    cy.visit('/products')
    // cy.get('.grid').first().find('a').click()
    cy.get('.grid').find('a').first().click()
    cy.url().should('match', /\/products\/\d+/)
    cy.get('h1').should('be.visible')
  })
})
