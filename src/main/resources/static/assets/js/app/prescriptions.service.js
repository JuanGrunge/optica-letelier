
;(() => {
  async function listPrescriptionsByPaciente(pacienteId, p = 0, s = 10) {
    return await window.PrescriptionsRepository.listByPaciente({ pacienteId, page: p, size: s });
  }
  async function createPrescription(payload) {
    if (!payload?.pacienteId) throw new Error('Paciente es obligatorio');
    return await window.PrescriptionsRepository.create(payload);
  }
  window.PrescriptionsService = { listPrescriptionsByPaciente, createPrescription };
})();
