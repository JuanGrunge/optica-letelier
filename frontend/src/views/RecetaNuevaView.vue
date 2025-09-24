<template>
  <section id="receta-nueva" class="view active">
    <transition name="card-fade" mode="out-in">
    <div class="c-card" key="receta-card">
      <h2 class="h2-row"><span>Nueva receta</span><span class="h2-meta" v-if="pacienteNombre">Paciente: {{ pacienteNombre }}</span></h2>
      <button class="c-btn c-btn--icon c-btn--back c-btn--no-anim c-card__action--tr" type="button" @click="goBack" title="Volver" aria-label="Volver">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/>
            <path d="M13 6l6 6l-6 6"/>
          </g>
        </svg>
      </button>
      
      <fieldset :disabled="savingRx" id="recetaFieldset">
        <div class="rx-eyes">
          <div class="rx-eye">
            <h3 class="rx-eye__title">Ojo derecho (OD)</h3>
            <div class="rx-grid">
              <div class="c-form__group">
                <label class="c-form__label">ESF</label>
                <RxPicker
                  v-model="rx.odEsfera"
                  :min="RX_LIMITS.ESF.min"
                  :max="RX_LIMITS.ESF.max"
                  :step="RX_LIMITS.ESF.step"
                  :decimals="RX_LIMITS.ESF.decimals"
                  :show-sign="RX_LIMITS.ESF.showSign"
                  picker="number"
                  name="Esfera OD"
                  aria-label="Esfera OD"
                  :disabled="savingRx"
                />
              </div>
              <div class="c-form__group">
                <label class="c-form__label">CIL</label>
                <RxPicker
                  v-model="rx.odCilindro"
                  :min="RX_LIMITS.CIL.min"
                  :max="RX_LIMITS.CIL.max"
                  :step="RX_LIMITS.CIL.step"
                  :decimals="RX_LIMITS.CIL.decimals"
                  :show-sign="RX_LIMITS.CIL.showSign"
                  picker="number"
                  name="Cilindro OD"
                  aria-label="Cilindro OD"
                  :disabled="savingRx"
                />
              </div>
              <div class="c-form__group">
                <label class="c-form__label">EJE</label>
                <RxPicker
                  v-model="rx.odEje"
                  :min="RX_LIMITS.EJE.min"
                  :max="RX_LIMITS.EJE.max"
                  :step="RX_LIMITS.EJE.step"
                  :decimals="RX_LIMITS.EJE.decimals"
                  :show-sign="RX_LIMITS.EJE.showSign"
                  suffix="°"
                  picker="number"
                  name="Eje OD"
                  aria-label="Eje OD"
                  :disabled="savingRx"
                />
              </div>
            </div>
          </div>
          <div class="rx-eye">
            <h3 class="rx-eye__title">Ojo izquierdo (OI)</h3>
            <div class="rx-grid">
              <div class="c-form__group">
                <label class="c-form__label">ESF</label>
                <RxPicker
                  v-model="rx.oiEsfera"
                  :min="RX_LIMITS.ESF.min"
                  :max="RX_LIMITS.ESF.max"
                  :step="RX_LIMITS.ESF.step"
                  :decimals="RX_LIMITS.ESF.decimals"
                  :show-sign="RX_LIMITS.ESF.showSign"
                  picker="number"
                  name="Esfera OI"
                  aria-label="Esfera OI"
                  :disabled="savingRx"
                />
              </div>
              <div class="c-form__group">
                <label class="c-form__label">CIL</label>
                <RxPicker
                  v-model="rx.oiCilindro"
                  :min="RX_LIMITS.CIL.min"
                  :max="RX_LIMITS.CIL.max"
                  :step="RX_LIMITS.CIL.step"
                  :decimals="RX_LIMITS.CIL.decimals"
                  :show-sign="RX_LIMITS.CIL.showSign"
                  picker="number"
                  name="Cilindro OI"
                  aria-label="Cilindro OI"
                  :disabled="savingRx"
                />
              </div>
              <div class="c-form__group">
                <label class="c-form__label">EJE</label>
                <RxPicker
                  v-model="rx.oiEje"
                  :min="RX_LIMITS.EJE.min"
                  :max="RX_LIMITS.EJE.max"
                  :step="RX_LIMITS.EJE.step"
                  :decimals="RX_LIMITS.EJE.decimals"
                  :show-sign="RX_LIMITS.EJE.showSign"
                  suffix="°"
                  picker="number"
                  name="Eje OI"
                  aria-label="Eje OI"
                  :disabled="savingRx"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="o-grid o-grid__2">
          <div class="c-form__group">
            <label class="c-form__label" for="addMeta">ADD (opcional)</label>
              <RxPicker
                v-model="rx.addPower"
                :min="RX_LIMITS.ADD.min"
                :max="RX_LIMITS.ADD.max"
                :step="RX_LIMITS.ADD.step"
                :decimals="RX_LIMITS.ADD.decimals"
                :show-sign="RX_LIMITS.ADD.showSign"
              picker="number"
              name="Adición"
              aria-label="Adición"
              :disabled="savingRx"
            />
          </div>
          <div class="c-form__group" style="grid-column:1 / -1;">
            <label class="c-form__label" for="obs">Observaciones</label>
            <textarea id="obs" class="c-form__control" rows="3" v-model.trim="rx.observaciones"></textarea>
            <div class="note-datalist" v-if="diagnosticSuggestions.length">
              <label class="c-form__label subtle" for="obsAdd">Agregar sugerencia clínica</label>
              <input id="obsAdd" class="c-form__control" list="obs-suggestions" v-model="obsSuggestionInput" @change="onSelectSuggestion" @keydown.enter.prevent="onSelectSuggestion" placeholder="Selecciona o escribe y Enter" />
              <datalist id="obs-suggestions">
                <option v-for="s in diagnosticSuggestions" :key="s" :value="s"></option>
              </datalist>
            </div>
          </div>
        </div>
        <div class="c-form__actions c-form__actions--end">
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
    </transition>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import * as Prescriptions from '@/services/prescriptions.js';
import * as Patients from '@/services/patients.js';
import { useUiStore } from '@/stores/ui.js';
import { normalizeRxPayload, RX_LIMITS } from '@/composables/rx.js';
import { setupUnsavedGuard } from '@/composables/unsaved.js';
import RxPicker from '@/components/RxPicker.vue';

const route = useRoute();
import { useRouter } from 'vue-router';
const router = useRouter();
const pacienteId = computed(() => route.params.id);
const paciente = ref(null);
const pacienteNombre = computed(() => paciente.value ? `${paciente.value.nombres||''} ${paciente.value.apellidos||''}`.trim() : '');

const rx = reactive({
  odEsfera: null, odCilindro: null, odEje: null,
  oiEsfera: null, oiCilindro: null, oiEje: null,
  addPower: null, observaciones: ''
});
const obsSuggestionInput = ref('');
const savingRx = ref(false);
const msg = ref('');
const ui = useUiStore();
const initialSnap = ref('');

function clearRx(){
  rx.odEsfera = rx.odCilindro = rx.odEje = null;
  rx.oiEsfera = rx.oiCilindro = rx.oiEje = null;
  rx.addPower = null; rx.observaciones = '';
}

function insertNote(txt){
  if (!txt) return;
  if (rx.observaciones && !/\n$/.test(rx.observaciones)) rx.observaciones += '\n';
  rx.observaciones += txt;
}

function onSelectSuggestion(){
  const txt = (obsSuggestionInput.value || '').trim();
  if (!txt) return;
  insertNote(txt);
  obsSuggestionInput.value = '';
}

function toNum(n){ return (n == null || n === '') ? null : Number(n); }
function se(esf, cil){
  const E = toNum(esf); const C = toNum(cil);
  if (E == null && C == null) return null;
  const base = (E ?? 0) + ((C ?? 0)/2);
  if (!Number.isFinite(base)) return null;
  return Number(base.toFixed(2));
}
const diagnosticSuggestions = computed(() => {
  const T = { my: -0.5, hy: 0.5, ast: 0.5, add: 0.75 };
  const od = { E: toNum(rx.odEsfera), C: toNum(rx.odCilindro), SE: se(rx.odEsfera, rx.odCilindro) };
  const oi = { E: toNum(rx.oiEsfera), C: toNum(rx.oiCilindro), SE: se(rx.oiEsfera, rx.oiCilindro) };
  const add = toNum(rx.addPower);
  const out = new Set();
  const isMy = (eye) => (eye.SE != null ? eye.SE < 0 : (eye.E != null && eye.E <= T.my));
  const isHy = (eye) => (eye.SE != null ? eye.SE > 0 : (eye.E != null && eye.E >= T.hy));
  const hasAst = (eye) => (eye.C != null && Math.abs(eye.C) >= T.ast);

  const odMy = isMy(od), oiMy = isMy(oi);
  const odHy = isHy(od), oiHy = isHy(oi);
  const odAst = hasAst(od), oiAst = hasAst(oi);

  if (odMy && oiMy) out.add('Miopía bilateral');
  else {
    if (odMy) out.add('Miopía OD');
    if (oiMy) out.add('Miopía OI');
  }
  if (odHy && oiHy) out.add('Hipermetropía bilateral');
  else {
    if (odHy) out.add('Hipermetropía OD');
    if (oiHy) out.add('Hipermetropía OI');
  }
  if (odAst || oiAst) out.add('Astigmatismo');
  if (add != null && add >= T.add) out.add('Presbicia');

  return Array.from(out);
});

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

function goBack(){
  try { router.push({ name: 'archivo-detalle', params: { id: pacienteId.value } }); }
  catch { router.push({ name: 'archivo' }); }
}
</script>

<style scoped>
#recetaFieldset{ border: 0; padding: 0; margin: 0; }
.c-card{ overflow: hidden; }
.h2-row{ display:flex; align-items:flex-start; justify-content:flex-start; margin-right: 48px; flex-wrap: wrap; row-gap: .25rem; }
.h2-meta{ order: 2; flex: 1 0 100%; font-weight:600; font-size:.95rem; color: var(--color-text-muted); max-width: 100%; overflow:hidden; text-overflow: ellipsis; white-space: nowrap; }
/* Botones dentro de la tarjeta respetan el tema */
.c-form__actions .c-btn.c-btn--neo{
  background: var(--color-bg-elev, #fff);
  color: var(--color-text, #111);
  border-color: var(--color-border, #ccc);
}
.rx-eyes{ display:grid; gap: var(--space-3, 1rem); margin-top: var(--space-2, .75rem); }
@media (min-width: 900px){ .rx-eyes{ grid-template-columns: 1fr 1fr; } }
.rx-eye{ border:1px dashed var(--color-border, #ccc); border-radius:.5rem; padding: .75rem; background: var(--color-bg, transparent); }
.rx-eye__title{ margin: 0 0 .5rem 0; font-size: 1rem; color: var(--color-text-muted); }
.rx-grid{ display:grid; gap: .75rem; grid-template-columns: repeat(3, minmax(7rem, 1fr)); }
@media (max-width: 700px){ .rx-grid{ grid-template-columns: 1fr; } }
.note-datalist{ margin-top:.5rem; }
</style>
