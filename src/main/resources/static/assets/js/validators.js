// Minimal validators for UI formatting (backend validates definitively)
export function normalizarRut(str=''){ return (str+'').replace(/[.\-\s]/g,'').toUpperCase(); }
export function formatearRut(str=''){
  const s = normalizarRut(str);
  if(s.length <=1) return s;
  return s.slice(0,-1).replace(/\B(?=(\d{3})+(?!\d))/g,'.') + '-' + s.slice(-1);
}
export function parseDec(v){ const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n)? n : 0; }
export function roundQ(n, q=0.25){ return Math.round(n/q)*q; }
export function two(n){ return Number.isFinite(n)? n.toFixed(2) : '0.00'; }
export function fmtEje(n){
  let x = Math.round(parseDec(n));
  while(x<0) x+=180;
  while(x>180) x-=180;
  return x;
}
export function clampIntInRange(n, min, max){
  let x = Math.round(parseDec(n));
  if(x<min) x=min;
  if(x>max) x=max;
  return x;
}
export function formatCylRaw(n){ return roundQ(parseDec(n)); }
export function formatAddRaw(n){ return roundQ(parseDec(n)); }
export function esRutValido(str=''){
  const s = normalizarRut(str);
  if(!/^[0-9K]+$/.test(s) || s.length < 2) return false;
  const body = s.slice(0,-1), dv = s.slice(-1);
  let sum=0, m=2;
  for(let i=body.length-1;i>=0;i--){ sum += parseInt(body[i],10)*m; m = m===7?2:m+1; }
  const r = 11 - (sum % 11);
  const dvCalc = r===11?'0': r===10?'K': String(r);
  return dvCalc === dv;
}
export function validateRx(){ return true; }
