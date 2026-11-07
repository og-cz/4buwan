import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 1440, height: 900 } })

const sidebarItems = (page: import('@playwright/test').Page) =>
  page.locator('aside.sidebar').getByRole('navigation', { name: 'Main navigation' }).getByRole('button')

test('Examiner sidebar has exactly the 8 main items, Help last', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Examiner demo/ }).click()
  await expect(sidebarItems(page)).toHaveText(['Workbench', 'Cases & Review', 'Examination', 'Profiles & Library', 'Batch Check', 'Evidence Reports', 'Research Lab', 'Help'])
  await sidebarItems(page).filter({ hasText: 'Examination' }).click()
  await expect(page.getByRole('tab', { name: 'Verify against a profile' })).toBeVisible()
  await page.getByRole('tab', { name: 'Compare images' }).click()
  await expect(page.getByRole('heading', { name: 'Compare' })).toBeVisible()
})

test('Supervisor sidebar has exactly the 6 main items and makes no API request', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Supervisor demo/ }).click()
  // Count only what the Supervisor demo does after sign-in (the sign-in page itself checks the service once).
  const api: string[] = []
  page.on('request', r => { if (new URL(r.url()).pathname.startsWith('/api/')) api.push(r.url()) })
  await expect(sidebarItems(page)).toHaveText(['Dashboard', 'Clients & Enrollment', 'Cases & Reviews', 'Batch Check', 'Reports & Research', 'System & Help'])
  await expect(page.getByText('Supervisor Demo — Simulated Data').first()).toBeVisible()
  for (const item of ['Clients & Enrollment', 'Cases & Reviews', 'Batch Check', 'Reports & Research', 'System & Help', 'Dashboard']) {
    await sidebarItems(page).filter({ hasText: item }).click()
    await page.waitForTimeout(300)
  }
  await sidebarItems(page).filter({ hasText: 'Cases & Reviews' }).click()
  await page.getByRole('tab', { name: 'Verify (simulated)' }).click()
  await page.getByRole('button', { name: 'Run simulated check' }).click()
  await page.waitForTimeout(6000)   // longer than the 5 s health interval
  expect(api, 'the Supervisor demo must not call the analysis service').toEqual([])
})
