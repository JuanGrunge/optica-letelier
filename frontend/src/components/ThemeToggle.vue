<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
    :title="isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
    @click="toggle"
  >
    <!-- Mostrar icono del estado actual -->
    <svg v-if="!isDark" class="sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
      </g>
    </svg>
    <svg v-else class="moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </g>
    </svg>
  </button>
</template>

<script setup>
import { useTheme } from '@/composables/theme.js';
const { isDark, toggle } = useTheme();
</script>

<style scoped>
.theme-toggle{
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--color-text, #111);
  border-radius: 8px;
  width: 40px; height: 32px;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.theme-toggle:hover,
.theme-toggle:active{ background: transparent; }
.dark .theme-toggle{ color: var(--color-text, #eee); background: transparent; }
.theme-toggle .sun{ color: #fff; }
.theme-toggle:focus{ outline: none; box-shadow: 0 0 0 3px var(--color-focus-ring, rgba(100,150,220,.35)); }
</style>
