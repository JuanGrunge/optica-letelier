<template>
  <section id="cuenta" class="view active">
    <div class="c-card">
      <h2>Cuenta</h2>
      <p class="subtle">Información de tu sesión</p>
      <div class="o-grid o-grid__2">
        <div>
          <p><strong>Usuario:</strong> {{ username }}</p>
          <p><strong>Rol:</strong> {{ roleKey }} <span v-if="roleLabel">({{ roleLabel }})</span></p>
        </div>
        <div>
          <!-- Hint above operative selection -->
          <div class="op-hint" :class="{ 'op-hint--ok': !!selectedLabel, 'op-hint--warn': !selectedLabel }" role="status">
            <svg v-if="selectedLabel" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle; margin-right:6px;"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3l5-5"/></g></svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle; margin-right:6px;"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16h.01"/></g></svg>
            <span>{{ selectedLabel ? 'Operativo seleccionado' : 'Selecciona tu lugar de operativo para habilitar edición y registro.' }}</span>
          </div>
          <label class="c-form__label" for="selOperative">Lugar de operativo</label>
          <div class="inline-row">
            <select id="selOperative" class="c-form__control" v-model="selected" @change="onChange" :title="!selected ? 'Selecciona tu lugar de operativo' : null">
              <option :value="null">Seleccione...</option>
              <option v-for="o in operatives" :key="o.id" :value="o.id">{{ o.lugar || o.nombre }}</option>
            </select>
            <button class="c-btn c-btn--icon c-btn--neo" type="button" @click="refresh" :disabled="loading" aria-label="Actualizar" title="Actualizar">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12a7 7 0 1 0 2-5.192"/><path d="M7 4v4h4"/></g></svg>
            </button>
          </div>
          <p class="subtle" v-if="selectedLabel">Seleccionado: {{ selectedLabel }}</p>
          <p class="subtle inline-row" v-if="selectedAddr">
            <a v-if="isAndroid()" class="map-pin" :href="linkForAndroid(selectedDireccion, selectedComuna)" title="Abrir en mapas">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle; margin-right:6px;"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></g></svg>
              {{ selectedAddr }}</a>
            <a v-else-if="!isIOS()" class="map-pin" :href="linkForDesktop(selectedDireccion, selectedComuna)" title="Abrir en Google Maps">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle; margin-right:6px;"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></g></svg>
              {{ selectedAddr }}</a>
            <a v-else class="map-pin" :href="linkForIOS(selectedDireccion, selectedComuna)" title="Abrir en mapas">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle; margin-right:6px;"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></g></svg>
              {{ selectedAddr }}</a>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.js';
import * as Operatives from '@/services/operatives.js';
import { isAndroid, isIOS, linkForAndroid, linkForDesktop, linkForIOS } from '@/composables/maps.js';

const auth = useAuthStore();
const username = computed(() => auth.user?.username || '');

function pickPrimaryRole(u){
  const roles = Array.isArray(u?.roles) ? u.roles : (u?.role ? [u.role] : []);
  const norm = roles.map(r => String(r).replace(/^ROLE_/, ''));
  if (norm.includes('ADMIN')) return 'ADMIN';
  if (norm.includes('OPTICO')) return 'OPTICO';
  if (norm.includes('RECEPTOR')) return 'RECEPTOR';
  return '';
}
const roleKey = computed(() => pickPrimaryRole(auth.user));
const roleMap = { ADMIN: 'Administrador', OPTICO: 'Óptico', RECEPTOR: 'Receptor' };
const roleLabel = computed(() => roleMap[roleKey.value] || '');

const operatives = ref([]);
const loading = ref(false);
const selected = ref(auth.operativeId);
const selectedLabel = computed(() => auth.operativeLabel || '');
const selectedAddr = computed(() => {
  const parts = [];
  if (auth.operativeDireccion) parts.push(auth.operativeDireccion);
  if (auth.operativeComuna) parts.push(auth.operativeComuna);
  return parts.join(', ');
});
const selectedDireccion = computed(() => auth.operativeDireccion || '');
const selectedComuna = computed(() => auth.operativeComuna || '');

async function refresh(){
  try {
    loading.value = true;
    const page = await Operatives.listActive({ page: 0, size: 50 });
    operatives.value = Array.isArray(page?.content) ? page.content : (Array.isArray(page) ? page : []);
  } finally { loading.value = false; }
}

function onChange(){
  const id = selected.value != null ? Number(selected.value) : null;
  const found = operatives.value.find(o => Number(o.id) === id);
  const label = found ? (found.lugar || found.nombre || '') : '';
  const direccion = found?.direccion || '';
  const comuna = found?.comuna || '';
  auth.setOperativeSelection(id, label, direccion, comuna);
}

onMounted(() => { refresh(); });
</script>

<style scoped>
.inline-row{ display:flex; gap:8px; align-items:center; }
.op-hint{ display:flex; align-items:center; gap:8px; padding:8px; border-radius:8px; margin-bottom:8px; border:1px solid transparent; }
.op-hint--warn{ background: color-mix(in oklab, var(--alert-warning-bg) 22%, transparent); color: var(--color-text); border-color: color-mix(in oklab, var(--alert-warning-bg) 38%, transparent); }
.op-hint--ok{ background: color-mix(in oklab, var(--alert-success-bg) 22%, transparent); color: var(--color-text); border-color: color-mix(in oklab, var(--alert-success-bg) 38%, transparent); }
.map-pin svg{ color: #E53935; }
</style>
