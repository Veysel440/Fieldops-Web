import { test, expect } from '@playwright/test';

test('SW update toast ve kabul', async ({ page }) => {
  await page.goto('/');
  await page.addInitScript(() => { (window as any).__updated = false; (window as any).FieldOpsUpdate = () => { (window as any).__updated = true; }; });
  await page.evaluate(() => {
    const ev = new CustomEvent('FIELDOPS_TOAST');
    (window as any).bus?.emit?.('toast', { type:'info', text:'Yeni sürüm hazır. Yenile için tıkla.' });
  });
  const btn = page.getByRole('button', { name:/Yenile/i });
  await btn.click();
  await expect(page.evaluate(()=> (window as any).__updated)).resolves.toBeTruthy();
});
