import { expect, test, type Page } from '@playwright/test'

const widths = [360, 390, 768, 1024, 1280, 1440]

async function noHorizontalScroll(page: Page) {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }))
  expect(scrollWidth, `page is ${scrollWidth}px wide in a ${innerWidth}px window`).toBeLessThanOrEqual(innerWidth)
}

async function signIn(page: Page, role: 'Verifier' | 'Supervisor' | 'Researcher') {
  await page.goto('/')
  await page.getByLabel('DEMO ROLE').selectOption(role)
  await page.getByLabel('USERNAME').fill('a.lee')
  await page.getByLabel('PASSWORD').fill('demo')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.locator('.topbar')).toBeVisible()
}

async function open(page: Page, module: string) {
  const menu = page.getByRole('button', { name: 'Open menu' })
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('navigation', { name: 'Main navigation' }).last().getByRole('button', { name: module, exact: true }).click()
  await page.waitForTimeout(600)
}

for (const width of widths) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } })

    test('Login', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByRole('heading', { name: 'Staff sign in' })).toBeVisible()
      await noHorizontalScroll(page)
    })

    test('Verify', async ({ page }) => {
      await signIn(page, 'Verifier')
      await open(page, 'Verify')
      await noHorizontalScroll(page)
    })

    test('Cases', async ({ page }) => {
      await signIn(page, 'Verifier')
      await open(page, 'History')
      await noHorizontalScroll(page)
    })

    test('Supervisor staff', async ({ page }) => {
      await signIn(page, 'Supervisor')
      await open(page, 'Staff Accounts')
      await noHorizontalScroll(page)
    })

    test('Research Lab', async ({ page }) => {
      await signIn(page, 'Researcher')
      await open(page, 'Method Comparison')
      await noHorizontalScroll(page)
    })
  })
}
