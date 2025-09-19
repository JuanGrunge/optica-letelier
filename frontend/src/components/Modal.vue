<template>
  <div v-if="modelValue" class="c-modal__overlay" @click.self="close">
    <div class="c-modal" role="dialog" aria-modal="true">
      <header class="c-modal__header"><slot name="header" /></header>
      <section class="c-modal__content"><slot /></section>
      <footer class="c-modal__actions"><slot name="actions"><button class="c-btn" type="button" @click="close">Cerrar</button></slot></footer>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ modelValue: { type: Boolean, default: false } });
const emit = defineEmits(['update:modelValue']);
function close(){ emit('update:modelValue', false); }
</script>

