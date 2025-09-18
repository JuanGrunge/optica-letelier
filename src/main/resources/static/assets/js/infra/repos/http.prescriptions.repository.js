
;(() => {
  const BASE = '/api/prescriptions';

  function withAuthHeaders() {
    // Conservado por compatibilidad; no se usa con ApiConfig
    const headers = { 'Content-Type': 'application/json' };
    return headers;
  }

  async function listByPaciente({ pacienteId, page = 0, size = 10 } = {}) {
    const q = new URLSearchParams();
    if (pacienteId != null) q.set('pacienteId', pacienteId);
    q.set('page', page);
    q.set('size', size);
    return await window.ApiConfig.apiFetch(`${BASE}?${q.toString()}`);
  }

  async function create(data) {
    return await window.ApiConfig.apiFetch(`${BASE}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  window.PrescriptionsRepository = { listByPaciente, create };
})();
