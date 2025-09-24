import { roundQ, clampIntInRange } from './validators.js';

// Rangos clínicos sugeridos (ajustables si fuese necesario)
export const RX_LIMITS = Object.freeze({
  ESF: { min: -20, max: 20, step: 0.25, decimals: 2, showSign: true },
  CIL: { min: -6,  max: 6,  step: 0.25, decimals: 2, showSign: true }, // Se normaliza a negativo al guardar
  EJE: { min: 0,   max: 180, step: 1,    decimals: 0, showSign: false },
  ADD: { min: 0,   max: 3.5, step: 0.25, decimals: 2, showSign: true }
});

export function normalizeMinusTriple(esf, cil, eje){
  let E = toNumOrNull(esf), C = toNumOrNull(cil), A = toIntOrNull(eje);
  if (C == null || Math.abs(C) === 0){
    return { esf: roundQ(E ?? 0), cil: 0, eje: null };
  }
  if (C > 0){
    E = (E ?? 0) + C;
    C = -C;
    if (A != null) {
      A = (A + 90) % 180;
      if (A === 0) A = 180; // mantener convención 0..180
    }
  }
  E = roundQ(E ?? 0);
  C = roundQ(C);
  if (A != null){ A = clampIntInRange(A, 0, 180); }
  return { esf: E, cil: C, eje: A };
}

// Guardado ético: no normaliza signo. Solo valida rangos y cuantiza al paso.
export function normalizeRxPayload(rx){
  if (!rx || typeof rx !== 'object') return rx;
  const qNum = (v, step, decimals, min, max) => {
    const n = toNumOrNull(v);
    if (n == null) return null;
    const q = Number(roundQ(n, step).toFixed(Math.max(0, decimals)));
    if (q < min) return min; if (q > max) return max; return q;
  };
  const odEsfera = qNum(rx.odEsfera, RX_LIMITS.ESF.step, RX_LIMITS.ESF.decimals, RX_LIMITS.ESF.min, RX_LIMITS.ESF.max);
  const odCilindro = qNum(rx.odCilindro, RX_LIMITS.CIL.step, RX_LIMITS.CIL.decimals, RX_LIMITS.CIL.min, RX_LIMITS.CIL.max);
  const oiEsfera = qNum(rx.oiEsfera, RX_LIMITS.ESF.step, RX_LIMITS.ESF.decimals, RX_LIMITS.ESF.min, RX_LIMITS.ESF.max);
  const oiCilindro = qNum(rx.oiCilindro, RX_LIMITS.CIL.step, RX_LIMITS.CIL.decimals, RX_LIMITS.CIL.min, RX_LIMITS.CIL.max);
  let odEje = toIntOrNull(rx.odEje); if (odEje != null) odEje = clampIntInRange(odEje, RX_LIMITS.EJE.min, RX_LIMITS.EJE.max);
  let oiEje = toIntOrNull(rx.oiEje); if (oiEje != null) oiEje = clampIntInRange(oiEje, RX_LIMITS.EJE.min, RX_LIMITS.EJE.max);
  const addPower = qNum(rx.addPower, RX_LIMITS.ADD.step, RX_LIMITS.ADD.decimals, RX_LIMITS.ADD.min, RX_LIMITS.ADD.max);
  return {
    odEsfera, odCilindro, odEje,
    oiEsfera, oiCilindro, oiEje,
    addPower,
    observaciones: rx.observaciones || ''
  };
}

function toNumOrNull(v){ if (v == null || v === '') return null; const n = Number(v); return Number.isFinite(n) ? n : null; }
function toIntOrNull(v){ if (v == null || v === '') return null; const n = parseInt(v,10); return Number.isFinite(n) ? n : null; }
