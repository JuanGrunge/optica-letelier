<template>
  <section id="receta-nueva" class="view active">
    <div class="c-card">
      <h2>Ingresar receta</h2>
      <p class="subtle" v-if="pacienteNombre">Paciente: <strong>{{ pacienteNombre }}</strong></p>
      <fieldset :disabled="savingRx" id="recetaFieldset">
        <div class="c-table-scroll">
          <table class="rx-table rx-table--compact">
            <thead><tr>
              <th>OJO</th><th>ESF</th><th>CIL</th><th>EJE</th>
            </tr></thead>
            <tbody>
              <tr>
                <td>OD</td>
                <td><input class="c-form__control" type="number" step="0.25" v-model.number="rx.odEsfera"></td>
                <td><input class="c-form__control" type="number" step="0.25" v-model.number="rx.odCilindro"></td>
                <td><input class="c-form__control" type="number" step="1" min="0" max="180" v-model.number="rx.odEje"></td>
              </tr>
              <tr>
                <td>OI</td>
                <td><input class="c-form__control" type="number" step="0.25" v-model.number="rx.oiEsfera"></td>
                <td><input class="c-form__control" type="number" step="0.25" v-model.number="rx.oiCilindro"></td>
                <td><input class="c-form__control" type="number" step="1" min="0" max="180" v-model.number="rx.oiEje"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="o-grid o-grid__2">
          <div class="c-form__group">
            <label class="c-form__label" for="addMeta">ADD (opcional)</label>
            <input id="addMeta" class="c-form__control" type="number" step="0.25" v-model.number="rx.addPower">
          </div>
          <div class="c-form__group" style="grid-column:1 / -1;">
            <label class="c-form__label" for="obs">Observaciones</label>
            <textarea id="obs" class="c-form__control" rows="3" v-model.trim="rx.observaciones"></textarea>
          </div>
        </div>
        <div class="c-form__actions c-form__actions--end">
          <RouterLink class="c-btn c-btn--icon c-btn--neo" :to="{ name: 'archivo-detalle', params: { id: pacienteId } }" aria-label="Volver a ficha" title="Volver a ficha">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/>
                <path d="M13 6l-6 6l6 6"/>
              </g>
            </svg>
          </RouterLink>
          <button type="button" class="c-btn c-btn--icon c-btn--neo" aria-label="Importar .csv (próximamente)" title="Importar .csv (próximamente)" disabled>
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14"/>
                <path d="M16 15l-4 4l-4-4"/>
                <path d="M5 5h14"/>
              </g>
            </svg>
          </button>
          <button type="button" class="c-btn c-btn--icon c-btn--neo" @click="onSaveRx" :disabled="savingRx" aria-label="Guardar receta" title="Guardar receta">
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
      </fieldset>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import * as Prescriptions from '@/services/prescriptions.js';
import * as Patients from '@/services/patients.js';
import { useUiStore } from '@/stores/ui.js';
import { normalizeRxPayload } from '@/composables/rx.js';
import { setupUnsavedGuard } from '@/composables/unsaved.js';

const route = useRoute();
const pacienteId = computed(() => route.params.id);
const paciente = ref(null);
const pacienteNombre = computed(() => paciente.value ? `${paciente.value.nombres||''} ${paciente.value.apellidos||''}`.trim() : '');

const rx = reactive({
  odEsfera: null, odCilindro: null, odEje: null,
  oiEsfera: null, oiCilindro: null, oiEje: null,
  addPower: null, observaciones: ''
});
const savingRx = ref(false);
const msg = ref('');
const ui = useUiStore();
const initialSnap = ref('');

function clearRx(){
  rx.odEsfera = rx.odCilindro = rx.odEje = null;
  rx.oiEsfera = rx.oiCilindro = rx.oiEje = null;
  rx.addPower = null; rx.observaciones = '';
}

async function onSaveRx(){
  try {
    savingRx.value = true; msg.value='';
    const normalized = normalizeRxPayload(rx);
    const dto = { pacienteId: Number(pacienteId.value), ...normalized, activo: true };
    await Prescriptions.create(dto);
    msg.value = 'Receta guardada.';
    ui.showToast('Receta guardada');
    clearRx();
    initialSnap.value = JSON.stringify(rx);
  } catch (e) {
    msg.value = 'Error al guardar receta';
    console.warn(e);
  } finally { savingRx.value = false; }
}

onMounted(async () => {
  try { paciente.value = await Patients.getById(pacienteId.value); } catch {}
  initialSnap.value = JSON.stringify(rx);
});

const isDirty = computed(() => JSON.stringify(rx) !== initialSnap.value);
setupUnsavedGuard(isDirty);
</script>

<style scoped>
#recetaFieldset{ border: 0; padding: 0; margin: 0; }
.c-table-scroll{ margin-top: var(--space-2); }
</style>
