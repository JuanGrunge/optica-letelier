import { defineStore } from 'pinia';

export const useArchiveStore = defineStore('archive', {
  state: () => ({
    q: '',
    items: [],
    total: null,
    page: 0,
    pages: 0,
    size: 5,
    message: '',
    loaded: false,
    timestamp: 0,
  }),
  getters: {
    hasCache: (s) => s.loaded && s.items && Array.isArray(s.items),
  },
  actions: {
    setFromPage(pageData, { q = this.q, page = this.page, size = this.size } = {}){
      const content = Array.isArray(pageData?.content) ? pageData.content : [];
      this.items = content;
      const t = (typeof pageData?.totalElements === 'number') ? pageData.totalElements : (typeof this.total==='number'? this.total : 0);
      this.total = t;
      this.page = (typeof pageData?.page === 'number') ? pageData.page : page;
      this.pages = t ? Math.ceil(t / size) : 0;
      this.q = q;
      const showing = content.length;
      this.message = `Mostrando ${showing} registros${t!=null?` · Total: ${t}`:''}`;
      this.loaded = true;
      this.timestamp = Date.now();
    },
    setQuery(q){ this.q = q || ''; },
    clear(){ this.q=''; this.items=[]; this.total=null; this.page=0; this.pages=0; this.message=''; this.loaded=false; }
  }
});

