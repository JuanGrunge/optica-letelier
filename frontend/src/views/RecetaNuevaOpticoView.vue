<template>
  <section id="receta-nueva-optico" class="view active">
    <!-- Card 1: Buscar paciente por RUT -->
    <div class="c-card" key="rx-op-find">
      <h2 style="margin:0 48px 8px 0;">Ingresar paciente por RUT</h2>
      <div class="rx-intro">
        <label class="c-form__label" for="rutBuscar">RUT del paciente</label>
        <div class="inline-row">
          <input id="rutBuscar" class="c-form__control" v-model.trim="rut" placeholder="12.345.678-K"/>
          <button class="c-btn c-btn--icon btn-inline" type="button" @click="onFind" aria-label="Buscar" title="Buscar" style="background:transparent; border-color:transparent;">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="M21 21l-6-6"/></g></svg>
          </button>
        </div>
        <p class="subtle" v-if="msg">{{ msg }}</p>
        <div v-if="notFoundMode" class="o-grid o-grid__2" style="margin-top:12px;">
          <div class="c-form__group">
            <label class="c-form__label">Nombres</label>
            <input class="c-form__control" v-model.trim="newNames.nombres" placeholder="Nombre(s)"/>
          </div>
          <div class="c-form__group">
            <label class="c-form__label">Apellidos</label>
            <input class="c-form__control" v-model.trim="newNames.apellidos" placeholder="Apellido(s)"/>
          </div>
          <div class="c-form__actions c-form__actions--end" style="grid-column: 1 / -1;">
            <button class="c-btn c-btn--icon btn-inline" type="button" @click="onCreateFromNames" :disabled="creatingNew" aria-label="Guardar y continuar" title="Guardar y continuar" style="background:transparent; border-color:transparent;">
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v10"/><path d="M8 8l4-4l4 4"/><path d="M5 20h14"/></g></svg>
            </button>
            <span class="subtle">{{ msgNew }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 2: Nueva Receta (colapsable; se expande tras corroborar RUT) -->
    <div class="c-card" key="rx-op-form">
      <h2 style="margin-right:48px;">Nueva Receta</h2>
      <transition name="fade-fast">
      <div v-if="paciente">
        <div class="rx-header">
          <div><strong>Nombre:</strong> {{ pacienteNombre || '-' }}</div>
          <div><strong>RUT:</strong> {{ (paciente && paciente.rut) || rut }}</div>
          <div><strong>Operativo:</strong> {{ operativeLabel || '-' }}</div>
        </div>
        <div class="rx-form">
          <div class="o-grid o-grid__2">
            <div class="c-form__group">
              <label class="c-form__label">ESF OD</label>
              <RxPicker v-model="rx.odEsfera" :min="RX_LIMITS.ESF.min" :max="RX_LIMITS.ESF.max" :step="RX_LIMITS.ESF.step" :decimals="RX_LIMITS.ESF.decimals" :show-sign="RX_LIMITS.ESF.showSign" picker="number" name="Esfera OD" aria-label="Esfera OD" />
              <input class="mini-input" type="number" :step="RX_LIMITS.ESF.step" v-model.number="rx.odEsfera" aria-label="Ingresar ESF OD"/>
            </div>
            <div class="c-form__group">
              <label class="c-form__label">CIL OD</label>
              <RxPicker v-model="rx.odCilindro" :min="RX_LIMITS.CIL.min" :max="RX_LIMITS.CIL.max" :step="RX_LIMITS.CIL.step" :decimals="RX_LIMITS.CIL.decimals" :show-sign="RX_LIMITS.CIL.showSign" picker="number" name="Cilindro OD" aria-label="Cilindro OD" />
              <input class="mini-input" type="number" :step="RX_LIMITS.CIL.step" v-model.number="rx.odCilindro" aria-label="Ingresar CIL OD"/>
            </div>
            <div class="c-form__group">
              <label class="c-form__label">EJE OD</label>
              <RxPicker v-model="rx.odEje" :min="RX_LIMITS.EJE.min" :max="RX_LIMITS.EJE.max" :step="RX_LIMITS.EJE.step" :decimals="RX_LIMITS.EJE.decimals" :show-sign="RX_LIMITS.EJE.showSign" suffix="°" picker="number" name="Eje OD" aria-label="Eje OD" />
              <input class="mini-input" type="number" :step="RX_LIMITS.EJE.step" v-model.number="rx.odEje" aria-label="Ingresar EJE OD"/>
            </div>
            <div class="c-form__group">
              <label class="c-form__label">ESF OI</label>
              <RxPicker v-model="rx.oiEsfera" :min="RX_LIMITS.ESF.min" :max="RX_LIMITS.ESF.max" :step="RX_LIMITS.ESF.step" :decimals="RX_LIMITS.ESF.decimals" :show-sign="RX_LIMITS.ESF.showSign" picker="number" name="Esfera OI" aria-label="Esfera OI" />
              <input class="mini-input" type="number" :step="RX_LIMITS.ESF.step" v-model.number="rx.oiEsfera" aria-label="Ingresar ESF OI"/>
            </div>
            <div class="c-form__group">
              <label class="c-form__label">CIL OI</label>
              <RxPicker v-model="rx.oiCilindro" :min="RX_LIMITS.CIL.min" :max="RX_LIMITS.CIL.max" :step="RX_LIMITS.CIL.step" :decimals="RX_LIMITS.CIL.decimals" :show-sign="RX_LIMITS.CIL.showSign" picker="number" name="Cilindro OI" aria-label="Cilindro OI" />
              <input class="mini-input" type="number" :step="RX_LIMITS.CIL.step" v-model.number="rx.oiCilindro" aria-label="Ingresar CIL OI"/>
            </div>
            <div class="c-form__group">
              <label class="c-form__label">EJE OI</label>
              <RxPicker v-model="rx.oiEje" :min="RX_LIMITS.EJE.min" :max="RX_LIMITS.EJE.max" :step="RX_LIMITS.EJE.step" :decimals="RX_LIMITS.EJE.decimals" :show-sign="RX_LIMITS.EJE.showSign" suffix="°" picker="number" name="Eje OI" aria-label="Eje OI" />
              <input class="mini-input" type="number" :step="RX_LIMITS.EJE.step" v-model.number="rx.oiEje" aria-label="Ingresar EJE OI"/>
            </div>
          </div>
          <div class="o-grid o-grid__2">
            <div class="c-form__group">
              <label class="c-form__label" for="addMeta">ADD (opcional)</label>
              <RxPicker v-model="rx.addPower" :min="RX_LIMITS.ADD.min" :max="RX_LIMITS.ADD.max" :step="RX_LIMITS.ADD.step" :decimals="RX_LIMITS.ADD.decimals" :show-sign="RX_LIMITS.ADD.showSign" picker="number" name="Adición" aria-label="Adición" />
              <input class="mini-input" type="number" :step="RX_LIMITS.ADD.step" v-model.number="rx.addPower" aria-label="Ingresar ADD"/>
            </div>
            <div class="c-form__group" style="grid-column:1 / -1;">
              <label class="c-form__label" for="obs">Observaciones</label>
              <textarea id="obs" class="c-form__control" rows="3" v-model.trim="rx.observaciones"></textarea>
            </div>
          </div>
          <div class="c-form__actions c-form__actions--end">
            <button class="c-btn c-btn--icon c-btn--neo" type="button" @click="onSaveRx" :disabled="savingRx" aria-label="Guardar receta" title="Guardar receta">
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v10"/><path d="M8 8l4-4l4 4"/><path d="M5 20h14"/></g></svg>
            </button>
            <span class="subtle">{{ msgRx }}</span>
          </div>
        </div>
      </div>
      </transition>

      <div v-if="!paciente" class="c-box c-box--compact" style="margin-top:12px;">
        <h3 style="margin:0 0 8px;">Paciente no encontrado</h3>
        <p class="subtle">Ingresa datos mínimos para crear y continuar.</p>
        <div class="o-grid o-grid__2">
          <div class="c-form__group"><label class="c-form__label">Nombres</label><input class="c-form__control" v-model.trim="pacNew.nombres"/></div>
          <div class="c-form__group"><label class="c-form__label">Apellidos</label><input class="c-form__control" v-model.trim="pacNew.apellidos"/></div>
          <div class="c-form__group"><label class="c-form__label">Comuna</label><input class="c-form__control" v-model.trim="pacNew.comuna"/></div>
          <div class="c-form__group"><label class="c-form__label">Dirección (opcional)</label><input class="c-form__control" v-model.trim="pacNew.direccion"/></div>
        </div>
        <div class="c-form__actions c-form__actions--end">
          <button class="c-btn c-btn--icon c-btn--neo" type="button" @click="onCreateAndProceed" :disabled="creating" aria-label="Crear paciente" title="Crear paciente">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></g></svg>
          </button>
          <span class="subtle">{{ msgCreate }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useUiStore } from '@/stores/ui.js';
import { useAuthStore } from '@/stores/auth.js';
import * as Patients from '@/services/patients.js';
import RxPicker from '@/components/RxPicker.vue';
import { normalizeRxPayload, RX_LIMITS } from '@/composables/rx.js';
const ui = useUiStore();
const auth = useAuthStore();

const operativeLabel = computed(() => auth.operativeLabel || '');

const rut = ref('');
const paciente = ref(null);
const pacienteNombre = computed(() => paciente.value ? `${paciente.value.nombres||''} ${paciente.value.apellidos||''}`.trim() : '');
const msg = ref('');
const notFoundMode = ref(false);
const newNames = reactive({ nombres: '', apellidos: '' });
const creatingNew = ref(false);
const msgNew = ref('');

async function onFind(){
  msg.value=''; paciente.value=null;
  const raw = (rut.value||'').trim(); if (!raw){ msg.value='Ingresa un RUT'; return; }
  try {
    const page = await Patients.list({ q: raw, page: 0, size: 5 });
    const list = Array.isArray(page?.content) ? page.content : [];
    const found = list.find(p => (p?.rut||'').toLowerCase() === raw.toLowerCase()) || null;
    if (found) {
      paciente.value = found;
      // limpiar buscador y mini formulario
      rut.value = '';
      notFoundMode.value = false;
      newNames.nombres = '';
      newNames.apellidos = '';
      msg.value = '';
      msgNew.value = '';
      return;
    }
  } catch { /* seguir a creaci0n */ }
  // No encontrado: expandir solicitando nombres/apellidos obligatorios
  notFoundMode.value = true;
}

async function onCreateFromNames(){
  try {
    msgNew.value=''; creatingNew.value=true;
    const nombres = (newNames.nombres||'').trim();
    const apellidos = (newNames.apellidos||'').trim();
    if (!nombres || !apellidos){ msgNew.value='Ingresa nombres y apellidos'; return; }
    const raw = (rut.value||'').trim(); if (!raw){ msg.value='Ingresa un RUT'; return; }
    const dto = { rut: raw, nombres, apellidos, activo: true };
    if (auth.role !== 'admin' && auth?.operativeId != null) dto.operativeId = Number(auth.operativeId);
    const created = await Patients.create(dto);
    paciente.value = created;
    // ocultar mini formulario y limpiar buscador para un estado limpio
    notFoundMode.value = false;
    rut.value = '';
    newNames.nombres = '';
    newNames.apellidos = '';
    msg.value = '';
    msgNew.value = '';
  } catch { msgNew.value = 'No se pudo crear'; }
  finally { creatingNew.value=false; }
}

function resetAll(){
  try {
    rut.value = '';
    paciente.value = null;
    msg.value = '';
    notFoundMode.value = false;
    newNames.nombres = '';
    newNames.apellidos = '';
    msgNew.value = '';
    rx.odEsfera = rx.odCilindro = rx.odEje = null;
    rx.oiEsfera = rx.oiCilindro = rx.oiEje = null;
    rx.addPower = null; rx.observaciones = '';
    msgRx.value=''; savingRx.value=false;
  } catch {}
}

onMounted(() => { resetAll(); });

onBeforeRouteLeave((_to, _from, next) => {
  // Resetea al salir para evitar persistencia de datos; usa confirm minimal si hay datos cargados
  const hasPatient = !!(paciente.value && paciente.value.id);
  const hasRutOnly = !!(rut.value && !hasPatient);
  const hasRx = [rx.odEsfera, rx.odCilindro, rx.odEje, rx.oiEsfera, rx.oiCilindro, rx.oiEje, rx.addPower, rx.observaciones]
    .some(v => v != null && v !== '');
  if ((hasPatient || hasRx || hasRutOnly) && typeof window !== 'undefined'){
    const ok = window.confirm('Tienes cambios sin guardar (RUT/paciente/receta). ¿Deseas salir de todas formas?');
    if (!ok) return next(false);
  }
  resetAll();
  next();
});

// Compat: si el template aún contiene el bloque de "paciente no encontrado",
// definimos estos refs para evitar errores aunque no se usen.
const pacNew = reactive({ nombres: '', apellidos: '', comuna: '', direccion: '' });
const creating = ref(false);
const msgCreate = ref('');
async function onCreateAndProceed(){
  // El flujo oficial crea el paciente automáticamente por RUT desde onFind.
  // Dejamos un mensaje gentil por si alguien interactúa aquí.
  msgCreate.value = 'Usa el buscador por RUT para continuar.';
}

const rx = reactive({ odEsfera:null, odCilindro:null, odEje:null, oiEsfera:null, oiCilindro:null, oiEje:null, addPower:null, observaciones:'' });
const savingRx = ref(false);
const msgRx = ref('');

async function onSaveRx(){
  try {
    savingRx.value=true; msgRx.value='';
    if (!paciente.value?.id){ msgRx.value='Primero confirma paciente'; return; }
    const payload = normalizeRxPayload(rx);
    const dto = { pacienteId: Number(paciente.value.id), ...payload, activo: true };
    await (await import('@/services/prescriptions.js')).create(dto);
    ui.showToast('Receta guardada');
    msgRx.value = 'Receta guardada.';
  } catch { msgRx.value = 'Error al guardar receta'; }
  finally { savingRx.value=false; }
}
</script>

<style scoped>
.rx-intro{ margin-bottom: 8px; }
.inline-row{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.rx-header{ display:flex; gap: 16px; flex-wrap: wrap; align-items:center; margin: 8px 0 12px; }
.mini-input{ width: 6rem; text-align:center; margin-top: 6px; }
</style>
