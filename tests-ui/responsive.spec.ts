import { expect, test, type Page } from '@playwright/test'

const widths = [360, 390, 768, 1024, 1280, 1440]

async function noHorizontalScroll(page: Page) {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }))
  expect(scrollWidth, `page is ${scrollWidth}px wide in a ${innerWidth}px window`).toBeLessThanOrEqual(innerWidth)
}

async function signIn(page: Page, preset: 'Examiner demo' | 'Supervisor demo') {
  await page.goto('/')
  await page.getByRole('button', { name: new RegExp(preset) }).click()
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
      await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
      await noHorizontalScroll(page)
    })

    test('Verify', async ({ page }) => {
      await signIn(page, 'Examiner demo')
      await open(page, 'Examination')
      await noHorizontalScroll(page)
    })

    test('Cases', async ({ page }) => {
      await signIn(page, 'Examiner demo')
      await open(page, 'Cases & Review')
      await noHorizontalScroll(page)
    })

    test('Supervisor cases', async ({ page }) => {
      await signIn(page, 'Supervisor demo')
      await open(page, 'Cases & Reviews')
      await noHorizontalScroll(page)
    })

    test('Research Lab', async ({ page }) => {
      await signIn(page, 'Examiner demo')
      await open(page, 'Research Lab')
      await noHorizontalScroll(page)
    })
  })
}
