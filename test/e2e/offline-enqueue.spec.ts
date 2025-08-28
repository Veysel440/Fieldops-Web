import { test, expect } from '@playwright/test';

test('enqueue when offline', async ({ page }) => {
  await page.route('**/api/work-orders', route => route.fulfill({ json: { data:[], total:0 } }));
  await page.goto('/work-orders');
  await page.addInitScript(() => Object.defineProperty(navigator, 'onLine', { get: () => false }));
  await page.fill('input[placeholder="Kod"]', 'W1');
  await page.fill('input[placeholder="Başlık"]', 'Test');
  await page.fill('input[placeholder="MüşteriID"]', '1');
  await page.click('button:has-text("Kaydet")');
  await expect(page.locator('text:has("offline")')).toBeVisible();
});
