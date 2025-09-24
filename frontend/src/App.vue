<template>
  <header class="c-header">
    <AppHeader />
  </header>

  <!-- Login overlay controlado por store -->
  <LoginOverlay />

  <!-- Contenido principal -->
  <main id="app" :class="{ 'is-auth': isAuth }" v-if="ready">
    <transition name="fade-fast">
      <router-view />
    </transition>
  </main>
  <div v-else class="app-splash" aria-label="Cargando">
    <div class="spinner" role="progressbar" aria-busy="true"></div>
  </div>
  <AppToast />
</template>

<script setup>
import { computed, onMounted, watchEffect } from 'vue';
import { useAuthStore } from '@/stores/auth.js';
import AppHeader from '@/components/AppHeader.vue';
import LoginOverlay from '@/components/LoginOverlay.vue';
import AppToast from '@/components/AppToast.vue';

const auth = useAuthStore();
const isAuth = computed(() => auth.isAuthenticated);
const ready = computed(() => auth.hydrated);

onMounted(() => { auth.me(); });

watchEffect(() => {
  try { document.body.classList.toggle('no-session', !isAuth.value); } catch {}
});
</script>

<style>
/* Header tweaks to align with legacy appearance */
.c-header .c-header__btn { background: transparent; text-decoration: none; }
.c-header .c-header__btn:hover { background: transparent; filter: none; text-decoration: none; }
.c-header .c-header__nav a { text-decoration: none; }
/* Quitar subrayado de textos de botones en general */
a.c-btn, a.c-btn:visited, a.c-btn:hover { text-decoration: none; }

/* Global theme-aligned controls for dark/light */
.c-form__control, textarea.c-form__control, input.c-form__control {
  background: var(--color-bg-elev, #fff);
  color: var(--color-text, #111);
  border-color: var(--color-border, #ccc);
}
.dark .c-form__control, .dark textarea.c-form__control, .dark input.c-form__control {
  background: var(--color-bg-elev, #1f1f1f);
  color: var(--color-text, #eee);
  border-color: var(--color-border, #3a3a3a);
}
.c-form__control::placeholder { color: var(--color-text-muted, #666); opacity: .9; }
.c-form__control:-ms-input-placeholder { color: var(--color-text-muted, #666); }
.c-form__control::-ms-input-placeholder { color: var(--color-text-muted, #666); }
.c-form__control:focus { outline: none; box-shadow: 0 0 0 3px var(--color-focus-ring, rgba(100,150,220,.35)); border-color: var(--color-accent, #4a7); }

.c-btn.c-btn--neo {
  background: var(--color-bg-elev, #fff);
  color: var(--color-text, #111);
  border-color: var(--color-border, #ccc);
}
.dark .c-btn.c-btn--neo {
  background: var(--color-bg-elev, #1f1f1f);
  color: var(--color-text, #eee);
  border-color: var(--color-border, #3a3a3a);
}
.dark .c-btn.c-btn--icon.c-btn--neo,
.dark .c-form__actions .c-btn.c-btn--icon.c-btn--neo {
  background: var(--color-bg-elev, #1f1f1f) !important;
  color: var(--color-text, #eee) !important;
  border-color: var(--color-border, #3a3a3a) !important;
}
.c-btn.c-btn--icon {
  color: var(--color-text, #111);
}
.c-table th, .c-table td {
  border-color: var(--color-border, #ccc);
}
</style>
