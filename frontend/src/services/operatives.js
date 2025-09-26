import { apiFetchAuth as apiFetch } from './shared.js';

export async function listActive({ page=0, size=20 }={}){
  const q = new URLSearchParams({ page, size, active: 'true' }).toString();
  return await apiFetch(`/api/operatives?${q}`);
}

export async function countActive(){
  const page = await listActive({ page: 0, size: 1 });
  const total = (typeof page?.totalElements === 'number') ? page.totalElements : (Array.isArray(page)?.length || 0);
  return total || 0;
}

export async function listAll({ page=0, size=5 }={}){
  const q = new URLSearchParams({ page, size }).toString();
  return await apiFetch(`/api/operatives?${q}`);
}

export async function setActive(id, active, opts={}){
  const body = JSON.stringify({ active: !!active });
  const force = opts?.force ? '?force=true' : '';
  return await apiFetch(`/api/operatives/${encodeURIComponent(id)}/active${force}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body });
}

export async function create(dto){
  return await apiFetch(`/api/operatives`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto)
  });
}

export async function getById(id){
  return await apiFetch(`/api/operatives/${encodeURIComponent(id)}`);
}

export async function listPatients(operativeId, { page=0, size=10 }={}){
  const q = new URLSearchParams({ page, size }).toString();
  return await apiFetch(`/api/operatives/${encodeURIComponent(operativeId)}/patients?${q}`);
}
