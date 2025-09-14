
// assets/js/services/auth.service.js
const JSON_HEADERS = { 'Content-Type': 'application/json' };
const WITH_CREDENTIALS = { credentials: 'include' };

export async function login(username, password){
  const resp = await fetch('/api/auth/login', {
    method: 'POST',
    headers: JSON_HEADERS,
    credentials: 'include',
    body: JSON.stringify({username, password})
  });
  if (!resp.ok) throw new Error(resp.status===401?'Credenciales inválidas':'Error de login');
  return await resp.json();
}

export async function me(){
  const resp = await fetch('/api/auth/me', { credentials: 'include' });
  if (resp.status===401) return null;
  if (!resp.ok) throw new Error('Error al verificar sesión');
  return await resp.json();
}

export async function logout(){
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}
