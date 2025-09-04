import { requireAuth } from './auth.js';

function validSection(id){ return (id==='archivo'||id==='ingresar') ? id : 'archivo'; }
function setLastSection(id){ if(requireAuth()) localStorage.setItem('lastSection', validSection(id)); }
function getLastSection(){ return localStorage.getItem('lastSection') || 'archivo'; }

function allViews(){ return Array.from(document.querySelectorAll('section.view')); }
function getView(id){ return document.getElementById(validSection(id)); }

export function showSection(id){
  if (!requireAuth()) return;
  const target = getView(id);
  if (!target) return;
  allViews().forEach(s => s.classList.remove('active'));
  target.classList.add('active');
  document.querySelector('nav')?.classList.remove('active');
  setLastSection(id);
}

export function openArchivo(){
  if (!requireAuth()) return;
  // Limpiar query y resultados
  const q = document.getElementById('fQuery'); 
  if (q){ q.value=''; q.focus(); }
  const list = document.getElementById('listaResultados'); if (list) list.innerHTML = '';
  const msg  = document.getElementById('msgResultados');   if (msg)  msg.textContent = '';
  showSection('archivo');
}

export function initRouter(){
  const btnArchivo  = document.getElementById('navArchivo');
  const btnIngresar = document.getElementById('navIngresar');

  btnArchivo?.addEventListener('click', (e) => {
    e.preventDefault();
    if (requireAuth()) openArchivo();
  });

  btnIngresar?.addEventListener('click', (e) => {
    e.preventDefault();
    if (requireAuth()) showSection('ingresar');
  });

  document.querySelector('.menu-toggle')?.addEventListener('click', () => {
    document.querySelector('nav')?.classList.toggle('active');
  });

  const initial = getLastSection();
  showSection(initial);
}
