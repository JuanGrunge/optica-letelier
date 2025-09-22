<template>
  <section id="ingresar" class="view active">
    <transition name="card-fade" mode="out-in">
    <div class="c-card" key="ingresar-card">
      <h2>Ingresar paciente</h2>
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
            <input id="telefono" class="c-form__control" v-model.trim="form.telefono" placeholder="Ej: 9 1234 5678" />
          </div>
          <div class="c-form__group">
            <label class="c-form__label" for="email">Email</label>
            <input id="email" type="email" class="c-form__control" v-model.trim="form.email" placeholder="usuario@dominio.cl" />
          </div>
          <div class="c-form__group" style="grid-column:1 / -1;">
            <label class="c-form__label" for="direccion">Dirección</label>
            <input id="direccion" class="c-form__control" v-model.trim="form.direccion" placeholder="Calle 123, Ciudad" required />
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
    </div>
    </transition>
  </section>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import * as Patients from '@/services/patients.js';
import { useUiStore } from '@/stores/ui.js';
import { esRutValido, formatearRut } from '@/composables/validators.js';
import { setupUnsavedGuard } from '@/composables/unsaved.js';

const form = reactive({
  nombres: '', apellidos: '', rut: '', fechaNac: '', telefono: '', email: '', direccion: '', activo: true
});
const saving = ref(false);
const msg = ref('');
const ui = useUiStore();
const initialSnap = ref('');

onMounted(() => { initialSnap.value = JSON.stringify(form); });
const isDirty = computed(() => JSON.stringify(form) !== initialSnap.value);
setupUnsavedGuard(isDirty);

function clear(){
  form.nombres=''; form.apellidos=''; form.rut=''; form.fechaNac=''; form.telefono=''; form.email=''; form.direccion=''; form.activo=true;
  msg.value='';
}

async function onSave(){
  try {
    msg.value=''; saving.value=true;
    const dto = { ...form };
    if (dto.rut){
      if (!esRutValido(dto.rut)) { ui.showToast('RUT inválido'); return; }
      dto.rut = formatearRut(dto.rut);
    }
    Object.keys(dto).forEach(k => { if (dto[k] === '') dto[k] = null; });
    await Patients.create(dto);
    msg.value = 'Paciente guardado correctamente.';
    ui.showToast('Paciente guardado');
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
</style>
