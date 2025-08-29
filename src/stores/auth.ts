import { defineStore } from 'pinia';
import { http } from '@/services/http';

export const useAuthStore = defineStore('auth', {
  state: () => ({ accessToken: '' as string, user: null as any, isAuthed: false as boolean, role: null as string | null }),
  actions: {
    setAccessToken(t: string) {
      this.accessToken = t; this.isAuthed = !!t;
    },
    async login(email: string, password: string) {
      // CSRF al
      await http.get('/auth/csrf');
      const r = await http.post('/auth/login', { email, password });
      this.setAccessToken((r.data as any).accessToken);
      this.user = (r.data as any).user ?? null;
      this.role = this.user?.role ?? null;
    },
    async logout(silent = false) {
      try { await http.post('/auth/logout'); } catch {}
      this.setAccessToken(''); this.user = null; this.role = null;
      if (!silent) location.assign('/login');
      localStorage.setItem('fieldops:logout', String(Date.now())); // cross-tab
    }
  }
});

window.addEventListener('storage', (e) => {
  if (e.key === 'fieldops:logout') {
    const a = useAuthStore(); a.setAccessToken(''); a.user = null; a.role = null;
  }
});
