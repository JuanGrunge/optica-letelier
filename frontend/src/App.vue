<template>
  <div class="app-shell">
    <header class="c-header">
      <AppHeader />
    </header>

    <!-- Contenido principal -->
    <main id="app" :class="{ 'is-auth': isAuth }" v-if="ready">
      <transition name="fade-fast">
        <router-view />
      </transition>
    </main>
    <div v-else class="app-splash" aria-label="Cargando">
      <div class="spinner" role="progressbar" aria-busy="true"></div>
    </div>

    <footer class="c-footer" aria-label="Sitio">
      <div class="c-footer__inner">
        <div class="c-footer__icons">
        <a
          class="c-footer__link footer-icon"
          href="https://juangrunge.github.io/optica-letelier/"
          target="_blank"
          rel="noopener"
          aria-label="Optica Letelier en GitHub"
        >
          <span class="c-footer__icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" preserveAspectRatio="xMidYMid meet">
              <path d="M12 1.3c-5.8 0-10.5 4.7-10.5 10.5 0 4.6 3 8.4 7 9.8.5.1.7-.2.7-.5v-1.7c-2.9.6-3.5-1.3-3.5-1.3-.5-1.2-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.5.4-.9.7-1.1-2.4-.3-4.9-1.2-4.9-5.3 0-1.1.4-2.1 1.1-2.8-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 3 1.1a10.3 10.3 0 0 1 5.5 0c2.1-1.4 3-1.1 3-1.1.6 1.4.2 2.4.1 2.7.7.7 1.1 1.7 1.1 2.8 0 4.1-2.5 5-5 5.3.4.3.8 1 .8 2.1v2.1c0 .3.2.6.7.5 4-1.4 7-5.2 7-9.8C22.5 6 17.8 1.3 12 1.3z"/>
            </svg>
          </span>
        </a>
        <a class="c-footer__link footer-icon" href="https://www.instagram.com/opticaletelier.chile/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <span class="c-footer__icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" preserveAspectRatio="xMidYMid meet">
              <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm9.75 2.25a.75.75 0 0 1 .102 1.493L17.5 7.25a.75.75 0 0 1-.102-1.493L17.5 5.75zm-5.5 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
            </svg>
          </span>
        </a>
      </div>
        <div class="c-footer__text">Óptica Letelier — Todos los derechos reservados © 2025</div>
      </div>
    </footer>
  </div>
  <!-- Login overlay controlado por store (cubre contenido, no el footer) -->
  <LoginOverlay />
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

/* Map pin links: show only the pin (no background/border) */
.c-btn.c-btn--icon.btn-inline,
.c-btn.c-btn--icon.btn-inline:hover,
.dark .c-btn.c-btn--icon.btn-inline,
.dark .c-btn.c-btn--icon.btn-inline:hover {
  background: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}
.c-table th, .c-table td {
  border-color: var(--color-border, #ccc);
}

/* App layout shell: sticky footer without fixing it */
.app-shell{ min-height: 100vh; display: flex; flex-direction: column; }
#app{ flex: 1 0 auto; }
.app-splash{ flex: 1 0 auto; display:flex; align-items:center; justify-content:center; }

/* Login overlay: ensure it doesn't cover the footer */
#loginOverlay{
  position: fixed;
  inset: 0;
  z-index: 9999; /* below footer so footer stays visible */
}
</style>
<style>
/* Footer: neutral, theme-aware */
.c-footer{
  background: var(--color-bg-elev, #fff);
  color: var(--color-text-muted, #666);
  border-top: 1px solid var(--color-border, #ccc);
  position: relative;
  z-index: 10001; /* ensure above overlays */
}
.dark .c-footer{
  background: var(--color-bg-elev, #1f1f1f);
  color: var(--color-text-muted, #aaa);
  border-top-color: var(--color-border, #3a3a3a);
}
.c-footer__inner{ display:flex; flex-direction: column; align-items:center; justify-content:center; padding: 12px 16px; gap: 6px; text-align:center; }
.c-footer__icons{ display:flex; align-items:center; justify-content:center; gap: 12px; }
.c-footer__link{ display:inline-flex; align-items:center; justify-content:center; gap:.5rem; color: inherit; text-decoration: none; }
.c-footer__link:hover{ color: var(--color-text, #111); }
.dark .c-footer__link:hover{ color: var(--color-text, #eee); }
.c-footer__icon{ inline-size: 24px; block-size: 24px; display:inline-flex; }
.c-footer__text{ font-size: .95rem; color: inherit; }

</style>
