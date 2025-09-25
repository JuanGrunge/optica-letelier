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

export async function setActive(id, active){
  const body = JSON.stringify({ active: !!active });
  return await apiFetch(`/api/operatives/${encodeURIComponent(id)}/active`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body });
}
