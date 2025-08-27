import { createI18n } from 'vue-i18n';
const tr = { login: 'Giriş', logout: 'Çıkış', dashboard: 'Özet', workOrders: 'İş Emirleri' };
const en = { login: 'Login', logout: 'Logout', dashboard: 'Dashboard', workOrders: 'Work Orders' };
export const i18n = createI18n({ legacy: false, locale: 'tr', messages: { tr, en } });
