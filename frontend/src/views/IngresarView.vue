<template>
  <section id="paciente-nuevo" class="view active">
    <transition name="card-fade" mode="out-in">
      <div class="c-card" key="paciente-nuevo-card">
        <h2>Nuevo Paciente</h2>
        <div v-if="!isAdmin" class="op-hint" :class="{ 'op-hint--ok': hasOperative, 'op-hint--warn': !hasOperative }" role="status" style="margin:6px 0 12px;">
          <svg v-if="hasOperative" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle; margin-right:6px;"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3l5-5"/></g></svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="vertical-align:middle; margin-right:6px;"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16h.01"/></g></svg>
          <span v-if="hasOperative">Se asociará al lugar de operativo: <strong>{{ selectedLabel }}</strong><template v-if="selectedAddr"> — {{ selectedAddr }}</template></span>
          <span v-else>Selecciona tu lugar de operativo para asociar el registro. <RouterLink class="op-banner__link" :to="{ name: 'cuenta' }">Ir a Cuenta</RouterLink></span>
        </div>
        <form @submit.prevent="onSave" class="c-form">
          <div class="o-grid o-grid__2">
            <div class="c-form__group">
              <label class="c-form__label" for="nombres">Nombres</label>
              <input id="nombres" class="c-form__control" v-model.trim="form.nombres" placeholder="Ej: Juan" required />
            </div>

            <div class="c-form__group">
              <label class="c-form__label" for="apellidos">Apellidos</label>
              <input id="apellidos" class="c-form__control" v-model.trim="form.apellidos" placeholder="Ej: Pérez" required />
            </div>

            <div class="c-form__group">
              <label class="c-form__label" for="rut">RUT</label>
              <input id="rut" class="c-form__control" v-model.trim="form.rut" placeholder="12.345.678-K" @blur="onRutBlur" />
            </div>

            <div class="c-form__group">
              <label class="c-form__label" for="fechaNac">Fecha Nac.</label>
              <input id="fechaNac" type="date" class="c-form__control" v-model="form.fechaNac" />
            </div>

            <div class="c-form__group">
              <label class="c-form__label" for="telefono">Teléfono</label>
              <input id="telefono" class="c-form__control" v-model.trim="form.telefono" placeholder="+56 9 1234 5678" />
            </div>

            <div class="c-form__group">
              <label class="c-form__label" for="email">Email</label>
              <input id="email" type="email" class="c-form__control" v-model.trim="form.email" placeholder="usuario@dominio.cl" />
            </div>

            <div class="c-form__group">
              <label class="c-form__label" for="direccion">Dirección</label>
              <input id="direccion" class="c-form__control" v-model.trim="form.direccion" placeholder="Calle 123" required />
            </div>

            <div class="c-form__group">
              <label class="c-form__label" for="comuna">Comuna</label>
              <select id="comuna" class="c-form__control" v-model="form.comuna" required>
                <option value="" disabled>Seleccione comuna</option>
                <optgroup v-for="r in REGIONS_COMUNAS" :key="r.name" :label="r.name">
                  <option v-for="c in r.comunas" :key="r.name + ': ' + c" :value="c">{{ c }}</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div class="c-form__actions c-form__actions--end">
            <button class="c-btn c-btn--icon c-btn--neo" type="submit" :disabled="saving" aria-label="Guardar paciente" title="Guardar paciente">
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 4v10"/>
                  <path d="M8 8l4-4l4 4"/>
                  <path d="M5 20h14"/>
                </g>
              </svg>
            </button>
            <span class="subtle">{{ msg }}</span>
          </div>
        </form>

        <Modal v-model="nextOpen">
          <template #header>
            <h3 style="margin:0">Paciente guardado</h3>
          </template>
          <p>¿Qué deseas hacer a continuación?</p>
          <template #actions>
            <RouterLink class="c-btn c-btn--neo" :to="{ name: 'archivo-detalle', params: { id: createdId }, query: { from: 'ingresar' } }" @click="nextOpen=false">Ficha paciente</RouterLink>
            <RouterLink v-if="canCreatePrescription" class="c-btn" :to="{ name: 'receta-nueva', params: { id: createdId } }" @click="nextOpen=false">Nueva receta</RouterLink>
          </template>
        </Modal>
      </div>
    </transition>
  </section>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import * as Patients from '@/services/patients.js';
import * as Operatives from '@/services/operatives.js';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import { useUiStore } from '@/stores/ui.js';
import { esRutValido, formatearRut } from '@/composables/validators.js';
import Modal from '@/components/Modal.vue';
import { setupUnsavedGuard } from '@/composables/unsaved.js';
import { REGIONS_COMUNAS } from '@/data/regions-comunas.js';

const form = reactive({
  nombres: '',
  apellidos: '',
  rut: '',
  fechaNac: '',
  telefono: '',
  email: '',
  direccion: '',
  comuna: ''
});
const saving = ref(false);
const msg = ref('');
const ui = useUiStore();
const auth = useAuthStore();
const router = useRouter();
const isAdmin = computed(() => auth.role === 'admin');
const hasOperative = computed(() => auth.hasOperative);
const selectedLabel = computed(() => auth.operativeLabel || '');
const selectedAddr = computed(() => {
  const parts = [];
  if (auth.operativeDireccion) parts.push(auth.operativeDireccion);
  if (auth.operativeComuna) parts.push(auth.operativeComuna);
  return parts.join(', ');
});
const canCreatePrescription = computed(() => auth.hasPerm('createPrescription'));
const initialSnap = ref('');
const nextOpen = ref(false);
const createdId = ref(null);

onMounted(() => { initialSnap.value = JSON.stringify(form); });
const isDirty = computed(() => JSON.stringify(form) !== initialSnap.value);
setupUnsavedGuard(isDirty);

function clear(){
  form.nombres='';
  form.apellidos='';
  form.rut='';
  form.fechaNac='';
  form.telefono='';
  form.email='';
  form.direccion='';
  form.comuna='';
  msg.value='';
}

async function onSave(){
  try {
    msg.value=''; saving.value=true;
    try {
      if (auth?.operativeId != null){
        const o = await Operatives.getById(auth.operativeId);
        const isActive = !!(o?.active ?? o?.enabled ?? o?.activo);
        if (!isActive){ ui.showToast('El lugar de operativo se encuentra inactivo. Selecciona otro.'); saving.value=false; router.push({ name: 'cuenta' }); return; }
      }
    } catch {}
    const dto = { ...form };
    if (dto.rut){
      if (!esRutValido(dto.rut)) { ui.showToast('RUT inválido'); saving.value=false; return; }
      dto.rut = formatearRut(dto.rut);
    }
    Object.keys(dto).forEach(k => { if (dto[k] === '') dto[k] = null; });
    try {
      const auth = useAuthStore();
      if (auth.role !== 'admin' && auth?.operativeId != null) dto.operativeId = Number(auth.operativeId);
    } catch {}
    const saved = await Patients.create(dto);
    createdId.value = saved?.id ?? null;
    msg.value = 'Paciente guardado correctamente.';
    ui.showToast('Paciente guardado');
    nextOpen.value = !!createdId.value;
    clear();
    initialSnap.value = JSON.stringify(form);
  } catch (e) {
    msg.value = 'Error al guardar paciente';
    console.warn(e);
  } finally { saving.value=false; }
}

function onRutBlur(){
  const v = (form.rut||'').trim();
  if (!v) return;
  if (!esRutValido(v)) { ui.showToast('RUT inválido'); return; }
  form.rut = formatearRut(v);
}
</script>

<style scoped>
.op-hint{ display:flex; align-items:center; gap:8px; padding:8px; border-radius:8px; border:1px solid transparent; }
.op-hint--warn{ background: color-mix(in oklab, var(--alert-warning-bg) 22%, transparent); color: var(--color-text); border-color: color-mix(in oklab, var(--alert-warning-bg) 38%, transparent); }
.op-hint--ok{ background: color-mix(in oklab, var(--alert-success-bg) 22%, transparent); color: var(--color-text); border-color: color-mix(in oklab, var(--alert-success-bg) 38%, transparent); }
.op-banner__link{ color: inherit; text-decoration: underline; }
</style>
