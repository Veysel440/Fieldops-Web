import { mount, RouterLinkStub } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createPinia, setActivePinia } from 'pinia';
import App from '@/App.vue';

const i18n = createI18n({ legacy: false, locale: 'tr', messages: { tr: {} } });

describe('App.vue', () => {
  it('navbar başlıklarını render eder', () => {
    setActivePinia(createPinia());
    const w = mount(App, {
      global: {
        plugins: [i18n],
        stubs: { RouterLink: RouterLinkStub, RouterView: true, QueueIndicator: true }
      }
    });
    const t = w.text();
    expect(t).toContain('Özet');
    expect(t).toContain('İş Emirleri');
    expect(t).toContain('Müşteriler');
    expect(t).toContain('Varlıklar');
    expect(t).toContain('Harita');
  });
});
