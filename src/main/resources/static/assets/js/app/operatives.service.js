
;(() => {
  async function listOperatives(p = 0, s = 10) {
    return await window.OperativesRepository.list({ page: p, size: s });
  }
  async function createOperative(payload) {
    // Validación mínima
    if (!payload?.nombre) throw new Error('Nombre es obligatorio');
    return await window.OperativesRepository.create(payload);
  }
  window.OperativesService = { listOperatives, createOperative };
})();
