import { mount } from '@vue/test-utils';
import { axe } from 'vitest-axe';
import { describe, it, expect } from 'vitest';
import Dashboard from '@/pages/Dashboard.vue';
import WorkOrders from '@/pages/WorkOrders.vue';
import { createPinia } from 'pinia';

async function expectA11yOk(cmp:any){
  const w = mount(cmp, { global:{ plugins:[createPinia()] } });
  const r = await axe(w.element as unknown as HTMLElement);
  expect(r.violations, JSON.stringify(r.violations, null, 2)).toHaveLength(0);
}

describe('a11y', () => {
  it('Dashboard erişilebilir', async () => { await expectA11yOk(Dashboard); });
  it('WorkOrders form erişilebilir', async () => { await expectA11yOk(WorkOrders); });
});
