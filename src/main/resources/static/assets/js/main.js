import { initAuth }   from './auth.js';
import { initTheme }  from './theme.js';
import { initRouter } from './router.js';
import { initPatients } from './ui/patients.controller.js';
import { initModal }  from './modal.js';

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initAuth();
  initRouter();   // aquí vive la hamburguesa
  initPatients();
  initModal();
  document.body.classList.remove('preboot');
});
