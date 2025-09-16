// assets/js/auth.js
// SPA de autenticación. Oculta el botón de logout cuando no hay sesión.
// Persistencia segura mínima con sessionStorage (se borra al cerrar la pestaña).

import * as Auth from './services/auth.service.js';

let _currentUser = null;
export function getCurrentUser(){ return _currentUser; }

function show(el){ if(!el) return; el.removeAttribute('hidden'); el.style.display=''; }
function hide(el){ if(!el) return; el.setAttribute('hidden',''); el.style.display='none'; }
const q = (s)=>document.querySelector(s);

// --- Persistencia de sesión (mínima) ---
const AUTH_STORAGE_KEY = 'letelier:session';
const AUTH_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 horas
let _authReadyFired = false;

function saveSession(sessionObj) {
  try {
    const payload = { ...sessionObj, _ts: Date.now() };
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !data._ts) return null;
    const expired = (Date.now() - data._ts) > AUTH_MAX_AGE_MS;
    return expired ? null : data;
  } catch {
    return null;
  }
}

function clearSession() {
  try { sessionStorage.removeItem(AUTH_STORAGE_KEY); } catch {}
}

// --- Estado desde backend (si existe cookie de sesión) o cache local ---
export async function refreshSession(){
  // 1) Intentar cache para evitar "salto" al login en F5
  const cached = loadSession();
  if (cached) {
    _currentUser = cached.user || cached;
    applyAuthState();
    dispatchAuthReadyOnce({ cached: true });
    // (Opcional) Validación contra backend sin bloquear la UI:
    try {
      const serverUser = await Auth.me();
      _currentUser = serverUser || _currentUser;
      applyAuthState();
    } catch {
      // Si el backend dijo que no hay sesión real, limpiar cache
      _currentUser = null;
      clearSession();
      applyAuthState();
    }
    return;
  }

  // 2) Sin cache: preguntar al backend (si tu Auth.me() lo soporta)
  try {
    _currentUser = await Auth.me();
    // Si hay usuario válido del backend, guarda una sesión mínima
    if (_currentUser) saveSession({ user: _currentUser });
  } catch {
    _currentUser = null;
  }
  applyAuthState();
  if (_currentUser) dispatchAuthReadyOnce({ cached: false });
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
        // 200 con {username, roles, ...}
        const respUser = await Auth.login(username, password);
        _currentUser = respUser;
        // Guardar sesión mínima (puedes incluir token si tu backend lo retorna)
        saveSession({ user: respUser });
        if (msg) msg.textContent = '';
        applyAuthState();
        dispatchAuthReadyOnce({ cached: false });
      } catch (err){
        _currentUser = null;
        clearSession();
        if (msg) msg.textContent = 'Credenciales inválidas o servidor no disponible';
        applyAuthState();
      }
    });
  }

  // Logout: solo bindea el click; la visibilidad la maneja applyAuthState()
  const logoutBtn = q('#btnLogout');
  if (logoutBtn){
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try { await Auth.logout(); } finally {
        _currentUser = null;
        clearSession();
        _authReadyFired = false; // permitirá volver a disparar el evento al próximo login
        applyAuthState();
      }
    });
  }

  // Estado inicial
  refreshSession();
}

function dispatchAuthReadyOnce(detail){
  if (_authReadyFired) return;
  _authReadyFired = true;
  try {
    document.dispatchEvent(new CustomEvent('auth:ready', { detail }));
  } catch {}
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
    if (logoutBtn) show(logoutBtn);        // visible con sesión
    const u = q('#username');
    if (u) u.textContent = _currentUser.username || _currentUser.name || '';
  } else {
    if (login) { login.classList.add('active'); login.style.display=''; }
    if (app)   { app.style.display='none'; }
    if (logoutBtn) hide(logoutBtn);        // oculto sin sesión
    const u = q('#username');
    if (u) u.textContent = '';
  }

  // Elementos protegidos
  document.querySelectorAll('[data-auth="protected"]').forEach(el => {
    if (authed) el.removeAttribute('hidden'); else el.setAttribute('hidden','');
  });
}
