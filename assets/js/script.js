/**************
 *   AUTENTICACIÓN
 **************/
const AUTH_KEY = 'sesion';
const USERS_KEY = 'usuarios';

async function sha256Hex(text){
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
async function seedUsers(){
  if(localStorage.getItem(USERS_KEY)) return;
  const adminHash = await sha256Hex('Letelier#2025');
  localStorage.setItem(USERS_KEY, JSON.stringify([{ username:'admin', passHash:adminHash, role:'admin' }]));
}
function getUsers(){ try{ return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch{ return []; } }
function findUser(username){ return getUsers().find(u => (u.username || '').toLowerCase() === String(username||'').toLowerCase()); }
function setSession(sess){ localStorage.setItem(AUTH_KEY, JSON.stringify(sess)); }
function getSession(){ try{ return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch{ return null; } }
function clearSession(){ localStorage.removeItem(AUTH_KEY); }

function requireAuth(){
  const sess = getSession();
  if(!sess){ lockApp(); return false; }
  unlockApp(sess);
  return true;
}
function lockApp(){
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.getElementById('loginOverlay')?.classList.add('active');
  document.getElementById('userBadge').hidden = true;
  document.getElementById('btnLogout').hidden = true;
}
function unlockApp(sess){
  document.getElementById('loginOverlay')?.classList.remove('active');
  const badge = document.getElementById('userBadge');
  if(badge){
    const prettyRole = sess.role === 'admin' ? 'Administrador' : sess.role;
    badge.textContent = `${sess.username} (${prettyRole})`;
    badge.hidden = false;
  }
  document.getElementById('btnLogout').hidden = false;
}

async function handleLogin(e){
  e.preventDefault();
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const msg = document.getElementById('loginMsg'); msg.textContent = '';

  const user = findUser(u);
  if(!user){ msg.textContent = 'Usuario o contraseña inválidos.'; return; }
  const hash = await sha256Hex(p);
  if(hash !== user.passHash){ msg.textContent = 'Usuario o contraseña inválidos.'; return; }

  setSession({ username:user.username, role:user.role, at:new Date().toISOString() });
  msg.textContent = 'Acceso concedido.';
  document.getElementById('loginForm').reset();
  unlockApp(getSession());
  showSection('ingresar');
}

function setupLogout(){
  document.getElementById('btnLogout')?.addEventListener('click', ()=>{ clearSession(); lockApp(); });
}
function guardShowSection(id){ if(!requireAuth()) return; showSection(id); }

/**************
 *   TEMA
 **************/
const toggleSwitch = document.querySelector('#darkModeToggle');
const body = document.querySelector('body');
function switchTheme(e){
  if(e.target.checked){ body.classList.add('dark-mode'); localStorage.setItem('theme','dark'); }
  else{ body.classList.remove('dark-mode'); localStorage.setItem('theme','light'); }
}
function initTheme(){
  if(!toggleSwitch) return;
  toggleSwitch.addEventListener('change', switchTheme, false);
  const currentTheme = localStorage.getItem('theme');
  if(currentTheme){
    body.classList.add(currentTheme+'-mode');
    if(currentTheme==='dark'){ toggleSwitch.checked = true; }
  }
}

/**************
 *   NAV
 **************/
function showSection(id){
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelector("nav").classList.remove("active");
}
document.querySelector(".menu-toggle").addEventListener("click", () => {
  document.querySelector("nav").classList.toggle("active");
});

/**************
 *   PACIENTES (LS)
 **************/
const LS_KEY = 'pacientes';
function leerPacientes(){ try{ const raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : []; } catch{ return []; } }
function guardarPacientes(pacientes){ localStorage.setItem(LS_KEY, JSON.stringify(pacientes)); }

/**************
 *   HELPERS
 **************/
const val = v => (v ?? '').toString().trim();
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s])); }
function getCheckedValues(nodeList){ return Array.from(nodeList).filter(i=>i.checked).map(i=>i.value); }
function chips(arr){ if(!arr || arr.length===0) return '-'; return `<div class="chips">${arr.map(v=>`<span class="chip">${escapeHtml(v)}</span>`).join('')}</div>`; }
function calcularEdad(isoDate){ if(!isoDate) return null; const h=new Date(), n=new Date(isoDate); if(isNaN(n)) return null; let e=h.getFullYear()-n.getFullYear(); const m=h.getMonth()-n.getMonth(); if(m<0||(m===0&&h.getDate()<n.getDate())) e--; return Math.max(0,e); }
function formatearFecha(isoDate){ if(!isoDate) return ''; const d=new Date(isoDate); if(isNaN(d)) return ''; const dd=String(d.getDate()).padStart(2,'0'); const mm=String(d.getMonth()+1).padStart(2,'0'); const yy=d.getFullYear(); return `${dd}-${mm}-${yy}`; }
function numOrNull(id){ const v=(document.getElementById(id).value||'').trim(); if(v==='') return null; const n=Number(v); return Number.isFinite(n)?n:null; }

/* RUT */
function normalizarRut(str){ if(!str) return ''; return str.replace(/[.\s-]/g,'').toUpperCase(); }
function separarRut(r){ const m=normalizarRut(r).match(/^(\d+)-?([\dkK])$/); if(!m) return null; return { num:m[1], dv:m[2].toUpperCase() }; }
function calcularDV(num){ let s=0,m=2; for(let i=num.length-1;i>=0;i--){ s+=parseInt(num[i],10)*m; m=(m===7)?2:m+1; } const r=11-(s%11); return r===11?'0':r===10?'K':String(r); }
function esRutValido(str){ const p=separarRut(str); return !!p && calcularDV(p.num)===p.dv; }
function formatearRut(str){ const p=separarRut(str); if(!p) return str; const num=p.num.replace(/\B(?=(\d{3})+(?!\d))/g,'.'); return `${num}-${p.dv}`; }
function setRutError(msg){ const el=document.getElementById('rutError'); const input=document.getElementById('rut'); if(el) el.textContent=msg||''; if(input){ if(msg) input.classList.add('is-invalid'); else input.classList.remove('is-invalid'); } }
function autoFormatearRut(){ const i=document.getElementById('rut'); if(!i) return; const v=normalizarRut(i.value); if(!v){ setRutError(''); actualizarEstadoBoton(); return; } i.value=formatearRut(v); setRutError(!esRutValido(v)?'RUT inválido':''); actualizarEstadoBoton(); }
function actualizarEstadoBoton(){ const b=document.getElementById('btnGuardar'); const r=document.getElementById('rut').value; const ok=esRutValido(r)&&val(document.getElementById('nombre').value)&&val(document.getElementById('operativo').value); if(b) b.disabled=!ok; }

/**************
 *   GUARDAR (form principal)
 **************/
function guardarPaciente(e){
  e.preventDefault();
  if(!requireAuth()) return;

  const rutVal = normalizarRut(document.getElementById('rut').value);
  if(!esRutValido(rutVal)){ setRutError('RUT inválido'); actualizarEstadoBoton(); return; }

  const paciente = {
    nombre: val(document.getElementById('nombre').value),
    rut: formatearRut(rutVal),
    direccion: val(document.getElementById('direccion').value),
    fechaNac: val(document.getElementById('fechaNac').value),
    operativo: val(document.getElementById('operativo').value),
    receta: {
      od: { esf:numOrNull('odEsf'), cil:numOrNull('odCil'), eje:numOrNull('odEje'), add:numOrNull('odAdd'), pd:numOrNull('odPD'), alt:numOrNull('odALT') },
      oi: { esf:numOrNull('oiEsf'), cil:numOrNull('oiCil'), eje:numOrNull('oiEje'), add:numOrNull('oiAdd'), pd:numOrNull('oiPD'), alt:numOrNull('oiALT') }
    },
    diagnostico: getCheckedValues(document.querySelectorAll('input[name="dx"]')),
    obs: val(document.getElementById('obs').value),
    creadoEn: new Date().toISOString()
  };

  if(!paciente.nombre || !paciente.rut || !paciente.operativo){
    mostrarMensaje('msgGuardado','Debes completar Nombre, RUT y Lugar de Operativo.',true); return;
  }

  const pacientes = leerPacientes();
  const idx = pacientes.findIndex(p => normalizarRut(p.rut || '') === rutVal);
  if(idx >= 0) pacientes[idx] = { ...pacientes[idx], ...paciente };
  else pacientes.push(paciente);

  guardarPacientes(pacientes);
  mostrarMensaje('msgGuardado','Datos guardados correctamente.');
  document.getElementById('formIngresar').reset();
  actualizarEstadoBoton();
  if(toggleSwitch && localStorage.getItem('theme')==='dark') toggleSwitch.checked = true;
}

function mostrarMensaje(id, texto, error=false){
  const el=document.getElementById(id); if(!el) return;
  el.textContent=texto; el.style.color= error ? '#b00020' : '#0a7a0a';
  setTimeout(()=>{ el.textContent=''; },3000);
}

/**************
 *   BÚSQUEDA
 **************/
function normalizarTexto(s){ return (s||'').toString().trim().toLowerCase(); }
function contieneRut(h,q){ const H=(h||'').replace(/[.\s-]/g,'').toLowerCase(); const Q=(q||'').replace(/[.\s-]/g,'').toLowerCase(); return H.includes(Q); }

function buscarPacientes(){
  if(!requireAuth()) return;
  showSection('archivo');

  const q = normalizarTexto(document.getElementById('fQuery').value);
  const pacientes = leerPacientes();

  if(!q){
    renderListaOperativo(pacientes);
    document.getElementById('msgResultados').textContent = pacientes.length===0 ? 'Sin pacientes cargados.' : `${pacientes.length} paciente(s).`;
    return;
  }

  const resultados = pacientes.filter(p=>{
    const rutOk = p.rut ? contieneRut(p.rut, q) : false;
    const nomOk = (p.nombre||'').toLowerCase().includes(q);
    const opOk  = (p.operativo||'').toLowerCase().includes(q);
    return rutOk || nomOk || opOk;
  });

  renderFichas(resultados);
  document.getElementById('msgResultados').textContent = resultados.length===0 ? 'Sin resultados. Ajusta tu búsqueda.' : `${resultados.length} resultado(s).`;
}

function limpiarBusqueda(){
  const iq=document.getElementById('fQuery'); if(iq) iq.value='';
  document.getElementById('listaResultados').innerHTML='';
  document.getElementById('msgResultados').textContent='';
}

function renderListaOperativo(rows){
  const cont=document.getElementById('listaResultados'); if(!cont) return;
  const list=[...rows].sort((a,b)=>(a.operativo||'').localeCompare(b.operativo||'')||(a.nombre||'').localeCompare(b.nombre||''));
  cont.innerHTML = list.map(p=>`
    <div class="list-item" onclick="verPacienteDetalle('${encodeURIComponent(p.rut || '')}')">
      <div class="name">${escapeHtml(p.nombre || '(Sin nombre)')}</div>
      <div class="subtle">${escapeHtml(p.operativo || '')}</div>
    </div>`).join('');
}

function verPacienteDetalle(rutEncoded){
  if(!requireAuth()) return;
  const rut=decodeURIComponent(rutEncoded||'');
  const pacientes=leerPacientes();
  const p=pacientes.find(x=>normalizarRut(x.rut||'')===normalizarRut(rut));
  const cont=document.getElementById('listaResultados');
  if(p&&cont){
    cont.innerHTML=renderTarjetaPaciente(p);
    const msg=document.getElementById('msgResultados'); if(msg) msg.textContent='1 resultado.';
  }
}

function fmtEje(v){ if(v===null||v===undefined||v==='') return '-'; return `${v}°`; }
function fmtNum(v){ if(v===null||v===undefined||v==='') return '-'; return `${v}`; }

function renderTarjetaPaciente(p){
  const recetaTabla = `
    <table class="recipe-table">
      <thead><tr><th>Ojo</th><th>Esfera</th><th>Cilindro</th><th>Eje</th><th>ADD</th><th>PD (mm)</th><th>ALT (mm)</th></tr></thead>
      <tbody>
        <tr><td>OD</td><td>${fmtNum(p.receta?.od?.esf)}</td><td>${fmtNum(p.receta?.od?.cil)}</td><td>${fmtEje(p.receta?.od?.eje)}</td><td>${fmtNum(p.receta?.od?.add)}</td><td>${fmtNum(p.receta?.od?.pd)}</td><td>${fmtNum(p.receta?.od?.alt)}</td></tr>
        <tr><td>OI</td><td>${fmtNum(p.receta?.oi?.esf)}</td><td>${fmtNum(p.receta?.oi?.cil)}</td><td>${fmtEje(p.receta?.oi?.eje)}</td><td>${fmtNum(p.receta?.oi?.add)}</td><td>${fmtNum(p.receta?.oi?.pd)}</td><td>${fmtNum(p.receta?.oi?.alt)}</td></tr>
      </tbody>
    </table>`;
  const edad=calcularEdad(p.fechaNac);
  const fechaEdad=p.fechaNac?`${escapeHtml(formatearFecha(p.fechaNac))} (${edad ?? 0} años)`:'—';

  return `
    <div class="result-card">
      <h4>${escapeHtml(p.nombre || '')}</h4>
      <div class="result-grid">
        <div class="result-field"><label>RUT</label><div>${escapeHtml(p.rut || '')}</div></div>
        <div class="result-field"><label>Dirección</label><div>${escapeHtml(p.direccion || '-')}</div></div>
        <div class="result-field"><label>Fecha de Nacimiento / Edad</label><div>${fechaEdad}</div></div>
        <div class="result-field"><label>Lugar de Operativo</label><div>${escapeHtml(p.operativo || '')}</div></div>
        <div class="result-field result-recipe"><label>Receta Óptica</label>${recetaTabla}</div>
        <div class="result-field"><label>Diagnóstico</label><div>${chips(p.diagnostico)}</div></div>
        <div class="result-field" style="grid-column:1/-1;"><label>Observaciones</label><div>${escapeHtml(p.obs || '-')}</div></div>
      </div>
      <div class="card-actions"><button class="btn-edit" onclick="abrirModalEdicion('${encodeURIComponent(p.rut || '')}')">Editar información</button></div>
    </div>`;
}

/**************
 *   MODAL EDICIÓN
 **************/
let _modalLastFocus = null;
let _modalDirty = false;
let _modalOriginalRut = null;

const modal = {
  overlay: document.getElementById('editModal'),
  form: null,
  inputs: {}
};
function qs(id){ return document.getElementById(id); }

function initModal(){
  modal.form = qs('editForm');

  ['mNombre','mRut','mDireccion','mFechaNac','mOperativo',
   'mOdEsf','mOdCil','mOdEje','mOdAdd','mOdPD','mOdALT',
   'mOiEsf','mOiCil','mOiEje','mOiAdd','mOiPD','mOiALT','mObs'
  ].forEach(id=> modal.inputs[id] = qs(id));

  modal.form.addEventListener('input', ()=>{ _modalDirty = true; });

  qs('btnCancelEdit').addEventListener('click', ()=> cerrarModal(true));

  modal.overlay.addEventListener('click', (e)=>{ if(e.target === modal.overlay) cerrarModal(true); });
  modal.overlay.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){ e.preventDefault(); cerrarModal(true); return; }
    if(e.key === 'Tab'){ trapFocus(e); }
  });

  modal.form.addEventListener('submit', guardarDesdeModal);
}

function abrirModalEdicion(rutEncoded){
  if(!requireAuth()) return;

  const rut = decodeURIComponent(rutEncoded || '');
  const pacientes = leerPacientes();
  const p = pacientes.find(x => normalizarRut(x.rut || '') === normalizarRut(rut));
  if(!p) return;

  _modalOriginalRut = normalizarRut(p.rut || '');
  _modalDirty = false;
  _modalLastFocus = document.activeElement;

  qs('mNombre').value = p.nombre || '';
  qs('mRut').value = p.rut || '';
  qs('mRutError').textContent = '';
  qs('mDireccion').value = p.direccion || '';
  qs('mFechaNac').value = p.fechaNac || '';
  qs('mOperativo').value = p.operativo || '';

  qs('mOdEsf').value = p.receta?.od?.esf ?? '';
  qs('mOdCil').value = p.receta?.od?.cil ?? '';
  qs('mOdEje').value = p.receta?.od?.eje ?? '';
  qs('mOdAdd').value = p.receta?.od?.add ?? '';
  qs('mOdPD').value  = p.receta?.od?.pd  ?? '';
  qs('mOdALT').value = p.receta?.od?.alt ?? '';

  qs('mOiEsf').value = p.receta?.oi?.esf ?? '';
  qs('mOiCil').value = p.receta?.oi?.cil ?? '';
  qs('mOiEje').value = p.receta?.oi?.eje ?? '';
  qs('mOiAdd').value = p.receta?.oi?.add ?? '';
  qs('mOiPD').value  = p.receta?.oi?.pd  ?? '';
  qs('mOiALT').value = p.receta?.oi?.alt ?? '';

  const dxSet = new Set(Array.isArray(p.diagnostico) ? p.diagnostico : []);
  document.querySelectorAll('input[name="mdx"]').forEach(i=>{ i.checked = dxSet.has(i.value); });

  qs('mObs').value = p.obs || '';

  modal.overlay.classList.add('active');
  document.body.classList.add('modal-open');

  /* Resetea el scroll (ahora scrollea el FORM) */
  modal.form.scrollTop = 0;
  qs('mNombre').focus();
}

function cerrarModal(confirmar){
  if(confirmar && _modalDirty){
    const ok = confirm('Hay cambios sin guardar. ¿Cerrar sin guardar?');
    if(!ok) return;
  }
  modal.overlay.classList.remove('active');
  document.body.classList.remove('modal-open');
  _modalDirty = false;
  if(_modalLastFocus) _modalLastFocus.focus();
}

function trapFocus(e){
  const focusables = modal.overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const list = Array.from(focusables).filter(el => el.offsetParent !== null);
  if(list.length === 0) return;
  const first = list[0], last = list[list.length-1];
  if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
}

function setModalRutError(msg){
  const el = document.getElementById('mRutError');
  const input = document.getElementById('mRut');
  if(el) el.textContent = msg || '';
  if(input){ if(msg) input.classList.add('is-invalid'); else input.classList.remove('is-invalid'); }
}

function getCheckedValuesByName(name){
  return Array.from(document.querySelectorAll(`input[name="${name}"]`))
    .filter(i=>i.checked).map(i=>i.value);
}

function guardarDesdeModal(e){
  e.preventDefault();
  if(!requireAuth()) return;

  const rutVal = normalizarRut(document.getElementById('mRut').value);
  if(!esRutValido(rutVal)){ setModalRutError('RUT inválido'); return; }
  setModalRutError('');

  const actualizado = {
    nombre: val(document.getElementById('mNombre').value),
    rut: formatearRut(rutVal),
    direccion: val(document.getElementById('mDireccion').value),
    fechaNac: val(document.getElementById('mFechaNac').value),
    operativo: val(document.getElementById('mOperativo').value),
    receta: {
      od: { esf:numOrNull('mOdEsf'), cil:numOrNull('mOdCil'), eje:numOrNull('mOdEje'), add:numOrNull('mOdAdd'), pd:numOrNull('mOdPD'), alt:numOrNull('mOdALT') },
      oi: { esf:numOrNull('mOiEsf'), cil:numOrNull('mOiCil'), eje:numOrNull('mOiEje'), add:numOrNull('mOiAdd'), pd:numOrNull('mOiPD'), alt:numOrNull('mOiALT') }
    },
    diagnostico: getCheckedValuesByName('mdx'),
    obs: val(document.getElementById('mObs').value)
  };

  if(!actualizado.nombre || !actualizado.rut || !actualizado.operativo){
    alert('Debes completar Nombre, RUT y Lugar de Operativo.'); return;
  }

  const pacientes = leerPacientes();
  const newRutNorm = rutVal;
  const oldRutNorm = _modalOriginalRut;

  const yaExiste = pacientes.some(p => normalizarRut(p.rut || '') === newRutNorm && newRutNorm !== oldRutNorm);
  if(yaExiste){ alert('Ya existe un paciente con el RUT ingresado.'); return; }

  const idx = pacientes.findIndex(p => normalizarRut(p.rut || '') === oldRutNorm);
  if(idx >= 0){
    const creadoEn = pacientes[idx].creadoEn || new Date().toISOString();
    pacientes[idx] = { ...pacientes[idx], ...actualizado, creadoEn };
  }else{
    pacientes.push({ ...actualizado, creadoEn: new Date().toISOString() });
  }

  guardarPacientes(pacientes);

  const cont = document.getElementById('listaResultados');
  if(cont){
    const p = pacientes.find(x => normalizarRut(x.rut || '') === newRutNorm);
    cont.innerHTML = renderTarjetaPaciente(p);
    const msg = document.getElementById('msgResultados'); if(msg) msg.textContent = '1 resultado. (Actualizado)';
  }

  cerrarModal(false);
}

/**************
 *   INIT
 **************/
function attachLoginHandlers(){
  const form=document.getElementById('loginForm');
  if(form) form.addEventListener('submit', handleLogin);
  setupLogout();
}

window.addEventListener('load', async ()=>{
  initTheme();
  await seedUsers();
  attachLoginHandlers();
  initModal();

  const rutInput=document.getElementById('rut');
  if(rutInput){
    rutInput.addEventListener('blur', autoFormatearRut);
    rutInput.addEventListener('input', ()=>{
      const v=normalizarRut(rutInput.value);
      setRutError(v && !esRutValido(v) ? 'RUT inválido' : '');
      actualizarEstadoBoton();
    });
  }
  ['nombre','operativo'].forEach(id=>{
    document.getElementById(id)?.addEventListener('input', actualizarEstadoBoton);
  });
  actualizarEstadoBoton();

  if(!getSession()) lockApp(); else unlockApp(getSession());

  document.querySelectorAll('nav ul li').forEach(li=>{
    li.addEventListener('click',(e)=>{
      e.preventDefault();
      const text=(li.textContent||'').toLowerCase();
      guardShowSection(text.includes('ingresar') ? 'ingresar' : 'archivo');
    });
  });
});
