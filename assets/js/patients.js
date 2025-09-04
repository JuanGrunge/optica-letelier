import { leerPacientes, guardarPacientes } from './storage.js';
import { normalizarRut, esRutValido, formatearRut, parseDec, formatCylRaw, formatAddRaw, fmtEje, clampIntInRange, roundQ, two } from './validators.js';
import { showSection } from './router.js';

function showToast(t){const el=document.getElementById('toast'); if(!el) return; el.textContent=t; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2300);}

function numOrNull(id){const v=(document.getElementById(id).value||'').trim().replace(',','.'); if(v==='') return null; const n=Number(v); return Number.isFinite(n)?n:null;}
function readAxisFor(id,cylVal){let n=numOrNull(id); if(n==null) return null; n=clampIntInRange(n,0,180); if(cylVal==null||Math.abs(cylVal)===0) return null; return n;}
function val(v){return (v??'').toString().trim();}
function calcularEdad(iso){if(!iso) return null; const h=new Date(), d=new Date(iso); if(isNaN(d)) return null; let e=h.getFullYear()-d.getFullYear(); const m=h.getMonth()-d.getMonth(); if(m<0||(m===0&&h.getDate()<d.getDate())) e--; return Math.max(0,e)}

function sphericalEquivalent(s,c){if(s==null&&c==null) return null; return Number(s||0)+Number(c||0)/2}
function sugerenciasDxFromValues({od,oi,add,edad}){const s=new Set(); const seOD=sphericalEquivalent(od.esf,od.cil), seOI=sphericalEquivalent(oi.esf,oi.cil); if((seOD!=null&&seOD<=-0.25)||(seOI!=null&&seOI<=-0.25)) s.add('Miopía'); if((seOD!=null&&seOD>=0.25)||(seOI!=null&&seOI>=0.25)) s.add('Hipermetropía'); if((Math.abs(od.cil||0)>=0.25)||(Math.abs(oi.cil||0)>=0.25)) s.add('Astigmatismo'); const a=Math.max(Math.abs(add.od||0),Math.abs(add.oi||0)); if(a>=0.5 || (edad!=null&&edad>=40)) s.add('Presbicie'); return Array.from(s)}

function leerValoresParaSugerencia(prefix){
  const g=id=>document.getElementById((prefix||'')+id);
  const sph=id=>parseDec(g(id).value);
  const cyl=id=>formatCylRaw(parseDec(g(id).value));
  const add=id=>formatAddRaw(parseDec(g(id).value));
  const edad=calcularEdad(g('FechaNac')?.value||null);
  return {
    od:{esf:roundQ(sph('OdEsf')??sph('odEsf')??0), cil:roundQ(cyl('OdCil')??cyl('odCil')??0)},
    oi:{esf:roundQ(sph('OiEsf')??sph('oiEsf')??0), cil:roundQ(cyl('OiCil')??cyl('oiCil')??0)},
    add:{od:roundQ(add('OdAdd')??add('odAdd')??0), oi:roundQ(add('OiAdd')??add('oiAdd')??0)},
    edad
  };
}

function chips(arr){if(!arr||!arr.length) return ''; return `<div class="chips">${arr.map(v=>`<span class="chip">${(v||'')}</span>`).join('')}</div>`;}
function readDP(o){return o?.dp ?? o?.pd ?? null;}
function formatearFecha(iso){try{const d=new Date(iso); return d.toLocaleDateString('es-CL');}catch{ return iso || '—'; }}

function setRutError(msg){
  const el=document.getElementById('rutError'), i=document.getElementById('rut');
  if(el) el.textContent=msg||'';
  if(i) i.classList.toggle('is-invalid',!!msg);
}
function actualizarEstadoBoton(){
  const b=document.getElementById('btnGuardar');
  const ok=esRutValido(document.getElementById('rut').value)&&val(document.getElementById('nombre').value)&&val(document.getElementById('operativo').value);
  if(b) b.disabled=!ok;
}

function dpLejos(prefix){
  const od=numOrNull((prefix?'m':'')+'OdDP'), oi=numOrNull((prefix?'m':'')+'OiDP');
  if(od==null||oi==null) return null; return +(od+oi).toFixed(1);
}
function updateDpCercaHint(prefix){
  const L=dpLejos(prefix), el=document.getElementById((prefix?'m':'')+'DpCercaHint'); if(!el) return;
  el.textContent= L==null ? 'Sugerencia: calcule desde DP Lejos (≈ L − 3.0 mm).' : `Sugerencia: ≈ ${(L-3).toFixed(1)} mm (L = ${L.toFixed(1)} mm).`;
}
function validateRx(prefix, formEl){
  const id=n=>(prefix?'m'+n:n), g=n=>document.getElementById(id(n));
  [g('OdDP'),g('OiDP'),g('OdALT'),g('OiALT'),g('OdEje'),g('OiEje'),g('DpCerca')].forEach(el=>el && el.setCustomValidity(''));

  const dpOD=numOrNull(id('OdDP')), dpOI=numOrNull(id('OiDP'));
  if(dpOD!=null && (dpOD<20||dpOD>40)) g('OdDP').setCustomValidity('Distancia pupilar monocular (OD) fuera de rango: 20–40 mm.');
  if(dpOI!=null && (dpOI<20||dpOI>40)) g('OiDP').setCustomValidity('Distancia pupilar monocular (OI) fuera de rango: 20–40 mm.');

  const altOD=numOrNull(id('OdALT')), altOI=numOrNull(id('OiALT'));
  if(altOD!=null && (altOD<10||altOD>40)) g('OdALT').setCustomValidity('Altura de montaje (OD) fuera de rango: 10–40 mm.');
  if(altOI!=null && (altOI<10||altOI>40)) g('OiALT').setCustomValidity('Altura de montaje (OI) fuera de rango: 10–40 mm.');

  const cilOD=formatCylRaw(parseDec(g('OdCil').value)), cilOI=formatCylRaw(parseDec(g('OiCil').value));
  const ejeOD=numOrNull(id('OdEje')), ejeOI=numOrNull(id('OiEje'));
  if(Math.abs(cilOD||0)>0 && (ejeOD==null || ejeOD<0 || ejeOD>180)) g('OdEje').setCustomValidity('Eje requerido con cilindro ≠ 0 (0–180°).');
  if(Math.abs(cilOI||0)>0 && (ejeOI==null || ejeOI<0 || ejeOI>180)) g('OiEje').setCustomValidity('Eje requerido con cilindro ≠ 0 (0–180°).');
  if(Math.abs(cilOD||0)===0 && ejeOD!=null) g('OdEje').setCustomValidity('El eje debe quedar vacío cuando el cilindro es 0.');
  if(Math.abs(cilOI||0)===0 && ejeOI!=null) g('OiEje').setCustomValidity('El eje debe quedar vacío cuando el cilindro es 0.');

  const chk=document.getElementById(id('DpCercaToggle')), cerca=numOrNull(id('DpCerca'));
  if(chk && chk.checked){
    if(cerca==null) g('DpCerca').setCustomValidity('DP de cerca (binocular) obligatoria cuando está activada.');
    else{
      if(cerca<40||cerca>80) g('DpCerca').setCustomValidity('DP de cerca fuera de rango clínico: 40–80 mm.');
      const L=dpLejos(prefix); if(L!=null){const min=L-4,max=L-2; if(!(cerca>=min && cerca<=max)) g('DpCerca').setCustomValidity(`Coherencia DP: entre ${min.toFixed(1)} y ${max.toFixed(1)} mm (≈ L−3).`);}
    }
  }
  return formEl.reportValidity();
}

function renderDxSugerencias(prefix){
  const sug = sugerenciasDxFromValues(leerValoresParaSugerencia(prefix));
  const target = document.getElementById(prefix ? 'dxSugeridosModal' : 'dxSugeridos');
  if (target) target.innerHTML = chips(sug.map(s=>`Sugerido: ${s}`));
}

function guardarPaciente(e){
  e.preventDefault();
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
      od:{esf:esfOD==null?null:roundQ(esfOD), cil:cilOD==null?null:roundQ(cilOD), eje:numOrNull('odEje'), add:addOD==null?null:roundQ(addOD), dp:numOrNull('odDP'), alt:numOrNull('odALT')},
      oi:{esf:esfOI==null?null:roundQ(esfOI), cil:cilOI==null?null:roundQ(cilOI), eje:numOrNull('oiEje'), add:addOI==null?null:roundQ(addOI), dp:numOrNull('oiDP'), alt:numOrNull('oiALT')},
      dpCerca: dpCercaOn ? numOrNull('dpCerca') : 0
    },
    diagnostico: Array.from(document.querySelectorAll('input[name="dx"]:checked')).map(i=>i.value),
    diagnostico_sugerido: sugerenciasDxFromValues(leerValoresParaSugerencia('')),
    obs: val(document.getElementById('obs').value),
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString()
  };
  if(idx>=0){ const creado=pacientes[idx].creadoEn; pacientes[idx]={...pacientes[idx],...base,creadoEn:creado}; }
  else{ pacientes.push(base); }
  guardarPacientes(pacientes); document.getElementById('msgGuardado').textContent='Datos guardados correctamente.'; showToast('Paciente guardado');
  form.reset(); document.getElementById('dpCercaBox').classList.add('hidden'); document.getElementById('dpCercaToggle').checked=false; renderDxSugerencias(''); actualizarEstadoBoton();
}

function normalizarTexto(s){return (s||'').toString().trim().toLowerCase()}
function contieneRut(h,q){const H=(h||'').replace(/[.\s-]/g,'').toLowerCase(), Q=(q||'').replace(/[.\s-]/g,'').toLowerCase(); return H.includes(Q)}
function buscarPacientes(ev){
  ev?.preventDefault();
  showSection('archivo');
  const q=normalizarTexto(document.getElementById('fQuery').value);
  const ps=leerPacientes();
  if(!q){
    renderListaOperativo(ps);
    document.getElementById('msgResultados').textContent=ps.length===0?'Sin pacientes cargados.':`${ps.length} paciente(s).`;
    return;
  }
  const r=ps.filter(p=> (p.rut?contieneRut(p.rut,q):false) || (p.nombre||'').toLowerCase().includes(q) || (p.operativo||'').toLowerCase().includes(q));
  renderResultadosTabla(r);
  document.getElementById('msgResultados').textContent=r.length===0?'Sin resultados.':`${r.length} resultado(s).`;
}

function renderTarjetaPaciente(p){
  const od=p.receta?.od??{}, oi=p.receta?.oi??{}, dpOD=readDP(od), dpOI=readDP(oi);
  
const recetaTabla = `
  <div class="rx-columns" role="group" aria-label="Receta Óptica">
    <div class="rx-eye-card">
      <div class="rx-eye-title">OI</div>
      <div class="rx-rows">
        <div class="rx-row"><span class="rx-k">Esfera</span><span class="rx-v">${oi.esf ?? '—'}</span></div>
        <div class="rx-row"><span class="rx-k">Cilindro</span><span class="rx-v">${oi.cyl ?? '—'}</span></div>
        <div class="rx-row"><span class="rx-k">Eje</span><span class="rx-v">${oi.eje ?? '—'}</span></div>
        <div class="rx-row"><span class="rx-k">ADD</span><span class="rx-v">${oi.add ?? '—'}</span></div>
        <div class="rx-row"><span class="rx-k">DP (mm)</span><span class="rx-v">${dpOI ?? '—'}</span></div>
        <div class="rx-row"><span class="rx-k">ALT (mm)</span><span class="rx-v">${oi.alt ?? '—'}</span></div>
      </div>
    </div>
    <div class="rx-eye-card">
      <div class="rx-eye-title">OD</div>
      <div class="rx-rows">
        <div class="rx-row"><span class="rx-k">Esfera</span><span class="rx-v">${od.esf ?? '—'}</span></div>
        <div class="rx-row"><span class="rx-k">Cilindro</span><span class="rx-v">${od.cyl ?? '—'}</span></div>
        <div class="rx-row"><span class="rx-k">Eje</span><span class="rx-v">${od.eje ?? '—'}</span></div>
        <div class="rx-row"><span class="rx-k">ADD</span><span class="rx-v">${od.add ?? '—'}</span></div>
        <div class="rx-row"><span class="rx-k">DP (mm)</span><span class="rx-v">${dpOD ?? '—'}</span></div>
        <div class="rx-row"><span class="rx-k">ALT (mm)</span><span class="rx-v">${od.alt ?? '—'}</span></div>
      </div>
    </div>
  </div>`;

  return `
    <div class="result-card">
      <h4>${p.nombre||''}</h4>
      <div class="result-grid">
        <div class="result-field"><label>RUT</label><div>${p.rut||''}</div></div>
        <div class="result-field"><label>Dirección</label><div>${p.direccion||'—'}</div></div>
        <div class="result-field"><label>Fecha de Nacimiento</label><div>${p.fechaNac?formatearFecha(p.fechaNac):'—'}</div></div>
        <div class="result-field"><label>Lugar de Operativo</label><div>${p.operativo||''}</div></div>
        <div class="result-field result-recipe">
          <label>Receta Óptica</label>
          ${recetaTabla}
        </div>
        <div class="result-field"><label>Diagnóstico</label><div>${chips(p.diagnostico)}</div></div>
        <div class="result-field" style="grid-column:1/-1;"><label>Observaciones</label><div>${p.obs||'—'}</div></div>
      </div>
      <div class="card-actions">
        <button class="btn-edit" data-rut="${encodeURIComponent(p.rut||'')}">Editar información</button>
      </div>
    </div>`;
}

function renderListaOperativo(rows){
  const cont=document.getElementById('listaResultados'); if(!cont) return;
  const list=[...rows].sort((a,b)=>(a.operativo||'').localeCompare(b.operativo||'')||(a.nombre||'').localeCompare(b.nombre||''));
  cont.innerHTML=list.map(p=>`
    <div class="list-item" data-view="${encodeURIComponent(p.rut||'')}">
      <div class="name">${p.nombre||'(Sin nombre)'}</div>
      <div class="subtle">${p.operativo||''}</div>
    </div>`).join('');
}

function renderResultadosTabla(rows){
  const cont=document.getElementById('listaResultados'); if(!cont) return;
  if(!rows||!rows.length){ cont.innerHTML=''; return; }
  cont.innerHTML = `
    <div class="results-table-wrap">
      <table class="results-table">
        <thead>
          <tr><th>RUT</th><th>Nombre</th><th>Operativo</th></tr>
        </thead>
        <tbody>
          ${rows.map(p=>`
            <tr data-view="${encodeURIComponent(p.rut||'')}">
              <td class="rut">${p.rut||''}</td>
              <td class="nombre">${p.nombre||'(Sin nombre)'}</td>
              <td class="operativo">${p.operativo||''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;

  // Click row -> ver ficha
  cont.querySelectorAll('tbody tr[data-view]').forEach(tr=>{
    tr.addEventListener('click', ()=>{
      const rut=decodeURIComponent(tr.getAttribute('data-view'));
      const ps=leerPacientes();
      const p=ps.find(x=>normalizarRut(x.rut||'')===normalizarRut(rut));
      if(p){ cont.innerHTML=renderTarjetaPaciente(p);
             document.getElementById('msgResultados').textContent='1 resultado.'; }
      cont.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });
}



function renderFichas(rs){
  const cont=document.getElementById('listaResultados'); if(!cont) return; if(!rs||!rs.length){cont.innerHTML=''; return;}
  cont.innerHTML=rs.map(p=>renderTarjetaPaciente(p)).join('');
  // attach edit handlers
  cont.querySelectorAll('.btn-edit').forEach(btn=>{
    btn.addEventListener('click', () => {
      const event = new CustomEvent('open-edit-modal', { detail: { rut: btn.getAttribute('data-rut') } });
      window.dispatchEvent(event);
    });
  });
  cont.querySelectorAll('.list-item').forEach(el=>{
    el.addEventListener('click', () => {
      const rut=decodeURIComponent(el.getAttribute('data-view'));
      const ps=leerPacientes();
      const p=ps.find(x=>normalizarRut(x.rut||'')===normalizarRut(rut));
      if(p){ cont.innerHTML=renderTarjetaPaciente(p); document.getElementById('msgResultados').textContent='1 resultado.'; }
    });
  });
}

export function initPatients(){
  const formIngresar = document.getElementById('formIngresar');
  formIngresar?.addEventListener('submit', guardarPaciente);

  const formBuscar = document.getElementById('formBuscar');
  formBuscar?.addEventListener('submit', buscarPacientes);

  const rutInput=document.getElementById('rut');
  rutInput?.addEventListener('input', ()=>{
    const v=normalizarRut(rutInput.value);
    setRutError(!esRutValido(v)?'RUT inválido':'');
    actualizarEstadoBoton();
  });

  // DP cerca hints
  ['odDP','oiDP'].forEach(id=> document.getElementById(id)?.addEventListener('input', ()=>updateDpCercaHint('') ));
  ['mOdDP','mOiDP'].forEach(id=> document.getElementById(id)?.addEventListener('input', ()=>updateDpCercaHint('m') ));

  // toggle dp cerca
  document.getElementById('dpCercaToggle')?.addEventListener('change', (e)=>{
    document.getElementById('dpCercaBox').classList.toggle('hidden', !e.target.checked);
    updateDpCercaHint('');
  });

  renderDxSugerencias('');
}
