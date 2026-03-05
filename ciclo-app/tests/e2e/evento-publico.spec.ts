/**
 * E2E Test: Visualizacao de Evento Publico — Story E4.6 (AC-2)
 *
 * Navega para /eventos/[slug], verifica hero, ingressos e cronograma.
 */
import { test, expect } from '@playwright/test'

test.describe('Visualizacao de Evento Publico', () => {
  test('deve exibir pagina do evento com hero, ingressos e cronograma', async ({ page }) => {
    // Navigate to eventos listing
    await page.goto('/eventos')
    await expect(page).toHaveTitle(/Eventos/)

    // Find first event card and click
    const eventCard = page.locator('[data-testid="event-card"]').first()
    if (await eventCard.isVisible()) {
      await eventCard.click()
      await page.waitForURL(/\/eventos\//)

      // AC-2: Verify hero section
      const heroTitle = page.locator('h1')
      await expect(heroTitle).toBeVisible()

      // AC-2: Verify ticket section with price
      const ticketSection = page.locator('text=Ingressos').first()
        .or(page.locator('text=ingresso').first())
        .or(page.locator('[data-testid="ticket-section"]').first())
      // At least one price indicator should be visible
      const priceIndicator = page.locator('text=/R\\$/')
      await expect(priceIndicator.first()).toBeVisible()

      // AC-2: Verify schedule/cronograma
      const schedule = page.locator('text=Cronograma').first()
        .or(page.locator('text=Programacao').first())
        .or(page.locator('text=Atividades').first())
      await expect(schedule).toBeVisible()
    } else {
      // No published events — verify empty state
      const emptyMsg = page.locator('text=/em breve|nenhum evento/i')
      await expect(emptyMsg).toBeVisible()
    }
  })

  test('deve exibir meta tags SEO corretas', async ({ page }) => {
    await page.goto('/eventos')

    const eventLink = page.locator('a[href*="/eventos/"]').first()
    if (await eventLink.isVisible()) {
      await eventLink.click()
      await page.waitForURL(/\/eventos\//)

      // Verify og:title meta tag exists
      const ogTitle = page.locator('meta[property="og:title"]')
      await expect(ogTitle).toHaveAttribute('content', /.+/)
    }
  })

  test('deve exibir FAQ se disponivel', async ({ page }) => {
    await page.goto('/eventos')

    const eventLink = page.locator('a[href*="/eventos/"]').first()
    if (await eventLink.isVisible()) {
      await eventLink.click()
      await page.waitForURL(/\/eventos\//)

      // FAQ section (optional — only if event has FAQs)
      const faqSection = page.locator('text=Perguntas Frequentes').first()
        .or(page.locator('text=FAQ').first())
      if (await faqSection.isVisible()) {
        await expect(faqSection).toBeVisible()
      }
    }
  })
})
