
// assets/js/router.js (contextual)
// Mantiene hamburguesa y navegación, y protege cambios del form.
let currentSection = null;
let dirtySnapshot = null;

export function initRouter() {
  const navInicio  = document.querySelector('#navInicio');
  const navArchivo  = document.querySelector('#navArchivo');
  const navIngresar = document.querySelector('#navIngresar');

  if (navInicio) {
    const goInicio = (e) => {
      e.preventDefault();
      // Proteger cuando no hay sesión
      if (document.body.classList.contains('no-session')) return;
      showSection('inicio');
      document.body.classList.remove('nav-open');
    };
    navInicio.addEventListener('click', goInicio);
    navInicio.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') goInicio(e);
    });
  }
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
  const burger = document.querySelector('[data-js="menu"]');
  if (burger) {
    burger.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
    });
  }
  document.addEventListener('click', (ev) => {
    const t = ev.target;
    if (t.closest && (t.closest('#navInicio') || t.closest('#navArchivo') || t.closest('#navIngresar'))) {
      document.body.classList.remove('nav-open');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.body.classList.remove('nav-open');
  });

  // Sección inicial visible
  showSection('inicio');
}

function showSection(name) {
  if (currentSection === name) return;

  if (isDirty()) {
    if (!confirm('Hay cambios sin guardar, ¿quieres salir igualmente?')) return;
    dirtySnapshot = null;
  }

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.querySelector(`#${name}`);
  if (el) el.classList.add('active');
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
