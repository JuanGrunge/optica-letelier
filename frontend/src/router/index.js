import { createRouter, createWebHistory } from 'vue-router';
import InicioView from '@/views/InicioView.vue';
import ArchivoView from '@/views/ArchivoView.vue';
import IngresarView from '@/views/IngresarView.vue';
import RecetaNuevaView from '@/views/RecetaNuevaView.vue';
import EditarPacienteView from '@/views/EditarPacienteView.vue';
import CuentaView from '@/views/CuentaView.vue';
import LoginView from '@/views/LoginView.vue';
import { useAuthStore } from '@/stores/auth.js';
import { useArchiveStore } from '@/stores/archive.js';
import * as Patients from '@/services/patients.js';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'inicio', component: InicioView },
    { path: '/login', name: 'login', component: LoginView, meta: { requiresAuth: false } },
    { path: '/archivo', name: 'archivo', component: ArchivoView, meta: { requiresAuth: true } },
    { path: '/archivo/:id', name: 'archivo-detalle', component: ArchivoView, meta: { requiresAuth: true } },
    { path: '/ingresar', name: 'paciente-nuevo', component: IngresarView, meta: { requiresAuth: true } },
    { path: '/pacientes/:id/recetas/nueva', name: 'receta-nueva', component: RecetaNuevaView, meta: { requiresAuth: true },
      beforeEnter: async (to) => {
        const idNum = Number(to.params.id);
        if (!Number.isFinite(idNum) || idNum <= 0) return { name: 'archivo' };
        try { await Patients.getById(idNum); return true; } catch { return { name: 'archivo' }; }
      }
    },
    { path: '/pacientes/:id/editar', name: 'paciente-editar', component: EditarPacienteView, meta: { requiresAuth: true } },
    { path: '/cuenta', name: 'cuenta', component: CuentaView, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: { name: 'inicio' } },
  ]
});

router.beforeEach(async (to, from) => {
  const auth = useAuthStore();

  // Esperar hidratación antes de decidir
  try {
    if (!auth.hydrated) await auth.me();
  } catch {}

  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      const redirect = encodeURIComponent(to.fullPath);
      auth.intentAfterLogin = to.fullPath; // compatibilidad
      return { name: 'login', query: { redirect } };
    }
  }

  // Limpiar cache de Archivo al salir a rutas ajenas
  try {
    const archive = useArchiveStore();
    const isArchive = (r) => !!r && (
      r.name === 'archivo' || r.name === 'archivo-detalle' ||
      r.name === 'receta-nueva' || r.name === 'paciente-editar'
    );
    const isFromArchive = isArchive(from);
    const isToArchive = isArchive(to);
    if (isFromArchive && !isToArchive) archive.clear();
  } catch {}
});

// Robust fallback for failed dynamic imports or bad navigations after refresh
router.onError((error) => {
  try {
    const msg = String(error?.message || '');
    if (/Loading chunk|dynamically imported|import\(|fetch/i.test(msg)) {
      window.location.href = '/';
    } else {
      console.error('Router error:', error);
      try { router.replace({ name: 'inicio' }); } catch {}
    }
  } catch {}
});

export default router;
