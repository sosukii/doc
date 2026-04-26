describe('Main Navigation and User Scenarios', () => {
  beforeEach(() => {
    cy.viewport(1280, 800)
    cy.visit('/')
  })

  it('displays the hero section correctly', () => {
    cy.get('h1').should('contain', 'Будущее Атмосферы уже здесь')
    cy.get('a[href$="/products"]').should('exist')
  })

  it('can navigate to the catalog', () => {
    cy.get('nav').contains('Каталог').click()
    cy.url().should('include', '/products')
    cy.get('h1').should('contain', 'Каталог')
  })

  it('can filter products by category', () => {
    cy.visit('/products')
    cy.contains('section[aria-labelledby="catalog-category-title"] label', 'Кондиционеры')
      .as('conditionersFilter')

    cy.get('@conditionersFilter')
      .find('input[type="checkbox"]')
      .check({ force: true })

    cy.contains('span', 'Кондиционеры').should('exist')
    cy.get('@conditionersFilter')
      .find('input[type="checkbox"]')
      .should('be.checked')
    cy.get('main').find('a[href*="/products/"]').should('have.length.at.least', 1)
  })

  it('can open a product detail page', () => {
    cy.visit('/products')
    cy.get('.grid').first().find('a[href*="/products/"]').first()
      .should('have.attr', 'href')
      .then((href) => {
        cy.visit(String(href))
      })
    cy.url().should('match', /\/products\/[^/]+$/)
    cy.get('h1').should('be.visible')
  })
})
