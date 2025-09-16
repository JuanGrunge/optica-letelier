// assets/js/ui/header.behavior.js
export function initHeader() {
  const header = document.querySelector('.c-header');
  const menuBtn = document.querySelector('[data-js="menu"]');
  if (!header || !menuBtn) return;

  const mq = window.matchMedia('(max-width: 768px)');

  function setOpen(open) {
    header.classList.toggle('is-open', !!open);
  }

  menuBtn.addEventListener('click', () => {
    if (!mq.matches) return; // sólo en móvil/tablet
    setOpen(!header.classList.contains('is-open'));
  });

  // Cerrar al navegar
  header.querySelectorAll('.c-header__nav button').forEach(btn => {
    btn.addEventListener('click', () => setOpen(false));
  });

  // Cerrar al cambiar de tamaño a desktop
  mq.addEventListener?.('change', (e) => { if (!e.matches) setOpen(false); });
}

// auto-init si se carga directo como módulo
try { initHeader(); } catch {}

