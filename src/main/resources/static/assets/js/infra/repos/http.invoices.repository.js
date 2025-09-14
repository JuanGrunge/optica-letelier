
;(() => {
  const BASE = '/api/invoices';

  function withAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    // const token = localStorage.getItem('token');
    // if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async function list({ page = 0, size = 10 } = {}) {
    const res = await fetch(`${BASE}?page=${page}&size=${size}`, { headers: withAuthHeaders() });
    if (!res.ok) throw new Error('Error al listar boletas');
    return res.json();
  }

  async function create(data) {
    const res = await fetch(`${BASE}`, {
      method: 'POST',
      headers: withAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al crear boleta');
    return res.json();
  }

  window.InvoicesRepository = { list, create };
})();
