<template>
  <div v-if="modelValue" class="c-modal__overlay" @click.self="close">
    <div class="c-modal" role="dialog" aria-modal="true">
      <header class="c-modal__header"><slot name="header" /></header>
      <section class="c-modal__content"><slot /></section>
      <footer class="c-modal__actions"><slot name="actions"><button class="c-btn c-btn--icon c-btn--back btn-inline" type="button" @click="close" aria-label="Cerrar" title="Cerrar">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M9 9l6 6M15 9l-6 6"></path>
          </g>
        </svg>
      </button></slot></footer>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ modelValue: { type: Boolean, default: false } });
const emit = defineEmits(['update:modelValue']);
function close(){ emit('update:modelValue', false); }
</script>
