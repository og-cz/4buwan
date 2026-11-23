import { expect, test, type Page } from '@playwright/test'

test.use({ viewport: { width: 1440, height: 900 } })

const VERIFIER = ['Dashboard', 'Verify', 'Batch Check', 'Compare', 'Review Queue', 'Profiles', 'Enrol', 'History', 'Evidence Reports', 'Statistics', 'Research Lab', 'Settings', 'Help']
const sidebarItems = (page: Page) => page.locator('aside.sidebar').getByRole('navigation', { name: 'Main navigation' }).getByRole('button')

async function signIn(page: Page, role: 'Verifier' | 'Supervisor' | 'Researcher') {
  await page.goto('/')
  await page.getByLabel('DEMO ROLE').selectOption(role)
  await page.getByRole('button', { name: 'Continue to demo' }).click()
}

test('Verifier: the working system with its 13 pages in categories, Help last, demo bar naming the real model', async ({ page }) => {
  await signIn(page, 'Verifier')
  await expect(sidebarItems(page)).toHaveText(VERIFIER)
  await expect(page.locator('.demo-bar')).toContainText('real verification model')
  await expect(page.locator('.demo-bar')).toContainText('Nothing you do here is kept')
  await expect(page.locator('.demo-bar.decoy')).toHaveCount(0)
  await expect(page.getByRole('group', { name: 'View' })).toHaveCount(0)   // no Simple / Expert switch
})

for (const [role, modules] of [
  ['Supervisor', ['Dashboard', 'Verify', 'Review Queue', 'Enrol', 'History', 'Staff Accounts', 'Settings', 'Help']],
  ['Researcher', ['Dashboard', 'Verify', 'Review Queue', 'Enrol', 'History', 'Method Comparison', 'Dataset Check', 'Staff Accounts', 'Settings', 'Help']],
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
  await expect(sidebarItems(page)).toHaveText(VERIFIER)
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
  await expect(sidebarItems(page)).toHaveCount(13)
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
  await expect(sidebarItems(page)).toHaveCount(13)
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

test('Every Verifier page opens from the sidebar, under its category', async ({ page }) => {
  await signIn(page, 'Verifier')
  await expect(page.locator('aside.sidebar .nav-label')).toHaveText(['EXAMINE', 'LIBRARY', 'EVIDENCE', 'SYSTEM'])
  for (const [item, heading] of [['Dashboard', 'Dashboard'], ['Verify', 'Verify a signature'], ['Batch Check', 'Batch Check'], ['Compare', 'Compare'],
    ['Review Queue', 'Review Queue'], ['Profiles', 'Reference Library'], ['Enrol', 'Enrol a person'], ['History', 'Cases'],
    ['Evidence Reports', 'Evidence Reports'], ['Statistics', 'Reports'], ['Settings', 'Settings'], ['Help', 'Help']] as const) {
    await sidebarItems(page).filter({ hasText: new RegExp(`^${item}$`) }).click()
    await expect(sidebarItems(page).filter({ hasText: new RegExp(`^${item}$`) })).toHaveAttribute('aria-current', 'page')
    await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible()
  }
})

test('Batch Check takes the CSV before or after the images and says what it matched', async ({ page }) => {
  await signIn(page, 'Verifier')
  await sidebarItems(page).filter({ hasText: 'Batch Check' }).click()
  const csv = { name: 'batch.csv', mimeType: 'text/csv', buffer: Buffer.from('file,person_id\nq1.png,NOT-ENROLLED\n') }
  await page.locator('input[type=file][accept=".csv,text/csv"]').setInputFiles(csv)
  await expect(page.getByText('batch.csv loaded (1 file listed)')).toBeVisible()
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
  await page.locator('input[type=file][accept="image/*"]').setInputFiles({ name: 'q1.png', mimeType: 'image/png', buffer: png })
  await expect(page.getByText('batch.csv: 0 of 1 images assigned. Not enrolled yet: NOT-ENROLLED.')).toBeVisible()
})
