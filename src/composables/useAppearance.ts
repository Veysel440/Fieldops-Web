import { ref, watchEffect } from 'vue';

export type Theme = 'light' | 'dark' | 'system';

const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'system');

function apply(themeValue: Theme) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = themeValue === 'dark' || (themeValue === 'system' && prefersDark);

  root.dataset.theme = isDark ? 'dark' : 'light';
  root.classList.toggle('dark', isDark);
}

watchEffect(() => {
  localStorage.setItem('theme', theme.value);
  apply(theme.value);
});

export function useAppearance() {
  return { theme, setTheme: (t: Theme) => (theme.value = t as Theme) };
}
