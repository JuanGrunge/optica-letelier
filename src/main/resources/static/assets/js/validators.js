// assets/js/validators.js — versión estable y clínica (sin dependencias externas)

// ------------------------ RUT ------------------------
export function normalizarRut(s){ return (s||'').replace(/[.\s-]/g,'').toUpperCase(); }
export function separarRut(r){
  const m = normalizarRut(r).match(/^(\d+)-?([\dkK])$/);
  return m ? { num: m[1], dv: m[2].toUpperCase() } : null;
}
export function calcularDV(num){
  let s=0,m=2;
  for(let i=num.length-1;i>=0;i--){ s += Number(num[i]) * m; m = (m===7)?2:m+1; }
  const r = 11-(s%11);
  return r===11?'0': r===10?'K': String(r);
}
export function esRutValido(str){ const p=separarRut(str); return !!p && calcularDV(p.num)===p.dv; }
export function formatearRut(str){
  const p=separarRut(str); if(!p) return (str||'');
  const num = p.num.replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  return `${num}-${p.dv}`;
}

// ------------------------ Números clínicos ------------------------
export function parseDec(s){
  if(s===undefined||s===null) return null;
  const x=String(s).trim(); if(x==='') return null;
  const n=Number(x.replace(/[^\d.\-+]/g,''));
  return Number.isFinite(n)?n:null;
}
export const roundQ = (n)=> Math.round(Number(n)*4)/4;      // redondeo a 0.25
export const two    = (n)=> Number(n).toFixed(2);
export function fmtEje(n){ if(n==null||n==='') return '—'; const v=parseInt(n,10); if(!Number.isFinite(v)) return '—'; return String(v).padStart(3,'0'); }
export function clampIntInRange(n,min,max){
  if(n==null||n==='') return null; const v=parseInt(n,10);
  if(!Number.isFinite(v)) return null; return Math.max(min, Math.min(max, v));
}
export function formatCylRaw(n){ if(n==null||n==='') return null; const v=-Math.abs(Number(n)); return Number.isFinite(v)? v : null; }
export function formatAddRaw(n){ if(n==null||n==='') return null; const v= Math.abs(Number(n)); return Number.isFinite(v)? v : null; }

// ------------------------ Validación clínica ------------------------
function msgBox(prefix){ return document.getElementById((prefix||'') + 'rxMsg'); }
function showMsgs(prefix, hard, soft){
  const box = msgBox(prefix); if (!box) return;
  const hardHtml = hard.map(m=>`<div class="msg error">${m}</div>`).join('');
  const softHtml = soft.map(m=>`<div class="msg warn">${m}</div>`).join('');
  box.innerHTML = hardHtml + softHtml;
  const has = (hard.length+soft.length)>0;
  box.classList.toggle('hidden', !has);
  try { box.style.display = has ? '' : 'none'; } catch {}
}

export function validateRx(prefix='', form){
  const hard=[], soft=[];
  const g=(id)=> document.getElementById((prefix||'')+id);
  const dec=(id)=> parseDec(g(id)?.value);

  const od = { esf: dec('odEsf'), cil: dec('odCil'), eje: (g('odEje')?.value===''? null : parseDec(g('odEje')?.value)), dp: dec('odDP'), add: dec('odAdd') };
  const oi = { esf: dec('oiEsf'), cil: dec('oiCil'), eje: (g('oiEje')?.value===''? null : parseDec(g('oiEje')?.value)), dp: dec('oiDP'), add: dec('oiAdd') };
  const dpCercaOn = !!g('dpCercaToggle')?.checked;
  const dpCerca = dec('dpCerca');

  function checkEye(x, name){
    if (x.cil==null || Math.abs(x.cil)===0){
      if (x.eje!=null) hard.push(`Eje ${name} no permitido sin cilindro.`);
    } else {
      const ejeI = clampIntInRange(x.eje, 0, 180);
      if (x.eje==null) hard.push(`Falta eje en ${name} (hay cilindro).`);
      else if (ejeI===null || ejeI!=x.eje || x.eje<0 || x.eje>180) hard.push(`Eje ${name} debe estar entre 0 y 180.`);
    }
    if (x.add!=null && x.add<0) soft.push(`ADD ${name} negativa, revise (≥ 0).`);
  }
  checkEye(od,'OD'); checkEye(oi,'OI');

  const checkDP = (v, name)=>{ if (v!=null && (v<20 || v>45)) soft.push(`DP ${name} fuera de rango típico (20–45).`); };
  checkDP(od.dp,'OD'); checkDP(oi.dp,'OI');

  if (dpCercaOn && dpCerca!=null && od.dp!=null && oi.dp!=null){
    const lejos = od.dp + oi.dp;
    if (dpCerca > lejos) soft.push('DP cerca mayor a DP lejos. Revise.');
    if (lejos - dpCerca > 8) soft.push('Diferencia DP lejos/cerca superior a lo esperado.');
  }

  showMsgs(prefix, hard, soft);
  if (hard.length){
    alert('Errores en la receta:\n- ' + hard.join('\n- '));
    return false;
  }
  if (soft.length){
    alert('Advertencias en la receta:\n- ' + soft.join('\n- '));
  }
  return true;
}
