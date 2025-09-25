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
          <label class="c-form__label" for="selOperative">Lugar de operativo</label>
          <div class="inline-row">
            <select id="selOperative" class="c-form__control" v-model="selected" @change="onChange">
              <option :value="null">Seleccione...</option>
              <option v-for="o in operatives" :key="o.id" :value="o.id">{{ o.lugar || o.nombre }}</option>
            </select>
            <button class="c-btn" type="button" @click="refresh" :disabled="loading">Actualizar</button>
          </div>
          <p class="subtle" v-if="selectedLabel">Seleccionado: {{ selectedLabel }}</p>
          <p class="subtle inline-row" v-if="selectedAddr">
            <a v-if="isAndroid()" :href="linkForAndroid(selectedDireccion, selectedComuna)" aria-label="Abrir lugar operativo en mapas">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle; margin-right:6px;">
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/>
                  <circle cx="12" cy="11" r="2"/>
                </g>
              </svg>
              {{ selectedAddr }}</a>
            <a v-else-if="!isIOS()" :href="linkForDesktop(selectedDireccion, selectedComuna)" target="_blank" rel="noopener" aria-label="Abrir en Google Maps">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle; margin-right:6px;">
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/>
                  <circle cx="12" cy="11" r="2"/>
                </g>
              </svg>
              {{ selectedAddr }}</a>
            <a v-else :href="linkForIOS(selectedDireccion, selectedComuna)" aria-label="Abrir lugar operativo en mapas">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle; margin-right:6px;">
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/>
                  <circle cx="12" cy="11" r="2"/>
                </g>
              </svg>
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
  } finally {
    loading.value = false;
  }
}

function onChange(){
  const id = selected.value != null ? Number(selected.value) : null;
  const found = operatives.value.find(o => Number(o.id) === id);
  const label = found ? (found.lugar || found.nombre || '') : '';
  auth.setOperativeSelection(id, label, found?.direccion || '', found?.comuna || '');
}

onMounted(() => { refresh(); });
</script>

<style scoped>
.inline-row{ display:flex; gap:8px; align-items:center; }
</style>
