import { normalizarRut, esRutValido } from './validators.js';

export function initModal(){
  const overlay = document.getElementById('editModal');
  const form    = document.getElementById('editForm');
  const cancel  = document.getElementById('btnCancelEdit');

  if (!overlay || !form) return;

  function open(){
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
  }
  function close(){
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  }

  // Submit => actualizar paciente existente por RUT
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const g = (id) => document.getElementById(id);
    const num = (id) => {
      const v = (g(id)?.value || '').trim();
      if (v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const rutRaw = (g('mRut')?.value || '').trim();
    if (!rutRaw) { alert('RUT es requerido'); return; }
    if (!esRutValido(rutRaw)) { alert('RUT inválido'); return; }
    const rutKey = normalizarRut(rutRaw);

    const pacientes = leerPacientes();
    const idx = pacientes.findIndex(p => normalizarRut(p.rut||'') === rutKey);
    if (idx === -1) { alert('Paciente no encontrado'); return; }

    const base = pacientes[idx];
    const updated = {
      ...base,
      rut: rutRaw,
      nombre: (g('mNombre')?.value || '').trim(),
      direccion: (g('mDireccion')?.value || '').trim(),
      operativo: (g('mOperativo')?.value || '').trim(),
      fechaNac: (g('mFechaNac')?.value || null),
      receta: {
        od: { esf: num('mOdEsf'), cil: num('mOdCil'), eje: num('mOdEje'), add: num('mOdAdd'), alt: num('mOdALT'), dp: num('mOdDP') },
        oi: { esf: num('mOiEsf'), cil: num('mOiCil'), eje: num('mOiEje'), add: num('mOiAdd'), alt: num('mOiALT'), dp: num('mOiDP') },
        dpCerca: (document.getElementById('mDpCercaToggle')?.checked ? num('mDpCerca') : null)
      },
      actualizadoEn: new Date().toISOString()
    };

    pacientes[idx] = updated;
    guardarPacientes(pacientes);

    document.dispatchEvent(new CustomEvent('pacienteActualizado', { detail: { rut: updated.rut } }));

    const toast = document.getElementById('toast');
    if (toast){ toast.textContent='Cambios guardados'; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'), 1800); }

    close();
  });

  // Cerrar con botón y clic fuera
  cancel?.addEventListener('click', (e)=>{ e.preventDefault(); close(); });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  // Abrir desde otros módulos
  window.addEventListener('open-edit-modal', () => open());
}
