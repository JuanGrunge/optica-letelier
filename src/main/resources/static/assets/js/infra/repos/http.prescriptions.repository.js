
;(() => {
  const BASE = '/api/prescriptions';

  function withAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    // const token = localStorage.getItem('token');
    // if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async function listByPaciente({ pacienteId, page = 0, size = 10 } = {}) {
    const q = new URLSearchParams();
    if (pacienteId != null) q.set('pacienteId', pacienteId);
    q.set('page', page);
    q.set('size', size);
    const res = await fetch(`${BASE}?${q.toString()}`, { headers: withAuthHeaders(), credentials: 'include' });
    if (!res.ok) throw new Error('Error al listar recetas');
    return res.json();
  }

  async function create(data) {
    const res = await fetch(`${BASE}`, {
      method: 'POST',
      headers: withAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al crear receta');
    return res.json();
  }

  window.PrescriptionsRepository = { listByPaciente, create };
})();
