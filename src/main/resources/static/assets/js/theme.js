// assets/js/theme.js
// Sincroniza con early-boot.js: usa <html data-theme="..."> y clase .dark en <body>.
export function initTheme(){
  const toggle = document.getElementById('darkModeToggle');
  const root = document.documentElement;
  const body = document.body;
  const KEY = 'theme';

  function apply(theme){
    const isDark = theme === 'dark';
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (body) body.classList.toggle('dark', isDark);
    if (toggle) toggle.checked = isDark;
  }

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch {}
  if (saved === 'dark' || saved === 'light') {
    apply(saved);
  } else {
    const prefers = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    apply(prefers ? 'dark' : 'light');
  }

  if (!toggle) return;
  toggle.addEventListener('change', (e)=>{
    const theme = e.target.checked ? 'dark' : 'light';
    try { localStorage.setItem(KEY, theme); } catch {}
    apply(theme);
  });
}
