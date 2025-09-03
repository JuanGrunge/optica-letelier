/* ================================================================
   LETELIER - Lógica de la WebApp
   Estructura general:
   1) Config & utilidades
   2) Autenticación + sesión
   3) Guard de navegación (modal con cambios)
   4) Tema oscuro/claro
   5) Navegación de secciones + persistencia
   6) Almacenamiento de pacientes
   7) Formatos clínicos y RUT
   8) Sugerencias y cálculos auxiliares
   9) Validación clínica (Constraint API)
   10) Guardar / Buscar / Renderizar
   11) Modal de edición (abrir, validar, guardar)
   12) Inicialización
   ================================================================ */

/* =============== 1) CONFIG & utils ===============*/
const AUTH_KEY='sesion', USERS_KEY='usuarios', LS_KEY='pacientes', LAST_SECTION_KEY='lastSection', RECORD_VERSION=1;
const val=v=>(v??'').toString().trim();
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));}
function showToast(t){const el=document.getElementById('toast'); if(!el) return; el.textContent=t; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2300);}

/* =============== 2) AUTENTICACIÓN ===============*/
async function sha256Hex(text){const enc=new TextEncoder().encode(text);const buf=await crypto.subtle.digest('SHA-256',enc);return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');}
async function seedUsers(){ if(localStorage.getItem(USERS_KEY)) return; const h=await sha256Hex('letelier25'); localStorage.setItem(USERS_KEY, JSON.stringify([{username:'admin',passHash:h,role:'admin'}]));}
function getUsers(){try{return JSON.parse(localStorage.getItem(USERS_KEY)||'[]')}catch{return[]}}
function findUser(u){return getUsers().find(x=>(x.username||'').toLowerCase()===String(u||'').toLowerCase());}
function setSession(s){localStorage.setItem(AUTH_KEY,JSON.stringify(s))}
function getSession(){try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'null')}catch{return null}}
function clearSession(){localStorage.removeItem(AUTH_KEY)}
async function migrateUsersIfNeeded(){const us=getUsers(); if(!us.length) return; const adm=us.find(u=>(u.username||'').toLowerCase()==='admin'); if(!adm) return; const OLD=await sha256Hex('Letelier#2025'); const NEW=await sha256Hex('letelier25'); if(adm.passHash===OLD){adm.passHash=NEW; adm.version=(adm.version||1)+1; localStorage.setItem(USERS_KEY,JSON.stringify(us));}}
function lockApp(){document.querySelectorAll('section').forEach(s=>s.classList.remove('active')); document.getElementById('loginOverlay')?.classList.add('active'); document.getElementById('userBadge').hidden=true; document.getElementById('btnLogout').hidden=true; document.body.classList.add('no-session'); localStorage.removeItem(LAST_SECTION_KEY);}
function unlockApp(sess){document.getElementById('loginOverlay')?.classList.remove('active'); const b=document.getElementById('userBadge'); if(b){b.textContent=`${sess.username} (${sess.role==='admin'?'Administrador':sess.role})`; b.hidden=false;} document.getElementById('btnLogout').hidden=false; document.body.classList.remove('no-session');}
function requireAuth(){const s=getSession(); if(!s){lockApp(); return false;} unlockApp(s); return true;}
async function handleLogin(e){e.preventDefault(); const u=val(document.getElementById('loginUser').value), p=document.getElementById('loginPass').value, m=document.getElementById('loginMsg'); m.textContent=''; const user=findUser(u); if(!user){m.textContent='Usuario o contraseña inválidos.'; return;} const h=await sha256Hex(p); if(h!==user.passHash){const OLD=await sha256Hex('Letelier#2025'); if(user.username.toLowerCase()==='admin' && h===OLD){user.passHash=await sha256Hex('letelier25'); const all=getUsers().map(x=>x.username.toLowerCase()==='admin'?user:x); localStorage.setItem(USERS_KEY,JSON.stringify(all));}else{m.textContent='Usuario o contraseña inválidos.'; return;}} setSession({username:user.username,role:user.role,at:new Date().toISOString()}); localStorage.setItem(LAST_SECTION_KEY,'archivo'); document.getElementById('loginForm').reset(); unlockApp(getSession()); showSection('archivo');}
function setupLogout(){document.getElementById('btnLogout')?.addEventListener('click',()=>{attemptNavigation(()=>{clearSession();lockApp();});});}

/* =============== 3) GUARD de navegación (modal sucio) ===============*/
function modalIsOpen(){return document.getElementById('editModal')?.classList.contains('active')}
let _modalDirty=false;
function attemptNavigation(action){ if(!modalIsOpen()){action(); return;} if(_modalDirty){const ok=confirm('Hay modificaciones no guardadas. ¿Desea salir sin guardar?'); if(!ok) return;} cerrarModal(false); action();}

/* =============== 4) TEMA ===============*/
const toggleSwitch=document.querySelector('#darkModeToggle'), body=document.body;
function switchTheme(e){if(e.target.checked){body.classList.add('dark-mode');localStorage.setItem('theme','dark');}else{body.classList.remove('dark-mode');localStorage.setItem('theme','light');}}
function initTheme(){if(!toggleSwitch) return; toggleSwitch.addEventListener('change',switchTheme,false); const t=localStorage.getItem('theme'); if(t){body.classList.add(t+'-mode'); if(t==='dark') toggleSwitch.checked=true;}}

/* =============== 5) NAVEGACIÓN + persistencia ===============*/
function validSection(id){return (id==='archivo'||id==='ingresar')?id:'archivo'}
function setLastSection(id){if(getSession()) localStorage.setItem(LAST_SECTION_KEY,validSection(id))}
function getLastSection(){return validSection(localStorage.getItem(LAST_SECTION_KEY))}
function showSection(id){document.querySelectorAll('section').forEach(s=>s.classList.remove('active')); const el=document.getElementById(validSection(id)); if(el) el.classList.add('active'); document.querySelector('nav').classList.remove('active'); setLastSection(id);}
function guardShowSection(id){ if(!requireAuth()) return; attemptNavigation(()=>showSection(id)); }
function openArchivo(){ if(!requireAuth()) return; attemptNavigation(()=>{limpiarBusqueda(); showSection('archivo');}); }
document.querySelector(".menu-toggle").addEventListener("click",()=>{document.querySelector("nav").classList.toggle("active");});

/* =============== 6) STORAGE PACIENTES ===============*/
function leerPacientes(){try{const raw=localStorage.getItem(LS_KEY); return raw?JSON.parse(raw):[]}catch{return[]}}
function guardarPacientes(ps){localStorage.setItem(LS_KEY,JSON.stringify(ps))}

/* =============== 7) FORMATOS CLÍNICOS + RUT ===============*/
const roundQuarter=n=>Math.round(n*4)/4, twoDec=n=>Number(n).toFixed(2);
function parseDec(s){if(s===undefined||s===null) return null; const x=String(s).replace(',','.').trim(); if(!x) return null; const n=Number(x.replace(/[^\d.\-+]/g,'')); return Number.isFinite(n)?n:null;}
function formatSph(n){if(n==null||n==='') return '—'; const v=Number(n); return (v>=0?'+':'')+twoDec(v);}
function formatCylRaw(n){if(n==null||n==='') return null; const v=-Math.abs(Number(n)); return Number.isFinite(v)?v:null;}
function formatAddRaw(n){if(n==null||n==='') return null; const v=Math.abs(Number(n)); return Number.isFinite(v)?v:null;}
function fmtEje(v){if(v==null||v==='') return '—'; return `${v}°`;}
function clampIntInRange(n,min,max){const x=Math.round(Number(n)); if(!Number.isFinite(x)) return null; return Math.min(max,Math.max(min,x));}
function normAxisInput(el){const n=parseDec(el.value); if(n===null){el.value='';return;} el.value=String(clampIntInRange(n,0,180));}
function normSphInput(el){const n=parseDec(el.value); if(n===null){el.value='';return;} const v=roundQuarter(n); el.value=(v>=0?'+':'')+twoDec(v);}
function normCylInput(el){const n=parseDec(el.value); if(n===null){el.value='';return;} const v=-Math.abs(roundQuarter(n)); el.value=twoDec(v);}
function normAddInput(el){const n=parseDec(el.value); if(n===null){el.value='';return;} const v=Math.abs(roundQuarter(n)); el.value='+'+twoDec(v);}
function numOrNull(id){const v=(document.getElementById(id).value||'').trim().replace(',','.'); if(v==='') return null; const n=Number(v); return Number.isFinite(n)?n:null;}
function readAxisFor(id,cylVal){let n=numOrNull(id); if(n==null) return null; n=clampIntInRange(n,0,180); if(cylVal==null||Math.abs(cylVal)===0) return null; return n;}
function readDP(o){return o?.dp ?? o?.pd ?? null;}
/* RUT */
function normalizarRut(s){return (s||'').replace(/[.\s-]/g,'').toUpperCase()}
function separarRut(r){const m=normalizarRut(r).match(/^(\d+)-?([\dkK])$/); return m?{num:m[1],dv:m[2].toUpperCase()}:null}
function calcularDV(num){let s=0,m=2; for(let i=num.length-1;i>=0;i--){s+=parseInt(num[i],10)*m; m=(m===7)?2:m+1;} const r=11-(s%11); return r===11?'0':r===10?'K':String(r)}
function esRutValido(str){const p=separarRut(str); return !!p && calcularDV(p.num)===p.dv}
function formatearRut(str){const p=separarRut(str); if(!p) return str; const num=p.num.replace(/\B(?=(\d{3})+(?!\d))/g,'.'); return `${num}-${p.dv}`}
function setRutError(msg){const el=document.getElementById('rutError'), i=document.getElementById('rut'); if(el) el.textContent=msg||''; if(i){i.classList.toggle('is-invalid',!!msg)}}
function autoFormatearRut(){const i=document.getElementById('rut'); if(!i) return; const v=normalizarRut(i.value); if(!v){ setRutError(''); actualizarEstadoBoton(); return;} i.value=formatearRut(v); setRutError(!esRutValido(v)?'RUT inválido':''); actualizarEstadoBoton();}
function actualizarEstadoBoton(){const b=document.getElementById('btnGuardar'); const ok=esRutValido(document.getElementById('rut').value)&&val(document.getElementById('nombre').value)&&val(document.getElementById('operativo').value); if(b) b.disabled=!ok}

/* =============== 8) SUGERENCIAS Y DERIVADOS ===============*/
function calcularEdad(iso){if(!iso) return null; const h=new Date(), d=new Date(iso); if(isNaN(d)) return null; let e=h.getFullYear()-d.getFullYear(); const m=h.getMonth()-d.getMonth(); if(m<0||(m===0&&h.getDate()<d.getDate())) e--; return Math.max(0,e)}
function sphericalEquivalent(s,c){if(s==null&&c==null) return null; return Number(s||0)+Number(c||0)/2}
function sugerenciasDxFromValues({od,oi,add,edad}){const s=new Set(); const seOD=sphericalEquivalent(od.esf,od.cil), seOI=sphericalEquivalent(oi.esf,oi.cil); if((seOD!=null&&seOD<=-0.25)||(seOI!=null&&seOI<=-0.25)) s.add('Miopía'); if((seOD!=null&&seOD>=0.25)||(seOI!=null&&seOI>=0.25)) s.add('Hipermetropía'); if((Math.abs(od.cil||0)>=0.25)||(Math.abs(oi.cil||0)>=0.25)) s.add('Astigmatismo'); const a=Math.max(Math.abs(add.od||0),Math.abs(add.oi||0)); if(a>=0.5 || (edad!=null&&edad>=40)) s.add('Presbicie'); return Array.from(s)}
function leerValoresParaSugerencia(prefix){const g=id=>document.getElementById((prefix||'')+id); const sph=id=>parseDec(g(id).value); const cyl=id=>formatCylRaw(parseDec(g(id).value)); const add=id=>formatAddRaw(parseDec(g(id).value)); const edad=calcularEdad(g('FechaNac')?.value||null); return {od:{esf:roundQuarter(sph('OdEsf')??sph('odEsf')??0), cil:roundQuarter(cyl('OdCil')??cyl('odCil')??0)}, oi:{esf:roundQuarter(sph('OiEsf')??sph('oiEsf')??0), cil:roundQuarter(cyl('OiCil')??cyl('oiCil')??0)}, add:{od:roundQuarter(add('OdAdd')??add('odAdd')??0), oi:roundQuarter(add('OiAdd')??add('oiAdd')??0)}, edad}}
function chips(arr){if(!arr||!arr.length) return '-'; return `<div class="chips">${arr.map(v=>`<span class="chip">${escapeHtml(v)}</span>`).join('')}</div>`;}
/* DP Cerca hint/sugerencia */
function dpLejos(prefix){const od=numOrNull((prefix?'m':'')+'OdDP'), oi=numOrNull((prefix?'m':'')+'OiDP'); if(od==null||oi==null) return null; return +(od+oi).toFixed(1)}
function updateDpCercaHint(prefix){const L=dpLejos(prefix), el=document.getElementById((prefix?'m':'')+'DpCercaHint'); if(!el) return; el.textContent= L==null ? 'Sugerencia: calcule desde DP Lejos (≈ L − 3.0 mm).' : `Sugerencia: ≈ ${(L-3).toFixed(1)} mm (L = ${L.toFixed(1)} mm).`}
function sugerirDpCerca(prefix){const L=dpLejos(prefix), input=document.getElementById((prefix?'m':'')+'DpCerca'); if(L!=null && input && !input.value){ input.value=(L-3).toFixed(1);} updateDpCercaHint(prefix);}

/* =============== 9) VALIDACIÓN CLÍNICA (Constraint API) ===============*/
function clearValidity(list){list.forEach(el=>el && el.setCustomValidity(''));}
function setErr(el,msg){if(el) el.setCustomValidity(msg);}
function validateRx(prefix, formEl){
  const id=n=>(prefix?'m'+n:n), g=n=>document.getElementById(id(n)); clearValidity([g('OdDP'),g('OiDP'),g('OdALT'),g('OiALT'),g('OdEje'),g('OiEje'),g('DpCerca')]);
  const dpOD=numOrNull(id('OdDP')), dpOI=numOrNull(id('OiDP'));
  if(dpOD!=null && (dpOD<20||dpOD>40)) setErr(g('OdDP'),'Distancia pupilar monocular (OD) fuera de rango clínico: 20–40 mm.');
  if(dpOI!=null && (dpOI<20||dpOI>40)) setErr(g('OiDP'),'Distancia pupilar monocular (OI) fuera de rango clínico: 20–40 mm.');
  const altOD=numOrNull(id('OdALT')), altOI=numOrNull(id('OiALT'));
  if(altOD!=null && (altOD<10||altOD>40)) setErr(g('OdALT'),'Altura de montaje (OD) fuera de rango: 10–40 mm.');
  if(altOI!=null && (altOI<10||altOI>40)) setErr(g('OiALT'),'Altura de montaje (OI) fuera de rango: 10–40 mm.');
  const cilOD=formatCylRaw(parseDec(g('OdCil').value)), cilOI=formatCylRaw(parseDec(g('OiCil').value));
  const ejeOD=numOrNull(id('OdEje')), ejeOI=numOrNull(id('OiEje'));
  if(Math.abs(cilOD||0)>0 && (ejeOD==null || ejeOD<0 || ejeOD>180)) setErr(g('OdEje'),'Eje requerido con cilindro distinto de 0. Rango: 0–180°.');
  if(Math.abs(cilOI||0)>0 && (ejeOI==null || ejeOI<0 || ejeOI>180)) setErr(g('OiEje'),'Eje requerido con cilindro distinto de 0. Rango: 0–180°.');
  if(Math.abs(cilOD||0)===0 && ejeOD!=null) setErr(g('OdEje'),'El eje debe quedar vacío cuando el cilindro es 0.');
  if(Math.abs(cilOI||0)===0 && ejeOI!=null) setErr(g('OiEje'),'El eje debe quedar vacío cuando el cilindro es 0.');
  const chk=document.getElementById(id('DpCercaToggle')), cerca=numOrNull(id('DpCerca'));
  if(chk && chk.checked){
    if(cerca==null) setErr(g('DpCerca'),'DP de cerca (binocular) obligatoria cuando está activada.');
    else{
      if(cerca<40||cerca>80) setErr(g('DpCerca'),'DP de cerca fuera de rango clínico: 40–80 mm.');
      const L=dpLejos(prefix); if(L!=null){const min=L-4,max=L-2; if(!(cerca>=min && cerca<=max)) setErr(g('DpCerca'),`Coherencia DP: entre ${min.toFixed(1)} y ${max.toFixed(1)} mm (≈ L−3).`);}
    }
  }
  return formEl.reportValidity();
}

/* =============== 10) GUARDAR / BUSCAR / RENDER ===============*/
function mostrarMensaje(id,txt){const el=document.getElementById(id); if(el) el.textContent=txt||'';}
function guardarPaciente(e){
  e.preventDefault(); if(!requireAuth()) return;
  const form=document.getElementById('formIngresar'); if(!validateRx('',form)) return;
  const rutVal=normalizarRut(document.getElementById('rut').value); if(!esRutValido(rutVal)){ setRutError('RUT inválido'); actualizarEstadoBoton(); return;}
  const esfOD=parseDec(document.getElementById('odEsf').value), esfOI=parseDec(document.getElementById('oiEsf').value);
  const cilOD=-Math.abs(parseDec(document.getElementById('odCil').value) ?? 0), cilOI=-Math.abs(parseDec(document.getElementById('oiCil').value) ?? 0);
  const addOD=Math.abs(parseDec(document.getElementById('odAdd').value) ?? 0), addOI=Math.abs(parseDec(document.getElementById('oiAdd').value) ?? 0);
  const pacientes=leerPacientes(); const idx=pacientes.findIndex(p=>normalizarRut(p.rut||'')===rutVal);
  const dpCercaOn=document.getElementById('dpCercaToggle').checked;
  const base={
    nombre:val(document.getElementById('nombre').value),
    rut:formatearRut(rutVal),
    direccion:val(document.getElementById('direccion').value),
    fechaNac:val(document.getElementById('fechaNac').value),
    operativo:val(document.getElementById('operativo').value),
    receta:{
      od:{esf:esfOD==null?null:roundQuarter(esfOD), cil:cilOD==null?null:roundQuarter(cilOD), eje:readAxisFor('odEje',cilOD), add:addOD==null?null:roundQuarter(addOD), dp:numOrNull('odDP'), alt:numOrNull('odALT')},
      oi:{esf:esfOI==null?null:roundQuarter(esfOI), cil:cilOI==null?null:roundQuarter(cilOI), eje:readAxisFor('oiEje',cilOI), add:addOI==null?null:roundQuarter(addOI), dp:numOrNull('oiDP'), alt:numOrNull('oiALT')},
      dpCerca: dpCercaOn ? numOrNull('dpCerca') : 0
    },
    diagnostico: Array.from(document.querySelectorAll('input[name="dx"]:checked')).map(i=>i.value),
    diagnostico_sugerido: sugerenciasDxFromValues(leerValoresParaSugerencia('')),
    obs: val(document.getElementById('obs').value),
    record_version: RECORD_VERSION
  };
  const now=new Date().toISOString();
  if(idx>=0){const creado=pacientes[idx].creadoEn||now; pacientes[idx]={...pacientes[idx],...base,creadoEn:creado,actualizadoEn:now};}
  else{pacientes.push({...base,creadoEn:now,actualizadoEn:now});}
  guardarPacientes(pacientes); mostrarMensaje('msgGuardado','Datos guardados correctamente.'); showToast('Paciente guardado');
  form.reset(); document.getElementById('dpCercaBox').classList.add('hidden'); document.getElementById('dpCercaToggle').checked=false; renderDxSugerencias(''); actualizarEstadoBoton();
}
/* búsqueda */
function normalizarTexto(s){return (s||'').toString().trim().toLowerCase()}
function contieneRut(h,q){const H=(h||'').replace(/[.\s-]/g,'').toLowerCase(), Q=(q||'').replace(/[.\s-]/g,'').toLowerCase(); return H.includes(Q)}
function buscarPacientes(){ if(!requireAuth()) return; showSection('archivo'); const q=normalizarTexto(document.getElementById('fQuery').value); const ps=leerPacientes();
  if(!q){ renderListaOperativo(ps); document.getElementById('msgResultados').textContent=ps.length===0?'Sin pacientes cargados.':`${ps.length} paciente(s).`; return;}
  const r=ps.filter(p=> (p.rut?contieneRut(p.rut,q):false) || (p.nombre||'').toLowerCase().includes(q) || (p.operativo||'').toLowerCase().includes(q));
  renderFichas(r); document.getElementById('msgResultados').textContent=r.length===0?'Sin resultados.':`${r.length} resultado(s).`;
}
function limpiarBusqueda(){const iq=document.getElementById('fQuery'); if(iq) iq.value=''; document.getElementById('listaResultados').innerHTML=''; document.getElementById('msgResultados').textContent='';}
/* celdas */
function cellSph(n){return n==null?'—':formatSph(n)} function cellCyl(n){if(n==null) return '—'; const v=formatCylRaw(n); return (v===0||v===0.00)?'—':twoDec(v)}
function cellAdd(n){if(n==null) return '—'; const v=formatAddRaw(n); return (v===0||v===0.00)?'—':`+${twoDec(v)}`} function cellEje(n){return fmtEje(n)}
function cellNum(n){return (n==null||n==='')?'—':`${n}`} function cellMm(n){return (n==null||n==='')?'—':`${n} mm`}
function cellDpCerca(n){const v=Number(n); if(!Number.isFinite(v)||v===0) return '—'; return `${v} mm`;}

/* flags revisión (sin marcar por DP/ALT vacíos) */
function isQuarter(x){return Math.abs((x*4)-Math.round(x*4))<1e-6}
function needsReview(p){
  const info=[],warn=[],crit=[],err=[];
  const now=Date.now(), ageDays=p.actualizadoEn?Math.floor((now-new Date(p.actualizadoEn).getTime())/86400000):null;
  if(!('record_version' in p)||p.record_version<RECORD_VERSION) info.push('Estandarización pendiente');
  if(ageDays!=null && ageDays>180) info.push(`Sin actualización clínica hace ${ageDays} días`);
  const od=p.receta?.od??{}, oi=p.receta?.oi??{};
  const chk=(e,l)=>{ if(e.esf!=null && !isQuarter(Number(e.esf))) info.push(`${l}: Esfera no múltiplo de 0.25`); if(e.cil!=null && !isQuarter(Number(e.cil))) info.push(`${l}: Cilindro no múltiplo de 0.25`); if(e.cil==0 && (e.eje!=null && e.eje!=='')) err.push(`${l}: Eje presente con cilindro 0`); if(e.cil!=0 && (e.eje==null || e.eje==='')) err.push(`${l}: Falta eje`); if(e.eje!=null && (e.eje<0||e.eje>180)) err.push(`${l}: Eje fuera de 0–180`); };
  chk(od,'OD'); chk(oi,'OI');
  const edad=calcularEdad(p.fechaNac); const addMax=Math.max(Math.abs(od.add||0),Math.abs(oi.add||0)); if(edad!=null && edad>=45 && !(addMax>=0.5)) info.push('ADD ausente con edad ≥45');
  const reasons=[...err.map(r=>`[ERR] ${r}`),...crit.map(r=>`[CRIT] ${r}`),...warn.map(r=>`[WARN] ${r}`),...info.map(r=>`[INFO] ${r}`)];
  return {flag:reasons.length>0, reasons};
}

/* render resultados */
function renderListaOperativo(rows){
  const cont=document.getElementById('listaResultados'); if(!cont) return;
  const list=[...rows].sort((a,b)=>(a.operativo||'').localeCompare(b.operativo||'')||(a.nombre||'').localeCompare(b.nombre||''));
  cont.innerHTML=list.map(p=>{const rev=needsReview(p); const warn=rev.flag?`<span class="warn-icon" title="${escapeHtml(rev.reasons.join(' • '))}">!</span>`:''; return `
    <div class="list-item" onclick="verPacienteDetalle('${encodeURIComponent(p.rut||'')}')">
      <div class="name">${warn} ${escapeHtml(p.nombre||'(Sin nombre)')}</div>
      <div class="subtle">${escapeHtml(p.operativo||'')}</div>
    </div>`}).join('');
}
function renderFichas(rs){const cont=document.getElementById('listaResultados'); if(!cont) return; if(!rs||!rs.length){cont.innerHTML=''; return;} cont.innerHTML=rs.map(p=>renderTarjetaPaciente(p)).join('');}
function verPacienteDetalle(r){ if(!requireAuth()) return; const rut=decodeURIComponent(r||''); const ps=leerPacientes(); const p=ps.find(x=>normalizarRut(x.rut||'')===normalizarRut(rut)); const cont=document.getElementById('listaResultados'); if(p&&cont){cont.innerHTML=renderTarjetaPaciente(p); const msg=document.getElementById('msgResultados'); if(msg) msg.textContent='1 resultado.';}}
function renderTarjetaPaciente(p){
  const od=p.receta?.od??{}, oi=p.receta?.oi??{}, dpOD=readDP(od), dpOI=readDP(oi);
  const dpL=(Number.isFinite(dpOD)&&Number.isFinite(dpOI))?+(dpOD+dpOI).toFixed(1):null, dpC=(p.receta?.dpCerca ?? null);
  const recetaTabla=`
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
  const edad=calcularEdad(p.fechaNac), fechaEdad=p.fechaNac?`${escapeHtml(formatearFecha(p.fechaNac))} (${edad??0} años)`:'—';
  const rev=needsReview(p), warn=rev.flag?`<span class="warn-icon" title="${escapeHtml(rev.reasons.join(' • '))}">!</span>`:'';
  return `
    <div class="result-card">
      <h4>${warn} ${escapeHtml(p.nombre||'')}</h4>
      <div class="result-grid">
        <div class="result-field"><label>RUT</label><div>${escapeHtml(p.rut||'')}</div></div>
        <div class="result-field"><label>Dirección</label><div>${escapeHtml(p.direccion||'—')}</div></div>
        <div class="result-field"><label>Fecha de Nacimiento / Edad</label><div>${fechaEdad}</div></div>
        <div class="result-field"><label>Lugar de Operativo</label><div>${escapeHtml(p.operativo||'')}</div></div>
        <div class="result-field result-recipe">
          <label>Receta Óptica</label>
          ${recetaTabla}
          <div>
            DP Lejos: <strong>${dpL ?? '—'}</strong> mm
            &nbsp;|&nbsp;
            DP Cerca: <strong>${cellDpCerca(dpC)}</strong>
          </div>
        </div>
        <div class="result-field"><label>Diagnóstico</label><div>${chips(p.diagnostico)}</div></div>
        <div class="result-field" style="grid-column:1/-1;"><label>Observaciones</label><div>${escapeHtml(p.obs||'—')}</div></div>
      </div>
      <div class="card-actions">
        <button class="btn-edit" onclick="abrirModalEdicion('${encodeURIComponent(p.rut||'')}')">Editar información</button>
      </div>
    </div>`;
}

/* =============== 11) MODAL DE EDICIÓN ===============*/
let _modalLastFocus=null, _modalOriginalRut=null;
const modal={ overlay:document.getElementById('editModal'), form:null };
function qs(id){return document.getElementById(id)}
function initModal(){
  modal.form=qs('editForm'); if(!modal.form) return;
  modal.form.addEventListener('input',()=>{_modalDirty=true;});
  qs('btnCancelEdit')?.addEventListener('click',onCancelEdit);
  modal.form.addEventListener('submit',guardarDesdeModal);
  modal.overlay.addEventListener('click',e=>{if(e.target===modal.overlay) cerrarModal(true);});
  modal.overlay.addEventListener('keydown',e=>{ if(e.key==='Escape'){e.preventDefault(); cerrarModal(true);} if(e.key==='Tab'){trapFocus(e);} });
}
function abrirModalEdicion(rutEncoded){
  if(!requireAuth()) return;
  const rut=decodeURIComponent(rutEncoded||''), ps=leerPacientes(), p=ps.find(x=>normalizarRut(x.rut||'')===normalizarRut(rut)); if(!p) return;
  _modalOriginalRut=normalizarRut(p.rut||''); _modalDirty=false; _modalLastFocus=document.activeElement;
  const od=p.receta?.od??{}, oi=p.receta?.oi??{};
  qs('mNombre').value=p.nombre||''; qs('mRut').value=p.rut||''; qs('mRutError').textContent=''; qs('mDireccion').value=p.direccion||''; qs('mFechaNac').value=p.fechaNac||''; qs('mOperativo').value=p.operativo||'';
  qs('mOdEsf').value=od.esf==null?'':formatSph(od.esf); qs('mOdCil').value=od.cil==null?'':twoDec(Math.abs(od.cil)*-1); qs('mOdEje').value=od.eje??''; qs('mOdAdd').value=od.add==null?'':('+'+twoDec(Math.abs(od.add))); qs('mOdDP').value=readDP(od)??''; qs('mOdALT').value=od.alt??'';
  qs('mOiEsf').value=oi.esf==null?'':formatSph(oi.esf); qs('mOiCil').value=oi.cil==null?'':twoDec(Math.abs(oi.cil)*-1); qs('mOiEje').value=oi.eje??''; qs('mOiAdd').value=oi.add==null?'':('+'+twoDec(Math.abs(oi.add))); qs('mOiDP').value=readDP(oi)??''; qs('mOiALT').value=oi.alt??'';
  const dxSet=new Set(Array.isArray(p.diagnostico)?p.diagnostico:[]); document.querySelectorAll('input[name="mdx"]').forEach(i=>i.checked=dxSet.has(i.value));
  const dpCVal=(p.receta?.dpCerca ?? 0), mt=qs('mDpCercaToggle'), mbox=qs('mDpCercaBox');
  if(dpCVal && dpCVal!==0){mt.checked=true; mbox.classList.remove('hidden'); qs('mDpCerca').value=dpCVal;} else {mt.checked=false; mbox.classList.add('hidden'); qs('mDpCerca').value='';}
  updateDpCercaHint('m'); renderDxSugerencias('m');
  modal.overlay.classList.add('active'); modal.overlay.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open'); modal.form.scrollTop=0; qs('mNombre').focus();
}
function onCancelEdit(){cerrarModal(true);}
function cerrarModal(confirmar){ if(confirmar && _modalDirty){const ok=confirm('Hay modificaciones no guardadas. ¿Desea cerrar sin guardar?'); if(!ok) return;}
  modal.overlay.classList.remove('active'); modal.overlay.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); _modalDirty=false; if(_modalLastFocus) _modalLastFocus.focus();
}
function trapFocus(e){const f=modal.overlay.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'); const list=Array.from(f).filter(el=>el.offsetParent!==null); if(!list.length) return; const first=list[0], last=list[list.length-1]; if(e.shiftKey && document.activeElement===first){e.preventDefault(); last.focus();} else if(!e.shiftKey && document.activeElement===last){e.preventDefault(); first.focus();}}
function setModalRutError(msg){const el=qs('mRutError'), i=qs('mRut'); if(el) el.textContent=msg||''; if(i){i.classList.toggle('is-invalid',!!msg);}}
function getCheckedValuesByName(n){return Array.from(document.querySelectorAll(`input[name="${n}"]`)).filter(i=>i.checked).map(i=>i.value);}
function guardarDesdeModal(e){
  e.preventDefault(); if(!requireAuth()){cerrarModal(false); return;}
  const saveBtn=document.getElementById('btnSaveEdit'), prev=saveBtn.textContent; saveBtn.disabled=true; saveBtn.textContent='Guardando…';
  try{
    if(!validateRx('m',modal.form)) return;
    const rutVal=normalizarRut(qs('mRut').value); if(!esRutValido(rutVal)){ setModalRutError('RUT inválido'); return; } setModalRutError('');
    const esfOD=parseDec(qs('mOdEsf').value), esfOI=parseDec(qs('mOiEsf').value);
    const cilOD=-Math.abs(parseDec(qs('mOdCil').value) ?? 0), cilOI=-Math.abs(parseDec(qs('mOiCil').value) ?? 0);
    const addOD=Math.abs(parseDec(qs('mOdAdd').value) ?? 0), addOI=Math.abs(parseDec(qs('mOiAdd').value) ?? 0);
    const dpCOn=qs('mDpCercaToggle').checked;
    const actualizado={
      nombre:val(qs('mNombre').value), rut:formatearRut(rutVal), direccion:val(qs('mDireccion').value), fechaNac:val(qs('mFechaNac').value), operativo:val(qs('mOperativo').value),
      receta:{
        od:{esf:esfOD==null?null:roundQuarter(esfOD), cil:cilOD==null?null:roundQuarter(cilOD), eje:readAxisFor('mOdEje',cilOD), add:addOD==null?null:roundQuarter(addOD), dp:numOrNull('mOdDP'), alt:numOrNull('mOdALT')},
        oi:{esf:esfOI==null?null:roundQuarter(esfOI), cil:cilOI==null?null:roundQuarter(cilOI), eje:readAxisFor('mOiEje',cilOI), add:addOI==null?null:roundQuarter(addOI), dp:numOrNull('mOiDP'), alt:numOrNull('mOiALT')},
        dpCerca: dpCOn ? numOrNull('mDpCerca') : 0
      },
      diagnostico:getCheckedValuesByName('mdx'),
      diagnostico_sugerido:sugerenciasDxFromValues(leerValoresParaSugerencia('m')),
      obs: val(document.getElementById('mObs')?.value||''),
      record_version:RECORD_VERSION
    };
    const ps=leerPacientes(), newRut=rutVal, oldRut=_modalOriginalRut;
    const existe=ps.some(p=>normalizarRut(p.rut||'')===newRut && newRut!==oldRut); if(existe){alert('Ya existe un paciente con el RUT ingresado.'); return;}
    const idx=ps.findIndex(p=>normalizarRut(p.rut||'')===oldRut), now=new Date().toISOString();
    if(idx>=0){const creado=ps[idx].creadoEn||now; ps[idx]={...ps[idx],...actualizado,creadoEn:creado,actualizadoEn:now};} else {ps.push({...actualizado,creadoEn:now,actualizadoEn:now});}
    guardarPacientes(ps);
    const cont=document.getElementById('listaResultados'); if(cont){const p=ps.find(x=>normalizarRut(x.rut||'')===newRut); cont.innerHTML=renderTarjetaPaciente(p); const msg=document.getElementById('msgResultados'); if(msg) msg.textContent='1 resultado. (Actualizado)';}
    showToast('Cambios guardados'); cerrarModal(false);
  } finally { saveBtn.disabled=false; saveBtn.textContent=prev; }
}

/* =============== 12) INIT ===============*/
function renderDxSugerencias(prefix){
  const cont=document.getElementById(prefix?'dxSugeridosModal':'dxSugeridos'); if(!cont) return;
  const sugs=sugerenciasDxFromValues(leerValoresParaSugerencia(prefix||'')); cont.innerHTML = sugs.length ? sugs.map(s=>`<span class="chip suggested" data-dx="${s}" title="Sugerido según receta">${s}</span>`).join('') : '';
  cont.querySelectorAll('.chip.suggested').forEach(ch=>{ch.addEventListener('click',()=>{const name=prefix?'mdx':'dx'; const i=Array.from(document.querySelectorAll(`input[name="${name}"]`)).find(n=>n.value===ch.dataset.dx); if(i){i.checked=!i.checked;}});});
}
function attachRxHandlers(){
  [['odEsf','mOdEsf'],['oiEsf','mOiEsf']].flat().forEach(id=>document.getElementById(id)?.addEventListener('blur',e=>{normSphInput(e.target); renderDxSugerencias(id.startsWith('m')?'m':'');}));
  [['odCil','mOdCil'],['oiCil','mOiCil']].flat().forEach(id=>document.getElementById(id)?.addEventListener('blur',e=>{normCylInput(e.target); renderDxSugerencias(id.startsWith('m')?'m':'');}));
  [['odAdd','mOdAdd'],['oiAdd','mOiAdd']].flat().forEach(id=>document.getElementById(id)?.addEventListener('blur',e=>{normAddInput(e.target); renderDxSugerencias(id.startsWith('m')?'m':'');}));
  ['odEje','oiEje','mOdEje','mOiEje'].forEach(id=>document.getElementById(id)?.addEventListener('blur',e=>normAxisInput(e.target)));
  document.getElementById('fechaNac')?.addEventListener('change',()=>renderDxSugerencias(''));
  document.getElementById('mFechaNac')?.addEventListener('change',()=>renderDxSugerencias('m'));
  // DP Cerca toggles
  const t=document.getElementById('dpCercaToggle'), box=document.getElementById('dpCercaBox'), inC=document.getElementById('dpCerca');
  t?.addEventListener('change',()=>{box.classList.toggle('hidden',!t.checked); if(t.checked){sugerirDpCerca('');} else{inC.value='';}});
  ['odDP','oiDP','dpCerca'].forEach(id=>document.getElementById(id)?.addEventListener('input',()=>{updateDpCercaHint('');}));
  const mt=document.getElementById('mDpCercaToggle'), mbox=document.getElementById('mDpCercaBox'), minC=document.getElementById('mDpCerca');
  mt?.addEventListener('change',()=>{mbox.classList.toggle('hidden',!mt.checked); if(mt.checked){sugerirDpCerca('m');} else{minC.value='';}});
  ['mOdDP','mOiDP','mDpCerca'].forEach(id=>document.getElementById(id)?.addEventListener('input',()=>{updateDpCercaHint('m');}));
  renderDxSugerencias(''); updateDpCercaHint('');
}
function attachLoginHandlers(){const f=document.getElementById('loginForm'); if(f) f.addEventListener('submit',handleLogin); setupLogout();}
window.addEventListener('load', async ()=>{
  initTheme(); await seedUsers(); try{await migrateUsersIfNeeded();}catch{}
  attachLoginHandlers(); initModal(); attachRxHandlers();
  const rut=document.getElementById('rut'); rut?.addEventListener('blur',autoFormatearRut); rut?.addEventListener('input',()=>{const v=normalizarRut(rut.value); setRutError(v && !esRutValido(v) ? 'RUT inválido' : ''); actualizarEstadoBoton();});
  ['nombre','operativo'].forEach(id=>document.getElementById(id)?.addEventListener('input',actualizarEstadoBoton)); actualizarEstadoBoton();
  const sess=getSession(); if(!sess){lockApp();} else {unlockApp(sess); showSection(getLastSection()||'archivo');}
  window.addEventListener('beforeunload',()=>{const s=document.querySelector('section.active'); if(s) localStorage.setItem(LAST_SECTION_KEY,s.id);});
  document.querySelectorAll('nav ul li').forEach(li=>li.addEventListener('click',e=>{e.preventDefault(); const t=(li.textContent||'').toLowerCase(); if(t.includes('ingresar')) guardShowSection('ingresar'); else openArchivo();}));
  if(!document.querySelector('section.active') && getSession()) showSection('archivo');
});
