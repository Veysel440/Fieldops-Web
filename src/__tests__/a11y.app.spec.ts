import { mount } from '@vue/test-utils';
import App from '@/App.vue';
import { createPinia } from 'pinia';

describe('A11y - App', () => {
  it('axe ihlali yok', async () => {
    const w = mount(App, { global: { plugins: [createPinia()] } });
    await expect(w.element as HTMLElement).toHaveNoViolations();
  });
});
