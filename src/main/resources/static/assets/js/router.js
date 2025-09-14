// assets/js/router.js – espera auth:ready antes de mostrar Archivo
let currentSection = null;
let dirtySnapshot = null;

const q = (s)=>document.querySelector(s);

function setActive(targetId){
  document.querySelectorAll('section.view').forEach(sec=>{
    const isTarget = sec.id === targetId;
    sec.classList.toggle('active', isTarget);
    sec.setAttribute('aria-hidden', isTarget ? 'false' : 'true');
  });
}

export function showSection(id){
  if (currentSection === id) return;

  if (isDirty()){
    if (!confirm('Hay cambios sin guardar, ¿quieres salir igualmente?')) return;
    dirtySnapshot = null;
  }
  setActive(id);
  currentSection = id;

  if (id === 'ingresar'){
    const form = q('#formIngresar');
    if (form) dirtySnapshot = new FormData(form);
  }
}

export function initRouter(){
  const navArchivo  = q('#navArchivo');
  const navIngresar = q('#navIngresar');

  if (navArchivo)  navArchivo.addEventListener('click', (e)=>{ e.preventDefault(); showSection('archivo'); });
  if (navIngresar) navIngresar.addEventListener('click', (e)=>{ e.preventDefault(); showSection('ingresar'); });

  // Hamburguesa
  const burger = q('.menu-toggle');
  if (burger) burger.addEventListener('click', ()=> document.body.classList.toggle('nav-open'));
  document.addEventListener('click', (ev)=>{
    const t = ev.target;
    if (t.closest && (t.closest('#navArchivo') || t.closest('#navIngresar'))) document.body.classList.remove('nav-open');
  });
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') document.body.classList.remove('nav-open'); });

  // SOLO tras sesión lista activamos una vista
  document.addEventListener('auth:ready', ()=>{
    showSection('archivo');
  });
}

function isDirty(){
  const form = q('#formIngresar');
  if (!form || !dirtySnapshot) return false;
  const now = new FormData(form);
  for (const [k,v] of dirtySnapshot.entries()){
    if (now.get(k) !== v) return true;
  }
  return false;
}
