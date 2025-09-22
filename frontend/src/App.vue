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
</style>
