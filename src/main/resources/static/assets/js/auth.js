// assets/js/auth.js
// SPA de autenticación. Oculta el botón de logout cuando no hay sesión.

import * as Auth from './services/auth.service.js';

let _currentUser = null;
export function getCurrentUser(){ return _currentUser; }

function show(el){ if(!el) return; el.removeAttribute('hidden'); el.style.display=''; }
function hide(el){ if(!el) return; el.setAttribute('hidden',''); el.style.display='none'; }
const q = (s)=>document.querySelector(s);

export async function refreshSession(){
  try { _currentUser = await Auth.me(); } catch { _currentUser = null; }
  applyAuthState();
}

export function initAuth(){
  // Login
  const form = q('#loginForm');
  if (form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = (q('#loginUser')?.value || '').trim();
      const password = (q('#loginPass')?.value || '').trim();
      const msg = q('#loginMsg');
      if (msg) msg.textContent = 'Ingresando...';
      try {
        _currentUser = await Auth.login(username, password); // 200 con {username,roles}
        if (msg) msg.textContent = '';
      } catch (err){
        _currentUser = null;
        if (msg) msg.textContent = 'Credenciales inválidas o servidor no disponible';
      }
      applyAuthState();
    });
  }

  // Logout: solo bindea el click; la visibilidad la maneja applyAuthState()
  const logoutBtn = q('#btnLogout');
  if (logoutBtn){
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try { await Auth.logout(); } finally { _currentUser = null; applyAuthState(); }
    });
  }

  // Estado inicial
  refreshSession();
}

function applyAuthState(){
  const login = q('#loginOverlay') || q('#login') || q('#loginView');
  const app   = q('#app');
  const logoutBtn = q('#btnLogout');
  const authed = !!_currentUser;

  document.body.classList.toggle('no-session', !authed);

  if (authed){
    if (login) { login.classList.remove('active'); login.style.display='none'; }
    if (app)   { app.style.display=''; }
    if (logoutBtn) show(logoutBtn);        // <-- visible con sesión
    const u = q('#username');
    if (u) u.textContent = _currentUser.username || '';
  } else {
    if (login) { login.classList.add('active'); login.style.display=''; }
    if (app)   { app.style.display='none'; }
    if (logoutBtn) hide(logoutBtn);        // <-- oculto sin sesión
    const u = q('#username');
    if (u) u.textContent = '';
  }

  // Elementos protegidos
  document.querySelectorAll('[data-auth="protected"]').forEach(el => {
    if (authed) el.removeAttribute('hidden'); else el.setAttribute('hidden','');
  });
}
