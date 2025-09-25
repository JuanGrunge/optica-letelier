import { apiFetchAuth as apiFetch } from './shared.js';

export async function list(params={}){
  const q = new URLSearchParams(params).toString();
  return await apiFetch(`/api/patients${q?`?${q}`:''}`);
}
export async function getById(id){
  return await apiFetch(`/api/patients/${encodeURIComponent(id)}`);
}
export async function count(){
  const data = await apiFetch(`/api/patients/count`);
  return (data && typeof data.total === 'number') ? data.total : null;
}
export async function create(dto){
  return await apiFetch(`/api/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto)
  });
}
export async function update(id, dto){
  return await apiFetch(`/api/patients/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto)
  });
}
