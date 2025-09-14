
;(() => {
  const BASE = '/api/operatives';

  function withAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    // TODO: si usas JWT, agrega:
    // const token = localStorage.getItem('token');
    // if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async function list({ page = 0, size = 10 } = {}) {
    const res = await fetch(`${BASE}?page=${page}&size=${size}`, { headers: withAuthHeaders() });
    if (!res.ok) throw new Error('Error al listar operativos');
    return res.json();
  }

  async function create(data) {
    const res = await fetch(`${BASE}`, {
      method: 'POST',
      headers: withAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al crear operativo');
    return res.json();
  }

  window.OperativesRepository = { list, create };
})();
