/**
 * early-boot.js
 * Aplica el tema (dark/light) ANTES de que cargue el CSS para evitar FOUC.
 * - Lee localStorage.theme si existe; si no, usa prefers-color-scheme.
 * - Setea data-theme en <html> y .dark en <body>.
 * - Añade .preboot para desactivar transiciones iniciales si tu CSS lo usa.
 */
(function () {
  try {
    var d = document;
    var root = d.documentElement;
    var body = d.body;
    // Evita transiciones/animaciones durante boot si tu CSS lo define
    if (body && !body.classList.contains('preboot')) body.classList.add('preboot');

    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch(e){}
    var systemDark = false;
    try {
      systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch(e){}

    var theme = saved || (systemDark ? 'dark' : 'light');
    // aplica
    root.setAttribute('data-theme', theme);
    if (body) body.classList.toggle('dark', theme === 'dark');
  } catch (e) {
    // silencioso
  }
})();