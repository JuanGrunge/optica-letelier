
;(() => {
  const root = document.getElementById('prescriptions-view');
  if (!root) return;

  root.innerHTML = `
    <div class="card">
      <div class="card__header">
        <h2>Recetas</h2>
        <div class="row">
          <input class="input" id="rx-paciente-id" placeholder="Paciente ID"/>
          <button class="btn" id="rx-search">Buscar</button>
          <button class="btn" id="rx-new">Nueva receta</button>
        </div>
      </div>
      <div id="rx-list"></div>
    </div>
  `;

  const listNode = root.querySelector('#rx-list');
  const btnNew = root.querySelector('#rx-new');
  const btnSearch = root.querySelector('#rx-search');
  const inputPaciente = root.querySelector('#rx-paciente-id');

  async function refresh() {
    const pid = inputPaciente.value ? Number(inputPaciente.value) : undefined;
    listNode.textContent = 'Cargando...';
    try {
      const page = await window.PrescriptionsService.listPrescriptionsByPaciente(pid, 0, 50);
      const items = page?.content ?? page;
      listNode.innerHTML = renderTable(items);
    } catch (e) {
      listNode.textContent = e.message || 'Error';
    }
  }

  function renderTable(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return '<p>No hay recetas para el criterio.</p>';
    }
    const fmt2 = (n) => (Number.isFinite(Number(n)) ? Number(n).toFixed(2) : '');
    const rows = items.map(r => `
      <tr>
        <td>${r.id ?? ''}</td>
        <td>${r.pacienteId ?? ''}</td>
        <td>OD ${r.od_esfera ?? r.odEsfera ?? ''}/${r.od_cilindro ?? r.odCilindro ?? ''}×${r.od_eje ?? r.odEje ?? ''}</td>
        <td>OI ${r.oi_esfera ?? r.oiEsfera ?? ''}/${r.oi_cilindro ?? r.oiCilindro ?? ''}×${r.oi_eje ?? r.oiEje ?? ''}</td>
        <td>${r.add_power ?? r.addPower ?? ''}</td>
        <td>${r.observaciones ?? ''}</td>
        <td>${r.fecha ?? ''}</td>
      </tr>
    `).join('');
    return `
      <table class="tbl">
        <thead><tr>
          <th>ID</th><th>Paciente</th><th>OD</th><th>OI</th><th>ADD</th><th>Obs.</th><th>Fecha</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  btnSearch.addEventListener('click', refresh);

  btnNew.addEventListener('click', async () => {
    const pacienteId = prompt('Paciente ID');
    if (!pacienteId) return;
    const odEsfera = prompt('OD Esfera');
    const odCilindro = prompt('OD Cilindro');
    const odEje = prompt('OD Eje');
    const oiEsfera = prompt('OI Esfera');
    const oiCilindro = prompt('OI Cilindro');
    const oiEje = prompt('OI Eje');
    const addPower = prompt('ADD (opcional)');
    const observaciones = prompt('Observaciones');
    const fecha = prompt('Fecha (YYYY-MM-DD)');
    try {
      await window.PrescriptionsService.createPrescription({
        pacienteId: Number(pacienteId),
        odEsfera: parseFloat(odEsfera), odCilindro: parseFloat(odCilindro), odEje: parseFloat(odEje),
        oiEsfera: parseFloat(oiEsfera), oiCilindro: parseFloat(oiCilindro), oiEje: parseFloat(oiEje),
        addPower: addPower ? parseFloat(addPower) : null,
        observaciones, fecha
      });
      refresh();
    } catch (e) {
      alert(e.message || 'Error al crear receta');
    }
  });

  refresh();
})();
