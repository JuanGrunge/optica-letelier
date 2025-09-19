import { createRouter, createWebHistory } from 'vue-router';
import InicioView from '@/views/InicioView.vue';
import ArchivoView from '@/views/ArchivoView.vue';
import IngresarView from '@/views/IngresarView.vue';
import RecetaNuevaView from '@/views/RecetaNuevaView.vue';
import EditarPacienteView from '@/views/EditarPacienteView.vue';
import { useAuthStore } from '@/stores/auth.js';

const router = createRouter({
  history: createWebHistory(''),
  routes: [
    { path: '/', name: 'inicio', component: InicioView },
    { path: '/archivo', name: 'archivo', component: ArchivoView, meta: { requiresAuth: true } },
    { path: '/archivo/:id', name: 'archivo-detalle', component: ArchivoView, meta: { requiresAuth: true } },
    { path: '/ingresar', name: 'ingresar', component: IngresarView, meta: { requiresAuth: true } },
    { path: '/pacientes/:id/recetas/nueva', name: 'receta-nueva', component: RecetaNuevaView, meta: { requiresAuth: true } },
    { path: '/pacientes/:id/editar', name: 'paciente-editar', component: EditarPacienteView, meta: { requiresAuth: true } },
  ]
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    auth.intentAfterLogin = to.fullPath;
    return { name: 'inicio' };
  }
});

export default router;
