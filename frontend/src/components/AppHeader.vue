<template>
  <header class="c-header">
    <button
      class="c-header__btn c-header__btn--menu"
      data-js="menu"
      type="button"
      aria-label="Abrir menú"
      :aria-expanded="isOpen ? 'true' : 'false'"
      @click="onToggleMenu"
    ></button>
    <div class="c-header__brand">
      <h2 class="brand">
        <router-link to="/" aria-label="Ir a Inicio">
          <img :src="logoSrc" alt="Óptica Letelier" class="logo" />
        </router-link>
      </h2>
    </div>
    <nav class="c-header__nav" data-auth="protected">
      <ul class="c-header__nav_list">
        <li v-if="false">
          <router-link class="c-header__btn" :to="{ name: 'operatives' }" @click="closeMenu" aria-label="Operativos">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="c-header__nav_ic">
              <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/>
                <path d="M6 21v-2a4 4 0 0 1 4 -4h4"/>
                <circle cx="19" cy="19" r="2.2"/>
                <circle cx="19" cy="19" r="1.1"/>
                <path d="M19 15.8v1.2"/>
                <path d="M19 21.9v1.2"/>
                <path d="M15.8 19h1.2"/>
                <path d="M21.9 19h1.2"/>
                <path d="M16.9 16.9l.9.9"/>
                <path d="M21.1 16.9l-.9.9"/>
                <path d="M16.9 21.1l.9-.9"/>
                <path d="M21.1 21.1l-.9-.9"/>
              </g>
            </svg>
            <span class="nav-label" data-label="Operativos">Operativos</span>
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
        <li v-if="auth.hasPerm('createPrescription')">
          <router-link class="c-header__btn" :to="{ name: 'receta-nueva-optico' }" @click="closeMenu" aria-label="Nueva Receta">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="c-header__nav_ic">
              <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <!-- Hoja con pestaña (sin delinear el borde cercano al plus) -->
                <path d="M4 3h10"/>
                <path d="M4 3v14a3 3 0 0 0 3 3h6"/>
                <path d="M14 3l4 4h-2a2 2 0 0 1-2-2z"/>
                <!-- Símbolo Rx (la pierna de la R se fusiona con la X) -->
                <path d="M8 8v8"/>
                <path d="M8 8h3a2 2 0 0 1 0 4H8"/>
                <path d="M11 12l4 4"/>
                <path d="M15 12l-4 4"/>
                <!-- Plus en la esquina, proporciones iguales al resto -->
                <path d="M16 19h6"/>
                <path d="M19 16v6"/>
              </g>
            </svg>
            <span class="nav-label" data-label="Nueva Receta">Nueva Receta</span>
          </router-link>
        </li>
        <!-- Archivo después de acciones de creación -->
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
        <li v-if="auth.hasPerm('manageOperatives')">
          <router-link class="c-header__btn" :to="{ name: 'operatives' }" @click="closeMenu" aria-label="Operativos">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="c-header__nav_ic">
              <g fill="currentColor">
                <!-- Gear (standard solid cog) -->
                <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.65l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.38 7.38 0 0 0-1.63-.95l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.57.23-1.12.56-1.63.95l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.83a.5.5 0 0 0 .12.65l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.83 14.52a.5.5 0 0 0-.12.65l1.92 3.32c.14.24.44.34.7.22l2.39-.96c.51.39 1.05.72 1.63.95l.36 2.54a.5.5 0 0 0 .5.42h3.84a.5.5 0 0 0 .5-.42l.36-2.54c.58-.23 1.12-.56 1.63-.95l2.39.96c.25.12.56.02.7-.22l1.92-3.32a.5.5 0 0 0-.12-.65l-2.03-1.58ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"/>
              </g>
            </svg>
            <span class="nav-label" data-label="Operativos">Operativos</span>
          </router-link>
        </li>
        <!-- Cuenta (solo en móvil), al final -->
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
  </header>
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
  const router = useRouter();
  router.afterEach(() => setOpen(false));
});

onBeforeUnmount(() => {
  try { mq?.removeEventListener?.('change', ()=>{}); } catch {}
});
</script>
