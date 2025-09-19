<template>
  <div v-if="visible" class="c-toast" role="status" aria-live="polite">{{ message }}</div>
  
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/stores/ui.js';
const ui = useUiStore();
const { toast } = storeToRefs(ui);
const visible = computed(() => toast.value.visible);
const message = computed(() => toast.value.message);
</script>
