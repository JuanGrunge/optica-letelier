<template>
  <section class="view active" id="inicio">
    <transition name="card-fade" mode="out-in">
      <div class="c-card" key="home-card">
        <h2>{{ greeting }}</h2>
        <p class="subtle">¿Dónde quieres navegar?</p>

        <div v-if="!hasOperative && auth.role !== 'admin'" class="alert-banner alert-banner--warning" role="region" aria-label="Operativos disponibles">
          <div class="alert-banner__title">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16h.01"/></g></svg>
            <span>Selecciona tu lugar de operativo para habilitar edición y registro.</span>
            <RouterLink class="op-banner__link" :to="{ name: 'cuenta' }">Ir a Cuenta</RouterLink>
          </div>
        </div>

        <div v-else-if="auth.role !== 'admin'" class="op-banner op-banner--ok" role="region" aria-label="Operativo seleccionado">
          <div class="op-banner__title">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3l5-5"/></g></svg>
            <span>Tu lugar de operativo</span>
            <RouterLink class="op-banner__link" :to="{ name: 'cuenta' }">cambiar lugar de operativo</RouterLink>
          </div>
          <div class="op-banner__meta">
            <span class="op-banner__count">{{ selectedLabel || '-' }}</span>
            <template v-if="selectedAddr">
              <a v-if="isAndroid()" class="op-banner__addr" :href="linkForAndroid(selectedDireccion, selectedComuna)" aria-label="Abrir lugar operativo en mapas">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle; margin-right:6px;"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></g></svg>
                {{ selectedAddr }}
              </a>
              <a v-else-if="!isIOS()" class="op-banner__addr" :href="linkForDesktop(selectedDireccion, selectedComuna)" target="_blank" rel="noopener" aria-label="Abrir en Google Maps">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle; margin-right:6px;"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></g></svg>
                {{ selectedAddr }}
              </a>
              <a v-else class="op-banner__addr" :href="linkForIOS(selectedDireccion, selectedComuna)" aria-label="Abrir lugar operativo en mapas">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle; margin-right:6px;"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></g></svg>
                {{ selectedAddr }}
              </a>
            </template>
          </div>
        </div>

        <div class="app-actions">
          <RouterLink class="app-action" :to="{ name: 'cuenta' }" role="button" aria-label="Ir a Cuenta">
            <div class="app-action__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z"/>
                  <path d="M4 21a8 8 0 0 1 16 0"/>
                </g>
              </svg>
            </div>
            <div class="app-action__content">
              <div class="app-action__title">Cuenta</div>
              <div class="app-action__desc">Accede a la información de tu sesión y selecciona tu lugar de operativo.</div>
            </div>
          </RouterLink>

          <RouterLink v-if="auth.hasPerm('manageOperatives')" class="app-action" :to="{ name: 'operatives' }" role="button" aria-label="Ir a Operativos">
            <div class="app-action__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" aria-hidden="true">
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
            </div>
            <div class="app-action__content">
              <div class="app-action__title">Operativos</div>
              <div class="app-action__desc">Administra los operativos activos e inactivos.</div>
            </div>
          </RouterLink>

          <RouterLink class="app-action" :to="{ name: 'archivo' }" role="button" aria-label="Ir a Archivo">
            <div class="app-action__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 19a9 9 0 0 1 9 -9h9"/>
                  <path d="M3 6h18"/>
                  <path d="M3 6v13a2 2 0 0 0 2 2h13"/>
                </g>
              </svg>
            </div>
            <div class="app-action__content">
              <div class="app-action__title">Archivo</div>
              <div class="app-action__desc">Busca pacientes por RUT y revisa su ficha, recetas y boletas.</div>
            </div>
          </RouterLink>

          <RouterLink v-if="auth.hasPerm('createPatient')" class="app-action" :class="{ 'is-disabled': !hasOperative }" :title="!hasOperative ? 'Selecciona tu lugar de operativo' : null" :to="{ name: 'paciente-nuevo' }" role="button" aria-label="Ir a Nuevo Paciente">
            <div class="app-action__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/>
                  <path d="M6 21v-2a4 4 0 0 1 4 -4h4"/>
                  <path d="M16 19h6"/>
                  <path d="M19 16v6"/>
                </g>
              </svg>
            </div>
            <div class="app-action__content">
              <div class="app-action__title">Nuevo Paciente</div>
              <div class="app-action__desc">Registra un nuevo paciente.</div>
            </div>
          </RouterLink>

          <RouterLink v-if="auth.hasPerm('createPrescription')" class="app-action" :class="{ 'is-disabled': !hasOperative && auth.role!=='admin' }" :title="(!hasOperative && auth.role!=='admin') ? 'Selecciona tu lugar de operativo' : null" :to="{ name: 'receta-nueva-optico' }" role="button" aria-label="Ir a Nueva Receta">
            <div class="app-action__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 3h10"/>
                  <path d="M4 3v14a3 3 0 0 0 3 3h6"/>
                  <path d="M14 3l4 4h-2a2 2 0 0 1-2-2z"/>
                  <path d="M8 8v8"/>
                  <path d="M8 8h3a2 2 0 0 1 0 4H8"/>
                  <path d="M11 12l4 4"/>
                  <path d="M15 12l-4 4"/>
                  <path d="M16 19h6"/>
                  <path d="M19 16v6"/>
                </g>
              </svg>
            </div>
            <div class="app-action__content">
              <div class="app-action__title">Nueva Receta</div>
              <div class="app-action__desc">Busca al paciente por RUT y registra su receta.</div>
            </div>
          </RouterLink>
        </div>
      </div>
    </transition>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.js';
import * as Operatives from '@/services/operatives.js';
import { isAndroid, isIOS, linkForAndroid, linkForDesktop, linkForIOS } from '@/composables/maps.js';

const auth = useAuthStore();
const user = computed(() => auth.user?.username || '');
const greeting = computed(() => {
  const h = new Date().getHours();
  const base = h < 12 ? 'Buenos días' : (h < 19 ? 'Buenas tardes' : 'Buenas noches');
  return user.value ? `${base}, ${user.value}` : base;
});
const hasOperative = computed(() => auth.hasOperative);
const opCount = ref(0);
onMounted(async () => {
  try { opCount.value = await Operatives.countActive(); } catch { opCount.value = 0; }
});
const selectedLabel = computed(() => auth.operativeLabel || '');
const selectedAddr = computed(() => {
  const parts = [];
  if (auth.operativeDireccion) parts.push(auth.operativeDireccion);
  if (auth.operativeComuna) parts.push(auth.operativeComuna);
  return parts.join(', ');
});
const selectedDireccion = computed(() => auth.operativeDireccion || '');
const selectedComuna = computed(() => auth.operativeComuna || '');
</script>

<style scoped>
.app-actions{ display:grid; grid-template-columns: 1fr; gap: var(--space-4); margin-top: var(--space-4); }
.app-action{ display:grid; grid-template-columns: 84px 1fr; align-items:center; gap: var(--space-4); padding: var(--space-4); border-radius: var(--radius-lg); background: color-mix(in oklab, var(--color-surface) 92%, #000); color: inherit; border: 1px solid var(--color-border); box-shadow: var(--shadow-1); text-decoration:none; transition: transform .06s ease, filter .15s ease, background-color .15s ease, box-shadow .15s ease; }
.app-action:focus{ outline:none; }
.app-action:hover{ filter:brightness(1.02); box-shadow: 0 10px 28px rgba(0,0,0,.12); }
.app-action:active{ transform: translateY(1px); }
.app-action__icon{ width: 84px; height: 84px; border-radius: var(--radius-md); display:grid; place-items:center; background: color-mix(in oklab, var(--color-accent) 16%, var(--color-surface)); color: var(--color-accent); border: 1px solid color-mix(in oklab, var(--color-accent) 32%, var(--color-border)); }
.app-action__icon{ font-size: 40px; }
.app-action__icon svg{ width: 1em; height: 1em; }
.app-action__title{ font-size: 1.25rem; font-weight: 700; margin: 0 0 4px; }
.app-action__desc{ color: var(--color-text-muted); }
.app-action.is-disabled{ pointer-events: none; opacity: .6; filter: grayscale(25%); }
.op-banner{ margin-top: var(--space-3); padding: var(--space-3); border:1px solid color-mix(in oklab, var(--alert-success-bg) 38%, transparent); border-radius: var(--radius-md); background: color-mix(in oklab, var(--alert-success-bg) 22%, transparent); color: var(--color-text); }
.op-banner__title{ font-weight:600; }
.alert-banner__title, .op-banner__title{ display:flex; align-items:center; gap:8px; }
.op-banner__meta{ display:flex; gap: var(--space-3); align-items:center; flex-wrap: wrap; }
.op-banner__count{ color: var(--color-text-muted); }
.op-banner__link{ margin-left: 8px; color: inherit; text-decoration: underline; }
.op-banner--ok{ border-color: color-mix(in oklab, var(--alert-success-bg) 38%, transparent); background: color-mix(in oklab, var(--alert-success-bg) 22%, transparent); color: var(--color-text); }
.op-banner__addr{ display:inline-flex; align-items:center; color: var(--color-text-muted); }
.op-banner__addr svg{ color: #E53935; }
.op-banner__addr svg{ vertical-align: middle; transform: translateY(1px); }
</style>
