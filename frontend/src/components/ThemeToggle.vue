<template>
  <div class="c-switch menu-toggle">
    <input type="checkbox" id="darkModeToggle" :checked="isDark" @change="toggle" aria-label="Modo oscuro" />
    <label class="c-switch__slider" for="darkModeToggle" title="Modo oscuro"></label>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/theme.js';
const { isDark, toggle } = useTheme();
</script>

