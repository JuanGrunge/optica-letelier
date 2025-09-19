// Reimplementa validadores usados en la versión vanilla
export function normalizarRut(str = ''){ return String(str).replace(/[.\-\s]/g,'').toUpperCase(); }
export function formatearRut(str = ''){
  const s = normalizarRut(str);
  if (s.length <= 1) return s;
  return s.slice(0,-1).replace(/\B(?=(\d{3})+(?!\d))/g,'.') + '-' + s.slice(-1);
}
export function parseDec(v){ const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n)? n : 0; }
export function roundQ(n, q=0.25){ return Math.round(n/q)*q; }
export function clampIntInRange(n, min, max){
  let x = Math.round(parseDec(n));
  if (x < min) x = min; if (x > max) x = max; return x;
}
export function esRutValido(str = ''){
  const s = normalizarRut(str);
  if (!/^[0-9K]+$/.test(s) || s.length < 2) return false;
  const body = s.slice(0,-1), dv = s.slice(-1);
  let sum = 0, m = 2;
  for (let i = body.length - 1; i >= 0; i--){ sum += parseInt(body[i],10) * m; m = m === 7 ? 2 : m + 1; }
  const r = 11 - (sum % 11);
  const dvCalc = r === 11 ? '0' : r === 10 ? 'K' : String(r);
  return dvCalc === dv;
}

