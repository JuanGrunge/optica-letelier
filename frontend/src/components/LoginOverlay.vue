<template>
  <section v-if="!isAuth" id="loginOverlay" class="c-login" aria-label="Inicio de sesión">
    <div class="c-login__card" role="dialog" aria-modal="true" aria-labelledby="loginTitle">
      <h2 id="loginTitle">Iniciar sesión</h2>
      <form id="loginForm" @submit.prevent="onSubmit">
        <label for="loginUser">Usuario</label>
        <input class="c-login__input" id="loginUser" v-model.trim="username" autocomplete="username" type="text" placeholder="Ej: admin" required />
        <label for="loginPass">Contraseña</label>
        <input class="c-login__input" id="loginPass" v-model.trim="password" autocomplete="current-password" type="password" placeholder="••••••••" required />
        <button type="submit" class="c-login__btn" :disabled="loading">{{ loading ? 'Ingresando…' : 'Entrar' }}</button>
        <p id="loginMsg" class="login-msg" aria-live="polite">{{ error }}</p>
        <details class="hint">
          <summary>¿Primera vez?</summary>
          <small>Admin: <strong>admin</strong> / <strong>admin123</strong></small>
        </details>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useAuthStore } from '@/stores/auth.js';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const loading = computed(() => auth.loading);
const error = computed(() => auth.error);
const isAuth = computed(() => auth.isAuthenticated);

async function onSubmit(){
  try {
    await auth.login(username.value, password.value);
    const to = auth.intentAfterLogin || { name: 'inicio' };
    auth.intentAfterLogin = null;
    router.push(to);
  } catch {}
}

watchEffect(() => {
  // body class similar a estado previo, solo como compatibilidad visual
  document.body.classList.toggle('no-session', !isAuth.value);
});
</script>
