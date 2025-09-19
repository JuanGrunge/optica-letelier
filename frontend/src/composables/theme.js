import { ref, onMounted } from 'vue';

const KEY = 'theme';

export function useTheme(){
  const isDark = ref(false);

  function apply(theme){
    const dark = theme === 'dark';
    isDark.value = dark;
    const root = document.documentElement;
    const body = document.body;
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (body) body.classList.toggle('dark', dark);
  }

  function set(theme){
    try { localStorage.setItem(KEY, theme); } catch {}
    apply(theme);
  }

  function toggle(){ set(isDark.value ? 'light' : 'dark'); }

  onMounted(() => {
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch {}
    if (saved === 'dark' || saved === 'light') {
      apply(saved);
    } else {
      const prefers = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      apply(prefers ? 'dark' : 'light');
    }
  });

  return { isDark, toggle, set };
}

