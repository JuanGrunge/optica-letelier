// assets/js/router.js  (MPA definitivo)
let currentSection = null;
let dirtySnapshot = null;

export function initRouter() {
  // Navegación de secciones
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

  // Hamburguesa (mobile) — usa SIEMPRE la misma clase en <body>
  const burger = document.querySelector('.menu-toggle');
  if (burger) {
    burger.addEventListener('click', () => {
      document.body.classList.toggle('nav-open'); // <-- unificamos aquí
    });
  }

  // Cerrar menú al navegar
  document.addEventListener('click', (ev) => {
    const t = ev.target;
    if (t.closest && (t.closest('#navArchivo') || t.closest('#navIngresar'))) {
      document.body.classList.remove('nav-open'); // <-- unificamos aquí
    }
  });

  // Escape cierra menú
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.body.classList.remove('nav-open');
  });

  // Sección inicial
  showSection('archivo');
}

function showSection(name) {
  if (currentSection === name) return;

  // proteger formularios con cambios
  if (isDirty()) {
    if (!confirm('Hay cambios sin guardar, ¿quieres salir igualmente?')) return;
    dirtySnapshot = null;
  }

  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  const el = document.querySelector(`#${name}`);
  if (el) el.style.display = '';
  currentSection = name;

  if (name === 'ingresar') {
    const form = document.querySelector('#patientForm');
    if (form) dirtySnapshot = new FormData(form);
  }
}

function isDirty() {
  const form = document.querySelector('#patientForm');
  if (!form || !dirtySnapshot) return false;
  const now = new FormData(form);
  for (const [k, v] of dirtySnapshot.entries()) {
    if (now.get(k) !== v) return true;
  }
  return false;
}
