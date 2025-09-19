import { roundQ, clampIntInRange } from './validators.js';

export function normalizeMinusTriple(esf, cil, eje){
  let E = toNumOrNull(esf), C = toNumOrNull(cil), A = toIntOrNull(eje);
  if (C == null || Math.abs(C) === 0){
    return { esf: roundQ(E ?? 0), cil: 0, eje: null };
  }
  if (C > 0){
    E = (E ?? 0) + C;
    C = -C;
    if (A != null) A = A + 90;
  }
  E = roundQ(E ?? 0);
  C = roundQ(C);
  if (A != null){ A = clampIntInRange(A, 0, 180); }
  return { esf: E, cil: C, eje: A };
}

export function normalizeRxPayload(rx){
  if (!rx || typeof rx !== 'object') return rx;
  const od = normalizeMinusTriple(rx.odEsfera, rx.odCilindro, rx.odEje);
  const oi = normalizeMinusTriple(rx.oiEsfera, rx.oiCilindro, rx.oiEje);
  return {
    odEsfera: od.esf, odCilindro: od.cil, odEje: od.eje,
    oiEsfera: oi.esf, oiCilindro: oi.cil, oiEje: oi.eje,
    addPower: toNumOrNull(rx.addPower),
    observaciones: rx.observaciones || ''
  };
}

function toNumOrNull(v){ if (v == null || v === '') return null; const n = Number(v); return Number.isFinite(n) ? n : null; }
function toIntOrNull(v){ if (v == null || v === '') return null; const n = parseInt(v,10); return Number.isFinite(n) ? n : null; }
