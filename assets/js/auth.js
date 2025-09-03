const AUTH_KEY='sesion', USERS_KEY='usuarios';

function val(v){return (v??'').toString().trim();}
async function sha256Hex(text){
  const enc=new TextEncoder().encode(text);
  const buf=await crypto.subtle.digest('SHA-256',enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
function getUsers(){try{return JSON.parse(localStorage.getItem(USERS_KEY)||'[]')}catch{return[]}}
function findUser(u){return getUsers().find(x=>(x.username||'').toLowerCase()===String(u||'').toLowerCase());}
function setSession(s){localStorage.setItem(AUTH_KEY,JSON.stringify(s))}
export function getSession(){try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'null')}catch{return null}}
function clearSession(){localStorage.removeItem(AUTH_KEY)}

async function seedUsers(){
  if(localStorage.getItem(USERS_KEY)) return;
  const h=await sha256Hex('letelier25');
  localStorage.setItem(USERS_KEY, JSON.stringify([{username:'admin',passHash:h,role:'admin'}]));
}

export function requireAuth(){
  const s=getSession();
  const overlay=document.getElementById('loginOverlay');
  const badge=document.getElementById('userBadge');
  const logout=document.getElementById('btnLogout');

  if(!s){
    document.querySelectorAll('section').forEach(s=>s.classList.remove('active'));
    overlay?.classList.add('active');
    badge.hidden = true; logout.hidden = true;
    document.body.classList.add('no-session');
    localStorage.removeItem('lastSection');
    return false;
  }
  overlay?.classList.remove('active');
  if (badge){ badge.textContent=`${s.username} (${s.role||'usuario'})`; badge.hidden=false; }
  if (logout){ logout.hidden=false; }
  document.body.classList.remove('no-session');
  return true;
}

function showToast(t){const el=document.getElementById('toast'); if(!el) return; el.textContent=t; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2300);}

export function initAuth(){
  seedUsers();

  document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const u=val(document.getElementById('loginUser').value);
    const p=document.getElementById('loginPass').value;
    const m=document.getElementById('loginMsg');
    m.textContent='';

    const user=findUser(u);
    if(!user){ m.textContent='Usuario o contraseña inválidos.'; return; }
    const h=await sha256Hex(p);
    if(h!==user.passHash){ m.textContent='Usuario o contraseña inválidos.'; return; }

    setSession({username:user.username,role:user.role,at:new Date().toISOString()});
    document.getElementById('loginForm').reset();
    requireAuth();
    showToast('Sesión iniciada');
  });

  document.getElementById('btnLogout')?.addEventListener('click', () => {
    clearSession();
    requireAuth();
  });
}
