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
function strOrNull(id){
  const el = document.getElementById(id);
  if(!el) return null;
  const v = (el.value ?? '').toString().trim();
  return v ? v : null;
}
function readAxisFor(id, cylVal){
  let n = numOrNull(id);
  if(n==null) return null;
  if(cylVal==null || Math.abs(cylVal)===0) return null; // eje sólo si hay cilindro
  return n;
}
function val(v){ return (v??'').toString().trim(); }

// Normaliza una tripleta a cilindro negativo y rangos válidos
function normalizeMinusTriple(esf, cil, eje){
  let E = esf, C = cil, A = eje;
  if (C == null || Math.abs(C) === 0){
    return { esf: roundQ(E), cil: 0, eje: null };
  }
  if (C > 0){
    E = E + C; // trasladar a negativo
    C = -C;
    if (A != null) A = (parseInt(A,10) + 90);
  }
  // Ajustes finales
  E = roundQ(E);
  C = roundQ(C);
  if (A != null){
    // llevar a 0-180 entero
    A = clampIntInRange(A, 0, 180);
  }
  return { esf: E, cil: C, eje: A };
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

  // Poblar selector de operativos (con fallback a "Casa Matriz")
  try {
    const sel = document.getElementById('operativo');
    if (sel) {
      const ensureDefault = () => {
        if (![...sel.options].some(o => (o.value||'') === 'Casa Matriz')) {
          const opt = document.createElement('option');
          opt.value = 'Casa Matriz'; opt.textContent = 'Casa Matriz';
          sel.appendChild(opt);
        }
        if (!sel.value) sel.value = 'Casa Matriz';
      };
      ensureDefault();

      async function populateOperatives() {
        try {
          const places = await (window.OperativesRepository?.places?.() || Promise.resolve([]));
          (Array.isArray(places) ? places : []).forEach(name => {
            const v = (name || '').toString().trim();
            if (!v) return;
            if (![...sel.options].some(o => (o.value||'') === v)){
              const opt = document.createElement('option'); opt.value = v; opt.textContent = v; sel.appendChild(opt);
            }
          });
          if (!sel.value) sel.value = 'Casa Matriz';
        } catch {
          // Mantener opción por defecto si hay error (p. ej., 401 antes de login)
          ensureDefault();
        }
      }

      // Poblar inmediatamente (endpoint público) y reintentar si el usuario enfoca el control
      try { setTimeout(populateOperatives, 0); } catch {}

      // Robustez: si el usuario enfoca el select y aún no se pobló, intenta poblar
      sel.addEventListener('focus', () => {
        if (sel.options.length <= 1) populateOperatives();
      });
    }
  } catch {}

  // Inicialmente la receta está deshabilitada hasta guardar paciente
  try {
    const recFs = document.getElementById('recetaFieldset');
    const recBox = document.getElementById('recetaBox');
    function updateRecetaEnabled(){
      const nombre = (document.getElementById('nombre')?.value || '').trim();
      const rut = (document.getElementById('rut')?.value || '').trim();
      const direccion = (document.getElementById('direccion')?.value || '').trim();
      const ready = !!(nombre && rut && direccion);
      if (recFs) recFs.disabled = !ready;
      if (recBox) recBox.classList.toggle('c-card--disabled', !ready);
    }
    if (recFs) recFs.disabled = true;
    recBox?.classList.add('c-card--disabled');
    // Habilitar al tener nombre + rut + direccion (no requiere guardar)
    document.getElementById('nombre')?.addEventListener('input', updateRecetaEnabled);
    document.getElementById('rut')?.addEventListener('input', updateRecetaEnabled);
    document.getElementById('direccion')?.addEventListener('input', updateRecetaEnabled);
    // Por compatibilidad, también habilita al guardar (si ya estaban completos seguirá habilitada)
    document.addEventListener('pacientes:guardado', () => { updateRecetaEnabled(); });
    // Estado inicial
    updateRecetaEnabled();
  } catch {}

  // (DP cerca fue removido del formulario en el modelo DEV)

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

  const esfOI = parseDec(document.getElementById('oiEsf').value);
  const cilOI = formatCylRaw(parseDec(document.getElementById('oiCil').value));
  const ejeOI = readAxisFor('oiEje', cilOI);

  // Normalizar a cilindro negativo (modelo clínico estándar)
  const odN = normalizeMinusTriple(esfOD, cilOD, ejeOD);
  const oiN = normalizeMinusTriple(esfOI, cilOI, ejeOI);

  const pacientes = leerPacientes();
  const idx = pacientes.findIndex(p => normalizarRut(p.rut||'') === rutVal);
  
  // Generar Observaciones a partir de metadatos estructurados
  const meta = [];
  meta.push('obsSchema=ark-v1');
  meta.push('source=DEV-manual');
  const cylForm = strOrNull('cylForm'); if (cylForm) meta.push(`cylForm=${cylForm}`);
  const pdFar = numOrNull('pdFar'); if (pdFar!=null) meta.push(`pd_far=${pdFar}`);
  const pdNear = numOrNull('pdNear'); if (pdNear!=null) meta.push(`pd_near=${pdNear}`);
  const dprFar = numOrNull('dprFar'); if (dprFar!=null) meta.push(`dpr=${dprFar}`);
  const dplFar = numOrNull('dplFar'); if (dplFar!=null) meta.push(`dpl=${dplFar}`);
  const vd = numOrNull('vd'); if (vd!=null) meta.push(`vd=${vd}`);
  const pupR = numOrNull('pupR'); if (pupR!=null) meta.push(`pupR=${pupR}`);
  const pupL = numOrNull('pupL'); if (pupL!=null) meta.push(`pupL=${pupL}`);
  const addMeta = numOrNull('addMeta'); if (addMeta!=null) meta.push(`add=${addMeta}`);
  const altMeta = numOrNull('altMeta'); if (altMeta!=null) meta.push(`alt=${altMeta}`);
  const obsFree = val(document.getElementById('obs').value);
  const obsFinal = (meta.length? meta.join('; ') : '') + (obsFree? (meta.length? ' | ' : '') + obsFree : '');

  const base = {
    nombre: val(document.getElementById('nombre').value),
    rut: formatearRut(rutVal),
    direccion: val(document.getElementById('direccion').value),
    fechaNac: val(document.getElementById('fechaNac').value),
    operativo: val(document.getElementById('operativo').value),
    receta: {
      od: { esf: odN.esf, cil: odN.cil, eje: odN.eje },
      oi: { esf: oiN.esf, cil: oiN.cil, eje: oiN.eje }
    },
    obs: obsFinal,
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
  limpiarMensajes();
  // Con el reset, deshabilita nuevamente la receta hasta que se vuelvan a completar los 3 datos
  try {
    const recFs = document.getElementById('recetaFieldset');
    const recBox = document.getElementById('recetaBox');
    if (recFs) recFs.disabled = true;
    recBox?.classList.add('c-card--disabled');
  } catch {}

  // Disparar evento para que otros módulos refresquen si lo necesitan
  document.dispatchEvent(new CustomEvent('pacientes:guardado', { detail: { rut: base.rut } }));
}
