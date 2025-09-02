// -------------------- UTILIDAD TEMA OSCURO --------------------
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

// -------------------- NAVEGACIÓN --------------------
function showSection(id){
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelector("nav").classList.remove("active");
}
document.querySelector(".menu-toggle").addEventListener("click", () => {
  document.querySelector("nav").classList.toggle("active");
});

// -------------------- PERSISTENCIA --------------------
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

// -------------------- INGRESO --------------------
function val(v){ return (v ?? '').toString().trim(); }

function guardarPaciente(event){
  event.preventDefault();

  const paciente = {
    nombre: val(document.getElementById('nombre').value),
    rut: val(document.getElementById('rut').value),
    edad: Number(document.getElementById('edad').value || 0),
    operativo: val(document.getElementById('operativo').value),
    receta: {
      od: {
        esf: Number(document.getElementById('odEsf').value || 0),
        cil: Number(document.getElementById('odCil').value || 0),
        eje: Number(document.getElementById('odEje').value || 0),
        add: Number(document.getElementById('odAdd').value || 0),
      },
      oi: {
        esf: Number(document.getElementById('oiEsf').value || 0),
        cil: Number(document.getElementById('oiCil').value || 0),
        eje: Number(document.getElementById('oiEje').value || 0),
        add: Number(document.getElementById('oiAdd').value || 0),
      }
    },
    dp: Number(document.getElementById('dp').value || 0),
    opciones: {
      filtroAzul: document.getElementById('optFiltroAzul').checked,
      fotocrom: document.getElementById('optFotocrom').checked,
      multifocal: document.getElementById('optMulti').checked,
    },
    obs: val(document.getElementById('obs').value),
    creadoEn: new Date().toISOString()
  };

  // Validación mínima
  if(!paciente.nombre || !paciente.rut || !paciente.operativo){
    mostrarMensaje('msgGuardado', 'Debes completar Nombre, RUT y Lugar de Operativo.', true);
    return;
  }

  const pacientes = leerPacientes();

  // Actualiza si existe mismo RUT, si no, agrega
  const idx = pacientes.findIndex(p => (p.rut || '').toLowerCase() === paciente.rut.toLowerCase());
  if(idx >= 0){ pacientes[idx] = paciente; }
  else{ pacientes.push(paciente); }

  guardarPacientes(pacientes);
  mostrarMensaje('msgGuardado', 'Paciente guardado correctamente.');
  (document.getElementById('formIngresar')).reset();
  if(toggleSwitch && localStorage.getItem('theme')==='dark'){ toggleSwitch.checked = true; } // conserva switch visual
}

function mostrarMensaje(id, texto, error=false){
  const el = document.getElementById(id);
  if(!el) return;
  el.textContent = texto;
  el.style.color = error ? '#b00020' : '#0a7a0a';
  setTimeout(()=>{ el.textContent=''; }, 3000);
}

// -------------------- ARCHIVO / BÚSQUEDA --------------------
function buscarPacientes(){
  const fRut = (document.getElementById('fRut').value || '').trim().toLowerCase();
  const fNombre = (document.getElementById('fNombre').value || '').trim().toLowerCase();
  const fOperativo = (document.getElementById('fOperativo').value || '').trim().toLowerCase();

  const pacientes = leerPacientes();

  const resultados = pacientes.filter(p => {
    const rutOk = fRut ? (p.rut || '').toLowerCase().includes(fRut) : true;
    const nomOk = fNombre ? (p.nombre || '').toLowerCase().includes(fNombre) : true;
    const opOk  = fOperativo ? (p.operativo || '').toLowerCase().includes(fOperativo) : true;
    return rutOk && nomOk && opOk;
  });

  renderResultados(resultados);

  const msg = document.getElementById('msgResultados');
  if(resultados.length === 0){
    msg.textContent = 'Sin resultados. Ajusta tus filtros.';
  }else{
    msg.textContent = `${resultados.length} resultado(s).`;
  }
}

function limpiarBusqueda(){
  document.getElementById('formBuscar').reset();
  document.getElementById('tbodyResultados').innerHTML = '';
  document.getElementById('msgResultados').textContent = '';
}

function renderResultados(rows){
  const tbody = document.getElementById('tbodyResultados');
  tbody.innerHTML = rows.map(p => {
    const opts = [];
    if(p.opciones?.filtroAzul) opts.push('Filtro Azul');
    if(p.opciones?.fotocrom) opts.push('Fotocrom.');
    if(p.opciones?.multifocal) opts.push('Bif/Multif.');
    return `
      <tr>
        <td>${escapeHtml(p.nombre || '')}</td>
        <td>${escapeHtml(p.rut || '')}</td>
        <td>${Number(p.edad||0)}</td>
        <td>${escapeHtml(p.operativo || '')}</td>
        <td>${Number(p.dp||0)}</td>
        <td>${opts.join(', ') || '-'}</td>
      </tr>
    `;
  }).join('');
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s=>(
    { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s]
  ));
}

// -------------------- SEED OPCIONAL PARA PRUEBA --------------------
// (Descomenta si quieres datos de ejemplo la primera vez)
// ;(function seed(){
//   const pacientes = leerPacientes();
//   if(pacientes.length===0){
//     guardarPacientes([
//       { nombre:'Juan Pérez', rut:'12.345.678-9', edad:35, operativo:'Operativo Plaza Central',
//         receta:{od:{},oi:{}}, dp:62, opciones:{filtroAzul:true}, obs:'', creadoEn:new Date().toISOString() },
//       { nombre:'María Soto', rut:'9.876.543-2', edad:29, operativo:'Operativo Escuela 12',
//         receta:{od:{},oi:{}}, dp:60, opciones:{}, obs:'', creadoEn:new Date().toISOString() },
//     ]);
//   }
// })();
