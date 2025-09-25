<template>
  <span class="c-header__btn c-header__btn--menu" data-js="menu" aria-label="Abrir menú" :aria-expanded="isOpen ? 'true' : 'false'" @click="onToggleMenu"></span>
  <div class="c-header__brand">
    <h2 class="brand">
      <router-link to="/" aria-label="Ir a Inicio">
        <img :src="logoSrc" alt="Óptica Letelier" class="logo" />
      </router-link>
    </h2>
  </div>
  <nav class="c-header__nav" data-auth="protected">
    <ul class="c-header__nav_list">
      <li class="nav-account mobile-only" v-if="isAuth">
        <router-link class="c-header__btn" :to="{ name: 'cuenta' }" @click="closeMenu" aria-label="Cuenta">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="c-header__nav_ic">
            <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z"/>
              <path d="M4 21a8 8 0 0 1 16 0"/>
            </g>
          </svg>
          <span class="nav-label" data-label="Cuenta">Cuenta</span>
          <span class="badge badge--pill" :class="roleClass" style="margin-left:auto;">{{ userLabel }}</span>
        </router-link>
      </li>
      <li>
        <router-link class="c-header__btn" :to="{ name: 'archivo' }" @click="closeMenu" aria-label="Archivo">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="c-header__nav_ic">
            <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 19a9 9 0 0 1 9 -9h9"/>
              <path d="M3 6h18"/>
              <path d="M3 6v13a2 2 0 0 0 2 2h13"/>
            </g>
          </svg>
          <span class="nav-label" data-label="Archivo">Archivo</span>
        </router-link>
      </li>
      <li v-if="auth.hasPerm('createPatient')">
        <router-link class="c-header__btn" :to="{ name: 'paciente-nuevo' }" @click="closeMenu" aria-label="Nuevo Paciente">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="c-header__nav_ic">
            <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/>
              <path d="M6 21v-2a4 4 0 0 1 4 -4h4"/>
              <path d="M16 19h6"/>
              <path d="M19 16v6"/>
            </g>
          </svg>
          <span class="nav-label" data-label="Nuevo Paciente">Nuevo Paciente</span>
        </router-link>
      </li>
      <li v-if="auth.hasPerm('manageOperatives')">
        <router-link class="c-header__btn" :to="{ name: 'operatives' }" @click="closeMenu" aria-label="Operativos">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="c-header__nav_ic">
            <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09c.7 0 1.31-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 3.7l.06.06c.46.46 1.13.6 1.72.39.59-.21 1.03-.73 1.13-1.35V3a2 2 0 1 1 4 0v.09c.1.62.54 1.14 1.13 1.35.59.21 1.26.07 1.72-.39l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.46.46-.6 1.13-.39 1.72.21.59.73 1.03 1.35 1.13H21a2 2 0 1 1 0 4h-.09c-.62.1-1.14.54-1.35 1.13z"/>
            </g>
          </svg>
          <span class="nav-label" data-label="Operativos">Operativos</span>
        </router-link>
      </li>
    </ul>
  </nav>
  <div class="c-header__session" data-auth="protected">
    <router-link v-if="isAuth" id="userBadge" class="user-badge desktop-only" :to="{ name: 'cuenta' }" aria-label="Ir a Cuenta">
      <span class="badge badge--pill" :class="roleClass">{{ userLabel }}</span>
    </router-link>
    <button v-if="isAuth" @click="logout" class="c-header__btn" type="button" aria-label="Cerrar sesión" title="Cerrar sesión">
      <svg viewBox="0 0 24 24" aria-hidden="true" class="c-header__nav_ic">
        <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <path d="M7 12h11"/>
          <path d="M10 9l-3 3l3 3"/>
        </g>
      </svg>
      <span class="nav-label" data-label="Cerrar sesión">Cerrar sesión</span>
    </button>
  </div>
  <div class="c-switch menu-toggle">
    <ThemeToggle />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import ThemeToggle from '@/components/ThemeToggle.vue';
const auth = useAuthStore();
const isAuth = computed(() => auth.isAuthenticated);
const userLabel = computed(() => auth.user?.username || '');
function pickPrimaryRole(u){
  const roles = Array.isArray(u?.roles) ? u.roles : (u?.role ? [u.role] : []);
  // normalizar y priorizar ADMIN > OPTICO > RECEPTOR
  const norm = roles.map(r => String(r).replace(/^ROLE_/, ''));
  if (norm.includes('ADMIN')) return 'ADMIN';
  if (norm.includes('OPTICO')) return 'OPTICO';
  if (norm.includes('RECEPTOR')) return 'RECEPTOR';
  return '';
}
const roleKey = computed(() => pickPrimaryRole(auth.user));
const roleClass = computed(() => `badge--role-${(roleKey.value||'').toLowerCase()}`);
const logout = () => auth.logout();
const logoSrc = '/assets/img/logo.png';

const isOpen = ref(false);
let mq;
function setOpen(v){
  isOpen.value = !!v;
  try { document.querySelector('.c-header')?.classList.toggle('is-open', isOpen.value); } catch {}
}
function onToggleMenu(){ if (!mq || !mq.matches) return; setOpen(!isOpen.value); }
function closeMenu(){ setOpen(false); }

onMounted(() => {
  mq = window.matchMedia('(max-width: 768px)');
  const handler = (e) => { if (!e.matches) setOpen(false); };
  mq.addEventListener?.('change', handler);
  // Cerrar al navegar
  const router = useRouter();
  router.afterEach(() => setOpen(false));
});
onBeforeUnmount(() => { try { mq?.removeEventListener?.('change', ()=>{}); } catch {} });
</script>
