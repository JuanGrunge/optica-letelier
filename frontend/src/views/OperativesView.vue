<template>
  <section class="view active" id="operatives">
    <!-- Card 1: Crear nuevo operativo (admin) -->
    <div class="c-card" key="operatives-new">
      <h2 style="margin-right:48px;">Agregar operativo</h2>
      <button class="c-btn c-btn--icon c-btn--back c-btn--no-anim c-card__action--tr" type="button" @click="opFormOpen=!opFormOpen" :aria-label="opFormOpen ? 'Contraer' : 'Expandir'" :title="opFormOpen ? 'Contraer' : 'Expandir'">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" :style="{ transform: opFormOpen ? 'rotate(180deg)' : 'none' }"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6l6-6"/></g></svg>
      </button>
      <transition name="fade-fast">
      <form v-show="opFormOpen" class="c-form" @submit.prevent="onCreate">
        <div class="o-grid o-grid__2">
          <div class="c-form__group">
            <label class="c-form__label" for="opNombre">Nombre/Lugar</label>
            <input id="opNombre" class="c-form__control" v-model.trim="newOp.nombre" placeholder="Ej: Zona Norte" required />
          </div>
          <div class="c-form__group">
            <label class="c-form__label" for="opDireccion">Dirección</label>
            <input id="opDireccion" class="c-form__control" v-model.trim="newOp.direccion" placeholder="Calle 123" />
          </div>
          <div class="c-form__group">
            <label class="c-form__label" for="opComuna">Comuna</label>
            <input id="opComuna" class="c-form__control" v-model.trim="newOp.comuna" placeholder="Comuna" />
          </div>
        </div>
        <div class="c-form__actions c-form__actions--end">
          <button class="c-btn c-btn--icon c-btn--neo" type="submit" :disabled="creating" aria-label="Crear operativo" title="Crear operativo">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></g></svg>
          </button>
          <span class="subtle">{{ createMsg }}</span>
        </div>
      </form>
      </transition>
    </div>
    <!-- Card 2: Listado + estado o detalle -->
    <transition name="card-fade" mode="out-in">
      <div class="c-card" :key="showDetail ? 'op-detail' : 'operatives-card'">

        <div v-if="error" class="alert-banner alert-banner--warning" role="status" aria-live="polite">
          {{ errorMessage }}
        </div>

        <div v-else-if="!showDetail">
          <template v-if="items.length">
            <table class="c-table rx-table op-table" role="table" aria-label="Listado de operativos">
              <thead>
                <tr>
                  <th scope="col" class="col-action">Acciones</th>
                  <th scope="col" class="col-name">Nombre/Lugar</th>
                  <th scope="col" class="col-status">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="o in items" :key="o.id" @click="openDetail(o)" style="cursor: pointer;">
                  <td class="col-action">
                    <div class="c-switch" style="--w:42px; --h:22px; --pad:3px" @click.stop>
                      <input :id="'tgl-'+o.id" type="checkbox" :checked="!!o.active" :aria-label="`Cambiar estado de ${o.nombre || o.name || 'operativo'}`" @change="onToggle(o, $event)" @click.stop />
                      <label class="c-switch__slider" :for="'tgl-'+o.id" @click.stop></label>
                    </div>
                  </td>
                  <td class="col-name">{{ o.nombre || o.name || '-' }}</td>
                  <td class="col-status">
                    <div class="status-wrap">
                      <span class="status">
                        <span class="status-dot" :class="{ active: !!o.active }" aria-hidden="true"></span>
                        <span class="status-text">{{ o.active ? 'Activo' : 'Inactivo' }}</span>
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="pager">
              <button class="c-btn c-btn--icon c-btn--back btn-inline" type="button" @click="prevPage" :disabled="page===0" aria-label="Anterior" title="Anterior">
                <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                  <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 6l-6 6l6 6"/>
                  </g>
                </svg>
              </button>
              <span class="page-ind" aria-live="polite">{{ page+1 }} / {{ totalPages }}</span>
              <button class="c-btn c-btn--icon c-btn--back btn-inline" type="button" @click="nextPage" :disabled="page+1>=totalPages" aria-label="Siguiente" title="Siguiente">
                <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                  <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 6l6 6l-6 6"/>
                  </g>
                </svg>
              </button>
            </div>
          </template>
          <template v-else>
            <p class="subtle" role="status">No hay operativos para mostrar.</p>
          </template>
        </div>
        <div v-else>
          <div class="op-detail-head">
            <div class="op-detail-row">
              <div class="c-switch" style="--w:42px; --h:22px; --pad:3px" @click.stop>
                <input :id="'tgl-detail-'+(selectedOperative?.id||'')" type="checkbox" :checked="!!selectedOperative?.active" :aria-label="`Cambiar estado de ${selectedOperative?.nombre || selectedOperative?.lugar || 'operativo'}`" @change="onToggle(selectedOperative, $event)" @click.stop />
                <label class="c-switch__slider" :for="'tgl-detail-'+(selectedOperative?.id||'')" @click.stop></label>
              </div>
              <h3 class="op-detail-title">{{ selectedOperative?.nombre || selectedOperative?.lugar || 'Operativo' }}</h3>
              <button class="c-btn c-btn--icon c-btn--back c-btn--no-anim c-card__action--tr" type="button" @click="closeDetail" aria-label="Volver" title="Volver">
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6l-6 6"/></g></svg>
              </button>
            </div>
            <div class="op-detail-status">
              <span class="status">
                <span class="status-dot" :class="{ active: !!selectedOperative?.active }" aria-hidden="true"></span>
                <span class="status-text">{{ selectedOperative?.active ? 'Activo' : 'Inactivo' }}</span>
              </span>
            </div>
          </div>
          <div class="c-table-scroll">
            <table class="c-table" role="table" aria-label="Pacientes por operativo">
              <thead>
                <tr><th>Nombre</th><th>RUT</th><th>Fecha del operativo</th></tr>
              </thead>
              <tbody>
                <tr v-for="p in patients" :key="p.id">
                  <td>{{ (p.nombres||'') + ' ' + (p.apellidos||'') }}</td>
                  <td>{{ p.rut || '-' }}</td>
                  <td>{{ formatDate(selectedOperative?.fecha) }}</td>
                </tr>
                <tr v-if="!patients.length"><td colspan="3" class="subtle">Sin pacientes</td></tr>
              </tbody>
            </table>
          </div>
          <div class="pager">
            <button class="c-btn c-btn--icon c-btn--back btn-inline" type="button" @click="prevPatients" :disabled="patientsPage===0" aria-label="Anterior" title="Anterior">
              <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6l6 6"/></g></svg>
            </button>
            <span class="page-ind" aria-live="polite">{{ patientsPage+1 }} / {{ patientsPages }}</span>
            <button class="c-btn c-btn--icon c-btn--back btn-inline" type="button" @click="nextPatients" :disabled="patientsPage+1>=patientsPages" aria-label="Siguiente" title="Siguiente">
              <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6l-6 6"/></g></svg>
            </button>
          </div>
        </div>

        <Modal v-model="showConfirm">
          <template #header>
            <strong>Desactivar operativo</strong>
          </template>
          ¿Confirmas desactivar este operativo? Es posible que afecte la atención en curso.
          <template #actions>
            <button class="c-btn c-btn--icon c-btn--back btn-inline" type="button" @click="showConfirm=false" aria-label="Cancelar" title="Cancelar">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></g></svg>
            </button>
            <button class="c-btn c-btn--icon c-btn--back btn-inline" type="button" @click="confirmDisable" aria-label="Aceptar" title="Aceptar">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3l5-5"/></g></svg>
            </button>
          </template>
        </Modal>
      </div>
    </transition>
  </section>
  
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Modal from '@/components/Modal.vue';
import { useUiStore } from '@/stores/ui.js';
import { useAuthStore } from '@/stores/auth.js';
import * as Operatives from '@/services/operatives.js';

const ui = useUiStore();

const page = ref(0);
const size = 5;
const totalElements = ref(0);
const totalPages = computed(() => Math.max(1, Math.ceil(totalElements.value / size)));
const items = ref([]);
const loading = ref(false);
const error = ref(false);
const errorMessage = computed(() => 'No pudimos cargar los operativos. Reintenta en unos minutos.');
const auth = useAuthStore();
// Create form state
const newOp = ref({ nombre: '', direccion: '', comuna: '' });
const creating = ref(false);
const createMsg = ref('');

// Detail state
const showDetail = ref(false);
const selectedOperative = ref(null);
const patients = ref([]);
const patientsTotal = ref(0);
const patientsPage = ref(0);
const patientsSize = 10;
const patientsPages = computed(() => Math.max(1, Math.ceil(patientsTotal.value / patientsSize)));
const opFormOpen = ref(false);

async function load(){
  loading.value = true; error.value = false;
  try {
    const res = await Operatives.listAll({ page: page.value, size });
    const list = Array.isArray(res?.content) ? res.content : (Array.isArray(res) ? res : []);
    const mapped = list.map(normalizeOperative);
    // Orden alfabético estable por lugar/nombre para evitar saltos
    items.value = mapped.sort((a,b) => ((a.lugar||a.nombre||'').localeCompare((b.lugar||b.nombre||''), 'es', { sensitivity:'base' })));
    totalElements.value = Number(res?.totalElements ?? list.length ?? 0);
  } catch {
    error.value = true; items.value = [];
  } finally { loading.value = false; }
}

onMounted(() => { load(); });

function formatDate(s){
  if (!s) return '-';
  try {
    const d = new Date(s);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth()+1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  } catch { return '-'; }
}

function prevPage(){ if (page.value>0){ page.value--; load(); } }
function nextPage(){ if (page.value+1<totalPages.value){ page.value++; load(); } }

async function loadPatients(){
  if (!selectedOperative?.value?.id) return;
  try {
    const res = await Operatives.listPatients(selectedOperative.value.id, { page: patientsPage.value, size: patientsSize });
    const list = Array.isArray(res?.content) ? res.content : (Array.isArray(res) ? res : []);
    patients.value = list;
    patientsTotal.value = Number(res?.totalElements ?? list.length ?? 0);
  } catch { patients.value = []; patientsTotal.value = 0; }
}

function openDetail(op){
  selectedOperative.value = op;
  showDetail.value = true;
  patientsPage.value = 0;
  loadPatients();
}
function closeDetail(){
  showDetail.value = false;
  selectedOperative.value = null;
  patients.value = [];
  patientsPage.value = 0;
  // Refrescar la lista para asegurar estados/switches frescos
  try { load(); } catch {}
}
function prevPatients(){ if (patientsPage.value>0){ patientsPage.value--; loadPatients(); } }
function nextPatients(){ if (patientsPage.value+1<patientsPages.value){ patientsPage.value++; loadPatients(); } }

const pendingToggle = ref(null);
const toggling = ref(new Set());
function isToggling(id){ try { return toggling.value.has(Number(id)); } catch { return false; } }
function markToggling(id, on){
  const s = new Set(toggling.value);
  if (on) s.add(Number(id)); else s.delete(Number(id));
  toggling.value = s;
}
const showConfirm = ref(false);

function onToggle(o, ev){
  const input = ev?.target;
  const next = !!input?.checked;
  const prev = !!o.active;
  if (next === prev) return;
  markToggling(o.id, true);
  if (!next) { // about to disable
    // Revert visual state until confirmation
    if (input) input.checked = true;
    pendingToggle.value = o;
    showConfirm.value = true;
    return;
  }
  applyToggle(o, true);
}

async function confirmDisable(){
  const o = pendingToggle.value;
  showConfirm.value = false;
  if (!o) return;
  await applyToggle(o, false);
  pendingToggle.value = null;
}

async function applyToggle(o, active){
  const prev = !!o.active;
  o.active = !!active; // optimistic
  try {
    await Operatives.setActive(o.id, o.active);
    try {
      const fresh = await Operatives.getById(o.id);
      o.active = !!(fresh?.active ?? fresh?.enabled ?? fresh?.activo);
    } catch {}
    ui.showToast(o.active ? 'Operativo activado.' : 'Operativo desactivado.');
    // Si se desactivó y es el seleccionado por este usuario, limpiar selección y avisar
    try {
      if (!o.active && auth?.operativeId != null && Number(auth.operativeId) === Number(o.id)){
        auth.setOperativeSelection(null, '');
        ui.showToast('Tu lugar de operativo fue desactivado. Elige otro en Cuenta.');
      }
    } catch {}
    await load();
  } catch (e) {
    // For prototype: ensure admin can deactivate. Retry with force on expected conflicts
    if (!active && (Number(e?.status) === 409 || Number(e?.status) === 422)){
      try {
        await Operatives.setActive(o.id, false, { force: true });
        try { const fresh = await Operatives.getById(o.id); o.active = !!(fresh?.active ?? fresh?.enabled ?? fresh?.activo); } catch {}
        ui.showToast('Operativo desactivado.');
        try {
          if (!o.active && auth?.operativeId != null && Number(auth.operativeId) === Number(o.id)){
            auth.setOperativeSelection(null, '');
            ui.showToast('Tu lugar de operativo fue desactivado. Elige otro en Cuenta.');
          }
        } catch {}
        await load();
        return;
      } catch {}
    }
    o.active = prev; // rollback
    ui.showToast('No se pudo actualizar el estado.');
  }
  finally { markToggling(o.id, false); }
}

async function onCreate(){
  try {
    creating.value = true; createMsg.value = '';
    const dto = { nombre: (newOp.value.nombre||'').trim(), direccion: (newOp.value.direccion||'')||null, comuna: (newOp.value.comuna||'')||null };
    if (!dto.nombre){ createMsg.value = 'Nombre/Lugar es requerido'; return; }
    await Operatives.create(dto);
    ui.showToast('Operativo creado.');
    newOp.value = { nombre: '', direccion: '', comuna: '' };
    await load();
  } catch(e){
    const text = String(e?.message||'');
    if (/409|duplicate|existe|ya existe/i.test(text)){
      createMsg.value = 'Ya existe un operativo con esos datos.';
      ui.showToast('Ya existe un operativo con esos datos.');
    } else {
      createMsg.value = 'No se pudo crear el operativo.';
      ui.showToast('No se pudo crear el operativo.');
    }
  } finally { creating.value = false; }
}

function normalizeOperative(x){
  const active = (x?.active != null) ? !!x.active : (x?.enabled != null ? !!x.enabled : (x?.activo != null ? !!x.activo : false));
  const nombre = x?.nombre ?? x?.name ?? '';
  return { ...x, active, nombre };
}
</script>

<style scoped>
.rx-table th{ text-align:left; font-weight:600; }
.op-table{ width:100%; border-collapse: collapse; }
.op-table th, .op-table td{ padding: var(--space-3); }
.op-table .col-action{ text-align: center; width: 80px; }
.op-table .col-name{ text-align: left; }
.op-table .col-status{ text-align: center; }
.status-wrap{ display:flex; align-items:center; justify-content:center; gap: var(--space-3); }
.status{ display:inline-flex; align-items:center; gap:8px; }
.status-dot{ width:10px; height:10px; border-radius:50%; background: var(--status-inactive, #9aa0a6); display:inline-block; }
.status-dot.active{ background: var(--status-active, #2ECC71); }
.pager{ display:flex; align-items:center; gap: var(--space-3); margin-top: var(--space-3); }
.page-ind{ color: var(--color-text-muted); }
/* Compact icon-only pager buttons */
.btn-inline{ width:1.8em; height:1.8em; padding:0; line-height:1; display:inline-flex; align-items:center; justify-content:center; }

@media (max-width: 720px){
  .op-table th, .op-table td{ padding: var(--space-2); }
  .status-wrap{ gap: var(--space-2); }
}

/* Detail header layout */
.op-detail-head{ margin-bottom: var(--space-3); }
.op-detail-row{ display:flex; align-items:center; gap: var(--space-3); flex-wrap: wrap; }
.op-detail-title{ margin: 0; }
.op-detail-status{ display:flex; align-items:center; gap: var(--space-2); margin-top: 6px; }
</style>
