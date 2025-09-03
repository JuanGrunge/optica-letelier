/********** CONFIG **********/
const AUTH_KEY = 'sesion';
const USERS_KEY = 'usuarios';
const LS_KEY = 'pacientes';
const LAST_SECTION_KEY = 'lastSection';
const RECORD_VERSION = 1;

/********** AUTENTICACIÓN **********/
async function sha256Hex(text){
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
async function seedUsers(){
  if(localStorage.getItem(USERS_KEY)) return;
  const adminHash = await sha256Hex('letelier25'); // pass inicial
  localStorage.setItem(USERS_KEY, JSON.stringify([{ username:'admin', passHash:adminHash, role:'admin' }]));
}
function getUsers(){ try{ return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch{ return []; } }
function findUser(username){ return getUsers().find(u => (u.username || '').toLowerCase() === String(username||'').toLowerCase()); }
function setSession(sess){ localStorage.setItem(AUTH_KEY, JSON.stringify(sess)); }
function getSession(){ try{ return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch{ return null; } }
function clearSession(){ localStorage.removeItem(AUTH_KEY); }

// --- Migración de credenciales admin (antigua -> nueva) ---
async function migrateUsersIfNeeded(){
  const users = getUsers();
  if(!users.length) return;
  const admin = users.find(u => (u.username||'').toLowerCase()==='admin');
  if(!admin) return;

  const OLD_PASS_HASH = await sha256Hex('Letelier#2025');
  const NEW_PASS_HASH = await sha256Hex('letelier25');

  if(admin.passHash === OLD_PASS_HASH){
    admin.passHash = NEW_PASS_HASH;
    admin.version = (admin.version||1) + 1;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

function lockApp(){
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.getElementById('loginOverlay')?.classList.add('active');
  document.getElementById('userBadge').hidden = true;
  document.getElementById('btnLogout').hidden = true;
  localStorage.removeItem(LAST_SECTION_KEY);
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
function requireAuth(){
  const sess = getSession();
  if(!sess){ lockApp(); return false; }
  unlockApp(sess);
  return true;
}
async function handleLogin(e){
  e.preventDefault();
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const msg = document.getElementById('loginMsg'); msg.textContent = '';

  const user = findUser(u);
  if(!user){ msg.textContent = 'Usuario o contraseña inválidos.'; return; }
  const hash = await sha256Hex(p);
  if(hash !== user.passHash){
    // Compatibilidad: si es admin y teclea la clave antigua, permitir una vez y migrar
    const OLD_PASS_HASH = await sha256Hex('Letelier#2025');
    if(user.username.toLowerCase()==='admin' && hash === OLD_PASS_HASH){
      const NEW_PASS_HASH = await sha256Hex('letelier25');
      user.passHash = NEW_PASS_HASH;
      const users = getUsers().map(u => u.username.toLowerCase()==='admin' ? user : u);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      // continúa como login válido
    }else{
      msg.textContent = 'Usuario o contraseña inválidos.';
      return;
    }
  }

  setSession({ username:user.username, role:user.role, at:new Date().toISOString() });
  localStorage.setItem(LAST_SECTION_KEY, 'archivo'); // por defecto al iniciar sesión
  document.getElementById('loginForm').reset();
  unlockApp(getSession());
  showSection('archivo');
}
function setupLogout(){
  document.getElementById('btnLogout')?.addEventListener('click', ()=>{
    clearSession();
    lockApp();
  });
}

/********** TEMA **********/
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

/********** NAVEGACIÓN **********/
function validSection(id){ return (id==='archivo'||id==='ingresar') ? id : 'archivo'; }
function setLastSection(id){ if(getSession()) localStorage.setItem(LAST_SECTION_KEY, validSection(id)); }
function getLastSection(){ return validSection(localStorage.getItem(LAST_SECTION_KEY)); }

function showSection(id){
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  const el = document.getElementById(validSection(id));
  if(el) el.classList.add("active");
  document.querySelector("nav").classList.remove("active");
  setLastSection(id);
}
function guardShowSection(id){ if(!requireAuth()) return; showSection(id); }
document.querySelector(".menu-toggle").addEventListener("click", () => {
  document.querySelector("nav").classList.toggle("active");
});

/********** STORAGE PACIENTES **********/
function leerPacientes(){ try{ const raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : []; } catch{ return []; } }
function guardarPacientes(pacientes){ localStorage.setItem(LS_KEY, JSON.stringify(pacientes)); }

/********** HELPERS **********/
const val = v => (v ?? '').toString().trim();
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s])); }
function chips(arr){ if(!arr || arr.length===0) return '-'; return `<div class="chips">${arr.map(v=>`<span class="chip">${escapeHtml(v)}</span>`).join('')}</div>`; }
function calcularEdad(isoDate){ if(!isoDate) return null; const h=new Date(), n=new Date(isoDate); if(isNaN(n)) return null; let e=h.getFullYear()-n.getFullYear(); const m=h.getMonth()-n.getMonth(); if(m<0||(m===0&&h.getDate()<n.getDate())) e--; return Math.max(0,e); }
function formatearFecha(isoDate){ if(!isoDate) return ''; const d=new Date(isoDate); if(isNaN(d)) return ''; const dd=String(d.getDate()).padStart(2,'0'); const mm=String(d.getMonth()+1).padStart(2,'0'); const yy=d.getFullYear(); return `${dd}-${mm}-${yy}`; }
function showToast(text){
  const t = document.getElementById('toast'); if(!t) return;
  t.textContent = text; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 2000);
}

/********** FORMATO DIOPTRÍAS **********/
const roundQuarter = n => Math.round(n*4)/4;
const twoDec = n => Number(n).toFixed(2);
function parseDec(str){
  if(str === undefined || str === null) return null;
  const s = String(str).replace(',', '.').trim();
  if(!s) return null;
  const num = Number(s.replace(/[^\d.\-+]/g,''));
  return Number.isFinite(num) ? num : null;
}
function formatSph(n){ if(n===null||n===undefined||n==='') return '-'; const v=Number(n); return (v>=0?'+':'') + twoDec(v); }
function formatCylRaw(n){ if(n===null||n===undefined||n==='') return null; const v = -Math.abs(Number(n)); return Number.isFinite(v) ? v : null; }
function formatAddRaw(n){ if(n===null||n===undefined||n==='') return null; const v = Math.abs(Number(n)); return Number.isFinite(v) ? v : null; }
function fmtEje(val){ if(val===null||val===undefined||val==='') return '—'; return `${val}°`; }
function clampIntInRange(n, min, max){ const x = Math.round(Number(n)); if(!Number.isFinite(x)) return null; return Math.min(max, Math.max(min, x)); }
function normAxisInput(el){ const n = parseDec(el.value); if(n===null){ el.value = ''; return; } el.value = String(clampIntInRange(n, 0, 180)); }
function readAxisFor(id, cylVal){ let n = numOrNull(id); if(n==null) return null; n = clampIntInRange(n, 0, 180); if(cylVal==null || Math.abs(cylVal)===0) return null; return n; }
function normSphInput(el){ const n=parseDec(el.value); if(n===null){ el.value=''; return; } const v=roundQuarter(n); el.value = (v>=0?'+':'') + twoDec(v); }
function normCylInput(el){ const n=parseDec(el.value); if(n===null){ el.value=''; return; } const v=-Math.abs(roundQuarter(n)); el.value = twoDec(v); }
function normAddInput(el){ const n=parseDec(el.value); if(n===null){ el.value=''; return; } const v=Math.abs(roundQuarter(n)); el.value = '+'+twoDec(v); }
function numOrNull(id){ const v=(document.getElementById(id).value||'').trim().replace(',', '.'); if(v==='') return null; const n=Number(v); return Number.isFinite(n)?n:null; }
function readDP(obj){ return obj?.dp ?? obj?.pd ?? null; }

/********** RUT **********/
function normalizarRut(str){ if(!str) return ''; return str.replace(/[.\s-]/g,'').toUpperCase(); }
function separarRut(r){ const m=normalizarRut(r).match(/^(\d+)-?([\dkK])$/); if(!m) return null; return { num:m[1], dv:m[2].toUpperCase() }; }
function calcularDV(num){ let s=0,m=2; for(let i=num.length-1;i>=0;i--){ s+=parseInt(num[i],10)*m; m=(m===7)?2:m+1; } const r=11-(s%11); return r===11?'0':r===10?'K':String(r); }
function esRutValido(str){ const p=separarRut(str); return !!p && calcularDV(p.num)===p.dv; }
function formatearRut(str){ const p=separarRut(str); if(!p) return str; const num=p.num.replace(/\B(?=(\d{3})+(?!\d))/g,'.'); return `${num}-${p.dv}`; }
function setRutError(msg){ const el=document.getElementById('rutError'); const input=document.getElementById('rut'); if(el) el.textContent=msg||''; if(input){ if(msg) input.classList.add('is-invalid'); else input.classList.remove('is-invalid'); } }
function autoFormatearRut(){ const i=document.getElementById('rut'); if(!i) return; const v=normalizarRut(i.value); if(!v){ setRutError(''); actualizarEstadoBoton(); return; } i.value=formatearRut(v); setRutError(!esRutValido(v)?'RUT inválido':''); actualizarEstadoBoton(); }
function actualizarEstadoBoton(){ const b=document.getElementById('btnGuardar'); const r=document.getElementById('rut').value; const ok=esRutValido(r)&&val(document.getElementById('nombre').value)&&val(document.getElementById('operativo').value); if(b) b.disabled=!ok; }

/********** SUGERENCIAS DX **********/
function sphericalEquivalent(sph, cyl){ if(sph==null && cyl==null) return null; const s=Number(sph||0), c=Number(cyl||0); return s + (c/2); }
function sugerenciasDxFromValues(vals){
  const {od, oi, add, edad} = vals;
  const sug = new Set();
  const seOD = sphericalEquivalent(od.esf, od.cil);
  const seOI = sphericalEquivalent(oi.esf, oi.cil);
  if((seOD!=null && seOD <= -0.25) || (seOI!=null && seOI <= -0.25)) sug.add('Miopía');
  if((seOD!=null && seOD >=  0.25) || (seOI!=null && seOI >=  0.25)) sug.add('Hipermetropía');
  if((Math.abs(od.cil||0) >= 0.25) || (Math.abs(oi.cil||0) >= 0.25)) sug.add('Astigmatismo');
  const addMax = Math.max(Math.abs(add.od||0), Math.abs(add.oi||0));
  if(addMax >= 0.5 || (edad!=null && edad>=40)) sug.add('Presbicie');
  return Array.from(sug);
}
function leerValoresParaSugerencia(prefix){
  const sph = id => parseDec(document.getElementById((prefix||'')+id).value);
  const cyl = id => formatCylRaw(parseDec(document.getElementById((prefix||'')+id).value));
  const add = id => formatAddRaw(parseDec(document.getElementById((prefix||'')+id).value));
  const edad = calcularEdad(document.getElementById((prefix||'')+'FechaNac')?.value || null);
  return {
    od: { esf: roundQuarter(sph('OdEsf') ?? sph('odEsf') ?? 0), cil: roundQuarter(cyl('OdCil') ?? cyl('odCil') ?? 0) },
    oi: { esf: roundQuarter(sph('OiEsf') ?? sph('oiEsf') ?? 0), cil: roundQuarter(cyl('OiCil') ?? cyl('oiCil') ?? 0) },
    add: { od: roundQuarter(add('OdAdd') ?? add('odAdd') ?? 0), oi: roundQuarter(add('OiAdd') ?? add('oiAdd') ?? 0) },
    edad
  };
}
function renderDxSugerencias(prefix){
  const cont = document.getElementById(prefix ? 'dxSugeridosModal' : 'dxSugeridos');
  if(!cont) return;
  const v = leerValoresParaSugerencia(prefix);
  const sugs = sugerenciasDxFromValues(v);
  cont.innerHTML = sugs.length ? sugs.map(s=>`<span class="chip suggested" data-dx="${s}" title="Sugerido según receta">${s}</span>`).join('') : '';
  cont.querySelectorAll('.chip.suggested').forEach(ch => {
    ch.addEventListener('click', ()=>{
      const name = prefix ? 'mdx' : 'dx';
      const input = Array.from(document.querySelectorAll(`input[name="${name}"]`)).find(i=>i.value===ch.dataset.dx);
      if(input){ input.checked = !input.checked; }
    });
  });
}

/********** UX RECETA **********/
function attachRxHandlers(){
  const odEsf = document.getElementById('odEsf');
  const oiEsf = document.getElementById('oiEsf');
  const odCil = document.getElementById('odCil');
  const oiCil = document.getElementById('oiCil');
  const odEje = document.getElementById('odEje');
  const oiEje = document.getElementById('oiEje');
  const odAdd = document.getElementById('odAdd');
  const oiAdd = document.getElementById('oiAdd');

  [odEsf, oiEsf].forEach(el => el?.addEventListener('blur', ()=>{ normSphInput(el); renderDxSugerencias(''); }));
  [odCil, oiCil].forEach(el => el?.addEventListener('blur', ()=>{ normCylInput(el); renderDxSugerencias(''); }));
  [odAdd, oiAdd].forEach(el => el?.addEventListener('blur', ()=>{ normAddInput(el); renderDxSugerencias(''); }));
  [odEje, oiEje].forEach(el => el?.addEventListener('blur', ()=> normAxisInput(el)));
  document.getElementById('fechaNac')?.addEventListener('change', ()=>renderDxSugerencias(''));

  const t = document.getElementById('dpCercaToggle');
  const box = document.getElementById('dpCercaBox');
  const inC = document.getElementById('dpCerca');
  t?.addEventListener('change', ()=>{
    box.classList.toggle('hidden', !t.checked);
    if(t.checked){ sugerirDpCerca(''); }
    else{ inC.value=''; }
  });
  ['odDP','oiDP','dpCerca'].forEach(id=>{
    const el=document.getElementById(id);
    el?.addEventListener('input', ()=> validarDP(''));
  });

  const mOdEsf = document.getElementById('mOdEsf');
  const mOiEsf = document.getElementById('mOiEsf');
  const mOdCil = document.getElementById('mOdCil');
  const mOiCil = document.getElementById('mOiCil');
  const mOdEje = document.getElementById('mOdEje');
  const mOiEje = document.getElementById('mOiEje');
  const mOdAdd = document.getElementById('mOdAdd');
  const mOiAdd = document.getElementById('mOiAdd');

  [mOdEsf, mOiEsf].forEach(el => el?.addEventListener('blur', ()=>{ normSphInput(el); renderDxSugerencias('m'); }));
  [mOdCil, mOiCil].forEach(el => el?.addEventListener('blur', ()=>{ normCylInput(el); renderDxSugerencias('m'); }));
  [mOdAdd, mOiAdd].forEach(el => el?.addEventListener('blur', ()=>{ normAddInput(el); renderDxSugerencias('m'); }));
  [mOdEje, mOiEje].forEach(el => el?.addEventListener('blur', ()=> normAxisInput(el)));
  document.getElementById('mFechaNac')?.addEventListener('change', ()=>renderDxSugerencias('m'));

  const mt = document.getElementById('mDpCercaToggle');
  const mbox = document.getElementById('mDpCercaBox');
  const minC = document.getElementById('mDpCerca');
  mt?.addEventListener('change', ()=>{
    mbox.classList.toggle('hidden', !mt.checked);
    if(mt.checked){ sugerirDpCerca('m'); }
    else{ minC.value=''; }
  });
  ['mOdDP','mOiDP','mDpCerca'].forEach(id=>{
    const el=document.getElementById(id);
    el?.addEventListener('input', ()=> validarDP('m'));
  });

  renderDxSugerencias('');
}

/********** DP **********/
function dpLejos(prefix){
  const odId = prefix ? 'mOdDP' : 'odDP';
  const oiId = prefix ? 'mOiDP' : 'oiDP';
  const od = numOrNull(odId), oi = numOrNull(oiId);
  if(od==null || oi==null) return null;
  return +(od + oi).toFixed(1);
}
function sugerirDpCerca(prefix){
  const L = dpLejos(prefix);
  const input = document.getElementById(prefix? 'mDpCerca':'dpCerca');
  if(L!=null && input && !input.value){ input.value = (L - 3).toFixed(1); }
}
function validarDP(prefix){
  const L = dpLejos(prefix);
  const od = numOrNull(prefix? 'mOdDP':'odDP');
  const oi = numOrNull(prefix? 'mOiDP':'oiDP');
  const msgEl = prefix? null : document.getElementById('rxMsg');
  if(msgEl) msgEl.textContent = '';

  if(od!=null && (od<26 || od>38)){ if(msgEl) msgEl.textContent='DP OD debe estar entre 26 y 38 mm.'; return false; }
  if(oi!=null && (oi<26 || oi>38)){ if(msgEl) msgEl.textContent='DP OI debe estar entre 26 y 38 mm.'; return false; }
  if(L!=null && (L<54 || L>74)){ if(msgEl) msgEl.textContent='DP binocular (lejos) fuera de 54–74 mm.'; return false; }

  const toggle = document.getElementById(prefix? 'mDpCercaToggle':'dpCercaToggle');
  const cerca = numOrNull(prefix? 'mDpCerca':'dpCerca');
  if(toggle && toggle.checked && cerca!=null && L!=null){
    if(!(cerca <= L && cerca >= L-4 && cerca <= L-2)){
      if(msgEl) msgEl.textContent=`DP de cerca ≈ ${ (L-3).toFixed(1) } mm (entre ${ (L-4).toFixed(1) } y ${(L-2).toFixed(1)}).`;
      return false;
    }
  }
  return true;
}

/********** GUARDAR (FORM PRINCIPAL) **********/
function guardarPaciente(event){
  event.preventDefault();
  if(!requireAuth()) return;
  const rutVal = normalizarRut(document.getElementById('rut').value);
  if(!esRutValido(rutVal)){ setRutError('RUT inválido'); actualizarEstadoBoton(); return; }
  if(!validarDP('')) return;

  const esfOD = parseDec(document.getElementById('odEsf').value); const esfOI = parseDec(document.getElementById('oiEsf').value);
  const cilOD = -Math.abs(parseDec(document.getElementById('odCil').value) ?? 0); const cilOI = -Math.abs(parseDec(document.getElementById('oiCil').value) ?? 0);
  const addOD = Math.abs(parseDec(document.getElementById('odAdd').value) ?? 0); const addOI = Math.abs(parseDec(document.getElementById('oiAdd').value) ?? 0);
  const cylODVal = (cilOD==null ? null : Math.round(cilOD*4)/4);
  const cylOIVal = (cilOI==null ? null : Math.round(cilOI*4)/4);

  const diagnosticoMarcado = Array.from(document.querySelectorAll('input[name="dx"]:checked')).map(i=>i.value);
  const sugeridos = sugerenciasDxFromValues(leerValoresParaSugerencia(''));

  const pacientes = leerPacientes();
  const idx = pacientes.findIndex(p => normalizarRut(p.rut || '') === rutVal);

  const base = {
    nombre: val(document.getElementById('nombre').value),
    rut: formatearRut(rutVal),
    direccion: val(document.getElementById('direccion').value),
    fechaNac: val(document.getElementById('fechaNac').value),
    operativo: val(document.getElementById('operativo').value),
    receta: {
      od: { esf: (esfOD==null?null:Math.round(esfOD*4)/4), cil: cylODVal, eje: readAxisFor('odEje', cylODVal), add: (addOD==null?null:Math.round(addOD*4)/4), dp:  numOrNull('odDP'), alt: numOrNull('odALT') },
      oi: { esf: (esfOI==null?null:Math.round(esfOI*4)/4), cil: cylOIVal, eje: readAxisFor('oiEje', cylOIVal), add: (addOI==null?null:Math.round(addOI*4)/4), dp:  numOrNull('oiDP'), alt: numOrNull('oiALT') },
      dpCerca: document.getElementById('dpCercaToggle').checked ? numOrNull('dpCerca') : null
    },
    diagnostico: diagnosticoMarcado,
    diagnostico_sugerido: sugeridos,
    obs: val(document.getElementById('obs').value),
    record_version: RECORD_VERSION
  };

  const now = new Date().toISOString();
  if(idx >= 0){
    const creadoEn = pacientes[idx].creadoEn || now;
    pacientes[idx] = { ...pacientes[idx], ...base, creadoEn, actualizadoEn: now };
  }else{
    pacientes.push({ ...base, creadoEn: now, actualizadoEn: now });
  }

  guardarPacientes(pacientes);
  mostrarMensaje('msgGuardado','Datos guardados correctamente.');
  showToast('Paciente guardado');

  document.getElementById('formIngresar').reset();
  document.getElementById('dpCercaBox').classList.add('hidden');
  document.getElementById('dpCercaToggle').checked = false;
  renderDxSugerencias('');
  actualizarEstadoBoton();
  if(toggleSwitch && localStorage.getItem('theme')==='dark') toggleSwitch.checked = true;
}
function mostrarMensaje(id, texto, error=false){
  const el=document.getElementById(id); if(!el) return;
  el.textContent=texto; el.style.color= error ? '#b00020' : '#0a7a0a';
  setTimeout(()=>{ el.textContent=''; },3000);
}

/********** BÚSQUEDA Y RENDER **********/
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
function cellSph(n){ return n==null ? '—' : formatSph(n); }
function cellCyl(n){ if(n==null) return '—'; const v = formatCylRaw(n); return (v===0||v===0.00)?'—':twoDec(v); }
function cellAdd(n){ if(n==null) return '—'; const v = formatAddRaw(n); return (v===0||v===0.00)?'—':`+${twoDec(v)}`; }
function cellEje(n){ return fmtEje(n); }
function cellNum(n){ return (n==null||n==='')?'—':`${n}`; }
function cellMm(n){ return (n==null||n==='')?'—':`${n} mm`; }

/********** FLAGS DE REVISIÓN **********/
function isQuarter(x){ return Math.abs((x*4) - Math.round(x*4)) < 1e-6; }
function needsReview(p){
  const info = [], warn = [], crit = [], err = [];

  const now = Date.now();
  const ageDays = p.actualizadoEn ? Math.floor((now - new Date(p.actualizadoEn).getTime())/86400000) : null;

  if(!('record_version' in p) || p.record_version < RECORD_VERSION) info.push('Estandarización pendiente');
  if(ageDays!=null && ageDays>90) info.push(`Sin actualizar hace ${ageDays} días`);

  const od = p.receta?.od ?? {}, oi = p.receta?.oi ?? {};
  const checkEye = (eye, label)=>{
    if(eye.esf!=null && !isQuarter(Number(eye.esf))) info.push(`${label}: Esfera no múltiplo de 0.25`);
    if(eye.cil!=null && !isQuarter(Number(eye.cil))) info.push(`${label}: Cilindro no múltiplo de 0.25`);
    if(eye.cil==0 && (eye.eje!=null && eye.eje!=='')) err.push(`${label}: Eje presente con cilindro 0`);
    if(eye.cil!=0 && (eye.eje==null || eye.eje==='')) err.push(`${label}: Falta eje`);
    if(eye.eje!=null && (eye.eje<0 || eye.eje>180)) err.push(`${label}: Eje fuera de 0–180`);

    if(eye.dp==null) crit.push(`${label}: Falta DP`);
    if(eye.alt==null) crit.push(`${label}: Falta ALT`);
  };
  checkEye(od, 'OD'); checkEye(oi, 'OI');

  const dpL = (Number.isFinite(od.dp) && Number.isFinite(oi.dp)) ? od.dp+oi.dp : null;
  if(dpL!=null && (dpL<54 || dpL>74)) warn.push('DP Lejos fuera de 54–74');

  const edad = calcularEdad(p.fechaNac);
  const addMax = Math.max(Math.abs(od.add||0), Math.abs(oi.add||0));
  if(edad!=null && edad>=45 && !(addMax>=0.5)) info.push('ADD ausente con edad ≥45');

  const reasons = [
    ...err.map(r=>`[ERR] ${r}`),
    ...crit.map(r=>`[CRIT] ${r}`),
    ...warn.map(r=>`[WARN] ${r}`),
    ...info.map(r=>`[INFO] ${r}`)
  ];
  return { flag: reasons.length>0, reasons };
}

/********** TARJETAS Y LISTAS **********/
function renderListaOperativo(rows){
  const cont=document.getElementById('listaResultados'); if(!cont) return;
  const list=[...rows].sort((a,b)=>(a.operativo||'').localeCompare(b.operativo||'')||(a.nombre||'').localeCompare(b.nombre||''));
  cont.innerHTML = list.map(p=>{
    const rev = needsReview(p);
    const warn = rev.flag ? `<span class="warn-icon" title="${escapeHtml(rev.reasons.join(' • '))}">!</span>` : '';
    return `
    <div class="list-item" onclick="verPacienteDetalle('${encodeURIComponent(p.rut || '')}')">
      <div class="name">${warn} ${escapeHtml(p.nombre || '(Sin nombre)')}</div>
      <div class="subtle">${escapeHtml(p.operativo || '')}</div>
    </div>`;
  }).join('');
}
function renderFichas(resultados){
  const cont=document.getElementById('listaResultados'); if(!cont) return;
  if(!Array.isArray(resultados) || resultados.length===0){ cont.innerHTML=''; return; }
  cont.innerHTML = resultados.map(p=>renderTarjetaPaciente(p)).join('');
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
function renderTarjetaPaciente(p){
  const od = p.receta?.od ?? {};
  const oi = p.receta?.oi ?? {};
  const dpOD = readDP(od); const dpOI = readDP(oi);
  const dpL = (Number.isFinite(dpOD) && Number.isFinite(dpOI)) ? +(dpOD + dpOI).toFixed(1) : null;
  const dpC = (p.receta?.dpCerca ?? null);
  const dpCVal = (dpC==null && dpL!=null) ? +(dpL - 3).toFixed(1) : dpC;
  const dpCLabel = (p.receta?.dpCerca==null && dpL!=null) ? ' (estimado)' : '';

  const recetaTabla = `
    <table class="recipe-table">
      <colgroup>
        <col style="width:7%"><col style="width:18%"><col style="width:18%">
        <col style="width:14%"><col style="width:15%"><col style="width:14%"><col style="width:14%">
      </colgroup>
      <thead><tr><th>Ojo</th><th>Esfera</th><th>Cilindro</th><th>Eje</th><th>ADD</th><th>DP (mm)</th><th>ALT (mm)</th></tr></thead>
      <tbody>
        <tr><td>OD</td><td>${cellSph(od.esf)}</td><td>${cellCyl(od.cil)}</td><td>${cellEje(od.eje)}</td><td>${cellAdd(od.add)}</td><td>${cellNum(dpOD)}</td><td>${cellMm(od.alt)}</td></tr>
        <tr><td>OI</td><td>${cellSph(oi.esf)}</td><td>${cellCyl(oi.cil)}</td><td>${cellEje(oi.eje)}</td><td>${cellAdd(oi.add)}</td><td>${cellNum(dpOI)}</td><td>${cellMm(oi.alt)}</td></tr>
      </tbody>
    </table>`;

  const edad=calcularEdad(p.fechaNac);
  const fechaEdad=p.fechaNac?`${escapeHtml(formatearFecha(p.fechaNac))} (${edad ?? 0} años)`:'—';
  const dpLine = `<div>DP Lejos/Cerca: <strong>${dpL ?? '—'}/${dpCVal ?? '—'}</strong> mm${dpCLabel}</div>`;
  const rev = needsReview(p);
  const warn = rev.flag ? `<span class="warn-icon" title="${escapeHtml(rev.reasons.join(' • '))}">!</span>` : '';

  return `
    <div class="result-card">
      <h4>${warn} ${escapeHtml(p.nombre || '')}</h4>
      <div class="result-grid">
        <div class="result-field"><label>RUT</label><div>${escapeHtml(p.rut || '')}</div></div>
        <div class="result-field"><label>Dirección</label><div>${escapeHtml(p.direccion || '—')}</div></div>
        <div class="result-field"><label>Fecha de Nacimiento / Edad</label><div>${fechaEdad}</div></div>
        <div class="result-field"><label>Lugar de Operativo</label><div>${escapeHtml(p.operativo || '')}</div></div>
        <div class="result-field result-recipe"><label>Receta Óptica</label>${recetaTabla}${dpLine}</div>
        <div class="result-field"><label>Diagnóstico</label><div>${chips(p.diagnostico)}</div></div>
        <div class="result-field" style="grid-column:1/-1;"><label>Observaciones</label><div>${escapeHtml(p.obs || '—')}</div></div>
      </div>
      <div class="card-actions">
        <button class="btn-edit" onclick="abrirModalEdicion('${encodeURIComponent(p.rut || '')}')">Editar información</button>
      </div>
    </div>`;
}

/********** MODAL EDICIÓN **********/
let _modalLastFocus = null;
let _modalDirty = false;
let _modalOriginalRut = null;
const modal = { overlay: document.getElementById('editModal'), form: null };
function qs(id){ return document.getElementById(id); }

function initModal(){
  modal.form = qs('editForm');
  if(!modal.form) return;
  modal.form.addEventListener('input', ()=>{ _modalDirty = true; });
  qs('btnCancelEdit')?.addEventListener('click', onCancelEdit);
  modal.form.addEventListener('submit', guardarDesdeModal);
  modal.overlay.addEventListener('click', (e)=>{ if(e.target === modal.overlay) cerrarModal(true); });
  modal.overlay.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){ e.preventDefault(); cerrarModal(true); return; }
    if(e.key === 'Tab'){ trapFocus(e); }
  });
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

  const od = p.receta?.od ?? {};
  const oi = p.receta?.oi ?? {};

  qs('mNombre').value = p.nombre || '';
  qs('mRut').value = p.rut || '';
  qs('mRutError').textContent = '';
  qs('mDireccion').value = p.direccion || '';
  qs('mFechaNac').value = p.fechaNac || '';
  qs('mOperativo').value = p.operativo || '';

  qs('mOdEsf').value = od.esf==null ? '' : formatSph(od.esf);
  qs('mOdCil').value = od.cil==null ? '' : twoDec(Math.abs(od.cil)*-1);
  qs('mOdEje').value = od.eje ?? '';
  qs('mOdAdd').value = od.add==null ? '' : ('+'+twoDec(Math.abs(od.add)));
  qs('mOdDP').value  = readDP(od) ?? '';
  qs('mOdALT').value = od.alt ?? '';

  qs('mOiEsf').value = oi.esf==null ? '' : formatSph(oi.esf);
  qs('mOiCil').value = oi.cil==null ? '' : twoDec(Math.abs(oi.cil)*-1);
  qs('mOiEje').value = oi.eje ?? '';
  qs('mOiAdd').value = oi.add==null ? '' : ('+'+twoDec(Math.abs(oi.add)));
  qs('mOiDP').value  = readDP(oi) ?? '';
  qs('mOiALT').value = oi.alt ?? '';

  const dxSet = new Set(Array.isArray(p.diagnostico) ? p.diagnostico : []);
  document.querySelectorAll('input[name="mdx"]').forEach(i=>{ i.checked = dxSet.has(i.value); });

  qs('mDpCerca').value = p.receta?.dpCerca ?? '';
  const mt = qs('mDpCercaToggle');
  const mbox = qs('mDpCercaBox');
  if(p.receta?.dpCerca != null){ mt.checked = true; mbox.classList.remove('hidden'); }
  else { mt.checked = false; mbox.classList.add('hidden'); }

  renderDxSugerencias('m');

  modal.overlay.classList.add('active');
  modal.overlay.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');

  modal.form.scrollTop = 0;
  qs('mNombre').focus();
}
function onCancelEdit(){
  // Si no hay sesión, cerramos modal sin confirmar y mostramos login
  if(!getSession()){
    cerrarModal(false);
    lockApp();
    return;
  }
  cerrarModal(true);
}
function cerrarModal(confirmar){
  if(confirmar && _modalDirty){
    const ok = confirm('Hay cambios sin guardar. ¿Cerrar sin guardar?');
    if(!ok) return;
  }
  modal.overlay.classList.remove('active');
  modal.overlay.setAttribute('aria-hidden','true');
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
  if(!requireAuth()){ cerrarModal(false); return; }

  // Mensaje visual de "trabajando"
  const saveBtn = document.getElementById('btnSaveEdit');
  const prevText = saveBtn.textContent;
  saveBtn.disabled = true;
  saveBtn.textContent = 'Guardando…';

  try{
    if(!validarDP('m')){ alert('Revisa los valores de DP/DP Cerca.'); return; }

    const rutVal = normalizarRut(document.getElementById('mRut').value);
    if(!esRutValido(rutVal)){ setModalRutError('RUT inválido'); return; }
    setModalRutError('');

    const esfOD = parseDec(document.getElementById('mOdEsf').value); const esfOI = parseDec(document.getElementById('mOiEsf').value);
    const cilOD = -Math.abs(parseDec(document.getElementById('mOdCil').value) ?? 0); const cilOI = -Math.abs(parseDec(document.getElementById('mOiCil').value) ?? 0);
    const addOD = Math.abs(parseDec(document.getElementById('mOdAdd').value) ?? 0); const addOI = Math.abs(parseDec(document.getElementById('mOiAdd').value) ?? 0);
    const cylODVal = (cilOD==null ? null : Math.round(cilOD*4)/4);
    const cylOIVal = (cilOI==null ? null : Math.round(cilOI*4)/4);

    const actualizado = {
      nombre: val(document.getElementById('mNombre').value),
      rut: formatearRut(rutVal),
      direccion: val(document.getElementById('mDireccion').value),
      fechaNac: val(document.getElementById('mFechaNac').value),
      operativo: val(document.getElementById('mOperativo').value),
      receta: {
        od: { esf: (esfOD==null?null:Math.round(esfOD*4)/4), cil: cylODVal, eje: readAxisFor('mOdEje', cylODVal), add: (addOD==null?null:Math.round(addOD*4)/4), dp:  numOrNull('mOdDP'), alt: numOrNull('mOdALT') },
        oi: { esf: (esfOI==null?null:Math.round(esfOI*4)/4), cil: cylOIVal, eje: readAxisFor('mOiEje', cylOIVal), add: (addOI==null?null:Math.round(addOI*4)/4), dp:  numOrNull('mOiDP'), alt: numOrNull('mOiALT') },
        dpCerca: document.getElementById('mDpCercaToggle').checked ? numOrNull('mDpCerca') : null
      },
      diagnostico: getCheckedValuesByName('mdx'),
      diagnostico_sugerido: sugerenciasDxFromValues(leerValoresParaSugerencia('m')),
      obs: val(document.getElementById('mObs')?.value || ''),
      record_version: RECORD_VERSION
    };

    const pacientes = leerPacientes();
    const newRutNorm = rutVal;
    const oldRutNorm = _modalOriginalRut;

    const yaExiste = pacientes.some(p => normalizarRut(p.rut || '') === newRutNorm && newRutNorm !== oldRutNorm);
    if(yaExiste){ alert('Ya existe un paciente con el RUT ingresado.'); return; }

    const idx = pacientes.findIndex(p => normalizarRut(p.rut || '') === oldRutNorm);
    const now = new Date().toISOString();
    if(idx >= 0){
      const creadoEn = pacientes[idx].creadoEn || now;
      pacientes[idx] = { ...pacientes[idx], ...actualizado, creadoEn, actualizadoEn: now };
    }else{
      pacientes.push({ ...actualizado, creadoEn: now, actualizadoEn: now });
    }

    guardarPacientes(pacientes);

    const cont = document.getElementById('listaResultados');
    if(cont){
      const p = pacientes.find(x => normalizarRut(x.rut || '') === newRutNorm);
      cont.innerHTML = renderTarjetaPaciente(p);
      const msg = document.getElementById('msgResultados'); if(msg) msg.textContent = '1 resultado. (Actualizado)';
    }

    showToast('Cambios guardados');
    cerrarModal(false);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = prevText;
  }
}

/********** INIT **********/
function attachLoginHandlers(){
  const form=document.getElementById('loginForm');
  if(form) form.addEventListener('submit', handleLogin);
  setupLogout();
}
window.addEventListener('load', async ()=>{
  initTheme();
  await seedUsers();
  try{ await migrateUsersIfNeeded(); }catch(err){ console.warn('migrateUsersIfNeeded() falló:', err); }
  attachLoginHandlers();
  initModal();
  attachRxHandlers();

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

  // Estado inicial al cargar/recargar: ÚNICA fuente de verdad
  const sess = getSession();
  if(!sess){
    lockApp();                               // sin sesión → login
  }else{
    unlockApp(sess);
    const target = getLastSection() || 'archivo';
    showSection(target);                      // con sesión → última sección o Archivo
  }

  // Guardar la sección activa real al salir/recargar (persistencia exacta)
  window.addEventListener('beforeunload', () => {
    const active = document.querySelector('section.active');
    if(active){ localStorage.setItem(LAST_SECTION_KEY, active.id); }
  });

  // Delegación de seguridad: Cancelar siempre responde
  document.addEventListener('click', (e)=>{
    if (e.target && e.target.id === 'btnCancelEdit'){
      e.preventDefault();
      onCancelEdit();
    }
  });
  // Delegación de seguridad: Submit del modal si no se ató por alguna razón
  const _ef = document.getElementById('editForm');
  if(_ef && !_ef._boundSubmit){
    _ef.addEventListener('submit', guardarDesdeModal);
    _ef._boundSubmit = true;
  }

  document.querySelectorAll('nav ul li').forEach(li=>{
    li.addEventListener('click',(e)=>{
      e.preventDefault();
      const text=(li.textContent||'').toLowerCase();
      guardShowSection(text.includes('ingresar') ? 'ingresar' : 'archivo');
    });
  });

  // Marcamos el body como hidratado (si quisieras evitar flashes con CSS)
  document.body.classList.add('hydrated');

  // Defensa: si ninguna sección quedó activa y hay sesión, forzar Archivo
  if (!document.querySelector('section.active') && getSession()){
    showSection('archivo');
  }
});
