// assets/js/app/paciente.service.js
import { LocalStoragePacienteRepository } from '../infra/repos/localstorage.paciente.repository.js';
import * as validators from '../validators.js';

const repo = new LocalStoragePacienteRepository();

export const PacienteService = {
  async all(){ return repo.getAll(); },
  async byRut(rut){ return repo.findByRut(rut); },
  async save(paciente){
    // Validaciones mínimas (no intrusivas): RUT, nombre opcional según tus reglas actuales
    // Mantengo tu flujo: si falla, que lo maneje la capa UI como hasta ahora.
    return repo.upsert(paciente);
  },
  async remove(rut){ return repo.delete(rut); },
  async replaceAll(arr){ return repo.replaceAll(arr); },
};
