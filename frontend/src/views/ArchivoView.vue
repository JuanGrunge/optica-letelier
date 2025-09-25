<template>
  <section id="archivo" class="view active">
    <div class="c-card">
      <h2>Archivo</h2>
      <p class="subtle">Busca solo por <strong>RUT</strong>.</p>
      <form @submit.prevent="onSearch">
        <div class="filters single">
          <div class="c-search">
            <input v-model.trim="query" class="c-search__input" type="text" placeholder="Ej: 12.345.678-K">
            <button class="c-search__btn" type="submit" aria-label="Buscar" title="Buscar" :disabled="loading">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="10" cy="10" r="7"/>
                  <path d="M21 21l-6-6"/>
                </g>
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>

    <transition name="card-fade" mode="out-in">
    <div v-if="!showDetail" class="c-card" key="list">
      <div class="results-header">
        <h3 style="display:inline-block;margin-right:12px;">Resultados</h3>
      </div>
      <div class="c-table-scroll">
        <table class="c-table">
          <thead>
            <tr><th>RUT</th><th>Nombre Paciente</th></tr>
          </thead>
          <transition-group name="list-fade" tag="tbody">
            <tr v-for="p in items" :key="p.id" class="row-paciente" role="button" tabindex="0"
                @click="openDetail(p.id)" @keydown.enter.prevent="openDetail(p.id)" @keydown.space.prevent="openDetail(p.id)">
              <td>{{ p.rut }}</td>
              <td>{{ (p.nombres||'') + ' ' + (p.apellidos||'') }}</td>
            </tr>
            <tr v-if="!loading && items.length===0"><td colspan="2" class="subtle">Sin resultados</td></tr>
          </transition-group>
        </table>
      </div>
      <div class="pagination" v-if="total!=null">
        <button :disabled="page<=0 || loading" @click="loadPage(page-1)">Anterior</button>
        <span class="page-info">Página {{ page+1 }} · Total: {{ total }}</span>
        <button :disabled="(page+1)>=pages || loading" @click="loadPage(page+1)">Siguiente</button>
      </div>
      <p class="subtle">{{ message }}</p>
    </div>
    <div v-else class="c-card" key="detail">
      <div class="results-header">
        <h3 style="display:inline-block;margin-right:12px;">Ficha del Paciente</h3>
        <button class="c-btn c-btn--icon c-btn--back c-btn--no-anim c-card__action--tr" type="button" @click="backToList" title="Volver a resultados" aria-label="Volver a resultados">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/>
              <path d="M13 6l6 6l-6 6"/>
            </g>
          </svg>
        </button>
      </div>
      <div class="paciente-detalle" v-if="detail">
        <div class="grid-2">
          <div>
            <p><strong>Nombre:</strong> {{ fullName }}</p>
            <p><strong>RUT:</strong> {{ detail.rut || '-' }}</p>
            <p><strong>Fecha Nac.:</strong> {{ detail.fechaNac || '-' }}</p>
            <p class="inline-row">
              <strong>Lugar Operativo:</strong>
              <span class="value">
                {{ detail.operativoLugar || '-' }}
                <template v-if="detail?.operativoDireccion"> — {{ detail.operativoDireccion }}<template v-if="detail?.operativoComuna">, {{ detail.operativoComuna }}</template></template>
              </span>
              <template v-if="detail?.operativoDireccion">
                <a v-if="isAndroid()" class="c-btn c-btn--icon btn-inline" :href="linkForAndroid(detail.operativoDireccion, detail.operativoComuna)" aria-label="Abrir lugar operativo en mapas" title="Abrir en mapas">
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></g></svg>
                </a>
                <a v-else-if="!isIOS()" class="c-btn c-btn--icon btn-inline" :href="linkForDesktop(detail.operativoDireccion, detail.operativoComuna)" target="_blank" rel="noopener" aria-label="Abrir en Google Maps" title="Abrir en Google Maps">
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></g></svg>
                </a>
                <a v-else class="c-btn c-btn--icon btn-inline" :href="linkForIOS(detail.operativoDireccion, detail.operativoComuna)" aria-label="Abrir en mapas" title="Abrir en mapas">
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></g></svg>
                </a>
              </template>
            </p>
          </div>
          <div>
            <p><strong>Telefono:</strong> {{ detail.telefono || '-' }}</p>
            <p><strong>Email:</strong> {{ detail.email || '-' }}</p>
            <p class="inline-row">
              <strong>Dirección:</strong>
              <span class="value">{{ detail.direccion || '-' }}<template v-if="detail?.comuna">, {{ detail.comuna }}</template></span>
              <template v-if="detail?.direccion">
                <a v-if="isAndroid()" class="c-btn c-btn--icon btn-inline" :href="linkForAndroid(detail.direccion, detail.comuna)" aria-label="Abrir dirección del paciente en mapas" title="Abrir en mapas">
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></g></svg>
                </a>
                <a v-else-if="!isIOS()" class="c-btn c-btn--icon btn-inline" :href="linkForDesktop(detail.direccion, detail.comuna)" target="_blank" rel="noopener" aria-label="Abrir en Google Maps" title="Abrir en Google Maps">
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></g></svg>
                </a>
                <a v-else class="c-btn c-btn--icon btn-inline" :href="linkForIOS(detail.direccion, detail.comuna)" aria-label="Abrir en mapas" title="Abrir en mapas">
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></g></svg>
                </a>
              </template>
            </p>
          </div>
        </div>
        <!-- Botón Editar paciente: debajo de la ficha, a la derecha -->
        <div class="actions-right">
          <RouterLink class="c-btn c-btn--icon c-btn--neo" :to="{ name: 'paciente-editar', params: { id: detail?.id }, query: { from: route.fullPath } }" aria-label="Editar paciente" title="Editar paciente">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <!-- línea base -->
                <path d="M4 20H20"/>
                <!-- lápiz -->
                <path d="M7 19l-4 1 1-4L16.5 3.5a2.121 2.121 0 0 1 3 3Z"/>
                <!-- unión goma/cuerpo sin sobresalir -->
                <path d="M15 5l3 3" stroke-linecap="butt"/>
              </g>
            </svg>
          </RouterLink>
        </div>
        <div class="subseccion">
          <h5>Receta reciente</h5>
          <template v-if="rxItems.length">
            <transition-group name="list-fade" tag="ul" class="list-tiles">
              <li class="tile" v-for="r in rxItems" :key="r.id">
                <div class="tile__title tile__title--right">{{ r.fecha || '' }}</div>
                <div class="tile__eyes">
                  <div class="tile__eye">
                    <div class="eye__label">OD</div>
                    <div class="eye__specs">
                      <div>ESF {{ fmt2(r.odEsfera) }}</div>
                      <div>CIL {{ fmt2(r.odCilindro) }}</div>
                      <div>EJE {{ fmt2(r.odEje) }}</div>
                    </div>
                  </div>
                  <div class="tile__eye">
                    <div class="eye__label">OI</div>
                    <div class="eye__specs">
                      <div>ESF {{ fmt2(r.oiEsfera) }}</div>
                      <div>CIL {{ fmt2(r.oiCilindro) }}</div>
                      <div>EJE {{ fmt2(r.oiEje) }}</div>
                    </div>
                  </div>
                </div>
                <div v-if="r.addPower!=null" class="tile__row"><span class="tile__label">ADD</span><span class="tile__value">{{ fmt2(r.addPower) }}</span></div>
                <div v-if="r.observaciones" class="tile__obs">{{ r.observaciones }}</div>
              </li>
            </transition-group>
          </template>
          <p v-else class="subtle">Sin recetas</p>
        </div>
        <!-- Botón Agregar receta: debajo de receta, a la derecha -->
        <div class="actions-right">
          <RouterLink class="c-btn c-btn--icon c-btn--neo" :to="{ name: 'receta-nueva', params: { id: detail?.id }, query: { from: route.fullPath } }" aria-label="Nueva receta" title="Nueva receta">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14"/>
                <path d="M5 12h14"/>
              </g>
            </svg>
          </RouterLink>
        </div>
        <div class="subseccion">
          <h5>Boletas recientes</h5>
          <template v-if="invItems.length">
            <transition-group name="list-fade" tag="ul" class="list-tiles">
              <li class="tile" v-for="i in invItems" :key="i.id">
                <div class="tile__title tile__title--right">{{ i.fecha || '' }} <span v-if="i.anulado" class="badge badge--warn">Anulado</span></div>
                <div class="tile__row"><span class="tile__label">Total</span><span class="tile__value">${{ i.total || 0 }}</span></div>
                <div v-if="i.detalle" class="tile__row"><span class="tile__label">Detalle</span><span class="tile__value">{{ i.detalle }}</span></div>
              </li>
            </transition-group>
          </template>
          <p v-else class="subtle">Sin boletas</p>
        </div>
      </div>
      <div v-else class="subtle">Cargando ficha...</div>
    </div>
    </transition>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import * as Patients from '@/services/patients.js';
import * as Prescriptions from '@/services/prescriptions.js';
import * as Invoices from '@/services/invoices.js';
import { useAuthStore } from '@/stores/auth.js';
import { useUiStore } from '@/stores/ui.js';
import { useArchiveStore } from '@/stores/archive.js';
import { isAndroid, isIOS, linkForAndroid, linkForDesktop, linkForIOS } from '@/composables/maps.js';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const ui = useUiStore();
const archive = useArchiveStore();

const query = ref(archive.q || '');
const items = ref(archive.items || []);
const total = ref(archive.total ?? null);
const page = ref(archive.page || 0);
const pages = ref(archive.pages || 0);
const size = archive.size || 5;
const loading = ref(false);
const message = ref(archive.message || '');

const showDetail = ref(false);
const detail = ref(null);
const rxItems = ref([]);
const invItems = ref([]);
const fullName = computed(() => [detail.value?.nombres||'', detail.value?.apellidos||''].join(' ').trim());

function fmt2(n){
  if (n == null || n === '') return '-';
  const v = Number(n);
  return Number.isFinite(v) ? v.toFixed(2) : '-';
}

async function loadDefault(){
  try {
    loading.value = true; message.value = '';
    if (archive.hasCache){
      query.value = archive.q; items.value = archive.items; total.value = archive.total;
      page.value = archive.page; pages.value = archive.pages; message.value = archive.message;
    } else {
      total.value = await Patients.count();
      page.value = 0;
      const pageData = await Patients.list({ page: 0, size });
      applyPage(pageData);
      try { archive.setFromPage(pageData, { q: '', page: 0, size }); } catch {}
    }
  } catch {
    message.value = '';
  } finally { loading.value = false; }
}

function applyPage(pageData){
  const content = Array.isArray(pageData?.content) ? pageData.content : [];
  items.value = content;
  const t = (typeof pageData?.totalElements === 'number') ? pageData.totalElements : (typeof total.value==='number'? total.value : 0);
  total.value = t;
  const p = (typeof pageData?.page === 'number') ? pageData.page : page.value;
  page.value = p;
  pages.value = t ? Math.ceil(t / size) : 0;
  const showing = content.length;
  message.value = `Mostrando ${showing} registros${t!=null?` · Total: ${t}`:''}`;
}

async function onSearch(){
  try {
    loading.value = true; message.value='';
    const raw = (query.value||'').trim();
    if (!raw){ await loadDefault(); return; }
    const q = raw;
    const pageData = await Patients.list({ q, page: 0, size });
    try { archive.setQuery(q); } catch {}
    applyPage(pageData);
  } catch (e) {
    message.value = 'Error al buscar';
    console.warn('Buscar RUT:', e);
  } finally { loading.value = false; }
}

async function loadPage(n){
  if (n<0) return; page.value = n;
  const raw = (query.value||'').trim();
  const params = raw ? { q: raw, page: n, size } : { page: n, size };
  try { loading.value = true; const pageData = await Patients.list(params); applyPage(pageData); try { archive.setFromPage(pageData, { q: raw, page: n, size }); } catch {} } finally { loading.value = false; }
}

async function openDetail(id){
  try {
    showDetail.value = true; detail.value = null; rxItems.value = []; invItems.value = [];
    const [d, rx, inv] = await Promise.all([
      Patients.getById(id),
      Prescriptions.listByPaciente({ pacienteId: id, page: 0, size: 5 }),
      Invoices.listByPaciente({ pacienteId: id, page: 0, size: 5 })
    ]);
    detail.value = d;
    const rxContent = Array.isArray(rx?.content) ? rx.content : [];
    rxItems.value = rxContent.length ? [rxContent[0]] : [];
    invItems.value = Array.isArray(inv?.content) ? inv.content : [];
  } catch (e) {
    message.value = 'No se pudo cargar la ficha';
    console.warn('Detalle paciente', e);
    ui.showToast('No se pudo cargar la ficha');
  }
}
function backToList(){
  showDetail.value = false; detail.value = null; rxItems.value = []; invItems.value = [];
  if (route.name === 'archivo-detalle') {
    router.push({ name: 'archivo' });
  }
}

onMounted(async () => {
  if (!auth.isAuthenticated) return;
  await loadDefault();
  const id = route.params?.id;
  if (id) {
    try { await openDetail(id); } catch {}
  }
});
</script>

<style scoped>
.actions-right{ display:flex; justify-content:flex-end; gap: 8px; margin: 8px 0; }
.inline-row{ display:inline-flex; align-items:center; gap:8px; flex-wrap:wrap; }
.btn-inline{ width:1.8em; height:1.8em; padding:0; line-height:1; display:inline-flex; align-items:center; justify-content:center; }
.map-menu{ position:absolute; top:100%; right:0; background: var(--color-surface, #fff); border:1px solid var(--color-border, #ddd); border-radius:6px; padding:6px; display:flex; flex-direction:column; gap:4px; z-index:10; min-width:160px; }
</style>


