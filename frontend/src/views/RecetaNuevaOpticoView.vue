<template>
  <section id="receta-nueva-optico" class="view active">
    <!-- Card 1: Buscar paciente por RUT -->
    <div class="c-card" key="rx-op-find">
      <h2 style="margin:0 48px 8px 0;">Ingresar paciente por RUT</h2>
      <div class="rx-intro">
        <label class="c-form__label" for="rutBuscar">RUT del paciente</label>
        <div class="inline-row">
          <input id="rutBuscar" class="c-form__control" v-model.trim="rut" placeholder="12.345.678-K"/>
          <button class="c-btn c-btn--icon c-btn--neo" type="button" @click="onFind" aria-label="Buscar" title="Buscar">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="M21 21l-6-6"/></g></svg>
          </button>
        </div>
        <p class="subtle" v-if="msg">{{ msg }}</p>
      </div>
    </div>

    <!-- Card 2: Nueva Receta (colapsable; se expande tras corroborar RUT) -->
    <div class="c-card" key="rx-op-form">
      <h2 style="margin-right:48px;">Nueva Receta</h2>
      <button class="c-btn c-btn--icon c-btn--back c-btn--no-anim c-card__action--tr" type="button" :disabled="!paciente" @click="rxOpen = !rxOpen" :aria-label="rxOpen ? 'Contraer' : 'Expandir'" :title="rxOpen ? 'Contraer' : 'Expandir'">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" :style="{ transform: rxOpen ? 'rotate(180deg)' : 'none', opacity: !paciente ? .5 : 1 }"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6l6-6"/></g></svg>
      </button>
      <transition name="fade-fast">
      <div v-show="rxOpen && paciente">
        <div class="rx-header">
          <div><strong>Nombre:</strong> {{ pacienteNombre || '-' }}</div>
          <div><strong>RUT:</strong> {{ paciente?.rut || rut }}</div>
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
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '@/stores/ui.js';
import { useAuthStore } from '@/stores/auth.js';
import * as Patients from '@/services/patients.js';
import RxPicker from '@/components/RxPicker.vue';
import { normalizeRxPayload, RX_LIMITS } from '@/composables/rx.js';

const router = useRouter();
const ui = useUiStore();
const auth = useAuthStore();

const operativeLabel = computed(() => auth.operativeLabel || '');

const rut = ref('');
const paciente = ref(null);
const pacienteNombre = computed(() => paciente.value ? `${paciente.value.nombres||''} ${paciente.value.apellidos||''}`.trim() : '');
const msg = ref('');
const rxOpen = ref(false);

async function onFind(){
  msg.value=''; paciente.value=null;
  const raw = (rut.value||'').trim(); if (!raw){ msg.value='Ingresa un RUT'; return; }
  try {
    const page = await Patients.list({ q: raw, page: 0, size: 1 });
    const list = Array.isArray(page?.content) ? page.content : [];
    paciente.value = list.find(p => (p?.rut||'').toLowerCase() === raw.toLowerCase()) || list[0] || null;
    if (paciente.value) rxOpen.value = true;
  } catch { paciente.value=null; }
}

const pacNew = reactive({ nombres: '', apellidos: '', comuna: '', direccion: '' });
const creating = ref(false);
const msgCreate = ref('');

async function onCreateAndProceed(){
  try {
    msgCreate.value=''; creating.value=true;
    if (!pacNew.nombres || !pacNew.apellidos || !pacNew.comuna){ msgCreate.value='Completa nombres, apellidos y comuna'; return; }
    const dto = { nombres: pacNew.nombres, apellidos: pacNew.apellidos, rut: rut.value||null, direccion: pacNew.direccion||null, comuna: pacNew.comuna, activo: true };
    if (auth?.operativeId != null) dto.operativeId = Number(auth.operativeId);
    const created = await Patients.create(dto);
    paciente.value = created;
    rxOpen.value = true;
    ui.showToast('Paciente creado');
  } catch { msgCreate.value = 'No se pudo crear'; }
  finally { creating.value=false; }
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
