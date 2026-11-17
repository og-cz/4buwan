import { expect, test, type Page } from '@playwright/test'

test.use({ viewport: { width: 1440, height: 900 } })

const sidebarItems = (page: Page) => page.locator('aside.sidebar').getByRole('navigation', { name: 'Main navigation' }).getByRole('button')

async function signIn(page: Page, role: 'Verifier' | 'Supervisor' | 'Researcher') {
  await page.goto('/')
  await page.getByLabel('DEMO ROLE').selectOption(role)
  await page.getByRole('button', { name: 'Continue to demo' }).click()
}

test('Verifier: the working system with its 7 modules, Help last, no demo bar', async ({ page }) => {
  await signIn(page, 'Verifier')
  await expect(sidebarItems(page)).toHaveText(['Dashboard', 'Verify', 'Enrol', 'History', 'Research Lab', 'Settings', 'Help'])
  await expect(page.locator('.demo-bar')).toHaveCount(0)
  await expect(page.getByRole('group', { name: 'View' })).toHaveCount(0)   // no Simple / Expert switch
})

for (const [role, modules] of [
  ['Supervisor', ['Dashboard', 'Verify', 'Enrol', 'History', 'Review Queue', 'Staff Accounts', 'Settings', 'Help']],
  ['Researcher', ['Dashboard', 'Verify', 'Enrol', 'History', 'Review Queue', 'Staff Accounts', 'Method Comparison', 'Dataset Check', 'Settings', 'Help']],
] as const) {
  test(`${role}: demonstration modules, yellow demo bar, no request to the analysis service`, async ({ page }) => {
    await signIn(page, role)
    const api: string[] = []
    page.on('request', r => { if (new URL(r.url()).pathname.startsWith('/api/')) api.push(r.url()) })
    await expect(sidebarItems(page)).toHaveText([...modules])
    await expect(page.locator('.demo-bar')).toContainText('does not use the verification model')
    for (const m of modules) { await sidebarItems(page).filter({ hasText: m }).click(); await page.waitForTimeout(200) }
    await page.waitForTimeout(5500)   // longer than the 5 s health interval
    expect(api, `the ${role} demo must not call the analysis service`).toEqual([])
  })
}

test('Sign in needs a username and password and opens the Verifier', async ({ page }) => {
  await page.goto('/')
  const signInButton = page.getByRole('button', { name: 'Sign in' })
  await expect(signInButton).toBeDisabled()
  await page.getByLabel('USERNAME').fill('staff01')
  await page.getByLabel('PASSWORD').fill('demo')
  await signInButton.click()
  await expect(sidebarItems(page)).toHaveText(['Dashboard', 'Verify', 'Enrol', 'History', 'Research Lab', 'Settings', 'Help'])
  await expect(page.getByText('staff01')).toBeVisible()
})

test('Verifier never reads Sample data, even with a leftover sample setting in the browser', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('signature-desk.data-mode', 'sample'))
  await page.reload()
  const modes: string[] = []
  page.on('request', r => { if (new URL(r.url()).pathname.startsWith('/api/')) modes.push(r.headers()['x-data-mode'] ?? new URL(r.url()).searchParams.get('mode') ?? '') })
  await signIn(page, 'Verifier')
  await expect(sidebarItems(page)).toHaveCount(7)
  await page.waitForTimeout(1500)
  expect(modes.length).toBeGreaterThan(0)
  expect(modes.filter(m => m !== 'real'), 'every Verifier request must use Real data').toEqual([])
})
