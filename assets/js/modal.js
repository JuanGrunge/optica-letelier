export function initModal(){
  const overlay = document.getElementById('editModal');
  const form    = document.getElementById('editForm');
  const cancel  = document.getElementById('btnCancelEdit');

  if (!overlay || !form) return;

  function close(){
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Aquí iría la lógica real de guardado desde modal (puedes expandirla luego).
    close();
  });

  cancel?.addEventListener('click', close);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // Hook simple para abrir desde tarjetas
  window.addEventListener('open-edit-modal', (e) => {
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
  });
}
