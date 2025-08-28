import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.route('**/api/auth/login', route => route.fulfill({ json: { accessToken:'a', refreshToken:'b' } }));
  await page.route('**/api/auth/me', route => route.fulfill({ json: { id:1, name:'Admin', email:'a@b.c' } }));
  await page.goto('/');
  await page.click('text=Giriş');
  await page.fill('input[type=email]', 'a@b.c');
  await page.fill('input[type=password]', 'secret');
  await page.click('button:has-text("Giriş")');
  await expect(page.locator('text=Çıkış')).toBeVisible();
});
