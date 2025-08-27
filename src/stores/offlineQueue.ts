import { defineStore } from 'pinia';
import { http } from '@/services/http';
import { queryClient } from '@/lib/queryClient';

type Method = 'POST'|'PUT'|'PATCH'|'DELETE';
export type Job = {
  id: string;
  req: { url: string; method: Method; data?: any; headers?: Record<string,string> };
  invalidate?: string[];
  createdAt: number;
};

function id() { return `${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }

export const useOfflineQueue = defineStore('offlineQueue', {
  state: () => ({ items: [] as Job[], processing: false }),
  actions: {
    load() {
      const raw = localStorage.getItem('offlineQueue');
      if (raw) this.items = JSON.parse(raw);
    },
    persist() { localStorage.setItem('offlineQueue', JSON.stringify(this.items)); },
    enqueue(job: Omit<Job,'id'|'createdAt'>) {
      const j: Job = { ...job, id: id(), createdAt: Date.now() };
      this.items.push(j); this.persist(); return j.id;
    },
    async processAll() {
      if (this.processing) return;
      if (!navigator.onLine) return;
      this.processing = true;
      try {
        for (const j of [...this.items]) {
          try {
            await http.request({ url: j.req.url, method: j.req.method, data: j.req.data, headers: j.req.headers });
            this.items = this.items.filter(x => x.id !== j.id); this.persist();
            if (j.invalidate) queryClient.invalidateQueries({ queryKey: j.invalidate as any });
          } catch {/* sunucu kapalı olabilir, sırayı koru */}
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
