import { createRouter, createWebHistory } from 'vue-router';
import InicioView from '@/views/InicioView.vue';
import ArchivoView from '@/views/ArchivoView.vue';
import IngresarView from '@/views/IngresarView.vue';
import RecetaNuevaView from '@/views/RecetaNuevaView.vue';
import EditarPacienteView from '@/views/EditarPacienteView.vue';
import CuentaView from '@/views/CuentaView.vue';
import { useAuthStore } from '@/stores/auth.js';
import { useArchiveStore } from '@/stores/archive.js';

const router = createRouter({
  history: createWebHistory(''),
  routes: [
    { path: '/', name: 'inicio', component: InicioView },
    { path: '/archivo', name: 'archivo', component: ArchivoView, meta: { requiresAuth: true } },
    { path: '/archivo/:id', name: 'archivo-detalle', component: ArchivoView, meta: { requiresAuth: true } },
    { path: '/ingresar', name: 'ingresar', component: IngresarView, meta: { requiresAuth: true } },
    { path: '/pacientes/:id/recetas/nueva', name: 'receta-nueva', component: RecetaNuevaView, meta: { requiresAuth: true } },
    { path: '/pacientes/:id/editar', name: 'paciente-editar', component: EditarPacienteView, meta: { requiresAuth: true } },
    { path: '/cuenta', name: 'cuenta', component: CuentaView, meta: { requiresAuth: true } },
  ]
});

router.beforeEach((to, from) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // Solo preservar intención en rutas donde tiene sentido (ej: detalle archivo)
    if (to.name === 'archivo-detalle') auth.intentAfterLogin = to.fullPath;
    else auth.intentAfterLogin = null;
    return { name: 'inicio' };
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

export default router;
