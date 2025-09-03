import { initAuth, requireAuth } from './auth.js';
import { initTheme } from './theme.js';
import { initRouter, openArchivo } from './router.js';
import { initPatients } from './patients.js';
import { initModal } from './modal.js';

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initAuth();
  initRouter();
  initPatients();
  initModal();
  document.body.classList.remove('preboot');
  if (requireAuth()) openArchivo();
});
