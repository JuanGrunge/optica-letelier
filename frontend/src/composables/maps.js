export function buildQuery(address, comuna){
  const parts = [];
  if (address) parts.push(address);
  if (comuna) parts.push(comuna);
  parts.push('Chile');
  return encodeURIComponent(parts.join(', '));
}

export function isAndroid(){
  return /Android/i.test(navigator.userAgent || '');
}
export function isIOS(){
  return /iPhone|iPad|iPod/i.test(navigator.userAgent || '');
}

export function linkForAndroid(address, comuna){
  return `geo:0,0?q=${buildQuery(address, comuna)}`;
}
export function linkForDesktop(address, comuna){
  return `https://www.google.com/maps/search/?api=1&query=${buildQuery(address, comuna)}`;
}

export function linksForIOS(address, comuna){
  const q = buildQuery(address, comuna);
  return [
    { label: 'Apple Maps', href: `maps://?q=${q}` },
    { label: 'Google Maps', href: `comgooglemaps://?q=${q}` },
    { label: 'Waze', href: `waze://?q=${q}` },
  ];
}

// Preferencia iOS (opcional): 'apple' | 'google' | 'waze'
const IOS_PREF_KEY = 'iosMapPref';
export function getIosMapPreference(){
  try { return localStorage.getItem(IOS_PREF_KEY) || 'apple'; } catch { return 'apple'; }
}
export function setIosMapPreference(pref){
  try { localStorage.setItem(IOS_PREF_KEY, pref); } catch {}
}

export function linkForIOS(address, comuna){
  const q = buildQuery(address, comuna);
  const pref = getIosMapPreference();
  if (pref === 'google') return `comgooglemaps://?q=${q}`;
  if (pref === 'waze') return `waze://?q=${q}`;
  // Por defecto Apple Maps (abre la app nativa)
  return `maps://?q=${q}`;
}
