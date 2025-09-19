import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({ toast: { message: '', visible: false, timeout: 0 } }),
  actions: {
    showToast(message, ms=2300){
      this.toast.message = message || '';
      this.toast.visible = true;
      if (this.toast.timeout) clearTimeout(this.toast.timeout);
      this.toast.timeout = setTimeout(() => { this.toast.visible = false; this.toast.timeout = 0; }, ms);
    },
    hideToast(){ this.toast.visible = false; if (this.toast.timeout) { clearTimeout(this.toast.timeout); this.toast.timeout = 0; } }
  }
});

