
;(() => {
  const BASE = '/api/operatives';

  function withAuthHeaders() {
    // Conservado por compatibilidad; no se usa con ApiConfig
    const headers = { 'Content-Type': 'application/json' };
    return headers;
  }

  async function list({ page = 0, size = 10 } = {}) {
    return await window.ApiConfig.apiFetch(`${BASE}?page=${page}&size=${size}`);
  }

  async function create(data) {
    return await window.ApiConfig.apiFetch(`${BASE}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  window.OperativesRepository = { list, create };
  // Extensión: lugares únicos (para selector)
  async function places(){
    return await window.ApiConfig.apiFetch(`${BASE}/places`);
  }
  window.OperativesRepository.places = places;
})();
