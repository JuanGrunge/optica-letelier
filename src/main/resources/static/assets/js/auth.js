// assets/js/auth.js (clean baseline)
import * as Auth from './services/auth.service.js';

let _currentUser = null;
export function getCurrentUser(){ return _currentUser; }

function show(el){ if(!el) return; el.removeAttribute('hidden'); el.style.display=''; }
function hide(el){ if(!el) return; el.setAttribute('hidden',''); el.style.display='none'; }
const q = (s)=>document.querySelector(s);
const setLoginMessage = (text) => { const el = document.querySelector('#loginMsg'); if (el) el.textContent = text || ''; };

const AUTH_STORAGE_KEY = 'letelier:session';
const AUTH_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 horas
let _authReadyFired = false;

function saveSession(sessionObj) {
  try { sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...sessionObj, _ts: Date.now() })); } catch {}
}
function loadSession() {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY); if (!raw) return null;
    const data = JSON.parse(raw); if (!data || !data._ts) return null;
    return (Date.now() - data._ts) > AUTH_MAX_AGE_MS ? null : data;
  } catch { return null; }
}
function clearSession() { try { sessionStorage.removeItem(AUTH_STORAGE_KEY); } catch {} }

export async function refreshSession(){
  const cached = loadSession();
  try {
    const serverUser = await Auth.me();
    _currentUser = serverUser || null;
    if (_currentUser) saveSession({ user: _currentUser }); else clearSession();
  } catch { _currentUser = null; clearSession(); }
  applyAuthState();
  if (_currentUser) dispatchAuthReadyOnce({ cached: !!cached });
}

export function initAuth(){
  const form = q('#loginForm');
  if (form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = (q('#loginUser')?.value || '').trim();
      const password = (q('#loginPass')?.value || '').trim();
      const msg = q('#loginMsg'); if (msg) msg.textContent = 'Ingresando...';
      try {
        const respUser = await Auth.login(username, password);
        _currentUser = respUser; saveSession({ user: respUser }); if (msg) msg.textContent = '';
        applyAuthState(); dispatchAuthReadyOnce({ cached: false });
      } catch {
        _currentUser = null; clearSession(); if (msg) msg.textContent = 'Credenciales inválidas o servidor no disponible'; applyAuthState();
      }
    });
  }
  const logoutBtn = q('#btnLogout');
  if (logoutBtn){ logoutBtn.addEventListener('click', async (e) => { e.preventDefault(); try { await Auth.logout(); } finally { _currentUser = null; clearSession(); _authReadyFired = false; applyAuthState(); } }); }
  refreshSession();
}

function dispatchAuthReadyOnce(detail){ if (_authReadyFired) return; _authReadyFired = true; try { document.dispatchEvent(new CustomEvent('auth:ready', { detail })); } catch {} }

export function forceLogout(reason = 'manual'){ _currentUser = null; clearSession(); applyAuthState(); if (reason === 'expired') setLoginMessage('Tu sesión expiró. Inicia sesión nuevamente.'); _authReadyFired = false; }
try { document.addEventListener('auth:expired', () => { forceLogout('expired'); }); } catch {}

function applyAuthState(){
  const login = q('#loginOverlay') || q('#login') || q('#loginView');
  const app   = q('#app');
  const logoutBtn = q('#btnLogout');
  const authed = !!_currentUser;
  document.body.classList.toggle('no-session', !authed);
  if (authed){ if (login) { login.classList.remove('active'); login.style.display='none'; } if (app) { app.style.display=''; } setLoginMessage(''); if (logoutBtn) show(logoutBtn); const u = q('#username'); if (u) u.textContent = _currentUser.username || _currentUser.name || ''; }
  else { if (login) { login.classList.add('active'); login.style.display=''; } if (app) { app.style.display='none'; } if (logoutBtn) hide(logoutBtn); const u = q('#username'); if (u) u.textContent = ''; }
  document.querySelectorAll('[data-auth="protected"]').forEach(el => { if (authed) el.removeAttribute('hidden'); else el.setAttribute('hidden',''); });
}

