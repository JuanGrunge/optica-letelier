<template>
  <section id="login-view" class="view active" aria-label="Autenticación">
    <div class="c-card" style="margin: 24px auto; max-width: 480px;">
      <h2>Iniciar sesión</h2>
      <p>Autentícate para continuar.</p>
      <!-- El formulario real está en LoginOverlay y aparece automáticamente cuando no hay sesión -->
      <p class="subtle">Si ya iniciaste sesión, te redirigiremos enseguida…</p>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

async function ensureRedirectIfAlreadyLogged() {
  try {
    if (!auth.hydrated) await auth.me();
  } catch {}
  if (auth.isAuthenticated) {
    const redirect = route.query.redirect;
    if (typeof redirect === 'string' && redirect) {
      router.replace(redirect);
    } else {
      router.replace({ name: 'inicio' });
    }
  }
}

onMounted(() => { ensureRedirectIfAlreadyLogged(); });
</script>

<style scoped>
.subtle{ opacity:.8; font-size:.95rem; }
</style>

