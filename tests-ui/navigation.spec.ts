import { expect, test, type Page } from '@playwright/test'

test.use({ viewport: { width: 1440, height: 900 } })

const sidebarItems = (page: Page) => page.locator('aside.sidebar').getByRole('navigation', { name: 'Main navigation' }).getByRole('button')

async function signIn(page: Page, role: 'Verifier' | 'Supervisor' | 'Researcher') {
  await page.goto('/')
  await page.getByLabel('DEMO ROLE').selectOption(role)
  await page.getByRole('button', { name: 'Continue to demo' }).click()
}

test('Verifier: the working system with its 7 modules, Help last, demo bar naming the real model', async ({ page }) => {
  await signIn(page, 'Verifier')
  await expect(sidebarItems(page)).toHaveText(['Dashboard', 'Verify', 'Enrol', 'History', 'Research Lab', 'Settings', 'Help'])
  await expect(page.locator('.demo-bar')).toContainText('real verification model')
  await expect(page.locator('.demo-bar')).toContainText('Nothing you do here is kept')
  await expect(page.locator('.demo-bar.decoy')).toHaveCount(0)
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
    await expect(page.locator('.demo-bar.decoy')).toContainText('does not use the verification model')
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
  await expect(page.locator('.demo-bar')).toContainText('real data stored on this computer')
})

const apiModes = (page: Page) => {
  const modes: string[] = []
  page.on('request', r => { if (new URL(r.url()).pathname.startsWith('/api/')) modes.push(r.headers()['x-data-mode'] ?? new URL(r.url()).searchParams.get('mode') ?? '') })
  return modes
}

test('A Verifier demo starts empty and works only on its own demo data, even with a leftover sample setting', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('signature-desk.data-mode', 'sample'))
  await page.reload()
  await page.getByLabel('DEMO ROLE').selectOption('Verifier')
  const started = page.waitForResponse(r => r.url().includes('/api/demo/start'))
  await page.getByRole('button', { name: 'Continue to demo' }).click()
  expect((await (await started).json()).persons, 'every demo starts empty').toBe(0)
  const modes = apiModes(page)
  await expect(sidebarItems(page)).toHaveCount(7)
  await sidebarItems(page).filter({ hasText: 'Dashboard' }).click()
  await page.waitForTimeout(1500)
  expect(modes.length).toBeGreaterThan(0)
  expect(modes.filter(m => m !== 'demo'), 'every request of a Verifier demo must use the demo copy').toEqual([])
})

test('A signed-in Verifier works only on Real data', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('USERNAME').fill('staff01')
  await page.getByLabel('PASSWORD').fill('demo')
  const modes = apiModes(page)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(sidebarItems(page)).toHaveCount(7)
  await page.waitForTimeout(1500)
  expect(modes.length).toBeGreaterThan(0)
  expect(modes.filter(m => m !== 'real'), 'every request of a signed-in Verifier must use Real data').toEqual([])
})

test('The demo bar can be turned off in Settings and stays off in every role', async ({ page }) => {
  await signIn(page, 'Verifier')
  await sidebarItems(page).filter({ hasText: 'Settings' }).click()
  await page.getByLabel('Show the DEMO bar at the top of every page').uncheck()
  await expect(page.locator('.demo-bar')).toHaveCount(0)
  await page.getByRole('button', { name: 'Log out' }).click()
  await signIn(page, 'Supervisor')
  await expect(page.locator('.demo-bar')).toHaveCount(0)
  await sidebarItems(page).filter({ hasText: 'Settings' }).click()
  await page.getByLabel('Show the DEMO bar at the top of every page').check()
  await expect(page.locator('.demo-bar')).toContainText('decoy')
})

test('Module tabs reach every Verifier page', async ({ page }) => {
  await signIn(page, 'Verifier')
  const tabs = page.getByRole('tablist')
  for (const [module, pages] of [
    ['Dashboard', [['Overview', 'Dashboard'], ['Workbench', 'Workbench'], ['Reports', 'Reports']]],
    ['Verify', [['Verify', 'Verify a signature'], ['Profiles', 'Reference Library'], ['Compare', 'Compare']]],
    ['History', [['Cases', 'Cases'], ['Review Queue', 'Review Queue'], ['Batch Check', 'Batch Check'], ['Evidence Reports', 'Evidence Reports']]],
  ] as const) {
    await sidebarItems(page).filter({ hasText: module }).click()
    for (const [tab, heading] of pages) {
      await tabs.getByRole('tab', { name: tab, exact: true }).click()
      await expect(tabs.getByRole('tab', { name: tab, exact: true })).toHaveAttribute('aria-selected', 'true')
      await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible()
    }
  }
  for (const module of ['Enrol', 'Research Lab', 'Settings']) {
    await sidebarItems(page).filter({ hasText: module }).click()
    await expect(page.locator('.module-tabs')).toHaveCount(0)
  }
})
