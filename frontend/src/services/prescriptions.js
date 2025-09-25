import { apiFetchAuth as apiFetch } from './shared.js';

export async function listByPaciente({ pacienteId, page=0, size=10 }={}){
  const q = new URLSearchParams();
  if (pacienteId != null) q.set('pacienteId', pacienteId);
  q.set('page', page); q.set('size', size);
  return await apiFetch(`/api/prescriptions?${q.toString()}`);
}
export async function create(dto){
  return await apiFetch(`/api/prescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto)
  });
}
