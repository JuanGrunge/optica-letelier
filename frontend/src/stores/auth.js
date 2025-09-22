import { defineStore } from 'pinia';
import * as AuthApi from '@/services/auth.js';
import { useArchiveStore } from '@/stores/archive.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: '',
    intentAfterLogin: null,
    hydrated: false,
  }),
  getters: {
    isAuthenticated: (s) => !!s.user,
  },
  actions: {
    async me() {
      try {
        this.loading = true;
        this.error = '';
        const user = await AuthApi.me();
        this.user = user || null;
      } catch (e) {
        this.user = null;
      } finally {
        this.loading = false;
        this.hydrated = true;
      }
    },
    async login(username, password) {
      this.loading = true; this.error = '';
      try {
        const user = await AuthApi.login(username, password);
        this.user = user;
        this.hydrated = true;
      } catch (e) {
        this.error = e?.message || 'Error de autenticación';
        this.user = null;
        throw e;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      try { await AuthApi.logout(); }
      finally {
        this.user = null; this.hydrated = true;
        try { const archive = useArchiveStore(); archive.clear(); } catch {}
      }
    }
  }
});
