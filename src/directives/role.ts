import type { Directive } from 'vue';
import { useAuthStore } from '@/stores/auth';

export const vRole: Directive<HTMLElement, string[]|undefined> = {
  mounted(el, binding) {
    const need = binding.value; if (!need?.length) return;
    const role = useAuthStore().role;
    if (!role || !need.includes(role)) el.style.display = 'none';
  }
};
