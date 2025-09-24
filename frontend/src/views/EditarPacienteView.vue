<template>
  <section id="editar-paciente" class="view active">
    <transition name="card-fade" mode="out-in">
    <div class="c-card" key="editar-card">
      <h2 class="h2-row"><span>Editar paciente</span><span class="h2-meta">Paciente: {{ (form.nombres||'') + ' ' + (form.apellidos||'') }}</span></h2>
      <button class="c-btn c-btn--icon c-btn--back c-btn--no-anim c-card__action--tr" type="button" @click="goBack" title="Volver" aria-label="Volver">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/>
            <path d="M13 6l6 6l-6 6"/>
          </g>
        </svg>
      </button>
      <form @submit.prevent="onSave" class="c-form">
        <div class="o-grid o-grid__2">
          <div class="c-form__group">
            <label class="c-form__label" for="nombres">Nombres</label>
            <input id="nombres" class="c-form__control" v-model.trim="form.nombres" placeholder="Ej: Juan" required />
          </div>
          <div class="c-form__group">
            <label class="c-form__label" for="comuna">Comuna</label>
            <select id="comuna" class="c-form__control" v-model="form.comuna" required>
              <option value="" disabled>Seleccione comuna</option>
              <optgroup v-for="r in REGIONS_COMUNAS" :key="r.name" :label="r.name">
                <option v-for="c in r.comunas" :key="r.name + ':' + c" :value="c">{{ c }}</option>
              </optgroup>
            </select>
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
            <div class="inline-row">
              <input id="direccion" class="c-form__control" v-model.trim="form.direccion" placeholder="Calle 123" required />
              <template v-if="form.direccion">
                <a v-if="isAndroid()" class="c-btn c-btn--icon btn-inline" :href="linkForAndroid(form.direccion, form.comuna)" aria-label="Abrir en mapas" title="Abrir en mapas">
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/>
                      <circle cx="12" cy="11" r="2"/>
                    </g>
                  </svg>
                </a>
                <a v-else-if="!isIOS()" class="c-btn c-btn--icon btn-inline" :href="linkForDesktop(form.direccion, form.comuna)" target="_blank" rel="noopener" aria-label="Abrir en Google Maps" title="Abrir en Google Maps">
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/>
                      <circle cx="12" cy="11" r="2"/>
                    </g>
                  </svg>
                </a>
                <a class="c-btn c-btn--icon btn-inline" :href="linkForIOS(form.direccion, form.comuna)" aria-label="Abrir en mapas" title="Abrir en mapas">
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/>
                      <circle cx="12" cy="11" r="2"/>
                    </g>
                  </svg>
                </a>
              </template>
              <button v-else class="c-btn c-btn--icon btn-inline" type="button" disabled title="Sin dirección" aria-label="Sin dirección">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/>
                    <circle cx="12" cy="11" r="2"/>
                  </g>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="c-form__actions c-form__actions--end">
          <button class="c-btn c-btn--icon c-btn--neo" type="submit" :disabled="saving" aria-label="Guardar cambios" title="Guardar cambios">
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
import { reactive, ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import * as Patients from '@/services/patients.js';
import { useUiStore } from '@/stores/ui.js';
import { esRutValido, formatearRut } from '@/composables/validators.js';
import { setupUnsavedGuard } from '@/composables/unsaved.js';
import { isAndroid, isIOS, linkForAndroid, linkForDesktop, linkForIOS } from '@/composables/maps.js';
import { REGIONS_COMUNAS } from '@/data/regions-comunas.js';

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id);
const ui = useUiStore();
const saving = ref(false);
const msg = ref('');
const initialSnap = ref('');

const form = reactive({
  nombres: '', apellidos: '', rut: '', fechaNac: '', telefono: '', email: '', direccion: '', comuna: '', activo: true
});

onMounted(async () => {
  try {
    const data = await Patients.getById(id.value);
    Object.assign(form, {
      nombres: data?.nombres || '',
      apellidos: data?.apellidos || '',
      rut: data?.rut || '',
      fechaNac: data?.fechaNac || '',
      telefono: data?.telefono || '',
      email: data?.email || '',
      direccion: data?.direccion || '',
      comuna: data?.comuna || '',
      activo: data?.activo !== false
    });
    initialSnap.value = JSON.stringify(form);
  } catch (e) { console.warn('Cargar paciente', e); }
});

const isDirty = computed(() => JSON.stringify(form) !== initialSnap.value);
setupUnsavedGuard(isDirty);

function onRutBlur(){
  const v = (form.rut||'').trim();
  if (!v) return;
  if (!esRutValido(v)) { ui.showToast('RUT inválido'); return; }
  form.rut = formatearRut(v);
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
    await Patients.update(id.value, dto);
    msg.value = 'Paciente actualizado correctamente.';
    ui.showToast('Paciente actualizado');
    initialSnap.value = JSON.stringify(form);
  } catch (e) {
    msg.value = 'Error al actualizar paciente';
    console.warn(e);
  } finally { saving.value=false; }
}

function goBack(){
  try { router.push({ name: 'archivo-detalle', params: { id: id.value } }); }
  catch { router.push({ name: 'archivo' }); }
}
</script>

<style scoped>
.h2-row{ display:flex; align-items:flex-start; justify-content:flex-start; margin-right: 48px; flex-wrap: wrap; row-gap: .25rem; }
.h2-meta{ order: 2; flex: 1 0 100%; font-weight:600; font-size:.95rem; color: var(--color-text-muted); max-width: 100%; overflow:hidden; text-overflow: ellipsis; white-space: nowrap; }
.inline-row{ display:inline-flex; align-items:center; gap:8px; flex-wrap:wrap; }
.btn-inline{ width:1.8em; height:1.8em; padding:0; line-height:1; display:inline-flex; align-items:center; justify-content:center; }
.map-menu{ position:absolute; top:100%; right:0; background: var(--color-surface, #fff); border:1px solid var(--color-border, #ddd); border-radius:6px; padding:6px; display:flex; flex-direction:column; gap:4px; z-index:10; min-width:160px; }
</style>
