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
              <td>
                {{ (p.nombres||'') + ' ' + (p.apellidos||'') }}
                <RouterLink v-if="isIncomplete(p)" class="badge badge--warn" :to="{ name: 'paciente-editar', params: { id: p.id } }" @click.stop title="Completar datos" aria-label="Completar datos" style="margin-left:.5rem; text-decoration:none;">Incompleto</RouterLink>
              </td>
            </tr>
            <tr v-if="!loading && items.length===0"><td colspan="2" class="subtle">Sin resultados</td></tr>
          </transition-group>
        </table>
      </div>
      <div class="pagination" v-if="total!=null">
        <button class="c-btn c-btn--icon c-btn--back btn-inline" :disabled="page<=0 || loading" @click="loadPage(page-1)" aria-label="Anterior" title="Anterior">
          <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
            <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 6l-6 6l6 6"/>
            </g>
          </svg>
        </button>
        <span class="page-info">Página {{ page+1 }} · Total: {{ total }}</span>
        <button class="c-btn c-btn--icon c-btn--back btn-inline" :disabled="(page+1)>=pages || loading" @click="loadPage(page+1)" aria-label="Siguiente" title="Siguiente">
          <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
            <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 6l6 6l-6 6"/>
            </g>
          </svg>
        </button>
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
        <button v-if="showBackToNew" class="c-btn c-btn--icon c-btn--back c-btn--no-anim c-card__action--tr" type="button" @click="goBackToNew" title="Volver a Nuevo Paciente" aria-label="Volver a Nuevo Paciente" style="right:56px;">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/>
              <path d="M11 6l-6 6l6 6"/>
            </g>
          </svg>
        </button>
      </div>
      <div class="paciente-detalle" v-if="detail">
        <div v-if="isIncomplete(detail)" class="alert-banner alert-banner--warning" role="status" style="margin-bottom:8px;">
          Datos incompletos: completa nombres y comuna.
          <RouterLink class="c-btn c-btn--icon btn-inline" :to="{ name: 'paciente-editar', params: { id: detail.id } }" style="margin-left:8px" aria-label="Editar paciente" title="Editar paciente">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83l3.75 3.75l1.83-1.83z"/></g></svg>
          </RouterLink>
        </div>
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
                <a v-if="isAndroid()" class="c-btn c-btn--icon btn-inline map-pin" :href="linkForAndroid(detail.operativoDireccion, detail.operativoComuna)" aria-label="Abrir lugar operativo en mapas" title="Abrir en mapas">
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></g></svg>
                </a>
                <a v-else-if="!isIOS()" class="c-btn c-btn--icon btn-inline map-pin" :href="linkForDesktop(detail.operativoDireccion, detail.operativoComuna)" target="_blank" rel="noopener" aria-label="Abrir en Google Maps" title="Abrir en Google Maps">
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></g></svg>
                </a>
                <a v-else class="c-btn c-btn--icon btn-inline map-pin" :href="linkForIOS(detail.operativoDireccion, detail.operativoComuna)" aria-label="Abrir en mapas" title="Abrir en mapas">
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
                <a v-if="isAndroid()" class="c-btn c-btn--icon btn-inline map-pin" :href="linkForAndroid(detail.direccion, detail.comuna)" aria-label="Abrir dirección del paciente en mapas" title="Abrir en mapas">
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></g></svg>
                </a>
                <a v-else-if="!isIOS()" class="c-btn c-btn--icon btn-inline map-pin" :href="linkForDesktop(detail.direccion, detail.comuna)" target="_blank" rel="noopener" aria-label="Abrir en Google Maps" title="Abrir en Google Maps">
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></g></svg>
                </a>
                <a v-else class="c-btn c-btn--icon btn-inline map-pin" :href="linkForIOS(detail.direccion, detail.comuna)" aria-label="Abrir en mapas" title="Abrir en mapas">
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></g></svg>
                </a>
              </template>
            </p>
          </div>
        </div>
        <!-- Botón Editar paciente: debajo de la ficha, a la derecha -->
        <div class="actions-right">
          <RouterLink v-if="auth.hasPerm('editPatient')" class="c-btn c-btn--icon c-btn--neo" :class="{ 'is-disabled': (!auth.hasOperative && auth.role!=='admin') }" :title="(!auth.hasOperative && auth.role!=='admin') ? 'Selecciona tu lugar de operativo' : null" :to="{ name: 'paciente-editar', params: { id: detail?.id }, query: { from: route.fullPath } }" aria-label="Editar paciente" title="Editar paciente">
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
          <button v-if="auth.hasPerm('deletePatient')" class="c-btn c-btn--icon btn-danger" type="button" @click="onDeletePatient" aria-label="Eliminar paciente" title="Eliminar paciente">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"/>
                <path d="M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <path d="M19 6l-1 14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l-1 -14"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
              </g>
            </svg>
          </button>
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
          <RouterLink v-if="auth.hasPerm('createPrescription')" class="c-btn c-btn--icon c-btn--neo" :class="{ 'is-disabled': (!auth.hasOperative && auth.role!=='admin') }" :title="(!auth.hasOperative && auth.role!=='admin') ? 'Selecciona tu lugar de operativo' : null" :to="{ name: 'receta-nueva', params: { id: detail?.id }, query: { from: route.fullPath } }" aria-label="Nueva receta" title="Nueva receta">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14"/>
                <path d="M5 12h14"/>
              </g>
            </svg>
          </RouterLink>
          <button v-if="auth.hasPerm('deletePrescription') && rxItems.length" class="c-btn c-btn--icon btn-danger" type="button" @click="onDeleteRx(rxItems[0].id)" aria-label="Eliminar receta" title="Eliminar receta">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l-1 -14"/><path d="M10 11v6"/><path d="M14 11v6"/></g></svg>
          </button>
        </div>
        <div class="subseccion">
          <h5>Boletas recientes</h5>
          <template v-if="invItems.length">
            <transition-group name="list-fade" tag="ul" class="list-tiles">
              <li class="tile" v-for="i in invItems" :key="i.id">
                <div class="tile__title tile__title--right">{{ i.fecha || '' }} <span v-if="i.anulado" class="badge badge--warn">Anulado</span></div>
                <div class="actions-br" v-if="auth.hasPerm('deleteInvoice') && !i.anulado">
                  <button class="c-btn c-btn--icon btn-danger" type="button" @click="onAnnulInvoice(i.id)" aria-label="Anular boleta" title="Anular boleta">
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l-1 -14"/><path d="M10 11v6"/><path d="M14 11v6"/></g></svg>
                  </button>
                </div>
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
import * as Operatives from '@/services/operatives.js';
import { useAuthStore } from '@/stores/auth.js';
import { useUiStore } from '@/stores/ui.js';
import { useArchiveStore } from '@/stores/archive.js';
import { isAndroid, isIOS, linkForAndroid, linkForDesktop, linkForIOS } from '@/composables/maps.js';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const ui = useUiStore();
const archive = useArchiveStore();

function isIncomplete(p){
  try {
    const hasNames = !!(p?.nombres && p?.apellidos);
    const hasComuna = !!p?.comuna;
    return !(hasNames && hasComuna);
  } catch { return true; }
}

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
const showBackToNew = computed(() => (auth.role === 'receptor') && (route.query?.from === 'ingresar'));

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

function goBackToNew(){ router.push({ name: 'paciente-nuevo' }); }

async function onDeletePatient(){
  if (!detail.value?.id) return;
  const ok = window.confirm('¿Eliminar paciente y todos sus registros relacionados?');
  if (!ok) return;
  try {
    // Pre-check operativo activo (no aplica a admin)
    try {
      if (auth.role !== 'admin' && auth?.operativeId != null){
        const o = await Operatives.getById(auth.operativeId);
        const isActive = !!(o?.active ?? o?.enabled ?? o?.activo);
        if (!isActive){ ui.showToast('El lugar de operativo se encuentra inactivo. Selecciona otro.'); router.push({ name: 'cuenta' }); return; }
      }
    } catch {}
    await Patients.remove(detail.value.id);
    ui.showToast('Paciente eliminado');
    backToList();
    try { await loadDefault(); } catch {}
  } catch (e) { ui.showToast('No se pudo eliminar'); }
}

async function onDeleteRx(id){
  const ok = window.confirm('¿Eliminar receta seleccionada?');
  if (!ok) return;
  try {
    // Pre-check operativo activo (no aplica a admin)
    try {
      if (auth.role !== 'admin' && auth?.operativeId != null){
        const o = await Operatives.getById(auth.operativeId);
        const isActive = !!(o?.active ?? o?.enabled ?? o?.activo);
        if (!isActive){ ui.showToast('El lugar de operativo se encuentra inactivo. Selecciona otro.'); router.push({ name: 'cuenta' }); return; }
      }
    } catch {}
    await Prescriptions.remove(id);
    ui.showToast('Receta eliminada');
    if (detail.value?.id) {
      const rx = await Prescriptions.listByPaciente({ pacienteId: detail.value.id, page: 0, size: 5 });
      const rxContent = Array.isArray(rx?.content) ? rx.content : [];
      rxItems.value = rxContent.length ? [rxContent[0]] : [];
    }
  } catch (e) { ui.showToast('No se pudo eliminar'); }
}

async function onAnnulInvoice(id){
  const ok = window.confirm('¿Anular boleta seleccionada?');
  if (!ok) return;
  try {
    // Pre-check operativo activo (no aplica a admin)
    try {
      if (auth.role !== 'admin' && auth?.operativeId != null){
        const o = await Operatives.getById(auth.operativeId);
        const isActive = !!(o?.active ?? o?.enabled ?? o?.activo);
        if (!isActive){ ui.showToast('El lugar de operativo se encuentra inactivo. Selecciona otro.'); router.push({ name: 'cuenta' }); return; }
      }
    } catch {}
    await Invoices.annul(id);
    ui.showToast('Boleta anulada');
    if (detail.value?.id) {
      const inv = await Invoices.listByPaciente({ pacienteId: detail.value.id, page: 0, size: 5 });
      invItems.value = Array.isArray(inv?.content) ? inv.content : [];
    }
  } catch (e) { ui.showToast('No se pudo anular'); }
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
.map-pin svg{ color: #E53935; vertical-align: middle; transform: translateY(1px); }
.actions-br{ position:absolute; right:8px; bottom:8px; display:flex; gap:6px; }
.tile{ position: relative; }
.btn-danger{ color: #fff; background: color-mix(in oklab, #C62828 85%, var(--color-surface)); border: 1px solid color-mix(in oklab, #C62828 60%, var(--color-border)); }
.btn-danger:hover{ filter: brightness(1.05); }
.is-disabled{ pointer-events:none; opacity:.6; filter: grayscale(25%); }
.map-menu{ position:absolute; top:100%; right:0; background: var(--color-surface, #fff); border:1px solid var(--color-border, #ddd); border-radius:6px; padding:6px; display:flex; flex-direction:column; gap:4px; z-index:10; min-width:160px; }

/* Receta reciente: ojos horizontal en desktop, specs verticales por ojo */
.tile__eyes{ display: grid; grid-template-columns: 1fr; gap: 8px; align-items: flex-start; }
.tile__eye{ display:flex; align-items:flex-start; gap: 8px; }
.eye__label{ font-weight: 700; min-width: 2.2em; }
.eye__specs{ display:flex; flex-direction: column; gap: 2px; }
@media (min-width: 768px){
  .tile__eyes{ display:flex; flex-direction: row; gap: 16px; }
  .tile__eye{ flex: 1 1 0; }
}
</style>




