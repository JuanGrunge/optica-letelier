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

// === PATCH: mobile hamburger dropdown toggle (append-only) ===
document.addEventListener('DOMContentLoaded', () => {
  try{
    const toggler = document.querySelector('.menu-toggle');
    const nav = document.querySelector('header nav');
    if (!toggler || !nav) return;
    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
    toggler.addEventListener('click', () => document.body.classList.toggle('nav-open'));
    nav.addEventListener('click', (evt) => {
      const t = evt.target.closest('button, a, [data-nav]');
      if (t && isMobile()) document.body.classList.remove('nav-open');
    });
    window.addEventListener('resize', () => {
      if (!isMobile()) document.body.classList.remove('nav-open');
    });
  }catch(e){ console.warn('menu toggle patch error:', e); }
});
