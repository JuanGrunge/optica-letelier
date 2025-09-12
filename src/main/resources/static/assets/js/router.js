import { requireAuth } from './auth.js';

/* -------------------- Utilidades de vista -------------------- */
function validSection(id){ return (id==='archivo'||id==='ingresar') ? id : 'archivo'; }
function setLastSection(id){ if(requireAuth()) localStorage.setItem('lastSection', validSection(id)); }
function getLastSection(){ return localStorage.getItem('lastSection') || 'archivo'; }
function allViews(){ return Array.from(document.querySelectorAll('section.view')); }
function getView(id){ return document.getElementById(validSection(id)); }

/* -------------------- Dirty tracking (snapshot + flag) -------------------- */
let _formSnapshot = null;
let _dirtyFlag = false;
function _getForm(){ return document.getElementById('formIngresar'); }
function _snapshot(){
  const f=_getForm(); if(!f) return null;
  const ids=['rut','nombre','direccion','operativo','fechaNac','odEsf','odCil','odEje','odAdd','odALT','odDP','oiEsf','oiCil','oiEje','oiAdd','oiALT','oiDP','dpCercaToggle','dpCerca','obs'];
  const o={}; ids.forEach((id)=>{ const el=document.getElementById(id); if(!el) return; o[id] = (el.type==='checkbox') ? !!el.checked : (el.value||''); });
  return JSON.stringify(o);
}
export function isFormDirty(){ const s=_snapshot(); return _dirtyFlag || (_formSnapshot!==null && s!==_formSnapshot); }
function resetFormDirty(){ _formSnapshot=_snapshot(); _dirtyFlag=false; }
function clearFormAndReset(){
  const f=_getForm(); if(!f) return;
  try{ f.reset(); }catch{}
  const box = document.getElementById('rxMsg'); if (box){ box.innerHTML=''; box.classList.add('hidden'); }
  setTimeout(resetFormDirty,0);
}

/* -------------------- Confirmación accesible (Sí / No) -------------------- */
function ensureConfirmModal(){
  let overlay = document.getElementById('confirmDiscard');
  if (!overlay){
    overlay = document.createElement('div');
    overlay.id = 'confirmDiscard';
    overlay.className = 'confirm-overlay';
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML = `
      <div class="confirm-card" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
        <h3 id="confirmTitle">Cambios sin guardar</h3>
        <p id="confirmMsg">Tienes cambios sin guardar. ¿Deseas salir y descartar los cambios?</p>
        <div class="confirm-actions">
          <button id="btnConfirmOk" class="btn danger">Sí</button>
          <button id="btnConfirmCancel" class="btn">No</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    if (!document.getElementById('confirmDiscardStyles')) {
      const style = document.createElement('style');
      style.id = 'confirmDiscardStyles';
      style.textContent = `
        .confirm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);display:none;align-items:center;justify-content:center;z-index:1200}
        .confirm-overlay.active{display:flex}
        .confirm-card{background:var(--surface,#ffffff);color:var(--text,#0f172a);border:1px solid var(--line,#e5e7eb);border-radius:12px;max-width:420px;width:92%;padding:16px;box-shadow:0 12px 30px rgba(0,0,0,.2)}
        .confirm-card h3{margin:.25rem 0 .5rem;font-weight:600}
        .confirm-card p{margin:0 0 1rem}
        .confirm-actions{display:flex;gap:8px;justify-content:flex-end}
        .dark .confirm-card,[data-theme="dark"] .confirm-card{background:var(--surface-2,#111827);color:var(--text-contrast,#e5e7eb);border-color:var(--line-2,#334155)}
        .dark .confirm-overlay,[data-theme="dark"] .confirm-overlay{background:rgba(0,0,0,.55)}
      `;
      document.head.appendChild(style);
    }
  }
  return overlay;
}

function getFocusable(container){
  return Array.from(container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
    .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
}

function confirmDiscardModal(message){
  try{
    const overlay = ensureConfirmModal();
    const dialog = overlay.querySelector('.confirm-card');
    const ok = overlay.querySelector('#btnConfirmOk');
    const cancel = overlay.querySelector('#btnConfirmCancel');
    const msg = overlay.querySelector('#confirmMsg');
    if (!dialog || !ok || !cancel) throw new Error('modal incomplete');
    if (msg) msg.textContent = message;

    return new Promise((resolve)=>{
      const previousActive = document.activeElement;
      function cleanup(res){
        overlay.classList.remove('active'); overlay.setAttribute('aria-hidden','true');
        overlay.removeEventListener('keydown', onKey);
        overlay.removeEventListener('click', onOverlay);
        ok.removeEventListener('click', onOk); cancel.removeEventListener('click', onCancel);
        if (previousActive && typeof previousActive.focus==='function') previousActive.focus();
        resolve(res);
      }
      function onOk(e){ e.preventDefault(); cleanup(true); }
      function onCancel(e){ e.preventDefault(); cleanup(false); }
      function onOverlay(e){ if (e.target === overlay) cleanup(false); }
      function onKey(e){
        if (e.key === 'Escape'){ e.preventDefault(); cleanup(false); return; }
        if (e.key === 'Tab'){
          const items = getFocusable(dialog);
          if (items.length===0) return;
          const first = items[0], last = items[items.length-1];
          if (e.shiftKey && document.activeElement === first){ last.focus(); e.preventDefault(); }
          else if (!e.shiftKey && document.activeElement === last){ first.focus(); e.preventDefault(); }
        }
      }
      overlay.classList.add('active'); overlay.setAttribute('aria-hidden','false');
      overlay.addEventListener('keydown', onKey);
      overlay.addEventListener('click', onOverlay);
      ok.addEventListener('click', onOk);
      cancel.addEventListener('click', onCancel);
      ok.focus();
    });
  } catch {
    return Promise.resolve(window.confirm(message));
  }
}

/* -------------------- Navegación -------------------- */
function doShowSection(id){
  const target = getView(id);
  if (!target) return;
  allViews().forEach((s)=> s.classList.remove('active'));
  target.classList.add('active');
  if (id==='ingresar') { setTimeout(resetFormDirty, 0); }
  document.querySelector('nav')?.classList.remove('active');
  setLastSection(id);
}

export function showSection(id){
  if (!requireAuth()) return;
  id = validSection(id);
  if (id==='archivo' && isFormDirty()){
    confirmDiscardModal('Tienes cambios sin guardar. ¿Salir y DESCARTAR los cambios?').then((ok)=>{
      if (!ok) return;
      clearFormAndReset();
      doShowSection(id);
    });
    return;
  }
  doShowSection(id);
}

export function openArchivo(){
  if (!requireAuth()) return;
  const q = document.getElementById('fQuery'); 
  if (q){ q.value=''; q.focus(); }
  const list = document.getElementById('listaResultados'); if (list) list.innerHTML = '';
  const msg  = document.getElementById('msgResultados');   if (msg)  msg.textContent = '';
  showSection('archivo');
}

let _logoutInProgress = false;
export function initRouter(){
  const btnArchivo  = document.getElementById('navArchivo');
  const btnIngresar = document.getElementById('navIngresar');

  document.querySelectorAll('[data-nav]').forEach((el)=>{
    el.addEventListener('click', (e)=>{
      const target = el.getAttribute('data-nav');
      if (!target) return;
      e.preventDefault();
      showSection(target);
    });
  });

  btnArchivo?.addEventListener('click', (e) => {
    e.preventDefault();
    openArchivo();
  });

  btnIngresar?.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('ingresar');
  });

  const f=_getForm();
  if (f){
    f.querySelectorAll('input,select,textarea').forEach((el)=>{
      el.addEventListener('input', ()=>{ _dirtyFlag = true; });
      el.addEventListener('change', ()=>{ _dirtyFlag = true; });
    });
    setTimeout(resetFormDirty,0);
    f.addEventListener('submit', ()=> setTimeout(resetFormDirty,0));
  }

  const initial = getLastSection();
  doShowSection(initial);
}

/* -------------------- beforeunload -------------------- */
window.addEventListener('beforeunload', (e) => {
  if (isFormDirty()) { e.preventDefault(); e.returnValue = ''; }
});

/* -------------------- Cerrar sesión (captura) -------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const out = document.getElementById('btnLogout');
  if (!out) return;
  out.addEventListener('click', (e) => {
    if (_logoutInProgress) return;
    if (!isFormDirty()) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    confirmDiscardModal('Tienes cambios sin guardar. ¿Cerrar sesión y DESCARTAR los cambios?').then((ok)=>{
      if (!ok) return;
      clearFormAndReset();
      _logoutInProgress = true;
      out.click();
      setTimeout(()=>{ _logoutInProgress=false; }, 300);
    });
  }, true);
});
