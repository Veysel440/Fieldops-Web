import { defineStore } from 'pinia';
import { http } from '@/services/http';
import { queryClient } from '@/lib/queryClient';
import { set as idbSet, get as idbGet, del as idbDel } from 'idb-keyval';

type Method = 'POST'|'PUT'|'PATCH'|'DELETE';
export type Job = {
  id: string;
  req: { url: string; method: Method; data?: any; headers?: Record<string,string> };
  invalidate?: (string|number)[];
  upload?: { fileKey: string; filename: string; entity: 'workOrder'|'asset'|'customer'; id: number };
  createdAt: number;
};

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }

export const useOfflineQueue = defineStore('offlineQueue', {
  state: () => ({ items: [] as Job[], processing: false }),
  getters: { size: (s) => s.items.length },
  actions: {
    load(){ const raw = localStorage.getItem('offlineQueue'); if (raw) this.items = JSON.parse(raw); },
    persist(){ localStorage.setItem('offlineQueue', JSON.stringify(this.items)); },
    enqueue(job: Omit<Job,'id'|'createdAt'>){ const j: Job={...job,id:uid(),createdAt:Date.now()}; this.items.push(j); this.persist(); return j.id; },
    async enqueueUpload(meta: { entity:'workOrder'|'asset'|'customer'; id:number }, file: File){
      const key = `file-${uid()}`;
      await idbSet(key, file);
      this.enqueue({
        req: { url: '/attachments', method: 'POST' },
        upload: { fileKey: key, filename: file.name, ...meta },
        invalidate: ['wo','att', meta.id]
      });
    },
    async processAll(){
      if (this.processing || !navigator.onLine) return;
      this.processing = true;
      try{
        for (const j of [...this.items]) {
          try{
            if (j.upload) {
              const blob = await idbGet<Blob>(j.upload.fileKey);
              if (!blob) continue;
              const fd = new FormData();
              fd.append('file', new File([blob], j.upload.filename));
              fd.append('entity', j.upload.entity);
              fd.append('id', String(j.upload.id));
              await http.post(j.req.url, fd);
              await idbDel(j.upload.fileKey);
            } else {
              await http.request({ url: j.req.url, method: j.req.method, data: j.req.data, headers: j.req.headers });
            }
            this.items = this.items.filter(x => x.id !== j.id); this.persist();
            if (j.invalidate) queryClient.invalidateQueries({ queryKey: j.invalidate as any });
          } catch { /* çevrimdışı ya da sunucu; sırayı koru */ }
          if (!navigator.onLine) break;
        }
      } finally { this.processing = false; }
    }
  }
});

const q = useOfflineQueue();
q.load();
window.addEventListener('online', () => q.processAll());
setInterval(() => q.processAll(), 10_000);
