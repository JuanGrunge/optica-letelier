// Orchestrates calls from UI to repository
export async function fetchPatients(params = {}) {
  return window.PatientsRepo.list(params);
}
export async function fetchPatient(id) {
  return window.PatientsRepo.getById(id);
}
export async function savePatient(dto) {
  if (dto && dto.id) return window.PatientsRepo.update(dto.id, dto);
  return window.PatientsRepo.create(dto);
}
export async function deletePatient(id) {
  return window.PatientsRepo.remove(id);
}
