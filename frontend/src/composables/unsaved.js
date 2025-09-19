import { onBeforeUnmount, watch } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

export function setupUnsavedGuard(isDirtyRef){
  const beforeUnload = (e) => {
    if (!isDirtyRef?.value) return;
    e.preventDefault();
    e.returnValue = '';
  };
  window.addEventListener('beforeunload', beforeUnload);
  onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload));

  onBeforeRouteLeave((to, from, next) => {
    if (!isDirtyRef?.value) return next();
    const ok = window.confirm('Hay cambios sin guardar. ¿Deseas salir y descartar los cambios?');
    next(ok);
  });

  // return a helper to temporarily disable guard if needed
  let disabled = false;
  const setDisabled = (v) => { disabled = !!v; };
  const isDirtyWithDisable = { get value(){ return !disabled && !!isDirtyRef.value; } };
  return { setDisabled, isDirtyWithDisable };
}

