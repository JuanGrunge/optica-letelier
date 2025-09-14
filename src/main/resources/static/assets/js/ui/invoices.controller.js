
;(() => {
  const root = document.getElementById('invoices-view');
  if (!root) return;

  root.innerHTML = `
    <div class="card">
      <div class="card__header">
        <h2>Boletas</h2>
        <button class="btn" id="inv-new">Nueva boleta</button>
      </div>
      <div id="inv-list"></div>
    </div>
  `;

  const listNode = root.querySelector('#inv-list');
  const btnNew = root.querySelector('#inv-new');

  async function refresh() {
    listNode.textContent = 'Cargando...';
    try {
      const page = await window.InvoicesService.listInvoices(0, 50);
      listNode.innerHTML = renderTable(page?.content ?? page);
    } catch (e) {
      listNode.textContent = e.message || 'Error';
    }
  }

  function renderTable(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return '<p>No hay boletas.</p>';
    }
    const rows = items.map(b => `
      <tr>
        <td>${b.id ?? ''}</td>
        <td>${b.pacienteId ?? ''}</td>
        <td>${b.detalle ?? ''}</td>
        <td>${b.total ?? ''}</td>
        <td>${b.fecha ?? ''}</td>
        <td>${b.anulado ? 'Sí' : 'No'}</td>
      </tr>
    `).join('');
    return `
      <table class="tbl">
        <thead><tr>
          <th>ID</th><th>Paciente</th><th>Detalle</th><th>Total</th><th>Fecha</th><th>Anulado</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  btnNew.addEventListener('click', async () => {
    const pacienteId = prompt('Paciente ID');
    if (!pacienteId) return;
    const detalle = prompt('Detalle');
    const total = prompt('Total ($)');
    const fecha = prompt('Fecha (YYYY-MM-DD)');
    try {
      await window.InvoicesService.createInvoice({
        pacienteId: Number(pacienteId),
        detalle,
        total: Number(total),
        fecha
      });
      refresh();
    } catch (e) {
      alert(e.message || 'Error al crear boleta');
    }
  });

  refresh();
})();
