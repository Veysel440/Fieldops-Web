import { test, expect } from '@playwright/test';

test('403 → unauthorized', async ({ page }) => {
  await page.route('**/auth/login', r => r.fulfill({ json: { accessToken:'t', user:{ id:1, role:'viewer'} } }));
  await page.goto('/login');
  await page.getByPlaceholder(/E-posta/).fill('v@v');
  await page.getByPlaceholder(/Şifre/).fill('x');
  await page.getByRole('button', { name:/Giriş/ }).click();

  await page.goto('/assets');
  await expect(page).toHaveURL(/unauthorized/);
  await expect(page.getByText(/Yetkisiz|Unauthorized/i)).toBeVisible();
});
