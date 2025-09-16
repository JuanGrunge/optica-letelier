import { esRutValido, formatearRut, normalizarRut } from '../validators.js';

export function initArchive(){
  const form = document.getElementById('formBuscar');
  const input = document.getElementById('fQuery');
  const tbody = document.getElementById('listaResultados');
  const msg = document.getElementById('msgResultados');
  if (!form || !input || !tbody) return;

  function setMessage(text){ if(msg){ msg.textContent = text || ''; } }
  function clearTable(){ if(tbody){ tbody.innerHTML = ''; } }
  function renderRows(items){
    if (!Array.isArray(items)) return;
    const rows = items.map(p => {
      const rut = p?.rut || '';
      const nombre = [p?.nombres||'', p?.apellidos||''].join(' ').trim();
      const lugar = '—';
      return `<tr><td>${rut}</td><td>${nombre}</td><td>${lugar}</td></tr>`;
    }).join('');
    tbody.innerHTML = rows || '';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearTable(); setMessage('');
    const raw = (input.value || '').trim();
    if (!raw){ setMessage('Ingresa un RUT para buscar.'); return; }
    // Permitir búsqueda parcial. Si es un RUT válido, lo formateamos sólo para visualización.
    const maybeFmt = esRutValido(raw) ? formatearRut(raw) : raw;
    // Normalizado (sin puntos ni guión) para coincidencias parciales en backend
    const nq = normalizarRut(raw);
    try {
      const page = await window.PatientsRepo.list({ q: maybeFmt, nq, page: 0, size: 50 });
      const items = page?.content ?? page;
      if (!items || items.length === 0){ setMessage('Sin resultados'); return; }
      renderRows(items);
      setMessage('');
    } catch (err){
      setMessage('Error al buscar');
      console.warn('Buscar RUT:', err);
    }
  });
}
