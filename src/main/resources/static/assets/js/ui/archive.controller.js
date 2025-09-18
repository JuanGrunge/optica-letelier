import { esRutValido, formatearRut, normalizarRut } from '../validators.js';
import { getCurrentUser } from '../auth.js';

export function initArchive(){
  const form = document.getElementById('formBuscar');
  const input = document.getElementById('fQuery');
  const tbody = document.getElementById('listaResultados');
  const msg = document.getElementById('msgResultados');
  const pag = document.getElementById('paginacionResultados');
  const resultadosCard = document.getElementById('resultados');
  const fichaCard = document.getElementById('fichaPacienteCard');
  const detailBox = document.getElementById('detallePaciente');
  const backBtn = document.getElementById('btnVolverResultados');
  if (!form || !input || !tbody) return;

  function setMessage(text){ if (msg) msg.textContent = text || ''; }
  function clearTable(){ if (tbody) tbody.innerHTML = ''; }

  let totalPacientes = null;
  const pageSize = 5;
  let currentPage = 0;
  let currentQuery = null; // { q, nq } o null

  async function loadDefault(){
    try {
      await waitForRepo();
      totalPacientes = await window.PatientsRepo.count();
      currentQuery = null; currentPage = 0;
      const page = await window.PatientsRepo.list({ page: 0, size: pageSize });
      renderPage(page);
    } catch {
      setMessage('');
    }
  }

  document.addEventListener('auth:ready', loadDefault);
  try { if (getCurrentUser()) setTimeout(loadDefault, 0); } catch {}

  function renderRows(items){
    if (!Array.isArray(items)) return;
    const rows = items.map(p => {
      const rut = p?.rut || '';
      const nombre = [p?.nombres||'', p?.apellidos||''].join(' ').trim();
      const pid = p?.id != null ? Number(p.id) : '';
      return `<tr class="row-paciente" data-id="${pid}" tabindex="0" role="button" aria-label="Ver ficha de ${nombre}"><td>${rut}</td><td>${nombre}</td></tr>`;
    }).join('');
    tbody.innerHTML = rows || '';
    tbody.querySelectorAll('tr.row-paciente').forEach(tr => {
      tr.addEventListener('click', () => {
        const id = Number(tr.getAttribute('data-id'));
        if (Number.isFinite(id)) mostrarDetalle(id);
      });
      tr.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tr.click(); }
      });
    });
  }

  function showDetailMode(){
    if (resultadosCard) resultadosCard.style.display = 'none';
    if (fichaCard) fichaCard.style.display = '';
  }
  function showListMode(){
    if (fichaCard) fichaCard.style.display = 'none';
    if (detailBox) detailBox.innerHTML = '';
    if (resultadosCard) resultadosCard.style.display = '';
  }
  if (backBtn) backBtn.addEventListener('click', showListMode);

  async function mostrarDetalle(id){
    if (!detailBox) return;
    showDetailMode();
    detailBox.innerHTML = '<p class="subtle">Cargando ficha...</p>';
    try {
      const paciente = await window.PatientsRepo.getById(id);
      const [rxPage, invPage] = await Promise.all([
        (window.PrescriptionsRepository?.listByPaciente?.({ pacienteId: id, page: 0, size: 5 }) || Promise.resolve(null)),
        (window.InvoicesRepository?.listByPaciente?.({ pacienteId: id, page: 0, size: 5 }) || Promise.resolve(null))
      ]);

      const nombre = [paciente?.nombres||'', paciente?.apellidos||''].join(' ').trim();
      const rut = paciente?.rut || '';
      const tel = paciente?.telefono || '';
      const email = paciente?.email || '';
      const dir = paciente?.direccion || '';
      const fnac = paciente?.fechaNac || '';
      // Determinar lugar de operativo asociado (si existe)
      const opLugar = paciente?.operativoLugar || '-';

      const rxItems = rxPage && Array.isArray(rxPage.content) ? rxPage.content : [];
      const invItems = invPage && Array.isArray(invPage.content) ? invPage.content : [];

      detailBox.innerHTML = `
          <div class="grid-2">
            <div>
              <p><strong>Nombre:</strong> ${nombre || '-'}</p>
              <p><strong>RUT:</strong> ${rut || '-'}</p>
              <p><strong>Fecha Nac.:</strong> ${fnac || '-'}</p>
              <p><strong>Lugar Operativo:</strong> ${opLugar || '-'}</p>
            </div>
            <div>
              <p><strong>Telefono:</strong> ${tel || '-'}</p>
              <p><strong>Email:</strong> ${email || '-'}</p>
              <p><strong>Direccion:</strong> ${dir || '-'}</p>
            </div>
          </div>
          <div class="subseccion">
            <h5>Recetas recientes</h5>
            ${rxItems.length ? '<ul class="list-tiles">' + rxItems.map(r => `
              <li class="tile">
                <div class="tile__title tile__title--right">${r.fecha || ''}</div>
                <div class="tile__eyes">
                  <div class="tile__eye">
                    <div class="eye__label">OD</div>
                    <div class="eye__specs">
                      <div>ESF ${r.odEsfera != null ? r.odEsfera : '-'}</div>
                      <div>CIL ${r.odCilindro != null ? r.odCilindro : '-'}</div>
                      <div>EJE ${r.odEje != null ? r.odEje : '-'}</div>
                    </div>
                  </div>
                  <div class="tile__eye">
                    <div class="eye__label">OI</div>
                    <div class="eye__specs">
                      <div>ESF ${r.oiEsfera != null ? r.oiEsfera : '-'}</div>
                      <div>CIL ${r.oiCilindro != null ? r.oiCilindro : '-'}</div>
                      <div>EJE ${r.oiEje != null ? r.oiEje : '-'}</div>
                    </div>
                  </div>
                </div>
                ${r?.addPower!=null?`<div class="tile__row"><span class="tile__label">ADD</span><span class="tile__value">${r.addPower}</span></div>`:''}
                ${r?.observaciones?`<div class="tile__obs">${r.observaciones}</div>`:''}
              </li>`).join('') + '</ul>' : '<p class="subtle">Sin recetas</p>'}
          </div>
          <div class="subseccion">
            <h5>Boletas recientes</h5>
            ${invItems.length ? '<ul class="list-tiles">' + invItems.map(i => `
              <li class="tile">
                <div class="tile__title tile__title--right">${i.fecha || ''} ${i.anulado?'<span class="badge badge--warn">Anulado</span>':''}</div>
                <div class="tile__row"><span class="tile__label">Total</span><span class="tile__value">$${i.total || 0}</span></div>
                ${i?.detalle?`<div class="tile__row"><span class="tile__label">Detalle</span><span class="tile__value">${i.detalle}</span></div>`:''}
              </li>`).join('') + '</ul>' : '<p class="subtle">Sin boletas</p>'}
          </div>`;
    } catch (e){
      detailBox.innerHTML = `<p class="error">No se pudo cargar la ficha.</p>`;
      console.warn('Detalle paciente', e);
    }
  }

  function fmtEye(esf, cil, eje){
    const E = esf != null ? esf : '-';
    const C = cil != null ? cil : '-';
    const A = eje != null ? eje : '-';
    return `ESF ${E}, CIL ${C}, EJE ${A}`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearTable(); setMessage('');
    const raw = (input.value || '').trim();
    if (!raw){
      // Sin término de búsqueda: cargar vista por defecto (conteo + primera página)
      try { await loadDefault(); } catch {}
      return;
    }
    const maybeFmt = esRutValido(raw) ? formatearRut(raw) : raw;
    const nq = normalizarRut(raw);
    try {
      await waitForRepo();
      currentQuery = { q: maybeFmt, nq };
      currentPage = 0;
      const page = await window.PatientsRepo.list({ q: maybeFmt, nq, page: 0, size: pageSize });
      renderPage(page);
    } catch (err){
      const suffix = (typeof totalPacientes === 'number') ? ` · Total pacientes: ${totalPacientes}` : '';
      setMessage(`Error al buscar${suffix}`);
      console.warn('Buscar RUT:', err);
    }
  });

  async function waitForRepo(maxWaitMs = 2000){
    const start = Date.now();
    while (!window.PatientsRepo) {
      if (Date.now() - start > maxWaitMs) break;
      await new Promise(r => setTimeout(r, 50));
    }
  }

  function renderPage(page){
    const items = page?.content ?? [];
    renderRows(items);
    renderPagination(page);
    const total = (typeof page?.totalElements === 'number') ? page.totalElements : (typeof totalPacientes === 'number' ? totalPacientes : 0);
    const showing = Array.isArray(items) ? items.length : 0;
    const suffix = total != null ? ` · Total: ${total}` : '';
    setMessage(`Mostrando ${showing} registros${suffix}`);
  }

  function renderPagination(page){
    if (!pag) return;
    const pageNum = page?.page ?? currentPage;
    const totalPages = page?.totalPages ?? 1;
    currentPage = pageNum;
    pag.innerHTML = '';
    if (totalPages <= 1) { pag.style.display='none'; return; }
    pag.style.display='';
    const prev = document.createElement('button');
    prev.type='button'; prev.textContent = 'Anterior'; prev.disabled = pageNum<=0;
    prev.addEventListener('click', () => gotoPage(pageNum-1));
    const next = document.createElement('button');
    next.type='button'; next.textContent = 'Siguiente'; next.disabled = pageNum>=totalPages-1;
    next.addEventListener('click', () => gotoPage(pageNum+1));
    const info = document.createElement('span');
    info.className = 'page-info';
    info.textContent = `Pagina ${pageNum+1} de ${totalPages}`;
    pag.append(prev, info, next);
  }

  async function gotoPage(p){
    if (p < 0) return; currentPage = p;
    const params = { page: currentPage, size: pageSize };
    if (currentQuery){ params.q = currentQuery.q; params.nq = currentQuery.nq; }
    const page = await window.PatientsRepo.list(params);
    renderPage(page);
  }
}
