;(() => {
  // Oculta zonas protegidas hasta que Auth inicialice
  document.documentElement.classList.add('js');
  document.body.classList.add('preboot');
  const hideProtected = () => {
    document.querySelectorAll('[data-auth="protected"]').forEach(n => n.setAttribute('hidden',''));
    document.querySelectorAll('.view').forEach(v => v.setAttribute('aria-hidden','true'));
    const login = document.getElementById('loginOverlay');
    if (login) login.removeAttribute('hidden');
  };
  hideProtected();
})();
