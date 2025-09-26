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

// Same as apiFetch, but if backend returns 401 we redirect to /login preserving intent.
export async function apiFetchAuth(url, options={}){
  try {
    return await apiFetch(url, options);
  } catch (e) {
    if (e && Number(e.status) === 401) {
      const here = window.location.pathname + window.location.search + window.location.hash;
      const target = '/login?reason=expired&redirect=' + encodeURIComponent(here);
      // Prefer SPA navigation if router is available, otherwise hard redirect.
      try {
        // Lazy import to avoid hard coupling/cycles if possible.
        const mod = await import('@/router/index.js');
        const router = mod.default;
        if (router?.currentRoute?.value?.name !== 'login') {
          router.push(target);
        }
      } catch {
        if (!window.location.pathname.startsWith('/login')) {
          window.location.assign(target);
        }
      }
    }
    throw e;
  }
}
