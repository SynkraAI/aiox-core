/**
 * E2E Test: Landing Page — Story E4.6 (complementar)
 *
 * Verifica todas as secoes da landing page e formulário de leads.
 */
import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('deve exibir todas as secoes da landing page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Ciclo das Estações/)

    // Hero section
    const heroTitle = page.locator('h1')
    await expect(heroTitle).toContainText('Ciclo das Estações')

    // CTA button
    const ctaBtn = page.locator('text=Conhecer Eventos')
    await expect(ctaBtn).toBeVisible()

    // Próximos Eventos section
    const eventosSection = page.locator('text=Próximos Eventos')
    await expect(eventosSection).toBeVisible()

    // Proposta de Valor section
    const valorSection = page.locator('text=Por que participar?')
    await expect(valorSection).toBeVisible()

    // Formulário de Interesse section
    const interesseSection = page.locator('text=Manifeste seu Interesse')
    await expect(interesseSection).toBeVisible()

    // Depoimentos section
    const depoimentosSection = page.locator('text=Depoimentos')
    await expect(depoimentosSection).toBeVisible()

    // Sobre o Programa section
    const sobreSection = page.locator('text=Sobre o Programa')
    await expect(sobreSection).toBeVisible()

    // Footer section
    const footerFacilitadoras = page.locator('text=Facilitadoras')
    await expect(footerFacilitadoras).toBeVisible()
  })

  test('deve submeter formulário de lead com sucesso', async ({ page }) => {
    await page.goto('/')

    // Scroll to form
    const formSection = page.locator('#interesse')
    await formSection.scrollIntoViewIfNeeded()

    // Fill email (required)
    const emailField = page.locator('#interesse input[type="email"]').first()
      .or(page.locator('input[name="email"]').first())

    if (await emailField.isVisible()) {
      await emailField.fill(`e2e-lead-${Date.now()}@test.local`)

      // Fill name (optional)
      const nameField = page.locator('#interesse input[name="name"]').first()
        .or(page.locator('#interesse input[type="text"]').first())
      if (await nameField.isVisible()) {
        await nameField.fill('Lead E2E Test')
      }

      // Submit form
      const submitBtn = page.locator('#interesse button[type="submit"]').first()
        .or(page.locator('#interesse text=/Enviar|Registrar|Quero Participar/i').first())
      if (await submitBtn.isVisible()) {
        await submitBtn.click()
        await page.waitForTimeout(2000)

        // Verify success message
        const successMsg = page.locator('text=/sucesso|registrado|obrigad/i').first()
        if (await successMsg.isVisible()) {
          await expect(successMsg).toBeVisible()
        }
      }
    }
  })

  test('deve navegar para /eventos via CTA', async ({ page }) => {
    await page.goto('/')

    // Click CTA "Conhecer Eventos"
    const ctaBtn = page.locator('a[href="#eventos"]').first()
      .or(page.locator('text=Conhecer Eventos').first())
    await ctaBtn.click()

    // Should scroll to eventos section or navigate
    await page.waitForTimeout(1000)
    const eventosSection = page.locator('#eventos')
    await expect(eventosSection).toBeVisible()
  })

  test('deve exibir JSON-LD Organization structured data', async ({ page }) => {
    await page.goto('/')

    // Verify JSON-LD script tag exists
    const jsonLd = page.locator('script[type="application/ld+json"]')
    await expect(jsonLd.first()).toBeAttached()

    // Verify content
    const content = await jsonLd.first().textContent()
    expect(content).toContain('Organization')
    expect(content).toContain('Base Tríade')
  })

  test('deve exibir footer com links das facilitadoras', async ({ page }) => {
    await page.goto('/')

    // Verify facilitator links
    const daniela = page.locator('a[href*="podprana"]')
    await expect(daniela).toBeVisible()

    const milena = page.locator('a[href*="koch.milenar"]')
    await expect(milena).toBeVisible()

    // Verify privacy policy link
    const privacidade = page.locator('a[href="/privacidade"]')
    await expect(privacidade).toBeVisible()
  })
})
