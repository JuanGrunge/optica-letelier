
;(() => {
  const root = document.getElementById('operatives-view');
  if (!root) return;

  root.innerHTML = `
    <div class="card">
      <div class="card__header">
        <h2>Operativos</h2>
        <button class="btn" id="op-new">Nuevo operativo</button>
      </div>
      <div id="op-list"></div>
    </div>
  `;

  const listNode = root.querySelector('#op-list');
  const btnNew = root.querySelector('#op-new');

  async function refresh() {
    listNode.textContent = 'Cargando...';
    try {
      const page = await window.OperativesService.listOperatives(0, 50);
      listNode.innerHTML = renderTable(page?.content ?? page);
    } catch (e) {
      listNode.textContent = e.message || 'Error';
    }
  }

  function renderTable(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return '<p>No hay operativos.</p>';
    }
    const rows = items.map(o => `
      <tr>
        <td>${o.id ?? ''}</td>
        <td>${o.nombre ?? ''}</td>
        <td>${o.lugar ?? ''}</td>
        <td>${o.direccion ?? ''}</td>
        <td>${o.fecha ?? ''}</td>
        <td>${o.observaciones ?? ''}</td>
      </tr>
    `).join('');
    return `
      <table class="tbl">
        <thead><tr>
          <th>ID</th><th>Nombre</th><th>Lugar</th><th>Dirección</th><th>Fecha</th><th>Obs.</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  btnNew.addEventListener('click', async () => {
    const nombre = prompt('Nombre del operativo');
    if (!nombre) return;
    const lugar = prompt('Lugar (texto)');
    const direccion = prompt('Dirección');
    const fecha = prompt('Fecha (YYYY-MM-DD)');
    const observaciones = prompt('Observaciones');
    try {
      await window.OperativesService.createOperative({ nombre, lugar, direccion, fecha, observaciones });
      refresh();
    } catch (e) {
      alert(e.message || 'Error al crear');
    }
  });

  refresh();
})();
