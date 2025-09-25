<template>
  <section class="view active" id="inicio">
    <transition name="card-fade" mode="out-in">
    <div class="c-card" key="home-card">
      <h2>{{ greeting }}</h2>
      <p class="subtle">¿A dónde quieres navegar?</p>

      <!-- Banner Operativo: debajo del saludo -->
      <div v-if="!hasOperative" class="op-banner" role="region" aria-label="Operativos disponibles">
        <div class="op-banner__title">
          Selecciona tu lugar de operativo para habilitar edición y registro.
          <RouterLink class="op-banner__link" :to="{ name: 'cuenta' }">Ir a Cuenta</RouterLink>
        </div>
        <div class="op-banner__meta">
          <span class="op-banner__count">Lugares operativos disponibles: {{ opCount }}</span>
        </div>
      </div>
      <div v-else class="op-banner op-banner--ok" role="region" aria-label="Operativo seleccionado">
        <div class="op-banner__title">
          Tu lugar de operativo
          <RouterLink class="op-banner__link" :to="{ name: 'cuenta' }">cambiar lugar de operativo</RouterLink>
        </div>
        <div class="op-banner__meta">
          <span class="op-banner__count">{{ selectedLabel || '-' }}</span>
          <template v-if="selectedAddr">
            <a v-if="isAndroid()" class="op-banner__addr" :href="linkForAndroid(selectedDireccion, selectedComuna)" aria-label="Abrir lugar operativo en mapas">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle; margin-right:6px;">
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/>
                  <circle cx="12" cy="11" r="2"/>
                </g>
              </svg>
              {{ selectedAddr }}
            </a>
            <a v-else-if="!isIOS()" class="op-banner__addr" :href="linkForDesktop(selectedDireccion, selectedComuna)" target="_blank" rel="noopener" aria-label="Abrir en Google Maps">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle; margin-right:6px;">
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/>
                  <circle cx="12" cy="11" r="2"/>
                </g>
              </svg>
              {{ selectedAddr }}
            </a>
            <a v-else class="op-banner__addr" :href="linkForIOS(selectedDireccion, selectedComuna)" aria-label="Abrir lugar operativo en mapas">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle; margin-right:6px;">
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/>
                  <circle cx="12" cy="11" r="2"/>
                </g>
              </svg>
              {{ selectedAddr }}
            </a>
          </template>
        </div>
      </div>

      <div class="app-actions">
        <!-- Acción: Archivo (mismo ícono que header, más grande) -->
        <RouterLink class="app-action" :to="{ name: 'archivo' }" role="button" aria-label="Ir a Archivo">
          <div class="app-action__icon" aria-hidden="true">
            <!-- Copiado del header -->
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

        <!-- Acción: Nuevo Paciente (mismo ícono que header, más grande) -->
        <RouterLink class="app-action" :class="{ 'is-disabled': !hasOperative }" :to="{ name: 'paciente-nuevo' }" role="button" aria-label="Ir a Nuevo Paciente">
          <div class="app-action__icon" aria-hidden="true">
            <!-- Copiado del header -->
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
            <div class="app-action__desc">Registra un nuevo paciente y opcionalmente agrega su receta.</div>
          </div>
        </RouterLink>

        <!-- Acción: Cuenta -->
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
            <div class="app-action__desc">Accede a la información de tu sesión y rol.</div>
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
.app-actions{
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.app-action{
  display: grid;
  grid-template-columns: 84px 1fr;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: color-mix(in oklab, var(--color-surface) 92%, #000);
  color: inherit;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-1);
  text-decoration: none;
  transition: transform .06s ease, filter .15s ease, background-color .15s ease, box-shadow .15s ease;
}
.app-action:focus{ outline: none; }
.app-action:hover{ filter: brightness(1.02); box-shadow: 0 10px 28px rgba(0,0,0,.12); }
.app-action:active{ transform: translateY(1px); }

.app-action__icon{
  width: 84px; height: 84px;
  border-radius: var(--radius-md);
  display: grid; place-items: center;
  background: color-mix(in oklab, var(--color-accent) 16%, var(--color-surface));
  color: var(--color-accent);
  border: 1px solid color-mix(in oklab, var(--color-accent) 32%, var(--color-border));
}

.app-action__title{ font-size: 1.25rem; font-weight: 700; margin: 0 0 4px; }
.app-action__desc{ color: var(--color-text-muted); }

.app-action.is-disabled{ pointer-events: none; opacity: .6; filter: grayscale(25%); }

.op-banner{ margin-top: var(--space-3); padding: var(--space-3); border:1px solid color-mix(in oklab, #FFC107 38%, var(--color-border)); border-radius: var(--radius-md); background:
  color-mix(in oklab, #FFF8DB 70%, var(--color-surface)); display:flex; flex-direction:column; gap: var(--space-2); }
.op-banner__title{ font-weight:600; }
.op-banner__meta{ display:flex; gap: var(--space-3); align-items:center; flex-wrap: wrap; }
.op-banner__count{ color: var(--color-text-muted); }
.op-banner__link{ margin-left: 8px; color: var(--color-accent); text-decoration: underline; }
.op-banner--ok{ border-color: color-mix(in oklab, #4CAF50 38%, var(--color-border)); background: color-mix(in oklab, #E9F7E9 70%, var(--color-surface)); }
.op-banner__addr{ display:inline-flex; align-items:center; color: var(--color-text-muted); }

@media (min-width: 720px){
  .app-actions{ grid-template-columns: 1fr 1fr; }
}
</style>
