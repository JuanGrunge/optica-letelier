<template>
  <header class="c-header">
    <AppHeader />
  </header>

  <!-- Login overlay controlado por store -->
  <LoginOverlay />

  <!-- Contenido principal -->
  <main id="app" :class="{ 'is-auth': isAuth }">
    <transition name="fade">
      <router-view />
    </transition>
  </main>
  <AppToast />
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.js';
import AppHeader from '@/components/AppHeader.vue';
import LoginOverlay from '@/components/LoginOverlay.vue';
import AppToast from '@/components/AppToast.vue';

const auth = useAuthStore();
const isAuth = computed(() => auth.isAuthenticated);

onMounted(() => { auth.me(); });
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity .25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
/* Header tweaks to align with legacy appearance */
.c-header .c-header__btn { background: transparent; text-decoration: none; }
.c-header .c-header__btn:hover { background: transparent; filter: none; text-decoration: none; }
.c-header .c-header__nav a { text-decoration: none; }
/* Quitar subrayado de textos de botones en general */
a.c-btn, a.c-btn:visited, a.c-btn:hover { text-decoration: none; }
</style>
