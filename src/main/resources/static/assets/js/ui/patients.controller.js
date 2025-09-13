// assets/js/patients.js — versión estable para Guardar / Validar / Toast / Reset
function showToast(text){
  const el = document.getElementById('toast');
  if(!el){ alert(text); return; }
  el.textContent = text;
  el.classList.add('show');
  setTimeout(()=> el.classList.remove('show'), 2300);
}

function numOrNull(id){
  const el = document.getElementById(id);
  if(!el) return null;
  const v = el.value;
  if(v==null || String(v).trim()==='') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function readAxisFor(id, cylVal){
  let n = numOrNull(id);
  if(n==null) return null;
  if(cylVal==null || Math.abs(cylVal)===0) return null; // eje sólo si hay cilindro
  return n;
}
function val(v){ return (v??'').toString().trim(); }

function actualizarEstadoDPCerca(){
  const on = document.getElementById('dpCercaToggle')?.checked;
  document.getElementById('dpCercaBox')?.classList.toggle('hidden', !on);
}

function limpiarMensajes(){
  const box = document.getElementById('rxMsg');
  if (box){ box.innerHTML=''; box.classList.add('hidden'); }
  const rutErr = document.getElementById('rutError');
  if (rutErr){ rutErr.textContent=''; }
}

function formReportValidity(form){
  return (form && typeof form.reportValidity==='function') ? form.reportValidity() : true;
}

function validarYFormatearRut(){
  const input = document.getElementById('rut'); if(!input) return true;
  const raw = input.value;
  if(!raw){ return true; }
  if(!esRutValido(raw)){
    const err = document.getElementById('rutError');
    if (err){ err.textContent = 'RUT inválido'; }
    return false;
  }
  input.value = formatearRut(raw);
  const err = document.getElementById('rutError');
  if (err){ err.textContent = ''; }
  return true;
}

export function initPatients(){
  const form = document.getElementById('formIngresar');
  if(!form) return;

  // Mostrar/ocultar DP cerca al cambiar toggle
  document.getElementById('dpCercaToggle')?.addEventListener('change', actualizarEstadoDPCerca);
  actualizarEstadoDPCerca();

  // Formateo/validación RUT en blur
  document.getElementById('rut')?.addEventListener('blur', validarYFormatearRut);

  // Submit guardar
  form.addEventListener('submit', guardarPaciente);
}

function guardarPaciente(e){
  e.preventDefault();
  const form = document.getElementById('formIngresar');
  if(!form) return;

  limpiarMensajes();

  if(!formReportValidity(form)) return;
  if(!validarYFormatearRut()) return;
  if (typeof validateRx==='function' && !validateRx('',form)) return;

  const rutVal = normalizarRut(document.getElementById('rut').value||'');
  if(!rutVal){ alert('RUT es requerido'); return; }

  const esfOD = parseDec(document.getElementById('odEsf').value);
  const cilOD = formatCylRaw(parseDec(document.getElementById('odCil').value));
  const ejeOD = readAxisFor('odEje', cilOD);
  const addOD = formatAddRaw(parseDec(document.getElementById('odAdd').value));

  const esfOI = parseDec(document.getElementById('oiEsf').value);
  const cilOI = formatCylRaw(parseDec(document.getElementById('oiCil').value));
  const ejeOI = readAxisFor('oiEje', cilOI);
  const addOI = formatAddRaw(parseDec(document.getElementById('oiAdd').value));

  const pacientes = leerPacientes();
  const idx = pacientes.findIndex(p => normalizarRut(p.rut||'') === rutVal);
  const dpCercaOn = !!document.getElementById('dpCercaToggle')?.checked;

  const base = {
    nombre: val(document.getElementById('nombre').value),
    rut: formatearRut(rutVal),
    direccion: val(document.getElementById('direccion').value),
    fechaNac: val(document.getElementById('fechaNac').value),
    operativo: val(document.getElementById('operativo').value),
    receta: {
      od: { esf: esfOD==null?null:roundQ(esfOD), cil: cilOD==null?null:roundQ(cilOD), eje: ejeOD==null?null:clampIntInRange(ejeOD,0,180), add: addOD==null?null:roundQ(addOD), dp: numOrNull('odDP'), alt: numOrNull('odALT') },
      oi: { esf: esfOI==null?null:roundQ(esfOI), cil: cilOI==null?null:roundQ(cilOI), eje: ejeOI==null?null:clampIntInRange(ejeOI,0,180), add: addOI==null?null:roundQ(addOI), dp: numOrNull('oiDP'), alt: numOrNull('oiALT') },
      dpCerca: dpCercaOn ? numOrNull('dpCerca') : null
    },
    obs: val(document.getElementById('obs').value),
    actualizadoEn: new Date().toISOString()
  };

  if (idx>=0){
    const creado = pacientes[idx]?.creadoEn || new Date().toISOString();
    pacientes[idx] = { ...pacientes[idx], ...base, creadoEn: creado };
  } else {
    base.creadoEn = new Date().toISOString();
    pacientes.push(base);
  }

  guardarPacientes(pacientes);

  // Avisos y limpieza
  const msg = document.getElementById('msgGuardado');
  if (msg){ msg.textContent = 'Datos guardados correctamente.'; }
  showToast('Paciente guardado');

  try { form.reset(); } catch {}
  actualizarEstadoDPCerca();
  limpiarMensajes();

  // Disparar evento para que otros módulos refresquen si lo necesitan
  document.dispatchEvent(new CustomEvent('pacientes:guardado', { detail: { rut: base.rut } }));
}
