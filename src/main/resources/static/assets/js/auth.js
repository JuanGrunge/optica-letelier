// assets/js/auth.js
// UI de autenticación. El backend maneja toda la sesión (cookie HttpOnly).
import * as Auth from './services/auth.service.js';

let _currentUser = null;
export function getCurrentUser() { return _currentUser; }

export async function refreshSession() {
  try { _currentUser = await Auth.me(); }
  catch { _currentUser = null; }
  applyAuthState();
}

export function initAuth() {
  // Login
  const form = document.querySelector('#loginForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const username = fd.get('username') || fd.get('email');
      const password = fd.get('password');
      try {
        await Auth.login({ username, password });
        await refreshSession();
      } catch (err) {
        alert(err?.message || 'Login failed');
      }
    });
  }

  // Logout
  const logoutBtn = document.querySelector('#btnLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try { await Auth.logout(); }
      finally { _currentUser = null; applyAuthState(); }
    });
  }

  refreshSession();
}

function applyAuthState() {
  const loginView = document.querySelector('#login');
  const appView   = document.querySelector('#app');

  if (_currentUser) {
    if (loginView) loginView.style.display = 'none';
    if (appView)   appView.style.display   = '';
    const u = document.querySelector('#username');
    if (u) u.textContent = _currentUser.username || 'user';
  } else {
    if (loginView) loginView.style.display = '';
    if (appView)   appView.style.display   = 'none';
    const u = document.querySelector('#username');
    if (u) u.textContent = '';
  }
}
