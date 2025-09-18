
import { initAuth }   from './auth.js';
import { initTheme }  from './theme.js';
import { initRouter } from './router.js';
import { initPatients } from './ui/patients.controller.js';
import { initArchive } from './ui/archive.controller.js';
import { initModal }  from './modal.js';

function start(){
  try { initTheme(); } catch(e){ console.warn('initTheme:', e); }
  try { initAuth();  } catch(e){ console.warn('initAuth:', e); }
  try { initRouter();} catch(e){ console.warn('initRouter:', e); }
  try { initArchive(); } catch(e){ console.warn('initArchive:', e); }
  try { initPatients(); } catch(e){ console.warn('initPatients:', e); }
  try { initModal(); } catch(e){ console.warn('initModal:', e); }
  // Retirar preboot inmediatamente; el control de visibilidad lo maneja auth.js
  try {
    document.body && document.body.classList.remove('preboot');
    const boot = document.getElementById('bootScreen'); if (boot) boot.remove();
  } catch {}
}

if (document.readyState === 'loading'){
  window.addEventListener('DOMContentLoaded', start);
} else {
  // ya parseado; ejecuta de inmediato
  start();
}
