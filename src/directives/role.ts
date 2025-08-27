import type { Directive } from 'vue';
import { useAuthStore } from '@/stores/auth';

export const vRole: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const need = Array.isArray(binding.value)
      ? binding.value
      : (binding.value ?? '').split(',').map(s => s.trim()).filter(Boolean);
    const role = useAuthStore().role;
    const ok = need.length === 0 || (role && need.includes(role));
    if (!ok) el.style.display = 'none';
  }
};
