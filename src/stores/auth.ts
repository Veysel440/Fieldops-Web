import { defineStore } from 'pinia';
import { loginApi, meApi, refreshApi, logoutApi, type Tokens, type User } from '@/services/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null as User|null, tokens: null as Tokens|null, initialized: false }),
  getters: { isAuthed: (s) => !!s.tokens?.accessToken, role: (s) => s.user?.role },
  actions: {
    async bootstrap() {
      const raw = localStorage.getItem('auth'); if (raw) this.tokens = JSON.parse(raw);
      if (this.tokens) try { this.user = await meApi(); } catch { await this.tryRefresh(); }
      this.initialized = true;
    },
    async login(email: string, password: string) {
      this.tokens = await loginApi({ email, password });
      localStorage.setItem('auth', JSON.stringify(this.tokens));
      this.user = await meApi();
    },
    async tryRefresh() {
      if (!this.tokens?.refreshToken) return;
      this.tokens = await refreshApi(this.tokens.refreshToken);
      localStorage.setItem('auth', JSON.stringify(this.tokens));
      this.user = await meApi();
    },
    async logout() { try { await logoutApi(); } finally {
      this.tokens = null; this.user = null; localStorage.removeItem('auth'); } }
  }
});
