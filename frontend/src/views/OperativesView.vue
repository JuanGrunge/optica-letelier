<template>
  <section class="view active" id="operatives">
    <transition name="card-fade" mode="out-in">
      <div class="c-card" key="operatives-card">
        <h2>Operativos</h2>

        <div v-if="error" class="alert-banner alert-banner--warning" role="status" aria-live="polite">
          {{ errorMessage }}
        </div>

        <div v-else>
          <template v-if="items.length">
            <table class="c-table rx-table" role="table" aria-label="Listado de operativos">
              <thead>
                <tr>
                  <th scope="col">Nombre/Lugar</th>
                  <th scope="col">Fecha de creación</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="o in items" :key="o.id">
                  <td>{{ o.nombre || o.name || '-' }}</td>
                  <td>{{ formatDate(o.createdAt || o.fechaCreacion || o.created_at) }}</td>
                  <td>
                    <span class="status">
                      <span class="status-dot" :class="{ active: !!o.active }" aria-hidden="true"></span>
                      <span class="status-text">{{ o.active ? 'Activo' : 'Inactivo' }}</span>
                    </span>
                  </td>
                  <td>
                    <div class="c-switch" style="--w:42px; --h:22px; --pad:3px">
                      <input :id="'tgl-'+o.id" type="checkbox" :checked="!!o.active" :aria-label="`Cambiar estado de ${o.nombre || o.name || 'operativo'}`" @change="onToggle(o)" />
                      <label class="c-switch__slider" :for="'tgl-'+o.id"></label>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="pager">
              <button class="c-btn" type="button" @click="prevPage" :disabled="page===0">Prev</button>
              <span class="page-ind">{{ page+1 }} / {{ totalPages }}</span>
              <button class="c-btn" type="button" @click="nextPage" :disabled="page+1>=totalPages">Next</button>
            </div>
          </template>
          <template v-else>
            <p class="subtle" role="status">No hay operativos para mostrar.</p>
          </template>
        </div>

        <Modal v-model="showConfirm">
          <template #header>
            <strong>Desactivar operativo</strong>
          </template>
          ¿Confirmas desactivar este operativo? Es posible que afecte la atención en curso.
          <template #actions>
            <button class="c-btn" type="button" @click="showConfirm=false">Cancelar</button>
            <button class="c-btn c-btn--neo" type="button" @click="confirmDisable">Confirmar</button>
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

async function load(){
  loading.value = true; error.value = false;
  try {
    const res = await Operatives.listAll({ page: page.value, size });
    const list = Array.isArray(res?.content) ? res.content : (Array.isArray(res) ? res : []);
    items.value = list.map(x => ({ ...x }));
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

const pendingToggle = ref(null);
const showConfirm = ref(false);

function onToggle(o){
  const next = !o.active;
  if (!next) { // about to disable
    pendingToggle.value = o;
    showConfirm.value = true;
    return;
  }
  applyToggle(o, next);
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
    ui.showToast(o.active ? 'Operativo activado.' : 'Operativo desactivado.');
  } catch {
    o.active = prev; // rollback
    ui.showToast('No se pudo actualizar el estado.');
  }
}
</script>

<style scoped>
.rx-table th{ text-align:left; font-weight:600; }
.status{ display:inline-flex; align-items:center; gap:8px; }
.status-dot{ width:10px; height:10px; border-radius:50%; background: var(--status-inactive, #9aa0a6); display:inline-block; }
.status-dot.active{ background: var(--status-active, #2ECC71); }
.pager{ display:flex; align-items:center; gap: var(--space-3); margin-top: var(--space-3); }
.page-ind{ color: var(--color-text-muted); }
</style>

