import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createPinia, setActivePinia } from 'pinia';
import Login from '@/pages/Login.vue';
import { useAuthStore } from '@/stores/auth';

const i18n = createI18n({ legacy: false, locale: 'tr', messages: { tr: {} } });

describe('Login.vue', () => {
  it('geçersiz email hata gösterir', async () => {
    setActivePinia(createPinia());
    const w = mount(Login, { global: { plugins: [i18n] } });
    await w.find('button[type="submit"]').trigger('click');
    expect(w.html()).toContain('En az 8 karakter');
  });

  it('doğru girişte auth.login çağrılır', async () => {
    setActivePinia(createPinia());
    const auth = useAuthStore();
    const spy = vi.spyOn(auth, 'login');

    const w = mount(Login, { global: { plugins: [i18n] } });
    await w.find('input[type="email"]').setValue('user@example.com');
    await w.find('input[placeholder="Şifre"]').setValue('12345678');
    await w.find('button[type="submit"]').trigger('click');

    expect(spy).toHaveBeenCalledWith('user@example.com', '12345678');
  });
});
