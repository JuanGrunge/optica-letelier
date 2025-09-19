export async function apiFetch(url, options={}){
  const resp = await fetch(url, { credentials: 'include', ...options });
  if (!resp.ok){
    const t = await resp.text().catch(()=> '');
    const err = new Error(`HTTP ${resp.status} ${resp.statusText}: ${t}`);
    err.status = resp.status; throw err;
  }
  const ct = resp.headers.get('content-type')||'';
  return ct.includes('application/json') ? resp.json() : resp.text();
}

