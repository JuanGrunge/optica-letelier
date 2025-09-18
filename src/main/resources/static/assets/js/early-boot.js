;(() => {
  // Estado inicial mínimo: ocultar zonas protegidas; mostrar login si corresponde.
  document.documentElement.classList.add('js');
  // No preboot gating; keep UI interactive and let auth.js toggle visibility
  const hideProtected = () => {
    document.querySelectorAll('[data-auth="protected"]').forEach(n => n.setAttribute('hidden',''));
    document.querySelectorAll('.view').forEach(v => v.setAttribute('aria-hidden','true'));
    const login = document.getElementById('loginOverlay');
    if (login) login.removeAttribute('hidden');
    // Si quedó algún bootScreen previo, retirarlo por seguridad
    const stale = document.getElementById('bootScreen');
    if (stale) stale.remove();
  };
  hideProtected();
})();
