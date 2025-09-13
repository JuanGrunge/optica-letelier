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
    return handle(await fetch(`${baseUrl}${q?`?${q}`:''}`, { credentials:'include' }));
  }
  async function getById(id){
    return handle(await fetch(`${baseUrl}/${encodeURIComponent(id)}`, { credentials:'include' }));
  }
  async function create(payload){
    return handle(await fetch(baseUrl, {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify(payload)
    }));
  }
  async function update(id, payload){
    return handle(await fetch(`${baseUrl}/${encodeURIComponent(id)}`, {
      method:'PUT', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify(payload)
    }));
  }
  async function remove(id){
    return handle(await fetch(`${baseUrl}/${encodeURIComponent(id)}`, {
      method:'DELETE', credentials:'include'
    }));
  }
  global.PatientsRepo = Object.freeze({ list, getById, create, update, remove });
})(window);
