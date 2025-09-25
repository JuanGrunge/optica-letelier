import { defineStore } from 'pinia';
import * as AuthApi from '@/services/auth.js';
import * as Operatives from '@/services/operatives.js';
import { useArchiveStore } from '@/stores/archive.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: '',
    intentAfterLogin: null,
    hydrated: false,
    role: '',
    operativeId: null,
    operativeLabel: '',
    operativeDireccion: '',
    operativeComuna: '',
  }),
  getters: {
    isAuthenticated: (s) => !!s.user,
    hasOperative: (s) => s.operativeId != null && Number.isFinite(Number(s.operativeId)),
    permissions: (s) => {
      const base = { account: true };
      switch (s.role) {
        case 'admin':
          return { ...base, viewArchive: true, createPatient: true, editPatient: true, createPrescription: true, deletePatient: true, deletePrescription: true, deleteInvoice: true, manageOperatives: true };
        case 'optico':
          return { ...base, viewArchive: true, createPatient: false, editPatient: false, createPrescription: true };
        case 'receptor':
          return { ...base, viewArchive: true, createPatient: true, editPatient: false, createPrescription: false };
        default:
          return base;
      }
    },
  },
  actions: {
    _pickPrimaryRole(u){
      const roles = Array.isArray(u?.roles) ? u.roles : (u?.role ? [u.role] : []);
      const norm = roles.map(r => String(r).replace(/^ROLE_/i, '').toUpperCase());
      if (norm.includes('ADMIN')) return 'admin';
      if (norm.includes('OPTICO')) return 'optico';
      if (norm.includes('RECEPTOR')) return 'receptor';
      return '';
    },
    hasPerm(perm){ return !!this.permissions?.[perm]; },
    async me() {
      try {
        this.loading = true;
        this.error = '';
        const user = await AuthApi.me();
        this.user = user || null;
        this.role = this._pickPrimaryRole(user);
      } catch (e) {
        this.user = null;
        this.role = '';
      } finally {
        this.loading = false;
        this.hydrated = true;
        // restore operative selection from sessionStorage (scoped to session/tab)
        try {
          const raw = sessionStorage.getItem('operativeSelection');
          if (raw) {
            const obj = JSON.parse(raw);
            this.operativeId = obj?.id ?? null;
            this.operativeLabel = obj?.label || '';
            this.operativeDireccion = obj?.direccion || '';
            this.operativeComuna = obj?.comuna || '';
          }
        } catch {}
        // validate selection against active operatives (if present)
        try { await this.validateOperativeActive(); } catch {}
      }
    },
    async login(username, password) {
      this.loading = true; this.error = '';
      try {
        const user = await AuthApi.login(username, password);
        this.user = user;
        this.role = this._pickPrimaryRole(user);
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
        this.user = null; this.role = ''; this.hydrated = true;
        try { const archive = useArchiveStore(); archive.clear(); } catch {}
        // Clear session-scoped selection on logout
        this.operativeId = null; this.operativeLabel = '';
        this.operativeDireccion = ''; this.operativeComuna = '';
        try { sessionStorage.removeItem('operativeSelection'); } catch {}
      }
    }
    ,
    setOperativeSelection(id, label='', direccion='', comuna=''){
      this.operativeId = (id != null ? Number(id) : null);
      this.operativeLabel = label || '';
      this.operativeDireccion = direccion || '';
      this.operativeComuna = comuna || '';
      try {
        sessionStorage.setItem('operativeSelection', JSON.stringify({
          id: this.operativeId,
          label: this.operativeLabel,
          direccion: this.operativeDireccion,
          comuna: this.operativeComuna
        }));
      } catch {}
    },
    async validateOperativeActive(){
      if (this.operativeId == null) return;
      try {
        const page = await Operatives.listActive({ page: 0, size: 200 });
        const list = Array.isArray(page?.content) ? page.content : (Array.isArray(page) ? page : []);
        const found = list.some(o => Number(o.id) === Number(this.operativeId));
        if (!found) {
          // Clear selection if deactivated or missing
          this.operativeId = null; this.operativeLabel = '';
          this.operativeDireccion = ''; this.operativeComuna = '';
          try { sessionStorage.removeItem('operativeSelection'); } catch {}
        }
      } catch {
        // network or auth issues: keep current selection optimistic
      }
    }
  }
});
