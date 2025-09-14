
// assets/js/router.js (contextual)
// Mantiene hamburguesa y navegación, y protege cambios del form.
let currentSection = null;
let dirtySnapshot = null;

export function initRouter() {
  const navArchivo  = document.querySelector('#navArchivo');
  const navIngresar = document.querySelector('#navIngresar');

  if (navArchivo) {
    navArchivo.addEventListener('click', (e) => {
      e.preventDefault();
      showSection('archivo');
    });
  }
  if (navIngresar) {
    navIngresar.addEventListener('click', (e) => {
      e.preventDefault();
      showSection('ingresar');
    });
  }

  // Hamburguesa (mobile)
  const burger = document.querySelector('.menu-toggle');
  if (burger) {
    burger.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
    });
  }
  document.addEventListener('click', (ev) => {
    const t = ev.target;
    if (t.closest && (t.closest('#navArchivo') || t.closest('#navIngresar'))) {
      document.body.classList.remove('nav-open');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.body.classList.remove('nav-open');
  });

  // Sección inicial visible
  showSection('archivo');
}

function showSection(name) {
  if (currentSection === name) return;

  if (isDirty()) {
    if (!confirm('Hay cambios sin guardar, ¿quieres salir igualmente?')) return;
    dirtySnapshot = null;
  }

  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  const el = document.querySelector(`#${name}`);
  if (el) el.style.display = '';
  currentSection = name;

  if (name === 'ingresar') {
    const form = document.querySelector('#formIngresar'); // id real del index
    if (form) dirtySnapshot = new FormData(form);
  }
}

function isDirty() {
  const form = document.querySelector('#formIngresar');
  if (!form || !dirtySnapshot) return false;
  const now = new FormData(form);
  for (const [k, v] of dirtySnapshot.entries()) {
    if (now.get(k) !== v) return true;
  }
  return false;
}
