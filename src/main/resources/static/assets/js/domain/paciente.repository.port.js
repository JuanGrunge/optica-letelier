// assets/js/domain/paciente.repository.port.js
export class PacienteRepositoryPort{
  /** @returns {Promise<Array<Object>>} */ async getAll(){ throw new Error('not implemented'); }
  /** @param {Object} p */ async upsert(p){ throw new Error('not implemented'); }
  /** @param {string} rut */ async findByRut(rut){ throw new Error('not implemented'); }
  /** @param {string} rut */ async delete(rut){ throw new Error('not implemented'); }
  /** @param {Array<Object>} arr */ async replaceAll(arr){ throw new Error('not implemented'); }
}
