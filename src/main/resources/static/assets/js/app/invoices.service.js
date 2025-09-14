
;(() => {
  async function listInvoices(p = 0, s = 10) {
    return await window.InvoicesRepository.list({ page: p, size: s });
  }
  async function createInvoice(payload) {
    if (!payload?.pacienteId) throw new Error('Paciente es obligatorio');
    if (payload?.total == null) throw new Error('Total es obligatorio');
    return await window.InvoicesRepository.create(payload);
  }
  window.InvoicesService = { listInvoices, createInvoice };
})();
