import { defineStore } from 'pinia';
import { http } from '@/services/http';
import { set as idbSet, get as idbGet, del as idbDel } from 'idb-keyval';

type Method = 'POST'|'PUT'|'PATCH'|'DELETE';
export type Job = {
  id: string;
  req: { url: string; method: Method; data?: any; headers?: Record<string,string> };
  invalidate?: (string|number)[];
  upload?: { fileKey: string; filename: string; entity: 'workOrder'|'asset'|'customer'; id: number };
  createdAt: number;
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

async function requestBgSync() {
  if (!('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const sync = reg.sync as any;
  if (sync?.register) try { await sync.register('fieldops-sync'); } catch {}
}

export const useOfflineQueue = defineStore('offlineQueue', {
  state: () => ({ items: [] as Job[], processing: false }),
  getters: { size: (s) => s.items.length },
  actions: {
    load() { try { const raw = localStorage.getItem('offlineQueue'); if (raw) this.items = JSON.parse(raw); } catch { this.items=[]; } },
    persist() { localStorage.setItem('offlineQueue', JSON.stringify(this.items)); },

    enqueue(job: Omit<Job,'id'|'createdAt'>) {
      const j: Job = { ...job, id: uid(), createdAt: Date.now() };
      this.items.push(j); this.persist(); requestBgSync(); return j.id;
    },

    async enqueueUpload(meta: { entity:'workOrder'|'asset'|'customer'; id:number }, file: File) {
      const key = `file-${uid()}`; await idbSet(key, file);
      this.enqueue({
        req: { url:'/attachments', method:'POST' },
        upload: { fileKey:key, filename:file.name, ...meta },
        invalidate: ['wo','att', meta.id]
      });
    },

    async processAll() {
      if (this.processing || !navigator.onLine) return;
      this.processing = true;
      try {
        for (const j of [...this.items]) {
          try {
            if (j.upload) {
              const blob = await idbGet<Blob>(j.upload.fileKey); if (!blob) continue;
              const fd = new FormData();
              fd.append('file', new File([blob], j.upload.filename));
              fd.append('entity', j.upload.entity); fd.append('id', String(j.upload.id));
              await http.post(j.req.url, fd, { headers: { 'Idempotency-Key': j.id } });
              await idbDel(j.upload.fileKey);
            } else {
              await http.request({
                url: j.req.url, method: j.req.method, data: j.req.data,
                headers: { ...(j.req.headers||{}), 'Idempotency-Key': j.id }
              });
            }
            this.items = this.items.filter(x => x.id !== j.id);
            this.persist();
            if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({ type:'FIELDOPS_INVALIDATE', key: j.invalidate });
            }
          } catch { /* bırak, sonra tekrar deneriz */ }
          if (!navigator.onLine) break;
        }
      } finally { this.processing = false; }
    }
  }
});

// init
const q = useOfflineQueue();
q.load();
window.addEventListener('online', () => q.processAll());
setInterval(() => q.processAll(), 10_000);
