<template>
  <section id="cuenta" class="view active">
    <div class="c-card">
      <h2>Cuenta</h2>
      <p class="subtle">Información de tu sesión</p>
      <div class="o-grid o-grid__2">
        <div>
          <p><strong>Usuario:</strong> {{ username }}</p>
          <p><strong>Rol:</strong> {{ roleKey }} <span v-if="roleLabel">({{ roleLabel }})</span></p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.js';
const auth = useAuthStore();
const username = computed(() => auth.user?.username || '');
function pickPrimaryRole(u){
  const roles = Array.isArray(u?.roles) ? u.roles : (u?.role ? [u.role] : []);
  const norm = roles.map(r => String(r).replace(/^ROLE_/, ''));
  if (norm.includes('ADMIN')) return 'ADMIN';
  if (norm.includes('OPTICO')) return 'OPTICO';
  if (norm.includes('RECEPTOR')) return 'RECEPTOR';
  return '';
}
const roleKey = computed(() => pickPrimaryRole(auth.user));
const roleMap = { ADMIN: 'Administrador', OPTICO: 'Óptico', RECEPTOR: 'Receptor' };
const roleLabel = computed(() => roleMap[roleKey.value] || '');
</script>

<style scoped>
</style>
