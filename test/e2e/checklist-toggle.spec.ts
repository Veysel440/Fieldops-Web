import { test, expect } from '@playwright/test';

test('checklist toggle optimistic', async ({ page }) => {
  await page.route('**/api/work-orders/1/checklist', route => route.fulfill({ json: { data:[{id:10,title:'A',done:false}] } }));
  await page.route('**/api/work-orders/1/checklist/10', route => route.fulfill({ json: { ok:true } }));
  await page.goto('/work-orders/1');
  const cb = page.locator('input[type=checkbox]').first();
  await cb.check();
  await expect(page.locator('text=A')).toBeVisible();
});
