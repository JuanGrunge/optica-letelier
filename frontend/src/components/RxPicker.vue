<template>
  <div
    class="rx-picker"
    role="spinbutton"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="valueNumber != null ? valueNumber : undefined"
    :aria-valuetext="ariaValueText"
    :aria-label="ariaLabel || name"
    @keydown.prevent.stop="onKeydown"
  >
    <div class="rx-picker__main">
      <input
        v-if="picker === 'range'"
        class="rx-picker__range"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="valueNumber == null ? min : valueNumber"
        :disabled="disabled"
        @input="onRangeInput"
        :aria-label="ariaLabel || name"
      />
      <button class="rx-picker__value" type="button" :disabled="disabled" @click="toggleEdit" :title="title">
        <span class="rx-picker__valueText">{{ formattedValue }}</span>
        <span v-if="suffix" class="rx-picker__unit" aria-hidden="true">{{ suffix }}</span>
      </button>
      <input
        v-if="editing && picker === 'range'"
        ref="editEl"
        class="rx-picker__edit"
        :inputmode="decimals === 0 ? 'numeric' : 'decimal'"
        :step="step"
        :min="min"
        :max="max"
        :disabled="disabled"
        :value="valueNumber == null ? '' : String(valueNumber)"
        @blur="onEditBlur"
        @keydown.enter.prevent="onEditCommit"
      />
      <div
        v-if="editing && picker === 'roller'"
        ref="rollerEl"
        class="rx-picker__roller"
        role="listbox"
        :aria-label="ariaLabel || name"
        @scroll="onRollScroll"
      >
        <div class="rx-picker__spacer" aria-hidden="true"></div>
        <div
          v-for="(opt, i) in options"
          :key="i"
          class="rx-picker__item"
          role="option"
          :aria-selected="opt === valueNumber"
          @click="scrollToIndex(i, true)"
        >
          <span class="rx-picker__itemText">{{ formatNumber(opt) }}<span v-if="suffix">{{ suffix }}</span></span>
        </div>
        <div class="rx-picker__spacer" aria-hidden="true"></div>
        <div class="rx-picker__focusbar" aria-hidden="true"></div>
      </div>
    </div>
  </div>
  <Modal v-model="dialogOpen">
    <template #header>{{ title }}</template>
    <div class="c-form__group">
      <label class="c-form__label">{{ name }}</label>
      <div class="rx-modalPicker rx-modalPicker--vertical">
        <button
          type="button"
          class="c-btn rx-modalPicker__ctrl rx-modalPicker__ctrl--up"
          @click="increment"
          @mousedown.prevent="startRepeat('up')"
          @mouseup.prevent="stopRepeat"
          @mouseleave="stopRepeat"
          @touchstart.prevent="startRepeat('up')"
          @touchend.prevent="stopRepeat"
          @touchcancel.prevent="stopRepeat"
          :disabled="disabled || (editValue ?? valueNumber ?? defaultValue) >= max"
          aria-label="Aumentar"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 6l6 6H6z" fill="currentColor"/></svg>
        </button>
        <div class="rx-modalPicker__value" aria-live="polite">
          {{ formattedPreview }}<span v-if="suffix">{{ suffix }}</span>
        </div>
        <button
          type="button"
          class="c-btn rx-modalPicker__ctrl rx-modalPicker__ctrl--down"
          @click="decrement"
          @mousedown.prevent="startRepeat('down')"
          @mouseup.prevent="stopRepeat"
          @mouseleave="stopRepeat"
          @touchstart.prevent="startRepeat('down')"
          @touchend.prevent="stopRepeat"
          @touchcancel.prevent="stopRepeat"
          :disabled="disabled || (editValue ?? valueNumber ?? defaultValue) <= min"
          aria-label="Disminuir"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="transform: rotate(180deg)"><path d="M12 6l6 6H6z" fill="currentColor"/></svg>
        </button>
      </div>
      <p class="subtle">Rango: {{ formattedMin }} … {{ formattedMax }}<span v-if="suffix">{{ suffix }}</span></p>
    </div>
    <template #actions>
      <button class="c-btn c-btn--icon c-btn--back btn-inline" type="button" @click="onDialogCancel" aria-label="Cancelar" title="Cancelar">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></g></svg>
      </button>
      <button class="c-btn c-btn--icon c-btn--back btn-inline" type="button" @click="onDialogSave" aria-label="Aceptar" title="Aceptar">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3l5-5"/></g></svg>
      </button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue';
import { roundQ } from '@/composables/validators.js';
import Modal from '@/components/Modal.vue';

const props = defineProps({
  modelValue: { type: Number, default: null },
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  step: { type: Number, default: 0.25 },
  decimals: { type: Number, default: 2 },
  showSign: { type: Boolean, default: true },
  name: { type: String, default: '' },
  ariaLabel: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  suffix: { type: String, default: '' },
  picker: { type: String, default: 'number', validator: v => ['number','range','roller'].includes(v) }
});
const emit = defineEmits(['update:modelValue', 'change']);

const valueNumber = ref(props.modelValue);
const editing = ref(false);
const editEl = ref(null);
const rollerEl = ref(null);
const dialogOpen = ref(false);
const editValue = ref(null);
let repeatTimer = null;

watch(() => props.modelValue, (v) => { valueNumber.value = v; });

function clamp(n){
  if (n == null || !Number.isFinite(n)) return null;
  if (n < props.min) return props.min; if (n > props.max) return props.max; return n;
}
function snap(n){
  if (n == null || !Number.isFinite(n)) return null;
  return Number(roundQ(n, props.step).toFixed(Math.max(0, props.decimals)));
}
function setValue(n){
  const v = clamp(snap(n));
  valueNumber.value = v;
  emit('update:modelValue', v);
  emit('change', v);
}
function incBase(b){ return Number(roundQ((b ?? 0) + props.step, props.step).toFixed(Math.max(0, props.decimals))); }
function decBase(b){ return Number(roundQ((b ?? 0) - props.step, props.step).toFixed(Math.max(0, props.decimals))); }
function increment(){
  if (dialogOpen.value){
    const base = (editValue.value ?? valueNumber.value ?? props.min);
    const next = clamp(snap(incBase(base)));
    editValue.value = next;
  } else {
    const base = valueNumber.value == null ? props.min : valueNumber.value;
    setValue(base + props.step);
  }
}
function decrement(){
  if (dialogOpen.value){
    const base = (editValue.value ?? valueNumber.value ?? props.min);
    const next = clamp(snap(decBase(base)));
    editValue.value = next;
  } else {
    const base = valueNumber.value == null ? props.min : valueNumber.value;
    setValue(base - props.step);
  }
}
function onRangeInput(e){
  const v = Number(e.target.value);
  setValue(v);
}
function onKeydown(e){
  if (props.disabled) return;
  const key = e.key;
  if (dialogOpen.value){
    if (key === 'ArrowUp' || key === 'ArrowRight') { increment(); }
    else if (key === 'ArrowDown' || key === 'ArrowLeft') { decrement(); }
    else if (key === 'PageUp') { editValue.value = clamp(snap((editValue.value ?? valueNumber.value ?? props.min) + props.step * 4)); }
    else if (key === 'PageDown') { editValue.value = clamp(snap((editValue.value ?? valueNumber.value ?? props.min) - props.step * 4)); }
    else if (key === 'Home') { editValue.value = props.min; }
    else if (key === 'End') { editValue.value = props.max; }
    else if (key === 'Enter') { onDialogSave(); }
  } else {
    if (key === 'ArrowUp' || key === 'ArrowRight') { increment(); }
    else if (key === 'ArrowDown' || key === 'ArrowLeft') { decrement(); }
    else if (key === 'PageUp') { setValue((valueNumber.value ?? props.min) + props.step * 4); }
    else if (key === 'PageDown') { setValue((valueNumber.value ?? props.min) - props.step * 4); }
    else if (key === 'Home') { setValue(props.min); }
    else if (key === 'End') { setValue(props.max); }
  }
}
function toggleEdit(){
  if (props.disabled) return;
  if (props.picker === 'roller'){
    editing.value = !editing.value;
    if (editing.value){ nextTick(() => { alignRollerToValue(true); }); }
    return;
  }
  // For number/range: use dialog modal (standard UX)
  editValue.value = (valueNumber.value == null) ? defaultValue.value : valueNumber.value;
  dialogOpen.value = true;
}
function onEditCommit(e){
  const v = Number(String(e.target.value).replace(',', '.'));
  setValue(v);
  editing.value = false;
}
function onEditBlur(e){ onEditCommit(e); }

const formattedValue = computed(() => {
  if (valueNumber.value == null) return '-';
  const n = valueNumber.value;
  const s = n.toFixed(Math.max(0, props.decimals));
  if (!props.showSign) return s;
  return n > 0 ? `+${s}` : s;
});

const title = computed(() => props.name || props.ariaLabel || 'Selector');
const ariaValueText = computed(() => {
  if (valueNumber.value == null) return '';
  const base = formattedValue.value;
  return props.suffix ? `${base} ${props.suffix}` : base;
});

const defaultValue = computed(() => {
  const z = 0;
  let v = z;
  if (v < props.min) v = props.min;
  if (v > props.max) v = props.max;
  return Number(roundQ(v, props.step).toFixed(Math.max(0, props.decimals)));
});

function onDialogSave(){
  const v = Number(editValue.value ?? valueNumber.value ?? defaultValue.value);
  setValue(v);
  dialogOpen.value = false;
}
function onDialogCancel(){ dialogOpen.value = false; }

// Roller (rolldate-style)
const options = computed(() => {
  const out = [];
  if (!Number.isFinite(props.min) || !Number.isFinite(props.max) || !Number.isFinite(props.step)) return out;
  const steps = Math.floor((props.max - props.min) / props.step + 0.000001);
  for (let i = 0; i <= steps; i++) {
    const v = props.min + i * props.step;
    out.push(Number(roundQ(v, props.step).toFixed(Math.max(0, props.decimals))));
  }
  // Ensure max included
  if (out.length && out[out.length-1] !== props.max) out.push(props.max);
  return out;
});

function formatNumber(n){
  if (n == null) return '';
  const s = n.toFixed(Math.max(0, props.decimals));
  if (!props.showSign) return s;
  return n > 0 ? `+${s}` : s;
}

const formattedPreview = computed(() => {
  const v = Number(editValue.value ?? valueNumber.value ?? defaultValue.value);
  if (!Number.isFinite(v)) return '-';
  return formatNumber(v);
});

const formattedMin = computed(() => formatNumber(Number(props.min)));
const formattedMax = computed(() => {
  const n = Number(props.max);
  // For positive upper bound, show explicit plus when showSign is true
  if (props.showSign && n > 0) return `+${n.toFixed(Math.max(0, props.decimals))}`;
  return formatNumber(n);
});

function startRepeat(dir){
  stopRepeat();
  const tick = () => { dir === 'up' ? increment() : decrement(); };
  tick();
  repeatTimer = setInterval(tick, 250); // ~4 pasos por segundo
}
function stopRepeat(){ if (repeatTimer){ clearInterval(repeatTimer); repeatTimer = null; } }

function currentIndex(){
  const target = (valueNumber.value == null) ? defaultValue.value : valueNumber.value;
  const idx = options.value.findIndex(v => v === target);
  if (idx >= 0) return idx;
  return 0;
}

function itemHeight(){
  const el = rollerEl.value?.querySelector('.rx-picker__item');
  return el ? el.getBoundingClientRect().height : 32;
}

function viewportCenter(){
  const vp = rollerEl.value;
  if (!vp) return 0;
  return vp.clientHeight / 2;
}

function scrollToIndex(i, commit=false){
  const vp = rollerEl.value; if (!vp) return;
  const ih = itemHeight();
  const targetTop = i * ih - (viewportCenter() - ih/2);
  try { vp.scrollTo({ top: targetTop, behavior: 'smooth' }); } catch { vp.scrollTop = targetTop; }
  if (commit) setValue(options.value[i]);
}

let scrollTimer = null;
function onRollScroll(){
  if (!rollerEl.value) return;
  if (scrollTimer) clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    const vp = rollerEl.value; if (!vp) return;
    const ih = itemHeight();
    const center = viewportCenter();
    const idx = Math.round((vp.scrollTop + center - ih/2) / ih);
    const clamped = Math.max(0, Math.min(options.value.length - 1, idx));
    setValue(options.value[clamped]);
    // snap exactly
    scrollToIndex(clamped, false);
  }, 80);
}

function alignRollerToValue(immediate=false){
  const i = currentIndex();
  const vp = rollerEl.value; if (!vp) return;
  const ih = itemHeight();
  const targetTop = i * ih - (viewportCenter() - ih/2);
  if (immediate){ try { vp.scrollTo({ top: targetTop, behavior: 'auto' }); } catch { vp.scrollTop = targetTop; } }
  else { scrollToIndex(i, false); }
}
</script>

<style scoped>
.rx-picker{ display:flex; align-items:center; gap:.5rem; }
.rx-picker__main{ position:relative; display:flex; align-items:center; gap:.5rem; min-inline-size:9rem; }
.rx-picker__range{ flex:1; appearance:none; height:6px; border-radius:4px; background:var(--color-border, #ccc); outline:none; }
.rx-picker__range::-webkit-slider-thumb{ -webkit-appearance:none; appearance:none; width:22px; height:22px; border-radius:50%; background:var(--color-accent, #4a7); cursor:pointer; border:2px solid var(--color-bg, #fff); box-shadow:0 0 0 1px rgba(0,0,0,.05); }
.rx-picker__range::-moz-range-thumb{ width:22px; height:22px; border-radius:50%; background:var(--color-accent, #4a7); border:2px solid var(--color-bg, #fff); }
.rx-picker__value{ display:inline-flex; align-items:center; gap:.25rem; min-inline-size:6.5rem; padding:.35rem .6rem; border-radius:.5rem; border:1px solid transparent; background:transparent; color:inherit; font-variant-numeric:tabular-nums; }
.rx-picker__unit{ opacity:.8; font-size:.95em; }
.rx-picker__edit{ position:absolute; inset-inline-start:50%; transform:translateX(-50%); min-inline-size:5rem; padding:.25rem .5rem; border-radius:.5rem; border:1px solid var(--color-border, #ccc); background:var(--color-bg-elev, #fff); font-variant-numeric:tabular-nums; }
/* Roller */
.rx-picker__roller{ position:absolute; inset-inline-start:50%; transform:translateX(-50%); inline-size:8.5rem; max-inline-size:calc(100vw - 3rem); block-size:10rem; overflow-y:auto; border:1px solid var(--color-border, #ccc); background:var(--color-bg-elev, #fff); border-radius:.75rem; scroll-snap-type:y mandatory; padding-block:3rem; box-shadow:0 8px 24px rgba(0,0,0,.08); }
.dark .rx-picker__roller{ border-color: var(--color-border, #3a3a3a); background: var(--color-bg-elev, #1f1f1f); box-shadow: 0 8px 24px rgba(0,0,0,.35); }
.rx-picker__item{ block-size:2rem; display:flex; align-items:center; justify-content:center; scroll-snap-align:center; font-variant-numeric:tabular-nums; color:var(--color-text, #111); }
.dark .rx-picker__item{ color: var(--color-text, #eee); }
.rx-picker__spacer{ block-size:3rem; }
.rx-picker__focusbar{ position:absolute; inset-inline:0; inset-block-start:calc(50% - 1rem); block-size:2rem; pointer-events:none; border-block:1px dashed var(--color-border, #ccc); }
.dark .rx-picker__focusbar{ border-color: var(--color-border, #3a3a3a); }
@media (max-width: 480px){ .rx-picker__roller{ inline-size:7.5rem; } }
@media (max-width: 640px){
  /* Evita zoom en iOS cuando se edita manualmente */
  .rx-picker__edit{ font-size: 16px; }
}
@media (max-width: 480px){
  .rx-picker__main{ min-inline-size:7rem; }
  .rx-picker__value{ min-inline-size:5rem; }
}
/* Modal preview */
.rx-picker__preview{ margin-top:.5rem; text-align:center; font-size:1.1rem; font-variant-numeric:tabular-nums; }

/* Modal number picker (minimal arrows + value) */
.rx-modalPicker{ display:flex; align-items:center; justify-content:center; gap:.75rem; }
.rx-modalPicker--vertical{ flex-direction: column; }
.rx-modalPicker__value{ min-inline-size:6.5rem; text-align:center; font-size:1.25rem; font-variant-numeric:tabular-nums; padding:.35rem .5rem; border:1px solid var(--color-border, #ccc); border-radius:.5rem; background:var(--color-bg-elev, #fff); color: var(--color-text, #111); }
.rx-modalPicker__ctrl{ background: var(--color-bg-elev, #fff); color: var(--color-text, #111); border-color: var(--color-border, #ccc); }
.dark .rx-modalPicker__value{ background: var(--color-bg-elev, #1f1f1f); color: var(--color-text, #eee); border-color: var(--color-border, #3a3a3a); }
.dark .rx-modalPicker__ctrl{ background: var(--color-bg-elev, #1f1f1f); color: var(--color-text, #eee); border-color: var(--color-border, #3a3a3a); }
</style>
