import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { defineStore } from 'pinia';

vi.mock('@/composables/useOnline', () => ({ useOnline: () => ({ online: { value: true } }) }));


vi.mock('@/stores/offlineQueue', () => {
  const useOfflineQueue = defineStore('offlineQueue', {
    state: () => ({ items: [{}, {}], processing: false } as any),
    getters: { size: (s) => s.items.length },
    actions: { processAll: vi.fn() }
  }) as any;
  return { useOfflineQueue };
});

import QueueIndicator from '@/components/QueueIndicator.vue';
import {useOfflineQueue} from "@/stores/offlineQueue";

describe('QueueIndicator.vue', () => {
  it('kuyruk sayısını gösterir ve tıklanınca processAll çağırır', async () => {
    setActivePinia(createPinia());
    const w = mount(QueueIndicator);
    expect(w.text()).toContain('Queue');
    expect(w.text()).toContain('2');
    await w.trigger('click');
    const store: any = (useOfflineQueue as any)();
    expect(store.processAll).toBeDefined();
  });
});
