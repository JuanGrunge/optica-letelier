import { requireAuth } from './auth.js';

function validSection(id){return (id==='archivo'||id==='ingresar')?id:'archivo'}
function setLastSection(id){ if(requireAuth()) localStorage.setItem('lastSection', validSection(id)); }
function getLastSection(){ return localStorage.getItem('lastSection') || 'archivo'; }

export function showSection(id){
  document.querySelectorAll('section').forEach(s=>s.classList.remove('active'));
  const el=document.getElementById(validSection(id));
  if (el) el.classList.add('active');
  document.querySelector('nav')?.classList.remove('active');
  setLastSection(id);
}
export function openArchivo(){
  if (!requireAuth()) return;
  const q=document.getElementById('fQuery'); if(q) q.value='';
  showSection('archivo');
}
export function initRouter(){
  document.getElementById('navArchivo')?.addEventListener('click', openArchivo);
  document.getElementById('navIngresar')?.addEventListener('click', () => { if (requireAuth()) showSection('ingresar'); });
  document.querySelector('.menu-toggle')?.addEventListener('click', () => {
    document.querySelector('nav')?.classList.toggle('active');
  });
  showSection(getLastSection());
}
