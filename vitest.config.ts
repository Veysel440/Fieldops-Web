import { defineConfig, mergeConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import vite from './vite.config';

export default mergeConfig(
  vite,
  defineConfig({
    plugins: [vue()],
    test: {
      environment: 'jsdom',
      setupFiles: ['src/test-setup.ts'],
      include: ['src/__tests__/**/*.spec.ts', 'src/__tests__/**/*.(test|spec).ts'],
      exclude: ['test/e2e/**', 'node_modules/**'],
      css: false
    },
    resolve: { alias: (vite as any).resolve.alias }
  })
);
