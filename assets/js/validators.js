// RUT
export function normalizarRut(s){return (s||'').replace(/[.\s-]/g,'').toUpperCase()}
export function separarRut(r){const m=normalizarRut(r).match(/^(\d+)-?([\dkK])$/); return m?{num:m[1],dv:m[2].toUpperCase()}:null}
export function calcularDV(num){let s=0,m=2; for(let i=num.length-1;i>=0;i--){s+=parseInt(num[i],10)*m; m=(m===7)?2:m+1;} const r=11-(s%11); return r===11?'0':r===10?'K':String(r)}
export function esRutValido(str){const p=separarRut(str); return !!p && calcularDV(p.num)===p.dv}
export function formatearRut(str){const p=separarRut(str); if(!p) return str; const num=p.num.replace(/\B(?=(\d{3})+(?!\d))/g,'.'); return `${num}-${p.dv}`}

// Números clínicos
const roundQuarter=n=>Math.round(n*4)/4;
const twoDec=n=>Number(n).toFixed(2);
export function parseDec(s){if(s===undefined||s===null) return null; const x=String(s).replace(',','.').trim(); if(!x) return null; const n=Number(x.replace(/[^\d.\-+]/g,'')); return Number.isFinite(n)?n:null;}
export function formatSph(n){if(n==null||n==='') return '—'; const v=Number(n); return (v>=0?'+':'')+twoDec(v);}
export function formatCylRaw(n){if(n==null||n==='') return null; const v=-Math.abs(Number(n)); return Number.isFinite(v)?v:null;}
export function formatAddRaw(n){if(n==null||n==='') return null; const v=Math.abs(Number(n)); return Number.isFinite(v)?v:null;}
export function fmtEje(v){if(v==null||v==='') return '—'; return `${v}°`;}
export function clampIntInRange(n,min,max){const x=Math.round(Number(n)); if(!Number.isFinite(x)) return null; return Math.min(max,Math.max(min,x));}
export function roundQ(n){return roundQuarter(n)}
export function two(n){return twoDec(n)}
