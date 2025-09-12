// assets/js/infra/repos/localstorage.paciente.repository.js
import { leerPacientes, guardarPacientes } from '../../storage.js';
import { PacienteRepositoryPort } from '../../domain/paciente.repository.port.js';

export class LocalStoragePacienteRepository extends PacienteRepositoryPort {
  async getAll(){ return leerPacientes() || []; }
  async findByRut(rut){
    const all = await this.getAll();
    const norm = (s)=> (s||'').replace(/[^\dkK]/g,'').toUpperCase();
    const t = norm(rut);
    return all.find(p => norm(p?.rut) === t) || null;
  }
  async upsert(paciente){
    const all = await this.getAll();
    const norm = (s)=> (s||'').replace(/[^\dkK]/g,'').toUpperCase();
    const t = norm(paciente?.rut);
    const i = all.findIndex(p => norm(p?.rut) === t);
    if(i>=0) all[i] = { ...all[i], ...paciente };
    else all.push(paciente);
    guardarPacientes(all);
    return paciente;
  }
  async delete(rut){
    const all = await this.getAll();
    const norm = (s)=> (s||'').replace(/[^\dkK]/g,'').toUpperCase();
    const t = norm(rut);
    const filtered = all.filter(p => norm(p?.rut) !== t);
    guardarPacientes(filtered);
    return true;
  }
  async replaceAll(arr){
    guardarPacientes(Array.isArray(arr)? arr : []);
    return true;
  }
}
