(function(global){
  const baseUrl = '/api/patients';
  async function handle(res){
    if(!res.ok){
      const t = await res.text().catch(()=>'');
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${t}`);
    }
    if(res.status === 204) return null;
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : res.text();
  }
  async function list(params={}){
    const q = new URLSearchParams(params).toString();
    return await window.ApiConfig.apiFetch(`${baseUrl}${q?`?${q}`:''}`);
  }
  async function getById(id){
    return await window.ApiConfig.apiFetch(`${baseUrl}/${encodeURIComponent(id)}`);
  }
  async function create(payload){
    return await window.ApiConfig.apiFetch(baseUrl, {
      method:'POST',
      body: JSON.stringify(payload)
    });
  }
  async function update(id, payload){
    return await window.ApiConfig.apiFetch(`${baseUrl}/${encodeURIComponent(id)}`, {
      method:'PUT',
      body: JSON.stringify(payload)
    });
  }
  async function remove(id){
    return await window.ApiConfig.apiFetch(`${baseUrl}/${encodeURIComponent(id)}`, {
      method:'DELETE'
    });
  }
  async function count(){
    const data = await window.ApiConfig.apiFetch(`${baseUrl}/count`);
    return (data && typeof data.total==='number') ? data.total : null;
  }
  global.PatientsRepo = Object.freeze({ list, getById, create, update, remove, count });
})(window);
