const LS_KEY='pacientes';
export function leerPacientes(){try{ return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); } catch { return []; }}
export function guardarPacientes(arr){ localStorage.setItem(LS_KEY, JSON.stringify(arr)); }
