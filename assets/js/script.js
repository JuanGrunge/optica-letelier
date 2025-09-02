// ===== Tema oscuro =====
const toggleSwitch = document.querySelector('#darkModeToggle');
const body = document.querySelector('body');

function switchTheme(e){
  if(e.target.checked){
    body.classList.add('dark-mode');
    localStorage.setItem('theme','dark');
  }else{
    body.classList.remove('dark-mode');
    localStorage.setItem('theme','light');
  }
}
if(toggleSwitch){
  toggleSwitch.addEventListener('change', switchTheme, false);
  const currentTheme = localStorage.getItem('theme');
  if(currentTheme){
    body.classList.add(currentTheme+'-mode');
    if(currentTheme==='dark'){ toggleSwitch.checked = true; }
  }
}

// ===== Navegación =====
function showSection(id){
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelector("nav").classList.remove("active");
}
document.querySelector(".menu-toggle").addEventListener("click", () => {
  document.querySelector("nav").classList.toggle("active");
});

// ===== Persistencia =====
const LS_KEY = 'pacientes';
function leerPacientes(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.warn('No se pudo leer pacientes:', e);
    return [];
  }
}
function guardarPacientes(pacientes){
  localStorage.setItem(LS_KEY, JSON.stringify(pacientes));
}

// ===== Helpers =====
const val = v => (v ?? '').toString().trim();
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s=>(
    { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s]
  ));
}
function getCheckedValues(nodeList){
  return Array.from(nodeList).filter(i=>i.checked).map(i=>i.value);
}
function chips(arr){
  if(!arr || arr.length===0) return '-';
  return `<div class="chips">${arr.map(v=>`<span class="chip">${escapeHtml(v)}</span>`).join('')}</div>`;
}
function calcularEdad(isoDate){
  if(!isoDate) return null;
  const hoy = new Date();
  const nac = new Date(isoDate);
  if(isNaN(nac.getTime())) return null;
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return Math.max(0, edad);
}
function formatearFecha(isoDate){
  if(!isoDate) return '';
  const d = new Date(isoDate);
  if(isNaN(d.getTime())) return '';
  const dia = String(d.getDate()).padStart(2,'0');
  const mes = String(d.getMonth()+1).padStart(2,'0');
  const ano = d.getFullYear();
  return `${dia}-${mes}-${ano}`;
}
function numOrNull(id){
  const v = (document.getElementById(id).value || '').trim();
  if(v==='') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ===== RUT =====
function normalizarRut(str){
  if(!str) return '';
  return str.replace(/[.\s-]/g,'').toUpperCase();
}
function separarRut(rutLimpio){
  const m = normalizarRut(rutLimpio).match(/^(\d+)-?([\dkK])$/);
  if(!m) return null;
  return { num: m[1], dv: m[2].toUpperCase() };
}
function calcularDV(numStr){
  let suma = 0, mul = 2;
  for(let i=numStr.length-1; i>=0; i--){
    suma += parseInt(numStr[i],10) * mul;
    mul = (mul === 7) ? 2 : mul + 1;
  }
  const res = 11 - (suma % 11);
  if(res === 11) return '0';
  if(res === 10) return 'K';
  return String(res);
}
function esRutValido(str){
  const partes = separarRut(str);
  if(!partes) return false;
  const dvCalc = calcularDV(partes.num);
  return dvCalc === partes.dv;
}
function formatearRut(str){
  const partes = separarRut(str);
  if(!partes) return str;
  const num = partes.num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${num}-${partes.dv}`;
}
function setRutError(msg){
  const el = document.getElementById('rutError');
  const input = document.getElementById('rut');
  if(el){ el.textContent = msg || ''; }
  if(input){
    if(msg){ input.classList.add('is-invalid'); }
    else{ input.classList.remove('is-invalid'); }
  }
}
function autoFormatearRut(){
  const input = document.getElementById('rut');
  if(!input) return;
  const v = normalizarRut(input.value);
  if(!v) { setRutError(''); actualizarEstadoBoton(); return; }
  input.value = formatearRut(v);
  if(!esRutValido(v)){ setRutError('RUT inválido'); }
  else{ setRutError(''); }
  actualizarEstadoBoton();
}
function actualizarEstadoBoton(){
  const btn = document.getElementById('btnGuardar');
  const rutRaw = document.getElementById('rut').value;
  const rutOk = esRutValido(rutRaw);
  const nombreOk = val(document.getElementById('nombre').value).length > 0;
  const opOk = val(document.getElementById('operativo').value).length > 0;
  if(btn){ btn.disabled = !(rutOk && nombreOk && opOk); }
}

// ===== Guardar / Editar =====
function guardarPaciente(event){
  event.preventDefault();

  const rutVal = normalizarRut(document.getElementById('rut').value);
  if(!esRutValido(rutVal)){
    setRutError('RUT inválido'); actualizarEstadoBoton();
    return;
  }

  const paciente = {
    nombre: val(document.getElementById('nombre').value),
    rut: formatearRut(rutVal),
    direccion: val(document.getElementById('direccion').value),
    fechaNac: val(document.getElementById('fechaNac').value),
    operativo: val(document.getElementById('operativo').value),
    receta: {
      od: {
        esf: numOrNull('odEsf'),
        cil: numOrNull('odCil'),
        eje: numOrNull('odEje'),
        add: numOrNull('odAdd'),
        pd:  numOrNull('odPD'),
        alt: numOrNull('odALT'),
      },
      oi: {
        esf: numOrNull('oiEsf'),
        cil: numOrNull('oiCil'),
        eje: numOrNull('oiEje'),
        add: numOrNull('oiAdd'),
        pd:  numOrNull('oiPD'),
        alt: numOrNull('oiALT'),
      }
    },
    diagnostico: getCheckedValues(document.querySelectorAll('input[name="dx"]')),
    cristal: getCheckedValues(document.querySelectorAll('input[name="cristal"]')),
    obs: val(document.getElementById('obs').value),
    creadoEn: new Date().toISOString()
  };

  if(!paciente.nombre || !paciente.rut || !paciente.operativo){
    mostrarMensaje('msgGuardado', 'Debes completar Nombre, RUT y Lugar de Operativo.', true);
    return;
  }

  const pacientes = leerPacientes();
  const idx = pacientes.findIndex(p => normalizarRut(p.rut || '') === rutVal);
  if(idx >= 0){ pacientes[idx] = { ...pacientes[idx], ...paciente }; }
  else{ pacientes.push(paciente); }

  guardarPacientes(pacientes);
  mostrarMensaje('msgGuardado', 'Datos guardados correctamente.');
  document.getElementById('formIngresar').reset();
  actualizarEstadoBoton();

  if(toggleSwitch && localStorage.getItem('theme')==='dark'){ toggleSwitch.checked = true; }
}

function mostrarMensaje(id, texto, error=false){
  const el = document.getElementById(id);
  if(!el) return;
  el.textContent = texto;
  el.style.color = error ? '#b00020' : '#0a7a0a';
  setTimeout(()=>{ el.textContent=''; }, 3000);
}

// ===== Búsqueda unificada =====
// fQuery acepta: RUT / Nombre / Operativo
// vacío → lista por operativo (no rellena el input)
function normalizarTexto(s){ return (s||'').toString().trim().toLowerCase(); }
function contieneRut(haystack, query){
  const h = (haystack||'').replace(/[.\s-]/g,'').toLowerCase();
  const q = (query||'').replace(/[.\s-]/g,'').toLowerCase();
  return h.includes(q);
}

function buscarPacientes(){
  const q = normalizarTexto(document.getElementById('fQuery').value);
  const pacientes = leerPacientes();

  if(!q){
    renderListaOperativo(pacientes);
    const msg = document.getElementById('msgResultados');
    msg.textContent = pacientes.length === 0 ? 'Sin pacientes cargados.' : `${pacientes.length} paciente(s).`;
    return;
  }

  const resultados = pacientes.filter(p => {
    const rutOk = p.rut ? contieneRut(p.rut, q) : false;
    const nomOk = (p.nombre || '').toLowerCase().includes(q);
    const opOk  = (p.operativo || '').toLowerCase().includes(q);
    return rutOk || nomOk || opOk;
  });

  renderFichas(resultados);
  const msg = document.getElementById('msgResultados');
  msg.textContent = resultados.length === 0
    ? 'Sin resultados. Ajusta tu búsqueda.'
    : `${resultados.length} resultado(s).`;
}

function limpiarBusqueda(){
  const iq = document.getElementById('fQuery');
  if(iq) iq.value = '';
  document.getElementById('listaResultados').innerHTML = '';
  document.getElementById('msgResultados').textContent = '';
}

// Lista por operativo (cada item abre detalle) SIN tocar el input
function renderListaOperativo(rows){
  const cont = document.getElementById('listaResultados');
  if(!cont) return;

  const list = [...rows].sort((a,b)=>(a.operativo||'').localeCompare(b.operativo||'') || (a.nombre||'').localeCompare(b.nombre||''));

  cont.innerHTML = list.map(p => `
    <div class="list-item" onclick="verPacienteDetalle('${encodeURIComponent(p.rut || '')}')">
      <div class="name">${escapeHtml(p.nombre || '(Sin nombre)')}</div>
      <div class="subtle">${escapeHtml(p.operativo || '')}</div>
    </div>
  `).join('');
}

function verPacienteDetalle(rutEncoded){
  const rut = decodeURIComponent(rutEncoded || '');
  const pacientes = leerPacientes();
  const p = pacientes.find(x => normalizarRut(x.rut || '') === normalizarRut(rut));
  const cont = document.getElementById('listaResultados');
  if(p && cont){
    cont.innerHTML = renderTarjetaPaciente(p);
    const msg = document.getElementById('msgResultados');
    if(msg) msg.textContent = '1 resultado.';
  }
}

// ===== Render de ficha (tabla con ° en Eje) =====
function fmtEje(val){
  if(val === null || val === undefined || val === '') return '-';
  return `${val}°`;
}
function fmtNum(val){
  if(val === null || val === undefined || val === '') return '-';
  return `${val}`;
}
function renderTarjetaPaciente(p){
  const recetaTabla = `
    <table class="recipe-table">
      <thead>
        <tr>
          <th>Ojo</th>
          <th>Esfera</th>
          <th>Cilindro</th>
          <th>Eje</th>
          <th>ADD</th>
          <th>PD (mm)</th>
          <th>ALT (mm)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>OD</td>
          <td>${fmtNum(p.receta?.od?.esf)}</td>
          <td>${fmtNum(p.receta?.od?.cil)}</td>
          <td>${fmtEje(p.receta?.od?.eje)}</td>
          <td>${fmtNum(p.receta?.od?.add)}</td>
          <td>${fmtNum(p.receta?.od?.pd)}</td>
          <td>${fmtNum(p.receta?.od?.alt)}</td>
        </tr>
        <tr>
          <td>OI</td>
          <td>${fmtNum(p.receta?.oi?.esf)}</td>
          <td>${fmtNum(p.receta?.oi?.cil)}</td>
          <td>${fmtEje(p.receta?.oi?.eje)}</td>
          <td>${fmtNum(p.receta?.oi?.add)}</td>
          <td>${fmtNum(p.receta?.oi?.pd)}</td>
          <td>${fmtNum(p.receta?.oi?.alt)}</td>
        </tr>
      </tbody>
    </table>
  `;

  const edad = calcularEdad(p.fechaNac);
  const fechaEdad = p.fechaNac
    ? `${escapeHtml(formatearFecha(p.fechaNac))} (${edad ?? 0} años)`
    : '—';

  return `
    <div class="result-card">
      <h4>${escapeHtml(p.nombre || '')}</h4>
      <div class="result-grid">
        <div class="result-field">
          <label>RUT</label>
          <div>${escapeHtml(p.rut || '')}</div>
        </div>
        <div class="result-field">
          <label>Dirección</label>
          <div>${escapeHtml(p.direccion || '-')}</div>
        </div>

        <div class="result-field">
          <label>Fecha de Nacimiento / Edad</label>
          <div>${fechaEdad}</div>
        </div>
        <div class="result-field">
          <label>Lugar de Operativo</label>
          <div>${escapeHtml(p.operativo || '')}</div>
        </div>

        <div class="result-field result-recipe">
          <label>Receta Óptica</label>
          ${recetaTabla}
        </div>

        <div class="result-field">
          <label>Diagnóstico</label>
          <div>${chips(p.diagnostico)}</div>
        </div>
        <div class="result-field">
          <label>Opciones de Cristal</label>
          <div>${chips(p.cristal)}</div>
        </div>

        <div class="result-field" style="grid-column:1/-1;">
          <label>Observaciones</label>
          <div>${escapeHtml(p.obs || '-')}</div>
        </div>
      </div>

      <div class="card-actions">
        <button class="btn-edit" onclick="editarPaciente('${encodeURIComponent(p.rut || '')}')">Editar información</button>
      </div>
    </div>
  `;
}

// ===== Edición =====
function editarPaciente(rutEncoded){
  const rut = decodeURIComponent(rutEncoded || '');
  const pacientes = leerPacientes();
  const p = pacientes.find(x => normalizarRut(x.rut || '') === normalizarRut(rut));
  if(!p) return;

  document.getElementById('nombre').value = p.nombre || '';
  document.getElementById('rut').value = p.rut || '';
  document.getElementById('direccion').value = p.direccion || '';
  document.getElementById('fechaNac').value = p.fechaNac || '';
  document.getElementById('operativo').value = p.operativo || '';

  document.getElementById('odEsf').value = p.receta?.od?.esf ?? '';
  document.getElementById('odCil').value = p.receta?.od?.cil ?? '';
  document.getElementById('odEje').value = p.receta?.od?.eje ?? '';
  document.getElementById('odAdd').value = p.receta?.od?.add ?? '';
  document.getElementById('odPD').value  = p.receta?.od?.pd  ?? '';
  document.getElementById('odALT').value = p.receta?.od?.alt ?? '';

  document.getElementById('oiEsf').value = p.receta?.oi?.esf ?? '';
  document.getElementById('oiCil').value = p.receta?.oi?.cil ?? '';
  document.getElementById('oiEje').value = p.receta?.oi?.eje ?? '';
  document.getElementById('oiAdd').value = p.receta?.oi?.add ?? '';
  document.getElementById('oiPD').value  = p.receta?.oi?.pd  ?? '';
  document.getElementById('oiALT').value = p.receta?.oi?.alt ?? '';

  const dxSet = new Set(Array.isArray(p.diagnostico) ? p.diagnostico : []);
  document.querySelectorAll('input[name="dx"]').forEach(i=>{ i.checked = dxSet.has(i.value); });

  const cSet = new Set(Array.isArray(p.cristal) ? p.cristal : []);
  document.querySelectorAll('input[name="cristal"]').forEach(i=>{ i.checked = cSet.has(i.value); });

  document.getElementById('obs').value = p.obs || '';

  showSection('ingresar');
  actualizarEstadoBoton();
  mostrarMensaje('msgGuardado', 'Editando paciente: actualiza y guarda para confirmar.');
}

// ===== Eventos iniciales =====
const rutInput = document.getElementById('rut');
if(rutInput){
  rutInput.addEventListener('blur', autoFormatearRut);
  rutInput.addEventListener('input', ()=>{
    const v = normalizarRut(rutInput.value);
    if(v && !esRutValido(v)){ setRutError('RUT inválido'); }
    else{ setRutError(''); }
    actualizarEstadoBoton();
  });
}
['nombre','operativo'].forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.addEventListener('input', actualizarEstadoBoton);
});
window.addEventListener('load', actualizarEstadoBoton);
